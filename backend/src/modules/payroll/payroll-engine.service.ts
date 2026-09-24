import { randomUUID } from 'crypto';
import { query, execute } from '../../database/sqlite-cloud.js';
import { logger } from '../../config/logger.js';
import { ComplianceService } from '../core/compliance.service.js';
import { leaveEngineService } from '../leave/leave-engine.service.js';
import { TaxCalculationService } from './tax-calculation.service.js';

export interface RunPayrollOptions {
  organizationId: string;
  month: number;
  year: number;
  departmentId?: string;
  employeeIds?: string[];
  actorId: string;
  actorRole: string;
}

export interface PayrollValidationIssue {
  employeeId?: string;
  employeeName?: string;
  code: string;
  severity: 'ERROR' | 'WARNING' | 'INFO';
  message: string;
}

export class PayrollEngineService {
  /**
   * Retrieves effective salary structure for an employee on a given payroll period
   */
  static async getEffectiveSalaryStructure(employeeId: string, periodStart: string, periodEnd: string) {
    // Check employee_salary_structures table first
    const struct = await query(
      `SELECT * FROM employee_salary_structures 
       WHERE employeeId = ? 
       AND effectiveFrom <= ? 
       AND (effectiveTo IS NULL OR effectiveTo >= ?) 
       AND isActive = 1 
       ORDER BY effectiveFrom DESC LIMIT 1`,
      [employeeId, periodEnd, periodStart]
    ).then(res => res[0]);

    if (struct) {
      const components = await query(
        `SELECT * FROM salary_components WHERE salaryStructureId = ?`,
        [struct.salaryStructureId || struct.id]
      );
      return { ...struct, components };
    }

    // Fallback to salary_structures table
    const legacyStruct = await query(
      `SELECT * FROM salary_structures 
       WHERE employeeId = ? 
       AND (effectiveDate <= ? OR effectiveDate IS NULL)
       ORDER BY effectiveDate DESC LIMIT 1`,
      [employeeId, periodEnd]
    ).then(res => res[0]);

    if (!legacyStruct) return null;

    const components = await query(
      `SELECT * FROM salary_components WHERE salaryStructureId = ?`,
      [legacyStruct.id]
    );

    return { ...legacyStruct, components };
  }

  /**
   * Complete Payroll Run Calculation
   */
  static async calculatePayrollRun(runId: string, actorId: string, actorRole: string) {
    const run = await query(`SELECT * FROM payroll_runs WHERE id = ?`, [runId]).then(res => res[0]);
    if (!run) throw new Error('Payroll run not found');
    if (run.status === 'LOCKED' || run.status === 'FINALIZED') {
      throw new Error(`Cannot recalculate payroll run in ${run.status} status.`);
    }

    const { organizationId, periodStart, periodEnd } = run;

    // Fetch active employees
    const employees = await query(
      `SELECT e.*, d.name as departmentName 
       FROM employees e 
       LEFT JOIN departments d ON e.department = d.name OR e.department = d.id
       WHERE e.organizationId = ? AND e.status = 'ACTIVE'`,
      [organizationId]
    );

    // Delete existing calculation employee snapshots & line items for this run
    const existingRunEmps = await query(`SELECT id FROM payroll_run_employees WHERE payrollRunId = ?`, [runId]);
    for (const empRecord of existingRunEmps) {
      await execute(`DELETE FROM payroll_line_items WHERE payrollRunEmployeeId = ?`, [empRecord.id]);
      await execute(`DELETE FROM payroll_lop_records WHERE payrollRunEmployeeId = ?`, [empRecord.id]);
      await execute(`DELETE FROM payroll_overtime_records WHERE payrollRunEmployeeId = ?`, [empRecord.id]);
      await execute(`DELETE FROM payroll_reimbursement_records WHERE payrollRunEmployeeId = ?`, [empRecord.id]);
    }
    await execute(`DELETE FROM payroll_run_employees WHERE payrollRunId = ?`, [runId]);

    let totalGross = 0;
    let totalDeductions = 0;
    let totalNetPay = 0;
    let totalPf = 0;
    let totalEsi = 0;
    let totalPt = 0;
    let totalTds = 0;
    let totalReimbursements = 0;
    let totalLopDeductions = 0;
    let processedCount = 0;

    for (const emp of employees) {
      try {
        const calcRes = await this.calculateEmployeePayrollSnapshot(runId, emp, periodStart, periodEnd, organizationId);
        
        totalGross += calcRes.grossEarnings;
        totalDeductions += calcRes.totalDeductions;
        totalNetPay += calcRes.netPay;
        totalPf += calcRes.employeePf;
        totalEsi += calcRes.employeeEsi;
        totalPt += calcRes.professionalTax;
        totalTds += calcRes.tdsDeduction;
        totalReimbursements += calcRes.eligibleReimbursements;
        totalLopDeductions += calcRes.lopDeduction;
        processedCount++;
      } catch (err: any) {
        logger.error(`[PayrollEngine] Calculation failed for ${emp.name} (${emp.id}): ${err.message}`);
      }
    }

    // Update payroll_runs status to CALCULATED
    await execute(
      `UPDATE payroll_runs SET 
        status = 'CALCULATED',
        totalEmployees = ?,
        totalGrossPay = ?,
        totalDeductions = ?,
        totalNetPay = ?,
        updatedAt = ?
       WHERE id = ?`,
      [
        processedCount,
        Number(totalGross.toFixed(2)),
        Number(totalDeductions.toFixed(2)),
        Number(totalNetPay.toFixed(2)),
        new Date().toISOString(),
        runId
      ]
    );

    // Record audit event
    await this.logPayrollAudit(organizationId, actorId, actorRole, 'PAYROLL_CALCULATED', 'payroll_runs', runId, run.status, 'CALCULATED');

    return this.getPayrollRunById(runId);
  }

  /**
   * Calculates individual employee payroll snapshot
   */
  private static async calculateEmployeePayrollSnapshot(
    runId: string,
    emp: any,
    periodStart: string,
    periodEnd: string,
    organizationId: string
  ) {
    const runEmpId = randomUUID();
    const employeeId = emp.id;

    // 1. Fetch effective salary structure
    const struct = await this.getEffectiveSalaryStructure(employeeId, periodStart, periodEnd);
    if (!struct) {
      throw new Error(`No salary structure found for employee ${emp.name} (${employeeId})`);
    }

    const annualCtc = struct.annualCtc || (struct.baseSalary ? struct.baseSalary * 12 : 0) || 600000;
    const monthlyBase = struct.monthlyGross || (annualCtc / 12);

    // 2. Attendance & LOP Integration
    // Unpaid approved leaves
    const unpaidLeaves = await query(
      `SELECT lr.* 
       FROM leaverequests lr
       LEFT JOIN leave_types lt ON lr.type = lt.id
       WHERE lr.employeeId = ? 
       AND lr.status = 'APPROVED'
       AND (lt.isPaid = 0 OR lt.isPaid IS NULL OR lr.type = 'UNPAID')
       AND lr.startDate >= ? AND lr.startDate <= ?`,
      [employeeId, periodStart, periodEnd]
    );

    let lopDays = 0;
    for (const req of unpaidLeaves as any[]) {
      if (req.isHalfDay) lopDays += 0.5;
      else {
        const workingDays = await leaveEngineService.calculateWorkingDays(req.startDate, req.endDate, organizationId);
        lopDays += workingDays;
      }
    }

    const payrollDivisor = 30;
    const prorationFactor = Math.max(0, (payrollDivisor - lopDays) / payrollDivisor);
    const lopDeduction = Number((monthlyBase * (lopDays / payrollDivisor)).toFixed(2));

    // 3. Overtime Integration
    const approvedOvertimes = await query(
      `SELECT * FROM overtime_records 
       WHERE employeeId = ? AND status = 'APPROVED' 
       AND date >= ? AND date <= ?`,
      [employeeId, periodStart, periodEnd]
    );

    let overtimePay = 0;
    const overtimeRecordsToLink: any[] = [];
    for (const ot of approvedOvertimes as any[]) {
      const hours = ot.hours || ot.durationHours || 0;
      const rate = ot.hourlyRate || (monthlyBase / 160); // 160 hrs/mo default
      const mult = ot.multiplier || 1.5;
      const amt = hours * rate * mult;
      overtimePay += amt;

      overtimeRecordsToLink.push({
        id: randomUUID(),
        payrollRunEmployeeId: runEmpId,
        overtimeRecordId: ot.id,
        approvedHours: hours,
        hourlyRate: Number(rate.toFixed(2)),
        multiplier: mult,
        calculatedAmount: Number(amt.toFixed(2))
      });
    }
    overtimePay = Number(overtimePay.toFixed(2));

    // 4. Reimbursement Integration (Approved Expenses)
    const approvedExpenses = await query(
      `SELECT * FROM expense_claims 
       WHERE employeeId = ? 
       AND status = 'APPROVED'`,
      [employeeId]
    );

    let eligibleReimbursements = 0;
    const reimbursementsToLink: any[] = [];
    for (const exp of approvedExpenses as any[]) {
      const amt = Number(exp.amount || 0);
      eligibleReimbursements += amt;
      reimbursementsToLink.push({
        id: randomUUID(),
        payrollRunEmployeeId: runEmpId,
        expenseClaimId: exp.id,
        category: exp.category || 'Expense Claim',
        approvedAmount: amt,
        taxable: exp.taxable ? 1 : 0
      });
    }
    eligibleReimbursements = Number(eligibleReimbursements.toFixed(2));

    // 5. Earnings Component Calculations
    let basicPay = 0;
    let hra = 0;
    let specialAllowance = 0;
    let otherEarnings = 0;
    let grossEarnings = 0;
    const lineItems: any[] = [];

    const components = struct.components || [];
    if (components.length > 0) {
      for (const comp of components) {
        const compAmount = Number((comp.amount * prorationFactor).toFixed(2));
        const code = comp.componentName.toUpperCase().replace(/\s+/g, '_');

        if (comp.type === 'EARNING') {
          grossEarnings += compAmount;
          if (comp.componentName.toLowerCase().includes('basic')) basicPay += compAmount;
          else if (comp.componentName.toLowerCase().includes('hra')) hra += compAmount;
          else if (comp.componentName.toLowerCase().includes('special')) specialAllowance += compAmount;
          else otherEarnings += compAmount;

          lineItems.push({
            id: randomUUID(),
            payrollRunEmployeeId: runEmpId,
            code,
            name: comp.componentName,
            category: 'EARNING',
            amount: compAmount,
            taxable: comp.taxable !== false ? 1 : 0,
            pfApplicable: comp.pfApplicable !== false ? 1 : 0,
            esiApplicable: comp.esiApplicable !== false ? 1 : 0
          });
        }
      }
    } else {
      // Default standard component breakdown from monthly gross
      basicPay = Number((monthlyBase * 0.5 * prorationFactor).toFixed(2));
      hra = Number((basicPay * 0.4).toFixed(2));
      specialAllowance = Number((monthlyBase * prorationFactor - basicPay - hra).toFixed(2));
      grossEarnings = basicPay + hra + specialAllowance;

      lineItems.push(
        { id: randomUUID(), payrollRunEmployeeId: runEmpId, code: 'BASIC', name: 'Basic Pay', category: 'EARNING', amount: basicPay, taxable: 1, pfApplicable: 1, esiApplicable: 1 },
        { id: randomUUID(), payrollRunEmployeeId: runEmpId, code: 'HRA', name: 'House Rent Allowance', category: 'EARNING', amount: hra, taxable: 1, pfApplicable: 0, esiApplicable: 1 },
        { id: randomUUID(), payrollRunEmployeeId: runEmpId, code: 'SPECIAL_ALLOWANCE', name: 'Special Allowance', category: 'EARNING', amount: specialAllowance, taxable: 1, pfApplicable: 0, esiApplicable: 1 }
      );
    }

    if (overtimePay > 0) {
      grossEarnings += overtimePay;
      lineItems.push({
        id: randomUUID(),
        payrollRunEmployeeId: runEmpId,
        code: 'OVERTIME',
        name: 'Overtime Pay',
        category: 'EARNING',
        amount: overtimePay,
        taxable: 1,
        pfApplicable: 0,
        esiApplicable: 1
      });
    }

    grossEarnings = Number(grossEarnings.toFixed(2));

    // 6. Statutory Deductions
    const pfResult = await ComplianceService.calculatePF(basicPay);
    const employeePf = pfResult.employeePF;
    const employerPf = pfResult.employerPF;

    const esiResult = await ComplianceService.calculateESI(grossEarnings);
    const employeeEsi = esiResult.employeeESI;
    const employerEsi = esiResult.employerESI;

    const professionalTax = await ComplianceService.calculatePT(grossEarnings);

    // Fetch employee tax profile (Old vs New regime)
    const taxProfile = await query(
      `SELECT * FROM employee_tax_profiles WHERE employeeId = ?`,
      [employeeId]
    ).then(res => res[0]);

    const taxRegime = taxProfile?.regime || emp.taxRegime || 'new';

    // Calculate TDS
    const taxRes = await TaxCalculationService.calculateTaxForEmployee(grossEarnings * 12, taxRegime as any);
    const tdsDeduction = taxRes.monthlyTds;

    let totalDeductions = employeePf + employeeEsi + professionalTax + tdsDeduction + lopDeduction;
    totalDeductions = Number(totalDeductions.toFixed(2));

    // Line items for deductions
    if (employeePf > 0) lineItems.push({ id: randomUUID(), payrollRunEmployeeId: runEmpId, code: 'PF_EMP', name: 'Employee EPF', category: 'STATUTORY_EMPLOYEE', amount: employeePf });
    if (employeeEsi > 0) lineItems.push({ id: randomUUID(), payrollRunEmployeeId: runEmpId, code: 'ESI_EMP', name: 'Employee ESI', category: 'STATUTORY_EMPLOYEE', amount: employeeEsi });
    if (professionalTax > 0) lineItems.push({ id: randomUUID(), payrollRunEmployeeId: runEmpId, code: 'PT', name: 'Professional Tax', category: 'STATUTORY_EMPLOYEE', amount: professionalTax });
    if (tdsDeduction > 0) lineItems.push({ id: randomUUID(), payrollRunEmployeeId: runEmpId, code: 'TDS', name: 'Income Tax (TDS)', category: 'TAX', amount: tdsDeduction });
    if (lopDeduction > 0) lineItems.push({ id: randomUUID(), payrollRunEmployeeId: runEmpId, code: 'LOP', name: 'Loss of Pay Deduction', category: 'DEDUCTION', amount: lopDeduction });

    if (eligibleReimbursements > 0) {
      lineItems.push({ id: randomUUID(), payrollRunEmployeeId: runEmpId, code: 'REIMBURSEMENT', name: 'Approved Reimbursements', category: 'REIMBURSEMENT', amount: eligibleReimbursements, taxable: 0 });
    }

    // 7. Net Pay Computation
    const netPay = Number((grossEarnings + eligibleReimbursements - totalDeductions).toFixed(2));

    // 8. Insert Payroll Run Employee Snapshot Record
    await execute(
      `INSERT INTO payroll_run_employees (
        id, payrollRunId, employeeId, organizationId, departmentId, designation,
        effectiveStructureId, taxRegime, annualCtc, basicPay, hra, specialAllowance,
        otherEarnings, overtimePay, grossEarnings, eligibleReimbursements,
        employeePf, employerPf, employeeEsi, employerEsi, professionalTax,
        tdsDeduction, lopDays, lopDeduction, otherDeductions, totalDeductions,
        netPay, status, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, 'CALCULATED', ?)`,
      [
        runEmpId, runId, employeeId, organizationId, emp.department, emp.designation,
        struct.id, taxRegime, annualCtc, basicPay, hra, specialAllowance,
        otherEarnings, overtimePay, grossEarnings, eligibleReimbursements,
        employeePf, employerPf, employeeEsi, employerEsi, professionalTax,
        tdsDeduction, lopDays, lopDeduction, totalDeductions,
        netPay, new Date().toISOString()
      ]
    );

    // Save line items
    for (const item of lineItems) {
      await execute(
        `INSERT INTO payroll_line_items (id, payrollRunEmployeeId, code, name, category, amount, taxable, pfApplicable, esiApplicable)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [item.id, runEmpId, item.code, item.name, item.category, item.amount, item.taxable ?? 1, item.pfApplicable ?? 1, item.esiApplicable ?? 1]
      );
    }

    // Save linked LOP record if applicable
    if (lopDays > 0) {
      await execute(
        `INSERT INTO payroll_lop_records (id, payrollRunEmployeeId, employeeId, payrollRunId, lopDays, payrollDivisor, lopBasisAmount, calculatedLopAmount, createdAt)
         VALUES (?, ?, ?, ?, ?, 30, ?, ?, ?)`,
        [randomUUID(), runEmpId, employeeId, runId, lopDays, monthlyBase, lopDeduction, new Date().toISOString()]
      );
    }

    // Save linked overtime records
    for (const otItem of overtimeRecordsToLink) {
      await execute(
        `INSERT INTO payroll_overtime_records (id, payrollRunEmployeeId, overtimeRecordId, approvedHours, hourlyRate, multiplier, calculatedAmount)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [otItem.id, otItem.payrollRunEmployeeId, otItem.overtimeRecordId, otItem.approvedHours, otItem.hourlyRate, otItem.multiplier, otItem.calculatedAmount]
      );
    }

    // Save linked reimbursement records
    for (const rItem of reimbursementsToLink) {
      await execute(
        `INSERT INTO payroll_reimbursement_records (id, payrollRunEmployeeId, expenseClaimId, category, approvedAmount, taxable)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [rItem.id, rItem.payrollRunEmployeeId, rItem.expenseClaimId, rItem.category, rItem.approvedAmount, rItem.taxable]
      );
    }

    // Generate or update Payslip record
    const existingPayslip = await query(`SELECT id FROM payslips WHERE payrollRunId = ? AND employeeId = ?`, [runId, employeeId]).then(res => res[0]);
    if (existingPayslip) {
      await execute(
        `UPDATE payslips SET basicPay = ?, totalEarnings = ?, totalDeductions = ?, netPay = ?, lineItems = ?, status = 'GENERATED' WHERE id = ?`,
        [basicPay, grossEarnings, totalDeductions, netPay, JSON.stringify(lineItems), existingPayslip.id]
      );
    } else {
      await execute(
        `INSERT INTO payslips (id, payrollRunId, employeeId, basicPay, totalEarnings, totalDeductions, netPay, lineItems, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'GENERATED')`,
        [randomUUID(), runId, employeeId, basicPay, grossEarnings, totalDeductions, netPay, JSON.stringify(lineItems)]
      );
    }

    return {
      grossEarnings,
      totalDeductions,
      netPay,
      employeePf,
      employeeEsi,
      professionalTax,
      tdsDeduction,
      eligibleReimbursements,
      lopDeduction
    };
  }

  /**
   * Comprehensive Validation Engine before approval
   */
  static async validatePayrollRun(runId: string): Promise<{ isValid: boolean; issues: PayrollValidationIssue[] }> {
    const run = await query(`SELECT * FROM payroll_runs WHERE id = ?`, [runId]).then(res => res[0]);
    if (!run) throw new Error('Payroll run not found');

    const issues: PayrollValidationIssue[] = [];

    const runEmps = await query(
      `SELECT pre.*, e.name as employeeName, e.bankAccountNumber, e.ifscCode 
       FROM payroll_run_employees pre 
       JOIN employees e ON pre.employeeId = e.id 
       WHERE pre.payrollRunId = ?`,
      [runId]
    );

    if (runEmps.length === 0) {
      issues.push({
        code: 'NO_EMPLOYEES',
        severity: 'ERROR',
        message: 'No employees found in this payroll run. Calculation is required before validation.'
      });
    }

    for (const emp of runEmps as any[]) {
      if (emp.netPay < 0) {
        issues.push({
          employeeId: emp.employeeId,
          employeeName: emp.employeeName,
          code: 'NEGATIVE_NET_PAY',
          severity: 'ERROR',
          message: `Net pay for ${emp.employeeName} is negative (₹${emp.netPay}).`
        });
      }

      if (!emp.bankAccountNumber) {
        issues.push({
          employeeId: emp.employeeId,
          employeeName: emp.employeeName,
          code: 'MISSING_BANK_DETAILS',
          severity: 'WARNING',
          message: `Bank details missing for ${emp.employeeName}. Direct deposit might fail.`
        });
      }

      if (emp.employeePf > 0 && emp.basicPay <= 0) {
        issues.push({
          employeeId: emp.employeeId,
          employeeName: emp.employeeName,
          code: 'INVALID_PF_CALCULATION',
          severity: 'ERROR',
          message: `PF calculated without Basic Pay for ${emp.employeeName}.`
        });
      }
    }

    // Update status to VALIDATED if no ERROR severity issues exist
    const hasErrors = issues.some(i => i.severity === 'ERROR');
    if (!hasErrors && run.status === 'CALCULATED') {
      await execute(`UPDATE payroll_runs SET status = 'VALIDATED' WHERE id = ?`, [runId]);
    }

    return { isValid: !hasErrors, issues };
  }

  /**
   * Submit Payroll for Approval
   */
  static async submitForApproval(runId: string, actorId: string, actorRole: string) {
    const run = await query(`SELECT * FROM payroll_runs WHERE id = ?`, [runId]).then(res => res[0]);
    if (!run) throw new Error('Payroll run not found');

    const validation = await this.validatePayrollRun(runId);
    if (!validation.isValid) {
      throw new Error(`Cannot submit payroll run with validation errors.`);
    }

    await execute(
      `UPDATE payroll_runs SET status = 'PENDING_APPROVAL', submittedBy = ?, submittedAt = ? WHERE id = ?`,
      [actorId, new Date().toISOString(), runId]
    );

    await this.logPayrollApproval(runId, actorId, actorRole, 'SUBMIT', run.status, 'PENDING_APPROVAL', 'Submitted for manager/HR approval');
    return this.getPayrollRunById(runId);
  }

  /**
   * Approve Payroll Run
   */
  static async approvePayrollRun(runId: string, actorId: string, actorRole: string) {
    const run = await query(`SELECT * FROM payroll_runs WHERE id = ?`, [runId]).then(res => res[0]);
    if (!run) throw new Error('Payroll run not found');
    if (run.status !== 'PENDING_APPROVAL' && run.status !== 'VALIDATED') {
      throw new Error(`Cannot approve payroll run in ${run.status} status.`);
    }

    await execute(
      `UPDATE payroll_runs SET status = 'APPROVED', approvedBy = ?, approvedAt = ? WHERE id = ?`,
      [actorId, new Date().toISOString(), runId]
    );

    await this.logPayrollApproval(runId, actorId, actorRole, 'APPROVE', run.status, 'APPROVED', 'Payroll run approved');
    return this.getPayrollRunById(runId);
  }

  /**
   * Reject Payroll Run
   */
  static async rejectPayrollRun(runId: string, actorId: string, actorRole: string, reason: string) {
    const run = await query(`SELECT * FROM payroll_runs WHERE id = ?`, [runId]).then(res => res[0]);
    if (!run) throw new Error('Payroll run not found');

    await execute(
      `UPDATE payroll_runs SET status = 'DRAFT', rejectedBy = ?, rejectedAt = ?, rejectionReason = ? WHERE id = ?`,
      [actorId, new Date().toISOString(), reason, runId]
    );

    await this.logPayrollApproval(runId, actorId, actorRole, 'REJECT', run.status, 'DRAFT', reason);
    return this.getPayrollRunById(runId);
  }

  /**
   * Lock Payroll Run (Immutability Enforced)
   */
  static async lockPayrollRun(runId: string, actorId: string, actorRole: string) {
    const run = await query(`SELECT * FROM payroll_runs WHERE id = ?`, [runId]).then(res => res[0]);
    if (!run) throw new Error('Payroll run not found');
    if (run.status !== 'APPROVED') {
      throw new Error(`Payroll run must be APPROVED before it can be LOCKED.`);
    }

    await execute(
      `UPDATE payroll_runs SET status = 'LOCKED', lockedBy = ?, lockedAt = ? WHERE id = ?`,
      [actorId, new Date().toISOString(), runId]
    );

    await this.logPayrollApproval(runId, actorId, actorRole, 'LOCK', run.status, 'LOCKED', 'Payroll run locked permanently against modifications');
    return this.getPayrollRunById(runId);
  }

  /**
   * Finalize Payroll Run (Payslip issuance & YTD rollup)
   */
  static async finalizePayrollRun(runId: string, actorId: string, actorRole: string) {
    const run = await query(`SELECT * FROM payroll_runs WHERE id = ?`, [runId]).then(res => res[0]);
    if (!run) throw new Error('Payroll run not found');
    if (run.status !== 'LOCKED' && run.status !== 'APPROVED') {
      throw new Error(`Payroll run must be APPROVED or LOCKED before finalization.`);
    }

    const financialYear = `${run.year}-${String(run.year + 1).slice(-2)}`;

    // Mark run as FINALIZED
    await execute(
      `UPDATE payroll_runs SET status = 'FINALIZED', finalizedBy = ?, finalizedAt = ? WHERE id = ?`,
      [actorId, new Date().toISOString(), runId]
    );

    // Mark payslips as ISSUED
    await execute(`UPDATE payslips SET status = 'ISSUED' WHERE payrollRunId = ?`, [runId]);

    // Mark expense claims processed
    const reimbursements = await query(
      `SELECT prr.expenseClaimId 
       FROM payroll_reimbursement_records prr 
       JOIN payroll_run_employees pre ON prr.payrollRunEmployeeId = pre.id 
       WHERE pre.payrollRunId = ?`,
      [runId]
    );

    for (const r of reimbursements as any[]) {
      try {
        await execute(`UPDATE expense_claims SET status = 'PAID' WHERE id = ?`, [r.expenseClaimId]);
      } catch (e) {}
    }

    // Rollup YTD numbers for every employee in this run
    const runEmps = await query(`SELECT * FROM payroll_run_employees WHERE payrollRunId = ?`, [runId]);

    for (const emp of runEmps as any[]) {
      const existingYtd = await query(
        `SELECT * FROM payroll_ytd WHERE employeeId = ? AND financialYear = ?`,
        [emp.employeeId, financialYear]
      ).then(res => res[0]);

      if (existingYtd) {
        await execute(
          `UPDATE payroll_ytd SET 
            ytdGross = ytdGross + ?,
            ytdBasic = ytdBasic + ?,
            ytdHra = ytdHra + ?,
            ytdAllowances = ytdAllowances + ?,
            ytdOvertime = ytdOvertime + ?,
            ytdReimbursements = ytdReimbursements + ?,
            ytdPf = ytdPf + ?,
            ytdEsi = ytdEsi + ?,
            ytdPt = ytdPt + ?,
            ytdTds = ytdTds + ?,
            ytdLopDeduction = ytdLopDeduction + ?,
            ytdNetPay = ytdNetPay + ?,
            lastUpdatedRunId = ?,
            updatedAt = ?
           WHERE id = ?`,
          [
            emp.grossEarnings, emp.basicPay, emp.hra, emp.specialAllowance + emp.otherEarnings,
            emp.overtimePay, emp.eligibleReimbursements, emp.employeePf, emp.employeeEsi,
            emp.professionalTax, emp.tdsDeduction, emp.lopDeduction, emp.netPay,
            runId, new Date().toISOString(), existingYtd.id
          ]
        );
      } else {
        await execute(
          `INSERT INTO payroll_ytd (
            id, employeeId, financialYear, ytdGross, ytdBasic, ytdHra, ytdAllowances,
            ytdOvertime, ytdReimbursements, ytdPf, ytdEsi, ytdPt, ytdTds,
            ytdLopDeduction, ytdOtherDeductions, ytdNetPay, ytdTaxableIncome,
            lastUpdatedRunId, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?)`,
          [
            randomUUID(), emp.employeeId, financialYear, emp.grossEarnings, emp.basicPay,
            emp.hra, emp.specialAllowance + emp.otherEarnings, emp.overtimePay,
            emp.eligibleReimbursements, emp.employeePf, emp.employeeEsi, emp.professionalTax,
            emp.tdsDeduction, emp.lopDeduction, emp.netPay, emp.grossEarnings * 12,
            runId, new Date().toISOString()
          ]
        );
      }
    }

    await this.logPayrollApproval(runId, actorId, actorRole, 'FINALIZE', run.status, 'FINALIZED', 'Payroll finalized and payslips issued');
    return this.getPayrollRunById(runId);
  }

  /**
   * Rollback pre-finalized payroll run
   */
  static async rollbackPayrollRun(runId: string, actorId: string, actorRole: string, reason: string) {
    const run = await query(`SELECT * FROM payroll_runs WHERE id = ?`, [runId]).then(res => res[0]);
    if (!run) throw new Error('Payroll run not found');
    if (run.status === 'FINALIZED') {
      throw new Error(`Cannot rollback a FINALIZED payroll run. Use Reversal flow instead.`);
    }

    await execute(
      `UPDATE payroll_runs SET status = 'ROLLED_BACK' WHERE id = ?`,
      [runId]
    );

    await this.logPayrollApproval(runId, actorId, actorRole, 'ROLLBACK', run.status, 'ROLLED_BACK', reason);
    return this.getPayrollRunById(runId);
  }

  /**
   * Reverse already FINALIZED payroll run with formal audit record
   */
  static async reversePayrollRun(runId: string, actorId: string, actorRole: string, reason: string) {
    const run = await query(`SELECT * FROM payroll_runs WHERE id = ?`, [runId]).then(res => res[0]);
    if (!run) throw new Error('Payroll run not found');
    if (run.status !== 'FINALIZED') {
      throw new Error(`Only FINALIZED payroll runs can be reversed.`);
    }

    const reversalId = randomUUID();
    await execute(
      `INSERT INTO payroll_reversals (id, originalPayrollRunId, reversedBy, reversalDate, reversalReason, totalReversedAmount, status)
       VALUES (?, ?, ?, ?, ?, ?, 'COMPLETED')`,
      [reversalId, runId, actorId, new Date().toISOString(), reason, run.totalNetPay]
    );

    await execute(`UPDATE payroll_runs SET status = 'REVERSED' WHERE id = ?`, [runId]);
    await execute(`UPDATE payslips SET status = 'REVERSED' WHERE payrollRunId = ?`, [runId]);

    await this.logPayrollApproval(runId, actorId, actorRole, 'REVERSE', run.status, 'REVERSED', reason);
    return { reversalId, runId, status: 'REVERSED' };
  }

  /**
   * Helper: Retrieve run by ID with detailed stats
   */
  static async getPayrollRunById(runId: string) {
    const run = await query(`SELECT * FROM payroll_runs WHERE id = ?`, [runId]).then(res => res[0]);
    if (!run) return null;

    const approvals = await query(
      `SELECT * FROM payroll_approvals WHERE payrollRunId = ? ORDER BY timestamp DESC`,
      [runId]
    );

    return { ...run, approvals };
  }

  /**
   * Helper: Log approval action
   */
  private static async logPayrollApproval(
    payrollRunId: string,
    actorId: string,
    actorRole: string,
    action: string,
    previousStatus: string,
    newStatus: string,
    reason?: string
  ) {
    await execute(
      `INSERT INTO payroll_approvals (id, payrollRunId, actorId, actorRole, action, previousStatus, newStatus, reason, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [randomUUID(), payrollRunId, actorId, actorRole, action, previousStatus, newStatus, reason || null, new Date().toISOString()]
    );
  }

  /**
   * Helper: Log audit event
   */
  private static async logPayrollAudit(
    organizationId: string,
    actorId: string,
    actorRole: string,
    action: string,
    entityType: string,
    entityId: string,
    previousValues?: any,
    newValues?: any
  ) {
    await execute(
      `INSERT INTO payroll_audit_logs (id, organizationId, actorId, actorRole, action, entityType, entityId, previousValues, newValues, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        randomUUID(),
        organizationId,
        actorId,
        actorRole,
        action,
        entityType,
        entityId,
        previousValues ? JSON.stringify(previousValues) : null,
        newValues ? JSON.stringify(newValues) : null,
        new Date().toISOString()
      ]
    );
  }
}

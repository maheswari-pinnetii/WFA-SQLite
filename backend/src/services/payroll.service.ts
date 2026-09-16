import { randomUUID } from 'crypto';
import { query, execute } from '../database/sqlite-cloud.js';
import { logger } from '../config/logger.js';
import { ComplianceService } from './compliance.service.js';
import { leaveEngineService } from './leave-engine.service.js';
import { jobScheduler } from './jobScheduler.service.js';

export interface SetSalaryStructureParams {
  employeeId: string;
  organizationId: string;
  baseSalary: number;
  currency: string;
  effectiveDate: string;
  components: Array<{
    name: string;
    type: 'EARNING' | 'DEDUCTION';
    amount: number;
  }>;
}

export interface CreatePayrollRunParams {
  organizationId: string;
  month: number;
  year: number;
}

export const payrollService = {
  /**
   * Retrieves the current salary structure for an employee
   */
  async getSalaryStructure(employeeId: string) {
    const structure = await query(
      `SELECT * FROM salary_structures WHERE employeeId = ? ORDER BY effectiveDate DESC LIMIT 1`,
      [employeeId]
    ).then(res => res[0]);

    if (!structure) return null;

    const components = await query(
      `SELECT * FROM salary_components WHERE salaryStructureId = ?`,
      [structure.id]
    );

    return { ...structure, components };
  },

  /**
   * Sets or updates the salary structure and components for an employee
   */
  async setSalaryStructure(params: SetSalaryStructureParams) {
    const { employeeId, organizationId, baseSalary, currency, effectiveDate, components } = params;
    
    // Simple transaction-like approach
    const structId = randomUUID();
    await execute(
      `INSERT INTO salary_structures (id, employeeId, baseSalary, currency, effectiveDate, organizationId)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [structId, employeeId, baseSalary, currency, effectiveDate, organizationId]
    );

    for (const comp of components) {
      await execute(
        `INSERT INTO salary_components (id, salaryStructureId, componentName, type, amount)
         VALUES (?, ?, ?, ?, ?)`,
        [randomUUID(), structId, comp.name, comp.type, comp.amount]
      );
    }

    return this.getSalaryStructure(employeeId);
  },

  /**
   * Fetch all runs
   */
  async getPayrollRuns(organizationId: string) {
    return query(
      `SELECT * FROM payroll_runs WHERE organizationId = ? ORDER BY periodStart DESC`,
      [organizationId]
    );
  },

  /**
   * Creates a draft payroll run
   */
  async createPayrollRun(params: CreatePayrollRunParams) {
    const { organizationId, month, year } = params;
    
    const periodStart = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const periodEnd = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;
    const runDate = new Date().toISOString();

    const existingRun = await query(
      `SELECT id FROM payroll_runs WHERE organizationId = ? AND periodStart = ? AND periodEnd = ?`,
      [organizationId, periodStart, periodEnd]
    ).then(res => res[0]);

    if (existingRun) {
      throw new Error(`Payroll run for ${periodStart} to ${periodEnd} already exists.`);
    }

    const runId = randomUUID();
    
    await execute(
      `INSERT INTO payroll_runs (id, organizationId, periodStart, periodEnd, runDate, status)
       VALUES (?, ?, ?, ?, ?, 'DRAFT')`,
      [runId, organizationId, periodStart, periodEnd, runDate]
    );

    logger.info(`[Payroll] Created DRAFT payroll run ${runId} for ${month}/${year}`);
    return runId;
  },

  /**
   * Generates payslips for a specific DRAFT run
   */
  async generatePayslips(runId: string) {
    const run = await query(`SELECT * FROM payroll_runs WHERE id = ?`, [runId]).then(res => res[0]);
    if (!run) throw new Error('Payroll run not found');
    if (run.status !== 'DRAFT') throw new Error('Can only generate payslips for DRAFT runs');

    const employees = await query(
      `SELECT id FROM employees WHERE organizationId = ? AND status = 'ACTIVE'`,
      [run.organizationId]
    );

    let processedCount = 0;
    
    // Clear existing payslips for this run just in case we are re-generating
    await execute(`DELETE FROM payslips WHERE payrollRunId = ?`, [runId]);

    for (const emp of employees) {
      try {
        await this.calculateEmployeePay(runId, emp.id, run.periodStart, run.periodEnd);
        processedCount++;
      } catch (err: any) {
        logger.error(`[Payroll] Failed to calculate pay for employee ${emp.id}: ${err.message}`);
      }
    }

    logger.info(`[Payroll] Successfully processed ${processedCount} payslips for run ${runId}`);
    return { runId, processedCount };
  },

  /**
   * Calculates pay for a single employee and inserts the payslip.
   */
  async calculateEmployeePay(runId: string, employeeId: string, periodStart: string, periodEnd: string) {
    // 1. Fetch Salary Structure
    const structure = await query(
      `SELECT * FROM salary_structures WHERE employeeId = ? ORDER BY effectiveDate DESC LIMIT 1`,
      [employeeId]
    ).then(res => res[0]);

    if (!structure) {
      throw new Error(`No active salary structure found.`);
    }

    // 2. Fetch Components
    const components = await query(
      `SELECT * FROM salary_components WHERE salaryStructureId = ?`,
      [structure.id]
    );

    // 3. Dynamic LOP (Loss of Pay) calculation based on Leave Engine
    const unpaidLeaves = await query(
      `SELECT lr.*, lt.isPaid 
       FROM leaverequests lr
       JOIN leave_types lt ON lr.type = lt.id
       WHERE lr.employeeId = ? 
       AND lr.status = 'APPROVED'
       AND lt.isPaid = 0
       AND lr.startDate >= ? AND lr.startDate <= ?`,
      [employeeId, periodStart, periodEnd]
    );

    let lopDays = 0;
    // We assume organization ID matches structure organizationId
    const orgId = structure.organizationId;

    for (const req of unpaidLeaves as any[]) {
      if (req.isHalfDay) {
        lopDays += 0.5;
      } else {
        const workingDays = await leaveEngineService.calculateWorkingDays(req.startDate, req.endDate, orgId);
        lopDays += workingDays;
      }
    }

    const workingDaysDivisor = 30; // standard 30 day divisor for Indian payroll
    const prorationFactor = Math.max(0, (workingDaysDivisor - lopDays) / workingDaysDivisor);

    let totalEarnings = 0;
    let totalDeductions = 0;
    let basicPay = 0;

    const lineItems = [];

    // Calculate Components
    for (const comp of components) {
      const amount = comp.amount * prorationFactor;

      if (comp.componentName === 'Basic Pay') {
        basicPay = amount;
      }

      if (comp.type === 'EARNING') {
        totalEarnings += amount;
      } else if (comp.type === 'DEDUCTION') {
        totalDeductions += amount;
      }

      lineItems.push({
        id: comp.id,
        name: comp.componentName,
        type: comp.type,
        amount: Number(amount.toFixed(2))
      });
    }

    const netPay = totalEarnings - totalDeductions;
    const payslipId = randomUUID();

    // Indian Statutory Compliance Calculation
    try {
      const pfResult = await ComplianceService.calculatePF(basicPay);
      const esiResult = await ComplianceService.calculateESI(totalEarnings);
      const ptDeduction = await ComplianceService.calculatePT(totalEarnings);
      const tdsDeduction = await ComplianceService.calculateTDS(totalEarnings);

      const complianceId = randomUUID();
      await execute(
        `INSERT INTO pf_esi_records (id, payrollRunId, employeeId, pfWage, pfEmployeeContribution, pfEmployerContribution, pfEpsContribution, esiWage, esiEmployeeContribution, esiEmployerContribution, ptDeduction, tdsDeduction) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [complianceId, runId, employeeId, Math.min(basicPay, 15000), pfResult.employeePF, pfResult.employerPF, 0, totalEarnings, esiResult.employeeESI, esiResult.employerESI, ptDeduction, tdsDeduction]
      );
      
      // Add deductions to payslip line items
      if (pfResult.employeePF > 0) {
        totalDeductions += pfResult.employeePF;
        lineItems.push({ id: randomUUID(), name: 'PF Contribution', type: 'DEDUCTION', amount: pfResult.employeePF });
      }
      if (esiResult.employeeESI > 0) {
        totalDeductions += esiResult.employeeESI;
        lineItems.push({ id: randomUUID(), name: 'ESI Contribution', type: 'DEDUCTION', amount: esiResult.employeeESI });
      }
      if (ptDeduction > 0) {
        totalDeductions += ptDeduction;
        lineItems.push({ id: randomUUID(), name: 'Professional Tax', type: 'DEDUCTION', amount: ptDeduction });
      }
      if (tdsDeduction > 0) {
        totalDeductions += tdsDeduction;
        lineItems.push({ id: randomUUID(), name: 'TDS', type: 'DEDUCTION', amount: tdsDeduction });
      }

    } catch (e) {
      logger.error(`[Payroll] Failed compliance calculation: ` + e);
    }

    const finalNetPay = totalEarnings - totalDeductions;

    // 4. Insert Payslip
    await execute(
      `INSERT INTO payslips (id, payrollRunId, employeeId, basicPay, totalEarnings, totalDeductions, netPay, lineItems, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'GENERATED')`,
      [
        payslipId, 
        runId, 
        employeeId, 
        Number(basicPay.toFixed(2)), 
        Number(totalEarnings.toFixed(2)), 
        Number(totalDeductions.toFixed(2)), 
        Number(finalNetPay.toFixed(2)),
        JSON.stringify(lineItems)
      ]
    );
  },

  /**
   * Fetch payslips for a run
   */
  async getPayslipsForRun(runId: string) {
    return query(
      `SELECT p.*, e.name as employeeName, e.employeeCode 
       FROM payslips p
       JOIN employees e ON p.employeeId = e.id
       WHERE p.payrollRunId = ?
       ORDER BY e.name ASC`,
      [runId]
    ).then(res => res.map((p: any) => {
      try { p.lineItems = JSON.parse(p.lineItems || '[]'); } catch(e) {}
      return p;
    }));
  },

  /**
   * Finalize a payroll run
   */
  async finalizePayrollRun(runId: string) {
    await execute(
      `UPDATE payroll_runs SET status = 'FINALIZED' WHERE id = ?`,
      [runId]
    );
    await execute(
      `UPDATE payslips SET status = 'ISSUED' WHERE payrollRunId = ?`,
      [runId]
    );
  },

  /**
   * Fetch all payslips for an employee (self-service)
   */
  async getEmployeePayslips(employeeId: string) {
    return query(
      `SELECT p.*, r.periodStart, r.periodEnd
       FROM payslips p
       JOIN payroll_runs r ON p.payrollRunId = r.id
       WHERE p.employeeId = ? AND p.status = 'ISSUED'
       ORDER BY r.periodStart DESC`,
      [employeeId]
    ).then(res => res.map((p: any) => {
      try { p.lineItems = JSON.parse(p.lineItems || '[]'); } catch(e) {}
      return p;
    }));
  }
};

// Register Job for automated Draft Payroll Runs (Runs on 25th)
jobScheduler.registerHandler('MONTHLY_PAYROLL_DRAFT', async (payload: { organizationId: string }) => {
  const date = new Date();
  try {
    const runId = await payrollService.createPayrollRun({
      organizationId: payload.organizationId,
      month: date.getMonth() + 1,
      year: date.getFullYear()
    });
    // Auto-generate the payslips for this draft
    await payrollService.generatePayslips(runId);
    logger.info(`[Payroll] Automatically ran monthly draft payroll for org ${payload.organizationId}`);
  } catch (err: any) {
    logger.error(`[Payroll] Automated payroll draft failed: ${err.message}`);
  }
});

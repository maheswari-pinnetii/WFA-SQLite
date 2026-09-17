import { randomUUID } from 'crypto';
import { query, execute } from '../database/sqlite-cloud.js';
import { logger } from '../config/logger.js';
import { jobScheduler } from './jobScheduler.service.js';
import { PayrollEngineService } from './payroll-engine.service.ts';
import { TaxCalculationService, CtcCalculationInput } from './tax-calculation.service.js';

export interface SetSalaryStructureParams {
  employeeId: string;
  organizationId: string;
  baseSalary: number;
  annualCtc?: number;
  currency?: string;
  effectiveDate: string;
  effectiveFrom?: string;
  revisionReason?: string;
  actorId?: string;
  components: Array<{
    name: string;
    type: 'EARNING' | 'DEDUCTION';
    amount: number;
    taxable?: boolean;
    pfApplicable?: boolean;
    esiApplicable?: boolean;
  }>;
}

export interface CreatePayrollRunParams {
  organizationId: string;
  month: number;
  year: number;
  actorId?: string;
}

export const payrollService = {
  /**
   * Retrieves the current effective salary structure for an employee
   */
  async getSalaryStructure(employeeId: string) {
    const struct = await query(
      `SELECT * FROM employee_salary_structures WHERE employeeId = ? AND isActive = 1 ORDER BY effectiveFrom DESC LIMIT 1`,
      [employeeId]
    ).then(res => res[0]);

    if (struct) {
      const components = await query(
        `SELECT * FROM salary_components WHERE salaryStructureId = ?`,
        [struct.salaryStructureId || struct.id]
      );
      return { ...struct, baseSalary: struct.monthlyGross, components };
    }

    // Fallback legacy structure query
    const legacy = await query(
      `SELECT * FROM salary_structures WHERE employeeId = ? ORDER BY effectiveDate DESC LIMIT 1`,
      [employeeId]
    ).then(res => res[0]);

    if (!legacy) return null;

    const components = await query(
      `SELECT * FROM salary_components WHERE salaryStructureId = ?`,
      [legacy.id]
    );

    return { ...legacy, components };
  },

  /**
   * Sets salary structure with effective dating and revision tracking
   */
  async setSalaryStructure(params: SetSalaryStructureParams) {
    const {
      employeeId,
      organizationId,
      baseSalary,
      annualCtc,
      currency = 'INR',
      effectiveDate,
      effectiveFrom,
      revisionReason = 'Annual Revision',
      actorId = 'system',
      components
    } = params;

    const currentStruct = await this.getSalaryStructure(employeeId);
    const prevCtc = currentStruct ? (currentStruct.annualCtc || currentStruct.baseSalary * 12) : 0;
    const newCtc = annualCtc || (baseSalary * 12);
    const effFrom = effectiveFrom || effectiveDate || new Date().toISOString().split('T')[0];

    // Close out previous effective structure
    if (currentStruct) {
      await execute(
        `UPDATE employee_salary_structures SET effectiveTo = ?, isActive = 0 WHERE employeeId = ? AND isActive = 1`,
        [effFrom, employeeId]
      );
    }

    const legacyStructId = randomUUID();
    await execute(
      `INSERT INTO salary_structures (id, employeeId, baseSalary, currency, effectiveDate, organizationId)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [legacyStructId, employeeId, baseSalary, currency, effFrom, organizationId]
    );

    const empStructId = randomUUID();
    const monthlyGross = Math.round(newCtc / 12);

    await execute(
      `INSERT INTO employee_salary_structures (
        id, employeeId, organizationId, salaryStructureId, annualCtc, monthlyGross,
        currency, effectiveFrom, revisionReason, isActive, createdBy, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)`,
      [
        empStructId, employeeId, organizationId, legacyStructId, newCtc, monthlyGross,
        currency, effFrom, revisionReason, actorId, new Date().toISOString(), new Date().toISOString()
      ]
    );

    // Insert salary components
    for (const comp of components) {
      await execute(
        `INSERT INTO salary_components (id, salaryStructureId, componentName, type, amount)
         VALUES (?, ?, ?, ?, ?)`,
        [randomUUID(), legacyStructId, comp.name, comp.type, comp.amount]
      );
    }

    // Insert Salary Revision History Record
    const pctChange = prevCtc > 0 ? Math.round(((newCtc - prevCtc) / prevCtc) * 100 * 100) / 100 : 0;
    await execute(
      `INSERT INTO salary_revisions (
        id, employeeId, organizationId, previousCtc, newCtc, previousStructureId,
        newStructureId, effectiveDate, revisionPercentage, reason, createdBy, approvedBy,
        createdTimestamp, approvalTimestamp, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'APPROVED')`,
      [
        randomUUID(), employeeId, organizationId, prevCtc, newCtc,
        currentStruct?.id || null, empStructId, effFrom, pctChange,
        revisionReason, actorId, actorId, new Date().toISOString(), new Date().toISOString()
      ]
    );

    return this.getSalaryStructure(employeeId);
  },

  /**
   * Retrieves salary revision history for an employee
   */
  async getSalaryRevisionHistory(employeeId: string) {
    return query(
      `SELECT * FROM salary_revisions WHERE employeeId = ? ORDER BY effectiveDate DESC`,
      [employeeId]
    );
  },

  /**
   * Interactive CTC Calculator API
   */
  async calculateCtcBreakdown(input: CtcCalculationInput) {
    return TaxCalculationService.calculateCtcBreakdown(input);
  },

  /**
   * Fetch all payroll runs
   */
  async getPayrollRuns(organizationId: string) {
    return query(
      `SELECT pr.*, 
        (SELECT COUNT(*) FROM payroll_run_employees WHERE payrollRunId = pr.id) as calculatedEmployeeCount 
       FROM payroll_runs pr 
       WHERE pr.organizationId = ? 
       ORDER BY pr.year DESC, pr.month DESC`,
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
      `SELECT id FROM payroll_runs WHERE organizationId = ? AND month = ? AND year = ? AND status != 'ROLLED_BACK' AND status != 'REVERSED'`,
      [organizationId, month, year]
    ).then(res => res[0]);

    if (existingRun) {
      throw new Error(`Active payroll run for ${month}/${year} already exists (${existingRun.id}).`);
    }

    const runId = randomUUID();

    await execute(
      `INSERT INTO payroll_runs (
        id, organizationId, month, year, periodStart, periodEnd, runDate, status, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'DRAFT', ?, ?)`,
      [runId, organizationId, month, year, periodStart, periodEnd, runDate, new Date().toISOString(), new Date().toISOString()]
    );

    logger.info(`[PayrollService] Created DRAFT payroll run ${runId} for ${month}/${year}`);
    return runId;
  },

  /**
   * Triggers full calculation for a payroll run
   */
  async calculatePayrollRun(runId: string, actorId: string = 'system', actorRole: string = 'ADMIN') {
    return PayrollEngineService.calculatePayrollRun(runId, actorId, actorRole);
  },

  /**
   * Legacy wrapper for generating payslips (delegates to calculatePayrollRun)
   */
  async generatePayslips(runId: string) {
    return PayrollEngineService.calculatePayrollRun(runId, 'system', 'ADMIN');
  },

  /**
   * Validate payroll run
   */
  async validatePayrollRun(runId: string) {
    return PayrollEngineService.validatePayrollRun(runId);
  },

  /**
   * Submit payroll run for approval
   */
  async submitPayrollRun(runId: string, actorId: string, actorRole: string) {
    return PayrollEngineService.submitForApproval(runId, actorId, actorRole);
  },

  /**
   * Approve payroll run
   */
  async approvePayrollRun(runId: string, actorId: string, actorRole: string) {
    return PayrollEngineService.approvePayrollRun(runId, actorId, actorRole);
  },

  /**
   * Reject payroll run
   */
  async rejectPayrollRun(runId: string, actorId: string, actorRole: string, reason: string) {
    return PayrollEngineService.rejectPayrollRun(runId, actorId, actorRole, reason);
  },

  /**
   * Lock payroll run
   */
  async lockPayrollRun(runId: string, actorId: string, actorRole: string) {
    return PayrollEngineService.lockPayrollRun(runId, actorId, actorRole);
  },

  /**
   * Finalize payroll run
   */
  async finalizePayrollRun(runId: string, actorId: string = 'system', actorRole: string = 'ADMIN') {
    return PayrollEngineService.finalizePayrollRun(runId, actorId, actorRole);
  },

  /**
   * Rollback payroll run
   */
  async rollbackPayrollRun(runId: string, actorId: string, actorRole: string, reason: string) {
    return PayrollEngineService.rollbackPayrollRun(runId, actorId, actorRole, reason);
  },

  /**
   * Reverse finalized payroll run
   */
  async reversePayrollRun(runId: string, actorId: string, actorRole: string, reason: string) {
    return PayrollEngineService.reversePayrollRun(runId, actorId, actorRole, reason);
  },

  /**
   * Fetch payslips for a run
   */
  async getPayslipsForRun(runId: string) {
    return query(
      `SELECT p.*, e.name as employeeName, e.employeeCode, e.department, pre.grossEarnings, pre.netPay, pre.taxRegime
       FROM payslips p
       JOIN employees e ON p.employeeId = e.id
       LEFT JOIN payroll_run_employees pre ON pre.payrollRunId = p.payrollRunId AND pre.employeeId = p.employeeId
       WHERE p.payrollRunId = ?
       ORDER BY e.name ASC`,
      [runId]
    ).then(res => res.map((p: any) => {
      try { p.lineItems = JSON.parse(p.lineItems || '[]'); } catch(e) {}
      return p;
    }));
  },

  /**
   * Fetch self-service payslips for an employee
   */
  async getEmployeePayslips(employeeId: string) {
    return query(
      `SELECT p.*, r.periodStart, r.periodEnd, r.month, r.year
       FROM payslips p
       JOIN payroll_runs r ON p.payrollRunId = r.id
       WHERE p.employeeId = ? AND p.status = 'ISSUED'
       ORDER BY r.periodStart DESC`,
      [employeeId]
    ).then(res => res.map((p: any) => {
      try { p.lineItems = JSON.parse(p.lineItems || '[]'); } catch(e) {}
      return p;
    }));
  },

  /**
   * Fetch complete Payroll Register dataset
   */
  async getPayrollRegister(runId: string) {
    const run = await query(`SELECT * FROM payroll_runs WHERE id = ?`, [runId]).then(res => res[0]);
    if (!run) throw new Error('Payroll run not found');

    const runEmps = await query(
      `SELECT pre.*, e.employeeCode, e.name as employeeName, e.department, e.designation, e.panReference, e.pfAccountNumber
       FROM payroll_run_employees pre
       JOIN employees e ON pre.employeeId = e.id
       WHERE pre.payrollRunId = ?
       ORDER BY e.name ASC`,
      [runId]
    );

    return {
      run,
      employees: runEmps
    };
  },

  /**
   * Fetch Department-wise Payroll Summary
   */
  async getDepartmentPayrollSummary(organizationId: string, month?: number, year?: number) {
    const targetMonth = month || (new Date().getMonth() + 1);
    const targetYear = year || new Date().getFullYear();

    const run = await query(
      `SELECT id FROM payroll_runs WHERE organizationId = ? AND month = ? AND year = ? AND status != 'ROLLED_BACK'`,
      [organizationId, targetMonth, targetYear]
    ).then(res => res[0]);

    if (!run) {
      // Fallback: Group by current active employees
      return query(
        `SELECT department, COUNT(*) as employeeCount, SUM(annualCtc)/12 as estimatedMonthlyGross 
         FROM employees 
         WHERE organizationId = ? AND status = 'ACTIVE' 
         GROUP BY department`,
        [organizationId]
      );
    }

    return query(
      `SELECT 
        pre.departmentId as department,
        COUNT(pre.id) as employeeCount,
        SUM(pre.annualCtc) as totalCtc,
        SUM(pre.grossEarnings) as totalGross,
        SUM(pre.totalDeductions) as totalDeductions,
        SUM(pre.employeePf) as totalPf,
        SUM(pre.employeeEsi) as totalEsi,
        SUM(pre.professionalTax) as totalPt,
        SUM(pre.tdsDeduction) as totalTds,
        SUM(pre.lopDeduction) as totalLop,
        SUM(pre.eligibleReimbursements) as totalReimbursements,
        SUM(pre.netPay) as totalNetPay
       FROM payroll_run_employees pre
       WHERE pre.payrollRunId = ?
       GROUP BY pre.departmentId`,
      [run.id]
    );
  },

  /**
   * Fetch Employee YTD Aggregation
   */
  async getEmployeeYtd(employeeId: string, financialYear: string = '2024-25') {
    const ytd = await query(
      `SELECT * FROM payroll_ytd WHERE employeeId = ? AND financialYear = ?`,
      [employeeId, financialYear]
    ).then(res => res[0]);

    if (ytd) return ytd;

    // Return empty YTD structure if no finalized run exists yet
    return {
      employeeId,
      financialYear,
      ytdGross: 0,
      ytdBasic: 0,
      ytdHra: 0,
      ytdAllowances: 0,
      ytdOvertime: 0,
      ytdReimbursements: 0,
      ytdPf: 0,
      ytdEsi: 0,
      ytdPt: 0,
      ytdTds: 0,
      ytdLopDeduction: 0,
      ytdNetPay: 0
    };
  },

  /**
   * Employee Tax Profile CRUD
   */
  async getEmployeeTaxProfile(employeeId: string, financialYear: string = '2024-25') {
    const profile = await query(
      `SELECT * FROM employee_tax_profiles WHERE employeeId = ? AND financialYear = ?`,
      [employeeId, financialYear]
    ).then(res => res[0]);

    const declarations = await query(
      `SELECT * FROM tax_declarations WHERE employeeId = ? AND financialYear = ?`,
      [employeeId, financialYear]
    );

    return {
      profile: profile || { employeeId, financialYear, regime: 'new', declarationStatus: 'DRAFT' },
      declarations
    };
  },

  async upsertEmployeeTaxProfile(employeeId: string, data: { regime: 'old' | 'new'; declarations?: any[]; financialYear?: string }) {
    const fy = data.financialYear || '2024-25';
    const existing = await query(
      `SELECT id FROM employee_tax_profiles WHERE employeeId = ? AND financialYear = ?`,
      [employeeId, fy]
    ).then(res => res[0]);

    if (existing) {
      await execute(
        `UPDATE employee_tax_profiles SET regime = ?, declarationStatus = 'SUBMITTED', updatedAt = ? WHERE id = ?`,
        [data.regime, new Date().toISOString(), existing.id]
      );
    } else {
      await execute(
        `INSERT INTO employee_tax_profiles (id, employeeId, financialYear, regime, declarationStatus, updatedAt)
         VALUES (?, ?, ?, ?, 'SUBMITTED', ?)`,
        [randomUUID(), employeeId, fy, data.regime, new Date().toISOString()]
      );
    }

    if (data.declarations && data.declarations.length > 0) {
      await execute(`DELETE FROM tax_declarations WHERE employeeId = ? AND financialYear = ?`, [employeeId, fy]);
      for (const dec of data.declarations) {
        await execute(
          `INSERT INTO tax_declarations (id, employeeId, financialYear, sectionCode, componentName, declaredAmount, status, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, 'DECLARED', ?)`,
          [randomUUID(), employeeId, fy, dec.sectionCode, dec.componentName, dec.declaredAmount, new Date().toISOString()]
        );
      }
    }

    return this.getEmployeeTaxProfile(employeeId, fy);
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
    await payrollService.calculatePayrollRun(runId);
    logger.info(`[PayrollService] Automatically calculated monthly draft payroll for org ${payload.organizationId}`);
  } catch (err: any) {
    logger.error(`[PayrollService] Automated payroll draft failed: ${err.message}`);
  }
});

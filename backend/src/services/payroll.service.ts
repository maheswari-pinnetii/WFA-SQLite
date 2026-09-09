import { randomUUID } from 'crypto';
import { query, execute, transaction } from '../database/sqlite-cloud.js';
import { logger } from '../config/logger.js';
import { AppError, ErrorCode } from '../utils/apiError.js';

export const payrollService = {

  /** ─── SALARY STRUCTURES ─────────────────────────── */
  async getSalaryStructure(employeeId: string, organizationId: string) {
    const structure = await query(
      `SELECT s.*, json_group_array(json_object('id', c.id, 'componentName', c.componentName, 'type', c.type, 'amount', c.amount)) as components
       FROM salary_structures s
       LEFT JOIN salary_components c ON c.salaryStructureId = s.id
       WHERE s.employeeId = ? AND s.organizationId = ?
       ORDER BY s.effectiveDate DESC LIMIT 1`,
      [employeeId, organizationId]
    ).then(r => r[0]);

    if (structure && (structure as any).components) {
      try { (structure as any).components = JSON.parse((structure as any).components); } catch { /* noop */ }
    }
    return structure;
  },

  async setSalaryStructure(
    employeeId: string,
    organizationId: string,
    data: {
      baseSalary: number;
      currency?: string;
      effectiveDate: string;
      components?: Array<{ componentName: string; type: 'EARNING' | 'DEDUCTION'; amount: number }>;
    }
  ) {
    const id = randomUUID();
    await execute(
      `INSERT INTO salary_structures (id, employeeId, baseSalary, currency, effectiveDate, organizationId)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, employeeId, data.baseSalary, data.currency || 'USD', data.effectiveDate, organizationId]
    );

    if (data.components) {
      for (const comp of data.components) {
        await execute(
          `INSERT INTO salary_components (id, salaryStructureId, componentName, type, amount) VALUES (?, ?, ?, ?, ?)`,
          [randomUUID(), id, comp.componentName, comp.type, comp.amount]
        );
      }
    }
    return { id };
  },

  /** ─── PAYROLL RUNS ───────────────────────────────── */
  async getPayrollRuns(organizationId: string) {
    return query(
      `SELECT * FROM payroll_runs WHERE organizationId = ? ORDER BY runDate DESC`,
      [organizationId]
    );
  },

  async createPayrollRun(organizationId: string, periodStart: string, periodEnd: string) {
    const id = randomUUID();
    const now = new Date().toISOString();
    await execute(
      `INSERT INTO payroll_runs (id, organizationId, periodStart, periodEnd, runDate, status)
       VALUES (?, ?, ?, ?, ?, 'DRAFT')`,
      [id, organizationId, periodStart, periodEnd, now]
    );
    return { id };
  },

  /** ─── PAYSLIP GENERATION ─────────────────────────── */
  async generatePayslips(payrollRunId: string, organizationId: string) {
    const run = await query(`SELECT * FROM payroll_runs WHERE id = ? AND organizationId = ?`, [payrollRunId, organizationId])
      .then(r => r[0]) as any;

    if (!run) throw AppError.notFound('Payroll run', ErrorCode.PAYROLL_RUN_NOT_FOUND);
    if (run.status === 'FINALIZED' || run.status === 'LOCKED') {
      throw AppError.conflict(ErrorCode.PAYROLL_RUN_ALREADY_FINALIZED, 'This payroll run has already been finalized and cannot be re-processed.');
    }

    return transaction(async () => {
      const employees = await query(
        `SELECT id FROM employees WHERE organizationId = ? AND status = 'ACTIVE'`,
        [organizationId]
      ) as any[];

      const payslips = [];

      for (const emp of employees) {
        const structure = await this.getSalaryStructure(emp.id, organizationId) as any;
        if (!structure) {
          logger.warn(`[Payroll] No salary structure for employee ${emp.id}, skipping`);
          continue;
        }

        const components = Array.isArray(structure.components) ? structure.components : [];
        const earnings = components
          .filter((c: any) => c.type === 'EARNING')
          .reduce((sum: number, c: any) => sum + c.amount, 0);
        const deductions = components
          .filter((c: any) => c.type === 'DEDUCTION')
          .reduce((sum: number, c: any) => sum + c.amount, 0);

        const basicPay = structure.baseSalary;
        const totalEarnings = basicPay + earnings;
        const totalDeductions = deductions;

        // Include approved Overtime pay
        const approvedOTRecords = await query(
          `SELECT SUM(hours) as totalOTHours FROM overtime_records
           WHERE employeeId = ? AND organizationId = ? AND status = 'APPROVED'
           AND date BETWEEN ? AND ?`,
          [emp.id, organizationId, run.periodStart, run.periodEnd]
        ).then(r => r[0]) as any;

        let overtimePay = 0;
        if (approvedOTRecords?.totalOTHours > 0) {
          const hourlyRate = basicPay / 160;
          overtimePay = approvedOTRecords.totalOTHours * hourlyRate * 1.5;
        }

        const netPay = totalEarnings + overtimePay - totalDeductions;

        const payslipId = randomUUID();
        await execute(
          `INSERT OR REPLACE INTO payslips (id, payrollRunId, employeeId, basicPay, totalEarnings, totalDeductions, netPay, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, 'GENERATED')`,
          [payslipId, payrollRunId, emp.id, basicPay, totalEarnings + overtimePay, totalDeductions, netPay]
        );

        payslips.push({ employeeId: emp.id, netPay, overtimePay });
      }

      await execute(
        `UPDATE payroll_runs SET status = 'PROCESSED' WHERE id = ?`,
        [payrollRunId]
      );

      logger.info(`[Payroll] Generated ${payslips.length} payslips for run ${payrollRunId}`);
      return { payrollRunId, payslipsGenerated: payslips.length, payslips };
    });
  },

  async getPayslips(employeeId: string, organizationId: string) {
    return query(
      `SELECT p.*, pr.periodStart, pr.periodEnd 
       FROM payslips p 
       JOIN payroll_runs pr ON p.payrollRunId = pr.id
       WHERE p.employeeId = ? AND pr.organizationId = ?
       ORDER BY pr.runDate DESC`,
      [employeeId, organizationId]
    );
  },

  async finalizePayrollRun(payrollRunId: string, organizationId: string) {
    await execute(
      `UPDATE payroll_runs SET status = 'FINALIZED' WHERE id = ? AND organizationId = ?`,
      [payrollRunId, organizationId]
    );
  }
};

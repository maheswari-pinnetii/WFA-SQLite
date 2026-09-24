import { randomUUID } from 'crypto';
import { query, execute } from '../../database/sqlite-cloud.js';
import { logger } from '../../config/logger.js';
import { payrollService } from './payroll.service.js';

export interface PrepareFnFInput {
  employeeId: string;
  exitDate: string;
  resignationDate?: string;
  noticePeriodDays?: number;
  noticeServedDays?: number;
  gratuityAmount?: number;
  otherDeductions?: number;
  preparedBy: string;
}

export class FullFinalSettlementService {
  /**
   * Computes Full & Final (F&F) Settlement Statement for an exiting employee
   */
  static async calculateFnFSettlement(input: PrepareFnFInput) {
    const {
      employeeId,
      exitDate,
      resignationDate = new Date().toISOString().split('T')[0],
      noticePeriodDays = 30,
      noticeServedDays = 30,
      gratuityAmount = 0,
      otherDeductions = 0,
      preparedBy
    } = input;

    const emp = await query(`SELECT * FROM employees WHERE id = ?`, [employeeId]).then(res => res[0]);
    if (!emp) throw new Error('Employee not found');

    // 1. Fetch current salary structure
    const struct = await payrollService.getSalaryStructure(employeeId);
    const monthlyGross = struct?.monthlyGross || (struct?.baseSalary ? struct.baseSalary : 50000);
    const basicPayMonthly = struct?.components?.find((c: any) => c.componentName?.toLowerCase().includes('basic'))?.amount || (monthlyGross * 0.5);

    // 2. Calculate Unpaid Salary for current partial month
    const exitDateObj = new Date(exitDate);
    const workedDaysInMonth = exitDateObj.getDate();
    const unpaidSalaryAmount = Math.round(monthlyGross * (workedDaysInMonth / 30));

    // 3. Calculate Leave Encashment
    const earnedLeaveBalance = await query(
      `SELECT balance FROM leave_balances WHERE employeeId = ? AND year = ? LIMIT 1`,
      [employeeId, exitDateObj.getFullYear()]
    ).then(res => res[0]?.balance || 12);

    const leaveEncashmentDays = Math.max(0, earnedLeaveBalance);
    const leaveEncashmentAmount = Math.round((basicPayMonthly / 30) * leaveEncashmentDays);

    // 4. Calculate Pending Expense Reimbursements
    const pendingExpenses = await query(
      `SELECT SUM(amount) as total FROM expense_claims WHERE employeeId = ? AND status = 'APPROVED'`,
      [employeeId]
    ).then(res => res[0]?.total || 0);

    // 5. Notice Period Shortfall Recovery
    const noticeShortfallDays = Math.max(0, noticePeriodDays - noticeServedDays);
    const noticeShortfallDeduction = Math.round((monthlyGross / 30) * noticeShortfallDays);

    // 6. Net Settlement Amount Calculation
    const totalEarnings = unpaidSalaryAmount + leaveEncashmentAmount + pendingExpenses + gratuityAmount;
    const totalDeductions = noticeShortfallDeduction + otherDeductions;
    const netSettlementAmount = Math.round(totalEarnings - totalDeductions);

    const fnfId = randomUUID();
    await execute(
      `INSERT INTO full_and_final_settlements (
        id, employeeId, organizationId, exitDate, resignationDate, noticePeriodDays,
        noticeServedDays, unpaidSalaryAmount, lopDeductionAmount, leaveEncashmentDays,
        leaveEncashmentAmount, reimbursementAmount, noticeShortfallDeduction,
        gratuityAmount, otherDeductions, netSettlementAmount, status, preparedBy, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?, 'DRAFT', ?, ?)`,
      [
        fnfId, employeeId, emp.organizationId || 'org-stackly', exitDate, resignationDate,
        noticePeriodDays, noticeServedDays, unpaidSalaryAmount, leaveEncashmentDays,
        leaveEncashmentAmount, pendingExpenses, noticeShortfallDeduction,
        gratuityAmount, otherDeductions, netSettlementAmount, preparedBy, new Date().toISOString()
      ]
    );

    logger.info(`[FnF] Created Full & Final Settlement for ${emp.name} (${employeeId}): Net ₹${netSettlementAmount}`);
    return this.getFnFSettlementById(fnfId);
  }

  static async getFnFSettlementById(fnfId: string) {
    return query(
      `SELECT fnf.*, e.name as employeeName, e.employeeCode, e.department, e.designation, e.joiningDate
       FROM full_and_final_settlements fnf
       JOIN employees e ON fnf.employeeId = e.id
       WHERE fnf.id = ?`,
      [fnfId]
    ).then(res => res[0]);
  }

  static async approveFnFSettlement(fnfId: string, approvedBy: string) {
    const fnf = await this.getFnFSettlementById(fnfId);
    if (!fnf) throw new Error('Full & Final Settlement record not found');

    await execute(
      `UPDATE full_and_final_settlements SET status = 'APPROVED', approvedBy = ? WHERE id = ?`,
      [approvedBy, fnfId]
    );

    // Transition employee status to RELIEVED / TERMINATED
    await execute(
      `UPDATE employees SET status = 'TERMINATED', exitDate = ? WHERE id = ?`,
      [fnf.exitDate, fnf.employeeId]
    );

    return this.getFnFSettlementById(fnfId);
  }

  static async listFnFSettlements(organizationId: string = 'org-stackly') {
    return query(
      `SELECT fnf.*, e.name as employeeName, e.employeeCode, e.department, e.designation
       FROM full_and_final_settlements fnf
       JOIN employees e ON fnf.employeeId = e.id
       WHERE fnf.organizationId = ?
       ORDER BY fnf.createdAt DESC`,
      [organizationId]
    );
  }
}

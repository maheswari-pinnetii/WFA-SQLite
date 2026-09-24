import { getDb, ORGANIZATION_ID } from '../../config/db.js';

export class LeaveService {
  /**
   * Fetch all leave balances for a specific employee.
   */
  async getEmployeeLeaveBalances(employeeId: string, year: number) {
    const db = getDb();
    const balances = db.prepare(`
      SELECT b.*, t.name, t.isPaid 
      FROM leave_balances b
      JOIN leave_types t ON b.leaveTypeId = t.id
      WHERE b.employeeId = ? AND b.year = ? AND b.organizationId = ?
    `).all(employeeId, year, ORGANIZATION_ID);
    return balances;
  }

  /**
   * Run a monthly accrual job (e.g., adding 1 Earned Leave per month)
   */
  async runMonthlyAccruals() {
    const db = getDb();
    const currentYear = new Date().getFullYear();
    
    // Example: Add 1.25 Earned Leave per month to all active employees
    const dbTransaction = db.transaction(() => {
      db.prepare(`
        UPDATE leave_balances
        SET allocated = allocated + 1.25
        WHERE leaveTypeId = 'lt-earned' 
        AND year = ? 
        AND organizationId = ?
      `).run(currentYear, ORGANIZATION_ID);
    });

    dbTransaction();
    return { success: true, message: 'Monthly accruals processed successfully' };
  }

  /**
   * Validate if an employee has enough leave balance for a request.
   */
  async validateLeaveRequest(employeeId: string, typeId: string, daysRequested: number, year: number) {
    const db = getDb();
    const balance = db.prepare(`
      SELECT * FROM leave_balances 
      WHERE employeeId = ? AND leaveTypeId = ? AND year = ?
    `).get(employeeId, typeId, year) as any;

    if (!balance) return { valid: false, reason: 'Leave balance record not found.' };

    const available = balance.allocated - balance.used;
    if (daysRequested > available) {
      return { valid: false, reason: `Insufficient balance. Requested: ${daysRequested}, Available: ${available}` };
    }

    return { valid: true };
  }
}

export const leaveService = new LeaveService();

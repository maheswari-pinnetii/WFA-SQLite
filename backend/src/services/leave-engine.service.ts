import { randomUUID } from 'crypto';
import { query, execute } from '../database/sqlite-cloud.js';
import { logger } from '../config/logger.js';

export const leaveEngineService = {

  /** ─── LEAVE TYPES ───────────────────────────────── */
  async getLeaveTypes(organizationId: string) {
    return query(
      `SELECT * FROM leave_types WHERE organizationId = ? ORDER BY name ASC`,
      [organizationId]
    );
  },

  async createLeaveType(
    organizationId: string,
    data: { name: string; description?: string; defaultDays: number; isPaid?: boolean }
  ) {
    const id = randomUUID();
    await execute(
      `INSERT INTO leave_types (id, organizationId, name, description, defaultDays, isPaid)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, organizationId, data.name, data.description || null, data.defaultDays, data.isPaid ? 1 : 0]
    );
    return { id };
  },

  /** ─── LEAVE BALANCES ────────────────────────────── */
  async getLeaveBalances(employeeId: string, organizationId: string, year?: number) {
    const yr = year || new Date().getFullYear();
    const rows = await query(
      `SELECT lb.*, lt.name as leaveTypeName, lt.isPaid
       FROM leave_balances lb
       JOIN leave_types lt ON lb.leaveTypeId = lt.id
       WHERE lb.employeeId = ? AND lb.organizationId = ? AND lb.year = ?`,
      [employeeId, organizationId, yr]
    );
    return rows;
  },

  async initializeBalances(employeeId: string, organizationId: string, year: number) {
    const leaveTypes = await this.getLeaveTypes(organizationId);
    const now = new Date().toISOString();

    for (const lt of leaveTypes as any[]) {
      const existing = await query(
        `SELECT 1 FROM leave_balances WHERE employeeId = ? AND leaveTypeId = ? AND year = ?`,
        [employeeId, lt.id, year]
      );
      if (existing.length === 0) {
        await execute(
          `INSERT INTO leave_balances (id, employeeId, leaveTypeId, year, allocated, used, organizationId)
           VALUES (?, ?, ?, ?, ?, 0, ?)`,
          [randomUUID(), employeeId, lt.id, year, lt.defaultDays, organizationId]
        );
      }
    }

    logger.info(`[LeaveEngine] Initialized balances for employee ${employeeId} year ${year}`);
  },

  async deductLeaveBalance(employeeId: string, leaveTypeId: string, days: number, organizationId: string) {
    const year = new Date().getFullYear();
    const balance = await query(
      `SELECT * FROM leave_balances WHERE employeeId = ? AND leaveTypeId = ? AND year = ? AND organizationId = ?`,
      [employeeId, leaveTypeId, year, organizationId]
    ).then(r => r[0]);

    if (!balance) {
      throw new Error('No leave balance record found for this employee and leave type');
    }

    const available = (balance as any).allocated - (balance as any).used;
    if (days > available) {
      throw new Error(`Insufficient leave balance. Available: ${available}, Requested: ${days}`);
    }

    await execute(
      `UPDATE leave_balances SET used = used + ? WHERE employeeId = ? AND leaveTypeId = ? AND year = ? AND organizationId = ?`,
      [days, employeeId, leaveTypeId, year, organizationId]
    );
    logger.info(`[LeaveEngine] Deducted ${days} days from employee ${employeeId}`);
  },

  async restoreLeaveBalance(employeeId: string, leaveTypeId: string, days: number, organizationId: string) {
    const year = new Date().getFullYear();
    await execute(
      `UPDATE leave_balances SET used = MAX(0, used - ?) WHERE employeeId = ? AND leaveTypeId = ? AND year = ? AND organizationId = ?`,
      [days, employeeId, leaveTypeId, year, organizationId]
    );
  },

  /** ─── HOLIDAYS ──────────────────────────────────── */
  async getHolidays(organizationId: string) {
    return query(
      `SELECT * FROM holidays WHERE organizationId = ? ORDER BY date ASC`,
      [organizationId]
    );
  },

  async addHoliday(organizationId: string, data: { name: string; date: string; type?: string }) {
    const id = randomUUID();
    await execute(
      `INSERT INTO holidays (id, organizationId, name, date, type) VALUES (?, ?, ?, ?, ?)`,
      [id, organizationId, data.name, data.date, data.type || 'PUBLIC']
    );
    return { id };
  },

  /** ─── BUSINESS DAYS CALCULATION ─────────────────── */
  async calculateWorkingDays(startDate: string, endDate: string, organizationId: string): Promise<number> {
    const holidays = await this.getHolidays(organizationId) as any[];
    const holidayDates = new Set(holidays.map((h: any) => h.date.split('T')[0]));

    const start = new Date(startDate);
    const end = new Date(endDate);
    let count = 0;
    const cursor = new Date(start);

    while (cursor <= end) {
      const dayOfWeek = cursor.getDay();
      const dateStr = cursor.toISOString().split('T')[0];
      // Skip weekends (0=Sunday, 6=Saturday) and holidays
      if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidayDates.has(dateStr)) {
        count++;
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    return count;
  }
};

import { randomUUID } from 'crypto';
import { query, execute } from '../database/sqlite-cloud.js';
import { logger } from '../config/logger.js';
import { jobScheduler } from './jobScheduler.service.js';

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
    let balance = await query(
      `SELECT * FROM leave_balances WHERE employeeId = ? AND (leaveTypeId = ? OR leaveTypeId IN (SELECT id FROM leave_types WHERE name = ?)) AND year = ? AND organizationId = ?`,
      [employeeId, leaveTypeId, leaveTypeId, year, organizationId]
    ).then(r => r[0]);

    if (!balance) {
      await this.initializeBalances(employeeId, organizationId, year);
      balance = await query(
        `SELECT * FROM leave_balances WHERE employeeId = ? AND (leaveTypeId = ? OR leaveTypeId IN (SELECT id FROM leave_types WHERE name = ?)) AND year = ? AND organizationId = ?`,
        [employeeId, leaveTypeId, leaveTypeId, year, organizationId]
      ).then(r => r[0]);
    }

    if (!balance) {
      return; // If balance still not present, bypass strict deduction check for dynamic types
    }

    const available = (balance as any).allocated - (balance as any).used;
    // Update used days
    await execute(
      `UPDATE leave_balances SET used = used + ? WHERE employeeId = ? AND (leaveTypeId = ? OR leaveTypeId IN (SELECT id FROM leave_types WHERE name = ?)) AND year = ? AND organizationId = ?`,
      [days, employeeId, leaveTypeId, leaveTypeId, year, organizationId]
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
    return { id, organizationId, ...data };
  },

  async deleteHoliday(id: string, organizationId: string) {
    await execute(
      `DELETE FROM holidays WHERE id = ? AND organizationId = ?`,
      [id, organizationId]
    );
  },

  async getWorkConfigs(organizationId: string) {
    return query(
      `SELECT * FROM work_configurations WHERE organizationId = ? ORDER BY createdAt DESC`,
      [organizationId]
    );
  },

  async createWorkConfig(organizationId: string, data: any) {
    const id = randomUUID();
    const now = new Date().toISOString();
    await execute(
      `INSERT INTO work_configurations (id, organizationId, name, workMode, weeklyHours, flexibleHours, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, organizationId, data.name, data.workMode || 'HYBRID', data.weeklyHours || 40, data.flexibleHours ? 1 : 0, now, now]
    );
    return { id, organizationId, ...data };
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
  },

  /** ─── LEAVE REQUESTS ────────────────────────────── */
  async getLeaveRequests(filters: { employeeId?: string; organizationId: string; status?: string }) {
    let sql = `SELECT lr.*, e.name as employeeName, lt.name as leaveTypeName 
               FROM leaverequests lr
               JOIN employees e ON lr.employeeId = e.id
               JOIN leave_types lt ON lr.type = lt.id
               WHERE lr.organizationId = ?`;
    const params: any[] = [filters.organizationId];

    if (filters.employeeId) {
      sql += ` AND lr.employeeId = ?`;
      params.push(filters.employeeId);
    }
    if (filters.status) {
      sql += ` AND lr.status = ?`;
      params.push(filters.status);
    }
    
    sql += ` ORDER BY lr.createdAt DESC`;
    return query(sql, params);
  },

  async createLeaveRequest(data: {
    organizationId: string;
    employeeId: string;
    leaveTypeId: string;
    startDate: string;
    endDate: string;
    isHalfDay?: boolean;
    halfDayPeriod?: string;
    reason?: string;
  }) {
    // 1. Check for Blackout Periods
    const blackoutPeriods = await query(
      `SELECT * FROM leave_blackout_periods 
       WHERE organizationId = ? 
       AND (
         (startDate <= ? AND endDate >= ?) OR
         (startDate <= ? AND endDate >= ?) OR
         (startDate >= ? AND endDate <= ?)
       )`,
      [
        data.organizationId,
        data.endDate, data.startDate, 
        data.endDate, data.startDate,
        data.startDate, data.endDate
      ]
    ) as any[];

    if (blackoutPeriods.length > 0) {
      const emp = await query(`SELECT department FROM employees WHERE id = ?`, [data.employeeId]).then(r => r[0]) as any;
      for (const bp of blackoutPeriods) {
        if (!bp.affectedDepartments) {
          throw new Error(`Cannot request leave during blackout period: ${bp.name}`);
        } else {
          try {
            const depts = JSON.parse(bp.affectedDepartments);
            if (depts.includes(emp.department)) {
              throw new Error(`Cannot request leave during blackout period: ${bp.name}`);
            }
          } catch (e) {
            // If parsing fails, assume it applies
            throw new Error(`Cannot request leave during blackout period: ${bp.name}`);
          }
        }
      }
    }

    const id = randomUUID();
    const now = new Date().toISOString();
    await execute(
      `INSERT INTO leaverequests (
        id, organizationId, employeeId, type, 
        startDate, endDate, isHalfDay, halfDayPeriod, 
        status, reason, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, ?, ?)`,
      [
        id, data.organizationId, data.employeeId, data.leaveTypeId,
        data.startDate, data.endDate, data.isHalfDay ? 1 : 0, data.halfDayPeriod || null,
        data.reason || null, now, now
      ]
    );
    return this.getLeaveRequest(id, data.organizationId);
  },

  async getLeaveRequest(id: string, organizationId: string) {
    const rows = await query(
      `SELECT lr.*, e.name as employeeName, lt.name as leaveTypeName 
       FROM leaverequests lr
       JOIN employees e ON lr.employeeId = e.id
       LEFT JOIN leave_types lt ON lr.type = lt.id OR lt.name = lr.type
       WHERE lr.id = ? AND lr.organizationId = ?`,
      [id, organizationId]
    );
    return rows[0];
  },

  async updateLeaveRequestStatus(id: string, organizationId: string, status: string, approvedBy: string, comment?: string) {
    const request = await this.getLeaveRequest(id, organizationId);
    if (!request) throw new Error('Leave request not found');

    const now = new Date().toISOString();
    await execute(
      `UPDATE leaverequests 
       SET status = ?, reviewedBy = ?, reviewComment = ?, updatedAt = ? 
       WHERE id = ? AND organizationId = ?`,
      [status, approvedBy, comment || null, now, id, organizationId]
    );

    // Automatic leave balance deduction if APPROVED
    if (status === 'APPROVED' && request.status !== 'APPROVED') {
      let daysToDeduct = 1;
      if (!request.isHalfDay) {
        daysToDeduct = await this.calculateWorkingDays(request.startDate, request.endDate, organizationId);
      } else {
        daysToDeduct = 0.5;
      }
      
      try {
        await this.deductLeaveBalance(request.employeeId, request.type, daysToDeduct, organizationId);
      } catch (err: any) {
        logger.error(`[LeaveEngine] Failed to deduct leave balance for request ${id}: ${err.message}`);
        // Consider reverting status or handling error in production
      }
    } else if (status === 'REJECTED' && request.status === 'APPROVED') {
        // Handle restoration if previously approved then rejected (edge case)
        let daysToRestore = 1;
        if (!request.isHalfDay) {
          daysToRestore = await this.calculateWorkingDays(request.startDate, request.endDate, organizationId);
        } else {
          daysToRestore = 0.5;
        }
        await this.restoreLeaveBalance(request.employeeId, request.type, daysToRestore, organizationId);
    }

    return this.getLeaveRequest(id, organizationId);
  },

  /** ─── AUTOMATION ────────────────────────────────── */
  async runMonthlyAccruals() {
    logger.info('[LeaveEngine] Running dynamic monthly leave accruals based on policies');
    const year = new Date().getFullYear();
    
    // Fetch all active policies
    const policies = await query(`SELECT * FROM leave_policies`) as any[];
    if (policies.length === 0) {
      logger.info('[LeaveEngine] No leave policies found, skipping accruals.');
      return;
    }

    const activeEmployees = await query(
      `SELECT id, organizationId FROM employees WHERE status = 'ACTIVE'`
    ) as any[];

    let processed = 0;
    for (const emp of activeEmployees) {
      const orgPolicies = policies.filter(p => p.organizationId === emp.organizationId);
      for (const policy of orgPolicies) {
        if (policy.accrualRate > 0) {
          // Initialize balance if not present
          await this.initializeBalances(emp.id, emp.organizationId, year);
          
          await execute(
            `UPDATE leave_balances 
             SET allocated = allocated + ? 
             WHERE employeeId = ? AND leaveTypeId = ? AND year = ?`,
            [policy.accrualRate, emp.id, policy.leaveTypeId, year]
          );
        }
      }
      processed++;
    }
    logger.info(`[LeaveEngine] Completed monthly leave accruals for ${processed} employees.`);
  }
};

// Register Job
jobScheduler.registerHandler('MONTHLY_LEAVE_ACCRUAL', async () => {
  await leaveEngineService.runMonthlyAccruals();
});

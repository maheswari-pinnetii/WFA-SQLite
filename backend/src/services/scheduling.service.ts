import { randomUUID } from 'crypto';
import { query, execute } from '../database/sqlite-cloud.js';
import { logger } from '../config/logger.js';

export const schedulingService = {

  // ─── WORK SCHEDULES ────────────────────────────────────────────────────────

  async getSchedule(employeeId: string, organizationId: string) {
    return query(
      `SELECT * FROM work_schedules WHERE employeeId = ? AND organizationId = ? ORDER BY dayOfWeek ASC`,
      [employeeId, organizationId]
    );
  },

  async setSchedule(
    employeeId: string,
    organizationId: string,
    days: Array<{ dayOfWeek: number; startTime: string; endTime: string }>
  ) {
    // Replace all existing schedule entries for this employee
    await execute(
      `DELETE FROM work_schedules WHERE employeeId = ? AND organizationId = ?`,
      [employeeId, organizationId]
    );
    for (const day of days) {
      await execute(
        `INSERT INTO work_schedules (id, employeeId, dayOfWeek, startTime, endTime, organizationId)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [randomUUID(), employeeId, day.dayOfWeek, day.startTime, day.endTime, organizationId]
      );
    }
    logger.info(`[Scheduling] Set work schedule for employee ${employeeId}`);
  },

  // ─── SHIFT ASSIGNMENTS ─────────────────────────────────────────────────────

  async getShiftAssignments(employeeId: string, organizationId: string) {
    return query(
      `SELECT sa.*, s.name as shiftName, s.startTime, s.endTime
       FROM shift_assignments sa
       JOIN shifts s ON sa.shiftId = s.id
       WHERE sa.employeeId = ? AND sa.organizationId = ?
       ORDER BY sa.startDate DESC`,
      [employeeId, organizationId]
    );
  },

  async assignShift(data: {
    employeeId: string;
    shiftId: string;
    startDate: string;
    endDate?: string;
    organizationId: string;
  }) {
    const id = randomUUID();
    await execute(
      `INSERT INTO shift_assignments (id, employeeId, shiftId, startDate, endDate, organizationId)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, data.employeeId, data.shiftId, data.startDate, data.endDate || null, data.organizationId]
    );
    logger.info(`[Scheduling] Assigned shift ${data.shiftId} to employee ${data.employeeId}`);
    return { id };
  },

  // ─── OVERTIME RULES ────────────────────────────────────────────────────────

  async getOvertimeRules(organizationId: string) {
    return query(
      `SELECT * FROM overtime_rules WHERE organizationId = ? ORDER BY thresholdHours ASC`,
      [organizationId]
    );
  },

  async createOvertimeRule(organizationId: string, data: {
    ruleName: string;
    thresholdHours: number;
    multiplier: number;
  }) {
    const id = randomUUID();
    await execute(
      `INSERT INTO overtime_rules (id, organizationId, ruleName, thresholdHours, multiplier)
       VALUES (?, ?, ?, ?, ?)`,
      [id, organizationId, data.ruleName, data.thresholdHours, data.multiplier]
    );
    return { id };
  },

  // ─── OVERTIME RECORDS ──────────────────────────────────────────────────────

  async getOvertimeRecords(organizationId: string, filters?: { employeeId?: string; status?: string }) {
    let sql = `SELECT ot.*, e.name as employeeName
               FROM overtime_records ot
               JOIN employees e ON ot.employeeId = e.id
               WHERE ot.organizationId = ?`;
    const params: any[] = [organizationId];
    if (filters?.employeeId) { sql += ` AND ot.employeeId = ?`; params.push(filters.employeeId); }
    if (filters?.status) { sql += ` AND ot.status = ?`; params.push(filters.status); }
    sql += ` ORDER BY ot.date DESC`;
    return query(sql, params);
  },

  async recordOvertime(data: {
    employeeId: string;
    date: string;
    hours: number;
    organizationId: string;
  }) {
    const id = randomUUID();
    await execute(
      `INSERT INTO overtime_records (id, employeeId, date, hours, status, organizationId)
       VALUES (?, ?, ?, ?, 'PENDING', ?)`,
      [id, data.employeeId, data.date, data.hours, data.organizationId]
    );
    return { id };
  },

  async approveOvertime(recordId: string, approverId: string, organizationId: string) {
    await execute(
      `UPDATE overtime_records SET status = 'APPROVED', approvedBy = ? WHERE id = ? AND organizationId = ?`,
      [approverId, recordId, organizationId]
    );
  },

  async rejectOvertime(recordId: string, organizationId: string) {
    await execute(
      `UPDATE overtime_records SET status = 'REJECTED' WHERE id = ? AND organizationId = ?`,
      [recordId, organizationId]
    );
  },

  // ─── OT CALCULATION (payroll integration) ──────────────────────────────────

  async calculateOvertimePay(
    employeeId: string,
    organizationId: string,
    periodStart: string,
    periodEnd: string,
    hourlyRate: number
  ) {
    const records = await query(
      `SELECT * FROM overtime_records
       WHERE employeeId = ? AND organizationId = ? AND status = 'APPROVED'
       AND date BETWEEN ? AND ?`,
      [employeeId, organizationId, periodStart, periodEnd]
    ) as any[];

    const rules = await this.getOvertimeRules(organizationId) as any[];

    let totalOvertimePay = 0;
    for (const record of records) {
      // Find applicable rule (highest threshold that still applies)
      const rule = rules
        .filter((r: any) => record.hours >= r.thresholdHours)
        .sort((a: any, b: any) => b.thresholdHours - a.thresholdHours)[0];

      const multiplier = rule ? rule.multiplier : 1.5; // default 1.5x
      totalOvertimePay += record.hours * hourlyRate * multiplier;
    }

    logger.info(`[Scheduling] OT pay for ${employeeId}: ${periodStart}→${periodEnd} = ${totalOvertimePay}`);
    return {
      employeeId,
      periodStart,
      periodEnd,
      totalOvertimeHours: records.reduce((s: number, r: any) => s + r.hours, 0),
      totalOvertimePay
    };
  }
};

import { query, execute } from '../database/sqlite-cloud.js';
import { logAudit } from '../config/db.js';
import crypto from 'crypto';

const uuid = () => crypto.randomUUID();
const now = () => new Date().toISOString();

function getMonthRange(month: string): { start: string; end: string; workingDays: number } {
  const [y, m] = month.split('-').map(Number);
  const start = `${month}-01`;
  const endDate = new Date(y, m, 0);
  const end = `${month}-${String(endDate.getDate()).padStart(2, '0')}`;
  let workingDays = 0;
  const cur = new Date(y, m - 1, 1);
  while (cur.getMonth() === m - 1) {
    const d = cur.getDay();
    if (d !== 0 && d !== 6) workingDays++;
    cur.setDate(cur.getDate() + 1);
  }
  return { start, end, workingDays };
}

function hoursFromRecord(rec: any): number {
  if (rec.checkInTime && rec.checkOutTime) {
    try {
      const [ih, im] = rec.checkInTime.split(':').map(Number);
      const [oh, om] = rec.checkOutTime.split(':').map(Number);
      const inH = ih + im / 60;
      const outH = oh + om / 60;
      return outH > inH ? outH - inH : 0;
    } catch { return 0; }
  }
  return 0;
}

// ─── Shifts CRUD ─────────────────────────────────────────────────────────────

export async function getShifts(orgId: string): Promise<any[]> {
  try {
    return await query(`SELECT * FROM shifts WHERE organizationId = ? AND (isActive IS NULL OR isActive = 1) ORDER BY name`, [orgId]);
  } catch {
    return await query(`SELECT * FROM shifts WHERE organizationId = ? ORDER BY name`, [orgId]);
  }
}

export async function getShiftById(shiftId: string, orgId: string): Promise<any | null> {
  const rows = await query(`SELECT * FROM shifts WHERE id = ? AND organizationId = ?`, [shiftId, orgId]);
  return rows[0] || null;
}

export async function createShift(orgId: string, data: any, actorId: string): Promise<any> {
  const { name, shiftType = 'fixed', startTime, endTime,
          breakDurationMinutes = data.breakDuration || 60,
          gracePeriodMinutes = 15, workHoursPerDay = 8,
          weekOffDays = data.workDays ? ['Saturday', 'Sunday'] : ['Saturday', 'Sunday'],
          isFlexible = false } = data;
  if (!name || !startTime || !endTime) throw new Error('name, startTime, endTime are required.');
  const TIME_REGEX = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
  if (!TIME_REGEX.test(startTime) || !TIME_REGEX.test(endTime)) {
    throw new Error('Invalid time format. Expected HH:MM in 24-hour format.');
  }
  const id = uuid();
  try {
    await execute(
      `INSERT INTO shifts (id, organizationId, name, shiftType, startTime, endTime,
        breakDurationMinutes, gracePeriodMinutes, workHoursPerDay, weekOffDays, isFlexible, isActive, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
      [id, orgId, name, shiftType, startTime, endTime, breakDurationMinutes, gracePeriodMinutes,
       workHoursPerDay, JSON.stringify(weekOffDays), isFlexible ? 1 : 0, now(), now()]
    );
  } catch {
    await execute(
      `INSERT INTO shifts (id, organizationId, name, startTime, endTime, gracePeriodMinutes, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, orgId, name, startTime, endTime, gracePeriodMinutes, now(), now()]
    );
  }
  logAudit(actorId, 'SHIFT_CREATED', `Created shift "${name}"`, orgId);
  return getShiftById(id, orgId);
}

export async function updateShift(shiftId: string, orgId: string, data: any, actorId: string): Promise<any> {
  const existing = await getShiftById(shiftId, orgId);
  if (!existing) return null;
  const fields: string[] = [];
  const vals: any[] = [];
  const allowed = ['name', 'startTime', 'endTime', 'gracePeriodMinutes'];
  for (const k of allowed) {
    if (data[k] !== undefined) { fields.push(`${k} = ?`); vals.push(data[k]); }
  }
  if (!fields.length && data.breakDuration !== undefined) {
    fields.push('name = ?');
    vals.push(existing.name);
  }
  if (!fields.length) throw new Error('No fields to update.');
  fields.push('updatedAt = ?');
  vals.push(now(), shiftId, orgId);
  try {
    await execute(`UPDATE shifts SET ${fields.join(', ')} WHERE id = ? AND organizationId = ?`, vals);
  } catch {
    await execute(`UPDATE shifts SET name = ?, updatedAt = ? WHERE id = ? AND organizationId = ?`, [existing.name, now(), shiftId, orgId]);
  }
  logAudit(actorId, 'SHIFT_UPDATED', `Updated shift ${shiftId}`, orgId);
  return getShiftById(shiftId, orgId);
}

export async function deleteShift(shiftId: string, orgId: string, actorId: string): Promise<void> {
  try {
    await execute(`UPDATE shifts SET isActive = 0, updatedAt = ? WHERE id = ? AND organizationId = ?`, [now(), shiftId, orgId]);
  } catch {
    await execute(`DELETE FROM shifts WHERE id = ? AND organizationId = ?`, [shiftId, orgId]);
  }
  logAudit(actorId, 'SHIFT_DELETED', `Deactivated shift ${shiftId}`, orgId);
}

// ─── Shift Assignments ────────────────────────────────────────────────────────

export async function assignShift(orgId: string, employeeId: string, shiftId: string, effectiveFrom: string, actorId: string): Promise<any> {
  await execute(
    `UPDATE employee_shift_assignments SET effectiveTo = ? WHERE employeeId = ? AND organizationId = ? AND effectiveTo IS NULL`,
    [effectiveFrom, employeeId, orgId]
  );
  const id = uuid();
  await execute(
    `INSERT INTO employee_shift_assignments (id, organizationId, employeeId, shiftId, effectiveFrom, assignedBy, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, orgId, employeeId, shiftId, effectiveFrom, actorId, now()]
  );
  logAudit(actorId, 'SHIFT_ASSIGNED', `Assigned shift ${shiftId} to employee ${employeeId}`, orgId);
  return { id, employeeId, shiftId, effectiveFrom };
}

export async function getEmployeeCurrentShift(employeeId: string, orgId: string): Promise<any | null> {
  const rows = await query(
    `SELECT sa.*, s.name, s.startTime, s.endTime, s.gracePeriodMinutes, s.workHoursPerDay, s.weekOffDays
     FROM employee_shift_assignments sa
     LEFT JOIN shifts s ON s.id = sa.shiftId
     WHERE sa.employeeId = ? AND sa.organizationId = ? AND sa.effectiveTo IS NULL
     ORDER BY sa.effectiveFrom DESC LIMIT 1`,
    [employeeId, orgId]
  );
  return rows[0] || null;
}

// ─── Org-wide Live Attendance Status ─────────────────────────────────────────

export async function getOrgLiveStatus(orgId: string): Promise<any> {
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  const records = await query(
    `SELECT ar.employeeId, ar.status, ar.checkInTime, ar.checkOutTime, ar.date,
            e.name, e.department, e.designation, e.team
     FROM attendancerecords ar
     LEFT JOIN employees e ON e.id = ar.employeeId
     WHERE ar.organizationId = ? AND ar.date = ?`,
    [orgId, today]
  );
  const totalRows = await query(
    `SELECT COUNT(*) as cnt FROM employees WHERE organizationId = ? AND status = 'ACTIVE'`,
    [orgId]
  );
  const total = totalRows[0]?.cnt ?? 0;
  const present = (records as any[]).filter(r => ['Present', 'Remote', 'PRESENT', 'REMOTE'].includes(r.status)).length;
  const onBreak = (records as any[]).filter(r => ['Break', 'ON_BREAK'].includes(r.status)).length;
  const checkedOut = (records as any[]).filter(r => ['Checked Out', 'CHECKED_OUT'].includes(r.status)).length;
  const late = (records as any[]).filter(r => ['Late', 'LATE'].includes(r.status)).length;
  const absent = Math.max(0, total - present - onBreak - checkedOut - late);
  return {
    date: today, total, present, onBreak, checkedOut, late, absent,
    attendanceRate: total > 0 ? Math.round(((present + onBreak + checkedOut + late) / total) * 100) : 0,
    records,
  };
}

// ─── Monthly Summary ─────────────────────────────────────────────────────────

export async function computeMonthlySummary(employeeId: string, orgId: string, month: string): Promise<any> {
  const { start, end, workingDays } = getMonthRange(month);
  const records = await query(
    `SELECT * FROM attendancerecords WHERE employeeId = ? AND organizationId = ? AND date >= ? AND date <= ?`,
    [employeeId, orgId, start, end]
  );
  let presentDays = 0, lateDays = 0, halfDays = 0, totalHours = 0, overtimeHours = 0;
  for (const r of records as any[]) {
    const status = (r.status || '').toUpperCase();
    const hours = hoursFromRecord(r);
    if (['PRESENT', 'REMOTE', 'CHECKED OUT', 'CHECKED_OUT'].includes(status)) {
      hours < 4 ? halfDays++ : presentDays++;
    } else if (status === 'LATE') {
      lateDays++;
      hours < 4 ? halfDays++ : presentDays++;
    }
    totalHours += hours;
    if (hours > 9) overtimeHours += hours - 9;
  }
  const effectivePresent = presentDays + lateDays + halfDays * 0.5;
  const absentDays = Math.max(0, workingDays - effectivePresent);
  const lopDays = absentDays;
  const roundedHours = Math.round(totalHours * 10) / 10;
  const roundedOT = Math.round(overtimeHours * 10) / 10;
  const roundedAbsent = Math.round(absentDays);

  const existing = await query(
    `SELECT id FROM attendance_monthly_summary WHERE employeeId = ? AND month = ?`,
    [employeeId, month]
  );
  if (existing.length > 0) {
    await query(
      `UPDATE attendance_monthly_summary SET presentDays=?, absentDays=?, lateDays=?, halfDays=?,
       lopDays=?, totalHours=?, overtimeHours=?, workingDays=?, status='COMPUTED', computedAt=?, updatedAt=?
       WHERE employeeId = ? AND month = ?`,
      [presentDays, roundedAbsent, lateDays, halfDays, lopDays, roundedHours, roundedOT, workingDays, now(), now(), employeeId, month]
    );
  } else {
    const id = `ams-${employeeId.slice(0, 8)}-${month}`;
    await query(
      `INSERT INTO attendance_monthly_summary
       (id, organizationId, employeeId, month, presentDays, absentDays, lateDays, halfDays,
        lopDays, totalHours, overtimeHours, workingDays, status, computedAt, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'COMPUTED', ?, ?, ?)`,
      [id, orgId, employeeId, month, presentDays, roundedAbsent, lateDays, halfDays,
       lopDays, roundedHours, roundedOT, workingDays, now(), now(), now()]
    );
  }
  return { employeeId, month, presentDays, absentDays: roundedAbsent, lateDays, halfDays,
           lopDays, totalHours: roundedHours, overtimeHours: roundedOT, workingDays };
}

export async function getMonthlySummary(employeeId: string, orgId: string, month: string): Promise<any> {
  const rows = await query(
    `SELECT * FROM attendance_monthly_summary WHERE employeeId = ? AND organizationId = ? AND month = ?`,
    [employeeId, orgId, month]
  );
  return rows[0] || computeMonthlySummary(employeeId, orgId, month);
}

export async function getOrgMonthlySummary(orgId: string, month: string): Promise<any[]> {
  return query(
    `SELECT ams.*, e.name, e.department, e.designation, e.team
     FROM attendance_monthly_summary ams
     LEFT JOIN employees e ON e.id = ams.employeeId
     WHERE ams.organizationId = ? AND ams.month = ?
     ORDER BY e.department, e.name`,
    [orgId, month]
  );
}

export async function getEmployeeMonthlyDetail(employeeId: string, orgId: string, month: string): Promise<any> {
  const { start, end } = getMonthRange(month);
  const [summary, records] = await Promise.all([
    getMonthlySummary(employeeId, orgId, month),
    query(
      `SELECT * FROM attendancerecords WHERE employeeId = ? AND organizationId = ? AND date >= ? AND date <= ? ORDER BY date ASC`,
      [employeeId, orgId, start, end]
    ),
  ]);
  return { summary, records };
}

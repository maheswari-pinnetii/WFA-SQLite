import { ORGANIZATION_ID } from '../../config/db.js';
import { query, execute } from '../../database/sqlite-cloud.js';

import crypto from 'crypto';
import { workflowService } from '../core/workflow.service.js';

export class TimesheetService {
  async getProjects() {
    return await query(`SELECT * FROM projects WHERE organizationId = ? AND status = 'ACTIVE'`, [ORGANIZATION_ID]);
  }

  async getMyTimesheets(employeeId: string) {
    return await query(`
      SELECT * FROM timesheets 
      WHERE employeeId = ? AND organizationId = ? 
      ORDER BY startDate DESC
    `, [employeeId, ORGANIZATION_ID]);
  }

  async getTimesheetById(id: string, employeeId: string) {
    const rows = await query(`
      SELECT * FROM timesheets WHERE id = ? AND employeeId = ? AND organizationId = ?
    `, [id, employeeId, ORGANIZATION_ID]);
    const timesheet = rows[0];

    if (!timesheet) return null;

    const entries = await query(`
      SELECT e.*, p.name as projectName 
      FROM timesheet_entries e
      LEFT JOIN projects p ON e.projectId = p.id
      WHERE e.timesheetId = ?
    `, [id]);

    return { ...timesheet, entries };
  }

  async saveTimesheet(employeeId: string, data: any) {
    const nowStr = new Date().toISOString();
    let timesheetId = data.id;

    if (!timesheetId) {
      timesheetId = `ts-${crypto.randomUUID()}`;
      await execute(`
        INSERT INTO timesheets (id, employeeId, startDate, endDate, status, totalHours, organizationId, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [timesheetId, employeeId, data.startDate, data.endDate, data.status || 'DRAFT', data.totalHours || 0, ORGANIZATION_ID, nowStr, nowStr]);
    } else {
      await execute(`
        UPDATE timesheets SET totalHours = ?, status = ?, updatedAt = ?
        WHERE id = ? AND employeeId = ?
      `, [data.totalHours || 0, data.status || 'DRAFT', nowStr, timesheetId, employeeId]);

      // Clear old entries
      await execute(`DELETE FROM timesheet_entries WHERE timesheetId = ?`, [timesheetId]);
    }

    // Insert new entries
    if (data.entries && data.entries.length > 0) {
      for (const entry of data.entries) {
        const entryId = `tse-${crypto.randomUUID()}`;
        await execute(`
          INSERT INTO timesheet_entries (id, timesheetId, projectId, taskId, date, hours, description)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [entryId, timesheetId, entry.projectId, entry.taskId || null, entry.date, entry.hours, entry.description || '']);
      }
    }

    // If submitting, trigger workflow
    if (data.status === 'PENDING') {
      const workflowRows = await query(`SELECT id FROM approval_workflows WHERE entityType = 'TIMESHEET'`);
      const workflow = workflowRows[0];
      if (workflow) {
        await workflowService.createRequest({
          workflowId: workflow.id,
          entityId: timesheetId,
          requesterId: employeeId
        });
      }
    }

    return { success: true, timesheetId };
  }
}

export const timesheetService = new TimesheetService();

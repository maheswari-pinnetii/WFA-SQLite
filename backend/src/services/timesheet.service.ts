import { getDb, ORGANIZATION_ID } from '../config/db.js';
import { query } from '../database/sqlite-cloud.js';
import crypto from 'crypto';
import { workflowService } from './workflow.service.js';

export class TimesheetService {
  async getProjects() {
    const db = getDb();
    return db.prepare(`SELECT * FROM projects WHERE organizationId = ? AND status = 'ACTIVE'`).all(ORGANIZATION_ID);
  }

  async getMyTimesheets(employeeId: string) {
    const db = getDb();
    return db.prepare(`
      SELECT * FROM timesheets 
      WHERE employeeId = ? AND organizationId = ? 
      ORDER BY startDate DESC
    `).all(employeeId, ORGANIZATION_ID);
  }

  async getTimesheetById(id: string, employeeId: string) {
    const db = getDb();
    const timesheet = db.prepare(`
      SELECT * FROM timesheets WHERE id = ? AND employeeId = ? AND organizationId = ?
    `).get(id, employeeId, ORGANIZATION_ID);

    if (!timesheet) return null;

    const entries = db.prepare(`
      SELECT e.*, p.name as projectName 
      FROM timesheet_entries e
      LEFT JOIN projects p ON e.projectId = p.id
      WHERE e.timesheetId = ?
    `).all(id);

    return { ...timesheet, entries };
  }

  async saveTimesheet(employeeId: string, data: any) {
    const db = getDb();
    const nowStr = new Date().toISOString();
    let timesheetId = data.id;

    // Start Transaction
    const transaction = db.transaction(() => {
      // 1. Create or Update Timesheet
      if (!timesheetId) {
        timesheetId = `ts-${crypto.randomUUID()}`;
        db.prepare(`
          INSERT INTO timesheets (id, employeeId, startDate, endDate, status, totalHours, organizationId, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(timesheetId, employeeId, data.startDate, data.endDate, data.status || 'DRAFT', data.totalHours || 0, ORGANIZATION_ID, nowStr, nowStr);
      } else {
        db.prepare(`
          UPDATE timesheets SET totalHours = ?, status = ?, updatedAt = ?
          WHERE id = ? AND employeeId = ?
        `).run(data.totalHours || 0, data.status || 'DRAFT', nowStr, timesheetId, employeeId);

        // Clear old entries
        db.prepare(`DELETE FROM timesheet_entries WHERE timesheetId = ?`).run(timesheetId);
      }

      // 2. Insert new entries
      if (data.entries && data.entries.length > 0) {
        const insertEntry = db.prepare(`
          INSERT INTO timesheet_entries (id, timesheetId, projectId, taskId, date, hours, description)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        for (const entry of data.entries) {
          const entryId = `tse-${crypto.randomUUID()}`;
          insertEntry.run(entryId, timesheetId, entry.projectId, entry.taskId || null, entry.date, entry.hours, entry.description || '');
        }
      }
    });

    transaction();

    // 3. If submitting, trigger workflow
    if (data.status === 'PENDING') {
      const workflow = await query(`SELECT id FROM approval_workflows WHERE entityType = 'TIMESHEET'`).then((res: any[]) => res[0]);
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

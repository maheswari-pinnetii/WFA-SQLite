import { randomUUID } from 'crypto';
import { query, execute } from '../database/sqlite-cloud.js';
import { logger } from '../config/logger.js';

type LifecycleStage =
  | 'ONBOARDING'
  | 'PROBATION'
  | 'CONFIRMED'
  | 'PROMOTION'
  | 'TRANSFER'
  | 'RESIGNATION'
  | 'OFFBOARDING'
  | 'TERMINATED'
  | 'RETIRED';

export const employeeLifecycleService = {

  /** ─── STATUS TRANSITIONS ─────────────────────────── */
  async transitionStatus(
    employeeId: string,
    newStatus: LifecycleStage,
    opts: { reason?: string; effectiveDate?: string; changedBy: string; organizationId: string }
  ) {
    const now = new Date().toISOString();
    const effectiveDate = opts.effectiveDate || now;

    // 1. Insert status history record
    await execute(
      `INSERT INTO employee_status_history (id, employeeId, status, effectiveDate, reason, organizationId)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [randomUUID(), employeeId, newStatus, effectiveDate, opts.reason || null, opts.organizationId]
    );

    // 2. Update employee table
    await execute(
      `UPDATE employees SET status = ?, updatedAt = ? WHERE id = ? AND organizationId = ?`,
      [newStatus, now, employeeId, opts.organizationId]
    );

    // 3. Audit log
    await execute(
      `INSERT INTO audit_logs (id, timestamp, employeeId, action, details, organizationId, companyId, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [randomUUID(), now, opts.changedBy, `EMPLOYEE_STATUS_CHANGE`, JSON.stringify({ employeeId, newStatus, reason: opts.reason }), opts.organizationId, opts.organizationId, now, now]
    );

    logger.info(`[Lifecycle] Employee ${employeeId} transitioned to ${newStatus}`);
    return { employeeId, status: newStatus, effectiveDate };
  },

  /** ─── FIELD-LEVEL HISTORY ───────────────────────── */
  async recordFieldChange(
    employeeId: string,
    fieldChanged: string,
    oldValue: string | null,
    newValue: string,
    changedBy: string,
    organizationId: string
  ) {
    const now = new Date().toISOString();
    await execute(
      `INSERT INTO employee_history (id, employeeId, fieldChanged, oldValue, newValue, changedBy, changedAt, organizationId)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [randomUUID(), employeeId, fieldChanged, oldValue, newValue, changedBy, now, organizationId]
    );
  },

  /** ─── GET HISTORY ───────────────────────────────── */
  async getStatusHistory(employeeId: string, organizationId: string) {
    return query(
      `SELECT * FROM employee_status_history WHERE employeeId = ? AND organizationId = ? ORDER BY effectiveDate DESC`,
      [employeeId, organizationId]
    );
  },

  async getFieldHistory(employeeId: string, organizationId: string) {
    return query(
      `SELECT * FROM employee_history WHERE employeeId = ? AND organizationId = ? ORDER BY changedAt DESC`,
      [employeeId, organizationId]
    );
  },

  /** ─── DOCUMENTS ─────────────────────────────────── */
  async addDocument(
    employeeId: string,
    doc: { documentType: string; documentUrl: string; metadata?: string; uploadedBy: string; organizationId: string }
  ) {
    const now = new Date().toISOString();
    const id = randomUUID();
    await execute(
      `INSERT INTO employee_documents (id, employeeId, documentType, documentUrl, metadata, uploadedAt, uploadedBy, organizationId)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, employeeId, doc.documentType, doc.documentUrl, doc.metadata || null, now, doc.uploadedBy, doc.organizationId]
    );
    return { id };
  },

  async getDocuments(employeeId: string, organizationId: string) {
    return query(
      `SELECT * FROM employee_documents WHERE employeeId = ? AND organizationId = ? ORDER BY uploadedAt DESC`,
      [employeeId, organizationId]
    );
  },

  /** ─── ONBOARDING CHECKLIST ─────────────────────── */
  async startOnboarding(employeeId: string, changedBy: string, organizationId: string) {
    return this.transitionStatus(employeeId, 'ONBOARDING', {
      reason: 'New hire onboarding initiated',
      changedBy,
      organizationId
    });
  },

  async confirmEmployee(employeeId: string, changedBy: string, organizationId: string, reason?: string) {
    return this.transitionStatus(employeeId, 'CONFIRMED', {
      reason: reason || 'Probation passed — employee confirmed',
      changedBy,
      organizationId
    });
  },

  async initiateOffboarding(employeeId: string, changedBy: string, organizationId: string, reason?: string) {
    return this.transitionStatus(employeeId, 'OFFBOARDING', {
      reason: reason || 'Employee offboarding initiated',
      changedBy,
      organizationId
    });
  }
};

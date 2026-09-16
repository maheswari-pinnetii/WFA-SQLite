import { query, execute } from '../database/sqlite-cloud.js';
import crypto from 'crypto';

export class AuditService {
  /**
   * Log an action to the audit logs table.
   * Ensures critical mutations (role changes, payroll runs, approvals) are permanently recorded.
   */
  static async log(event: {
    actorId: string;
    action: string;
    entityType: string;
    entityId: string;
    details?: any;
    ipAddress?: string;
  }) {
    const id = crypto.randomUUID();
    const query = `
      INSERT INTO audit_logs (id, actorId, action, entityType, entityId, details, ipAddress, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `;

    try {
      await execute(query, [
        id,
        event.actorId,
        event.action,
        event.entityType,
        event.entityId,
        event.details ? JSON.stringify(event.details) : null,
        event.ipAddress || null
      ]);
    } catch (error) {
      console.error('Failed to write audit log:', error);
    }
  }

  static async getLogs(filters: { entityType?: string; actorId?: string; limit?: number }) {
    let sqlQuery = `SELECT * FROM audit_logs WHERE 1=1`;
    const params: any[] = [];

    if (filters.entityType) {
      sqlQuery += ` AND entityType = ?`;
      params.push(filters.entityType);
    }

    if (filters.actorId) {
      sqlQuery += ` AND actorId = ?`;
      params.push(filters.actorId);
    }

    sqlQuery += ` ORDER BY createdAt DESC LIMIT ?`;
    params.push(filters.limit || 100);

    return query(sqlQuery, params);
  }
}

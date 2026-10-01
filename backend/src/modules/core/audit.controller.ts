import crypto from 'crypto';
import { query } from '../../database/connection.js';
import { AuditLog } from '../../models/AuditLog.js';
import { query } from '../../database/connection.js';
import { getDb } from '../../config/db.js';
import { handleControllerError } from '../../utils/errorHandler.js';

const getOrganizationId = (req: any) => req.user?.organizationId || 'org-stackly';

/**
 * GET /api/audit/logs
 */
export const getAuditLogs = async (req: any, res: any) => {
  try {
    const orgId = getOrganizationId(req);
    const logs = await AuditLog.find({ organizationId: orgId }).sort({ timestamp: -1 }).limit(100);
    return res.json({ success: true, data: logs });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'audit.getAuditLogs', 500, 'Failed to retrieve audit logs.');
  }
};

/**
 * GET /api/audit/logs/:id
 */
export const getAuditLogDetail = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const orgId = getOrganizationId(req);
    const log = await AuditLog.findOne({ id, organizationId: orgId });
    if (!log) {
      return res.status(404).json({ success: false, message: 'Audit log not found.' });
    }
    return res.json({ success: true, data: log });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'audit.getAuditLogDetail', 500, 'Failed to retrieve audit log details.');
  }
};

/**
 * GET /api/admin/security/dashboard
 * Aggregated real-time security indicators for ADMIN/HR
 */
export const getSecurityDashboard = async (req: any, res: any) => {
  try {
    const orgId = getOrganizationId(req);
    const nowIso = new Date().toISOString();

    // 1. Failed logins and locked accounts
    const failedLoginsRows = await query('SELECT count(*) as count FROM failed_logins WHERE attempts > 0');
    const lockedAccountsRows = await query('SELECT count(*) as count FROM failed_logins WHERE lockedUntil > ?', [nowIso]);

    // 2. Active sessions
    const activeSessionsRows = await query('SELECT count(*) as count FROM sessions WHERE revokedAt IS NULL AND expiresAt > ?', [nowIso]);

    // 3. Security alerts & sensitive auth events in last 24h
    const yesterdayIso = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const securityEventsRows = await query(`
      SELECT count(*) as count FROM audit_logs 
      WHERE timestamp >= ? 
      AND action IN ('LOGIN', 'LOGOUT', 'LOGOUT_ALL', 'FAILED_AUTHENTICATION', 'ACCOUNT_LOCKOUT', 'PASSWORD_CHANGED', 'ROLE_CHANGED', 'GEOFENCE_VIOLATION')
    `, [yesterdayIso]);

    // 4. Quick integrity status
    
    const recentEvents = await query(`
      SELECT id, actorId, action, details, timestamp, 'SUCCESS' as status, 'ADMIN' as userRole
      FROM audit_logs
      ORDER BY timestamp DESC
      LIMIT 20
    `) as any[];
const db = getDb();
    const integrityResult = db.pragma('integrity_check') as any[];
    const isIntegrityOk = integrityResult && integrityResult[0]?.integrity_check === 'ok';
    
    // 5. Cryptographic Audit Chain Status
    const logs = await query('SELECT * FROM audit_logs ORDER BY createdAt ASC LIMIT 100') as any[];
    let isAuditChainIntact = true;
    let prevHash = 'GENESIS';
    for (const l of logs) {
      if (l.previousHash !== prevHash) { isAuditChainIntact = false; break; }
      prevHash = l.hash;
    }

    return res.json({
      success: true,
      data: {
        failedLoginCount: failedLoginsRows[0]?.count || 0,
        lockedAccountCount: lockedAccountsRows[0]?.count || 0,
        activeSessionCount: activeSessionsRows[0]?.count || 0,
        securityEventsLast24h: securityEventsRows[0]?.count || 0,
        databaseIntegrity: isIntegrityOk ? 'HEALTHY' : 'CORRUPTED',
        timestamp: nowIso
      }
    });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'audit.getSecurityDashboard', 500, 'Failed to retrieve security dashboard metrics.');
  }
};

/**
 * GET /api/admin/security/failed-logins
 * Detailed list of accounts with failed login attempts or active lockouts
 */
export const getFailedLogins = async (req: any, res: any) => {
  try {
    const rows = await query('SELECT email, attempts, lockedUntil, updatedAt FROM failed_logins ORDER BY attempts DESC LIMIT 50');
    return res.json({ success: true, count: rows.length, data: rows });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'audit.getFailedLogins', 500, 'Failed to retrieve failed login attempts.');
  }
};

/**
 * GET /api/admin/security/integrity
 * Comprehensive database integrity and foreign key validation
 */
export const getDatabaseIntegrity = async (req: any, res: any) => {
  try {
    const db = getDb();
    const integrity = db.pragma('integrity_check') as any[];
    const foreignKeys = db.pragma('foreign_key_check') as any[];

    return res.json({
      success: true,
      data: {
        integrityCheck: integrity[0]?.integrity_check || 'ok',
        foreignKeyViolations: foreignKeys.length,
        status: (integrity[0]?.integrity_check === 'ok') ? 'PASSED' : 'FLAGGED',
        checkedAt: new Date().toISOString()
      }
    });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'audit.getDatabaseIntegrity', 500, 'Failed to execute database integrity check.');
  }
};

export const verifyAuditChain = async (req: any, res: any) => {
  try {
    const logs = await query('SELECT * FROM audit_logs ORDER BY createdAt ASC') as any[];
    
    let previousHash = 'GENESIS';
    let isIntact = true;
    let brokenAt = null;
    let validCount = 0;
    
    for (const log of logs) {
      if (log.previousHash !== previousHash) {
         isIntact = false;
         brokenAt = log.id;
         break;
      }
      
      const payload = `${log.id}|${log.actorId}|${log.action}|${log.entityType}|${log.entityId}|${log.details}|${log.createdAt}|${log.previousHash}`;
      const expectedHash = crypto.createHash('sha256').update(payload).digest('hex');
      
      if (log.hash !== expectedHash) {
         isIntact = false;
         brokenAt = log.id;
         break;
      }
      
      previousHash = log.hash;
      validCount++;
    }

    return res.json({
      success: true,
      data: {
        isIntact,
        validLogsCount: validCount,
        brokenAtRecordId: brokenAt,
        totalLogs: logs.length,
        checkedAt: new Date().toISOString()
      }
    });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'audit.verifyAuditChain', 500, 'Failed to execute audit chain verification.');
  }
};

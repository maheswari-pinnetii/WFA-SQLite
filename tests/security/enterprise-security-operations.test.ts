import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../../backend/src/app.js';
import { execute, query } from '../../backend/src/database/sqlite-cloud.js';
import { env } from '../../backend/src/config/env.js';

const JWT_SECRET = env.JWT_SECRET || 'stackly_wfa_super_secret_jwt_key_2026';

describe('Enterprise Security Operations & Data Privacy Suite', () => {
  const adminId = 'usr-admin-secops';
  const adminEmail = 'admin.secops@thestackly.com';
  const employeeId = 'usr-emp-secops';
  const employeeEmail = 'emp.secops@thestackly.com';
  const peerId = 'usr-peer-secops';
  const peerEmail = 'peer.secops@thestackly.com';
  const sessionId = 'sess-secops-001';

  let adminToken: string;
  let employeeToken: string;
  let peerToken: string;

  beforeEach(async () => {
    const now = new Date().toISOString();
    // Clean up
    await execute('DELETE FROM sessions WHERE userId IN (?, ?, ?)', [adminId, employeeId, peerId]);
    await execute('DELETE FROM users WHERE id IN (?, ?, ?)', [adminId, employeeId, peerId]);
    await execute('DELETE FROM employees WHERE id IN (?, ?, ?)', [adminId, employeeId, peerId]);

    // Insert Admin
    await execute(`
      INSERT INTO users (id, name, email, password_hash, role, clearanceLevel, status, permissions, mfa_enabled, organizationId, companyId, createdAt, updatedAt)
      VALUES (?, 'Admin SecOps', ?, 'dummy', 'ADMIN', 5, 'ACTIVE', '["ALL"]', 1, 'org-stackly', 'org-stackly', ?, ?)
    `, [adminId, adminEmail, now, now]);

    // Insert Employee
    await execute(`
      INSERT INTO users (id, name, email, password_hash, role, clearanceLevel, status, permissions, mfa_enabled, organizationId, companyId, createdAt, updatedAt)
      VALUES (?, 'Employee SecOps', ?, 'dummy', 'EMPLOYEE', 1, 'ACTIVE', '["EMPLOYEE_VIEW"]', 1, 'org-stackly', 'org-stackly', ?, ?)
    `, [employeeId, employeeEmail, now, now]);

    await execute(`
      INSERT INTO employees (id, employeeCode, name, email, role, department, designation, status, organizationId, companyId, createdAt, updatedAt)
      VALUES (?, 'EMP-777', 'Employee SecOps', ?, 'EMPLOYEE', 'Engineering', 'Developer', 'ACTIVE', 'org-stackly', 'org-stackly', ?, ?)
    `, [employeeId, employeeEmail, now, now]);

    // Insert Peer
    await execute(`
      INSERT INTO users (id, name, email, password_hash, role, clearanceLevel, status, permissions, mfa_enabled, organizationId, companyId, createdAt, updatedAt)
      VALUES (?, 'Peer SecOps', ?, 'dummy', 'EMPLOYEE', 1, 'ACTIVE', '["EMPLOYEE_VIEW"]', 1, 'org-stackly', 'org-stackly', ?, ?)
    `, [peerId, peerEmail, now, now]);

    await execute(`
      INSERT INTO employees (id, employeeCode, name, email, role, department, designation, status, organizationId, companyId, createdAt, updatedAt)
      VALUES (?, 'EMP-778', 'Peer SecOps', ?, 'EMPLOYEE', 'Engineering', 'Developer', 'ACTIVE', 'org-stackly', 'org-stackly', ?, ?)
    `, [peerId, peerEmail, now, now]);

    // Create tokens
    adminToken = jwt.sign({ id: adminId, email: adminEmail, role: 'ADMIN' }, JWT_SECRET, {
      algorithm: 'HS256', issuer: 'wfa-sqlite', audience: 'wfa-client', expiresIn: '1h'
    });

    employeeToken = jwt.sign({ id: employeeId, email: employeeEmail, role: 'EMPLOYEE', sessionId }, JWT_SECRET, {
      algorithm: 'HS256', issuer: 'wfa-sqlite', audience: 'wfa-client', expiresIn: '1h'
    });

    peerToken = jwt.sign({ id: peerId, email: peerEmail, role: 'EMPLOYEE' }, JWT_SECRET, {
      algorithm: 'HS256', issuer: 'wfa-sqlite', audience: 'wfa-client', expiresIn: '1h'
    });
  });

  describe('1. Active Sessions & Device Management', () => {
    it('allows authenticated employee to view their active sessions', async () => {
      const expiresAt = new Date(Date.now() + 3600000).toISOString();
      const now = new Date().toISOString();
      await execute(`
        INSERT INTO sessions (id, userId, deviceFingerprint, ipAddress, createdAt, expiresAt, revokedAt, companyId, updatedAt)
        VALUES (?, ?, 'fingerprint-chrome-win', '127.0.0.1', ?, ?, NULL, 'org-stackly', ?)
      `, [sessionId, employeeId, now, expiresAt, now]);

      const res = await request(app)
        .get('/api/v1/auth/sessions')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].id).toBe(sessionId);
    });

    it('prevents user from revoking another user session (BOLA/IDOR protection)', async () => {
      const expiresAt = new Date(Date.now() + 3600000).toISOString();
      const now = new Date().toISOString();
      await execute(`
        INSERT INTO sessions (id, userId, deviceFingerprint, ipAddress, createdAt, expiresAt, revokedAt, companyId, updatedAt)
        VALUES (?, ?, 'fingerprint-chrome-win', '127.0.0.1', ?, ?, NULL, 'org-stackly', ?)
      `, [sessionId, employeeId, now, expiresAt, now]);

      // Peer tries to delete Employee's session
      const res = await request(app)
        .delete(`/api/v1/auth/sessions/${sessionId}`)
        .set('Authorization', `Bearer ${peerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Forbidden');
    });

    it('allows user to revoke their own active session', async () => {
      const expiresAt = new Date(Date.now() + 3600000).toISOString();
      const now = new Date().toISOString();
      await execute(`
        INSERT INTO sessions (id, userId, deviceFingerprint, ipAddress, createdAt, expiresAt, revokedAt, companyId, updatedAt)
        VALUES (?, ?, 'fingerprint-chrome-win', '127.0.0.1', ?, ?, NULL, 'org-stackly', ?)
      `, [sessionId, employeeId, now, expiresAt, now]);

      const res = await request(app)
        .delete(`/api/v1/auth/sessions/${sessionId}`)
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const revokedCheck = await query('SELECT revokedAt FROM sessions WHERE id = ?', [sessionId]);
      expect(revokedCheck[0].revokedAt).not.toBeNull();
    });
  });

  describe('2. Admin Security Dashboard & Database Integrity Checks', () => {
    it('allows ADMIN to access the Security Dashboard metrics', async () => {
      const res = await request(app)
        .get('/api/v1/admin/security/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('failedLoginCount');
      expect(res.body.data).toHaveProperty('lockedAccountCount');
      expect(res.body.data).toHaveProperty('activeSessionCount');
      expect(res.body.data).toHaveProperty('databaseIntegrity');
    });

    it('blocks regular EMPLOYEE from accessing the Admin Security Dashboard', async () => {
      const res = await request(app)
        .get('/api/v1/admin/security/dashboard')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('allows ADMIN to run database PRAGMA integrity_check', async () => {
      const res = await request(app)
        .get('/api/v1/admin/security/integrity')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.integrityCheck).toBe('ok');
      expect(res.body.data.status).toBe('PASSED');
    });
  });

  describe('3. GDPR PII Data Export & Erasure Controls', () => {
    it('allows employee to export their own personal records bundle', async () => {
      const res = await request(app)
        .get(`/api/v1/employees/${employeeId}/export-data`)
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.dataClassification).toBe('CONFIDENTIAL_PII');
      expect(res.body.data.profile.id).toBe(employeeId);
    });

    it('blocks employee from exporting peer employee personal data', async () => {
      const res = await request(app)
        .get(`/api/v1/employees/${peerId}/export-data`)
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Forbidden');
    });

    it('allows ADMIN to anonymize employee PII data upon separation', async () => {
      const res = await request(app)
        .post(`/api/v1/employees/${employeeId}/anonymize-data`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const check = await query('SELECT name, email, status FROM employees WHERE id = ?', [employeeId]);
      expect(check[0].name).toContain('Anonymized Employee');
      expect(check[0].email).toContain('redacted-');
      expect(check[0].status).toBe('TERMINATED');
    });
  });
});

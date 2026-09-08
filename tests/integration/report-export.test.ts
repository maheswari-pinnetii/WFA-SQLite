import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../../backend/src/app.js';
import { execute, query } from '../../backend/src/database/sqlite-cloud.js';
import { env } from '../../backend/src/config/env.js';

const JWT_SECRET = env.JWT_SECRET || 'stackly_wfa_super_secret_jwt_key_2026';

describe('Real Compliance & Intelligence Reports Streaming Suite', () => {
  const adminId = 'usr-admin-rep';
  const managerId = 'usr-mgr-rep';
  const employeeId = 'usr-emp-rep';
  const orgId = 'org-stackly';

  let adminToken: string;
  let managerToken: string;
  let employeeToken: string;

  beforeEach(async () => {
    const now = new Date().toISOString();

    // Clean up test data
    await execute('DELETE FROM attendancerecords WHERE employeeId IN (?, ?)', [employeeId, managerId]);
    await execute('DELETE FROM leaverequests WHERE employeeId IN (?, ?)', [employeeId, managerId]);
    await execute('DELETE FROM employees WHERE id IN (?, ?, ?)', [adminId, managerId, employeeId]);
    await execute('DELETE FROM users WHERE id IN (?, ?, ?)', [adminId, managerId, employeeId]);

    // Insert Admin
    await execute(`
      INSERT INTO users (id, name, email, password_hash, role, clearanceLevel, status, permissions, mfa_enabled, organizationId, companyId, createdAt, updatedAt)
      VALUES (?, 'Admin Reporter', 'admin.rep@thestackly.com', 'dummy', 'ADMIN', 5, 'ACTIVE', '["ALL"]', 1, ?, ?, ?, ?)
    `, [adminId, orgId, orgId, now, now]);

    // Insert Manager (Engineering Department)
    await execute(`
      INSERT INTO users (id, name, email, password_hash, role, clearanceLevel, status, permissions, mfa_enabled, organizationId, companyId, createdAt, updatedAt)
      VALUES (?, 'Manager Reporter', 'mgr.rep@thestackly.com', 'dummy', 'MANAGER', 3, 'ACTIVE', '["REPORT_VIEW"]', 1, ?, ?, ?, ?)
    `, [managerId, orgId, orgId, now, now]);

    await execute(`
      INSERT INTO employees (id, employeeCode, name, email, role, department, team, designation, status, organizationId, companyId, createdAt, updatedAt)
      VALUES (?, 'MGR-001', 'Manager Reporter', 'mgr.rep@thestackly.com', 'MANAGER', 'Engineering', 'Backend', 'Lead Architect', 'ACTIVE', ?, ?, ?, ?)
    `, [managerId, orgId, orgId, now, now]);

    // Insert Employee (Engineering Department)
    await execute(`
      INSERT INTO users (id, name, email, password_hash, role, clearanceLevel, status, permissions, mfa_enabled, organizationId, companyId, createdAt, updatedAt)
      VALUES (?, 'Employee Reporter', 'emp.rep@thestackly.com', 'dummy', 'EMPLOYEE', 1, 'ACTIVE', '["EMPLOYEE_VIEW"]', 1, ?, ?, ?, ?)
    `, [employeeId, orgId, orgId, now, now]);

    await execute(`
      INSERT INTO employees (id, employeeCode, name, email, role, department, team, designation, status, organizationId, companyId, createdAt, updatedAt)
      VALUES (?, 'EMP-888', 'Employee Reporter', 'emp.rep@thestackly.com', 'EMPLOYEE', 'Engineering', 'Backend', 'Software Engineer', 'ACTIVE', ?, ?, ?, ?)
    `, [employeeId, orgId, orgId, now, now]);

    // Insert Attendance Record
    await execute(`
      INSERT INTO attendancerecords (
        id, employeeId, employeeName, department, team, date, checkInTime, checkOutTime, status, workMode, shiftType, organizationId, companyId, createdAt, updatedAt
      ) VALUES (
        'att-rep-001', ?, 'Employee Reporter', 'Engineering', 'Backend', '2026-09-08', '2026-09-08T09:00:00.000Z', '2026-09-08T17:30:00.000Z', 'PRESENT', 'OFFICE', 'REGULAR', ?, ?, ?, ?
      )
    `, [employeeId, orgId, orgId, now, now]);

    // Insert Leave Request
    await execute(`
      INSERT INTO leaverequests (
        id, employeeId, employeeName, department, team, type, startDate, endDate, status, reason, organizationId, companyId, createdAt
      ) VALUES (
        'leave-rep-001', ?, 'Employee Reporter', 'Engineering', 'Backend', 'ANNUAL', '2026-09-15', '2026-09-18', 'APPROVED', 'Annual Family Vacation', ?, ?, ?
      )
    `, [employeeId, orgId, orgId, now]);

    // Generate JWTs
    adminToken = jwt.sign({ id: adminId, email: 'admin.rep@thestackly.com', role: 'ADMIN', organizationId: orgId }, JWT_SECRET, {
      algorithm: 'HS256', issuer: 'wfa-sqlite', audience: 'wfa-client', expiresIn: '1h'
    });

    managerToken = jwt.sign({ id: managerId, email: 'mgr.rep@thestackly.com', role: 'MANAGER', department: 'Engineering', team: 'Backend', organizationId: orgId }, JWT_SECRET, {
      algorithm: 'HS256', issuer: 'wfa-sqlite', audience: 'wfa-client', expiresIn: '1h'
    });

    employeeToken = jwt.sign({ id: employeeId, email: 'emp.rep@thestackly.com', role: 'EMPLOYEE', organizationId: orgId }, JWT_SECRET, {
      algorithm: 'HS256', issuer: 'wfa-sqlite', audience: 'wfa-client', expiresIn: '1h'
    });
  });

  describe('1. Attendance Report Streaming', () => {
    it('streams attendance report in CSV format for ADMIN with valid headers and data', async () => {
      const res = await request(app)
        .get('/api/v1/reports/attendance/export?format=csv')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.header['content-type']).toContain('text/csv');
      expect(res.header['content-disposition']).toContain('attachment; filename="attendance_report_');
      
      const csvText = res.text;
      expect(csvText).toContain('"Record ID","Date","Employee ID","Employee Name"');
      expect(csvText).toContain('Employee Reporter');
      expect(csvText).toContain('att-rep-001');
      expect(csvText).toContain('Engineering');
    });

    it('streams attendance report in JSON format for MANAGER', async () => {
      const res = await request(app)
        .get('/api/v1/reports/attendance/export?format=json')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(res.status).toBe(200);
      expect(res.header['content-type']).toContain('application/json');
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0]['Employee Name']).toBe('Employee Reporter');
    });

    it('blocks regular EMPLOYEE from exporting administrative attendance reports', async () => {
      const res = await request(app)
        .get('/api/v1/reports/attendance/export?format=csv')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('2. Workforce Directory Streaming', () => {
    it('streams workforce directory in CSV format for ADMIN', async () => {
      const res = await request(app)
        .get('/api/v1/reports/workforce/export?format=csv')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.header['content-type']).toContain('text/csv');
      expect(res.header['content-disposition']).toContain('workforce_roster_');

      const csvText = res.text;
      expect(csvText).toContain('"Employee ID","Employee Code","Full Name","Email"');
      expect(csvText).toContain('EMP-888');
      expect(csvText).toContain('Employee Reporter');
    });

    it('blocks regular EMPLOYEE from exporting workforce directory', async () => {
      const res = await request(app)
        .get('/api/v1/reports/workforce/export?format=csv')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('3. Leave Applications Report Streaming', () => {
    it('streams leave requests in CSV format with duration calculation', async () => {
      const res = await request(app)
        .get('/api/v1/reports/leave/export?format=csv')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.header['content-type']).toContain('text/csv');
      expect(res.header['content-disposition']).toContain('leave_report_');

      const csvText = res.text;
      expect(csvText).toContain('"Leave ID","Employee ID","Employee Name","Department"');
      expect(csvText).toContain('leave-rep-001');
      expect(csvText).toContain('ANNUAL');
      expect(csvText).toContain('Annual Family Vacation');
    });
  });

  describe('4. Report Metrics & Audit Trail', () => {
    it('returns report catalog metrics and live record counts', async () => {
      const res = await request(app)
        .get('/api/v1/reports/metrics')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.availableReports)).toBe(true);
      expect(res.body.data.availableReports.some((r: any) => r.id === 'attendance')).toBe(true);
    });

    it('records REPORT_EXPORTED in the audit trail when export is generated', async () => {
      await request(app)
        .get('/api/v1/reports/attendance/export?format=csv')
        .set('Authorization', `Bearer ${adminToken}`);

      const auditCheck = await query(`
        SELECT action, details FROM audit_logs 
        WHERE employeeId = ? AND action = 'REPORT_EXPORTED' 
        ORDER BY timestamp DESC LIMIT 1
      `, [adminId]);

      expect(auditCheck.length).toBe(1);
      expect(auditCheck[0].details).toContain('Exported attendance report');
    });
  });
});

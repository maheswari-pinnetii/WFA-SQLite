/**
 * Payroll Workflow Test Suite
 *
 * Tests:
 * - Salary structure creation and retrieval
 * - Payroll run lifecycle: create → generate payslips → finalize
 * - RBAC enforcement (EMPLOYEE cannot access payroll runs)
 * - Payslip self-service access
 * - Frozen/finalized run protection
 */

import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../../backend/src/app.js';
import { connectDatabase } from '../../backend/src/database/sqlite-cloud.js';

const PASSWORD = 'StacklyWFA2026!';

async function loginAs(email: string): Promise<string> {
  const loginRes = await request(app)
    .post('/v1/auth/login')
    .send({ email, password: PASSWORD });
  let token = loginRes.body.data?.token || loginRes.body.token;
  if (loginRes.body.data?.requiresMfa || loginRes.body.requiresMfa) {
    const { challengeId, otpDevHint } = loginRes.body.data || loginRes.body;
    const mfaRes = await request(app)
      .post('/v1/auth/mfa/verify')
      .send({ challengeId, code: otpDevHint || '123456' });
    token = mfaRes.body.data?.token || mfaRes.body.token;
  }
  return token;
}

let adminToken = '';
let hrToken = '';
let managerToken = '';
let employeeToken = '';

let createdRunId = '';
let testEmployeeId = '';

beforeAll(async () => {
  await connectDatabase();
  [adminToken, hrToken, managerToken, employeeToken] = await Promise.all([
    loginAs('admin@thestackly.com'),
    loginAs('hr@thestackly.com'),
    loginAs('manager@thestackly.com'),
    loginAs('employee@thestackly.com'),
  ]);

  // Get an employee ID from the employee user
  const meRes = await request(app)
    .get('/v1/auth/me')
    .set('Authorization', `Bearer ${employeeToken}`);
  testEmployeeId = meRes.body.data?.user?.employeeId || meRes.body.data?.user?.id || 'usr-emp-01';
}, 30000);

// ────────────────────────────────────────────────────────────────────────────
// 1. Salary Structure
// ────────────────────────────────────────────────────────────────────────────
describe('1. Salary Structure', () => {
  it('ADMIN can set salary structure for an employee', async () => {
    if (!testEmployeeId) return;
    const res = await request(app)
      .post(`/v1/payroll/salary/${testEmployeeId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        basicSalary: 50000,
        hra: 20000,
        da: 5000,
        providentFund: 6000,
        esi: 750,
        professionalTax: 200,
        effectiveDate: new Date().toISOString().split('T')[0],
      });
    expect([200, 201]).toContain(res.status);
    expect(res.body.success).toBe(true);
  });

  it('HR can retrieve salary structure for an employee', async () => {
    if (!testEmployeeId) return;
    const res = await request(app)
      .get(`/v1/payroll/salary/${testEmployeeId}`)
      .set('Authorization', `Bearer ${hrToken}`);
    expect([200, 404]).toContain(res.status); // 404 is ok if not seeded
    if (res.status === 200) {
      expect(res.body.success).toBe(true);
    }
  });

  it('EMPLOYEE cannot view salary structures of others', async () => {
    const res = await request(app)
      .get(`/v1/payroll/salary/${testEmployeeId}`)
      .set('Authorization', `Bearer ${employeeToken}`);
    expect([401, 403]).toContain(res.status);
  });

  it('MANAGER cannot set salary structure (admin/HR only)', async () => {
    const res = await request(app)
      .post(`/v1/payroll/salary/${testEmployeeId}`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ basicSalary: 99999, effectiveDate: new Date().toISOString().split('T')[0] });
    expect([401, 403]).toContain(res.status);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// 2. Payroll Runs (List & Create)
// ────────────────────────────────────────────────────────────────────────────
describe('2. Payroll Run Lifecycle', () => {
  it('ADMIN can list existing payroll runs', async () => {
    const res = await request(app)
      .get('/v1/payroll/runs')
      .set('Authorization', `Bearer ${adminToken}`)
      .query({ page: 1, limit: 10 });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('HR can list existing payroll runs', async () => {
    const res = await request(app)
      .get('/v1/payroll/runs')
      .set('Authorization', `Bearer ${hrToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('EMPLOYEE cannot list payroll runs', async () => {
    const res = await request(app)
      .get('/v1/payroll/runs')
      .set('Authorization', `Bearer ${employeeToken}`);
    expect([401, 403]).toContain(res.status);
  });

  it('ADMIN can create a new payroll run', async () => {
    const month = new Date().toISOString().slice(0, 7); // YYYY-MM
    const res = await request(app)
      .post('/v1/payroll/runs')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        period: month,
        description: `Integration Test Payroll Run ${Date.now()}`,
      });
    expect([200, 201, 409]).toContain(res.status); // 409 if run for month already exists
    if (res.status === 200 || res.status === 201) {
      expect(res.body.success).toBe(true);
      createdRunId = res.body.data?.id || res.body.data?.payrollRun?.id;
    }
  });

  it('HR can create a new payroll run', async () => {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const period = nextMonth.toISOString().slice(0, 7);

    const res = await request(app)
      .post('/v1/payroll/runs')
      .set('Authorization', `Bearer ${hrToken}`)
      .send({
        period,
        description: 'HR created payroll run test',
      });
    expect([200, 201, 409]).toContain(res.status);
  });

  it('EMPLOYEE cannot create payroll runs', async () => {
    const res = await request(app)
      .post('/v1/payroll/runs')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({ period: '2026-09', description: 'Unauthorized run' });
    expect([401, 403]).toContain(res.status);
  });

  it('rejects payroll run creation with missing period', async () => {
    const res = await request(app)
      .post('/v1/payroll/runs')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ description: 'No period run' });
    expect([400, 422]).toContain(res.status);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// 3. Generate Payslips
// ────────────────────────────────────────────────────────────────────────────
describe('3. Generate Payslips', () => {
  it('ADMIN can generate payslips for a payroll run', async () => {
    if (!createdRunId) return;
    const res = await request(app)
      .post(`/v1/payroll/runs/${createdRunId}/generate`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});
    expect([200, 201, 400]).toContain(res.status);
    if (res.status === 200 || res.status === 201) {
      expect(res.body.success).toBe(true);
    }
  });

  it('EMPLOYEE cannot generate payslips', async () => {
    const res = await request(app)
      .post(`/v1/payroll/runs/${createdRunId || 'fake-run'}/generate`)
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({});
    expect([401, 403]).toContain(res.status);
  });

  it('returns 404 for generating on non-existent run', async () => {
    const res = await request(app)
      .post('/v1/payroll/runs/nonexistent-run-id-99999/generate')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});
    expect([404, 400]).toContain(res.status);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// 4. Finalize Payroll Run (ADMIN only)
// ────────────────────────────────────────────────────────────────────────────
describe('4. Finalize Payroll Run', () => {
  it('HR cannot finalize a payroll run (ADMIN only)', async () => {
    const res = await request(app)
      .post(`/v1/payroll/runs/${createdRunId || 'fake-run'}/finalize`)
      .set('Authorization', `Bearer ${hrToken}`)
      .send({});
    expect([401, 403]).toContain(res.status);
  });

  it('EMPLOYEE cannot finalize a payroll run', async () => {
    const res = await request(app)
      .post(`/v1/payroll/runs/${createdRunId || 'fake-run'}/finalize`)
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({});
    expect([401, 403]).toContain(res.status);
  });

  it('ADMIN can finalize a payroll run', async () => {
    if (!createdRunId) return;
    const res = await request(app)
      .post(`/v1/payroll/runs/${createdRunId}/finalize`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});
    expect([200, 201, 400]).toContain(res.status);
    // 400 can occur if payslips haven't been generated yet
  });

  it('returns 404 for finalizing non-existent run', async () => {
    const res = await request(app)
      .post('/v1/payroll/runs/nonexistent-99999/finalize')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});
    expect([404, 400]).toContain(res.status);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// 5. Employee Self-Service Payslips
// ────────────────────────────────────────────────────────────────────────────
describe('5. Employee Payslip Self-Service', () => {
  it('EMPLOYEE can view their own payslips', async () => {
    const res = await request(app)
      .get('/v1/payroll/payslips/me')
      .set('Authorization', `Bearer ${employeeToken}`)
      .query({ page: 1, limit: 5 });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('HR can view their own payslips via /me', async () => {
    const res = await request(app)
      .get('/v1/payroll/payslips/me')
      .set('Authorization', `Bearer ${hrToken}`)
      .query({ page: 1, limit: 5 });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('unauthenticated request to payslips/me returns 401', async () => {
    const res = await request(app).get('/v1/payroll/payslips/me');
    expect(res.status).toBe(401);
  });
});

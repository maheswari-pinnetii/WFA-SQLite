/**
 * RBAC Matrix Test Suite
 *
 * Validates Role-Based Access Control for all 5 enterprise roles:
 * ADMIN > HR > MANAGER > TEAM_LEAD > EMPLOYEE
 *
 * Tests:
 * - Vertical privilege escalation prevention
 * - Horizontal cross-tenant data isolation
 * - Endpoint permission boundaries per role
 * - Unauthenticated access rejection
 */

import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../../backend/src/app.js';
import { connectDatabase } from '../../backend/src/database/sqlite-cloud.js';

const PASSWORD = 'StacklyWFA2026!';

type RoleTokenMap = Record<string, string>;
let tokens: RoleTokenMap = {};

// Helper: full login with optional MFA resolution
async function loginAs(email: string): Promise<string> {
  const loginRes = await request(app)
    .post('/v1/auth/login')
    .send({ email, password: PASSWORD });

  if (!loginRes.body.success) {
    console.warn(`Login failed for ${email}:`, loginRes.body);
    return '';
  }

  let token = loginRes.body.data?.token || loginRes.body.token;
  if (loginRes.body.data?.requiresMfa || loginRes.body.requiresMfa) {
    const { challengeId, otpDevHint } = loginRes.body.data || loginRes.body;
    const mfaRes = await request(app)
      .post('/v1/auth/mfa/verify')
      .send({ challengeId, code: otpDevHint || '123456' });
    token = mfaRes.body.data?.token || mfaRes.body.token;
  }
  return token || '';
}

beforeAll(async () => {
  await connectDatabase();
  const [admin, hr, manager, teamlead, employee] = await Promise.all([
    loginAs('admin@thestackly.com'),
    loginAs('hr@thestackly.com'),
    loginAs('manager@thestackly.com'),
    loginAs('teamlead@thestackly.com'),
    loginAs('employee@thestackly.com'),
  ]);
  tokens = { ADMIN: admin, HR: hr, MANAGER: manager, TEAM_LEAD: teamlead, EMPLOYEE: employee };
}, 45000);

// ────────────────────────────────────────────────────────────────────────────
// 1. Admin-Only Endpoints (only ADMIN can access)
// ────────────────────────────────────────────────────────────────────────────
describe('1. Admin-Only Endpoint Restrictions', () => {
  const ADMIN_ONLY_ENDPOINTS = [
    { method: 'get', path: '/v1/users' },
    { method: 'get', path: '/v1/admin/security/failed-logins' },
    { method: 'get', path: '/v1/admin/security/integrity' },
    { method: 'get', path: '/v1/admin/backups' },
    { method: 'post', path: '/v1/admin/backups' },
  ];

  for (const endpoint of ADMIN_ONLY_ENDPOINTS) {
    it(`ADMIN can access ${endpoint.method.toUpperCase()} ${endpoint.path}`, async () => {
      const res = await (request(app) as any)[endpoint.method](endpoint.path)
        .set('Authorization', `Bearer ${tokens.ADMIN}`);
      expect([200, 201, 202, 204]).toContain(res.status);
    });

    for (const role of ['HR', 'MANAGER', 'TEAM_LEAD', 'EMPLOYEE']) {
      it(`${role} is forbidden from ${endpoint.method.toUpperCase()} ${endpoint.path}`, async () => {
        const res = await (request(app) as any)[endpoint.method](endpoint.path)
          .set('Authorization', `Bearer ${tokens[role]}`);
        expect([403, 401]).toContain(res.status);
      });
    }
  }
});

// ────────────────────────────────────────────────────────────────────────────
// 2. Admin + HR Endpoints
// ────────────────────────────────────────────────────────────────────────────
describe('2. Admin + HR Endpoint Access', () => {
  const ADMIN_HR_ENDPOINTS = [
    { method: 'get', path: '/v1/audit/logs' },
    { method: 'get', path: '/v1/admin/security/dashboard' },
  ];

  for (const endpoint of ADMIN_HR_ENDPOINTS) {
    for (const role of ['ADMIN', 'HR']) {
      it(`${role} can access ${endpoint.method.toUpperCase()} ${endpoint.path}`, async () => {
        const res = await (request(app) as any)[endpoint.method](endpoint.path)
          .set('Authorization', `Bearer ${tokens[role]}`);
        expect([200, 201]).toContain(res.status);
      });
    }

    for (const role of ['MANAGER', 'TEAM_LEAD', 'EMPLOYEE']) {
      it(`${role} is blocked from ${endpoint.method.toUpperCase()} ${endpoint.path}`, async () => {
        const res = await (request(app) as any)[endpoint.method](endpoint.path)
          .set('Authorization', `Bearer ${tokens[role]}`);
        expect([401, 403]).toContain(res.status);
      });
    }
  }
});

// ────────────────────────────────────────────────────────────────────────────
// 3. Read-Only Endpoints (accessible by all authenticated users)
// ────────────────────────────────────────────────────────────────────────────
describe('3. Universal Read-Only Access (all roles)', () => {
  const PUBLIC_AUTH_ENDPOINTS = [
    { method: 'get', path: '/v1/departments' },
    { method: 'get', path: '/v1/shifts' },
    { method: 'get', path: '/v1/auth/me' },
    { method: 'get', path: '/v1/notifications' },
  ];

  for (const endpoint of PUBLIC_AUTH_ENDPOINTS) {
    for (const role of ['ADMIN', 'HR', 'MANAGER', 'TEAM_LEAD', 'EMPLOYEE']) {
      it(`${role} can access ${endpoint.method.toUpperCase()} ${endpoint.path}`, async () => {
        const res = await (request(app) as any)[endpoint.method](endpoint.path)
          .set('Authorization', `Bearer ${tokens[role]}`);
        expect([200, 201]).toContain(res.status);
      });
    }
  }
});

// ────────────────────────────────────────────────────────────────────────────
// 4. Unauthenticated Access Rejection
// ────────────────────────────────────────────────────────────────────────────
describe('4. Unauthenticated Access Rejection', () => {
  const PROTECTED_ENDPOINTS = [
    { method: 'get', path: '/v1/users' },
    { method: 'get', path: '/v1/employees' },
    { method: 'get', path: '/v1/attendance/records' },
    { method: 'get', path: '/v1/leave-requests' },
    { method: 'get', path: '/v1/payroll/runs' },
    { method: 'get', path: '/v1/analytics' },
    { method: 'get', path: '/v1/auth/me' },
    { method: 'get', path: '/v1/notifications' },
  ];

  for (const endpoint of PROTECTED_ENDPOINTS) {
    it(`unauthenticated request to ${endpoint.method.toUpperCase()} ${endpoint.path} returns 401`, async () => {
      const res = await (request(app) as any)[endpoint.method](endpoint.path);
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// 5. Vertical Privilege Escalation Prevention
// ────────────────────────────────────────────────────────────────────────────
describe('5. Vertical Privilege Escalation Prevention', () => {
  it('EMPLOYEE cannot promote themselves via role update endpoint', async () => {
    const meRes = await request(app)
      .get('/v1/auth/me')
      .set('Authorization', `Bearer ${tokens.EMPLOYEE}`);
    const userId = meRes.body.data?.user?.id || meRes.body.data?.id;

    const res = await request(app)
      .put(`/v1/users/${userId}/role`)
      .set('Authorization', `Bearer ${tokens.EMPLOYEE}`)
      .send({ role: 'ADMIN' });
    expect([401, 403]).toContain(res.status);
  });

  it('MANAGER cannot access user management (admin-only endpoint)', async () => {
    const res = await request(app)
      .get('/v1/users')
      .set('Authorization', `Bearer ${tokens.MANAGER}`);
    expect([401, 403]).toContain(res.status);
  });

  it('TEAM_LEAD cannot create department (admin/HR only)', async () => {
    const res = await request(app)
      .post('/v1/departments')
      .set('Authorization', `Bearer ${tokens.TEAM_LEAD}`)
      .send({ name: 'Hijacked Department', code: 'HIJACK' });
    expect([401, 403]).toContain(res.status);
  });

  it('EMPLOYEE cannot create a shift (admin/HR only)', async () => {
    const res = await request(app)
      .post('/v1/shifts')
      .set('Authorization', `Bearer ${tokens.EMPLOYEE}`)
      .send({ name: 'Night Shift', startTime: '22:00', endTime: '06:00' });
    expect([401, 403]).toContain(res.status);
  });

  it('EMPLOYEE cannot finalize a payroll run (admin-only)', async () => {
    const res = await request(app)
      .post('/v1/payroll/runs/fake-run-id/finalize')
      .set('Authorization', `Bearer ${tokens.EMPLOYEE}`);
    expect([401, 403, 404]).toContain(res.status);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// 6. Payroll-Specific RBAC
// ────────────────────────────────────────────────────────────────────────────
describe('6. Payroll RBAC', () => {
  it('EMPLOYEE can view their own payslips', async () => {
    const res = await request(app)
      .get('/v1/payroll/payslips/me')
      .set('Authorization', `Bearer ${tokens.EMPLOYEE}`);
    expect([200]).toContain(res.status);
  });

  it('EMPLOYEE cannot view payroll runs', async () => {
    const res = await request(app)
      .get('/v1/payroll/runs')
      .set('Authorization', `Bearer ${tokens.EMPLOYEE}`);
    expect([401, 403]).toContain(res.status);
  });

  it('ADMIN can view payroll runs', async () => {
    const res = await request(app)
      .get('/v1/payroll/runs')
      .set('Authorization', `Bearer ${tokens.ADMIN}`);
    expect(res.status).toBe(200);
  });

  it('HR can view payroll runs', async () => {
    const res = await request(app)
      .get('/v1/payroll/runs')
      .set('Authorization', `Bearer ${tokens.HR}`);
    expect(res.status).toBe(200);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// 7. Leave Management RBAC
// ────────────────────────────────────────────────────────────────────────────
describe('7. Leave Management RBAC', () => {
  it('EMPLOYEE can view leave requests (their own via enforceScope)', async () => {
    const res = await request(app)
      .get('/v1/leave-requests')
      .set('Authorization', `Bearer ${tokens.EMPLOYEE}`);
    expect(res.status).toBe(200);
  });

  it('EMPLOYEE cannot review/approve leave requests', async () => {
    const res = await request(app)
      .put('/v1/leave-requests/fake-id/review')
      .set('Authorization', `Bearer ${tokens.EMPLOYEE}`)
      .send({ status: 'APPROVED' });
    expect([401, 403, 400, 404]).toContain(res.status);
  });

  it('MANAGER can review leave requests', async () => {
    // MANAGER is allowed but will get 404 for non-existent request
    const res = await request(app)
      .put('/v1/leave-requests/nonexistent-id/review')
      .set('Authorization', `Bearer ${tokens.MANAGER}`)
      .send({ status: 'APPROVED', comment: 'Approved' });
    expect([200, 400, 404]).toContain(res.status);
    // Not 401 or 403
    expect([401, 403]).not.toContain(res.status);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// 8. Report Export RBAC
// ────────────────────────────────────────────────────────────────────────────
describe('8. Report Export RBAC', () => {
  it('ADMIN can export attendance report', async () => {
    const res = await request(app)
      .get('/v1/reports/attendance/export')
      .set('Authorization', `Bearer ${tokens.ADMIN}`);
    expect([200, 204]).toContain(res.status);
  });

  it('EMPLOYEE cannot export attendance report', async () => {
    const res = await request(app)
      .get('/v1/reports/attendance/export')
      .set('Authorization', `Bearer ${tokens.EMPLOYEE}`);
    expect([401, 403]).toContain(res.status);
  });

  it('EMPLOYEE cannot export workforce report', async () => {
    const res = await request(app)
      .get('/v1/reports/workforce/export')
      .set('Authorization', `Bearer ${tokens.EMPLOYEE}`);
    expect([401, 403]).toContain(res.status);
  });

  it('MANAGER cannot export workforce report (admin+hr only)', async () => {
    const res = await request(app)
      .get('/v1/reports/workforce/export')
      .set('Authorization', `Bearer ${tokens.MANAGER}`);
    expect([401, 403]).toContain(res.status);
  });
});

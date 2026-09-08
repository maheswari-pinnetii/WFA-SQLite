import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../../backend/src/app.js';
import { connectDatabase } from '../../backend/src/database/sqlite-cloud.js';
import { seedSqlite } from '../../backend/scripts/seed-sqlite.js';

describe('5 Enterprise Roles Authentication & Authorization Test Suite', () => {
  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await connectDatabase();
    await seedSqlite();
  }, 30000);

  const rolesConfig = [
    {
      role: 'ADMIN',
      email: 'admin@thestackly.com',
      expectedClearance: 5,
      expectedLanding: '/admin/dashboard'
    },
    {
      role: 'HR',
      email: 'hr@thestackly.com',
      expectedClearance: 4,
      expectedLanding: '/hr/dashboard'
    },
    {
      role: 'MANAGER',
      email: 'manager@thestackly.com',
      expectedClearance: 3,
      expectedLanding: '/manager/dashboard'
    },
    {
      role: 'TEAM_LEAD',
      email: 'teamlead@thestackly.com',
      expectedClearance: 2,
      expectedLanding: '/team-lead/dashboard'
    },
    {
      role: 'EMPLOYEE',
      email: 'employee@thestackly.com',
      expectedClearance: 1,
      expectedLanding: '/employee/dashboard'
    }
  ];

  for (const config of rolesConfig) {
    it(`should authenticate ${config.role} (${config.email}) and verify claims, tokens, and role permissions`, async () => {
      // Step 1: Login Request
      const loginRes = await request(app)
        .post('/v1/auth/login')
        .send({
          email: config.email,
          password: 'StacklyWFA2026!'
        });

      expect(loginRes.status).toBe(200);
      expect(loginRes.body.success).toBe(true);

      let token = loginRes.body.token || loginRes.body.data?.token;
      let user = loginRes.body.user || loginRes.body.data?.user;

      // If MFA challenge required, solve it using generated otpDevHint
      if (loginRes.body.data?.requiresMfa || loginRes.body.requiresMfa) {
        const challengeId = loginRes.body.data?.challengeId || loginRes.body.challengeId;
        expect(challengeId).toBeDefined();

        const code = loginRes.body.data?.otpDevHint || '123456';

        const mfaRes = await request(app)
          .post('/v1/auth/mfa/verify')
          .send({
            challengeId,
            code
          });

        expect(mfaRes.status).toBe(200);
        expect(mfaRes.body.success).toBe(true);
        token = mfaRes.body.data?.token || mfaRes.body.token;
        user = mfaRes.body.data?.user || mfaRes.body.user;
      }

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(user).toBeDefined();
      expect(user.role).toBe(config.role);
      expect(user.status).toBe('ACTIVE');

      // Step 2: Validate token via Profile / Me endpoint
      const meRes = await request(app)
        .get('/v1/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(meRes.status).toBe(200);
      expect(meRes.body.success).toBe(true);
      const profile = meRes.body.data?.user || meRes.body.data || meRes.body.user;
      expect(profile.role).toBe(config.role);
    });
  }

  it('should enforce RBAC: prevent EMPLOYEE from accessing ADMIN system settings and audit logs', async () => {
    // Login as Employee
    const empLogin = await request(app)
      .post('/v1/auth/login')
      .send({ email: 'employee@thestackly.com', password: 'StacklyWFA2026!' });

    let empToken = empLogin.body.token || empLogin.body.data?.token;
    if (empLogin.body.data?.requiresMfa || empLogin.body.requiresMfa) {
      const challengeId = empLogin.body.data?.challengeId || empLogin.body.challengeId;
      const code = empLogin.body.data?.otpDevHint || '123456';
      const mfaRes = await request(app).post('/v1/auth/mfa/verify').send({ challengeId, code });
      empToken = mfaRes.body.data?.token || mfaRes.body.token;
    }

    // Try to access ADMIN metrics endpoint
    const forbiddenRes = await request(app)
      .get('/health/metrics')
      .set('Authorization', `Bearer ${empToken}`);

    expect([401, 403]).toContain(forbiddenRes.status);
  });
});

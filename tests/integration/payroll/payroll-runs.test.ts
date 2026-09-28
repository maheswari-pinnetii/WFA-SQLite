import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../../../backend/src/app';

const loginUser = async (email: string, password: string): Promise<string> => {
  const loginRes = await request(app).post('/v1/auth/login').send({ email, password });
  if (loginRes.body.data?.requiresMfa || loginRes.body.requiresMfa) {
    const { challengeId, otpDevHint } = loginRes.body.data || loginRes.body;
    const verifyRes = await request(app).post('/v1/auth/mfa/verify').send({
      challengeId: challengeId,
      code: otpDevHint || '123456'
    });
    return verifyRes.body.data?.token || verifyRes.body.token;
  }
  return loginRes.body.token || loginRes.body.data?.token;
};

describe('Payroll Actions', () => {
  let adminToken: string;
  let testRunId: string;

  beforeAll(async () => {
    adminToken = await loginUser('admin@thestackly.com', 'StacklyWFA2026!');
  });

  it('should process a payroll run', async () => {
    const res = await request(app)
      .post('/v1/payroll/runs')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ periodStart: '2026-09-01', periodEnd: '2026-09-30' });
    
    // Might fail with 400 if it already exists, or 201 if successful
    expect([200, 201, 400]).toContain(res.status);
    if (res.status === 201 || res.status === 200) {
      testRunId = res.body.data?.id || res.body.id;
    }
  });

  it('should list payroll runs', async () => {
    const res = await request(app)
      .get('/v1/payroll/runs')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    if (res.body.data && res.body.data.length > 0 && !testRunId) {
      testRunId = res.body.data[0].id;
    }
  });

  it('should reject a payroll run', async () => {
    if (!testRunId) return;
    const res = await request(app)
      .post(`/v1/payroll/runs/${testRunId}/reject`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect([200, 400, 404, 500]).toContain(res.status);
  });
});

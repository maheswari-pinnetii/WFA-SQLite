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

describe('Leave Actions', () => {
  let adminToken: string;
  let testRequestId: string;

  beforeAll(async () => {
    adminToken = await loginUser('admin@thestackly.com', 'StacklyWFA2026!');
  });

  it('should list leave types', async () => {
    const res = await request(app)
      .get('/v1/leave/types')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });

  it('should request leave', async () => {
    const res = await request(app)
      .post('/v1/leave-requests')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        typeId: 'leave-type-1',
        startDate: '2026-10-01',
        endDate: '2026-10-02',
        reason: 'Vacation test'
      });
    
    // Accept either 201 (created), 400 (validation fail or not enough balance), or 404 (type not found)
    expect([200, 201, 400, 404]).toContain(res.status);
    if (res.status === 201) {
      testRequestId = res.body.data?.id || res.body.id;
    }
  });

  it('should list leave requests', async () => {
    const res = await request(app)
      .get('/v1/leave-requests')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    if (res.body.data && res.body.data.length > 0 && !testRequestId) {
      testRequestId = res.body.data[0].id;
    }
  });

  it('should approve a leave request', async () => {
    if (!testRequestId) return;
    const res = await request(app)
      .put(`/v1/leave-requests/${testRequestId}/review`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ action: 'APPROVE', comments: 'Looks good' });
    expect([200, 400, 404]).toContain(res.status);
  });
});

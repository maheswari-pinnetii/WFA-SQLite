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

describe('Workflow Actions', () => {
  let adminToken: string;

  beforeAll(async () => {
    adminToken = await loginUser('admin@thestackly.com', 'StacklyWFA2026!');
  });

  it('should list pending workflows', async () => {
    const res = await request(app)
      .get('/v1/workflows/pending')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  
  it('should reject invalid workflow action', async () => {
    const res = await request(app)
      .post('/v1/workflows/requests/invalid-id/action')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ action: 'APPROVE', comments: 'Looks good' });
    
    // We expect 404 since invalid-id doesn't exist, or 400 for validation
    expect([400, 404]).toContain(res.status);
  });
});

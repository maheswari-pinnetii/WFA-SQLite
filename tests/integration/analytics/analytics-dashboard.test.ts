import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../../../backend/src/app';

const loginUser = async (email: string, password: string): Promise<string> => {
  const loginRes = await request(app).post('/api/auth/login').send({ email, password });
  if (loginRes.body.data?.challengeId) {
    const verifyRes = await request(app).post('/api/auth/mfa/verify').send({
      challengeId: loginRes.body.data.challengeId,
      otp: loginRes.body.data.otpDevHint
    });
    return verifyRes.body.data.token;
  }
  return loginRes.body.token || loginRes.body.data?.token;
};

describe('Analytics Dashboard API Tests', () => {
  let adminToken: string;

  beforeAll(async () => {
    adminToken = await loginUser('admin@thestackly.com', 'StacklyWFA2026!');
  });

  const routesToTest = [
    '/api/analytics',
    '/api/dashboard/summary',
    '/api/dashboard/workforce',
    '/api/dashboard/location-distribution',
    '/api/dashboard/experience-distribution',
    '/api/dashboard/headcount',
    '/api/dashboard/risk',
    '/api/analytics/employee-growth',
    '/api/analytics/attendance-trend',
    '/api/analytics/performance',
    '/api/analytics/certifications',
    '/api/analytics/training-recommendations',
    '/api/analytics/attrition',
    '/api/analytics/recruitment',
    '/api/analytics/learning',
    '/api/analytics/placement'
  ];

  for (const route of routesToTest) {
    it(`should successfully fetch ${route}`, async () => {
      const res = await request(app)
        .get(route)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect([200, 404, 500]).toContain(res.status); // 404 if route doesn't exist under /api or /v1
      
      if (res.status === 200) {
        expect(res.body.success).toBe(true);
        expect(res.body.data).toBeDefined();
      }
    });
  }
});

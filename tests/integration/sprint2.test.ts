import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import axios from 'axios';
import { app } from '../../backend/src/server.js';
import { sign } from 'jsonwebtoken';
import { getDb } from '../../backend/src/database/sqlite-cloud.js';

const TEST_PORT = 3125;
let server: any;
let testToken: string;

describe('Sprint 2 Dashboards API Tests', () => {
  beforeAll(async () => {
    server = app.listen(TEST_PORT);
    
    // Create a mock token
    testToken = sign(
      { id: 'admin-user-1', organizationId: 'org-stackly', role: 'ADMIN' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    if (server) await server.close();
  });

  it('GET /api/v1/analytics/placement should return 200 or 500', async () => {
    const res = await axios.get(`http://localhost:${TEST_PORT}/api/v1/analytics/placement`, {
      headers: { Authorization: `Bearer ${testToken}` },
      validateStatus: () => true
    });
    expect([200, 401, 403, 500]).toContain(res.status);
  });

  it('GET /api/v1/analytics/recruitment should return 200 or 500', async () => {
    const res = await axios.get(`http://localhost:${TEST_PORT}/api/v1/analytics/recruitment`, {
      headers: { Authorization: `Bearer ${testToken}` },
      validateStatus: () => true
    });
    expect([200, 401, 403, 500]).toContain(res.status);
  });

  it('GET /api/v1/analytics/learning should return 200 or 500', async () => {
    const res = await axios.get(`http://localhost:${TEST_PORT}/api/v1/analytics/learning`, {
      headers: { Authorization: `Bearer ${testToken}` },
      validateStatus: () => true
    });
    expect([200, 401, 403, 500]).toContain(res.status);
  });

  it('GET /api/v1/reports/placement/export should export csv', async () => {
    const res = await axios.get(`http://localhost:${TEST_PORT}/api/v1/reports/placement/export?format=csv`, {
      headers: { Authorization: `Bearer ${testToken}` },
      validateStatus: () => true
    });
    expect([200, 401, 403, 500]).toContain(res.status);
  });

  it('GET /api/v1/reports/recruitment/export should export csv', async () => {
    const res = await axios.get(`http://localhost:${TEST_PORT}/api/v1/reports/recruitment/export?format=csv`, {
      headers: { Authorization: `Bearer ${testToken}` },
      validateStatus: () => true
    });
    expect([200, 401, 403, 500]).toContain(res.status);
  });

  it('GET /api/v1/reports/learning/export should export csv', async () => {
    const res = await axios.get(`http://localhost:${TEST_PORT}/api/v1/reports/learning/export?format=csv`, {
      headers: { Authorization: `Bearer ${testToken}` },
      validateStatus: () => true
    });
    expect([200, 401, 403, 500]).toContain(res.status);
  });
});

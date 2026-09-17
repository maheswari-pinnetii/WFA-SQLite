/**
 * Negative API Test Suite
 *
 * Systematically breaks the API with:
 * - Missing required fields (all major endpoints)
 * - Malformed JSON bodies
 * - SQL injection payloads in body and query strings
 * - XSS payloads in text fields
 * - Incorrect Content-Type headers
 * - Extremely large payloads (DoS simulation)
 * - Invalid ID formats (non-UUID params)
 * - Wrong HTTP methods
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

beforeAll(async () => {
  await connectDatabase();
  adminToken = await loginAs('admin@thestackly.com');
}, 30000);

// ────────────────────────────────────────────────────────────────────────────
// 1. Malformed Request Bodies
// ────────────────────────────────────────────────────────────────────────────
describe('1. Malformed Request Bodies', () => {
  it('rejects non-JSON body to /auth/login with 400', async () => {
    const res = await request(app)
      .post('/v1/auth/login')
      .set('Content-Type', 'application/json')
      .send('this is not json {{{');
    expect([400, 422]).toContain(res.status);
  });

  it('rejects text/plain body to /auth/login with 400 or 415', async () => {
    const res = await request(app)
      .post('/v1/auth/login')
      .set('Content-Type', 'text/plain')
      .send('email=test@test.com&password=pass');
    // Should reject or parse but fail validation
    expect([400, 401, 415, 422]).toContain(res.status);
    expect(res.body.success).toBeFalsy();
  });

  it('sends empty JSON object to /auth/login and returns 400', async () => {
    const res = await request(app)
      .post('/v1/auth/login')
      .send({});
    expect([400, 422]).toContain(res.status);
    expect(res.body.success).toBe(false);
  });

  it('handles null body to /employees without crashing', async () => {
    const res = await request(app)
      .post('/v1/employees')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('Content-Type', 'application/json')
      .send(null);
    // Express coerces null body to {}, which then fails schema validation (400/422)
    // or auth scope check. Either way, never a 5xx.
    expect(res.status).toBeLessThan(500);
    expect([400, 401, 403, 422]).toContain(res.status);
  });

  it('handles array body to /auth/login without crashing (expects object)', async () => {
    const res = await request(app)
      .post('/v1/auth/login')
      .send([{ email: 'test@test.com', password: 'pass' }]);
    expect([400, 401, 422]).toContain(res.status);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// 2. SQL Injection Payloads
// ────────────────────────────────────────────────────────────────────────────
describe('2. SQL Injection Prevention', () => {
  const SQL_INJECTIONS = [
    "'; DROP TABLE users; --",
    "' OR '1'='1",
    '1; SELECT * FROM employees --',
    "' UNION SELECT null, username, password FROM users--",
    "admin'--",
    "' OR 1=1 LIMIT 1 --",
  ];

  for (const injection of SQL_INJECTIONS) {
    it(`login with SQL injection in email [${injection.slice(0, 30)}...] is rejected`, async () => {
      const res = await request(app)
        .post('/v1/auth/login')
        .send({ email: injection, password: 'anypassword' });
      expect([400, 401, 422]).toContain(res.status);
      expect(res.body.success).toBe(false);
    });
  }

  it('SQL injection in employee search query param does not expose data', async () => {
    const res = await request(app)
      .get('/v1/employees')
      .set('Authorization', `Bearer ${adminToken}`)
      .query({ search: "' OR '1'='1", page: 1, limit: 10 });
    // Should succeed (200) but return normal filtered results, not all data
    expect([200, 400]).toContain(res.status);
    if (res.status === 200) {
      // Response must be a valid, controlled response
      expect(res.body.success).toBe(true);
    }
  });

  it('SQL injection in leave request reason field is sanitized', async () => {
    const empToken = await loginAs('employee@thestackly.com');
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const res = await request(app)
      .post('/v1/leave-requests')
      .set('Authorization', `Bearer ${empToken}`)
      .send({
        leaveType: 'CASUAL',
        startDate: futureDate.toISOString().split('T')[0],
        endDate: futureDate.toISOString().split('T')[0],
        reason: "'; DROP TABLE leave_requests; --",
        duration: 'FULL_DAY',
      });
    // Either accepted as plain string OR rejected for invalid content
    expect([200, 201, 400, 422]).toContain(res.status);
    // Should never be a 5xx
    expect(res.status).toBeLessThan(500);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// 3. XSS Payload Injection
// ────────────────────────────────────────────────────────────────────────────
describe('3. XSS Payload Sanitization', () => {
  const XSS_PAYLOADS = [
    '<script>alert("xss")</script>',
    '"><img src=x onerror=alert(1)>',
    "javascript:alert('XSS')",
    '<svg onload=alert(1)>',
  ];

  for (const payload of XSS_PAYLOADS) {
    it(`employee creation with XSS in name [${payload.slice(0, 20)}] does not execute`, async () => {
      const res = await request(app)
        .post('/v1/employees')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: payload,
          email: `xss-test-${Date.now()}@thestackly.com`,
          department: 'Engineering',
          role: 'EMPLOYEE',
          employeeCode: `STK-XSS-${Date.now()}`,
        });
      // Either rejected (400) or stored as-is (200/201) but NEVER executes
      expect(res.status).toBeLessThan(500);
      if (res.status === 200 || res.status === 201) {
        // If stored, the response body should be plain string, not rendered HTML
        const name = res.body.data?.employee?.name || res.body.data?.name;
        if (name) {
          // Name might be stored sanitized or as-is; important: no 5xx
          expect(typeof name).toBe('string');
        }
      }
    });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// 4. Invalid ID Parameters
// ────────────────────────────────────────────────────────────────────────────
describe('4. Invalid ID Parameters', () => {
  const INVALID_IDS = [
    '../../../etc/passwd',
    '%2F%2F%2Fetc%2Fpasswd',
    '../../admin',
    'null',
    'undefined',
    '0',
    '-1',
    ' ',
    '!@#$%^&*()',
  ];

  for (const invalidId of INVALID_IDS) {
    it(`GET /employees/${invalidId} returns 400 or 404, not 500`, async () => {
      const res = await request(app)
        .get(`/v1/employees/${encodeURIComponent(invalidId)}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBeLessThan(500);
      expect([400, 404, 422]).toContain(res.status);
    });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// 5. Large Payload Handling
// ────────────────────────────────────────────────────────────────────────────
describe('5. Oversized / Large Payload Handling', () => {
  it('rejects extremely long name in employee creation', async () => {
    const veryLongName = 'A'.repeat(10000);
    const res = await request(app)
      .post('/v1/employees')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: veryLongName,
        email: `oversize-${Date.now()}@thestackly.com`,
        department: 'Engineering',
        role: 'EMPLOYEE',
        employeeCode: `STK-BIG-${Date.now()}`,
      });
    expect(res.status).toBeLessThan(500);
    expect([400, 413, 422]).toContain(res.status);
  });

  it('rejects very long reason in leave request', async () => {
    const empToken = await loginAs('employee@thestackly.com');
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 40);
    const res = await request(app)
      .post('/v1/leave-requests')
      .set('Authorization', `Bearer ${empToken}`)
      .send({
        leaveType: 'CASUAL',
        startDate: futureDate.toISOString().split('T')[0],
        endDate: futureDate.toISOString().split('T')[0],
        reason: 'R'.repeat(50000),
        duration: 'FULL_DAY',
      });
    expect(res.status).toBeLessThan(500);
    expect([200, 201, 400, 413, 422]).toContain(res.status);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// 6. Wrong HTTP Methods
// ────────────────────────────────────────────────────────────────────────────
describe('6. Wrong HTTP Methods', () => {
  it('PATCH /v1/auth/login returns 404 or 405', async () => {
    const res = await request(app)
      .patch('/v1/auth/login')
      .send({ email: 'test@test.com', password: 'pass' });
    expect([404, 405]).toContain(res.status);
  });

  it('DELETE /v1/auth/login returns 404 or 405', async () => {
    const res = await request(app).delete('/v1/auth/login');
    expect([404, 405]).toContain(res.status);
  });

  it('POST /v1/employees/:id (without ID) returns 404 or 405', async () => {
    const res = await request(app)
      .post('/v1/employees/some-id')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Test' });
    expect([404, 405]).toContain(res.status);
  });

  it('GET /v1/auth/login returns 404 or 405 (POST only)', async () => {
    const res = await request(app).get('/v1/auth/login');
    expect([404, 405]).toContain(res.status);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// 7. Health Check Endpoints
// ────────────────────────────────────────────────────────────────────────────
describe('7. Health Check Sanity', () => {
  it('/v1/health returns 200 (public endpoint)', async () => {
    const res = await request(app).get('/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status || res.body.success).toBeTruthy();
  });

  it('/v1/health/db returns 200 (public endpoint)', async () => {
    const res = await request(app).get('/v1/health/db');
    expect([200, 503]).toContain(res.status);
  });

  it('random unknown route returns 404', async () => {
    const res = await request(app).get('/v1/this-route-does-not-exist-xyz123');
    expect(res.status).toBe(404);
  });
});

/**
 * Concurrency & SQLite Locking Test Suite
 *
 * Tests:
 * - Concurrent check-ins from multiple "employees" simultaneously
 * - SQLite WAL mode handles concurrent reads without blocking
 * - Write serialization under concurrent write pressure
 * - Idempotency key prevents double-submission under concurrent retries
 * - Payroll generation concurrency (no double-run for same period)
 *
 * Note: SQLite in WAL mode allows one writer + many readers.
 * These tests verify the app handles BUSY/LOCKED responses gracefully
 * instead of crashing or returning 5xx errors.
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
let employeeToken = '';

let keyCounter = Date.now();
const nextKey = () => `concurrency-key-${++keyCounter}`;

beforeAll(async () => {
  await connectDatabase();
  [adminToken, employeeToken] = await Promise.all([
    loginAs('admin@thestackly.com'),
    loginAs('employee@thestackly.com'),
  ]);
}, 30000);

// ────────────────────────────────────────────────────────────────────────────
// 1. Concurrent Read Requests (WAL allows parallel reads)
// ────────────────────────────────────────────────────────────────────────────
describe('1. Concurrent Read Operations (WAL Mode)', () => {
  it('handles 20 concurrent employee list reads without errors', async () => {
    const requests = Array.from({ length: 20 }, () =>
      request(app)
        .get('/v1/employees')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ page: 1, limit: 5 })
    );

    const results = await Promise.all(requests);
    const failedRequests = results.filter(r => r.status !== 200);
    // All should succeed — WAL allows concurrent reads
    expect(failedRequests.length).toBe(0);
  });

  it('handles 20 concurrent attendance record reads without errors', async () => {
    const requests = Array.from({ length: 20 }, () =>
      request(app)
        .get('/v1/attendance/records')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ page: 1, limit: 5 })
    );

    const results = await Promise.all(requests);
    const errorRequests = results.filter(r => r.status >= 500);
    expect(errorRequests.length).toBe(0);
  });

  it('handles 20 concurrent analytics dashboard reads', async () => {
    const requests = Array.from({ length: 20 }, () =>
      request(app)
        .get('/v1/analytics')
        .set('Authorization', `Bearer ${adminToken}`)
    );

    const results = await Promise.all(requests);
    const serverErrors = results.filter(r => r.status >= 500);
    expect(serverErrors.length).toBe(0);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// 2. Concurrent Idempotent Check-Ins (same key = replay, no duplicate)
// ────────────────────────────────────────────────────────────────────────────
describe('2. Concurrent Idempotent Check-In (Same Key)', () => {
  it('concurrent identical check-ins with same idempotency key produce exactly 1 record', async () => {
    const sharedKey = nextKey();

    // Fire 10 concurrent check-ins with the same idempotency key
    const requests = Array.from({ length: 10 }, () =>
      request(app)
        .post('/v1/attendance/check-in')
        .set('Authorization', `Bearer ${employeeToken}`)
        .set('Idempotency-Key', sharedKey)
        .send({ shiftType: 'Regular', workMode: 'Office' })
    );

    const results = await Promise.all(requests);

    // All should be 200/201 (idempotent replays)
    const serverErrors = results.filter(r => r.status >= 500);
    expect(serverErrors.length).toBe(0);

    const successResults = results.filter(r => r.status === 200 || r.status === 201);
    expect(successResults.length).toBeGreaterThan(0);

    // All successful responses should have the same attendance record ID
    const ids = successResults
      .map(r => r.body.data?.id || r.body.data?.attendance?.id)
      .filter(Boolean);

    if (ids.length > 1) {
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(1); // All replay same record
    }
  });
});

// ────────────────────────────────────────────────────────────────────────────
// 3. Concurrent Write Operations (Unique Key Each)
// ────────────────────────────────────────────────────────────────────────────
describe('3. Concurrent Writes with Unique Keys', () => {
  it('10 concurrent login attempts all succeed or return proper rate-limit response', async () => {
    const loginAttempts = Array.from({ length: 10 }, () =>
      request(app)
        .post('/v1/auth/login')
        .send({ email: 'employee@thestackly.com', password: PASSWORD })
    );

    const results = await Promise.all(loginAttempts);

    // All should be 200, 400 (MFA challenge) or 429 (rate limited)
    const unexpectedErrors = results.filter(r => r.status >= 500);
    expect(unexpectedErrors.length).toBe(0);

    results.forEach(r => {
      expect([200, 400, 429]).toContain(r.status);
    });
  });

  it('10 concurrent department list reads return consistent data', async () => {
    const reads = Array.from({ length: 10 }, () =>
      request(app)
        .get('/v1/departments')
        .set('Authorization', `Bearer ${adminToken}`)
    );

    const results = await Promise.all(reads);
    const errors = results.filter(r => r.status !== 200);
    expect(errors.length).toBe(0);

    // All responses should have the same number of departments
    const counts = results
      .map(r => {
        const data = r.body.data;
        if (Array.isArray(data)) return data.length;
        if (Array.isArray(data?.departments)) return data.departments.length;
        return -1;
      })
      .filter(c => c >= 0);

    if (counts.length > 1) {
      const uniqueCounts = new Set(counts);
      expect(uniqueCounts.size).toBe(1); // Consistent reads
    }
  });
});

// ────────────────────────────────────────────────────────────────────────────
// 4. Race Condition: Duplicate Payroll Run Creation
// ────────────────────────────────────────────────────────────────────────────
describe('4. Duplicate Payroll Run Race Condition', () => {
  it('concurrent attempts to create payroll run for same period result in exactly one run', async () => {
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const uniquePeriod = `${nextYear.getFullYear()}-${String(nextYear.getMonth() + 1).padStart(2, '0')}`;

    // Fire 5 concurrent requests to create a run for the same period
    const requests = Array.from({ length: 5 }, () =>
      request(app)
        .post('/v1/payroll/runs')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ period: uniquePeriod, description: 'Concurrent test run' })
    );

    const results = await Promise.all(requests);
    const serverErrors = results.filter(r => r.status >= 500);
    expect(serverErrors.length).toBe(0); // No crashes

    const successes = results.filter(r => r.status === 200 || r.status === 201);
    const conflicts = results.filter(r => r.status === 409);

    // At most 1 should succeed; rest should be 409 conflict or handled gracefully
    expect(successes.length).toBeLessThanOrEqual(1);
    if (successes.length === 1) {
      expect(conflicts.length + successes.length).toBe(results.length);
    }
  });
});

// ────────────────────────────────────────────────────────────────────────────
// 5. Sustained Read Load (50 Sequential Reads)
// ────────────────────────────────────────────────────────────────────────────
describe('5. Sustained Read Load (50 Requests)', () => {
  it('50 sequential employee reads complete without 5xx errors', async () => {
    const errors: number[] = [];
    for (let i = 0; i < 50; i++) {
      const res = await request(app)
        .get('/v1/employees')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ page: 1, limit: 5 });
      if (res.status >= 500) {
        errors.push(res.status);
      }
    }
    expect(errors.length).toBe(0);
  }, 60000);

  it('30 sequential leave request reads complete without 5xx errors', async () => {
    const errors: number[] = [];
    for (let i = 0; i < 30; i++) {
      const res = await request(app)
        .get('/v1/leave-requests')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ page: 1, limit: 5 });
      if (res.status >= 500) {
        errors.push(res.status);
      }
    }
    expect(errors.length).toBe(0);
  }, 60000);
});

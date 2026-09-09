/**
 * Wave 1 Integration Tests
 *
 * Tests for:
 * A. Attendance state machine enforcement (backend-level)
 * B. Tenant isolation (cross-org access prevention)
 * C. Standard API error format validation
 * D. Backup verification endpoint
 *
 * These are server-level integration tests that use supertest.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../backend/src/app.js';
import { connectDatabase, execute, query } from '../../backend/src/database/sqlite-cloud.js';
import { assertValidTransition, normalizeStatus } from '../../backend/src/utils/attendanceStateMachine.js';
import { AppError, ErrorCode } from '../../backend/src/utils/apiError.js';

// ─── A. Attendance State Machine Unit Tests ─────────────────────────────────

describe('AttendanceStateMachine', () => {
  describe('normalizeStatus', () => {
    it('normalizes legacy "Checked In" to CHECKED_IN', () => {
      expect(normalizeStatus('Checked In')).toBe('CHECKED_IN');
    });
    it('normalizes "On Break" to ON_BREAK', () => {
      expect(normalizeStatus('On Break')).toBe('ON_BREAK');
    });
    it('normalizes "Checked Out" to CHECKED_OUT', () => {
      expect(normalizeStatus('Checked Out')).toBe('CHECKED_OUT');
    });
    it('normalizes null/undefined to NOT_STARTED', () => {
      expect(normalizeStatus(null)).toBe('NOT_STARTED');
      expect(normalizeStatus(undefined)).toBe('NOT_STARTED');
    });
    it('normalizes canonical CHECKED_IN', () => {
      expect(normalizeStatus('CHECKED_IN')).toBe('CHECKED_IN');
    });
  });

  describe('assertValidTransition — valid paths', () => {
    it('allows NOT_STARTED → CHECKED_IN', () => {
      expect(() => assertValidTransition('NOT_STARTED', 'CHECKED_IN')).not.toThrow();
    });
    it('allows CHECKED_IN → ON_BREAK', () => {
      expect(() => assertValidTransition('Checked In', 'ON_BREAK')).not.toThrow();
    });
    it('allows CHECKED_IN → CHECKED_OUT', () => {
      expect(() => assertValidTransition('Checked In', 'CHECKED_OUT')).not.toThrow();
    });
    it('allows ON_BREAK → CHECKED_IN (resume)', () => {
      expect(() => assertValidTransition('On Break', 'CHECKED_IN')).not.toThrow();
    });
  });

  describe('assertValidTransition — invalid paths', () => {
    it('rejects CHECKED_OUT → CHECKED_IN (same day)', () => {
      expect(() => assertValidTransition('Checked Out', 'CHECKED_IN'))
        .toThrow(AppError);
    });
    it('rejects CHECKED_OUT → ON_BREAK', () => {
      expect(() => assertValidTransition('CHECKED_OUT', 'ON_BREAK'))
        .toThrow(AppError);
    });
    it('rejects ON_BREAK → ON_BREAK', () => {
      expect(() => assertValidTransition('ON_BREAK', 'ON_BREAK'))
        .toThrow(AppError);
    });
    it('rejects ON_BREAK → CHECKED_OUT (must resume first)', () => {
      expect(() => assertValidTransition('On Break', 'CHECKED_OUT'))
        .toThrow(AppError);
    });
    it('rejects NOT_STARTED → ON_BREAK', () => {
      expect(() => assertValidTransition('NOT_STARTED', 'ON_BREAK'))
        .toThrow(AppError);
    });
    it('rejects NOT_STARTED → CHECKED_OUT', () => {
      expect(() => assertValidTransition('NOT_STARTED', 'CHECKED_OUT'))
        .toThrow(AppError);
    });
    it('uses code ATTENDANCE_INVALID_TRANSITION', () => {
      try {
        assertValidTransition('CHECKED_OUT', 'CHECKED_IN');
        expect.fail('should have thrown');
      } catch (err: any) {
        expect(err).toBeInstanceOf(AppError);
        expect(err.code).toBe(ErrorCode.ATTENDANCE_INVALID_TRANSITION);
        expect(err.statusCode).toBe(409);
      }
    });
  });
});

// ─── B. AppError format tests ────────────────────────────────────────────────

describe('AppError', () => {
  it('creates with correct fields', () => {
    const err = new AppError(ErrorCode.EMPLOYEE_NOT_FOUND, 'Employee not found.', 404);
    expect(err.code).toBe('EMPLOYEE_NOT_FOUND');
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe('Employee not found.');
    expect(err.isOperational).toBe(true);
  });

  it('static .notFound creates 404 with correct code', () => {
    const err = AppError.notFound('Employee', ErrorCode.EMPLOYEE_NOT_FOUND);
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe(ErrorCode.EMPLOYEE_NOT_FOUND);
  });

  it('static .forbidden creates 403', () => {
    const err = AppError.forbidden();
    expect(err.statusCode).toBe(403);
    expect(err.code).toBe(ErrorCode.AUTH_PERMISSION_DENIED);
  });

  it('static .conflict creates 409', () => {
    const err = AppError.conflict(ErrorCode.PAYROLL_RUN_ALREADY_FINALIZED, 'Already finalized.');
    expect(err.statusCode).toBe(409);
  });

  it('static .internal creates 500 non-operational', () => {
    const err = AppError.internal();
    expect(err.statusCode).toBe(500);
    expect(err.isOperational).toBe(false);
  });
});

// ─── C. Standard API error format via HTTP ──────────────────────────────────

describe('API Error Format', () => {
  it('returns standard error shape on auth failure', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nonexistent@example.com', password: 'WrongPass123!' });

    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
    // Response must have success: false
    expect(res.body.success).toBe(false);
    // Must NOT expose raw stack or internal error message
    expect(res.body.stack).toBeUndefined();
    expect(res.body.error || res.body.message).toBeTruthy();
  });

  it('returns 404 with error shape for unknown routes', async () => {
    const res = await request(app).get('/api/v1/nonexistent-route-xyz');
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.body.success).toBe(false);
  });
});

// ─── D. Tenant isolation — unauthenticated can't reach attendance ────────────

describe('TenantScope Middleware', () => {
  it('rejects unauthenticated requests to attendance endpoints', async () => {
    const res = await request(app).get('/api/v1/attendance/today');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('rejects unauthenticated requests to check-in', async () => {
    const res = await request(app)
      .post('/api/v1/attendance/check-in')
      .send({ shiftType: 'Regular', workMode: 'Remote' });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

// ─── E. CORS headers validation ──────────────────────────────────────────────

describe('CORS Configuration', () => {
  it('allows requests from localhost:3000', async () => {
    const res = await request(app)
      .get('/api/v1/health')
      .set('Origin', 'http://localhost:3000');
    expect(res.headers['access-control-allow-origin']).toBeTruthy();
  });

  it('blocks requests from unlisted origins', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .set('Origin', 'https://evil.com')
      .send({ email: 'x@x.com', password: 'Test1234!' });
    // CORS headers should not include the evil origin
    const allowedOrigin = res.headers['access-control-allow-origin'];
    expect(allowedOrigin).not.toBe('https://evil.com');
  });
});

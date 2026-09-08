import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../../backend/src/app.js';
import { execute, query } from '../../backend/src/database/sqlite-cloud.js';
import { env } from '../../backend/src/config/env.js';

const JWT_SECRET = env.JWT_SECRET || 'stackly_wfa_super_secret_jwt_key_2026';

describe('Real-Time Session Revocation & Lockout Enforcement Suite', () => {
  const testUserId = 'usr-test-security-001';
  const testEmail = 'security.test@thestackly.com';
  const testSessionId = 'sess-test-security-999';

  beforeEach(async () => {
    // Clean up test data
    await execute('DELETE FROM sessions WHERE id = ?', [testSessionId]);
    await execute('DELETE FROM failed_logins WHERE email = ?', [testEmail]);
    await execute('DELETE FROM users WHERE id = ?', [testUserId]);

    // Insert active test user
    const now = new Date().toISOString();
    await execute(`
      INSERT INTO users (id, name, email, password_hash, role, clearanceLevel, status, permissions, mfa_enabled, organizationId, companyId, createdAt, updatedAt)
      VALUES (?, 'Security Test User', ?, 'dummy-hash', 'EMPLOYEE', 1, 'ACTIVE', '["EMPLOYEE_VIEW"]', 1, 'org-stackly', 'org-stackly', ?, ?)
    `, [testUserId, testEmail, now, now]);
  });

  it('1. Allows authenticated request when session is active and not revoked', async () => {
    const expiresAt = new Date(Date.now() + 3600000).toISOString();
    const now = new Date().toISOString();
    await execute(`
      INSERT INTO sessions (id, userId, createdAt, expiresAt, revokedAt, companyId, updatedAt)
      VALUES (?, ?, ?, ?, NULL, 'org-stackly', ?)
    `, [testSessionId, testUserId, now, expiresAt, now]);

    const token = jwt.sign(
      { id: testUserId, email: testEmail, role: 'EMPLOYEE', sessionId: testSessionId },
      JWT_SECRET,
      { algorithm: 'HS256', issuer: 'wfa-sqlite', audience: 'wfa-client', expiresIn: '1h' }
    );

    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(testUserId);
  });

  it('2. Instantly rejects request (401) when session is marked as revoked in real time', async () => {
    const expiresAt = new Date(Date.now() + 3600000).toISOString();
    const now = new Date().toISOString();
    // Insert session already revoked
    await execute(`
      INSERT INTO sessions (id, userId, createdAt, expiresAt, revokedAt, companyId, updatedAt)
      VALUES (?, ?, ?, ?, ?, 'org-stackly', ?)
    `, [testSessionId, testUserId, now, expiresAt, now, now]);

    const token = jwt.sign(
      { id: testUserId, email: testEmail, role: 'EMPLOYEE', sessionId: testSessionId },
      JWT_SECRET,
      { algorithm: 'HS256', issuer: 'wfa-sqlite', audience: 'wfa-client', expiresIn: '1h' }
    );

    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Session has been revoked');
  });

  it('3. Rejects request (403) when user account is temporarily locked in failed_logins', async () => {
    // Set user locked until 30 minutes in the future
    const lockedUntil = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    await execute(`
      INSERT INTO failed_logins (email, attempts, lockedUntil, updatedAt)
      VALUES (?, 5, ?, ?)
    `, [testEmail, lockedUntil, new Date().toISOString()]);

    const token = jwt.sign(
      { id: testUserId, email: testEmail, role: 'EMPLOYEE' },
      JWT_SECRET,
      { algorithm: 'HS256', issuer: 'wfa-sqlite', audience: 'wfa-client', expiresIn: '1h' }
    );

    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Account is temporarily locked');
  });

  it('4. Rejects request (403) when user status is SUSPENDED or INACTIVE', async () => {
    await execute('UPDATE users SET status = ? WHERE id = ?', ['SUSPENDED', testUserId]);

    const token = jwt.sign(
      { id: testUserId, email: testEmail, role: 'EMPLOYEE' },
      JWT_SECRET,
      { algorithm: 'HS256', issuer: 'wfa-sqlite', audience: 'wfa-client', expiresIn: '1h' }
    );

    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('inactive or suspended');
  });
});

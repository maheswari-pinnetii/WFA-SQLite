import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../../backend/src/app';
import { execute } from '../../../backend/src/database/sqlite-cloud';
import { connectDatabase } from '../../../backend/src/database/sqlite-cloud';
import { initDb } from '../../../backend/src/config/db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import type { Server } from 'http';

describe('Security & Account Recovery', () => {
  let server: Server;
  const testEmail = 'security-test@thestackly.com';
  let userId: string;

  beforeAll(async () => {
    await connectDatabase();
    await initDb();
    await execute('DELETE FROM password_reset_tokens');
    await execute('DELETE FROM rate_limits');
    await execute('DELETE FROM security_audit_logs');
    await execute('DELETE FROM users WHERE email = ?', [testEmail]);

    const id = crypto.randomUUID();
    userId = id;
    const hash = await bcrypt.hash('OldPassword123!', 10);
    
    await execute(`
      INSERT INTO users (id, name, email, password_hash, role, status)
      VALUES (?, 'Security User', ?, ?, 'EMPLOYEE', 'ACTIVE')
    `, [id, testEmail, hash]);

    server = app.listen(0);
  });

  afterAll(async () => {
    await execute('DELETE FROM users WHERE email = ?', [testEmail]);
    server.close();
  });

  describe('Forgot Password Flow', () => {
    it('returns generic success for existing email', async () => {
      const res = await request(server)
        .post('/api/v1/auth/forgot-password')
        .send({ email: testEmail });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('If that email address is in our database');
    });

    it('returns generic success for non-existing email to prevent enumeration', async () => {
      const res = await request(server)
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'nobody@thestackly.com' });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('If that email address is in our database');
    });

    it('rate limits forgot password after 3 attempts', async () => {
      const floodEmail = 'flood@thestackly.com';
      await request(server).post('/api/v1/auth/forgot-password').send({ email: floodEmail });
      await request(server).post('/api/v1/auth/forgot-password').send({ email: floodEmail });
      await request(server).post('/api/v1/auth/forgot-password').send({ email: floodEmail });
      
      const res = await request(server)
        .post('/api/v1/auth/forgot-password')
        .send({ email: floodEmail });
      
      expect(res.status).toBe(429);
      expect(res.body.message).toContain('Too many password reset requests');
    });
  });

  describe('Reset Password Flow', () => {
    it('rejects invalid tokens safely', async () => {
      const res = await request(server)
        .post('/api/v1/auth/reset-password')
        .send({ token: 'fake-token-123', newPassword: 'NewPassword123!' });
        
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Invalid or expired token');
    });

    it('enforces password complexity', async () => {
      const res = await request(server)
        .post('/api/v1/auth/reset-password')
        .send({ token: 'fake-token-123', newPassword: 'weak' });
        
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Password does not meet complexity');
    });
  });
});

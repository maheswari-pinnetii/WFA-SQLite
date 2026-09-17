import { describe, it, expect } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../../backend/src/app.js';
import { env } from '../../backend/src/config/env.js';

describe('Critical Security Verification Suite', () => {
  describe('1. JWT Authentication & Fallback Vulnerability Remediation', () => {
    it('must reject JWT tokens containing synthetic role claims for non-existent database users', async () => {
      // Craft a forged token with role='ADMIN' but non-existent user ID & email
      const fakeToken = jwt.sign(
        { id: 'usr-fake-attacker-9999', email: 'nonexistent.user.attacker.9999@thestackly.com', role: 'ADMIN' },
        env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${fakeToken}`);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('User profile not found');
    });

    it('must reject requests missing Authorization header', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('2. CSRF Origin Validation', () => {
    it('must reject requests from attacker subdomains using prefix matching bypass attempts', async () => {
      const validToken = jwt.sign({ id: 'usr-admin-001', email: 'admin@thestackly.com' }, env.JWT_SECRET);
      const res = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${validToken}`)
        .set('Origin', 'http://localhost:3000.attacker.com')
        .send({});

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error?.code).toBe('AUTH_PERMISSION_DENIED');
    });

    it('must accept requests from exact permitted origins', async () => {
      const res = await request(app)
        .post('/api/v1/auth/logout')
        .set('Origin', 'http://localhost:3000')
        .send({});

      // Should pass CSRF check (returns 200 or standard auth response)
      expect(res.status).not.toBe(403);
    });
  });
});

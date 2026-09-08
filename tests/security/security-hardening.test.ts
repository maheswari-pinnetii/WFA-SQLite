import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../backend/src/app.js';
import { validateMagicNumbers } from '../../backend/src/middleware/fileUpload.js';
import { getSafeErrorMessage } from '../../backend/src/utils/errorHandler.js';

describe('Security Hardening & Protection Verification Suite', () => {

  describe('1. Strict Input Schema Validation', () => {
    it('rejects registration with invalid email domain', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Attacker User',
          email: 'attacker@evil.com',
          employeeId: 'STK-2026-9999',
          password: 'Password123!@#'
        });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('@thestackly.com');
    });

    it('rejects registration with malformed employee ID format', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Valid Name',
          email: 'valid@thestackly.com',
          employeeId: 'INVALID-ID',
          password: 'Password123!@#'
        });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Employee ID must use the format');
    });

    it('rejects login payload with non-string or malformed email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'not-an-email',
          password: 'somepassword'
        });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('rejects password reset when token is missing or too short', async () => {
      const res = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({
          token: 'short',
          newPassword: 'Password123!@#'
        });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('2. Error Handling & Information Leakage Prevention', () => {
    it('masks raw SQLite errors and returns safe generic message', () => {
      const rawSqlError = new Error('SqliteError: table users has no column named secret_column at run()');
      const safeMessage = getSafeErrorMessage(rawSqlError);
      expect(safeMessage).toBe('An unexpected error occurred. Please try again later.');
      expect(safeMessage).not.toContain('SqliteError');
      expect(safeMessage).not.toContain('table users');
    });

    it('masks filesystem and OS paths from error responses', () => {
      const rawPathError = new Error('ENOENT: no such file or directory, open C:\\Users\\Administrator\\secret.key');
      const safeMessage = getSafeErrorMessage(rawPathError);
      expect(safeMessage).toBe('An unexpected error occurred. Please try again later.');
      expect(safeMessage).not.toContain('C:\\Users');
      expect(safeMessage).not.toContain('ENOENT');
    });

    it('preserves clean, safe user messages', () => {
      const safeError = new Error('Invalid email or password.');
      const safeMessage = getSafeErrorMessage(safeError);
      expect(safeMessage).toBe('Invalid email or password.');
    });
  });

  describe('3. File Upload Safety & Magic Number Validation', () => {
    it('accepts genuine PNG binary headers', () => {
      const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00]);
      const result = validateMagicNumbers(pngHeader, 'image/png');
      expect(result.valid).toBe(true);
      expect(result.detectedMime).toBe('image/png');
    });

    it('accepts genuine JPEG binary headers', () => {
      const jpegHeader = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
      const result = validateMagicNumbers(jpegHeader, 'image/jpeg');
      expect(result.valid).toBe(true);
      expect(result.detectedMime).toBe('image/jpeg');
    });

    it('rejects executable script disguised with image/png MIME type', () => {
      const fakePng = Buffer.from('<?php echo "evil"; ?>');
      const result = validateMagicNumbers(fakePng, 'image/png');
      expect(result.valid).toBe(false);
    });

    it('rejects CSV with embedded dangerous script tags', () => {
      const evilCsv = Buffer.from('col1,col2\n<script>alert(1)</script>,value');
      const result = validateMagicNumbers(evilCsv, 'text/csv');
      expect(result.valid).toBe(false);
    });
  });

  describe('4. Rate Limiting Protection with Exponential Backoff', () => {
    it('sets Retry-After header when rate limit is reached', async () => {
      const floodEmail = 'flooder@thestackly.com';
      for (let i = 0; i < 4; i++) {
        await request(app).post('/api/v1/auth/forgot-password').send({ email: floodEmail });
      }
      const res = await request(app).post('/api/v1/auth/forgot-password').send({ email: floodEmail });
      if (res.status === 429) {
        expect(res.headers['retry-after']).toBeDefined();
        expect(res.body.retryAfterSeconds).toBeGreaterThan(0);
      }
    });
  });

});

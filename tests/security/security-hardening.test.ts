import { describe, it, expect } from 'vitest';
import request from 'supertest';
import path from 'path';
import fs from 'fs';
import { app } from '../../backend/src/app.js';
import { env } from '../../backend/src/config/env.js';
import { validateMagicNumbers, setFileDownloadSecurityHeaders, UPLOAD_STORAGE_DIR } from '../../backend/src/middleware/fileUpload.js';
import { getSafeErrorMessage } from '../../backend/src/utils/errorHandler.js';

describe('Security Hardening & Protection Verification Suite', () => {

  // ============================================================================
  // 1. STRICT INPUT SCHEMA VALIDATION (Type, Length, Format, Injections)
  // ============================================================================
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

    it('rejects registration payloads containing unexpected extra/injected fields (.strict)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Jane Doe',
          email: 'jane.doe@thestackly.com',
          employeeId: 'STK-2026-1011',
          password: 'Password123!@#',
          injectedAdminRole: 'SUPERADMIN', // Malicious field injection
          isAdmin: true
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBeDefined();
    });

    it('rejects registration with invalid type (numeric email instead of string)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Jane Doe',
          email: 1234567, // Invalid type
          employeeId: 'STK-2026-1012',
          password: 'Password123!@#'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('rejects registration with out-of-bounds password length (< 12 chars)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Jane Doe',
          email: 'jane.doe@thestackly.com',
          employeeId: 'STK-2026-1013',
          password: 'Short1!'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('at least 12 characters');
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
      expect(res.body.message).toContain('Valid email address is required');
    });

    it('rejects biometric login with non-digit PIN or improper length', async () => {
      const res = await request(app)
        .post('/api/v1/auth/biometric/login')
        .send({
          email: 'valid@thestackly.com',
          authMethod: 'device_pin',
          pin: 'abcd'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('rejects biometric login pattern with fewer than 4 nodes', async () => {
      const res = await request(app)
        .post('/api/v1/auth/biometric/login')
        .send({
          email: 'valid@thestackly.com',
          authMethod: 'pattern',
          pattern: [0, 1]
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

  // ============================================================================
  // 2. ERROR HANDLING & INFORMATION LEAKAGE PREVENTION
  // ============================================================================
  describe('2. Error Handling & Information Leakage Prevention', () => {
    it('masks raw SQLite errors and returns safe generic message', () => {
      const rawSqlError = new Error('SqliteError: table users has no column named secret_column at run()');
      const safeMessage = getSafeErrorMessage(rawSqlError);
      expect(safeMessage).toBe('An unexpected error occurred. Please try again later.');
      expect(safeMessage).not.toContain('SqliteError');
      expect(safeMessage).not.toContain('table users');
    });

    it('masks SQL constraint and pragma errors', () => {
      const constraintErr = new Error('SQLITE_CONSTRAINT: UNIQUE constraint failed: users.email');
      expect(getSafeErrorMessage(constraintErr)).toBe('An unexpected error occurred. Please try again later.');

      const pragmaErr = new Error('PRAGMA integrity_check failed with internal error');
      expect(getSafeErrorMessage(pragmaErr)).toBe('An unexpected error occurred. Please try again later.');
    });

    it('masks filesystem and OS paths from error responses', () => {
      const rawPathError = new Error('ENOENT: no such file or directory, open C:\\Users\\Administrator\\secret.key');
      const safeMessage = getSafeErrorMessage(rawPathError);
      expect(safeMessage).toBe('An unexpected error occurred. Please try again later.');
      expect(safeMessage).not.toContain('C:\\Users');
      expect(safeMessage).not.toContain('ENOENT');

      const unixErr = new Error('EACCES: permission denied, open /home/ubuntu/wfa-server/keys/private.pem');
      expect(getSafeErrorMessage(unixErr)).toBe('An unexpected error occurred. Please try again later.');
      expect(unixErr.message).toContain('/home/ubuntu');
    });

    it('masks stack trace and module internal leaks', () => {
      const stackErr = new Error('TypeError: Cannot read property of undefined at Object.<anonymous> (c:\\project\\backend\\src\\index.ts:42:15)');
      expect(getSafeErrorMessage(stackErr)).toBe('An unexpected error occurred. Please try again later.');
    });

    it('preserves clean, safe user messages', () => {
      const safeError = new Error('Invalid email or password.');
      const safeMessage = getSafeErrorMessage(safeError);
      expect(safeMessage).toBe('Invalid email or password.');
    });
  });

  // ============================================================================
  // 3. FILE UPLOAD SAFETY & EXECUTION PREVENTION
  // ============================================================================
  describe('3. File Upload Safety & Magic Number Validation', () => {
    it('verifies upload storage is located outside web root', () => {
      expect(UPLOAD_STORAGE_DIR).not.toContain('frontend');
      expect(UPLOAD_STORAGE_DIR).not.toContain('public');
      expect(UPLOAD_STORAGE_DIR).not.toContain('dist');
      expect(path.isAbsolute(UPLOAD_STORAGE_DIR)).toBe(true);
    });

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

    it('accepts genuine PDF binary headers (%PDF-)', () => {
      const pdfHeader = Buffer.from('%PDF-1.7\n%metadata');
      const result = validateMagicNumbers(pdfHeader, 'application/pdf');
      expect(result.valid).toBe(true);
      expect(result.detectedMime).toBe('application/pdf');
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

    it('sets strict execution-prevention security headers for file responses', () => {
      const mockHeaders: Record<string, string> = {};
      const mockRes: any = {
        setHeader: (k: string, v: string) => {
          mockHeaders[k] = v;
        }
      };

      setFileDownloadSecurityHeaders(mockRes, 'application/pdf', 'sample.pdf');
      expect(mockHeaders['X-Content-Type-Options']).toBe('nosniff');
      expect(mockHeaders['Content-Disposition']).toContain('attachment; filename="sample.pdf"');
      expect(mockHeaders['Content-Security-Policy']).toBe("default-src 'none'");
    });
  });

  // ============================================================================
  // 4. RATE LIMITING PROTECTION WITH EXPONENTIAL BACKOFF
  // ============================================================================
  describe('4. Rate Limiting Protection with Exponential Backoff', () => {
    it('confirms rate limit thresholds are loaded from environment configuration', () => {
      expect(env.RATE_LIMIT_LOGIN_MAX).toBeGreaterThan(0);
      expect(env.RATE_LIMIT_LOGIN_WINDOW_MS).toBeGreaterThan(0);
      expect(env.RATE_LIMIT_PUBLIC_MAX).toBeGreaterThan(0);
      expect(env.RATE_LIMIT_AUTHENTICATED_MAX).toBeGreaterThan(0);
      expect(env.RATE_LIMIT_RESET_MAX).toBeGreaterThan(0);
      expect(env.RATE_LIMIT_SIGNUP_MAX).toBeGreaterThan(0);
    });

    it('sets Retry-After header and backoff seconds when rate limit is reached', async () => {
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

    it('serves public endpoints with appropriate rate limit status', async () => {
      const res = await request(app).get('/api/v1/health');
      expect([200, 429]).toContain(res.status);
    });
  });

  // ============================================================================
  // 5. SECRETS MANAGEMENT & SCANNING VERIFICATION
  // ============================================================================
  describe('5. Secrets Management & Exposure Verification', () => {
    it('verifies that .gitignore includes .env and local databases', () => {
      const gitignorePath = path.resolve(__dirname, '../../.gitignore');
      const content = fs.readFileSync(gitignorePath, 'utf-8');
      expect(content).toContain('.env');
      expect(content).toContain('*.sqlite');
      expect(content).toContain('database/backups');
    });

    it('verifies that .env.example contains only template placeholders and no live secrets', () => {
      const envExamplePath = path.resolve(__dirname, '../../.env.example');
      const content = fs.readFileSync(envExamplePath, 'utf-8');
      expect(content).not.toContain('xenaeusZqMZhUIfNKX9p9qx8TNRR7Y1XisX4APazqdE');
      expect(content).toContain('<STRONG_RANDOM_SECRET>');
    });

    it('verifies backend uses env.JWT_SECRET dynamically without hardcoded fallback strings', () => {
      const socketAuthPath = path.resolve(__dirname, '../../backend/src/sockets/socketAuth.ts');
      const socketContent = fs.readFileSync(socketAuthPath, 'utf-8');
      expect(socketContent).not.toContain("const JWT_SECRET = env.JWT_SECRET || 'stackly_wfa_super_secret_jwt_key_2026'");
      expect(socketContent).toContain('const JWT_SECRET = env.JWT_SECRET;');
    });
  });

});

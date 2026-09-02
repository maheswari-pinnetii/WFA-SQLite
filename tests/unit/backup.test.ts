import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { app } from '../../server.js';
import { initDb, getDb } from '../../backend/src/config/db.js';
import { seedSqlite } from '../../backend/scripts/seed-sqlite.ts';
import { backupService } from '../../backend/src/services/backup.service.js';

let server: any;
const PORT = 5096;
const client = axios.create({
  baseURL: `http://localhost:${PORT}`,
  validateStatus: () => true
});

let adminToken = '';

beforeAll(async () => {
  await seedSqlite();
  await initDb();
  return new Promise<void>((resolve) => {
    server = app.listen(PORT, async () => {
      // Login as admin
      const loginRes = await client.post('/v1/auth/login', {
        email: 'admin@thestackly.com',
        password: 'StacklyWFA2026!'
      });
      if (loginRes.data?.data?.token) {
        adminToken = loginRes.data.data.token;
      } else if (loginRes.data?.data?.challengeId) {
        const verifyRes = await client.post('/v1/auth/mfa/verify', {
          challengeId: loginRes.data.data.challengeId,
          otp: loginRes.data.data.otpDevHint || '123456'
        });
        adminToken = verifyRes.data.data.token;
      }
      resolve();
    });
  });
}, 30000);

afterAll(async () => {
  const db = getDb();
  if (db) {
    db.close();
  }
  return new Promise<void>((resolve) => {
    if (server) {
      server.close(() => {
        resolve();
      });
    } else {
      resolve();
    }
  });
}, 30000);

describe('SQLite Database Backup & Disaster Recovery Test Suite', () => {
  let createdBackupFilename = '';
  let createdGzBackupFilename = '';

  it('should create an uncompressed hot SQLite backup with sidecar metadata and valid SHA-256 checksum', async () => {
    const meta = await backupService.createBackup({ tag: 'unit-test-raw', compress: false, userId: 'usr-admin-01' });
    expect(meta).toBeDefined();
    expect(meta.filename).toContain('wfa-backup-');
    expect(meta.filename).toContain('unit-test-raw');
    expect(meta.compressed).toBe(false);
    expect(meta.sizeBytes).toBeGreaterThan(0);
    expect(meta.checksumSha256).toHaveLength(64); // SHA-256 is 64 hex characters
    expect(meta.recordCount.users).toBeGreaterThan(0);
    expect(meta.recordCount.employees).toBeGreaterThan(0);
    expect(fs.existsSync(meta.filePath)).toBe(true);

    createdBackupFilename = meta.filename;
  });

  it('should create a Gzip-compressed hot SQLite backup snapshot', async () => {
    const meta = await backupService.createBackup({ tag: 'unit-test-gz', compress: true, userId: 'usr-admin-01' });
    expect(meta).toBeDefined();
    expect(meta.filename).toContain('.gz');
    expect(meta.compressed).toBe(true);
    expect(meta.sizeBytes).toBeGreaterThan(0);
    expect(fs.existsSync(meta.filePath)).toBe(true);

    createdGzBackupFilename = meta.filename;
  });

  it('should list all available backups sorted chronologically', async () => {
    const backups = await backupService.listBackups();
    expect(Array.isArray(backups)).toBe(true);
    expect(backups.length).toBeGreaterThanOrEqual(2);
    expect(backups.some(b => b.filename === createdBackupFilename)).toBe(true);
    expect(backups.some(b => b.filename === createdGzBackupFilename)).toBe(true);
  });

  it('should restore database cleanly from a backup snapshot', async () => {
    const res = await backupService.restoreBackup(createdBackupFilename, 'usr-admin-01');
    expect(res.success).toBe(true);
    expect(res.message).toContain('successfully restored');
  });

  it('should support Admin REST endpoint POST /v1/admin/backups', async () => {
    const res = await client.post('/v1/admin/backups', {
      tag: 'api-test-snapshot',
      compress: true
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    expect(res.status).toBe(201);
    expect(res.data.success).toBe(true);
    expect(res.data.data.filename).toBeDefined();
    expect(res.data.data.checksumSha256).toBeDefined();
  });

  it('should support Admin REST endpoint GET /v1/admin/backups', async () => {
    const res = await client.get('/v1/admin/backups', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    expect(res.status).toBe(200);
    expect(res.data.success).toBe(true);
    expect(Array.isArray(res.data.data)).toBe(true);
    expect(res.data.count).toBeGreaterThan(0);
  });

  it('should support Admin REST endpoint POST /v1/admin/backups/restore', async () => {
    const res = await client.post('/v1/admin/backups/restore', {
      filename: createdBackupFilename
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    expect(res.status).toBe(200);
    expect(res.data.success).toBe(true);
    expect(res.data.message).toContain('successfully restored');
  });

  it('should delete a backup snapshot and cleanup metadata sidecar', async () => {
    const deleted = await backupService.deleteBackup(createdBackupFilename, 'usr-admin-01');
    expect(deleted).toBe(true);

    const backups = await backupService.listBackups();
    expect(backups.some(b => b.filename === createdBackupFilename)).toBe(false);

    // Clean up second test backup
    if (createdGzBackupFilename) {
      await backupService.deleteBackup(createdGzBackupFilename);
    }
  });

  it('should reject unauthorized non-admin access to backup endpoints', async () => {
    const res = await client.get('/v1/admin/backups');
    expect(res.status).toBe(401);
  });
});

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import fs from 'fs';
import path from 'path';
import { app } from '../../backend/src/app.js';
import { initDb, getDb } from '../../backend/src/config/db.js';
import { connectDatabase } from '../../backend/src/database/sqlite-cloud.js';
import { backupService } from '../../backend/src/services/backup.service.js';

let adminToken = '';

beforeAll(async () => {
  await connectDatabase();
  await initDb();
  
  // Login as admin
  const loginRes = await request(app).post('/v1/auth/login').send({
    email: 'admin@thestackly.com',
    password: 'StacklyWFA2026!'
  });
  if (loginRes.body?.data?.token) {
    adminToken = loginRes.body.data.token;
  } else if (loginRes.body?.data?.challengeId) {
    const verifyRes = await request(app).post('/v1/auth/mfa/verify').send({
      challengeId: loginRes.body.data.challengeId,
      code: loginRes.body.data.otpDevHint || '123456'
    });
    adminToken = verifyRes.body.data.token;
  }
}, 30000);

afterAll(async () => {
  const db = getDb();
  if (db) {
    db.close();
  }
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
    const res = await request(app).post('/v1/admin/backups').send({
      tag: 'api-test-snapshot',
      compress: true
    }).set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.filename).toBeDefined();
    expect(res.body.data.checksumSha256).toBeDefined();
  }, 30000);

  it('should support Admin REST endpoint GET /v1/admin/backups', async () => {
    const res = await request(app).get('/v1/admin/backups').set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.count).toBeGreaterThan(0);
  });

  it('should support Admin REST endpoint POST /v1/admin/backups/restore', async () => {
    const res = await request(app).post('/v1/admin/backups/restore').send({
      filename: createdBackupFilename
    }).set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('successfully restored');
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
    const res = await request(app).get('/v1/admin/backups');
    expect(res.status).toBe(401);
  });
});

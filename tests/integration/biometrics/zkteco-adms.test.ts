import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../../backend/src/app.js';
import { connectDatabase, execute, query } from '../../../backend/src/database/sqlite-cloud.js';
import { v4 as uuidv4 } from 'uuid';

describe('ZKTeco / Matrix ADMS Gateway', () => {
  const testSN = 'ZK_TEST_123';
  const orgId = 'org-stackly';
  const empId = uuidv4();
  const empCode = 'ZKT-EMP-001';

  beforeAll(async () => {
    await connectDatabase();
    // Insert a test employee
    await execute(`
      INSERT INTO employees (
        id, employeeCode, name, email, status, organizationId, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [empId, empCode, 'Biometric Test User', 'bio@test.com', 'ACTIVE', orgId, new Date().toISOString(), new Date().toISOString()]);
  });

  afterAll(async () => {
    // Cleanup
    await execute('DELETE FROM attendance_events WHERE deviceId = ?', [testSN]);
    await execute('DELETE FROM employees WHERE id = ?', [empId]);
  });

  it('should handle device handshake (GET /iclock/cdata)', async () => {
    const res = await request(app).get(`/iclock/cdata?SN=${testSN}`);
    expect(res.status).toBe(200);
    expect(res.text.trim()).toBe('OK');
  });

  it('should handle get request (GET /iclock/getrequest)', async () => {
    const res = await request(app).get(`/iclock/getrequest?SN=${testSN}`);
    expect(res.status).toBe(200);
    expect(res.text.trim()).toBe('OK');
  });

  it('should process biometric push data (POST /iclock/cdata)', async () => {
    // Format: PIN\tTime\tState\tVerifyMethod
    const payload = `${empCode}\t2026-09-23 09:00:00\t0\t1\n${empCode}\t2026-09-23 18:00:00\t1\t1\n`;

    const res = await request(app)
      .post(`/iclock/cdata?SN=${testSN}&table=ATTLOG`)
      .set('Content-Type', 'text/plain')
      .send(payload);

    expect(res.status).toBe(200);
    expect(res.text.trim()).toBe('OK');

    // Verify events were inserted
    const events = await query('SELECT * FROM attendance_events WHERE deviceId = ? ORDER BY eventTimestamp ASC', [testSN]);
    expect(events.length).toBe(2);
    
    expect(events[0].employeeId).toBe(empId);
    expect(events[0].eventType).toBe('CHECK_IN');
    expect(events[0].source).toBe('biometric');
    
    expect(events[1].employeeId).toBe(empId);
    expect(events[1].eventType).toBe('CHECK_OUT');
  });

  it('should reject requests without SN', async () => {
    const res = await request(app).get('/iclock/cdata');
    expect(res.status).toBe(400);
    expect(res.text).toContain('Missing SN');
  });
});

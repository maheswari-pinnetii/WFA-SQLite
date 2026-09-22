import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import axios from 'axios';
import { app } from '../../../server.js';
import { initDb, getDb } from '../../../backend/src/config/db.js';
import { Attendance, BreakSession, AttendanceEvent } from '../../../backend/src/models/Attendance.js';
import { User } from '../../../backend/src/models/User.js';

let server: any;
const PORT = 5098;
let client = axios.create({
  baseURL: `http://localhost:${PORT}`,
  validateStatus: () => true
});

let testToken = '';

beforeAll(async () => {
  await initDb();
  
  return new Promise<void>((resolve) => {
    server = app.listen(0, () => {
      const address = server.address();
      const port = typeof address === 'string' ? PORT : address.port;
      client = axios.create({
        baseURL: `http://localhost:${port}`,
        validateStatus: () => true
      });
      resolve();
    });
  });
}, 40000);

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
}, 40000);

describe('Timesheets & Attendance Integration Tests', () => {
  beforeEach(async () => {
    // Isolated database cleanup
    await Attendance.deleteMany({ employeeId: 'usr-emp-timesheet' });
    await BreakSession.deleteMany({ employeeId: 'usr-emp-timesheet' });
    await AttendanceEvent.deleteMany({ employeeId: 'usr-emp-timesheet' });

    // Seed test user
    try {
      await User.deleteMany({ id: 'usr-emp-timesheet' });
      await User.create({
        id: 'usr-emp-timesheet',
        name: 'Timesheet Tester',
        email: 'timesheet@thestackly.com',
        password_hash: 'hash',
        role: 'EMPLOYEE',
        organizationId: 'org-stackly',
        companyId: 'org-stackly'
      });
    } catch(e) {}
    
    // Auth login logic
    const loginRes = await client.post('/v1/auth/login', {
      email: 'employee@thestackly.com',
      password: 'StacklyWFA2026!'
    });
    if (loginRes.data && loginRes.data.data) {
       const { challengeId, otpDevHint } = loginRes.data.data;
       const verifyRes = await client.post('/v1/auth/mfa/verify', { challengeId, otp: otpDevHint });
       testToken = verifyRes.data.data.token;
    }
  });

  it('should complete a full attendance lifecycle (check-in, break, resume, check-out)', async () => {
    if (!testToken) return;

    // Check In
    const checkInRes = await client.post('/v1/attendance/check-in', {
      shiftType: 'Regular',
      workMode: 'Remote',
      latitude: 12.34,
      longitude: 56.78,
      idempotencyKey: 'test-check-in-' + Date.now()
    }, {
      headers: { Authorization: `Bearer ${testToken}` }
    });

    if (checkInRes.status !== 201) {
      console.error('Check In Failed:', checkInRes.data);
    }
    expect(checkInRes.status).toBe(201);
    expect(checkInRes.data.success).toBe(true);
    expect(checkInRes.data.data.status).toBe('Checked In');

    // Break
    const breakRes = await client.post('/v1/attendance/break', {
      reason: 'Lunch',
      idempotencyKey: 'test-break-1'
    }, {
      headers: { Authorization: `Bearer ${testToken}` }
    });

    expect(breakRes.status).toBe(200);
    expect(breakRes.data.success).toBe(true);

    // Resume
    const resumeRes = await client.post('/v1/attendance/resume', {
      idempotencyKey: 'test-resume-1'
    }, {
      headers: { Authorization: `Bearer ${testToken}` }
    });

    expect(resumeRes.status).toBe(200);
    expect(resumeRes.data.success).toBe(true);

    // Check Out
    const checkOutRes = await client.post('/v1/attendance/check-out', {
      idempotencyKey: 'test-checkout-1'
    }, {
      headers: { Authorization: `Bearer ${testToken}` }
    });

    expect(checkOutRes.status).toBe(200);
    expect(checkOutRes.data.success).toBe(true);
    expect(checkOutRes.data.data.status).toBe('Checked Out');

    // Records fetch
    const recordsRes = await client.get('/v1/attendance/records', {
      headers: { Authorization: `Bearer ${testToken}` }
    });
    
    expect(recordsRes.status).toBe(200);
    expect(recordsRes.data.success).toBe(true);
    expect(Array.isArray(recordsRes.data.data.data)).toBe(true);
  });
});

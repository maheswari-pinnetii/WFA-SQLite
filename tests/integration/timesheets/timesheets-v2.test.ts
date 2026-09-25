import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import axios from 'axios';
import { app } from '../../../backend/src/server.js';
import { initDb, getDb } from '../../../backend/src/config/db.js';

let server: any;
const PORT = 5099;
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
  if (db) db.close();
  return new Promise<void>((resolve) => {
    if (server) {
      server.close(() => resolve());
    } else {
      resolve();
    }
  });
});

describe('Phase 6 Timesheet Management', () => {
  it('should authenticate user', async () => {
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

  const getHeaders = () => ({ headers: { Authorization: `Bearer ${testToken}` } });

  it('should fetch seeded projects', async () => {
    const res = await client.get('/api/projects', getHeaders());
    expect(res.status).toBe(200);
    expect(res.data.success).toBe(true);
    expect(res.data.data.length).toBeGreaterThan(0);
  });

  let createdTimesheetId = '';

  it('should create and submit a timesheet', async () => {
    const projectsRes = await client.get('/api/projects', getHeaders());
    const projectId = projectsRes.data.data[0].id;

    const payload = {
      startDate: '2026-10-05',
      endDate: '2026-10-11',
      status: 'PENDING',
      totalHours: 40,
      entries: [
        { projectId, date: '2026-10-05', hours: 8, description: 'Worked on feature A' },
        { projectId, date: '2026-10-06', hours: 8, description: 'Worked on feature B' },
        { projectId, date: '2026-10-07', hours: 8, description: 'Meetings' },
        { projectId, date: '2026-10-08', hours: 8, description: 'Testing' },
        { projectId, date: '2026-10-09', hours: 8, description: 'Deployment' },
      ]
    };

    const res = await client.post('/api/timesheets', payload, getHeaders());
    expect(res.status).toBe(200);
    expect(res.data.success).toBe(true);
    createdTimesheetId = res.data.data.timesheetId;
  });

  it('should fetch the created timesheet by id', async () => {
    const res = await client.get(`/api/timesheets/${createdTimesheetId}`, getHeaders());
    expect(res.status).toBe(200);
    expect(res.data.success).toBe(true);
    expect(res.data.data.totalHours).toBe(40);
    expect(res.data.data.entries.length).toBe(5);
  });

  it('should appear in my timesheets list', async () => {
    const res = await client.get('/api/timesheets', getHeaders());
    expect(res.status).toBe(200);
    expect(res.data.success).toBe(true);
    expect(res.data.data.some((ts: any) => ts.id === createdTimesheetId)).toBe(true);
  });

});

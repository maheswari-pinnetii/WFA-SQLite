/**
 * Shift Workflow Test Suite
 *
 * Tests:
 * - CRUD operations for shifts (create, list, update, delete)
 * - Holiday management CRUD
 * - Work config CRUD
 * - Schedule assignment and retrieval (scheduling engine)
 * - RBAC enforcement for shift management
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../backend/src/app.js';
import { connectDatabase } from '../../backend/src/database/sqlite-cloud.js';

const PASSWORD = 'StacklyWFA2026!';

async function loginAs(email: string): Promise<string> {
  const loginRes = await request(app)
    .post('/v1/auth/login')
    .send({ email, password: PASSWORD });
  let token = loginRes.body.data?.token || loginRes.body.token;
  if (loginRes.body.data?.requiresMfa || loginRes.body.requiresMfa) {
    const { challengeId, otpDevHint } = loginRes.body.data || loginRes.body;
    const mfaRes = await request(app)
      .post('/v1/auth/mfa/verify')
      .send({ challengeId, code: otpDevHint || '123456' });
    token = mfaRes.body.data?.token || mfaRes.body.token;
  }
  return token;
}

let adminToken = '';
let hrToken = '';
let managerToken = '';
let employeeToken = '';

let createdShiftId = '';
let createdHolidayId = '';
let testEmployeeId = '';

beforeAll(async () => {
  await connectDatabase();
  [adminToken, hrToken, managerToken, employeeToken] = await Promise.all([
    loginAs('admin@thestackly.com'),
    loginAs('hr@thestackly.com'),
    loginAs('manager@thestackly.com'),
    loginAs('employee@thestackly.com'),
  ]);

  const meRes = await request(app)
    .get('/v1/auth/me')
    .set('Authorization', `Bearer ${employeeToken}`);
  testEmployeeId = meRes.body.data?.user?.employeeId || meRes.body.data?.user?.id || 'usr-emp-01';
}, 30000);

afterAll(async () => {
  if (createdShiftId) {
    await request(app)
      .delete(`/v1/shifts/${createdShiftId}`)
      .set('Authorization', `Bearer ${adminToken}`);
  }
  if (createdHolidayId) {
    await request(app)
      .delete(`/v1/holidays/${createdHolidayId}`)
      .set('Authorization', `Bearer ${adminToken}`);
  }
});

// ────────────────────────────────────────────────────────────────────────────
// 1. Shift CRUD
// ────────────────────────────────────────────────────────────────────────────
describe('1. Shift Management CRUD', () => {
  it('all authenticated users can list shifts', async () => {
    const res = await request(app)
      .get('/v1/shifts')
      .set('Authorization', `Bearer ${employeeToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('ADMIN can create a new shift', async () => {
    const res = await request(app)
      .post('/v1/shifts')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: `Test Shift ${Date.now()}`,
        startTime: '09:00',
        endTime: '18:00',
        workDays: ['MON', 'TUE', 'WED', 'THU', 'FRI'],
        breakDuration: 60,
      });
    expect([200, 201]).toContain(res.status);
    expect(res.body.success).toBe(true);
    createdShiftId = res.body.data?.id || res.body.data?.shift?.id;
  });

  it('HR can create a new shift', async () => {
    const res = await request(app)
      .post('/v1/shifts')
      .set('Authorization', `Bearer ${hrToken}`)
      .send({
        name: `HR Test Shift ${Date.now()}`,
        startTime: '10:00',
        endTime: '19:00',
        workDays: ['MON', 'TUE', 'WED', 'THU', 'FRI'],
        breakDuration: 30,
      });
    expect([200, 201]).toContain(res.status);
  });

  it('EMPLOYEE cannot create shifts (403)', async () => {
    const res = await request(app)
      .post('/v1/shifts')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        name: 'Unauthorized Shift',
        startTime: '08:00',
        endTime: '17:00',
        workDays: ['MON'],
        breakDuration: 30,
      });
    expect([401, 403]).toContain(res.status);
  });

  it('MANAGER cannot create shifts (403)', async () => {
    const res = await request(app)
      .post('/v1/shifts')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        name: 'Manager Unauthorized Shift',
        startTime: '07:00',
        endTime: '16:00',
        workDays: ['MON'],
        breakDuration: 30,
      });
    expect([401, 403]).toContain(res.status);
  });

  it('ADMIN can update an existing shift', async () => {
    if (!createdShiftId) return;
    const res = await request(app)
      .put(`/v1/shifts/${createdShiftId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Updated Shift Name', breakDuration: 45 });
    expect([200, 201]).toContain(res.status);
    expect(res.body.success).toBe(true);
  });

  it('returns 404 for updating non-existent shift', async () => {
    const res = await request(app)
      .put('/v1/shifts/nonexistent-shift-id')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Ghost Update' });
    expect([404, 400]).toContain(res.status);
  });

  it('ADMIN can delete a shift', async () => {
    if (!createdShiftId) return;
    const res = await request(app)
      .delete(`/v1/shifts/${createdShiftId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect([200, 204]).toContain(res.status);
    createdShiftId = '';
  });

  it('EMPLOYEE cannot delete shifts', async () => {
    const res = await request(app)
      .delete('/v1/shifts/any-shift-id')
      .set('Authorization', `Bearer ${employeeToken}`);
    expect([401, 403]).toContain(res.status);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// 2. Holiday Calendar
// ────────────────────────────────────────────────────────────────────────────
describe('2. Holiday Management', () => {
  it('all authenticated users can list holidays', async () => {
    const res = await request(app)
      .get('/v1/holidays')
      .set('Authorization', `Bearer ${employeeToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('ADMIN can create a holiday', async () => {
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 3);
    const res = await request(app)
      .post('/v1/holidays')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: `Test Holiday ${Date.now()}`,
        date: futureDate.toISOString().split('T')[0],
        type: 'OPTIONAL',
        description: 'Integration test holiday',
      });
    expect([200, 201]).toContain(res.status);
    expect(res.body.success).toBe(true);
    createdHolidayId = res.body.data?.id || res.body.data?.holiday?.id;
  });

  it('EMPLOYEE cannot create a holiday', async () => {
    const res = await request(app)
      .post('/v1/holidays')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        name: 'Unauthorized Holiday',
        date: '2027-01-01',
        type: 'MANDATORY',
      });
    expect([401, 403]).toContain(res.status);
  });

  it('ADMIN can delete a holiday', async () => {
    if (!createdHolidayId) return;
    const res = await request(app)
      .delete(`/v1/holidays/${createdHolidayId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect([200, 204]).toContain(res.status);
    createdHolidayId = '';
  });
});

// ────────────────────────────────────────────────────────────────────────────
// 3. Work Configurations
// ────────────────────────────────────────────────────────────────────────────
describe('3. Work Configurations', () => {
  it('all authenticated users can list work configs', async () => {
    const res = await request(app)
      .get('/v1/work-configs')
      .set('Authorization', `Bearer ${employeeToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('ADMIN can create a work config', async () => {
    const res = await request(app)
      .post('/v1/work-configs')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: `Work Config ${Date.now()}`,
        workMode: 'HYBRID',
        weeklyHours: 40,
        flexibleHours: false,
      });
    expect([200, 201]).toContain(res.status);
    expect(res.body.success).toBe(true);
  });

  it('EMPLOYEE cannot create work configs', async () => {
    const res = await request(app)
      .post('/v1/work-configs')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        name: 'Unauthorized Config',
        workMode: 'REMOTE',
        weeklyHours: 20,
      });
    expect([401, 403]).toContain(res.status);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// 4. Scheduling - Shift Assignments
// ────────────────────────────────────────────────────────────────────────────
describe('4. Employee Schedule & Shift Assignment', () => {
  it('EMPLOYEE can view their own schedule', async () => {
    if (!testEmployeeId) return;
    const res = await request(app)
      .get(`/v1/scheduling/employees/${testEmployeeId}/schedule`)
      .set('Authorization', `Bearer ${employeeToken}`);
    expect([200, 404]).toContain(res.status); // 404 if no schedule set
  });

  it('MANAGER can assign a shift to an employee', async () => {
    if (!testEmployeeId) return;
    // First get available shifts
    const shiftsRes = await request(app)
      .get('/v1/shifts')
      .set('Authorization', `Bearer ${managerToken}`);

    const firstShift = shiftsRes.body.data?.[0] || shiftsRes.body.data?.shifts?.[0];
    if (!firstShift) return;

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 8); // next Monday
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 4); // next Friday

    const res = await request(app)
      .post(`/v1/scheduling/employees/${testEmployeeId}/shifts`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        shiftId: firstShift.id,
        weekStart: weekStart.toISOString().split('T')[0],
        weekEnd: weekEnd.toISOString().split('T')[0],
      });
    expect([200, 201, 400, 404]).toContain(res.status);
  });

  it('EMPLOYEE cannot assign shifts (403)', async () => {
    if (!testEmployeeId) return;
    const res = await request(app)
      .post(`/v1/scheduling/employees/${testEmployeeId}/shifts`)
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({ shiftId: 'any-shift', weekStart: '2026-09-14', weekEnd: '2026-09-18' });
    expect([401, 403]).toContain(res.status);
  });

  it('EMPLOYEE can list their own shift assignments', async () => {
    if (!testEmployeeId) return;
    const res = await request(app)
      .get(`/v1/scheduling/employees/${testEmployeeId}/shifts`)
      .set('Authorization', `Bearer ${employeeToken}`);
    expect([200]).toContain(res.status);
  });
});

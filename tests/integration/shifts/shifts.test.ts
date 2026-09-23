import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../../../backend/src/app';

const loginUser = async (email: string, password: string): Promise<string> => {
  const loginRes = await request(app).post('/api/auth/login').send({ email, password });
  if (loginRes.body.data?.challengeId) {
    const verifyRes = await request(app).post('/api/auth/mfa/verify').send({
      challengeId: loginRes.body.data.challengeId,
      otp: loginRes.body.data.otpDevHint
    });
    return verifyRes.body.data.token;
  }
  return loginRes.body.token || loginRes.body.data?.token;
};

describe('Shift & Roster Management API Integration Tests', () => {
  let adminToken: string;
  let employeeId: string;
  let shiftId: string;

  beforeAll(async () => {
    // Login as Admin
    adminToken = await loginUser('admin@thestackly.com', 'StacklyWFA2026!');

    // Get an employee
    const empRes = await request(app)
      .get('/api/employees')
      .set('Authorization', `Bearer ${adminToken}`);
    employeeId = empRes.body.data.data[0].id;
  });



  it('should fetch shift templates', async () => {
    const res = await request(app)
      .get('/api/shifts')
      .set('Authorization', `Bearer ${adminToken}`);
      
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    shiftId = res.body.data[0].id; // Save for next test
  });

  it('should assign a shift to an employee', async () => {
    const res = await request(app)
      .post(`/api/scheduling/employees/${employeeId}/shifts`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        shiftId,
        startDate: '2023-11-01'
      });
      
    if (res.status !== 201) console.log('Assign shift error:', res.body);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should prevent assigning a shift on the same date twice', async () => {
    const res = await request(app)
      .post(`/api/scheduling/employees/${employeeId}/shifts`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        shiftId,
        startDate: '2023-11-01'
      });
      
    expect(res.status).toBe(409); // Conflict
  });

  it('should fetch department roster', async () => {
    // Get the employee's actual department to ensure they are in the result
    const empRes = await request(app)
      .get('/api/employees')
      .set('Authorization', `Bearer ${adminToken}`);
    const department = empRes.body.data.data[0].department || 'Engineering';

    const res = await request(app)
      .get(`/api/scheduling/departments/${department}/roster`)
      .query({ startDate: '2023-11-01', endDate: '2023-11-07' })
      .set('Authorization', `Bearer ${adminToken}`);
      
    if (res.status !== 200) console.log('Fetch roster error:', res.body);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    
    // Employee should have the shift assigned
    const employee = res.body.data.find((e: any) => e.id === employeeId);
    expect(employee).toBeDefined();
    if (employee) {
      expect(employee.shifts.length).toBeGreaterThan(0);
      expect(employee.shifts[0].startDate).toBe('2023-11-01');
    }
  });
});

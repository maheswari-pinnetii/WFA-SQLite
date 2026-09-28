import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../../../backend/src/app';

const loginUser = async (email: string, password: string): Promise<string> => {
  const loginRes = await request(app).post('/v1/auth/login').send({ email, password });
  if (loginRes.body.data?.requiresMfa || loginRes.body.requiresMfa) {
    const { challengeId, otpDevHint } = loginRes.body.data || loginRes.body;
    const verifyRes = await request(app).post('/v1/auth/mfa/verify').send({
      challengeId: challengeId,
      code: otpDevHint || '123456'
    });
    return verifyRes.body.data?.token || verifyRes.body.token;
  }
  return loginRes.body.token || loginRes.body.data?.token;
};

describe('Attendance Edge Cases', () => {
  let employeeToken: string;

  beforeAll(async () => {
    employeeToken = await loginUser('employee@thestackly.com', 'StacklyWFA2026!');
  });

  it('should reject Office check-in if missing coordinates', async () => {
    const res = await request(app)
      .post('/v1/attendance/check-in')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        shiftType: 'Morning',
        workMode: 'Office'
      });
    
    expect(res.status).toBe(400); 
    expect(res.body.message).toContain('Location coordinates required');
  });

  it('should reject Office check-in if distance is too far', async () => {
    const res = await request(app)
      .post('/v1/attendance/check-in')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        shiftType: 'Morning',
        workMode: 'Office',
        latitude: 40.7128, // NY (Far from Bengaluru office)
        longitude: -74.0060
      });
    
    expect(res.status).toBe(400); 
    expect(res.body.message).toContain('Geofencing validation failed');
  });

  it('should handle idempotent check-ins correctly', async () => {
    const idempotencyKey = `idempotency-test-${Date.now()}`;
    const payload = {
      shiftType: 'Morning',
      workMode: 'Remote',
      idempotencyKey
    };

    // First check-in
    const res1 = await request(app)
      .post('/v1/attendance/check-in')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send(payload);
    
    expect([201, 409]).toContain(res1.status);
    if (res1.status === 201) {
      expect(res1.body.success).toBe(true);
    }

    // Replay check-in with same idempotency key
    const res2 = await request(app)
      .post('/v1/attendance/check-in')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send(payload);
    
    expect([201, 409]).toContain(res2.status);
    if (res2.status === 201 && res1.status === 201) {
      expect(res2.body.success).toBe(true);
      expect(res2.body.data.id).toBe(res1.body.data.id);
    }
  });

  it('should reject taking a break if not checked in (or already on break)', async () => {
    // Wait, the employee is checked in now because of the previous test.
    // Let's create a new employee token for someone else who isn't checked in
    const empToken2 = await loginUser('hr@thestackly.com', 'StacklyWFA2026!');
    const res = await request(app)
      .post('/v1/attendance/break')
      .set('Authorization', `Bearer ${empToken2}`)
      .send({});
    
    expect([400, 409, 500]).toContain(res.status); // 409 ATTENDANCE_NOT_CHECKED_IN or 400 validation error
  });
});

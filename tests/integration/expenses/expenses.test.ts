import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import axios from 'axios';
import { app } from '../../../server.js';
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

describe('Expenses Integration Tests', () => {
  beforeEach(async () => {
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

  it('should allow an employee to submit an expense and fetch it', async () => {
    if (!testToken) return;

    // Submit Expense
    const submitRes = await client.post('/v1/expenses', {
      amount: 150,
      currency: 'USD',
      category: 'Travel',
      claimDate: '2026-09-22',
      description: 'Flight to NY',
      receiptUrl: '/uploads/receipt1.pdf'
    }, {
      headers: { Authorization: `Bearer ${testToken}` }
    });

    if (submitRes.status !== 201) {
      console.error('Expense Submit Failed:', submitRes.data);
    }
    expect(submitRes.status).toBe(200);
    expect(submitRes.data.success).toBe(true);

    // Get My Expenses
    const fetchRes = await client.get('/v1/expenses/me', {
      headers: { Authorization: `Bearer ${testToken}` }
    });
    
    expect(fetchRes.status).toBe(200);
    expect(fetchRes.data.success).toBe(true);
    expect(Array.isArray(fetchRes.data.data)).toBe(true);
    expect(fetchRes.data.data.length).toBeGreaterThan(0);
  });
});

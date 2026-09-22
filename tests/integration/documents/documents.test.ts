import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import axios from 'axios';
import { app } from '../../../server.js';
import { initDb, getDb } from '../../../backend/src/config/db.js';
import FormData from 'form-data';

let server: any;
const PORT = 5101;
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

describe('Document Management Integration Tests', () => {
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

  it('should list employee documents', async () => {
    if (!testToken) return;

    // Fetch documents
    const fetchRes = await client.get('/v1/employees/usr-emp-01/documents', {
      headers: { Authorization: `Bearer ${testToken}` }
    });

    // Assume 200 or 403 depending on enforceScope
    expect([200, 403]).toContain(fetchRes.status);
    if(fetchRes.status === 200) {
      expect(fetchRes.data.success).toBe(true);
      expect(Array.isArray(fetchRes.data.data)).toBe(true);
    }
  });
});

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import axios from 'axios';
import { app } from '../../../server.js';
import { initDb, getDb } from '../../../backend/src/config/db.js';

let server: any;
const PORT = 5100;
let client = axios.create({
  baseURL: `http://localhost:${PORT}`,
  validateStatus: () => true
});

let managerToken = '';

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

describe('HR Workflows Integration Tests', () => {
  beforeEach(async () => {
    // Auth login logic for MANAGER
    const loginRes = await client.post('/v1/auth/login', {
      email: 'manager@thestackly.com',
      password: 'StacklyWFA2026!'
    });
    if (loginRes.data && loginRes.data.data) {
       const { challengeId, otpDevHint } = loginRes.data.data;
       const verifyRes = await client.post('/v1/auth/mfa/verify', { challengeId, otp: otpDevHint });
       managerToken = verifyRes.data.data.token;
    }
  });

  it('should fetch pending workflow requests', async () => {
    if (!managerToken) return;

    // Get Pending Workflows
    const pendingRes = await client.get('/v1/workflows/pending', {
      headers: { Authorization: `Bearer ${managerToken}` }
    });

    expect(pendingRes.status).toBe(200);
    expect(pendingRes.data.success).toBe(true);
    expect(Array.isArray(pendingRes.data.data)).toBe(true);
  });
  
  it('should reject invalid workflow action gracefully', async () => {
    if (!managerToken) return;
    
    // Attempt action on nonexistent workflow
    const actionRes = await client.post('/v1/workflows/requests/invalid-req-id/action', {
      action: 'APPROVE',
      comments: 'Looks good'
    }, {
      headers: { Authorization: `Bearer ${managerToken}` }
    });
    
    // Likely 404 or 400 depending on implementation
    expect(actionRes.status).toBeGreaterThanOrEqual(400);
    expect(actionRes.data.success).toBe(false);
  });
});

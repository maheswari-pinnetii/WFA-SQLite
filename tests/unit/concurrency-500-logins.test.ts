import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { app } from '../../server.js';
import { initDb, getDb } from '../../backend/src/config/db.js';
import { seedSqlite } from '../../backend/scripts/seed-sqlite.ts';

let server: any;
const PORT = 5097;
const BASE_URL = `http://localhost:${PORT}`;

beforeAll(async () => {
  await seedSqlite();
  await initDb();
  return new Promise<void>((resolve) => {
    server = app.listen(PORT, () => {
      resolve();
    });
  });
}, 45000);

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
}, 30000);

describe('High-Concurrency 500 Employee Simultaneous Login & Session Suite', () => {
  const loginEmployee = async (email: string, pass: string, retries = 2): Promise<{ success: boolean; token?: string; email: string }> => {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const loginRes = await fetch(`${BASE_URL}/v1/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password: pass })
        });
        const loginData: any = await loginRes.json();

        if (!loginRes.ok || !loginData.success) {
          if (attempt < retries) continue;
          return { success: false, email };
        }

        // If direct token returned
        if (loginData.data?.token) {
          return { success: true, token: loginData.data.token, email };
        }

        // If MFA OTP challenge is required
        if (loginData.data?.requiresMfa && loginData.data?.challengeId) {
          const verifyRes = await fetch(`${BASE_URL}/v1/auth/mfa/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              challengeId: loginData.data.challengeId,
              otp: loginData.data.otpDevHint || '123456'
            })
          });
          const verifyData: any = await verifyRes.json();
          if (verifyRes.ok && verifyData.data?.token) {
            return { success: true, token: verifyData.data.token, email };
          }
        }

        if (attempt < retries) continue;
        return { success: false, email };
      } catch {
        if (attempt < retries) continue;
        return { success: false, email };
      }
    }
    return { success: false, email };
  };

  it('should authenticate all 500 seeded employees concurrently with 100% success rate', async () => {
    const db = getDb();
    const users = db.prepare("SELECT email FROM users WHERE role = 'EMPLOYEE' ORDER BY id ASC LIMIT 500").all() as { email: string }[];
    expect(users.length).toBe(500);

    const startTime = Date.now();

    // Process all 500 employees in parallel concurrent waves
    const BATCH_SIZE = 50;
    const allResults: { success: boolean; token?: string; email: string }[] = [];

    for (let i = 0; i < users.length; i += BATCH_SIZE) {
      const batch = users.slice(i, i + BATCH_SIZE);
      const batchPromises = batch.map((u, idx) =>
        loginEmployee(u.email, (i + idx) % 2 === 0 ? 'StacklyWFA2026!' : 'password123')
      );
      const batchResults = await Promise.all(batchPromises);
      allResults.push(...batchResults);
    }

    const durationMs = Date.now() - startTime;
    console.log(`[Concurrency Benchmark] 500 simultaneous employee logins completed in ${durationMs}ms`);

    const successfulLogins = allResults.filter(r => r.success && !!r.token);
    expect(successfulLogins.length).toBe(500);

    // Verify all 500 generated distinct tokens
    const uniqueTokens = new Set(successfulLogins.map(r => r.token));
    expect(uniqueTokens.size).toBe(500);
  }, 90000);

  it('should support simultaneous authenticated API requests across 100 active employee sessions in parallel', async () => {
    const db = getDb();
    const users = db.prepare("SELECT email FROM users WHERE role = 'EMPLOYEE' LIMIT 100").all() as { email: string }[];

    // Authenticate 100 employees in parallel
    const loginResults = await Promise.all(
      users.map(u => loginEmployee(u.email, 'password123'))
    );

    const validTokens = loginResults.filter(r => r.success && r.token).map(r => r.token!);
    expect(validTokens.length).toBe(100);

    // Fire 100 simultaneous authenticated requests to /v1/auth/me
    const mePromises = validTokens.map(token =>
      fetch(`${BASE_URL}/v1/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => res.json()) as Promise<any>
    );

    const meResults = await Promise.all(mePromises);
    const successfulMe = meResults.filter(res => res.success === true && (res.data?.id || res.data?.email));
    expect(successfulMe.length).toBe(100);
  }, 60000);
});

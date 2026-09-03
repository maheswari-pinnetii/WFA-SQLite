import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import axios from 'axios';
import { app } from '../../backend/src/app.js';
import { initDb, query, execute, getDb } from '../../backend/src/database/connection.js';
import { seedSqlite } from '../../backend/scripts/seed-sqlite.ts';

let server: any;
let client: any;

const testUser = {
  fullName: 'Passkey Test Pilot',
  employeeId: `STK-2026-${Date.now() % 100000}`,
  department: 'Engineering',
  role: 'EMPLOYEE',
  email: `pilot_${Date.now()}@thestackly.com`,
  password: 'EnterprisePilot2026!',
};

beforeAll(async () => {
  await seedSqlite();
  await initDb();
  return new Promise<void>((resolve) => {
    server = app.listen(0, () => {
      const address = server.address();
      const port = typeof address === 'string' ? 5088 : address.port;
      client = axios.create({
        baseURL: `http://localhost:${port}`,
        validateStatus: () => true,
      });
      resolve();
    });
  });
}, 30000);

afterAll(async () => {
  try {
    // Clean up test records
    await execute('DELETE FROM users WHERE email = ?', [testUser.email.toLowerCase()]);
    await execute('DELETE FROM passkey_challenges WHERE email = ?', [testUser.email.toLowerCase()]);
    const db = getDb();
    if (db && typeof db.close === 'function') {
      db.close();
    }
  } catch (err) {
    // ignore
  }

  return new Promise<void>((resolve) => {
    if (server) {
      server.close(() => resolve());
    } else {
      resolve();
    }
  });
}, 30000);

describe('Step 4: Auth Flow Backend & Database Integration Tests', () => {
  let createdUserId = '';
  let issuedToken = '';

  // --------------------------------------------------------------------
  // 4.1 Standard Registration & Login Endpoints
  // --------------------------------------------------------------------
  describe('4.1 Standard Auth Endpoints', () => {
    it('POST /api/auth/register - should create user in SQLite database and issue JWT', async () => {
      const res = await client.post('/api/v1/auth/register', {
        fullName: testUser.fullName,
        employeeId: testUser.employeeId,
        department: testUser.department,
        role: testUser.role,
        email: testUser.email,
        password: testUser.password,
      });

      expect(res.status).toBe(201);
      expect(res.data.success).toBe(true);
      expect(res.data.token).toBeDefined();
      expect(res.data.user.email).toBe(testUser.email.toLowerCase());
      expect(res.data.user.name).toBe(testUser.fullName);

      createdUserId = res.data.user.id;
      issuedToken = res.data.token;

      // Verify user persisted in SQLite database
      const dbRows = await query<any>('SELECT * FROM users WHERE id = ?', [createdUserId]);
      expect(dbRows).toHaveLength(1);
      expect(dbRows[0].email).toBe(testUser.email.toLowerCase());
      const employeeRows = await query<any>('SELECT * FROM employees WHERE id = ?', [createdUserId]);
      expect(employeeRows).toHaveLength(1);
      expect(employeeRows[0].employeeCode).toBe(testUser.employeeId);
      expect(employeeRows[0].role).toBe(testUser.role);
    });

    it('POST /api/auth/register - should reject duplicate email registration with 409', async () => {
      const res = await client.post('/api/v1/auth/register', {
        fullName: 'Duplicate Tester',
        employeeId: `STK-2026-${(Date.now() + 1) % 100000}`,
        email: testUser.email,
        password: 'AnotherPassword123!',
      });

      expect(res.status).toBe(409);
      expect(res.data.success).toBe(false);
      expect(res.data.error).toContain('already exists');
    });

    it('POST /api/auth/login - should authenticate valid credentials from SQLite and return JWT', async () => {
      const res = await client.post('/api/v1/auth/login', {
        email: testUser.email,
        password: testUser.password,
      });

      expect(res.status).toBe(200);
      expect(res.data.success).toBe(true);
      expect(res.data.token).toBeDefined();
      expect(res.data.user.email).toBe(testUser.email.toLowerCase());
    });

    it('POST /api/auth/login - should reject invalid password with 401', async () => {
      const res = await client.post('/api/v1/auth/login', {
        email: testUser.email,
        password: 'WrongPassword999!',
      });

      expect(res.status).toBe(401);
      expect(res.data.success).toBe(false);
      expect(res.data.error).toContain('Invalid email or password');
    });

    it('GET /api/auth/me - should return authenticated user profile with permissions', async () => {
      const res = await client.get('/api/v1/auth/me', {
        headers: { Authorization: `Bearer ${issuedToken}` },
      });

      expect(res.status).toBe(200);
      expect(res.data.success).toBe(true);
      expect(res.data.user.email).toBe(testUser.email.toLowerCase());
      expect(res.data.user.name).toBe(testUser.fullName);
      expect(Array.isArray(res.data.user.permissions)).toBe(true);
      expect(res.data.user.status).toBe('ACTIVE');
    });

    it('GET /api/auth/me - should reject request without authorization header with 401', async () => {
      const res = await client.get('/api/v1/auth/me');

      expect(res.status).toBe(401);
      expect(res.data.success).toBe(false);
      expect(res.data.error).toContain('Authorization header is required');
    });
  });

  // --------------------------------------------------------------------
  // 4.2 WebAuthn / Passkey Endpoints & SQLite Tables
  // --------------------------------------------------------------------
  describe('4.2 Passkey WebAuthn Endpoints & SQLite Persistence', () => {
    let registrationChallenge = '';
    const mockCredentialId = `cred_fido2_${Date.now()}`;

    it('POST /api/auth/passkey/register-options - should generate challenge and persist in passkey_challenges', async () => {
      const res = await client.post('/api/auth/passkey/register-options', {
        email: testUser.email,
        fullName: testUser.fullName,
      });

      expect(res.status).toBe(200);
      expect(res.data.success).toBe(true);
      expect(res.data.challenge).toBeDefined();
      expect(res.data.options.user.name).toBe(testUser.email.toLowerCase());
      expect(res.data.options.pubKeyCredParams).toBeDefined();

      registrationChallenge = res.data.challenge;

      // Verify challenge exists in SQLite table
      const challengeRows = await query<any>(
        'SELECT * FROM passkey_challenges WHERE challenge = ?',
        [registrationChallenge]
      );
      expect(challengeRows).toHaveLength(1);
      expect(challengeRows[0].type).toBe('register');
    });

    it('POST /api/auth/passkey/register-verify - should reject fabricated attestation data', async () => {
      const mockAttestation = {
        id: mockCredentialId,
        rawId: Buffer.from(mockCredentialId).toString('base64'),
        type: 'public-key',
        response: {
          clientDataJSON: Buffer.from('{"type":"webauthn.create"}').toString('base64'),
          attestationObject: Buffer.from('mock-attestation-bytes').toString('base64'),
          transports: ['internal', 'hybrid'],
        },
      };

      const res = await client.post('/api/auth/passkey/register-verify', {
        email: testUser.email,
        fullName: testUser.fullName,
        attestationResponse: mockAttestation,
      });

      expect(res.status).toBe(400);
      expect(res.data.success).toBe(false);

      // Verify credential record in SQLite database
      const credRows = await query<any>(
        'SELECT * FROM passkey_credentials WHERE credential_id = ?',
        [mockCredentialId]
      );
      expect(credRows).toHaveLength(0);
    });

    it('POST /api/auth/passkey/login-options - should reject accounts without a registered passkey', async () => {
      const res = await client.post('/api/auth/passkey/login-options', {
        email: testUser.email,
      });

      expect(res.status).toBe(404);
      expect(res.data.success).toBe(false);
      expect(res.data.error).toContain('No passkey');
    });

    it('POST /api/auth/passkey/login-verify - should reject an unknown credential', async () => {
      const mockAssertion = {
        id: mockCredentialId,
        rawId: Buffer.from(mockCredentialId).toString('base64'),
        type: 'public-key',
        response: {
          clientDataJSON: Buffer.from('{"type":"webauthn.get"}').toString('base64'),
          authenticatorData: Buffer.from('mock-auth-data').toString('base64'),
          signature: Buffer.from('mock-signature').toString('base64'),
        },
      };

      const res = await client.post('/api/auth/passkey/login-verify', {
        assertionResponse: mockAssertion,
      });

      expect(res.status).toBe(401);
      expect(res.data.success).toBe(false);
    });
  });
});

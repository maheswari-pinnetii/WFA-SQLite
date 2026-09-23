import request from 'supertest';
import { app } from '../../../backend/src/app';
import { execute } from '../../../backend/src/database/connection';
import { v4 as uuidv4 } from 'uuid';

describe('Phase 12: HR Documents', () => {
  let employeeToken: string;
  let adminToken: string;

  beforeAll(async () => {
    // Standard setup for users
    const employeeLogin = await request(app)
      .post('/v1/auth/login')
      .send({ email: 'employee@thestackly.com', password: 'StacklyWFA2026!' });
    
    if (!employeeLogin.body.data) {
        console.error('Login failed:', employeeLogin.body);
    }
    
    // Check if MFA is required (simulated login logic here might need the OTP dev hint)
    if (employeeLogin.body.data?.challengeId) {
      const code = employeeLogin.body.data.otpDevHint || '123456';
      const mfaRes = await request(app)
        .post('/v1/auth/mfa/verify')
        .send({ challengeId: employeeLogin.body.data.challengeId, code });
      employeeToken = mfaRes.body.data.token;
    } else {
      employeeToken = employeeLogin.body.data.token;
    }

    const adminLogin = await request(app)
      .post('/v1/auth/login')
      .send({ email: 'admin@thestackly.com', password: 'StacklyWFA2026!' });

    if (adminLogin.body.data?.challengeId) {
      const code = adminLogin.body.data.otpDevHint || '123456';
      const mfaRes = await request(app)
        .post('/v1/auth/mfa/verify')
        .send({ challengeId: adminLogin.body.data.challengeId, code });
      adminToken = mfaRes.body.data.token;
    } else {
      adminToken = adminLogin.body.data.token;
    }
  });

  afterAll(async () => {
    // Clean up uploaded test documents
    await execute(`DELETE FROM employee_documents WHERE documentType = 'TEST_DOC_123'`);
  });

  it('1. Employee should be able to upload a document', async () => {
    const res = await request(app)
      .post('/v1/documents')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        title: 'My Identification Proof',
        type: 'TEST_DOC_123',
        fileUrl: 'https://example.com/id.pdf'
      });
    
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
  });

  it('2. Employee should be able to retrieve their own documents', async () => {
    const res = await request(app)
      .get('/v1/documents/me')
      .set('Authorization', `Bearer ${employeeToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    
    const uploadedDoc = res.body.data.find((d: any) => d.type === 'TEST_DOC_123');
    expect(uploadedDoc).toBeDefined();
    expect(uploadedDoc.title).toBe('My Identification Proof');
    expect(uploadedDoc.fileUrl).toBe('https://example.com/id.pdf');
  });

  it('3. Should require type and fileUrl to upload a document', async () => {
    const res = await request(app)
      .post('/v1/documents')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({ title: 'No File URL' });
    
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

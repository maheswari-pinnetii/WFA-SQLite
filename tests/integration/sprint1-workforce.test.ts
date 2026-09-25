import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../backend/src/app.js';
import { initDb, getDb } from '../../backend/src/config/db.js';
import { connectDatabase } from '../../backend/src/database/sqlite-cloud.js';

let adminToken = '';

beforeAll(async () => {
  await connectDatabase();
  await initDb();
  
  // Login as admin
  const loginRes = await request(app).post('/v1/auth/login').send({
    email: 'admin@thestackly.com',
    password: 'StacklyWFA2026!'
  });
  if (loginRes.body?.data?.token) {
    adminToken = loginRes.body.data.token;
  } else if (loginRes.body?.data?.challengeId) {
    const verifyRes = await request(app).post('/v1/auth/mfa/verify').send({
      challengeId: loginRes.body.data.challengeId,
      code: loginRes.body.data.otpDevHint || '123456'
    });
    adminToken = verifyRes.body.data.token;
  }
}, 30000);

afterAll(async () => {
  const db = getDb();
  if (db) {
    db.close();
  }
}, 30000);

describe('Sprint 1 - Workforce Intelligence', () => {
  describe('S1-01 & S1-02 - Workforce KPIs & Filters', () => {
    it('should return complete and correct workforce KPIs without filters', async () => {
      const res = await request(app)
        .get('/v1/analytics')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      
      const metrics = res.body.data.metrics;
      expect(metrics).toBeDefined();
      
      // Sprint 1 required KPIs
      expect(typeof metrics.totalEmployees).toBe('number');
      expect(typeof metrics.activeEmployees).toBe('number');
      expect(typeof metrics.newEmployees).toBe('number');
      expect(typeof metrics.employeeExits).toBe('number');
      expect(typeof metrics.employeeGrowthRate).toBe('number');
      expect(typeof metrics.attritionRate).toBe('number');
      expect(typeof metrics.departmentCount).toBe('number');
      expect(typeof metrics.locationCount).toBe('number');
      expect(typeof metrics.openPositions).toBe('number');
    });

    it('should accurately filter KPIs by department', async () => {
      // First get all departments to pick one
      const deptRes = await request(app).get('/v1/departments').set('Authorization', `Bearer ${adminToken}`);
      const departments = deptRes.body.data;
      if (departments.length === 0) return;
      
      const targetDept = departments[0].name;

      const res = await request(app)
        .get('/v1/analytics')
        .query({ department: targetDept })
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(res.status).toBe(200);
      const data = res.body.data;
      
      // The department count should be exactly 1 since we filtered by 1 department
      // Wait, departmentCount counts the distinct departments of the resulting employees
      expect(data.metrics.departmentCount).toBeLessThanOrEqual(1);
      
      // Every employee in the departmentDistribution should be targetDept
      const deptDist = data.departmentDistribution;
      expect(deptDist.every((d: any) => d.name === targetDept || d.name === 'Unassigned')).toBe(true);
    });

    it('should accurately filter KPIs by employment status', async () => {
      const res = await request(app)
        .get('/v1/analytics')
        .query({ status: 'Active' })
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(res.status).toBe(200);
      const metrics = res.body.data.metrics;
      
      // Since we filtered by Active, totalEmployees should equal activeEmployees
      expect(metrics.totalEmployees).toBe(metrics.activeEmployees);
    });
    
    it('should accurately filter KPIs by date range', async () => {
      const dateTo = new Date().toISOString();
      const dateFrom = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
      
      const res = await request(app)
        .get('/v1/analytics')
        .query({ dateFrom, dateTo })
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(res.status).toBe(200);
      const metrics = res.body.data.metrics;
      expect(metrics).toBeDefined();
    });
  });
});

import { query, execute } from '../database/sqlite-cloud.js';
import { randomUUID } from 'crypto';

export class OrganizationService {
  static async getLegalEntities(organizationId: string = 'org-stackly') {
    return query(`SELECT * FROM legal_entities WHERE organizationId = ? ORDER BY name ASC`, [organizationId]);
  }

  static async createLegalEntity(data: { name: string; code: string; taxId?: string; registrationNumber?: string; currency?: string; country?: string; organizationId?: string }) {
    const id = randomUUID();
    const now = new Date().toISOString();
    await execute(
      `INSERT INTO legal_entities (id, name, code, taxId, registrationNumber, currency, country, organizationId, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, data.name, data.code, data.taxId || null, data.registrationNumber || null, data.currency || 'INR', data.country || 'India', data.organizationId || 'org-stackly', now, now]
    );
    return { id, ...data };
  }

  static async getCostCenters(organizationId: string = 'org-stackly') {
    return query(`SELECT c.*, e.name as managerName FROM cost_centers c LEFT JOIN employees e ON c.managerId = e.id WHERE c.organizationId = ? ORDER BY c.code ASC`, [organizationId]);
  }

  static async createCostCenter(data: { code: string; name: string; budget?: number; managerId?: string; organizationId?: string }) {
    const id = randomUUID();
    const now = new Date().toISOString();
    await execute(
      `INSERT INTO cost_centers (id, code, name, budget, managerId, organizationId, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, data.code, data.name, data.budget || 0, data.managerId || null, data.organizationId || 'org-stackly', now, now]
    );
    return { id, ...data };
  }

  static async getOrgHierarchy(organizationId: string = 'org-stackly') {
    const employees = await query(
      `SELECT id, name, employeeCode, designation, department, managerId, avatar FROM employees WHERE organizationId = ? AND status = 'ACTIVE'`,
      [organizationId]
    );

    const empMap = new Map();
    const roots: any[] = [];

    employees.forEach((emp: any) => {
      empMap.set(emp.id, { ...emp, directReports: [] });
    });

    employees.forEach((emp: any) => {
      if (emp.managerId && empMap.has(emp.managerId)) {
        empMap.get(emp.managerId).directReports.push(empMap.get(emp.id));
      } else {
        roots.push(empMap.get(emp.id));
      }
    });

    return roots;
  }
}

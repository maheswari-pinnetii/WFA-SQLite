import { query, execute } from '../../database/sqlite-cloud.js';
import { randomUUID } from 'crypto';

export class OrganizationService {
  static async createDepartment(organizationId: string, data: { name: string; code?: string }) {
    const id = randomUUID();
    const now = new Date().toISOString();
    try {
      await execute(
        `INSERT INTO departments (id, name, code, organizationId, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id, data.name, data.code || data.name.toUpperCase().slice(0, 10), organizationId, now, now]
      );
    } catch (_) {}
    return { id, name: data.name, code: data.code, organizationId };
  }

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

  static async getLocations(organizationId: string = 'org-stackly') {
    return query(`SELECT * FROM locations WHERE organizationId = ? OR companyId = ? ORDER BY name ASC`, [organizationId, organizationId]);
  }

  static async getLocationById(id: string, organizationId: string = 'org-stackly') {
    const res = await query(`SELECT * FROM locations WHERE id = ? AND (organizationId = ? OR companyId = ?)`, [id, organizationId, organizationId]);
    return res[0] || null;
  }

  static async createLocation(organizationId: string, data: any) {
    const id = randomUUID();
    const now = new Date().toISOString();
    await execute(
      `INSERT INTO locations (id, name, address, city, state, country, postalCode, latitude, longitude, radiusMeters, companyId, organizationId, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, data.name, data.address || null, data.city || null, data.state || null, data.country || 'India', data.postalCode || null, data.latitude || 0, data.longitude || 0, data.radiusMeters || 100, organizationId, organizationId, now, now]
    );
    return { id, ...data };
  }

  static async updateLocation(id: string, organizationId: string, data: any) {
    const now = new Date().toISOString();
    await execute(
      `UPDATE locations SET name = COALESCE(?, name), address = COALESCE(?, address), city = COALESCE(?, city), state = COALESCE(?, state), country = COALESCE(?, country), radiusMeters = COALESCE(?, radiusMeters), updatedAt = ? WHERE id = ?`,
      [data.name, data.address, data.city, data.state, data.country, data.radiusMeters, now, id]
    );
    return { id, ...data };
  }

  static async deleteLocation(id: string, organizationId: string) {
    await execute(`DELETE FROM locations WHERE id = ?`, [id]);
    return { success: true };
  }

  static async getDesignations(organizationId: string = 'org-stackly', departmentId?: string) {
    if (departmentId) {
      return query(`SELECT * FROM designations WHERE (organizationId = ? OR companyId = ?) AND departmentId = ? ORDER BY title ASC`, [organizationId, organizationId, departmentId]);
    }
    return query(`SELECT * FROM designations WHERE organizationId = ? OR companyId = ? ORDER BY title ASC`, [organizationId, organizationId]);
  }

  static async createDesignation(organizationId: string, data: any) {
    const id = randomUUID();
    const now = new Date().toISOString();
    await execute(
      `INSERT INTO designations (id, title, code, departmentId, companyId, organizationId, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, data.title, data.code || data.title.toUpperCase().replace(/\s+/g, '_'), data.departmentId || null, organizationId, organizationId, now, now]
    );
    return { id, ...data };
  }

  static async updateDesignation(id: string, organizationId: string, data: any) {
    const now = new Date().toISOString();
    await execute(`UPDATE designations SET title = COALESCE(?, title), updatedAt = ? WHERE id = ?`, [data.title, now, id]);
    return { id, ...data };
  }

  static async deleteDesignation(id: string, organizationId: string) {
    await execute(`DELETE FROM designations WHERE id = ?`, [id]);
    return { success: true };
  }

  static async getJobLevels(organizationId: string = 'org-stackly') {
    return query(`SELECT * FROM job_levels WHERE organizationId = ? OR companyId = ? ORDER BY levelRank ASC`, [organizationId, organizationId]);
  }

  static async createJobLevel(organizationId: string, data: any) {
    const id = randomUUID();
    const now = new Date().toISOString();
    await execute(
      `INSERT INTO job_levels (id, name, code, levelRank, companyId, organizationId, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, data.name, data.code || data.name.toUpperCase(), data.levelRank || 1, organizationId, organizationId, now, now]
    );
    return { id, ...data };
  }

  static async updateJobLevel(id: string, organizationId: string, data: any) {
    const now = new Date().toISOString();
    await execute(`UPDATE job_levels SET name = COALESCE(?, name), levelRank = COALESCE(?, levelRank), updatedAt = ? WHERE id = ?`, [data.name, data.levelRank, now, id]);
    return { id, ...data };
  }

  static async deleteJobLevel(id: string, organizationId: string) {
    await execute(`DELETE FROM job_levels WHERE id = ?`, [id]);
    return { success: true };
  }

  static async getCostCenters(organizationId: string = 'org-stackly') {
    return query(`SELECT c.*, e.name as managerName FROM cost_centers c LEFT JOIN employees e ON c.managerId = e.id WHERE c.organizationId = ? ORDER BY c.code ASC`, [organizationId]);
  }

  static async createCostCenter(data: any, organizationId: string = 'org-stackly') {
    const id = randomUUID();
    const now = new Date().toISOString();
    const code = data.code || 'CC_' + Math.floor(Math.random() * 1000);
    const name = data.name || 'Cost Center';
    await execute(
      `INSERT INTO cost_centers (id, code, name, budget, managerId, organizationId, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, code, name, data.budget || 0, data.managerId || null, organizationId, now, now]
    );
    return { id, ...data };
  }

  static async updateCostCenter(id: string, organizationId: string, data: any) {
    const now = new Date().toISOString();
    await execute(`UPDATE cost_centers SET name = COALESCE(?, name), budget = COALESCE(?, budget), managerId = COALESCE(?, managerId), updatedAt = ? WHERE id = ?`, [data.name, data.budget, data.managerId, now, id]);
    return { id, ...data };
  }

  static async deleteCostCenter(id: string, organizationId: string) {
    await execute(`DELETE FROM cost_centers WHERE id = ?`, [id]);
    return { success: true };
  }

  static async getOrgPolicies(organizationId: string = 'org-stackly', unused?: any) {
    return query(`SELECT * FROM org_policies WHERE organizationId = ? OR companyId = ?`, [organizationId, organizationId]);
  }

  static async upsertOrgPolicy(organizationId: string, data: any) {
    const id = data.id || randomUUID();
    const now = new Date().toISOString();
    await execute(
      `INSERT INTO org_policies (id, policyKey, policyValue, companyId, organizationId, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET policyValue = excluded.policyValue, updatedAt = excluded.updatedAt`,
      [id, data.policyKey, JSON.stringify(data.policyValue), organizationId, organizationId, now]
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

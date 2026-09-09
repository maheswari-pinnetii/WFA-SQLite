import { randomUUID } from 'crypto';
import { query, execute } from '../database/sqlite-cloud.js';
import { logger } from '../config/logger.js';

// ─── ASSETS ────────────────────────────────────────────────────────────────

export const assetService = {

  async getAssets(organizationId: string, filters?: { employeeId?: string; status?: string; type?: string }) {
    let sql = `SELECT a.*, e.name as assignedToName
               FROM assets a
               LEFT JOIN employees e ON a.assignedToId = e.id
               WHERE a.organizationId = ?`;
    const params: any[] = [organizationId];
    if (filters?.employeeId) { sql += ` AND a.assignedToId = ?`; params.push(filters.employeeId); }
    if (filters?.status) { sql += ` AND a.status = ?`; params.push(filters.status); }
    if (filters?.type) { sql += ` AND a.assetType = ?`; params.push(filters.type); }
    sql += ` ORDER BY a.createdAt DESC`;
    return query(sql, params);
  },

  async createAsset(organizationId: string, data: {
    assetTag: string;
    assetType: string;
    description?: string;
    serialNumber?: string;
    purchaseDate?: string;
    value?: number;
  }) {
    const id = randomUUID();
    const now = new Date().toISOString();
    await execute(
      `INSERT INTO assets (id, organizationId, assetTag, assetType, description, serialNumber, purchaseDate, value, status, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'AVAILABLE', ?)`,
      [id, organizationId, data.assetTag, data.assetType, data.description || null,
       data.serialNumber || null, data.purchaseDate || null, data.value || null, now]
    );
    return { id };
  },

  async assignAsset(assetId: string, employeeId: string, organizationId: string, assignedBy: string) {
    const now = new Date().toISOString();
    await execute(
      `UPDATE assets SET assignedToId = ?, status = 'ASSIGNED', assignedAt = ?, assignedBy = ?
       WHERE id = ? AND organizationId = ? AND status = 'AVAILABLE'`,
      [employeeId, now, assignedBy, assetId, organizationId]
    );
    await execute(
      `INSERT INTO asset_history (id, assetId, action, performedBy, performedAt, notes)
       VALUES (?, ?, 'ASSIGNED', ?, ?, ?)`,
      [randomUUID(), assetId, assignedBy, now, `Assigned to employee ${employeeId}`]
    );
    logger.info(`[Assets] Asset ${assetId} assigned to employee ${employeeId}`);
  },

  async returnAsset(assetId: string, organizationId: string, returnedBy: string, condition?: string) {
    const now = new Date().toISOString();
    const newStatus = condition === 'DAMAGED' ? 'DAMAGED' : condition === 'LOST' ? 'LOST' : 'AVAILABLE';
    await execute(
      `UPDATE assets SET assignedToId = NULL, status = ?, returnedAt = ?
       WHERE id = ? AND organizationId = ?`,
      [newStatus, now, assetId, organizationId]
    );
    await execute(
      `INSERT INTO asset_history (id, assetId, action, performedBy, performedAt, notes)
       VALUES (?, ?, 'RETURNED', ?, ?, ?)`,
      [randomUUID(), assetId, returnedBy, now, `Returned. Condition: ${condition || 'GOOD'}`]
    );
  },

  async getAssetHistory(assetId: string) {
    return query(
      `SELECT * FROM asset_history WHERE assetId = ? ORDER BY performedAt DESC`,
      [assetId]
    );
  }
};

// ─── TRAINING / L&D ────────────────────────────────────────────────────────

export const trainingService = {

  async getCourses(organizationId: string, filters?: { status?: string; isMandatory?: boolean }) {
    let sql = `SELECT * FROM training_courses WHERE organizationId = ?`;
    const params: any[] = [organizationId];
    if (filters?.status) { sql += ` AND status = ?`; params.push(filters.status); }
    if (filters?.isMandatory !== undefined) { sql += ` AND isMandatory = ?`; params.push(filters.isMandatory ? 1 : 0); }
    sql += ` ORDER BY createdAt DESC`;
    return query(sql, params);
  },

  async createCourse(organizationId: string, data: {
    title: string;
    description?: string;
    durationHours?: number;
    isMandatory?: boolean;
    provider?: string;
    expiresAfterMonths?: number;
  }) {
    const id = randomUUID();
    const now = new Date().toISOString();
    await execute(
      `INSERT INTO training_courses (id, organizationId, title, description, durationHours, isMandatory, provider, expiresAfterMonths, status, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?)`,
      [id, organizationId, data.title, data.description || null, data.durationHours || null,
       data.isMandatory ? 1 : 0, data.provider || null, data.expiresAfterMonths || null, now]
    );
    return { id };
  },

  async enrollEmployee(courseId: string, employeeId: string, enrolledBy: string) {
    const existing = await query(
      `SELECT 1 FROM training_enrollments WHERE courseId = ? AND employeeId = ? AND status != 'EXPIRED'`,
      [courseId, employeeId]
    );
    if (existing.length > 0) throw new Error('Employee is already enrolled in this course');

    const id = randomUUID();
    const now = new Date().toISOString();
    await execute(
      `INSERT INTO training_enrollments (id, courseId, employeeId, enrolledBy, status, enrolledAt)
       VALUES (?, ?, ?, ?, 'ENROLLED', ?)`,
      [id, courseId, employeeId, enrolledBy, now]
    );
    return { id };
  },

  async markComplete(enrollmentId: string, score?: number, certUrl?: string) {
    const now = new Date().toISOString();

    // Fetch enrollment + course to compute expiry
    const enrollment = await query(
      `SELECT e.*, c.expiresAfterMonths FROM training_enrollments e
       JOIN training_courses c ON e.courseId = c.id
       WHERE e.id = ?`,
      [enrollmentId]
    ).then(r => r[0]) as any;

    if (!enrollment) throw new Error('Enrollment not found');

    let expiresAt: string | null = null;
    if (enrollment.expiresAfterMonths) {
      const d = new Date();
      d.setMonth(d.getMonth() + enrollment.expiresAfterMonths);
      expiresAt = d.toISOString();
    }

    await execute(
      `UPDATE training_enrollments
       SET status = 'COMPLETED', completedAt = ?, score = ?, certUrl = ?, expiresAt = ?
       WHERE id = ?`,
      [now, score || null, certUrl || null, expiresAt, enrollmentId]
    );
  },

  async getEnrollments(employeeId: string) {
    return query(
      `SELECT e.*, c.title as courseTitle, c.isMandatory, c.provider
       FROM training_enrollments e
       JOIN training_courses c ON e.courseId = c.id
       WHERE e.employeeId = ? ORDER BY e.enrolledAt DESC`,
      [employeeId]
    );
  },

  async getMandatoryComplianceReport(organizationId: string) {
    // Returns employees missing any mandatory course completion
    return query(
      `SELECT emp.id as employeeId, emp.name, tc.id as courseId, tc.title,
              COALESCE(te.status, 'NOT_ENROLLED') as enrollmentStatus
       FROM employees emp
       CROSS JOIN training_courses tc
       LEFT JOIN training_enrollments te ON te.employeeId = emp.id AND te.courseId = tc.id
       WHERE emp.organizationId = ? AND tc.organizationId = ? AND tc.isMandatory = 1
         AND (te.status IS NULL OR te.status NOT IN ('COMPLETED'))
       ORDER BY emp.name, tc.title`,
      [organizationId, organizationId]
    );
  }
};

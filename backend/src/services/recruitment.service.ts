import { randomUUID } from 'crypto';
import { query, execute } from '../database/sqlite-cloud.js';
import { logger } from '../config/logger.js';
import { employeeLifecycleService } from './employee-lifecycle.service.js';

export const recruitmentService = {

  /** ─── JOB REQUISITIONS ──────────────────────────── */
  async getRequisitions(organizationId: string, filters?: { status?: string; department?: string }) {
    let sql = `SELECT * FROM job_requisitions WHERE organizationId = ?`;
    const params: any[] = [organizationId];

    if (filters?.status) { sql += ` AND status = ?`; params.push(filters.status); }
    if (filters?.department) { sql += ` AND department = ?`; params.push(filters.department); }
    sql += ` ORDER BY createdAt DESC`;

    return query(sql, params);
  },

  async createRequisition(organizationId: string, data: { title: string; department?: string; openings?: number }) {
    const id = randomUUID();
    const now = new Date().toISOString();
    await execute(
      `INSERT INTO job_requisitions (id, organizationId, title, department, status, openings, createdAt)
       VALUES (?, ?, ?, ?, 'OPEN', ?, ?)`,
      [id, organizationId, data.title, data.department || null, data.openings || 1, now]
    );
    return { id };
  },

  async updateRequisitionStatus(id: string, organizationId: string, status: string) {
    await execute(
      `UPDATE job_requisitions SET status = ? WHERE id = ? AND organizationId = ?`,
      [status, id, organizationId]
    );
  },

  /** ─── APPLICATIONS ──────────────────────────────── */
  async getApplications(jobRequisitionId: string, filters?: { status?: string }) {
    let sql = `SELECT * FROM applications WHERE jobRequisitionId = ?`;
    const params: any[] = [jobRequisitionId];
    if (filters?.status) { sql += ` AND status = ?`; params.push(filters.status); }
    sql += ` ORDER BY appliedAt DESC`;
    return query(sql, params);
  },

  async createApplication(data: {
    jobRequisitionId: string;
    candidateName: string;
    candidateEmail: string;
  }) {
    // Duplicate candidate check
    const existing = await query(
      `SELECT 1 FROM applications WHERE jobRequisitionId = ? AND candidateEmail = ?`,
      [data.jobRequisitionId, data.candidateEmail]
    );
    if (existing.length > 0) {
      throw new Error('This candidate has already applied for this position');
    }

    const id = randomUUID();
    const now = new Date().toISOString();
    await execute(
      `INSERT INTO applications (id, jobRequisitionId, candidateName, candidateEmail, status, appliedAt)
       VALUES (?, ?, ?, ?, 'NEW', ?)`,
      [id, data.jobRequisitionId, data.candidateName, data.candidateEmail, now]
    );
    return { id };
  },

  async updateApplicationStatus(id: string, status: string) {
    await execute(`UPDATE applications SET status = ? WHERE id = ?`, [status, id]);
  },

  /** ─── INTERVIEWS ─────────────────────────────────── */
  async getInterviews(applicationId: string) {
    return query(`SELECT * FROM interviews WHERE applicationId = ? ORDER BY scheduledAt ASC`, [applicationId]);
  },

  async scheduleInterview(data: {
    applicationId: string;
    interviewerId: string;
    scheduledAt: string;
  }) {
    const id = randomUUID();
    await execute(
      `INSERT INTO interviews (id, applicationId, interviewerId, scheduledAt, status)
       VALUES (?, ?, ?, ?, 'SCHEDULED')`,
      [id, data.applicationId, data.interviewerId, data.scheduledAt]
    );
    return { id };
  },

  async submitInterviewFeedback(interviewId: string, feedback: string, status: 'PASSED' | 'FAILED') {
    await execute(
      `UPDATE interviews SET feedback = ?, status = ? WHERE id = ?`,
      [feedback, status, interviewId]
    );
  },

  /** ─── OFFERS ─────────────────────────────────────── */
  async createOffer(applicationId: string, salaryOffered: number) {
    const id = randomUUID();
    const now = new Date().toISOString();
    await execute(
      `INSERT INTO offers (id, applicationId, salaryOffered, status, sentAt) VALUES (?, ?, ?, 'PENDING', ?)`,
      [id, applicationId, salaryOffered, now]
    );
    // Update application status
    await this.updateApplicationStatus(applicationId, 'OFFER_SENT');
    return { id };
  },

  async respondToOffer(offerId: string, response: 'ACCEPTED' | 'REJECTED', organizationId?: string) {
    await execute(`UPDATE offers SET status = ? WHERE id = ?`, [response, offerId]);
    const offer = await query(`SELECT * FROM offers WHERE id = ?`, [offerId]).then(r => r[0]) as any;

    if (offer && response === 'ACCEPTED') {
      await this.updateApplicationStatus(offer.applicationId, 'HIRED');

      // ── BUG FIX 2: Auto-create Employee record from accepted offer ──────────
      const application = await query(
        `SELECT a.*, jr.title as jobTitle, jr.department, jr.organizationId
         FROM applications a
         JOIN job_requisitions jr ON a.jobRequisitionId = jr.id
         WHERE a.id = ?`,
        [offer.applicationId]
      ).then(r => r[0]) as any;

      if (application) {
        const orgId = application.organizationId || organizationId || 'org-stackly';
        const empId = randomUUID();
        const now = new Date().toISOString();
        const empCode = `EMP-${Date.now().toString(36).toUpperCase()}`;

        try {
          await execute(
            `INSERT INTO employees (id, employeeCode, name, email, role, department, designation, status, organizationId, companyId, joinDate, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, 'EMPLOYEE', ?, ?, 'ONBOARDING', ?, ?, ?, ?, ?)`,
            [empId, empCode, application.candidateName, application.candidateEmail,
             application.department || null, application.jobTitle || null,
             orgId, orgId, now.split('T')[0], now, now]
          );

          // Trigger onboarding lifecycle status
          await employeeLifecycleService.transitionStatus(empId, 'ONBOARDING', {
            reason: `Hired via recruitment — offer ${offerId} accepted`,
            changedBy: 'SYSTEM',
            organizationId: orgId
          });

          logger.info(`[Recruitment] Created employee ${empId} from accepted offer ${offerId}`);
        } catch (empErr: any) {
          logger.error(`[Recruitment] Failed to create employee from offer: ${empErr.message}`);
        }
      }
      // ───────────────────────────────────────────────────────────────────────
    }

    return { offerId, status: response };
  },

  /** ─── FUNNEL ANALYTICS ───────────────────────────── */
  async getRecruitmentFunnel(organizationId: string) {
    const stages = await query(
      `SELECT a.status, COUNT(*) as count
       FROM applications a
       JOIN job_requisitions jr ON a.jobRequisitionId = jr.id
       WHERE jr.organizationId = ?
       GROUP BY a.status`,
      [organizationId]
    );
    return stages;
  }
};

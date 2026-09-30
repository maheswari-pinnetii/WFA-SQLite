import { query, execute } from '../../database/connection.js';
import { v4 as uuidv4 } from 'uuid';

export class DataPipelineService {
  /**
   * Syncs data from external mock systems into our local warehouse/tables.
   * In a real system, this would fetch from an HRIS, LMS, and ATS.
   */
  async runSyncPipeline(user: any) {
    const orgId = user.organizationId || 'org-stackly';
    const now = new Date().toISOString();

    // 1. Sync Recruitment (job_postings, candidates)
    await this.syncRecruitmentData(orgId, now);

    // 2. Sync Placements (placements)
    await this.syncPlacementData(orgId, now);

    // 3. Sync Learning (training_programs, training_enrollments, employee_certifications)
    await this.syncLearningData(orgId, now);

    return { success: true, message: 'Pipeline executed successfully', timestamp: now };
  }

  private async syncRecruitmentData(orgId: string, now: string) {
    // Generate mock job postings if they don't exist
    await execute(`
      INSERT OR IGNORE INTO job_postings (id, departmentId, organizationId, title, status, createdAt)
      VALUES 
      ('job-1', 'dept-engineering', ?, 'Senior Frontend Engineer', 'OPEN', ?),
      ('job-2', 'dept-sales', ?, 'Account Executive', 'OPEN', ?),
      ('job-3', 'dept-marketing', ?, 'Growth Lead', 'CLOSED', ?)
    `, [orgId, now, orgId, now, orgId, now]);

    // Generate candidates (prevent duplicates by checking email)
    await execute(`
      INSERT INTO candidates (id, jobId, organizationId, name, email, status, appliedAt)
      SELECT ?, 'job-1', ?, 'Alice Smith', 'alice.s@example.com', 'INTERVIEWING', ?
      WHERE NOT EXISTS (SELECT 1 FROM candidates WHERE email = 'alice.s@example.com')
    `, [uuidv4(), orgId, now]);

    await execute(`
      INSERT INTO candidates (id, jobId, organizationId, name, email, status, appliedAt)
      SELECT ?, 'job-1', ?, 'Bob Jones', 'bob.j@example.com', 'OFFERED', ?
      WHERE NOT EXISTS (SELECT 1 FROM candidates WHERE email = 'bob.j@example.com')
    `, [uuidv4(), orgId, now]);

    await execute(`
      INSERT INTO candidates (id, jobId, organizationId, name, email, status, appliedAt)
      SELECT ?, 'job-2', ?, 'Carol White', 'carol.w@example.com', 'HIRED', ?
      WHERE NOT EXISTS (SELECT 1 FROM candidates WHERE email = 'carol.w@example.com')
    `, [uuidv4(), orgId, now]);
  }

  private async syncPlacementData(orgId: string, now: string) {
    // Sync candidates who are HIRED into the placements table
    // Prevent duplicates by checking candidateId
    await execute(`
      INSERT INTO placements (id, candidateId, jobId, organizationId, offerDate, joiningDate, status, salary, placementTimeDays, department, skill, employer, location, createdAt)
      SELECT 
        lower(hex(randomblob(16))) as id,
        c.id as candidateId,
        c.jobId,
        c.organizationId,
        ? as offerDate,
        ? as joiningDate,
        'PLACED' as status,
        85000 as salary,
        24 as placementTimeDays,
        d.name as department,
        'React' as skill,
        'Internal' as employer,
        'Remote' as location,
        ? as createdAt
      FROM candidates c
      JOIN job_postings p ON c.jobId = p.id
      LEFT JOIN departments d ON p.departmentId = d.id
      WHERE c.status = 'HIRED' AND c.organizationId = ?
      AND NOT EXISTS (SELECT 1 FROM placements WHERE candidateId = c.id)
    `, [now, now, now, orgId]);
  }

  private async syncLearningData(orgId: string, now: string) {
    // Seed training programs
    await execute(`
      INSERT OR IGNORE INTO training_programs (id, organizationId, title, durationHours, createdAt)
      VALUES 
      ('prog-1', ?, 'Advanced React', 20, ?),
      ('prog-2', ?, 'Leadership 101', 15, ?),
      ('prog-3', ?, 'Cloud Architecture', 40, ?)
    `, [orgId, now, orgId, now, orgId, now]);

    // Enroll some employees (simulate LMS sync)
    // Find first employee for org
    const employees = await query(`SELECT id FROM employees WHERE organizationId = ? LIMIT 2`, [orgId]);
    if (employees.length > 0) {
      const emp1 = employees[0].id;
      
      // Prevent duplicate enrollment
      await execute(`
        INSERT INTO training_enrollments (id, programId, employeeId, organizationId, status, enrolledAt, completedAt, trainingHours, score, department, courseName)
        SELECT ?, 'prog-1', ?, ?, 'COMPLETED', ?, ?, 20, 95.5, 'Engineering', 'Advanced React'
        WHERE NOT EXISTS (SELECT 1 FROM training_enrollments WHERE employeeId = ? AND programId = 'prog-1')
      `, [uuidv4(), emp1, orgId, now, now, emp1]);

      // Grant certification if completed
      await execute(`
        INSERT INTO employee_certifications (id, employeeId, organizationId, certificationName, status, issuedAt)
        SELECT ?, ?, ?, 'React Expert', 'ACTIVE', ?
        WHERE NOT EXISTS (SELECT 1 FROM employee_certifications WHERE employeeId = ? AND certificationName = 'React Expert')
      `, [uuidv4(), emp1, orgId, now, emp1]);
    }
  }
}

export const dataPipelineService = new DataPipelineService();

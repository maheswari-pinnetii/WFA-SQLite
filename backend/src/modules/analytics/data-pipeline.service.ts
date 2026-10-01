import { query, execute } from '../../database/connection.js';
import { v4 as uuidv4 } from 'uuid';

export interface IngestionPayload {
  sourceId: string;
  sourceType: 'HRIS' | 'ATS' | 'LMS' | 'ATTENDANCE' | 'PAYROLL' | 'PERFORMANCE';
  entityType: 'EMPLOYEE' | 'ATTENDANCE' | 'LEAVE' | 'PERFORMANCE' | 'CANDIDATE' | 'TRAINING';
  records: any[];
}

export class DataPipelineService {
  async runSyncPipeline(user: any, payload?: IngestionPayload) {
    const orgId = user.organizationId || 'org-stackly';
    const now = new Date().toISOString();
    const batchId = uuidv4();

    if (!payload || !payload.records) {
      return { success: false, message: 'Missing ingestion payload. Synthetic mock data generation has been removed.' };
    }

    const { sourceId, sourceType, entityType, records } = payload;
    const actualEntityType = entityType || (sourceType === 'HRIS' ? 'EMPLOYEE' : sourceType);

    await this.initBatch(batchId, sourceId, orgId, records.length, now);

    let inserted = 0;
    let updated = 0;
    let rejected = 0;
    let duplicates = 0;
    const errors: any[] = [];

    // SQLite transactions for atomic batch processing
    await execute('BEGIN TRANSACTION');

    try {
      for (const record of records) {
        try {
          if (actualEntityType === 'EMPLOYEE') {
            if (!record.email || !record.firstName || !record.lastName) {
              rejected++;
              errors.push({ type: 'missing_required_field', recordId: record.id, message: 'Email, firstName, and lastName are required' });
              continue;
            }
            if (!record.email.includes('@')) {
              rejected++;
              errors.push({ type: 'invalid_email', recordId: record.id, message: 'Invalid email format' });
              continue;
            }

            const existing = await query(`SELECT id FROM employees WHERE email = ? AND organizationId = ?`, [record.email, orgId]);
            if (existing && existing.length > 0) {
              duplicates++;
              const empId = existing[0].id;
              await execute(`
                UPDATE employees SET 
                  firstName = COALESCE(?, firstName), lastName = COALESCE(?, lastName),
                  department = COALESCE(?, department), role = COALESCE(?, role),
                  location = COALESCE(?, location), status = COALESCE(?, status),
                  updatedAt = ?
                WHERE id = ? AND organizationId = ?
              `, [record.firstName, record.lastName, record.department, record.role, record.location, record.status, now, empId, orgId]);
              updated++;
            } else {
              const newId = record.id || uuidv4();
              await execute(`
                INSERT INTO employees (id, organizationId, firstName, lastName, name, email, department, role, location, status, joinDate, createdAt, updatedAt)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              `, [
                newId, orgId, record.firstName, record.lastName, `${record.firstName} ${record.lastName}`, record.email, 
                record.department || 'Unassigned', record.role || 'EMPLOYEE', 
                record.location || 'HQ', record.status || 'Active', 
                record.joiningDate || record.joinDate || now.substring(0, 10), now, now
              ]);
              inserted++;
            }
          } 
          else if (actualEntityType === 'ATTENDANCE') {
            if (!record.employeeId || !record.date || !record.status) {
              rejected++;
              errors.push({ type: 'missing_required_field', recordId: record.id, message: 'employeeId, date, and status are required' });
              continue;
            }

            const existing = await query(`SELECT id FROM attendancerecords WHERE employeeId = ? AND date = ? AND organizationId = ?`, [record.employeeId, record.date, orgId]);
            if (existing && existing.length > 0) {
              duplicates++;
              await execute(`
                UPDATE attendancerecords SET 
                  status = ?, checkInTime = COALESCE(?, checkInTime), checkOutTime = COALESCE(?, checkOutTime), updatedAt = ?
                WHERE id = ?
              `, [record.status, record.checkIn || record.checkInTime, record.checkOut || record.checkOutTime, now, existing[0].id]);
              updated++;
            } else {
              const newId = record.id || uuidv4();
              await execute(`
                INSERT INTO attendancerecords (id, organizationId, employeeId, date, status, checkInTime, checkOutTime, createdAt)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
              `, [newId, orgId, record.employeeId, record.date, record.status, record.checkIn || record.checkInTime, record.checkOut || record.checkOutTime, now]);
              inserted++;
            }
          }
          else if (actualEntityType === 'PERFORMANCE') {
             if (!record.employeeId || !record.score || !record.period) {
                rejected++;
                errors.push({ type: 'missing_required_field', recordId: record.id, message: 'employeeId, score, and period are required' });
                continue;
             }
             const existing = await query(`SELECT id FROM performancerecords WHERE employeeId = ? AND period = ? AND organizationId = ?`, [record.employeeId, record.period, orgId]);
             if (existing && existing.length > 0) {
                duplicates++;
                await execute(`UPDATE performancerecords SET score = ?, feedback = ?, updatedAt = ? WHERE id = ?`, [record.score, record.feedback, now, existing[0].id]);
                updated++;
             } else {
                await execute(`INSERT INTO performancerecords (id, organizationId, employeeId, period, score, feedback, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)`, 
                [uuidv4(), orgId, record.employeeId, record.period, record.score, record.feedback, now]);
                inserted++;
             }
          }
          else if (actualEntityType === 'TRAINING') {
             if (!record.employeeId || !record.courseId || !record.status) {
                rejected++;
                errors.push({ type: 'missing_required_field', recordId: record.id, message: 'employeeId, courseId, and status are required' });
                continue;
             }
             const existing = await query(`SELECT id FROM training_enrollments WHERE employeeId = ? AND courseId = ? AND organizationId = ?`, [record.employeeId, record.courseId, orgId]);
             if (existing && existing.length > 0) {
                duplicates++;
                await execute(`UPDATE training_enrollments SET status = ?, score = ?, completedAt = COALESCE(?, completedAt) WHERE id = ?`, [record.status, record.score, record.completedAt, existing[0].id]);
                updated++;
             } else {
                await execute(`INSERT INTO training_enrollments (id, organizationId, employeeId, courseId, courseName, status, score, enrolledAt, completedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
                [uuidv4(), orgId, record.employeeId, record.courseId, record.courseName || 'Unknown Course', record.status, record.score, record.enrolledAt || now, record.completedAt]);
                inserted++;
             }
          }
          else {
             rejected++;
             errors.push({ type: 'unsupported_entity_type', recordId: record.id, message: `Entity type ${actualEntityType} is not supported` });
          }
        } catch (err: any) {
          rejected++;
          errors.push({ type: 'processing_error', error: err.message, recordId: record.id });
        }
      }
      
      await execute('COMMIT');
    } catch (e: any) {
      await execute('ROLLBACK');
      throw e;
    }

    
    for (const error of errors) {
        await execute(`INSERT INTO data_quality_issues (id, batch_id, organization_id, issue_type, record_id, message, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [uuidv4(), batchId, orgId, error.type, error.recordId || 'Unknown', error.message || error.error || 'Unknown Error', new Date().toISOString()]);
    }
    await this.finalizeBatch(batchId, orgId, inserted, updated, rejected, duplicates, errors, new Date().toISOString());

    return { 
      success: true, 
      batchId,
      stats: { received: records.length, inserted, updated, rejected, duplicates },
      errors
    };
  }

  private async initBatch(batchId: string, sourceId: string, orgId: string, received: number, startedAt: string) {
    await execute(`
      CREATE TABLE IF NOT EXISTS import_batches (
        batch_id TEXT PRIMARY KEY,
        source_id TEXT,
        organization_id TEXT,
        started_at TEXT,
        completed_at TEXT,
        records_received INTEGER,
        records_inserted INTEGER,
        records_updated INTEGER,
        records_rejected INTEGER,
        records_duplicate INTEGER,
        status TEXT,
        error_count INTEGER
      )
    `);

    await execute(`
      CREATE TABLE IF NOT EXISTS data_quality_issues (
        id TEXT PRIMARY KEY,
        batch_id TEXT,
        organization_id TEXT,
        issue_type TEXT,
        record_id TEXT,
        message TEXT,
        created_at TEXT
      )
    `);

    await execute(`
      INSERT INTO import_batches (batch_id, source_id, organization_id, started_at, records_received, status)
      VALUES (?, ?, ?, ?, ?, 'IN_PROGRESS')
    `, [batchId, sourceId, orgId, startedAt, received]);
  }

  private async finalizeBatch(batchId: string, orgId: string, inserted: number, updated: number, rejected: number, duplicates: number, errors: any[], completedAt: string) {
    const errorCount = errors.length;
    const status = errorCount > 0 ? (inserted + updated > 0 ? 'PARTIAL_SUCCESS' : 'FAILED') : 'SUCCESS';
    await execute(`
      UPDATE import_batches 
      SET completed_at = ?, records_inserted = ?, records_updated = ?, records_rejected = ?, records_duplicate = ?, error_count = ?, status = ?
      WHERE batch_id = ?
    `, [completedAt, inserted, updated, rejected, duplicates, errorCount, status, batchId]);
  }


  
  async getDataQualityIssues(orgId: string, batchId?: string) {
    if (batchId) return await query('SELECT * FROM data_quality_issues WHERE organization_id = ? AND batch_id = ? ORDER BY created_at DESC', [orgId, batchId]);
    return await query('SELECT * FROM data_quality_issues WHERE organization_id = ? ORDER BY created_at DESC LIMIT 100', [orgId]);
  }
  
  async getImportBatches(orgId: string) {
    return await query('SELECT * FROM import_batches WHERE organization_id = ? ORDER BY started_at DESC LIMIT 50', [orgId]);
  }
}

export const dataPipelineService = new DataPipelineService();

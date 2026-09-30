import { query, execute } from '../../database/sqlite-cloud.js';
import { v4 as uuidv4 } from 'uuid';

export interface IngestionPayload {
  sourceId: string;
  sourceType: string;
  records: any[];
}

export class DataPipelineService {
  /**
   * Real ingestion pipeline supporting schema validation, deduplication, and data quality tracking.
   */
  async runSyncPipeline(user: any, payload?: IngestionPayload) {
    const orgId = user.organizationId || 'org-stackly';
    const now = new Date().toISOString();
    const batchId = uuidv4();

    // Fallback for API endpoints calling this without a payload yet
    if (!payload || !payload.records) {
      return { success: false, message: 'Missing ingestion payload. Synthetic mock data generation has been removed.' };
    }

    const { sourceId, sourceType, records } = payload;

    // 1. Initialize Batch Tracking
    await this.initBatch(batchId, sourceId, orgId, records.length, now);

    let inserted = 0;
    let updated = 0;
    let rejected = 0;
    let duplicates = 0;
    const errors = [];

    // 2. Process Records
    for (const record of records) {
      try {
        // Idempotency / Duplicate Detection based on entity type
        if (sourceType === 'EMPLOYEE') {
          // Schema Validation for EMPLOYEE
          if (!record.email || !record.firstName || !record.lastName) {
            rejected++;
            errors.push({ type: 'missing_required_field', record, message: 'Email, firstName, and lastName are required for employees' });
            continue;
          }

          const existing = await query(`SELECT id FROM employees WHERE email = ? AND organizationId = ?`, [record.email, orgId]);
          if (existing && existing.length > 0) {
            duplicates++;
            // Perform actual update logic
            const empId = existing[0].id;
            await execute(`
              UPDATE employees SET 
                firstName = COALESCE(?, firstName),
                lastName = COALESCE(?, lastName),
                department = COALESCE(?, department),
                role = COALESCE(?, role),
                location = COALESCE(?, location),
                status = COALESCE(?, status)
              WHERE id = ? AND organizationId = ?
            `, [record.firstName, record.lastName, record.department, record.role, record.location, record.status, empId, orgId]);
            updated++;
          } else {
            // Perform actual insert logic
            const newId = record.id || uuidv4();
            await execute(`
              INSERT INTO employees (id, organizationId, firstName, lastName, email, department, role, location, status, joiningDate)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
              newId, orgId, record.firstName, record.lastName, record.email, 
              record.department || 'Unassigned', record.role || 'EMPLOYEE', 
              record.location || 'HQ', record.status || 'ACTIVE', 
              record.joiningDate || new Date().toISOString().substring(0, 10)
            ]);
            inserted++;
          }
        } else if (sourceType === 'ATTENDANCE') {
          // Schema Validation for ATTENDANCE
          if (!record.employeeId || !record.date || !record.status) {
            rejected++;
            errors.push({ type: 'missing_required_field', record, message: 'employeeId, date, and status are required for attendance' });
            continue;
          }

          const existing = await query(`SELECT id FROM attendancerecords WHERE employeeId = ? AND date = ? AND organizationId = ?`, [record.employeeId, record.date, orgId]);
          if (existing && existing.length > 0) {
            duplicates++;
            const recId = existing[0].id;
            await execute(`
              UPDATE attendancerecords SET 
                status = ?,
                checkIn = COALESCE(?, checkIn),
                checkOut = COALESCE(?, checkOut)
              WHERE id = ?
            `, [record.status, record.checkIn, record.checkOut, recId]);
            updated++;
          } else {
            const newId = uuidv4();
            await execute(`
              INSERT INTO attendancerecords (id, organizationId, employeeId, date, status, checkIn, checkOut)
              VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [newId, orgId, record.employeeId, record.date, record.status, record.checkIn, record.checkOut]);
            inserted++;
          }
        } else {
           rejected++;
           errors.push({ type: 'unsupported_source_type', record, message: `Source type ${sourceType} is not supported` });
        }
      } catch (err: any) {
        rejected++;
        errors.push({ type: 'processing_error', error: err.message, record });
      }
    }

    // 3. Finalize Batch
    await this.finalizeBatch(batchId, inserted, updated, rejected, duplicates, errors.length, new Date().toISOString());

    return { 
      success: true, 
      batchId,
      stats: { received: records.length, inserted, updated, rejected, duplicates },
      errors
    };
  }

  private async initBatch(batchId: string, sourceId: string, orgId: string, received: number, startedAt: string) {
    // Ensure table exists for tracking
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
      INSERT INTO import_batches (batch_id, source_id, organization_id, started_at, records_received, status)
      VALUES (?, ?, ?, ?, ?, 'IN_PROGRESS')
    `, [batchId, sourceId, orgId, startedAt, received]);
  }

  private async finalizeBatch(batchId: string, inserted: number, updated: number, rejected: number, duplicates: number, errorCount: number, completedAt: string) {
    const status = errorCount > 0 ? (inserted + updated > 0 ? 'PARTIAL_SUCCESS' : 'FAILED') : 'SUCCESS';
    await execute(`
      UPDATE import_batches 
      SET completed_at = ?, records_inserted = ?, records_updated = ?, records_rejected = ?, records_duplicate = ?, error_count = ?, status = ?
      WHERE batch_id = ?
    `, [completedAt, inserted, updated, rejected, duplicates, errorCount, status, batchId]);
  }
}

export const dataPipelineService = new DataPipelineService();

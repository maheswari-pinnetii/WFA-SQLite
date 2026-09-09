import { randomUUID } from 'crypto';
import { parse } from 'csv-parse/sync';
import { query, execute } from '../database/sqlite-cloud.js';
import { logger } from '../config/logger.js';
import { z } from 'zod';

export interface StartImportParams {
  organizationId: string;
  entityType: 'EMPLOYEES' | 'SHIFTS' | 'TEAMS';
  csvData: string;
  uploadedBy: string;
}

// Basic schemas for validation
const employeeImportSchema = z.object({
  employeeCode: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  role: z.string().default('EMPLOYEE'),
  department: z.string().optional(),
  team: z.string().optional(),
  location: z.string().optional()
});

export const bulkImportService = {
  /**
   * Main entrypoint to process a bulk import synchronously for simplicity (can be converted to async worker).
   */
  async processImport(params: StartImportParams) {
    const importId = randomUUID();
    const now = new Date().toISOString();

    // 1. Create the import record
    await execute(
      `INSERT INTO bulk_imports (id, organizationId, entityType, status, uploadedBy, createdAt)
       VALUES (?, ?, ?, 'PROCESSING', ?, ?)`,
      [importId, params.organizationId, params.entityType, params.uploadedBy, now]
    );

    try {
      // 2. Parse CSV
      const records = parse(params.csvData, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      });

      let successfulRows = 0;
      let failedRows = 0;

      // 3. Process each row
      for (let i = 0; i < records.length; i++) {
        const row = records[i];
        const rowNumber = i + 2; // Assuming line 1 is header

        try {
          if (params.entityType === 'EMPLOYEES') {
            await this.processEmployeeRow(row, params.organizationId);
          } else {
            throw new Error(`Unsupported entityType: ${params.entityType}`);
          }
          successfulRows++;
        } catch (err: any) {
          failedRows++;
          await this.logError(importId, rowNumber, JSON.stringify(row), err.message || 'Validation failed');
        }
      }

      // 4. Update Import Status
      await execute(
        `UPDATE bulk_imports 
         SET status = 'COMPLETED', totalRows = ?, successfulRows = ?, failedRows = ?, completedAt = ? 
         WHERE id = ?`,
        [records.length, successfulRows, failedRows, new Date().toISOString(), importId]
      );

      logger.info(`[Bulk Import] Completed ${importId}. Total: ${records.length}, Success: ${successfulRows}, Failed: ${failedRows}`);

      return { importId, totalRows: records.length, successfulRows, failedRows };
    } catch (err: any) {
      logger.error(`[Bulk Import] Critical failure parsing CSV for ${importId}: ${err.message}`);
      await execute(
        `UPDATE bulk_imports SET status = 'FAILED', completedAt = ? WHERE id = ?`,
        [new Date().toISOString(), importId]
      );
      throw err;
    }
  },

  async processEmployeeRow(row: any, organizationId: string) {
    // Validate with Zod
    const validated = employeeImportSchema.parse(row);
    
    // Check duplicates
    const exists = await query(
      `SELECT 1 FROM employees WHERE email = ? OR employeeCode = ?`,
      [validated.email, validated.employeeCode]
    );

    if (exists.length > 0) {
      throw new Error(`Employee with this email or code already exists`);
    }

    // Insert
    const id = randomUUID();
    const now = new Date().toISOString();
    await execute(
      `INSERT INTO employees (id, employeeCode, name, email, role, department, team, location, status, organizationId, companyId, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?, ?, ?, ?)`,
      [id, validated.employeeCode, validated.name, validated.email, validated.role, validated.department || null, validated.team || null, validated.location || null, organizationId, organizationId, now, now]
    );
  },

  async logError(importId: string, rowNumber: number, rowData: string, errorMessage: string) {
    const id = randomUUID();
    await execute(
      `INSERT INTO import_errors (id, importId, rowNumber, rowData, errorMessage)
       VALUES (?, ?, ?, ?, ?)`,
      [id, importId, rowNumber, rowData, errorMessage]
    );
  }
};

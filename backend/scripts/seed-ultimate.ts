import { getDb, ORGANIZATION_ID } from '../src/config/db.js';
import { connectDatabase } from '../src/database/sqlite-cloud.js';
import crypto from 'crypto';

export const seedUltimate = async () => {
  await connectDatabase();
  const db = getDb();
  console.log('[SQLite Ultimate Seeder] Starting dynamic seeding of all empty tables...');

  // Disable FKs temporarily to avoid complex dependency cycles for mock data
  db.pragma('foreign_keys = OFF');

  const employees = db.prepare("SELECT id, name FROM employees").all() as any[];
  const users = db.prepare("SELECT id FROM users").all() as any[];
  const assets = db.prepare("SELECT id FROM assets").all() as any[];
  
  if (employees.length === 0) return;

  const getRandEmp = () => employees[Math.floor(Math.random() * Math.min(employees.length, 100))].id;
  const getRandUser = () => users[Math.floor(Math.random() * Math.min(users.length, 100))]?.id || getRandEmp();
  const getRandAsset = () => assets[Math.floor(Math.random() * Math.min(assets.length, 100))]?.id || 'ast-1';

  const tables = [
    'mfa_settings', 'mfa_recovery_codes', 'oauth_states', 'trusted_devices', 'password_reset_tokens', 
    'email_verification_tokens', 'rate_limits', 'security_audit_logs', 'employee_history', 
    'employee_documents', 'employee_status_history', 'interviews', 'offers', 'performance_cycles', 
    'goals', 'reviews', 'import_errors', 'training_courses', 'training_enrollments', 
    'employee_bank_details', 'employee_tax_info', 'employee_emergency_contacts', 'employee_education', 
    'employee_certifications', 'employee_experience', 'lifecycle_events', 'statutory_config', 
    'tax_declarations', 'legal_entities', 'okr_objectives', 'okr_key_results', 'mfachallenges', 
    'overtime_rules', 'overtime_records', 'holidays', 'failed_logins', 'passkey_credentials', 
    'passkey_challenges', 'employee_salary_structures', 'salary_revisions', 'payroll_run_employees', 
    'payroll_line_items', 'payroll_lop_records', 'payroll_overtime_records', 
    'payroll_reimbursement_records', 'payroll_approvals', 'payroll_reversals', 'employee_tax_profiles', 
    'payroll_ytd', 'payroll_audit_logs', 'roster_assignments', 'leave_accruals', 'workflows', 
    'workflow_steps', 'workflow_requests', 'full_and_final_settlements', 'system_calendars', 
    'user_notification_preferences', 'work_configurations', 'idempotency_records', 'user_sessions', 
    'expenses', 'payroll_run_logs', 'notifications'
  ];

  let seededTables = 0;

  for (const table of tables) {
    try {
      const rowCount = db.prepare(`SELECT COUNT(*) as c FROM ${table}`).get().c;
      if (rowCount > 0) continue; // Skip if already has data
      
      const columnsInfo = db.prepare(`PRAGMA table_info(${table})`).all() as any[];
      if (columnsInfo.length === 0) continue; // Table doesn't exist

      const columns = columnsInfo.map(c => c.name);
      
      // We will insert 10 rows per empty table
      const insertStmt = db.prepare(`
        INSERT INTO ${table} (${columns.join(', ')})
        VALUES (${columns.map(() => '?').join(', ')})
      `);

      db.transaction(() => {
        for (let i = 1; i <= 10; i++) {
          const values = columns.map(col => {
            const lcol = col.toLowerCase();
            
            // Primary Keys
            if (lcol === 'id') return `${table}-${i}-${crypto.randomBytes(4).toString('hex')}`;
            if (lcol === 'key' || lcol === 'token_hash' || lcol === 'state' || lcol === 'challenge' || lcol === 'email') {
              return `mock-${lcol}-${i}-${crypto.randomBytes(4).toString('hex')}`;
            }

            // Foreign Keys / References
            if (lcol === 'employeeid' || lcol === 'managerid' || lcol === 'approverid' || lcol === 'requesterid' || lcol === 'actorid' || lcol === 'reviewerid') return getRandEmp();
            if (lcol === 'userid' || lcol === 'user_id') return getRandUser();
            if (lcol === 'organizationid' || lcol === 'organization_id' || lcol === 'companyid' || lcol === 'company_id') return ORGANIZATION_ID;
            if (lcol === 'assetid') return getRandAsset();
            if (lcol.endsWith('id')) return `ref-${col}-${i}`; // generic fallback ID

            // Timestamps
            if (lcol.includes('date') || lcol.includes('time') || lcol.includes('at')) {
              if (lcol.includes('expires') || lcol.includes('due')) {
                 const future = new Date();
                 future.setFullYear(future.getFullYear() + 1);
                 return future.toISOString();
              }
              return new Date().toISOString();
            }

            // Statuses / Enums
            if (lcol === 'status') return 'ACTIVE';
            if (lcol === 'action') return 'CREATED';
            if (lcol === 'type' || lcol === 'entitytype') return 'GENERIC';
            if (lcol === 'status' && table === 'failed_logins') return null; // failed_logins doesn't have status usually
            
            // Numbers
            if (lcol.includes('amount') || lcol.includes('salary') || lcol.includes('budget') || lcol.includes('cost') || lcol.includes('pay') || lcol.includes('ytd')) return Math.floor(Math.random() * 10000);
            if (lcol.includes('percentage') || lcol.includes('rate') || lcol.includes('rating') || lcol.includes('score')) return 4.5;
            if (lcol.includes('count') || lcol.includes('attempts') || lcol.includes('hits')) return 1;
            
            // Booleans / Ints
            if (columnsInfo.find(c => c.name === col)?.type === 'INTEGER') {
              if (lcol.includes('is') || lcol.includes('enabled') || lcol.includes('taxable')) return 1;
              return 1;
            }
            if (columnsInfo.find(c => c.name === col)?.type === 'REAL') return 10.5;

            // Strings
            if (lcol.includes('name') || lcol.includes('title')) return `Mock ${col} ${i}`;
            if (lcol.includes('email')) return `mock${i}@example.com`;
            if (lcol.includes('url')) return `https://example.com/mock${i}.pdf`;
            if (lcol.includes('description') || lcol.includes('reason') || lcol.includes('notes') || lcol.includes('comments') || lcol.includes('feedback')) return `This is a mock ${col} for testing.`;
            
            return `Mock ${col}`;
          });

          try {
            insertStmt.run(values);
          } catch(e) {
            // Ignore individual row errors to let others proceed
          }
        }
      })();
      
      console.log(`Seeded ${table}`);
      seededTables++;
    } catch (e) {
      console.log(`Failed seeding ${table}:`, e.message);
    }
  }

  // Restore FKs
  db.pragma('foreign_keys = ON');

  console.log(`[SQLite Ultimate Seeder] Successfully seeded ${seededTables} empty tables.`);
};

if (process.argv[1] && process.argv[1].endsWith('seed-ultimate.ts')) {
  seedUltimate().then(() => process.exit(0)).catch(e => {
    console.error('Failed:', e);
    process.exit(1);
  });
}

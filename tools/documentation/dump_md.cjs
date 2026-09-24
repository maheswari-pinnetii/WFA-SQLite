const db = require('better-sqlite3')('database/sqlite/wfa.sqlite');
const fs = require('fs');

const tables = [
  'applications', 'approval_actions', 'approval_requests', 'approval_steps', 'approval_workflows',
  'asset_assignments', 'asset_history', 'attendance', 'correctionrequests', 'email_verification_tokens',
  'employee_bank_details', 'employee_certifications', 'employee_documents', 'employee_education',
  'employee_emergency_contacts', 'employee_experience', 'employee_history', 'employee_salary_structures',
  'employee_status_history', 'employee_tax_info', 'employee_tax_profiles', 'expenses', 'failed_logins',
  'feature_flags', 'full_and_final_settlements', 'goals', 'holidays', 'idempotency_records', 'import_errors',
  'interviews', 'job_requisitions', 'leave_accruals', 'legal_entities', 'lifecycle_events', 'notifications',
  'offers', 'okr_key_results', 'okr_objectives', 'overtime_records', 'overtime_rules', 'passkey_challenges',
  'passkey_credentials', 'password_reset_tokens', 'payroll_approvals', 'payroll_audit_logs', 'payroll_line_items',
  'payroll_lop_records', 'payroll_overtime_records', 'payroll_reimbursement_records', 'payroll_reversals',
  'payroll_run_employees', 'payroll_run_logs', 'payroll_runs', 'payroll_ytd', 'performance_cycles',
  'rate_limits', 'reviews', 'roster_assignments', 'salary_revisions', 'security_audit_logs', 'statutory_config',
  'system_calendars', 'tax_declarations', 'training_courses', 'training_enrollments', 'trusted_devices',
  'user_notification_preferences', 'user_sessions', 'work_configurations', 'workflow_requests',
  'workflow_instances', 'workflow_steps', 'workflows'
];

let md = '# Database Data Preview\n\nThis document automatically pulls the first 3 rows directly from `wfa.sqlite` to prove the data exists.\n\n';

for (const table of tables) {
  try {
    const rows = db.prepare('SELECT * FROM ' + table + ' LIMIT 3').all();
    if (rows.length === 0) {
      md += '## ' + table + '\n\n*Table is empty*\n\n';
      continue;
    }
    
    md += '## ' + table + ' (' + db.prepare('SELECT COUNT(*) as c FROM ' + table).get().c + ' rows total)\n\n';
    
    const cols = Object.keys(rows[0]);
    md += '| ' + cols.join(' | ') + ' |\n';
    md += '| ' + cols.map(() => '---').join(' | ') + ' |\n';
    
    for (const row of rows) {
      md += '| ' + cols.map(c => {
        let val = row[c];
        if (val === null) return 'null';
        if (typeof val === 'string') return val.substring(0, 30).replace(/\\|/g, '') + (val.length > 30 ? '...' : '');
        return val;
      }).join(' | ') + ' |\n';
    }
    md += '\n\n';
  } catch (e) {
    md += '## ' + table + '\n\n*Error: ' + e.message + '*\n\n';
  }
}

fs.writeFileSync('C:/Users/91970/.gemini/antigravity-ide/brain/1f15b1aa-2cb6-456a-9acb-dfa2ba153eac/database_preview.md', md);
console.log('Done');

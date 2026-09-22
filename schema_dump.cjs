const db = require('better-sqlite3')('database/sqlite/wfa.sqlite');
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

for (const table of tables) {
  const row = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name=?").get(table);
  console.log(`--- ${table} ---`);
  console.log(row ? row.sql : 'NOT FOUND');
}

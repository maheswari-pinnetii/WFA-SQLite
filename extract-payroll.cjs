const db = require('better-sqlite3')('tests/.data/integration.sqlite');
const tables = [
  'salary_structures',
  'salary_components',
  'employee_salary_structures',
  'salary_revisions',
  'payroll_runs',
  'payroll_run_employees',
  'payroll_run_logs',
  'payslips',
  'employee_bank_details',
  'employee_tax_info',
  'statutory_config',
  'pf_esi_records',
  'tax_declarations',
  'payroll_line_items',
  'payroll_lop_records',
  'payroll_overtime_records',
  'payroll_reimbursement_records',
  'payroll_approvals',
  'payroll_reversals',
  'employee_tax_profiles',
  'payroll_ytd',
  'payroll_audit_logs',
  'full_and_final_settlements'
];
for (const table of tables) {
  const info = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name=?").get(table);
  if (info) {
    console.log(info.sql + ";\n");
  }
}

const Database = require('better-sqlite3');
const db = new Database('./database/sqlite/wfa.sqlite');

const tables = [
  'appraisal_cycles','appraisal_reviews','approval_requests',
  'attendanceevents','attendance_monthly_summary','designations',
  'employee_bank_details','employee_certifications','employee_documents',
  'employee_education','employee_emergency_contacts','employee_experience',
  'employee_history','employee_skills','employee_status_history',
  'employee_tax_info','expense_claims','goals',
  'investment_declarations','job_applications','job_levels',
  'leave_balances','leave_blackout_periods','leave_policies',
  'leave_requests','lifecycle_events','okr_objectives','okr_key_results',
  'payslips','performancerecords','pf_esi_records','reviews',
  'salary_components','salary_structures','employee_salary_structures',
  'shift_assignments','skills','tax_declarations',
  'timesheet_entries','timesheets','training_courses','training_enrollments',
  'work_schedules','work_configurations'
];

for (const t of tables) {
  try {
    const cols = db.prepare(`PRAGMA table_info(${t})`).all().map(c => c.name);
    const count = db.prepare(`SELECT COUNT(*) as c FROM ${t}`).get().c;
    console.log(`${t} (${count} rows): ${cols.join(', ')}`);
  } catch(e) {
    console.log(`${t}: ERROR - ${e.message}`);
  }
}
db.close();

const db = require('better-sqlite3')('database/sqlite/wfa.sqlite');
const tables = [
  'applications', 'approval_workflows', 'approval_steps', 'approval_requests', 'approval_actions',
  'asset_assignments', 'asset_history', 'attendance', 'attendanceevents', 'breaksessions', 'correctionrequests',
  'job_requisitions'
];

for (const table of tables) {
  const row = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name=?").get(table);
  console.log(`--- ${table} ---`);
  console.log(row ? row.sql : 'NOT FOUND');
}

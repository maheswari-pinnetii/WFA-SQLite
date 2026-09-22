const db = require('better-sqlite3')('database/sqlite/wfa.sqlite');
const tables = ['cost_centers', 'appraisal_cycles', 'appraisal_reviews', 'job_applications', 'bulk_imports', 'delayed_jobs', 'applications'];

for (const table of tables) {
  const row = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name=?").get(table);
  console.log(`--- ${table} ---`);
  console.log(row ? row.sql : 'NOT FOUND');
}

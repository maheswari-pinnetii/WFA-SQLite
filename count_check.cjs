const Database = require('better-sqlite3');
const db = new Database('database/sqlite/wfa.sqlite');

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('--- Table Row Counts ---');
for (const t of tables) {
  try {
    const count = db.prepare(`SELECT COUNT(*) as c FROM ${t.name}`).get().c;
    if (count === 0) {
      console.log(`EMPTY: ${t.name}`);
    } else {
      console.log(`HAS_DATA: ${t.name} (${count} rows)`);
    }
  } catch (e) {
    console.log(`ERROR: ${t.name} - ${e.message}`);
  }
}

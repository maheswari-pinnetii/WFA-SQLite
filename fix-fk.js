const db = require('better-sqlite3')('C:/Users/91970/Downloads/WFA-SQLite/database/sqlite/wfa.sqlite');
const violations = db.pragma('foreign_key_check');
const uniqueTables = [...new Set(violations.map(v => v.table))];
console.log('Tables with violations:', uniqueTables);
uniqueTables.forEach(table => {
  const sql = DELETE FROM  WHERE rowid IN (SELECT rowid FROM pragma_foreign_key_check(''));
  db.prepare(sql).run();
});
console.log('Deleted invalid rows.');

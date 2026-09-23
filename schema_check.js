const db = require('./node_modules/better-sqlite3')('database/sqlite/wfa.sqlite');
console.log(db.prepare("PRAGMA table_info('attendancerecords')").all());
console.log(db.prepare("PRAGMA table_info('payroll_run_employees')").all());

const fs = require('fs');
const db = require('./node_modules/better-sqlite3')('database/sqlite/wfa.sqlite');
const table = process.argv[2] || 'payroll_runs';
console.log(db.prepare(`PRAGMA table_info('${table}')`).all());

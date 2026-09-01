import BetterSqlite3 from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve('database/sqlite/wfa.sqlite');
const db = new BetterSqlite3(dbPath);

console.log('====================================================');
console.log('🗄️ SQLITE DATABASE STORAGE INSPECTION');
console.log('====================================================');
console.log('Database Path:', dbPath);

const tables = [
  'users',
  'employees',
  'departments',
  'teams',
  'shifts',
  'locations',
  'attendancerecords',
  'performancerecords',
  'skills',
  'tasks',
  'leaverequests',
  'sessions',
  'refreshtokens',
  'audit_logs',
  'failed_logins',
  'mfa_settings',
  'mfa_recovery_codes',
  'mfachallenges',
  'oauth_states'
];

console.log('\n--- TABLE RECORD COUNTS ---');
for (const t of tables) {
  try {
    const row = db.prepare(`SELECT COUNT(*) as count FROM ${t}`).get() as { count: number };
    console.log(`• ${t.padEnd(22)}: ${row.count} records`);
  } catch (err: any) {
    console.log(`• ${t.padEnd(22)}: (Table does not exist)`);
  }
}

console.log('\n--- SAMPLE RECENT ACTIVE SESSIONS ---');
try {
  const sessions = db.prepare('SELECT id, userId, ipAddress, deviceFingerprint, createdAt, expiresAt FROM sessions ORDER BY createdAt DESC LIMIT 3').all();
  console.log(sessions);
} catch (e: any) {
  console.log('No sessions found.');
}

console.log('\n--- SAMPLE RECENT AUDIT LOGS ---');
try {
  const logs = db.prepare('SELECT id, employeeId, action, details, timestamp FROM audit_logs ORDER BY timestamp DESC LIMIT 3').all();
  console.log(logs);
} catch (e: any) {
  console.log('No audit logs found.');
}
console.log('====================================================');

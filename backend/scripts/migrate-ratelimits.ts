import 'dotenv/config';
import { connectDatabase, execute, query } from '../src/database/sqlite-cloud.js';

async function migrate() {
  console.log('[Migration] Connecting to database...');
  await connectDatabase();

  console.log('[Migration] Creating rate_limits table...');
  await execute(`
    CREATE TABLE IF NOT EXISTS rate_limits (
      key TEXT PRIMARY KEY,
      hits INTEGER NOT NULL DEFAULT 1,
      expiresAt INTEGER NOT NULL
    )
  `);

  await execute(`CREATE INDEX IF NOT EXISTS idx_rate_limits_expiry ON rate_limits(expiresAt)`);

  console.log('[Migration] Creating security_audit_logs table...');
  await execute(`
    CREATE TABLE IF NOT EXISTS security_audit_logs (
      id TEXT PRIMARY KEY,
      userId TEXT,
      action TEXT NOT NULL,
      ipAddress TEXT,
      userAgent TEXT,
      details TEXT,
      timestamp TEXT NOT NULL
    )
  `);

  await execute(`CREATE INDEX IF NOT EXISTS idx_security_audit_user ON security_audit_logs(userId)`);

  const tables = await query("SELECT name FROM sqlite_master WHERE type='table' AND name IN ('rate_limits', 'security_audit_logs')");
  console.log('[Migration] Verified tables in database:', tables);
  console.log('[Migration] Completed successfully.');
  process.exit(0);
}

migrate().catch((err) => {
  console.error('[Migration] Failed:', err);
  process.exit(1);
});

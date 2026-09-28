import { Database } from '@sqlitecloud/drivers';

async function run() {
  const db = new Database('sqlitecloud://chrk2ahwvk.g2.sqlite.cloud:8860/auth.sqlitecloud?apikey=xenaeusZqMZhUIfNKX9p9qx8TNRR7Y1XisX4APazqdE');
  
  const hash = '$2b$10$WydnvD6fjOewqjHXSLz/rONar6dKe78qy2p/UQaRbVVQHA99wniZ.';
  
  await db.sql`
    INSERT OR IGNORE INTO users (
      id, name, email, password_hash, role, department, team, location, title, clearanceLevel, status, permissions, mfa_enabled, organizationId, companyId, createdAt, updatedAt
    ) VALUES (
      'usr-exec-01', 'Sarah Jenkins', 'executive@thestackly.com', ${hash}, 'EXECUTIVE', 'Operations', 'Leadership', 'Remote', 'Chief Operations Officer', 4, 'ACTIVE', '["VIEW_ALL_DATA", "REPORT_GENERATE"]', 0, 'org-stackly', 'org-stackly', datetime('now'), datetime('now')
    )
  `;
  
  console.log('Inserted executive.');
  process.exit(0);
}
run();

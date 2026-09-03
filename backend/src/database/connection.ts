import { connectDatabase, query, execute, healthCheck } from './sqlite-cloud.js';

export const ORGANIZATION_ID = 'org-stackly';
let initPromise: Promise<void> | null = null;

// Re-export getDb and query/execute helpers
export { getDatabase as getDb, query, execute } from './sqlite-cloud.js';

export const initDb = async (): Promise<void> => {
  if (!initPromise) {
    initPromise = (async () => {
      try {
        // Connect to either SQLite Cloud or fallback to local SQLite
        await connectDatabase();

        const columnExists = async (tableName: string, columnName: string): Promise<boolean> => {
          try {
            const columns = await query(`PRAGMA table_info(${tableName})`);
            return Array.isArray(columns) && columns.some((col: any) => col.name === columnName);
          } catch (err) {
            return false;
          }
        };

        // Run migrations for users and mfachallenges columns if they don't exist
        if (!(await columnExists('users', 'authProvider'))) {
          try { await execute("ALTER TABLE users ADD COLUMN authProvider TEXT DEFAULT 'local';"); } catch (e) {}
        }
        if (!(await columnExists('users', 'providerSubject'))) {
          try { await execute("ALTER TABLE users ADD COLUMN providerSubject TEXT;"); } catch (e) {}
        }
        if (!(await columnExists('mfachallenges', 'type'))) {
          try { await execute("ALTER TABLE mfachallenges ADD COLUMN type TEXT DEFAULT 'totp-mfa';"); } catch (e) {}
        }
        if (!(await columnExists('failed_logins', 'lockedAt'))) {
          try { await execute("ALTER TABLE failed_logins ADD COLUMN lockedAt TEXT;"); } catch (e) {}
        }
        if (!(await columnExists('failed_logins', 'lockReason'))) {
          try { await execute("ALTER TABLE failed_logins ADD COLUMN lockReason TEXT;"); } catch (e) {}
        }

        // Ensure critical tables exist (like failed_logins)
        await execute(`
          CREATE TABLE IF NOT EXISTS failed_logins (
            email TEXT PRIMARY KEY,
            attempts INTEGER DEFAULT 0,
            lockedUntil TEXT,
            updatedAt TEXT
          )
        `);

        // Ensure OAuth PKCE state table exists
        await execute(`
          CREATE TABLE IF NOT EXISTS oauth_states (
            state TEXT PRIMARY KEY,
            code_verifier TEXT NOT NULL,
            provider TEXT NOT NULL,
            expires_at TEXT NOT NULL
          )
        `);

        // Ensure MFA tables exist
        await execute(`
          CREATE TABLE IF NOT EXISTS mfa_settings (
            id TEXT PRIMARY KEY,
            user_id TEXT UNIQUE NOT NULL,
            enabled INTEGER DEFAULT 0,
            secret_encrypted TEXT NOT NULL,
            verified_at TEXT,
            created_at TEXT,
            updated_at TEXT,
            last_used_time_step INTEGER DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
          )
        `);

        await execute(`
          CREATE TABLE IF NOT EXISTS mfa_recovery_codes (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            code_hash TEXT NOT NULL,
            used_at TEXT,
            created_at TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
          )
        `);

        await execute(`
          CREATE TABLE IF NOT EXISTS passkey_credentials (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            credential_id TEXT UNIQUE NOT NULL,
            public_key TEXT NOT NULL,
            counter INTEGER DEFAULT 0,
            device_label TEXT,
            transports TEXT,
            created_at TEXT NOT NULL,
            last_used_at TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
          )
        `);

        await execute(`
          CREATE TABLE IF NOT EXISTS passkey_challenges (
            challenge TEXT PRIMARY KEY,
            user_id TEXT,
            email TEXT,
            type TEXT NOT NULL,
            expires_at TEXT NOT NULL,
            created_at TEXT NOT NULL
          )
        `);

        await execute(`
          CREATE TABLE IF NOT EXISTS trusted_devices (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            device_name TEXT NOT NULL,
            device_type TEXT DEFAULT 'desktop',
            auth_method TEXT NOT NULL,
            device_fingerprint TEXT NOT NULL,
            ip_address TEXT,
            user_agent TEXT,
            trusted_until TEXT NOT NULL,
            created_at TEXT NOT NULL,
            last_used_at TEXT NOT NULL,
            status TEXT DEFAULT 'ACTIVE',
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
          )
        `);

        // AI Insights Table
        await execute(`
          CREATE TABLE IF NOT EXISTS ai_insights (
            id TEXT PRIMARY KEY,
            organization_id TEXT NOT NULL DEFAULT 'org-stackly',
            type TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            severity TEXT NOT NULL DEFAULT 'INFO',
            confidence REAL DEFAULT 0.85,
            source TEXT DEFAULT 'statistical-model',
            department TEXT,
            team TEXT,
            employee_id TEXT,
            data_period_start TEXT,
            data_period_end TEXT,
            created_at TEXT NOT NULL,
            expires_at TEXT,
            status TEXT DEFAULT 'ACTIVE'
          )
        `);

        // Feature Flags Table
        await execute(`
          CREATE TABLE IF NOT EXISTS feature_flags (
            key TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            enabled INTEGER DEFAULT 1,
            target_roles TEXT DEFAULT '["ADMIN","HR","MANAGER","TEAM_LEAD","EMPLOYEE"]',
            organization_id TEXT NOT NULL DEFAULT 'org-stackly',
            updated_at TEXT NOT NULL,
            created_at TEXT NOT NULL
          )
        `);

        // Delayed Job Scheduler Table
        await execute(`
          CREATE TABLE IF NOT EXISTS delayed_jobs (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            payload TEXT,
            status TEXT DEFAULT 'PENDING',
            run_at TEXT NOT NULL,
            attempts INTEGER DEFAULT 0,
            max_attempts INTEGER DEFAULT 3,
            last_error TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
          )
        `);

        await execute(`CREATE INDEX IF NOT EXISTS idx_mfa_settings_user ON mfa_settings(user_id)`);
        await execute(`CREATE INDEX IF NOT EXISTS idx_mfa_recovery_user ON mfa_recovery_codes(user_id)`);
        await execute(`CREATE INDEX IF NOT EXISTS idx_passkey_user_id ON passkey_credentials(user_id)`);
        await execute(`CREATE INDEX IF NOT EXISTS idx_passkey_cred_id ON passkey_credentials(credential_id)`);
        await execute(`CREATE INDEX IF NOT EXISTS idx_passkey_challenge_expires ON passkey_challenges(expires_at)`);
        await execute(`CREATE INDEX IF NOT EXISTS idx_trusted_devices_user ON trusted_devices(user_id)`);
        await execute(`CREATE INDEX IF NOT EXISTS idx_trusted_devices_fingerprint ON trusted_devices(device_fingerprint)`);
        await execute(`CREATE INDEX IF NOT EXISTS idx_ai_insights_org_status ON ai_insights(organization_id, status)`);
        await execute(`CREATE INDEX IF NOT EXISTS idx_ai_insights_created ON ai_insights(created_at)`);
        await execute(`CREATE INDEX IF NOT EXISTS idx_ai_insights_dept ON ai_insights(department)`);
        await execute(`CREATE INDEX IF NOT EXISTS idx_delayed_jobs_status_run ON delayed_jobs(status, run_at)`);
        await execute(`CREATE INDEX IF NOT EXISTS idx_attendancerecords_emp_date ON attendancerecords(employeeId, date)`);
        await execute(`CREATE INDEX IF NOT EXISTS idx_attendancerecords_emp_status ON attendancerecords(employeeId, status)`);
        await execute(`CREATE INDEX IF NOT EXISTS idx_attendancerecords_date ON attendancerecords(date)`);
        await execute(`CREATE INDEX IF NOT EXISTS idx_leaverequests_emp ON leaverequests(employeeId)`);
        await execute(`CREATE INDEX IF NOT EXISTS idx_leaverequests_status ON leaverequests(status)`);
        await execute(`CREATE INDEX IF NOT EXISTS idx_employees_dept ON employees(department)`);
        await execute(`CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status)`);
        await execute(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
        await execute(`CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp)`);

        // Perform health check write test
        const isHealthy = await healthCheck();
        if (!isHealthy) {
          throw new Error('Database ping query failed during initialization.');
        }

        const id = 'startup-verify-' + Date.now();
        const timestamp = new Date().toISOString();
        await execute(`
          INSERT INTO audit_logs (id, timestamp, employeeId, action, details, organizationId, companyId)
          VALUES (?, ?, 'system', 'startup-test', 'validation-write', ?, ?)
        `, [id, timestamp, ORGANIZATION_ID, ORGANIZATION_ID]);
        
        await execute('DELETE FROM audit_logs WHERE id = ?', [id]);

        console.log('[SQLite Init] Database connection and health verified successfully.');
      } catch (err: any) {
        console.error('[SQLite Init] Database initialization failed:', err);
        throw err;
      }
    })();
  }
  return initPromise;
};

export const logAudit = async (userId: string, action: string, details: string, organizationId: string = ORGANIZATION_ID): Promise<void> => {
  const id = Math.random().toString(36).slice(2, 11);
  const timestamp = new Date().toISOString();
  try {
    await execute(`
      INSERT INTO audit_logs (id, timestamp, employeeId, action, details, organizationId, companyId)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [id, timestamp, userId || 'anonymous', action, details, organizationId, organizationId]);
  } catch (err) {
    console.error('[logAudit] Failed to log audit event:', err);
  }
};

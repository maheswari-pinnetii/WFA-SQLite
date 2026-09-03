-- schema.sql
-- WFA SQLite Database Schema

CREATE TABLE IF NOT EXISTS companies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT,
  status TEXT DEFAULT 'ACTIVE',
  createdAt TEXT,
  updatedAt TEXT
);

CREATE TABLE IF NOT EXISTS departments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  managerId TEXT,
  organizationId TEXT DEFAULT 'org-stackly',
  companyId TEXT DEFAULT 'org-stackly',
  createdAt TEXT,
  updatedAt TEXT
);

CREATE TABLE IF NOT EXISTS teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  departmentId TEXT,
  leadId TEXT,
  organizationId TEXT DEFAULT 'org-stackly',
  companyId TEXT DEFAULT 'org-stackly',
  createdAt TEXT,
  updatedAt TEXT
);

CREATE TABLE IF NOT EXISTS shifts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  startTime TEXT,
  endTime TEXT,
  gracePeriodMinutes INTEGER DEFAULT 0,
  organizationId TEXT DEFAULT 'org-stackly',
  companyId TEXT DEFAULT 'org-stackly',
  createdAt TEXT,
  updatedAt TEXT
);

CREATE TABLE IF NOT EXISTS locations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  country TEXT,
  latitude REAL,
  longitude REAL,
  geofenceRadius INTEGER DEFAULT 100,
  organizationId TEXT DEFAULT 'org-stackly',
  companyId TEXT DEFAULT 'org-stackly',
  createdAt TEXT,
  updatedAt TEXT
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL,
  department TEXT,
  team TEXT,
  location TEXT,
  title TEXT,
  clearanceLevel INTEGER DEFAULT 1,
  status TEXT DEFAULT 'ACTIVE',
  permissions TEXT, -- Stored as JSON string representation of array
  mfa_enabled INTEGER DEFAULT 1,
  authProvider TEXT DEFAULT 'local',
  providerSubject TEXT,
  organizationId TEXT DEFAULT 'org-stackly',
  companyId TEXT DEFAULT 'org-stackly',
  createdAt TEXT,
  updatedAt TEXT
);

CREATE TABLE IF NOT EXISTS mfachallenges (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  otp_hash TEXT NOT NULL,
  type TEXT DEFAULT 'totp-mfa',
  expires_at TEXT NOT NULL,
  attempts_count INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 5,
  consumed_at TEXT,
  resend_count INTEGER DEFAULT 0,
  created_at TEXT,
  status TEXT DEFAULT 'Pending',
  organizationId TEXT DEFAULT 'org-stackly',
  companyId TEXT DEFAULT 'org-stackly',
  createdAt TEXT,
  updatedAt TEXT
);

CREATE TABLE IF NOT EXISTS employees (
  id TEXT PRIMARY KEY,
  employeeCode TEXT UNIQUE,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  role TEXT DEFAULT 'EMPLOYEE',
  department TEXT,
  designation TEXT,
  status TEXT DEFAULT 'ACTIVE',
  avatar TEXT,
  joinDate TEXT,
  performanceScore REAL DEFAULT 90,
  attendanceRate REAL DEFAULT 95,
  team TEXT,
  location TEXT,
  organizationId TEXT DEFAULT 'org-stackly',
  companyId TEXT DEFAULT 'org-stackly',
  createdAt TEXT,
  updatedAt TEXT
);

CREATE TABLE IF NOT EXISTS skills (
  id TEXT PRIMARY KEY,
  employeeId TEXT NOT NULL,
  skillName TEXT NOT NULL,
  level INTEGER DEFAULT 1,
  isTopSkill INTEGER DEFAULT 0,
  isMissingSkill INTEGER DEFAULT 0,
  department TEXT,
  team TEXT,
  organizationId TEXT DEFAULT 'org-stackly',
  companyId TEXT DEFAULT 'org-stackly',
  createdAt TEXT,
  updatedAt TEXT
);

CREATE TABLE IF NOT EXISTS performancerecords (
  id TEXT PRIMARY KEY,
  employeeId TEXT NOT NULL,
  quarter TEXT NOT NULL,
  kpiScore REAL DEFAULT 0,
  targetScore REAL DEFAULT 0,
  productivityScore REAL DEFAULT 0,
  department TEXT,
  team TEXT,
  organizationId TEXT DEFAULT 'org-stackly',
  companyId TEXT DEFAULT 'org-stackly',
  createdAt TEXT,
  updatedAt TEXT
);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  assigneeId TEXT,
  assigneeName TEXT,
  department TEXT,
  team TEXT,
  organizationId TEXT DEFAULT 'org-stackly',
  priority TEXT DEFAULT 'MEDIUM',
  status TEXT DEFAULT 'TODO',
  points INTEGER DEFAULT 0,
  updatedAt TEXT,
  companyId TEXT DEFAULT 'org-stackly',
  createdAt TEXT
);

CREATE TABLE IF NOT EXISTS leaverequests (
  id TEXT PRIMARY KEY,
  employeeId TEXT NOT NULL,
  employeeName TEXT,
  department TEXT,
  team TEXT,
  organizationId TEXT DEFAULT 'org-stackly',
  companyId TEXT DEFAULT 'org-stackly',
  type TEXT,
  startDate TEXT,
  endDate TEXT,
  reason TEXT,
  status TEXT DEFAULT 'PENDING',
  reviewedBy TEXT,
  reviewComment TEXT,
  createdAt TEXT,
  updatedAt TEXT
);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT,
  read INTEGER DEFAULT 0,
  createdAt TEXT,
  organizationId TEXT DEFAULT 'org-stackly',
  companyId TEXT DEFAULT 'org-stackly',
  updatedAt TEXT
);

CREATE TABLE IF NOT EXISTS attendancerecords (
  id TEXT PRIMARY KEY,
  employeeId TEXT NOT NULL,
  employeeName TEXT,
  department TEXT,
  date TEXT NOT NULL,
  checkInTime TEXT,
  checkOutTime TEXT,
  breaks TEXT, -- JSON string representation of array of breaks
  shiftType TEXT DEFAULT 'Regular',
  workMode TEXT DEFAULT 'Office',
  status TEXT DEFAULT 'Checked Out',
  latitude REAL,
  longitude REAL,
  accuracy REAL,
  idempotencyKey TEXT UNIQUE,
  team TEXT,
  organizationId TEXT DEFAULT 'org-stackly',
  companyId TEXT DEFAULT 'org-stackly',
  createdAt TEXT,
  updatedAt TEXT
);

CREATE TABLE IF NOT EXISTS correctionrequests (
  id TEXT PRIMARY KEY,
  employeeId TEXT NOT NULL,
  employeeName TEXT,
  department TEXT,
  date TEXT NOT NULL,
  requestedCheckIn TEXT,
  requestedCheckOut TEXT,
  reason TEXT,
  status TEXT DEFAULT 'PENDING',
  managerComment TEXT,
  reviewedBy TEXT,
  createdAt TEXT,
  team TEXT,
  organizationId TEXT DEFAULT 'org-stackly',
  companyId TEXT DEFAULT 'org-stackly',
  updatedAt TEXT
);

CREATE TABLE IF NOT EXISTS breaksessions (
  id TEXT PRIMARY KEY,
  companyId TEXT NOT NULL,
  attendanceRecordId TEXT NOT NULL,
  startTime TEXT NOT NULL,
  endTime TEXT,
  status TEXT DEFAULT 'ACTIVE',
  createdAt TEXT,
  updatedAt TEXT
);

CREATE TABLE IF NOT EXISTS attendanceevents (
  id TEXT PRIMARY KEY,
  companyId TEXT NOT NULL,
  employeeId TEXT NOT NULL,
  attendanceRecordId TEXT NOT NULL,
  type TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  createdAt TEXT,
  updatedAt TEXT
);

CREATE TABLE IF NOT EXISTS idempotencyrecords (
  companyId TEXT NOT NULL,
  key TEXT NOT NULL,
  statusCode INTEGER NOT NULL,
  response TEXT NOT NULL, -- JSON string representation of response object
  expiresAt TEXT NOT NULL,
  createdAt TEXT,
  updatedAt TEXT,
  PRIMARY KEY (companyId, key)
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  deviceFingerprint TEXT,
  ipAddress TEXT,
  createdAt TEXT NOT NULL,
  expiresAt TEXT NOT NULL,
  revokedAt TEXT,
  companyId TEXT DEFAULT 'org-stackly',
  updatedAt TEXT
);

CREATE TABLE IF NOT EXISTS refreshtokens (
  token_hash TEXT PRIMARY KEY,
  sessionId TEXT NOT NULL,
  tokenFamily TEXT NOT NULL,
  parentHash TEXT,
  expiresAt TEXT NOT NULL,
  revokedAt TEXT,
  companyId TEXT DEFAULT 'org-stackly',
  createdAt TEXT,
  updatedAt TEXT
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  employeeId TEXT,
  action TEXT,
  details TEXT,
  organizationId TEXT DEFAULT 'org-stackly',
  companyId TEXT DEFAULT 'org-stackly',
  createdAt TEXT,
  updatedAt TEXT
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_employees_id ON employees(id);
CREATE INDEX IF NOT EXISTS idx_employees_code ON employees(employeeCode);
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_role ON employees(role);
CREATE INDEX IF NOT EXISTS idx_employees_dept ON employees(department);
CREATE INDEX IF NOT EXISTS idx_employees_loc ON employees(location);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_attendancerecords_date ON attendancerecords(date);
CREATE INDEX IF NOT EXISTS idx_attendancerecords_emp_date ON attendancerecords(employeeId, date);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);

-- Extra performance indexing for operational tables
CREATE INDEX IF NOT EXISTS idx_skills_emp ON skills(employeeId);
CREATE INDEX IF NOT EXISTS idx_perf_emp ON performancerecords(employeeId);
CREATE INDEX IF NOT EXISTS idx_leave_emp ON leaverequests(employeeId);
CREATE INDEX IF NOT EXISTS idx_employees_created ON employees(createdAt);
CREATE INDEX IF NOT EXISTS idx_attendancerecords_created ON attendancerecords(createdAt);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(createdAt);

-- TOTP MFA Settings Table
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
);

-- MFA One-Time Recovery Codes Table
CREATE TABLE IF NOT EXISTS mfa_recovery_codes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_mfa_settings_user ON mfa_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_mfa_recovery_user ON mfa_recovery_codes(user_id);

CREATE TABLE IF NOT EXISTS oauth_states (
  state TEXT PRIMARY KEY,
  code_verifier TEXT NOT NULL,
  provider TEXT NOT NULL,
  expires_at TEXT NOT NULL
);

-- Trusted Devices Table (Face, Biometric, Homescreen Lock)
CREATE TABLE IF NOT EXISTS trusted_devices (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  device_name TEXT NOT NULL,
  device_type TEXT DEFAULT 'desktop',
  auth_method TEXT NOT NULL, /* 'face' | 'biometric' | 'screen_lock' */
  device_fingerprint TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  trusted_until TEXT NOT NULL,
  created_at TEXT NOT NULL,
  last_used_at TEXT NOT NULL,
  status TEXT DEFAULT 'ACTIVE',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_trusted_devices_user ON trusted_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_trusted_devices_fingerprint ON trusted_devices(device_fingerprint);

-- AI Insights Table (Workforce anomalies, predictions, trends)
CREATE TABLE IF NOT EXISTS ai_insights (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL DEFAULT 'org-stackly',
  type TEXT NOT NULL, /* ATTENDANCE, ABSENCE, LATE_ARRIVAL, OVERTIME, LEAVE, WORKFORCE_UTILIZATION, ANOMALY, PREDICTION */
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'INFO', /* INFO, LOW, MEDIUM, HIGH, CRITICAL */
  confidence REAL DEFAULT 0.85,
  source TEXT DEFAULT 'statistical-model',
  department TEXT,
  team TEXT,
  employee_id TEXT,
  data_period_start TEXT,
  data_period_end TEXT,
  created_at TEXT NOT NULL,
  expires_at TEXT,
  status TEXT DEFAULT 'ACTIVE' /* ACTIVE, ACKNOWLEDGED, RESOLVED, DISMISSED */
);

CREATE INDEX IF NOT EXISTS idx_ai_insights_org_status ON ai_insights(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_ai_insights_created ON ai_insights(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_insights_dept ON ai_insights(department);

-- Feature Flags Table
CREATE TABLE IF NOT EXISTS feature_flags (
  key TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  enabled INTEGER DEFAULT 1,
  target_roles TEXT DEFAULT '["ADMIN","HR","MANAGER","TEAM_LEAD","EMPLOYEE"]',
  organization_id TEXT NOT NULL DEFAULT 'org-stackly',
  updated_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);

-- Delayed Job Scheduler Table
CREATE TABLE IF NOT EXISTS delayed_jobs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  payload TEXT,
  status TEXT DEFAULT 'PENDING', /* PENDING, RUNNING, COMPLETED, FAILED */
  run_at TEXT NOT NULL,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  last_error TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_delayed_jobs_status_run ON delayed_jobs(status, run_at);

-- schema.sql
-- WFA SQLite Database Schema

CREATE TABLE IF NOT EXISTS companies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS departments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  managerId TEXT,
  organizationId TEXT NOT NULL DEFAULT 'org-stackly',
  companyId TEXT NOT NULL DEFAULT 'org-stackly',
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  departmentId TEXT NOT NULL,
  leadId TEXT,
  organizationId TEXT NOT NULL DEFAULT 'org-stackly',
  companyId TEXT NOT NULL DEFAULT 'org-stackly',
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (departmentId) REFERENCES departments(id) ON DELETE CASCADE,
  FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS shifts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  startTime TEXT NOT NULL,
  endTime TEXT NOT NULL,
  gracePeriodMinutes INTEGER NOT NULL DEFAULT 0,
  organizationId TEXT NOT NULL DEFAULT 'org-stackly',
  companyId TEXT NOT NULL DEFAULT 'org-stackly',
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS locations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  country TEXT,
  latitude REAL,
  longitude REAL,
  geofenceRadius INTEGER NOT NULL DEFAULT 100,
  organizationId TEXT NOT NULL DEFAULT 'org-stackly',
  companyId TEXT NOT NULL DEFAULT 'org-stackly',
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE
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
  role TEXT NOT NULL DEFAULT 'EMPLOYEE',
  department TEXT,
  designation TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  avatar TEXT,
  joinDate TEXT,
  performanceScore REAL NOT NULL DEFAULT 90,
  attendanceRate REAL NOT NULL DEFAULT 95,
  team TEXT,
  location TEXT,
  organizationId TEXT NOT NULL DEFAULT 'org-stackly',
  companyId TEXT NOT NULL DEFAULT 'org-stackly',
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS skills (
  id TEXT PRIMARY KEY,
  employeeId TEXT NOT NULL,
  skillName TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  isTopSkill INTEGER NOT NULL DEFAULT 0,
  isMissingSkill INTEGER NOT NULL DEFAULT 0,
  department TEXT,
  team TEXT,
  organizationId TEXT NOT NULL DEFAULT 'org-stackly',
  companyId TEXT NOT NULL DEFAULT 'org-stackly',
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS performancerecords (
  id TEXT PRIMARY KEY,
  employeeId TEXT NOT NULL,
  quarter TEXT NOT NULL,
  kpiScore REAL NOT NULL DEFAULT 0,
  targetScore REAL NOT NULL DEFAULT 0,
  productivityScore REAL NOT NULL DEFAULT 0,
  department TEXT,
  team TEXT,
  organizationId TEXT NOT NULL DEFAULT 'org-stackly',
  companyId TEXT NOT NULL DEFAULT 'org-stackly',
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  assigneeId TEXT,
  assigneeName TEXT,
  department TEXT,
  team TEXT,
  organizationId TEXT NOT NULL DEFAULT 'org-stackly',
  priority TEXT NOT NULL DEFAULT 'MEDIUM',
  status TEXT NOT NULL DEFAULT 'TODO',
  points INTEGER NOT NULL DEFAULT 0,
  updatedAt TEXT NOT NULL,
  companyId TEXT NOT NULL DEFAULT 'org-stackly',
  createdAt TEXT NOT NULL,
  FOREIGN KEY (assigneeId) REFERENCES employees(id) ON DELETE SET NULL
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
  emailDeliveryStatus TEXT DEFAULT 'NONE',
  emailError TEXT,
  createdAt TEXT,
  organizationId TEXT DEFAULT 'org-stackly',
  companyId TEXT DEFAULT 'org-stackly',
  updatedAt TEXT
);

CREATE TABLE IF NOT EXISTS user_notification_preferences (
  id TEXT PRIMARY KEY,
  userId TEXT UNIQUE NOT NULL,
  inAppEnabled INTEGER DEFAULT 1,
  emailEnabled INTEGER DEFAULT 1,
  notifyOnLeave INTEGER DEFAULT 1,
  notifyOnApproval INTEGER DEFAULT 1,
  notifyOnPayroll INTEGER DEFAULT 1,
  notifyOnAttendance INTEGER DEFAULT 1,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
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

-- Security and Authentication Tables (aligned with connection.ts)
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id          TEXT    PRIMARY KEY,
  user_id     TEXT    NOT NULL,
  token_hash  TEXT    NOT NULL UNIQUE,
  created_at  TEXT    NOT NULL,
  expires_at  TEXT    NOT NULL,
  used_at     TEXT,
  ip_address  TEXT,
  user_agent  TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id          TEXT    PRIMARY KEY,
  user_id     TEXT    NOT NULL,
  email       TEXT    NOT NULL,
  token_hash  TEXT    NOT NULL UNIQUE,
  created_at  TEXT    NOT NULL,
  expires_at  TEXT    NOT NULL,
  used_at     TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS rate_limits (
  key       TEXT    PRIMARY KEY,
  hits      INTEGER NOT NULL DEFAULT 1,
  expiresAt INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS security_audit_logs (
  id         TEXT    PRIMARY KEY,
  userId     TEXT,
  action     TEXT    NOT NULL,
  ipAddress  TEXT,
  userAgent  TEXT,
  details    TEXT,
  timestamp  TEXT    NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_prt_token_hash   ON password_reset_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_prt_user_id      ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_evt_token_hash   ON email_verification_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_evt_user_id      ON email_verification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_rate_limits_expiry ON rate_limits(expiresAt);
CREATE INDEX IF NOT EXISTS idx_security_audit_user ON security_audit_logs(userId);

-- Phase 2: Employee Lifecycle
CREATE TABLE IF NOT EXISTS employee_history (
  id TEXT PRIMARY KEY,
  employeeId TEXT NOT NULL,
  fieldChanged TEXT NOT NULL,
  oldValue TEXT,
  newValue TEXT,
  changedBy TEXT,
  changedAt TEXT NOT NULL,
  organizationId TEXT DEFAULT 'org-stackly',
  FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS employee_documents (
  id TEXT PRIMARY KEY,
  employeeId TEXT NOT NULL,
  documentType TEXT NOT NULL,
  documentUrl TEXT NOT NULL,
  metadata TEXT,
  uploadedAt TEXT NOT NULL,
  uploadedBy TEXT,
  organizationId TEXT DEFAULT 'org-stackly',
  FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS employee_status_history (
  id TEXT PRIMARY KEY,
  employeeId TEXT NOT NULL,
  status TEXT NOT NULL,
  effectiveDate TEXT NOT NULL,
  reason TEXT,
  organizationId TEXT DEFAULT 'org-stackly',
  FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
);

-- Phase 2: Scheduling & Overtime
CREATE TABLE IF NOT EXISTS work_schedules (
  id TEXT PRIMARY KEY,
  employeeId TEXT NOT NULL,
  dayOfWeek INTEGER NOT NULL,
  startTime TEXT NOT NULL,
  endTime TEXT NOT NULL,
  organizationId TEXT DEFAULT 'org-stackly',
  FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS shift_assignments (
  id TEXT PRIMARY KEY,
  employeeId TEXT NOT NULL,
  shiftId TEXT NOT NULL,
  startDate TEXT NOT NULL,
  endDate TEXT,
  organizationId TEXT DEFAULT 'org-stackly',
  FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY (shiftId) REFERENCES shifts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS overtime_rules (
  id TEXT PRIMARY KEY,
  organizationId TEXT DEFAULT 'org-stackly',
  ruleName TEXT NOT NULL,
  thresholdHours REAL NOT NULL,
  multiplier REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS overtime_records (
  id TEXT PRIMARY KEY,
  employeeId TEXT NOT NULL,
  date TEXT NOT NULL,
  hours REAL NOT NULL,
  status TEXT DEFAULT 'PENDING',
  approvedBy TEXT,
  organizationId TEXT DEFAULT 'org-stackly',
  FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
);

-- Phase 3: Payroll
CREATE TABLE IF NOT EXISTS salary_structures (
  id TEXT PRIMARY KEY,
  employeeId TEXT NOT NULL,
  baseSalary REAL NOT NULL,
  currency TEXT DEFAULT 'USD',
  effectiveDate TEXT NOT NULL,
  organizationId TEXT DEFAULT 'org-stackly',
  FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS salary_components (
  id TEXT PRIMARY KEY,
  salaryStructureId TEXT NOT NULL,
  componentName TEXT NOT NULL,
  type TEXT NOT NULL,
  amount REAL NOT NULL,
  FOREIGN KEY (salaryStructureId) REFERENCES salary_structures(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payroll_runs (
  id TEXT PRIMARY KEY,
  organizationId TEXT DEFAULT 'org-stackly',
  periodStart TEXT NOT NULL,
  periodEnd TEXT NOT NULL,
  runDate TEXT NOT NULL,
  status TEXT DEFAULT 'DRAFT'
);

CREATE TABLE IF NOT EXISTS payslips (
  id TEXT PRIMARY KEY,
  payrollRunId TEXT NOT NULL,
  employeeId TEXT NOT NULL,
  basicPay REAL NOT NULL,
  totalEarnings REAL NOT NULL,
  totalDeductions REAL NOT NULL,
  netPay REAL NOT NULL,
  status TEXT DEFAULT 'GENERATED',
  FOREIGN KEY (payrollRunId) REFERENCES payroll_runs(id) ON DELETE CASCADE,
  FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
);

-- Phase 3: Leave Policy Engine
CREATE TABLE IF NOT EXISTS leave_types (
  id TEXT PRIMARY KEY,
  organizationId TEXT DEFAULT 'org-stackly',
  name TEXT NOT NULL,
  description TEXT,
  defaultDays INTEGER NOT NULL,
  isPaid INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS leave_balances (
  id TEXT PRIMARY KEY,
  employeeId TEXT NOT NULL,
  leaveTypeId TEXT NOT NULL,
  year INTEGER NOT NULL,
  allocated INTEGER NOT NULL,
  used INTEGER NOT NULL DEFAULT 0,
  organizationId TEXT DEFAULT 'org-stackly',
  FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY (leaveTypeId) REFERENCES leave_types(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS holidays (
  id TEXT PRIMARY KEY,
  organizationId TEXT DEFAULT 'org-stackly',
  name TEXT NOT NULL,
  date TEXT NOT NULL,
  type TEXT DEFAULT 'PUBLIC'
);

-- Phase 3: Recruitment Backend
CREATE TABLE IF NOT EXISTS job_requisitions (
  id TEXT PRIMARY KEY,
  organizationId TEXT DEFAULT 'org-stackly',
  title TEXT NOT NULL,
  department TEXT,
  status TEXT DEFAULT 'OPEN',
  openings INTEGER DEFAULT 1,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS applications (
  id TEXT PRIMARY KEY,
  jobRequisitionId TEXT NOT NULL,
  candidateName TEXT NOT NULL,
  candidateEmail TEXT NOT NULL,
  status TEXT DEFAULT 'NEW',
  appliedAt TEXT NOT NULL,
  FOREIGN KEY (jobRequisitionId) REFERENCES job_requisitions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS interviews (
  id TEXT PRIMARY KEY,
  applicationId TEXT NOT NULL,
  interviewerId TEXT NOT NULL,
  scheduledAt TEXT NOT NULL,
  status TEXT DEFAULT 'SCHEDULED',
  feedback TEXT,
  FOREIGN KEY (applicationId) REFERENCES applications(id) ON DELETE CASCADE,
  FOREIGN KEY (interviewerId) REFERENCES employees(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS offers (
  id TEXT PRIMARY KEY,
  applicationId TEXT NOT NULL,
  salaryOffered REAL NOT NULL,
  status TEXT DEFAULT 'PENDING',
  sentAt TEXT NOT NULL,
  FOREIGN KEY (applicationId) REFERENCES applications(id) ON DELETE CASCADE
);

-- Phase 3: Performance Workflow
CREATE TABLE IF NOT EXISTS performance_cycles (
  id TEXT PRIMARY KEY,
  organizationId TEXT DEFAULT 'org-stackly',
  name TEXT NOT NULL,
  startDate TEXT NOT NULL,
  endDate TEXT NOT NULL,
  status TEXT DEFAULT 'ACTIVE'
);

CREATE TABLE IF NOT EXISTS goals (
  id TEXT PRIMARY KEY,
  employeeId TEXT NOT NULL,
  performanceCycleId TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  progress INTEGER DEFAULT 0,
  status TEXT DEFAULT 'IN_PROGRESS',
  FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY (performanceCycleId) REFERENCES performance_cycles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  employeeId TEXT NOT NULL,
  reviewerId TEXT NOT NULL,
  performanceCycleId TEXT NOT NULL,
  rating INTEGER,
  feedback TEXT,
  status TEXT DEFAULT 'DRAFT',
  submittedAt TEXT,
  FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewerId) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY (performanceCycleId) REFERENCES performance_cycles(id) ON DELETE CASCADE
);

-- Phase 3: Platform Layer - Universal Approval Engine
CREATE TABLE IF NOT EXISTS approval_workflows (
  id TEXT PRIMARY KEY,
  organizationId TEXT DEFAULT 'org-stackly',
  name TEXT NOT NULL,
  entityType TEXT NOT NULL,
  description TEXT,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS approval_steps (
  id TEXT PRIMARY KEY,
  workflowId TEXT NOT NULL,
  stepOrder INTEGER NOT NULL,
  approverRole TEXT,
  specificApproverId TEXT,
  FOREIGN KEY (workflowId) REFERENCES approval_workflows(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS approval_requests (
  id TEXT PRIMARY KEY,
  workflowId TEXT NOT NULL,
  entityId TEXT NOT NULL,
  requesterId TEXT NOT NULL,
  status TEXT DEFAULT 'PENDING',
  currentStepOrder INTEGER DEFAULT 1,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (workflowId) REFERENCES approval_workflows(id) ON DELETE CASCADE,
  FOREIGN KEY (requesterId) REFERENCES employees(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS approval_actions (
  id TEXT PRIMARY KEY,
  requestId TEXT NOT NULL,
  stepOrder INTEGER NOT NULL,
  approverId TEXT NOT NULL,
  action TEXT NOT NULL,
  comments TEXT,
  actionAt TEXT NOT NULL,
  FOREIGN KEY (requestId) REFERENCES approval_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (approverId) REFERENCES employees(id) ON DELETE CASCADE
);

-- Phase 3: Platform Layer - Bulk Import Engine
CREATE TABLE IF NOT EXISTS bulk_imports (
  id TEXT PRIMARY KEY,
  organizationId TEXT DEFAULT 'org-stackly',
  entityType TEXT NOT NULL,
  status TEXT DEFAULT 'PROCESSING',
  totalRows INTEGER DEFAULT 0,
  successfulRows INTEGER DEFAULT 0,
  failedRows INTEGER DEFAULT 0,
  uploadedBy TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  completedAt TEXT
);

CREATE TABLE IF NOT EXISTS import_errors (
  id TEXT PRIMARY KEY,
  importId TEXT NOT NULL,
  rowNumber INTEGER NOT NULL,
  rowData TEXT NOT NULL,
  errorMessage TEXT NOT NULL,
  FOREIGN KEY (importId) REFERENCES bulk_imports(id) ON DELETE CASCADE
);

-- Step 7: Assets Management
CREATE TABLE IF NOT EXISTS assets (
  id TEXT PRIMARY KEY,
  organizationId TEXT DEFAULT 'org-stackly',
  assetTag TEXT UNIQUE NOT NULL,
  assetType TEXT NOT NULL,
  description TEXT,
  serialNumber TEXT,
  purchaseDate TEXT,
  value REAL,
  status TEXT DEFAULT 'AVAILABLE',
  assignedToId TEXT,
  assignedAt TEXT,
  assignedBy TEXT,
  returnedAt TEXT,
  createdAt TEXT NOT NULL,
  FOREIGN KEY (assignedToId) REFERENCES employees(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS asset_history (
  id TEXT PRIMARY KEY,
  assetId TEXT NOT NULL,
  action TEXT NOT NULL,
  performedBy TEXT,
  performedAt TEXT NOT NULL,
  notes TEXT,
  FOREIGN KEY (assetId) REFERENCES assets(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_assets_org_status ON assets(organizationId, status);
CREATE INDEX IF NOT EXISTS idx_assets_assignee ON assets(assignedToId);

-- Step 8: Training / L&D
CREATE TABLE IF NOT EXISTS training_courses (
  id TEXT PRIMARY KEY,
  organizationId TEXT DEFAULT 'org-stackly',
  title TEXT NOT NULL,
  description TEXT,
  durationHours REAL,
  isMandatory INTEGER DEFAULT 0,
  provider TEXT,
  expiresAfterMonths INTEGER,
  status TEXT DEFAULT 'ACTIVE',
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS training_enrollments (
  id TEXT PRIMARY KEY,
  courseId TEXT NOT NULL,
  employeeId TEXT NOT NULL,
  enrolledBy TEXT NOT NULL,
  status TEXT DEFAULT 'ENROLLED',
  enrolledAt TEXT NOT NULL,
  completedAt TEXT,
  score REAL,
  certUrl TEXT,
  expiresAt TEXT,
  FOREIGN KEY (courseId) REFERENCES training_courses(id) ON DELETE CASCADE,
  FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_training_enrollments_emp ON training_enrollments(employeeId);
CREATE INDEX IF NOT EXISTS idx_training_enrollments_course ON training_enrollments(courseId, status);

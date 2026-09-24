# Database Schema

| Field | Value |
|-------|-------|
| Document ID | DAT-003 |
| Version | 1.0 |
| Status | Active |
| Author | Maheswari Pinneti |
| Owner | Data |
| Created | 21 September 2026 |
| Last Updated | 21 September 2026 |
| Target Release | Not specified |
| Related Documents | Not specified |

---

## 1. Schema

```sql
﻿CREATE TABLE IF NOT EXISTS companies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT,
  status TEXT DEFAULT 'ACTIVE',
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
  organizationId TEXT DEFAULT 'org-stackly',
  companyId TEXT DEFAULT 'org-stackly',
  createdAt TEXT,
  updatedAt TEXT
);
-- Roles table placeholder for architecture compatibility
CREATE TABLE IF NOT EXISTS roles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT
);
-- Permissions table placeholder for architecture compatibility
CREATE TABLE IF NOT EXISTS permissions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT
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
CREATE TABLE IF NOT EXISTS mfachallenges (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  otp_hash TEXT NOT NULL,
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
-- Migration 017: Password Reset Tokens
-- Stores only a cryptographic hash of the reset token (never the raw token).
-- One active token per user: new token request invalidates old ones.
-- Token validity: 10 minutes (enforced at application layer AND stored in expires_at).

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id          TEXT    PRIMARY KEY,
  user_id     TEXT    NOT NULL,
  token_hash  TEXT    NOT NULL UNIQUE,  -- SHA-256 hash of 32-byte random token
  created_at  TEXT    NOT NULL,
  expires_at  TEXT    NOT NULL,          -- created_at + 10 minutes
  used_at     TEXT,                      -- NULL = not yet used; set on successful reset
  ip_address  TEXT,
  user_agent  TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Fast lookup by token hash during reset verification
CREATE INDEX IF NOT EXISTS idx_prt_token_hash ON password_reset_tokens(token_hash);

-- Fast cleanup and invalidation by user
CREATE INDEX IF NOT EXISTS idx_prt_user_id ON password_reset_tokens(user_id);
-- Migration 018: Email Verification Tokens
-- Token is cryptographically random, stored as hash only.
-- 30-minute expiry. Single-use.

CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id          TEXT    PRIMARY KEY,
  user_id     TEXT    NOT NULL,
  email       TEXT    NOT NULL,          -- The email address being verified
  token_hash  TEXT    NOT NULL UNIQUE,  -- SHA-256 hash of 32-byte random token
  created_at  TEXT    NOT NULL,
  expires_at  TEXT    NOT NULL,          -- created_at + 30 minutes
  used_at     TEXT,                      -- NULL = not verified yet
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_evt_token_hash ON email_verification_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_evt_user_id    ON email_verification_tokens(user_id);
-- Migration 019: Add email_verified columns to users table
-- Uses IF NOT EXISTS pattern via INSERT-OR-IGNORE trick;
-- SQLite ALTER TABLE ADD COLUMN is idempotent-safe when run inside a try-catch in the migration runner.

ALTER TABLE users ADD COLUMN email_verified    INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN email_verified_at TEXT;
-- Migration 020: Add last_resend_at to mfachallenges for resend cooldown enforcement
-- This column tracks when the last OTP resend was issued to prevent flooding.

ALTER TABLE mfachallenges ADD COLUMN last_resend_at TEXT;
-- Migration 021: Add missing indexes, CHECK constraints, and enforce FK on critical tables
-- Run after all prior migrations have completed
-- NOTE: SQLite doesn't support ALTER TABLE ADD CONSTRAINT for existing tables.
-- We add indexes and create new shadow tables with constraints for future inserts.
-- Existing rows are left intact (data was inserted without constraints).

-- ─── 1. Performance Indexes ─────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_employees_org          ON employees(organizationId);
CREATE INDEX IF NOT EXISTS idx_employees_status       ON employees(status);
CREATE INDEX IF NOT EXISTS idx_employees_email        ON employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_dept         ON employees(department);

CREATE INDEX IF NOT EXISTS idx_attendance_emp_date    ON attendancerecords(employeeId, date);
CREATE INDEX IF NOT EXISTS idx_attendance_org_date    ON attendancerecords(organizationId, date);
CREATE INDEX IF NOT EXISTS idx_attendance_org_status  ON attendancerecords(organizationId, status);

CREATE INDEX IF NOT EXISTS idx_audit_emp              ON audit_logs(employeeId);
CREATE INDEX IF NOT EXISTS idx_audit_org_action       ON audit_logs(organizationId, action);
CREATE INDEX IF NOT EXISTS idx_audit_created          ON audit_logs(createdAt);

CREATE INDEX IF NOT EXISTS idx_notifications_user     ON notifications(userId);
CREATE INDEX IF NOT EXISTS idx_notifications_status   ON notifications(read, userId);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user    ON refresh_tokens(userId);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_exp     ON refresh_tokens(expiresAt);

CREATE INDEX IF NOT EXISTS idx_salary_structures_emp  ON salary_structures(employeeId, effectiveDate DESC);
CREATE INDEX IF NOT EXISTS idx_payroll_runs_org       ON payroll_runs(organizationId, periodStart DESC);
CREATE INDEX IF NOT EXISTS idx_payslips_emp           ON payslips(employeeId);

CREATE INDEX IF NOT EXISTS idx_leave_balances_emp     ON leave_balances(employeeId, year);
CREATE INDEX IF NOT EXISTS idx_overtime_records_emp   ON overtime_records(employeeId, date);
CREATE INDEX IF NOT EXISTS idx_overtime_records_org   ON overtime_records(organizationId, status);

-- ─── 2. Leave requests index (if table exists) ──────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_leave_requests_emp     ON leave_requests(employeeId, status) WHERE EXISTS (SELECT 1 FROM sqlite_master WHERE type='table' AND name='leave_requests');

-- ─── 3. Attendance UNIQUE constraint on (employeeId, date) ──────────────────────
-- SQLite: Cannot add UNIQUE constraint to an existing table.
-- We enforce this via a UNIQUE trigger instead.
CREATE TRIGGER IF NOT EXISTS trg_attendance_no_duplicate_day
BEFORE INSERT ON attendancerecords
BEGIN
  SELECT RAISE(ABORT, 'ATTENDANCE_DUPLICATE_DATE: An attendance record already exists for this employee on this date.')
  WHERE EXISTS (
    SELECT 1 FROM attendancerecords
    WHERE employeeId = NEW.employeeId
      AND date = NEW.date
      AND organizationId = NEW.organizationId
      AND id != NEW.id
  );
END;

-- ─── 4. Attendance status CHECK trigger ─────────────────────────────────────────
CREATE TRIGGER IF NOT EXISTS trg_attendance_valid_status
BEFORE INSERT ON attendancerecords
BEGIN
  SELECT RAISE(ABORT, 'ATTENDANCE_INVALID_STATUS: status must be one of: Checked In, On Break, Checked Out')
  WHERE NEW.status NOT IN ('Checked In', 'On Break', 'Checked Out', 'NOT_STARTED');
END;

CREATE TRIGGER IF NOT EXISTS trg_attendance_valid_status_update
BEFORE UPDATE OF status ON attendancerecords
BEGIN
  SELECT RAISE(ABORT, 'ATTENDANCE_INVALID_STATUS: status must be one of: Checked In, On Break, Checked Out')
  WHERE NEW.status NOT IN ('Checked In', 'On Break', 'Checked Out', 'NOT_STARTED');
END;

-- ─── 5. Employee status CHECK trigger ───────────────────────────────────────────
CREATE TRIGGER IF NOT EXISTS trg_employee_valid_status
BEFORE INSERT ON employees
BEGIN
  SELECT RAISE(ABORT, 'EMPLOYEE_INVALID_STATUS: status must be ACTIVE, INACTIVE, TERMINATED, or ON_LEAVE')
  WHERE NEW.status NOT IN ('ACTIVE', 'INACTIVE', 'TERMINATED', 'ON_LEAVE');
END;

CREATE TRIGGER IF NOT EXISTS trg_employee_valid_status_update
BEFORE UPDATE OF status ON employees
BEGIN
  SELECT RAISE(ABORT, 'EMPLOYEE_INVALID_STATUS: status must be ACTIVE, INACTIVE, TERMINATED, or ON_LEAVE')
  WHERE NEW.status NOT IN ('ACTIVE', 'INACTIVE', 'TERMINATED', 'ON_LEAVE');
END;

-- ─── 6. Leave balance non-negative CHECK trigger ─────────────────────────────────
CREATE TRIGGER IF NOT EXISTS trg_leave_balance_non_negative
BEFORE UPDATE ON leave_balances
BEGIN
  SELECT RAISE(ABORT, 'LEAVE_INSUFFICIENT_BALANCE: Used days cannot exceed allocated days.')
  WHERE NEW.used > NEW.allocated;
END;

-- ─── 7. Salary structures effective date index ───────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_salary_comp_structure  ON salary_components(salaryStructureId);

-- ─── 8. Payroll runs status index ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_payroll_runs_status    ON payroll_runs(status, organizationId);
-- Migration 022: Complete Payroll, Compensation, Tax & Employee Payroll Architecture

PRAGMA foreign_keys = ON;

-- 1. Effective-dated employee salary structures
CREATE TABLE IF NOT EXISTS employee_salary_structures (
  id TEXT PRIMARY KEY,
  employeeId TEXT NOT NULL,
  organizationId TEXT NOT NULL DEFAULT 'org-stackly',
  salaryStructureId TEXT,
  annualCtc REAL NOT NULL,
  monthlyGross REAL NOT NULL,
  currency TEXT DEFAULT 'INR',
  effectiveFrom TEXT NOT NULL,
  effectiveTo TEXT,
  revisionReason TEXT,
  isActive INTEGER DEFAULT 1,
  createdBy TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
);

-- 2. Salary revision history
CREATE TABLE IF NOT EXISTS salary_revisions (
  id TEXT PRIMARY KEY,
  employeeId TEXT NOT NULL,
  organizationId TEXT NOT NULL DEFAULT 'org-stackly',
  previousCtc REAL NOT NULL,
  newCtc REAL NOT NULL,
  previousStructureId TEXT,
  newStructureId TEXT NOT NULL,
  effectiveDate TEXT NOT NULL,
  revisionPercentage REAL NOT NULL,
  reason TEXT NOT NULL,
  createdBy TEXT NOT NULL,
  approvedBy TEXT,
  createdTimestamp TEXT NOT NULL,
  approvalTimestamp TEXT,
  status TEXT DEFAULT 'APPROVED',
  FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
);

-- 3. Enhanced payroll runs
CREATE TABLE IF NOT EXISTS payroll_runs (
  id TEXT PRIMARY KEY,
  organizationId TEXT NOT NULL DEFAULT 'org-stackly',
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  periodStart TEXT NOT NULL,
  periodEnd TEXT NOT NULL,
  runDate TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'DRAFT', -- DRAFT, CALCULATED, VALIDATED, PENDING_APPROVAL, APPROVED, LOCKED, FINALIZED, ROLLED_BACK, REVERSED
  totalEmployees INTEGER DEFAULT 0,
  totalGross REAL DEFAULT 0,
  totalDeductions REAL DEFAULT 0,
  totalNetPay REAL DEFAULT 0,
  totalPf REAL DEFAULT 0,
  totalEsi REAL DEFAULT 0,
  totalPt REAL DEFAULT 0,
  totalTds REAL DEFAULT 0,
  totalReimbursements REAL DEFAULT 0,
  totalLopDeductions REAL DEFAULT 0,
  submittedBy TEXT,
  submittedAt TEXT,
  approvedBy TEXT,
  approvedAt TEXT,
  rejectedBy TEXT,
  rejectedAt TEXT,
  rejectionReason TEXT,
  lockedBy TEXT,
  lockedAt TEXT,
  finalizedBy TEXT,
  finalizedAt TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

-- 4. Payroll Run Employee records (Immutable Snapshot per run)
CREATE TABLE IF NOT EXISTS payroll_run_employees (
  id TEXT PRIMARY KEY,
  payrollRunId TEXT NOT NULL,
  employeeId TEXT NOT NULL,
  organizationId TEXT NOT NULL DEFAULT 'org-stackly',
  departmentId TEXT,
  designation TEXT,
  effectiveStructureId TEXT,
  taxRegime TEXT DEFAULT 'new',
  annualCtc REAL DEFAULT 0,
  basicPay REAL DEFAULT 0,
  hra REAL DEFAULT 0,
  specialAllowance REAL DEFAULT 0,
  otherEarnings REAL DEFAULT 0,
  overtimePay REAL DEFAULT 0,
  grossEarnings REAL DEFAULT 0,
  eligibleReimbursements REAL DEFAULT 0,
  employeePf REAL DEFAULT 0,
  employerPf REAL DEFAULT 0,
  employeeEsi REAL DEFAULT 0,
  employerEsi REAL DEFAULT 0,
  professionalTax REAL DEFAULT 0,
  tdsDeduction REAL DEFAULT 0,
  lopDays REAL DEFAULT 0,
  lopDeduction REAL DEFAULT 0,
  otherDeductions REAL DEFAULT 0,
  totalDeductions REAL DEFAULT 0,
  netPay REAL DEFAULT 0,
  status TEXT DEFAULT 'CALCULATED',
  createdAt TEXT NOT NULL,
  FOREIGN KEY (payrollRunId) REFERENCES payroll_runs(id) ON DELETE CASCADE,
  FOREIGN KEY (employeeId) REFERENCES employees(id)
);

-- 5. Individual Payroll Line Items (Earnings, Deductions, Statutory, Reimbursements)
CREATE TABLE IF NOT EXISTS payroll_line_items (
  id TEXT PRIMARY KEY,
  payrollRunEmployeeId TEXT NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- EARNING, DEDUCTION, STATUTORY_EMPLOYEE, STATUTORY_EMPLOYER, REIMBURSEMENT, TAX
  amount REAL NOT NULL,
  taxable INTEGER DEFAULT 1,
  pfApplicable INTEGER DEFAULT 1,
  esiApplicable INTEGER DEFAULT 1,
  calculationBasis TEXT,
  FOREIGN KEY (payrollRunEmployeeId) REFERENCES payroll_run_employees(id) ON DELETE CASCADE
);

-- 6. Loss of Pay (LOP) records linked to payroll
CREATE TABLE IF NOT EXISTS payroll_lop_records (
  id TEXT PRIMARY KEY,
  payrollRunEmployeeId TEXT NOT NULL,
  employeeId TEXT NOT NULL,
  payrollRunId TEXT NOT NULL,
  lopDays REAL NOT NULL,
  payrollDivisor INTEGER NOT NULL DEFAULT 30,
  lopBasisAmount REAL NOT NULL,
  calculatedLopAmount REAL NOT NULL,
  createdAt TEXT NOT NULL,
  FOREIGN KEY (payrollRunEmployeeId) REFERENCES payroll_run_employees(id) ON DELETE CASCADE
);

-- 7. Overtime Records linked to payroll
CREATE TABLE IF NOT EXISTS payroll_overtime_records (
  id TEXT PRIMARY KEY,
  payrollRunEmployeeId TEXT NOT NULL,
  overtimeRecordId TEXT NOT NULL,
  approvedHours REAL NOT NULL,
  hourlyRate REAL NOT NULL,
  multiplier REAL DEFAULT 1.5,
  calculatedAmount REAL NOT NULL,
  FOREIGN KEY (payrollRunEmployeeId) REFERENCES payroll_run_employees(id) ON DELETE CASCADE
);

-- 8. Expense Reimbursement Records linked to payroll
CREATE TABLE IF NOT EXISTS payroll_reimbursement_records (
  id TEXT PRIMARY KEY,
  payrollRunEmployeeId TEXT NOT NULL,
  expenseClaimId TEXT NOT NULL,
  category TEXT NOT NULL,
  approvedAmount REAL NOT NULL,
  taxable INTEGER DEFAULT 0,
  FOREIGN KEY (payrollRunEmployeeId) REFERENCES payroll_run_employees(id) ON DELETE CASCADE
);

-- 9. Workflow Approvals Trail
CREATE TABLE IF NOT EXISTS payroll_approvals (
  id TEXT PRIMARY KEY,
  payrollRunId TEXT NOT NULL,
  actorId TEXT NOT NULL,
  actorRole TEXT NOT NULL,
  action TEXT NOT NULL, -- SUBMIT, APPROVE, REJECT, LOCK, FINALIZE, ROLLBACK, REVERSE
  previousStatus TEXT NOT NULL,
  newStatus TEXT NOT NULL,
  reason TEXT,
  timestamp TEXT NOT NULL,
  FOREIGN KEY (payrollRunId) REFERENCES payroll_runs(id) ON DELETE CASCADE
);

-- 10. Payroll Reversals & Adjustments
CREATE TABLE IF NOT EXISTS payroll_reversals (
  id TEXT PRIMARY KEY,
  originalPayrollRunId TEXT NOT NULL,
  replacementPayrollRunId TEXT,
  reversedBy TEXT NOT NULL,
  reversalDate TEXT NOT NULL,
  reversalReason TEXT NOT NULL,
  totalReversedAmount REAL NOT NULL,
  status TEXT DEFAULT 'COMPLETED',
  FOREIGN KEY (originalPayrollRunId) REFERENCES payroll_runs(id)
);

-- 11. Employee Tax Profile & Tax Declarations
CREATE TABLE IF NOT EXISTS employee_tax_profiles (
  id TEXT PRIMARY KEY,
  employeeId TEXT NOT NULL,
  financialYear TEXT NOT NULL DEFAULT '2024-25',
  regime TEXT NOT NULL DEFAULT 'new', -- 'old' or 'new'
  declarationStatus TEXT DEFAULT 'SUBMITTED', -- DRAFT, SUBMITTED, VERIFIED, REJECTED
  previousEmployerIncome REAL DEFAULT 0,
  previousEmployerTds REAL DEFAULT 0,
  otherIncome REAL DEFAULT 0,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE,
  UNIQUE(employeeId, financialYear)
);

CREATE TABLE IF NOT EXISTS tax_declarations (
  id TEXT PRIMARY KEY,
  employeeId TEXT NOT NULL,
  financialYear TEXT NOT NULL DEFAULT '2024-25',
  sectionCode TEXT NOT NULL, -- e.g. 80C, 80D, 24B, HRA, NPS
  componentName TEXT NOT NULL,
  declaredAmount REAL NOT NULL DEFAULT 0,
  verifiedAmount REAL DEFAULT 0,
  proofDocumentUrl TEXT,
  status TEXT DEFAULT 'DECLARED', -- DECLARED, VERIFIED, REJECTED
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
);

-- 12. Payroll Year-To-Date (YTD) Aggregations
CREATE TABLE IF NOT EXISTS payroll_ytd (
  id TEXT PRIMARY KEY,
  employeeId TEXT NOT NULL,
  financialYear TEXT NOT NULL,
  ytdGross REAL DEFAULT 0,
  ytdBasic REAL DEFAULT 0,
  ytdHra REAL DEFAULT 0,
  ytdAllowances REAL DEFAULT 0,
  ytdOvertime REAL DEFAULT 0,
  ytdReimbursements REAL DEFAULT 0,
  ytdPf REAL DEFAULT 0,
  ytdEsi REAL DEFAULT 0,
  ytdPt REAL DEFAULT 0,
  ytdTds REAL DEFAULT 0,
  ytdLopDeduction REAL DEFAULT 0,
  ytdOtherDeductions REAL DEFAULT 0,
  ytdNetPay REAL DEFAULT 0,
  ytdTaxableIncome REAL DEFAULT 0,
  lastUpdatedRunId TEXT,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE,
  UNIQUE(employeeId, financialYear)
);

-- 13. Financial Audit Log
CREATE TABLE IF NOT EXISTS payroll_audit_logs (
  id TEXT PRIMARY KEY,
  organizationId TEXT NOT NULL DEFAULT 'org-stackly',
  actorId TEXT NOT NULL,
  actorRole TEXT,
  action TEXT NOT NULL,
  entityType TEXT NOT NULL,
  entityId TEXT NOT NULL,
  previousValues TEXT,
  newValues TEXT,
  ipAddress TEXT,
  timestamp TEXT NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_emp_sal_struct_emp ON employee_salary_structures(employeeId, effectiveFrom DESC);
CREATE INDEX IF NOT EXISTS idx_sal_rev_emp ON salary_revisions(employeeId, effectiveDate DESC);
CREATE INDEX IF NOT EXISTS idx_payroll_runs_period ON payroll_runs(organizationId, month, year);
CREATE INDEX IF NOT EXISTS idx_payroll_run_emp_run ON payroll_run_employees(payrollRunId);
CREATE INDEX IF NOT EXISTS idx_payroll_run_emp_emp ON payroll_run_employees(employeeId);
CREATE INDEX IF NOT EXISTS idx_payroll_line_items_emp ON payroll_line_items(payrollRunEmployeeId);
CREATE INDEX IF NOT EXISTS idx_tax_profiles_emp ON employee_tax_profiles(employeeId, financialYear);
CREATE INDEX IF NOT EXISTS idx_payroll_ytd_emp ON payroll_ytd(employeeId, financialYear);
CREATE INDEX IF NOT EXISTS idx_payroll_audit_entity ON payroll_audit_logs(entityId, entityType);
CREATE TABLE IF NOT EXISTS designations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE,
  description TEXT,
  organizationId TEXT DEFAULT 'org-stackly',
  companyId TEXT DEFAULT 'org-stackly',
  createdAt TEXT,
  updatedAt TEXT
);
ALTER TABLE employees ADD COLUMN managerId TEXT;
ALTER TABLE employees ADD COLUMN departmentId TEXT;
ALTER TABLE employees ADD COLUMN teamId TEXT;
ALTER TABLE employees ADD COLUMN locationId TEXT;
ALTER TABLE employees ADD COLUMN designationId TEXT;
-- Migration 023: Complete Master HRMS Domain Architecture

PRAGMA foreign_keys = ON;

-- 1. Employee Documents metadata table
CREATE TABLE IF NOT EXISTS employee_documents (
  id TEXT PRIMARY KEY,
  employeeId TEXT NOT NULL,
  organizationId TEXT NOT NULL DEFAULT 'org-stackly',
  documentType TEXT NOT NULL, -- AADHAAR, PAN, PASSPORT, OFFER_LETTER, APPOINTMENT_LETTER, AGREEMENT, DEGREE, EXPERIENCE, BANK_DOC, TAX_DOC
  documentName TEXT NOT NULL,
  fileUrl TEXT NOT NULL,
  fileSize INTEGER,
  mimeType TEXT,
  documentNumber TEXT,
  issuedDate TEXT,
  expiryDate TEXT,
  verificationStatus TEXT DEFAULT 'PENDING', -- PENDING, VERIFIED, REJECTED
  uploadedBy TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
);

-- 2. Shift Rosters & Shift Swap Management
CREATE TABLE IF NOT EXISTS roster_assignments (
  id TEXT PRIMARY KEY,
  employeeId TEXT NOT NULL,
  organizationId TEXT NOT NULL DEFAULT 'org-stackly',
  shiftId TEXT NOT NULL,
  date TEXT NOT NULL,
  isOffDay INTEGER DEFAULT 0,
  isHoliday INTEGER DEFAULT 0,
  swapStatus TEXT DEFAULT 'NONE', -- NONE, REQUESTED, APPROVED, REJECTED
  swappedWithEmployeeId TEXT,
  assignedBy TEXT,
  createdAt TEXT NOT NULL,
  FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE,
  UNIQUE(employeeId, date)
);

-- 3. Leave Accruals Ledger
CREATE TABLE IF NOT EXISTS leave_accruals (
  id TEXT PRIMARY KEY,
  employeeId TEXT NOT NULL,
  organizationId TEXT NOT NULL DEFAULT 'org-stackly',
  leaveTypeId TEXT NOT NULL,
  accrualPeriod TEXT NOT NULL, -- e.g. 2026-08
  openingBalance REAL NOT NULL DEFAULT 0,
  accruedAmount REAL NOT NULL DEFAULT 0,
  usedAmount REAL NOT NULL DEFAULT 0,
  carryForwardAmount REAL NOT NULL DEFAULT 0,
  encashedAmount REAL NOT NULL DEFAULT 0,
  closingBalance REAL NOT NULL DEFAULT 0,
  createdTimestamp TEXT NOT NULL,
  FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
);

-- 4. Reusable Workflow Engine Engine Tables
CREATE TABLE IF NOT EXISTS workflows (
  id TEXT PRIMARY KEY,
  organizationId TEXT NOT NULL DEFAULT 'org-stackly',
  module TEXT NOT NULL, -- LEAVE, ATTENDANCE_CORRECTION, OVERTIME, EXPENSE, SALARY_REVISION, OFFBOARDING, SHIFT_SWAP
  name TEXT NOT NULL,
  description TEXT,
  isActive INTEGER DEFAULT 1,
  minThreshold REAL DEFAULT 0,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS workflow_steps (
  id TEXT PRIMARY KEY,
  workflowId TEXT NOT NULL,
  stepOrder INTEGER NOT NULL,
  approverRole TEXT NOT NULL, -- MANAGER, TEAM_LEAD, DEPT_HEAD, HR, ADMIN, SPECIFIC_USER
  approverUserId TEXT,
  slaHours INTEGER DEFAULT 48,
  autoApproveOnSlaExceeded INTEGER DEFAULT 0,
  escalateToRole TEXT,
  FOREIGN KEY (workflowId) REFERENCES workflows(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS workflow_requests (
  id TEXT PRIMARY KEY,
  workflowId TEXT NOT NULL,
  entityType TEXT NOT NULL, -- leave_requests, attendance_corrections, expense_claims, salary_revisions, etc.
  entityId TEXT NOT NULL,
  requesterId TEXT NOT NULL,
  organizationId TEXT NOT NULL DEFAULT 'org-stackly',
  currentStepOrder INTEGER DEFAULT 1,
  status TEXT DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED, ESCALATED, DELEGATED, CANCELLED
  submittedAt TEXT NOT NULL,
  completedAt TEXT,
  FOREIGN KEY (workflowId) REFERENCES workflows(id)
);

-- 5. Asset Management Master & Inventory
CREATE TABLE IF NOT EXISTS assets (
  id TEXT PRIMARY KEY,
  organizationId TEXT NOT NULL DEFAULT 'org-stackly',
  assetCode TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- LAPTOP, MONITOR, PHONE, ACCESS_CARD, LICENSE, OTHER
  model TEXT,
  serialNumber TEXT,
  purchaseDate TEXT,
  purchaseCost REAL,
  status TEXT DEFAULT 'AVAILABLE', -- AVAILABLE, ASSIGNED, UNDER_REPAIR, RETIRED, LOST
  locationId TEXT,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS asset_assignments (
  id TEXT PRIMARY KEY,
  assetId TEXT NOT NULL,
  employeeId TEXT NOT NULL,
  assignedDate TEXT NOT NULL,
  returnDueDate TEXT,
  actualReturnDate TEXT,
  conditionOnAssign TEXT DEFAULT 'GOOD',
  conditionOnReturn TEXT,
  status TEXT DEFAULT 'ACTIVE', -- ACTIVE, RETURNED, DAMAGED, LOST
  assignedBy TEXT NOT NULL,
  FOREIGN KEY (assetId) REFERENCES assets(id) ON DELETE CASCADE,
  FOREIGN KEY (employeeId) REFERENCES employees(id)
);

-- 6. Full & Final Settlement Statements
CREATE TABLE IF NOT EXISTS full_and_final_settlements (
  id TEXT PRIMARY KEY,
  employeeId TEXT NOT NULL,
  organizationId TEXT NOT NULL DEFAULT 'org-stackly',
  exitDate TEXT NOT NULL,
  resignationDate TEXT,
  noticePeriodDays INTEGER DEFAULT 30,
  noticeServedDays INTEGER DEFAULT 30,
  unpaidSalaryAmount REAL DEFAULT 0,
  lopDeductionAmount REAL DEFAULT 0,
  leaveEncashmentDays REAL DEFAULT 0,
  leaveEncashmentAmount REAL DEFAULT 0,
  reimbursementAmount REAL DEFAULT 0,
  noticeShortfallDeduction REAL DEFAULT 0,
  gratuityAmount REAL DEFAULT 0,
  otherDeductions REAL DEFAULT 0,
  netSettlementAmount REAL NOT NULL,
  status TEXT DEFAULT 'DRAFT', -- DRAFT, PENDING_CLEARANCE, APPROVED, DISBURSED
  preparedBy TEXT NOT NULL,
  approvedBy TEXT,
  createdAt TEXT NOT NULL,
  FOREIGN KEY (employeeId) REFERENCES employees(id)
);

-- 7. Location & Department Calendars
CREATE TABLE IF NOT EXISTS system_calendars (
  id TEXT PRIMARY KEY,
  organizationId TEXT NOT NULL DEFAULT 'org-stackly',
  locationId TEXT,
  departmentId TEXT,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  type TEXT NOT NULL, -- HOLIDAY, OPTIONAL_HOLIDAY, COMPANY_SHUTDOWN, HALF_DAY
  description TEXT,
  isPaid INTEGER DEFAULT 1,
  createdAt TEXT NOT NULL
);

-- Indexes for HRMS domain performance
CREATE INDEX IF NOT EXISTS idx_emp_docs_emp ON employee_documents(employeeId);
CREATE INDEX IF NOT EXISTS idx_roster_emp_date ON roster_assignments(employeeId, date);
CREATE INDEX IF NOT EXISTS idx_leave_accrual_emp ON leave_accruals(employeeId, leaveTypeId);
CREATE INDEX IF NOT EXISTS idx_workflow_req_entity ON workflow_requests(entityId, entityType);
CREATE INDEX IF NOT EXISTS idx_assets_org_status ON assets(organizationId, status);
CREATE INDEX IF NOT EXISTS idx_asset_assign_emp ON asset_assignments(employeeId, status);
CREATE INDEX IF NOT EXISTS idx_fnf_emp ON full_and_final_settlements(employeeId);
CREATE INDEX IF NOT EXISTS idx_sys_cal_date ON system_calendars(date, locationId);
-- 024_create_holidays.sql

CREATE TABLE holidays (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    date TEXT NOT NULL,
    type TEXT CHECK(type IN ('NATIONAL', 'REGIONAL', 'COMPANY')) NOT NULL DEFAULT 'NATIONAL',
    location_id TEXT REFERENCES locations(id) ON DELETE CASCADE, -- NULL means it applies globally
    department_id TEXT REFERENCES departments(id) ON DELETE CASCADE, -- NULL means it applies to all departments
    description TEXT,
    companyId TEXT DEFAULT 'org-stackly',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_holidays_date ON holidays(date);
CREATE INDEX idx_holidays_location ON holidays(location_id);
-- 025_create_work_configs.sql

CREATE TABLE work_configs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL, -- e.g., "Standard 5-Day Week", "6-Day Support Shift"
    location_id TEXT REFERENCES locations(id) ON DELETE CASCADE,
    department_id TEXT REFERENCES departments(id) ON DELETE CASCADE,
    
    -- Store days of the week that are considered working days (0=Sun, 1=Mon, etc.)
    -- e.g., JSON array '[1, 2, 3, 4, 5]' for Mon-Fri
    working_days TEXT NOT NULL DEFAULT '[1, 2, 3, 4, 5]',
    
    -- Default hours expected per day
    standard_hours_per_day REAL NOT NULL DEFAULT 8.0,
    
    -- Can have multiple configs, but maybe one is default
    is_default INTEGER NOT NULL DEFAULT 0,

    companyId TEXT DEFAULT 'org-stackly',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_work_configs_location ON work_configs(location_id);
CREATE INDEX idx_work_configs_department ON work_configs(department_id);
-- 026_create_shifts.sql

CREATE TABLE shifts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL, -- e.g., "Morning Shift", "Night Shift"
    
    -- Format: HH:MM:SS
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    
    -- In minutes
    break_duration INTEGER NOT NULL DEFAULT 60,
    
    -- Is this a night shift crossing midnight?
    is_overnight INTEGER NOT NULL DEFAULT 0,
    
    color_code TEXT, -- for UI display, e.g. '#10b981'

    location_id TEXT REFERENCES locations(id) ON DELETE CASCADE,
    department_id TEXT REFERENCES departments(id) ON DELETE CASCADE,

    companyId TEXT DEFAULT 'org-stackly',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_shifts_location ON shifts(location_id);
CREATE INDEX idx_shifts_department ON shifts(department_id);
-- 027_create_employee_shifts.sql

CREATE TABLE employee_shifts (
    id TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    shift_id TEXT NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
    
    -- Date range for when this shift is assigned to the employee
    start_date TEXT NOT NULL, -- YYYY-MM-DD
    end_date TEXT, -- YYYY-MM-DD (NULL if indefinite/ongoing)
    
    companyId TEXT DEFAULT 'org-stackly',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_emp_shifts_employee ON employee_shifts(employee_id);
CREATE INDEX idx_emp_shifts_shift ON employee_shifts(shift_id);
CREATE INDEX idx_emp_shifts_dates ON employee_shifts(start_date, end_date);
CREATE TABLE IF NOT EXISTS leave_types (
  id TEXT PRIMARY KEY,
  companyId TEXT,
  name TEXT NOT NULL,
  code TEXT,
  description TEXT,
  isPaid INTEGER DEFAULT 1,
  defaultDays INTEGER DEFAULT 0,
  carryForwardLimit INTEGER DEFAULT 0,
  status TEXT DEFAULT 'ACTIVE',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS leave_balances (
  id TEXT PRIMARY KEY,
  companyId TEXT,
  employeeId TEXT NOT NULL,
  leaveTypeId TEXT NOT NULL,
  totalDays REAL DEFAULT 0,
  usedDays REAL DEFAULT 0,
  pendingDays REAL DEFAULT 0,
  year INTEGER NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (leaveTypeId) REFERENCES leave_types(id) ON DELETE CASCADE,
  FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
);
ALTER TABLE leaverequests ADD COLUMN companyId TEXT;
CREATE TABLE IF NOT EXISTS regularization_requests (
  id TEXT PRIMARY KEY,
  companyId TEXT NOT NULL,
  employeeId TEXT NOT NULL,
  attendanceRecordId TEXT,
  date TEXT NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'PENDING',
  managerId TEXT,
  managerComments TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
);
ALTER TABLE attendancerecords ADD COLUMN late_by INTEGER DEFAULT 0;
ALTER TABLE attendancerecords ADD COLUMN early_by INTEGER DEFAULT 0;
ALTER TABLE attendancerecords ADD COLUMN overtime INTEGER DEFAULT 0;
ALTER TABLE attendancerecords ADD COLUMN work_hours REAL DEFAULT 0;
ALTER TABLE attendancerecords ADD COLUMN break_hours REAL DEFAULT 0;
CREATE TABLE IF NOT EXISTS salary_structures (
  id TEXT PRIMARY KEY,
  companyId TEXT NOT NULL,
  employeeId TEXT NOT NULL,
  baseSalary REAL NOT NULL,
  allowances TEXT, -- JSON string of allowances
  deductions TEXT, -- JSON string of deductions
  effectiveDate TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payroll_records (
  id TEXT PRIMARY KEY,
  companyId TEXT NOT NULL,
  month TEXT NOT NULL, -- e.g., '2026-09'
  status TEXT DEFAULT 'DRAFT', -- DRAFT, APPROVED, PROCESSED
  totalGross REAL,
  totalDeductions REAL,
  totalNet REAL,
  processedDate TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payslips (
  id TEXT PRIMARY KEY,
  companyId TEXT NOT NULL,
  payrollRecordId TEXT NOT NULL,
  employeeId TEXT NOT NULL,
  baseSalary REAL,
  allowances TEXT,
  deductions TEXT,
  grossPay REAL,
  netPay REAL,
  overtimePay REAL DEFAULT 0,
  leaveDeductions REAL DEFAULT 0,
  pdfUrl TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (payrollRecordId) REFERENCES payroll_records(id) ON DELETE CASCADE,
  FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
);
-- 034_create_notification_preferences.sql
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
-- 035_add_notification_delivery_status.sql
ALTER TABLE notifications ADD COLUMN emailDeliveryStatus TEXT DEFAULT 'NONE';
ALTER TABLE notifications ADD COLUMN emailError TEXT;

```

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

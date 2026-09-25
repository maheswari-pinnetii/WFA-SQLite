-- Sprint 2: Placement, Training, Assessment, and Certification Tables
-- Migration: 040_create_sprint2_analytics_tables.sql

-- 1. Placements
CREATE TABLE IF NOT EXISTS placements (
  id              TEXT PRIMARY KEY,
  employeeId      TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  organizationId  TEXT NOT NULL,
  companyId       TEXT,
  candidateName   TEXT,
  department      TEXT,
  role            TEXT,
  skill           TEXT,
  employer        TEXT,
  location        TEXT,
  salary          REAL,
  placementDate   TEXT,
  status          TEXT NOT NULL DEFAULT 'PLACED' CHECK(status IN ('PLACED','PENDING','REJECTED','WITHDRAWN')),
  placementTimeDays INTEGER,
  source          TEXT,
  notes           TEXT,
  createdAt       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updatedAt       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_placements_org    ON placements(organizationId);
CREATE INDEX IF NOT EXISTS idx_placements_emp    ON placements(employeeId);
CREATE INDEX IF NOT EXISTS idx_placements_dept   ON placements(department);
CREATE INDEX IF NOT EXISTS idx_placements_status ON placements(status);

-- 2. Training Enrollments
CREATE TABLE IF NOT EXISTS training_enrollments (
  id              TEXT PRIMARY KEY,
  employeeId      TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  organizationId  TEXT NOT NULL,
  companyId       TEXT,
  courseName      TEXT NOT NULL,
  courseCategory  TEXT,
  department      TEXT,
  role            TEXT,
  skillName       TEXT,
  enrolledDate    TEXT,
  completedDate   TEXT,
  dueDate         TEXT,
  status          TEXT NOT NULL DEFAULT 'ENROLLED' CHECK(status IN ('ENROLLED','IN_PROGRESS','COMPLETED','DROPPED','FAILED')),
  completionPct   REAL DEFAULT 0,
  trainingHours   REAL DEFAULT 0,
  score           REAL,
  passingScore    REAL DEFAULT 70,
  provider        TEXT,
  isMandatory     INTEGER DEFAULT 0,
  createdAt       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updatedAt       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_training_org    ON training_enrollments(organizationId);
CREATE INDEX IF NOT EXISTS idx_training_emp    ON training_enrollments(employeeId);
CREATE INDEX IF NOT EXISTS idx_training_status ON training_enrollments(status);
CREATE INDEX IF NOT EXISTS idx_training_skill  ON training_enrollments(skillName);

-- 3. Assessments
CREATE TABLE IF NOT EXISTS assessments (
  id              TEXT PRIMARY KEY,
  employeeId      TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  organizationId  TEXT NOT NULL,
  companyId       TEXT,
  enrollmentId    TEXT REFERENCES training_enrollments(id) ON DELETE SET NULL,
  assessmentName  TEXT NOT NULL,
  skillName       TEXT,
  department      TEXT,
  score           REAL NOT NULL,
  maxScore        REAL NOT NULL DEFAULT 100,
  passingScore    REAL DEFAULT 70,
  assessmentDate  TEXT,
  assessmentType  TEXT DEFAULT 'QUIZ' CHECK(assessmentType IN ('QUIZ','EXAM','PRACTICAL','SIMULATION','PEER_REVIEW')),
  createdAt       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updatedAt       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_assessments_org  ON assessments(organizationId);
CREATE INDEX IF NOT EXISTS idx_assessments_emp  ON assessments(employeeId);

-- 4. Certifications
CREATE TABLE IF NOT EXISTS certifications (
  id                TEXT PRIMARY KEY,
  employeeId        TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  organizationId    TEXT NOT NULL,
  companyId         TEXT,
  certificationName TEXT NOT NULL,
  issuingBody       TEXT,
  skillName         TEXT,
  department        TEXT,
  issuedDate        TEXT,
  expiryDate        TEXT,
  status            TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE','EXPIRED','PENDING','REVOKED')),
  credentialId      TEXT,
  verificationUrl   TEXT,
  createdAt         TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updatedAt         TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_certs_org    ON certifications(organizationId);
CREATE INDEX IF NOT EXISTS idx_certs_emp    ON certifications(employeeId);
CREATE INDEX IF NOT EXISTS idx_certs_expiry ON certifications(expiryDate);

-- 5. Workforce Planning Scenarios
CREATE TABLE IF NOT EXISTS workforce_scenarios (
  id              TEXT PRIMARY KEY,
  organizationId  TEXT NOT NULL,
  companyId       TEXT,
  scenarioName    TEXT NOT NULL,
  scenarioType    TEXT NOT NULL CHECK(scenarioType IN ('BUSINESS_GROWTH','HIGH_ATTRITION','DEPT_EXPANSION','NEW_PROJECT','HIRING_FREEZE','SKILL_SHORTAGE','BUDGET_REDUCTION')),
  parameters      TEXT,
  results         TEXT,
  createdBy       TEXT,
  status          TEXT DEFAULT 'DRAFT' CHECK(status IN ('DRAFT','ACTIVE','ARCHIVED')),
  createdAt       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updatedAt       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_scenarios_org  ON workforce_scenarios(organizationId);
CREATE INDEX IF NOT EXISTS idx_scenarios_type ON workforce_scenarios(scenarioType);

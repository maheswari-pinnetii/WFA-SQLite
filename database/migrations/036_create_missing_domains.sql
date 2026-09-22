-- Migration 036: Missing Domains (Appraisals, Cost Centers, Applications, System Jobs)

-- 1. Cost Centers
CREATE TABLE IF NOT EXISTS cost_centers (
  id TEXT PRIMARY KEY,
  organizationId TEXT NOT NULL DEFAULT 'org-stackly',
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  budget REAL DEFAULT 0,
  managerId TEXT,
  status TEXT DEFAULT 'ACTIVE',
  createdAt TEXT NOT NULL
);

-- 2. Appraisals
CREATE TABLE IF NOT EXISTS appraisal_cycles (
  id TEXT PRIMARY KEY,
  organizationId TEXT NOT NULL DEFAULT 'org-stackly',
  name TEXT NOT NULL,
  startDate TEXT NOT NULL,
  endDate TEXT NOT NULL,
  status TEXT DEFAULT 'PLANNED', -- PLANNED, ACTIVE, COMPLETED
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS appraisal_reviews (
  id TEXT PRIMARY KEY,
  cycleId TEXT NOT NULL,
  employeeId TEXT NOT NULL,
  managerId TEXT NOT NULL,
  selfRating REAL,
  managerRating REAL,
  finalRating REAL,
  feedback TEXT,
  status TEXT DEFAULT 'DRAFT', -- DRAFT, SUBMITTED, REVIEWED, ACKNOWLEDGED
  createdAt TEXT NOT NULL,
  FOREIGN KEY (cycleId) REFERENCES appraisal_cycles(id) ON DELETE CASCADE,
  FOREIGN KEY (employeeId) REFERENCES employees(id),
  FOREIGN KEY (managerId) REFERENCES employees(id)
);

-- 3. Job Applications
CREATE TABLE IF NOT EXISTS job_applications (
  id TEXT PRIMARY KEY,
  organizationId TEXT NOT NULL DEFAULT 'org-stackly',
  applicantName TEXT NOT NULL,
  applicantEmail TEXT NOT NULL,
  positionId TEXT, -- Could link to a jobs table if it exists
  status TEXT DEFAULT 'NEW', -- NEW, INTERVIEWING, OFFERED, HIRED, REJECTED
  resumeUrl TEXT,
  appliedAt TEXT NOT NULL,
  createdAt TEXT NOT NULL
);

-- 4. Bulk Imports
CREATE TABLE IF NOT EXISTS bulk_imports (
  id TEXT PRIMARY KEY,
  organizationId TEXT NOT NULL DEFAULT 'org-stackly',
  entityType TEXT NOT NULL, -- EMPLOYEES, ATTENDANCE, etc.
  fileName TEXT NOT NULL,
  totalRecords INTEGER DEFAULT 0,
  successfulRecords INTEGER DEFAULT 0,
  failedRecords INTEGER DEFAULT 0,
  status TEXT DEFAULT 'PENDING', -- PENDING, PROCESSING, COMPLETED, FAILED
  uploadedBy TEXT NOT NULL,
  createdAt TEXT NOT NULL
);

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

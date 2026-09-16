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

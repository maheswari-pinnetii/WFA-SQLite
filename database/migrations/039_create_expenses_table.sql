-- 039_create_expenses_table.sql

CREATE TABLE IF NOT EXISTS expense_claims (
    id TEXT PRIMARY KEY,
    employeeId TEXT NOT NULL,
    category TEXT NOT NULL,
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'INR',
    claimDate TEXT NOT NULL,
    description TEXT NOT NULL,
    receiptUrl TEXT,
    status TEXT DEFAULT 'PENDING',
    approvalRequestId TEXT,
    payrollRunId TEXT,
    createdAt TEXT NOT NULL,
    submittedAt TEXT,
    updatedAt TEXT,
    FOREIGN KEY (employeeId) REFERENCES users(id),
    FOREIGN KEY (payrollRunId) REFERENCES payroll_runs(id)
);

CREATE INDEX IF NOT EXISTS idx_expense_claims_employeeId ON expense_claims(employeeId);
CREATE INDEX IF NOT EXISTS idx_expense_claims_status ON expense_claims(status);

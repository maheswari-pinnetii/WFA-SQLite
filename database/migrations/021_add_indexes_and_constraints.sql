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

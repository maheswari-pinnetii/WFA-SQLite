-- 038_create_shift_assignments.sql

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

CREATE INDEX IF NOT EXISTS idx_shift_assign_emp ON shift_assignments(employeeId);
CREATE INDEX IF NOT EXISTS idx_shift_assign_date ON shift_assignments(startDate);

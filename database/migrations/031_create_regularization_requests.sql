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

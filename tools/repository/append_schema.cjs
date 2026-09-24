const fs = require('fs');
const sql = `
CREATE TABLE IF NOT EXISTS attendance_events (
  id TEXT PRIMARY KEY,
  organizationId TEXT NOT NULL DEFAULT 'org-stackly',
  employeeId TEXT NOT NULL,
  eventType TEXT NOT NULL,
  eventTimestamp TEXT NOT NULL,
  latitude REAL,
  longitude REAL,
  accuracy REAL,
  ipAddress TEXT,
  deviceId TEXT,
  shiftId TEXT,
  isLate INTEGER DEFAULT 0,
  isEarlyCheckout INTEGER DEFAULT 0,
  source TEXT DEFAULT 'web',
  notes TEXT,
  createdAt TEXT NOT NULL,
  FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
);
`;
fs.appendFileSync('backend/database/schema.sql', sql);

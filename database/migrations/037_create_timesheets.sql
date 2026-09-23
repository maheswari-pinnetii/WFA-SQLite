-- Migration 037: Timesheets, Projects, and Tasks

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  organizationId TEXT NOT NULL DEFAULT 'org-stackly',
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'ACTIVE',
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS timesheets (
  id TEXT PRIMARY KEY,
  employeeId TEXT NOT NULL,
  organizationId TEXT NOT NULL DEFAULT 'org-stackly',
  startDate TEXT NOT NULL,
  endDate TEXT NOT NULL,
  status TEXT DEFAULT 'DRAFT', -- DRAFT, PENDING, APPROVED, REJECTED
  totalHours REAL DEFAULT 0,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (employeeId) REFERENCES employees(id)
);

CREATE TABLE IF NOT EXISTS timesheet_entries (
  id TEXT PRIMARY KEY,
  timesheetId TEXT NOT NULL,
  projectId TEXT NOT NULL,
  taskId TEXT,
  date TEXT NOT NULL,
  hours REAL NOT NULL DEFAULT 0,
  description TEXT,
  FOREIGN KEY (timesheetId) REFERENCES timesheets(id) ON DELETE CASCADE,
  FOREIGN KEY (projectId) REFERENCES projects(id)
);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  projectId TEXT,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'TODO',
  assigneeId TEXT,
  assigneeName TEXT,
  points INTEGER DEFAULT 0,
  FOREIGN KEY (projectId) REFERENCES projects(id),
  FOREIGN KEY (assigneeId) REFERENCES employees(id)
);

CREATE INDEX IF NOT EXISTS idx_timesheets_employee ON timesheets(employeeId);
CREATE INDEX IF NOT EXISTS idx_timesheet_entries_tsid ON timesheet_entries(timesheetId);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(projectId);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assigneeId);

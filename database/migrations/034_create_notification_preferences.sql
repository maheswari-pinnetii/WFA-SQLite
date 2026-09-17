-- 034_create_notification_preferences.sql
CREATE TABLE IF NOT EXISTS user_notification_preferences (
  id TEXT PRIMARY KEY,
  userId TEXT UNIQUE NOT NULL,
  inAppEnabled INTEGER DEFAULT 1,
  emailEnabled INTEGER DEFAULT 1,
  notifyOnLeave INTEGER DEFAULT 1,
  notifyOnApproval INTEGER DEFAULT 1,
  notifyOnPayroll INTEGER DEFAULT 1,
  notifyOnAttendance INTEGER DEFAULT 1,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

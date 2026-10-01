const fs = require('fs');

let schema = fs.readFileSync('backend/database/schema.sql', 'utf8');

const tableDef = `
CREATE TABLE IF NOT EXISTS failed_logins (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  attempts INTEGER DEFAULT 0,
  lockedUntil TEXT,
  lockedAt TEXT,
  lockReason TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
);
`;

if (!schema.includes('failed_logins')) {
  fs.writeFileSync('backend/database/schema.sql', schema + '\n' + tableDef, 'utf8');
  console.log('Added failed_logins table to schema.sql');
} else {
  console.log('failed_logins table already in schema.sql');
}

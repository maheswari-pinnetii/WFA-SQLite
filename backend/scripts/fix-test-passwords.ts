import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, '../../database/sqlite/wfa.sqlite');

const db = new Database(dbPath);

const password = 'StacklyWFA2026!';
const hash = bcrypt.hashSync(password, 10);

console.log('Generated hash:', hash);
console.log('Verify:', bcrypt.compareSync(password, hash));

const testUsers = [
  'admin@thestackly.com',
  'hr@thestackly.com',
  'manager@thestackly.com',
  'employee@thestackly.com',
  'executive@thestackly.com',
  'teamlead@thestackly.com',
  'lead@thestackly.com',
];

const stmt = db.prepare('UPDATE users SET password_hash = ? WHERE email = ?');
for (const email of testUsers) {
  const result = stmt.run(hash, email);
  console.log(`Updated ${email}: ${result.changes} rows`);
}

db.close();
console.log('Done.');

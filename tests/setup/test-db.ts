import fs from 'fs';
import path from 'path';
import { connectDatabase, getDb, execute } from '../../backend/src/database/connection.js';
import { initDb } from '../../backend/src/config/db.js';
import { seedSqlite } from '../../backend/scripts/seed-sqlite.js';

export async function createTestDatabase() {
  const dbPath = process.env.TEST_DB_PATH;
  if (!dbPath) {
    throw new Error('TEST_DB_PATH is not defined. Make sure test-env.ts is loaded.');
  }

  // Ensure fresh database for test run
  try {
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
      console.log(`[Test DB] Removed old database at ${dbPath}`);
    }
    if (fs.existsSync(dbPath + '-wal')) fs.unlinkSync(dbPath + '-wal');
    if (fs.existsSync(dbPath + '-shm')) fs.unlinkSync(dbPath + '-shm');
  } catch (err: any) {
    console.warn(`[Test DB] Warning: could not remove old DB - ${err.message}`);
  }

  // Ensure directory exists
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  // Initialize DB Connection
  await connectDatabase();
  
  try {
    await execute('PRAGMA foreign_keys = ON');
    await execute('PRAGMA journal_mode = WAL');
    await execute('PRAGMA synchronous = NORMAL');
  } catch (err: any) {
    console.warn('[Test DB] PRAGMA queries unsupported or failed:', err.message);
  }
  
  // initDb initializes schema and triggers. We must seed the base schema first!
  await seedTestDatabase();
  await initDb();
}

export async function seedTestDatabase() {
  await seedSqlite();
}

export async function closeTestDatabase() {
  try {
    const db = getDb();
    if (db && typeof db.close === 'function') {
      db.close();
      console.log('[Test DB] Database connection closed.');
    }
  } catch (err: any) {
    console.warn('[Test DB] Could not close database:', err.message);
  }
}

export function getTestDbConnection() {
  return getDb();
}

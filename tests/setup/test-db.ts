import fs from 'fs';
import path from 'path';
import { connectDatabase, getDatabase } from '../../backend/src/database/sqlite-cloud.js';
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
  } catch (err: any) {
    console.warn(`[Test DB] Warning: could not remove old DB - ${err.message}`);
  }

  // Ensure directory exists
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  // Initialize DB Connection
  const db = await connectDatabase();
  
  // Apply PRAGMAs explicitly for testing environment
  db.pragma('foreign_keys = ON');
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = NORMAL');
  
  // initDb initializes schema 
  await initDb();
}

export async function seedTestDatabase() {
  // Use existing seeder
  await seedSqlite();
}

export async function closeTestDatabase() {
  try {
    const db = getDatabase();
    if (db) {
      db.close();
      console.log('[Test DB] Database connection closed.');
    }
  } catch (err: any) {
    console.warn('[Test DB] Could not close database:', err.message);
  }
}

export function getTestDbConnection() {
  return getDatabase();
}

import Database from 'better-sqlite3';

let localDb: Database.Database | null = null;

export const connectDatabase = async (): Promise<any> => {
  if (localDb) return localDb;

  try {
    console.log('[Database] Connecting to local in-memory SQLite database for tests...');
    // Use an in-memory database or a file. Using a file so we can debug if needed, 
    // or in-memory for pure speed. Let's use file-based isolation per worker using vitest's pool id.
    const workerId = process.env.VITEST_POOL_ID || '1';
    const dbPath = process.env.TEST_DB_PATH || `test-${workerId}.sqlite`;
    
    const db = new Database(dbPath);
    
    // Set some performance pragmas
    db.pragma('journal_mode = WAL');
    db.pragma('synchronous = NORMAL');
    db.pragma('foreign_keys = ON');

    console.log(`[Database] Successfully connected to local SQLite (${dbPath}).`);
    localDb = db;
    return localDb;
  } catch (err: any) {
    console.error('[Database] Local SQLite unavailable. Error:', err.message);
    throw new Error(`Failed to connect to local SQLite: ${err.message}`);
  }
};

export const getDatabase = (): any => {
  if (localDb) return localDb;
  throw new Error('Database is not initialized. Please call connectDatabase() first.');
};

export const query = async <T = any>(sql: string, params: any[] = []): Promise<T[]> => {
  if (!localDb) {
    await connectDatabase();
  }
  try {
    const stmt = localDb!.prepare(sql);
    return stmt.all(...params) as T[];
  } catch (err) {
    throw err;
  }
};

export const execute = async (sql: string, params: any[] = []): Promise<any> => {
  if (!localDb) {
    await connectDatabase();
  }
  try {
    const stmt = localDb!.prepare(sql);
    // If it's not a SELECT statement, use run()
    if (sql.trim().toUpperCase().startsWith('SELECT')) {
        return stmt.all(...params);
    }
    const info = stmt.run(...params);
    return {
        changes: info.changes,
        lastInsertRowid: info.lastInsertRowid
    };
  } catch (err) {
    throw err;
  }
};

export const transaction = async <T>(fn: () => Promise<T>): Promise<T> => {
  if (!localDb) {
    await connectDatabase();
  }
  
  // For async functions inside better-sqlite3 transaction, we cannot use db.transaction() 
  // easily if fn() is async because better-sqlite3's transaction requires synchronous execution.
  // Instead, we manually BEGIN and COMMIT/ROLLBACK.
  try {
    localDb!.prepare('BEGIN TRANSACTION').run();
    try {
      const res = await fn();
      localDb!.prepare('COMMIT').run();
      return res;
    } catch (err) {
      localDb!.prepare('ROLLBACK').run();
      throw err;
    }
  } catch (err: any) {
    throw err;
  }
};

export const healthCheck = async (): Promise<boolean> => {
  try {
    if (!localDb) return false;
    const res = localDb.prepare('SELECT 1 as active').get() as any;
    return res && res.active === 1;
  } catch (err) {
    console.error('[Database Health] Health check failed:', err);
    return false;
  }
};

import { Database as SQLiteCloudDatabase } from '@sqlitecloud/drivers';

let cloudDb: SQLiteCloudDatabase | null = null;

export const connectDatabase = async (): Promise<any> => {
  const cloudUrl = process.env.SQLITE_CLOUD_URL || process.env.SQLITE_CLOUD_CONNECTION_STRING || "sqlitecloud://chrk2ahwvk.g2.sqlite.cloud:8860/auth.sqlitecloud?apikey=xenaeusZqMZhUIfNKX9p9qx8TNRR7Y1XisX4APazqdE";
  
  if (cloudUrl) {
    try {
      console.log('[Database] Connecting to SQLite Cloud database...');
      const testDb = new SQLiteCloudDatabase(cloudUrl);
      
      // Run test query immediately to check if server is active
      await testDb.sql('SELECT 1 as active');

      console.log('[Database] Successfully connected to SQLite Cloud.');
      cloudDb = testDb;
      return cloudDb;
    } catch (err: any) {
      console.error('[Database] SQLite Cloud unavailable. Error:', err.message);
      throw new Error(`Failed to connect to SQLite Cloud: ${err.message}`);
    }
  }

  throw new Error("No SQLite Cloud URL provided.");
};

export const getDatabase = (): any => {
  if (cloudDb) return cloudDb;
  throw new Error('Database is not initialized. Please call connectDatabase() first.');
};

export const query = async <T = any>(sql: string, params: any[] = []): Promise<T[]> => {
  if (!cloudDb) {
    await connectDatabase();
  }
  return await cloudDb!.sql(sql, ...params) as T[];
};

export const execute = async (sql: string, params: any[] = []): Promise<any> => {
  if (!cloudDb) {
    await connectDatabase();
  }
  return await cloudDb!.sql(sql, ...params);
};

export const transaction = async <T>(fn: () => Promise<T>): Promise<T> => {
  if (!cloudDb) {
    await connectDatabase();
  }
  try {
    await cloudDb!.sql('BEGIN TRANSACTION');
    try {
      const res = await fn();
      await cloudDb!.sql('COMMIT');
      return res;
    } catch (err) {
      await cloudDb!.sql('ROLLBACK');
      throw err;
    }
  } catch (err: any) {
    throw err;
  }
};

export const healthCheck = async (): Promise<boolean> => {
  try {
    if (!cloudDb) return false;
    const res = await cloudDb.sql('SELECT 1 as active');
    return Array.isArray(res) && res.length > 0 && res[0].active === 1;
  } catch (err) {
    console.error('[Database Health] Health check failed:', err);
    return false;
  }
};

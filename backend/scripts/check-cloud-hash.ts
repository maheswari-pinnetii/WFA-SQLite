import { Database } from '@sqlitecloud/drivers';
import * as dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

async function run() {
  const db = new Database(process.env.SQLITE_CLOUD_URL);
  const manager = await db.sql`SELECT email, password_hash FROM users WHERE email='manager@thestackly.com'`;
  console.log('Manager:', manager);
  const exec = await db.sql`SELECT email, password_hash FROM users WHERE email='executive@thestackly.com'`;
  console.log('Exec:', exec);
  process.exit(0);
}
run();

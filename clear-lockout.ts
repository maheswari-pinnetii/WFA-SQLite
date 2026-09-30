import 'dotenv/config';
import { connectDatabase, execute } from './backend/src/database/sqlite-cloud.js';
async function run() {
  await connectDatabase();
  await execute('DELETE FROM failed_logins');
  console.log('Cleared lockouts in cloud');
  process.exit(0);
}
run();

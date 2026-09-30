import 'dotenv/config';
import { connectDatabase, query } from './backend/src/database/sqlite-cloud.js';
async function run() {
  await connectDatabase();
  const users = await query('SELECT count(*) as cnt FROM users');
  console.log('Total users:', users[0].cnt);
  if(users[0].cnt > 0) {
    const sample = await query('SELECT email FROM users LIMIT 10');
    console.log(sample);
  }
  process.exit(0);
}
run();

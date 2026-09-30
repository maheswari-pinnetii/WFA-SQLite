import 'dotenv/config';
import { connectDatabase, query } from './backend/src/database/sqlite-cloud.js';
import bcrypt from 'bcryptjs';
async function run() {
  await connectDatabase();
  const users = await query('SELECT email, password_hash FROM users WHERE email = ?', ['admin@thestackly.com']);
  if(users.length > 0) {
    console.log(users[0]);
    console.log('Matches:', bcrypt.compareSync('StacklyWFA2026!', users[0].password_hash));
  } else {
    console.log('User not found');
  }
  process.exit(0);
}
run();

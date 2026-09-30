import 'dotenv/config';
import { connectDatabase, execute } from './backend/src/database/sqlite-cloud.js'; 

async function run() { 
  await connectDatabase(); 
  const hash = '$2b$10$bV6Bn0GPPdTcaqC0X8AWkuLm/ZwNDpZZzxcxifKgTd8fdBAAhZ9Mu'; 
  const testUsers = ['admin@thestackly.com', 'hr@thestackly.com', 'manager@thestackly.com', 'employee@thestackly.com', 'executive@thestackly.com', 'teamlead@thestackly.com', 'lead@thestackly.com']; 
  for (const email of testUsers) { 
    await execute('UPDATE users SET password_hash = ? WHERE email = ?', [hash, email]); 
    console.log('Updated', email); 
  } 
  process.exit(0); 
} 

run();

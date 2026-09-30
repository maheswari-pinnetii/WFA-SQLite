import { Database } from '@sqlitecloud/drivers';
import bcrypt from 'bcryptjs';

async function updatePasswords() {
  const db = new Database('sqlitecloud://chrk2ahwvk.g2.sqlite.cloud:8860/auth.sqlitecloud?apikey=xenaeusZqMZhUIfNKX9p9qx8TNRR7Y1XisX4APazqdE');
  
  const salt = bcrypt.genSaltSync(12);
  const hash = bcrypt.hashSync('password123', salt);
  
  await db.sql`UPDATE users SET password_hash = ${hash}`;
  await db.sql`DELETE FROM failed_logins`;
  
  console.log('Updated all passwords to password123 and unlocked accounts.');
  process.exit(0);
}
updatePasswords().catch(console.error);

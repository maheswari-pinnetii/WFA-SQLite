const { Database } = require('@sqlitecloud/drivers');
async function run() {
  const db = new Database('sqlitecloud://chrk2ahwvk.g2.sqlite.cloud:8860/auth.sqlitecloud?apikey=xenaeusZqMZhUIfNKX9p9qx8TNRR7Y1XisX4APazqdE');
  await db.sql`UPDATE users SET password_hash = '$2b$10$ituTyJQOgwUKooHzti31SuoqACEVw7HUecOZHVBRH8dkAlei9z3yO'`;
  console.log('done');
  process.exit(0);
}
run();

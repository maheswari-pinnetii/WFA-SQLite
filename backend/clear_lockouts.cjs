const { Database } = require('@sqlitecloud/drivers');
async function run() {
  const db = new Database('sqlitecloud://chrk2ahwvk.g2.sqlite.cloud:8860/auth.sqlitecloud?apikey=xenaeusZqMZhUIfNKX9p9qx8TNRR7Y1XisX4APazqdE');
  await db.sql`DELETE FROM failed_logins`;
  console.log('Cleared lockouts');
  process.exit(0);
}
run();

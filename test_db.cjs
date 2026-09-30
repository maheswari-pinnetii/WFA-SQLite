const { Database } = require('@sqlitecloud/drivers');
const db = new Database("sqlitecloud://chrk2ahwvk.g2.sqlite.cloud:8860/auth.sqlitecloud?apikey=xenaeusZqMZhUIfNKX9p9qx8TNRR7Y1XisX4APazqdE");
async function test() {
  try {
    const res = await db.sql`SELECT 1 as active;`;
    console.log("Template:", res);
    const res2 = await db.all("SELECT ? as active", [2]);
    console.log("All:", res2);
  } catch(e) { console.error(e); }
}
test();

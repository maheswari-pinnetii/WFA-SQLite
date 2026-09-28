import { Database } from '@sqlitecloud/drivers';
const db = new Database('sqlitecloud://chrk2ahwvk.g2.sqlite.cloud:8860/auth.sqlitecloud?apikey=xenaeusZqMZhUIfNKX9p9qx8TNRR7Y1XisX4APazqdE');
db.sql`SELECT * FROM sqlite_master;`.then(console.log).catch(console.error);

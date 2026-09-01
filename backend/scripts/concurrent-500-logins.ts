import 'dotenv/config';
import axios from 'axios';
import http from 'http';
import { Database } from '@sqlitecloud/drivers';

const cloudUrl = process.env.SQLITE_CLOUD_URL || 'sqlitecloud://chrk2ahwvk.g2.sqlite.cloud:8860/auth.sqlitecloud?apikey=xenaeusZqMZhUIfNKX9p9qx8TNRR7Y1XisX4APazqdE';

// Configure high-performance Keep-Alive agent for Windows TCP socket reuse
const httpAgent = new http.Agent({
  keepAlive: true,
  maxSockets: 50,
  maxFreeSockets: 20,
  timeout: 30000
});

const apiClient = axios.create({
  httpAgent,
  timeout: 30000
});

async function testSimultaneous500Logins() {
  console.log('====================================================');
  console.log('🚀 SIMULTANEOUS 500 EMPLOYEE CLOUD LOGIN LOAD TEST');
  console.log('====================================================');

  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  console.log('[SQLite Cloud] Connecting directly to remote cloud cluster...');
  const cloudDb = new Database(cloudUrl);
  
  const users = await cloudDb.sql`
    SELECT id, email, name, role FROM users 
    WHERE role = 'EMPLOYEE' 
    LIMIT 500
  ` as { id: string; email: string; name: string; role: string }[];

  console.log(`[SQLite Cloud] Retrieved ${users.length} employee accounts from Cloud database.`);
  console.log(`Starting concurrent login requests for all ${users.length} employees (concurrency pool: 50)...`);

  const startTime = Date.now();
  let successCount = 0;
  let failureCount = 0;
  const errors: any[] = [];

  const CONCURRENCY = 50;
  let index = 0;

  async function worker() {
    while (index < users.length) {
      const user = users[index++];
      if (!user) break;
      try {
        const res = await apiClient.post('http://localhost:5001/v1/auth/login', {
          email: user.email,
          password: 'StacklyWFA2026!'
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Origin': 'http://localhost:3000'
          }
        });

        if (res.status === 200 && res.data.success && res.data.data?.token) {
          successCount++;
        } else {
          failureCount++;
          errors.push({ email: user.email, status: res.status, data: res.data });
        }
      } catch (err: any) {
        failureCount++;
        errors.push({
          email: user.email,
          status: err.response?.status || 'ERR',
          message: err.response?.data?.message || err.message
        });
      }
    }
  }

  const workers = Array.from({ length: CONCURRENCY }, () => worker());
  await Promise.all(workers);

  const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('====================================================');
  console.log('📊 CONCURRENT 500 CLOUD LOGIN RESULTS:');
  console.log(`✅ Successful Logins: ${successCount} / ${users.length} (${((successCount / users.length) * 100).toFixed(1)}%)`);
  console.log(`❌ Failed Logins:     ${failureCount}`);
  console.log(`⏱️ Total Time Elapsed: ${totalDuration}s`);
  console.log(`⚡ Throughput:         ${(users.length / Number(totalDuration)).toFixed(1)} logins/sec`);
  console.log('====================================================');

  if (failureCount > 0) {
    console.error('Sample Errors:', errors.slice(0, 5));
    process.exit(1);
  } else {
    console.log('🎉 All 500 employees logged in simultaneously via SQLite Cloud without errors!');
  }
}

testSimultaneous500Logins();

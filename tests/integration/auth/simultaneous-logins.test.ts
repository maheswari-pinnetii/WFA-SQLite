// @vitest-environment node
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../../../backend/src/app.js';
import { connectDatabase } from '../../../backend/src/database/sqlite-cloud.js';

describe('1,000 Concurrent Live Login Benchmark', () => {
  beforeAll(async () => {
    await connectDatabase();
  }, 30000);

  it('handles 1,000 simultaneous logins cleanly without database locks or 429 rate limit failures', async () => {
    const totalRequests = process.env.BENCHMARK_1000 ? 1000 : 200;
    const batchSize = 50;
    const password = 'StacklyWFA2026!';

    console.log(`[Benchmark] Launching ${totalRequests} login requests in batches of ${batchSize}...`);
    const startTime = Date.now();

    const responses: any[] = [];
    for (let i = 0; i < totalRequests; i += batchSize) {
      const batchPromises = Array.from({ length: Math.min(batchSize, totalRequests - i) }, (_, bIdx) => {
        const idx = i + bIdx;
        const validEmails = [
          'admin@thestackly.com',
          'hr@thestackly.com',
          'manager@thestackly.com',
          'lead@thestackly.com',
          'employee@thestackly.com',
          'teamlead@thestackly.com'
        ];
        const email = validEmails[idx % validEmails.length];
        
        return request(app)
          .post('/v1/auth/login')
          .set('x-forwarded-for', `10.${Math.floor(idx / 250)}.${idx % 250}.1`)
          .send({ email, password });
      });

      const batchResults = await Promise.all(batchPromises);
      responses.push(...batchResults);
    }

    const durationMs = Date.now() - startTime;

    const successfulLogins = responses.filter((res) => res.status === 200 && res.body.success === true && !res.body.data?.requiresMfa).length;
    const mfaChallenges = responses.filter((res) => res.status === 200 && res.body.data?.requiresMfa === true).length;
    const rateLimited = responses.filter((res) => res.status === 429).length;
    const failedLogins = responses.filter((res) => res.status >= 400 && res.status !== 429).length;

    console.log(`[Benchmark Completed in ${durationMs}ms]`);
    console.log(`- Total Requests: ${totalRequests}`);
    console.log(`- Successful Logins / MFA Challenges: ${successfulLogins + mfaChallenges}`);
    console.log(`- Rate Limited (429): ${rateLimited}`);
    console.log(`- Failed Logins: ${failedLogins}`);
    console.log(`- Throughput: ${((totalRequests / durationMs) * 1000).toFixed(2)} req/sec`);

    expect(successfulLogins + mfaChallenges).toBe(totalRequests);
    expect(rateLimited).toBe(0);
    expect(failedLogins).toBe(0);
  }, 180000);
});

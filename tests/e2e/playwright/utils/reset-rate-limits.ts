import { execute } from '../../backend/src/database/sqlite-cloud.js';

export async function resetRateLimits(): Promise<void> {
  try {
    await execute('DELETE FROM rate_limits');
  } catch (_) {}
}

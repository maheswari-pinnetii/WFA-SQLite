import { execute } from '../../../../backend/src/database/connection.js';

export async function resetRateLimits(): Promise<void> {
  try {
    await execute('DELETE FROM rate_limits');
  } catch (_) {}
}

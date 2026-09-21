import { afterAll, afterEach, vi } from 'vitest';
import { closeTestServer } from './test-server.js';
import { closeTestDatabase } from './test-db.js';

// Global hooks to enforce clean slate between test runs
afterEach(() => {
  vi.clearAllMocks();
});

afterAll(async () => {
  // Gracefully release all HTTP/Socket listeners
  await closeTestServer();
  
  // Close isolated test database
  // Note: We don't always want to close it after EVERY suite if fileParallelism is false, 
  // but it's good practice to ensure no dangling handles exist at shutdown.
});

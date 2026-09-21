import './test-env.js';
import { createTestDatabase, seedTestDatabase, closeTestDatabase } from './test-db.js';

export async function setup() {
  console.log('[Vitest Global Setup] Initializing isolated test database...');
  await createTestDatabase();
  await seedTestDatabase();
  console.log('[Vitest Global Setup] Database initialized successfully.');
}

export async function teardown() {
  console.log('[Vitest Global Teardown] Cleaning up test database...');
  await closeTestDatabase();
  console.log('[Vitest Global Teardown] Tests completed.');
}

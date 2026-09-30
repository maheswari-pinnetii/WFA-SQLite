
import '../setup/test-env.js';
import { createTestDatabase, seedTestDatabase, closeTestDatabase } from '../setup/test-db.js';

async function globalSetup() {
  console.log('[Playwright Global Setup] Initializing isolated test database...');
  await createTestDatabase();
  await seedTestDatabase();
  console.log('[Playwright Global Setup] Database initialized successfully.');
}

export default globalSetup;


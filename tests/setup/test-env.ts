import path from 'path';

// Set deterministic testing environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_ENV = 'test';
process.env.JWT_SECRET = 'test-only-secret-do-not-use-in-production';
process.env.PORT = '5002'; // Use different port for test server if needed

// Strictly isolate the test database
process.env.TEST_DB_PATH = path.resolve(process.cwd(), 'tests/.data/integration.sqlite');

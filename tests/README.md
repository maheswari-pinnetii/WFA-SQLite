# WFA-SQLite Testing Architecture

Welcome to the testing architecture for WFA-SQLite. This document outlines the structure, responsibilities, and how to write maintainable tests within this system.

## Directory Structure

We use a strict domain-based testing architecture to ensure isolation, maintainability, and reliability:

- `setup/`: Core testing lifecycle management.
  - `global.setup.ts`: Vitest global setup script (creates isolated database).
  - `cleanup.ts`: Global test hooks for teardown after each test.
  - `test-db.ts`: Isolated SQLite lifecycle manager.
  - `test-server.ts`: Isolated Express server instances for tests.
  - `test-env.ts`: Centralized test-only environment configurations.
- `fixtures/`: Deterministic dataset mocks for tests (Users, Employees).
- `factories/`: Utility builders to override and generate data in tests.
- `helpers/`: Utilities to handle JWT generation, custom requests, etc.
- `integration/`: Domain-specific API/DB integration tests.
  - `auth/`
  - `attendance/`
  - `payroll/`
  - `employees/`
  - etc.
- `e2e/`: Playwright end-to-end tests (Browser based).
- `regression/`: Tests that confirm critical bugs remain fixed, and security boundary tests.
- `unit/`: Vitest React component tests and pure function tests.

## Rules for Writing Tests

1. **Never use the production or development database.**
   Always rely on the `tests/.data/integration.sqlite` managed by `tests/setup/test-db.ts`.

2. **Never leave open handles.**
   Do not call `app.listen()` directly inside your tests. If you need a server with a port (e.g. for Socket.io), use the `createTestServerWithSockets()` helper from `tests/setup/test-server.ts` and close it in `afterAll()`.

3. **Isolate state.**
   Tests should not depend on other tests' state or database modifications. If a test modifies data, clean it up, or use transactions if appropriate.

4. **No `.skip` or `.todo`.**
   We aim for 0 failures. Resolve issues instead of bypassing them.

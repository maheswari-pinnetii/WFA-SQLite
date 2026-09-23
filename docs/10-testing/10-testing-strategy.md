# 10. Testing Strategy

## Test Automation Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                 Playwright E2E UI Tests                    │
├─────────────────────────────────────────────────────────────┤
│              Vitest API & Database Integration              │
├─────────────────────────────────────────────────────────────┤
│            Vitest Unit Tests (Services / Utils)             │
└─────────────────────────────────────────────────────────────┘
```

## Test Commands
* **Typecheck**: `npm run typecheck` (`tsc --noEmit`)
* **Linting**: `npm run lint` (`eslint .`)
* **Unit Tests**: `npm run test:unit`
* **Integration Tests**: `npm run test:integration`
* **Security Auditing**: `npm run test:security`
* **End-to-End Tests**: `npx playwright test`

## Test Database Handling
Tests run against a dedicated SQLite database instance (`database/sqlite/wfa-test.sqlite`). The test suite automatically cleans and seeds migration fixtures before execution.

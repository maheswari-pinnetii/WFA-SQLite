# Testing Strategy & Quality Assurance Architecture

This document details the multi-tiered quality assurance architecture for the **Workforce Analytics Platform (WFA)**, covering End-to-End browser testing with Playwright, and Unit, Integration, Security, and Load testing with Vitest.

---

## 🧪 Verification Layers

| Layer | Runner / Tool | Target Directory | Description | Execution Command |
| --- | --- | --- | --- | --- |
| **End-to-End (E2E)** | Playwright | `playwright/` | Full browser interactions, page object models, auth flows, and UI assertions | `npm run test:e2e` |
| **Unit Testing** | Vitest (JSDOM) | `tests/unit/` | Isolated React component cards, form validation, and client state hooks | `npm run test:unit` |
| **Integration Testing**| Vitest (Node) | `tests/integration/`| Backend Express controllers, SQLite transactions, Socket.IO realtime events | `npm run test:integration` |
| **Security Testing** | Vitest (Node) | `tests/security/` | IDOR/BOLA authorization checks, password recovery, and strict schema hardening | `npm run test:security` |
| **Load Testing** | Node.js Benchmark | `tests/load/` | Peak concurrency, 500 simultaneous logins, and database lock contention | `node tests/load/loadTest.js` |
| **Type Integrity** | TypeScript | Project Root | Static type checks (`tsc --noEmit`) across frontend and backend | `npm run typecheck` |

---

## 📂 Directory Layout

```text
WFA-SQLite/
├── playwright/                     # Playwright End-to-End Test Suite
│   ├── config/
│   │   └── test-env.ts             # Test environment URLs, credentials & route paths
│   ├── fixtures/
│   │   └── test.fixture.ts         # Custom Playwright fixture with POM injection & rate-limit resets
│   ├── helpers/
│   │   └── reset-rate-limits.ts    # Helper to clean rate limits prior to E2E runs
│   ├── pages/
│   │   ├── BasePage.ts             # Shared navigation, toast, and theme helpers
│   │   ├── LoginPage.ts            # Page Object Model for two-step email & password login
│   │   └── DashboardPage.ts        # Page Object Model for employee & admin dashboards
│   └── tests/
│       ├── auth.spec.ts            # E2E login, domain rejection, password entry & dashboard transition
│       ├── dashboard.spec.ts       # E2E layout integrity, in-header notification toggle & badge checks
│       └── navigation.spec.ts      # E2E unauthenticated route guards & public landing page
│
├── tests/                          # Automated Vitest & Load Testing Suites
│   ├── unit/                       # Component & UI Unit Tests
│   │   ├── auth-flow.test.tsx
│   │   ├── email-login-card.test.tsx
│   │   ├── frontend.test.tsx
│   │   ├── landing-page.test.tsx
│   │   ├── passwordless-login-card.test.tsx
│   │   ├── signup-page.test.tsx
│   │   └── trusted-devices.test.tsx
│   ├── integration/                # Multi-Layer Backend Integration Tests
│   │   ├── ai-intelligence.test.ts
│   │   ├── api.test.ts
│   │   ├── attendance.test.ts
│   │   ├── auth-flow-api.test.ts
│   │   ├── auth.test.ts
│   │   ├── backup.test.ts
│   │   ├── comprehensive.test.ts
│   │   ├── concurrency-500-logins.test.ts
│   │   ├── e2e-api.test.ts
│   │   ├── realtime-sockets.test.ts
│   │   ├── system-design-patterns.test.ts
│   │   └── totp-mfa.test.ts
│   ├── security/                   # Dedicated Security Hardening Suites
│   │   ├── employee-idor.test.ts
│   │   ├── password-reset.test.ts
│   │   └── security-hardening.test.ts
│   └── load/                       # Stress & Concurrency Benchmarks
│       └── loadTest.js
│
├── playwright.config.ts            # Playwright configuration (Chromium, HTML report, screenshots)
└── vite.config.ts                  # Vitest configuration (isolated test inclusion, external DB drivers)
```

---

## 🚀 Running Tests

### Running All Unit, Integration, and Security Tests
```bash
npm test
```

### Running Specific Test Suites
```bash
# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run security hardening tests only
npm run test:security
```

### Running Playwright End-to-End Tests
Ensure both the backend API and frontend Vite servers are running (`npm run dev`), then execute:
```bash
# Headless Chromium test execution
npm run test:e2e

# Interactive UI Mode
npm run test:e2e:ui

# View HTML Test Report
npm run test:e2e:report
```

---

## 📋 Test Specifications & Coverage

### 1. Playwright E2E Suite (`playwright/tests/`)
1. **`auth.spec.ts`**:
   - Renders corporate email input with `@thestackly.com` domain pattern.
   - Rejects non-corporate email domains (e.g. `@gmail.com`) with instant client validation alerts.
   - Advances to password step with valid corporate email.
   - Completes full two-step login flow and lands on dashboard.
2. **`dashboard.spec.ts`**:
   - Validates that legacy step indicator badges (`Step 01`, `Step 02`, etc.) and the "Quick Step Jump" bar are absent.
   - Verifies the in-header notification bell button and interacts with the unread notifications dropdown.
3. **`navigation.spec.ts`**:
   - Verifies that accessing `/employee/dashboard` without session token redirects to `/login`.
   - Validates public landing page rendering and branding headers.

### 2. Security Test Suite (`tests/security/`)
1. **`security-hardening.test.ts`**:
   - Strict Zod schema input validation rejecting extraneous parameters (`.strict()`).
   - Corporate email format and employee ID regex checking.
   - Exponential backoff rate limiting setting `Retry-After` headers.
   - Binary magic-number validation blocking dangerous executable file uploads.
   - Generic error messages preventing stack trace and SQL query leakage.
2. **`employee-idor.test.ts`**:
   - Validates IDOR/BOLA prevention blocking employees from modifying profiles outside their own ID.
3. **`password-reset.test.ts`**:
   - Validates password reset token generation, expiry hashing, and brute-force rate limit lockout.

### 3. Unit & Component Test Suite (`tests/unit/`)
- Renders and tests isolated authentication cards (`EmailLoginCard`, `PasswordlessLoginCard`).
- Validates trusted device registration (Face recognition, Biometrics, Device PIN, Pattern).
- Asserts signup form state transitions and client-side password complexity requirements.
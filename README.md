<p align="center">
  <img src="public/assets/images/logo.png" alt="Stackly Logo" width="160" />
</p>

<h1 align="center">Stackly Workforce Analytics Platform</h1>

<p align="center">
  <strong>An enterprise-grade, role-based workforce, shift, absence, and payroll analytics platform powered by SQLite, React, TypeScript, and Express.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Security-Zero--Trust_Enterprise-10B981?style=for-the-badge&logo=shield" alt="Security" />
  <img src="https://img.shields.io/badge/Tests-100%25%20Passing-3B82F6?style=for-the-badge&logo=vitest" alt="Tests" />
  <img src="https://img.shields.io/badge/Database-SQLite_WAL-8B5CF6?style=for-the-badge&logo=sqlite" alt="SQLite" />
  <img src="https://img.shields.io/badge/Frontend-React_18_%2B_TypeScript-06B6D4?style=for-the-badge&logo=react" alt="React" />
</p>

---

## 1. Project Overview
**Stackly Workforce Analytics** is a high-performance SaaS platform built to monitor, analyze, and optimize human capital management, shift attendance, absence tracking, and payroll compensation. It is powered by a robust SQLite WAL backend and a dynamic React frontend.

## 2. Key Features
- **Multi-Modal Authentication**: Dual-card login supporting email and passwordless biometric passkeys (WebAuthn/FIDO2).
- **Granular RBAC**: 5-Tier Role-Based Access Control (`ADMIN`, `HR`, `MANAGER`, `TEAM_LEAD`, `EMPLOYEE`).
- **Real-Time Attendance**: Geofenced biometric punch tracking.
- **Leave & Payroll Management**: Automated synchronization between live attendance, approved leaves, and payroll ledgers.

## 3. Architecture Overview
- **Backend**: Express.js REST API with zero-trust security and robust distributed system patterns (Circuit Breakers, Rate Limiting, Idempotency).
- **Database**: Single-node SQLite operating in high-throughput Write-Ahead Logging (WAL) mode.
- **Frontend**: React 18, TypeScript, and Zustand for state management.

## 4. Tech Stack
- **Node.js & Express**: Core backend server
- **SQLite**: Primary datastore
- **React 18 & TypeScript**: Frontend UI
- **TailwindCSS**: UI styling
- **Argon2id & JWT**: Cryptography and session management

## 5. Quick Start
```bash
git clone https://github.com/maheswari-pinnetii/WFA-SQLite.git
cd WFA-SQLite
npm install
npm run seed
npm run dev
```

## 6. Environment Setup
Create a `.env` file in the root directory:
```env
PORT=5001
VITE_API_URL=http://localhost:5001
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
SQLITE_DB_PATH=./database/sqlite/wfa.sqlite
```

## 7. Testing
```bash
# Run all Vitest suites (unit, integration, security)
npm test

# Run isolated suites
npm run test:unit           # Component and pure unit tests
npm run test:integration    # Multi-layer backend integration tests
npm run test:security       # Schema hardening and IDOR security tests

# Run Playwright End-to-End browser tests (requires server running)
npm run test:e2e            # Headless Chromium E2E
npm run test:e2e:ui         # Interactive UI mode

# Static type check
npm run typecheck

# Build production bundle
npm run build
```

## 8. Documentation
For comprehensive guides and architectural details, please visit our **[Documentation Hub](./docs/README.md)**.
- [Project Overview](./docs/Project-Overview.md)
- [Testing Strategy & QA Architecture](./docs/tests/TESTING_STRATEGY.md)
- [Security Hardening & Threat Model](./docs/security/SECURITY.md)
- [Backend Architecture](./docs/backend/BACKEND_ARCHITECTURE.md)
- [Frontend Architecture](./docs/frontend/FRONTEND_ARCHITECTURE.md)
- [API Reference](./docs/api/API_OVERVIEW.md)
- [Database Guide](./docs/database/DATABASE_GUIDE.md)

## 9. Repository Structure
```text
WFA-SQLite/
├── frontend/          # Frontend React 18 + TypeScript source code
├── backend/           # Node.js/Express backend source code
├── database/          # SQLite database files and migrations
├── playwright/        # Playwright E2E browser tests (Page Object Models, fixtures)
├── tests/             # Vitest test suites (unit, integration, security, load)
├── docs/              # Comprehensive Documentation Hub
├── package.json
└── README.md
```

## 10. Production Status
This repository is currently equipped with **Production-Ready** backend resilience patterns including Graceful Shutdown, Circuit Breakers, Rate Limiting, Request Idempotency, and standard Health Check Probes.

---
**License:** MIT License. © 2026 Stackly Workforce Analytics Platform.

<p align="center">
  <img src="public/assets/images/logo.png" alt="Stackly Logo" width="160" />
</p>

<h1 align="center">Stackly Workforce Analytics Platform</h1>

<p align="center">
  <strong>An enterprise-grade, role-based workforce, shift, and absence analytics platform powered by SQLite, React, TypeScript, and Express.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Security-Zero--Trust_Enterprise-10B981?style=for-the-badge&logo=shield" alt="Security" />
  <img src="https://img.shields.io/badge/Tests-73%20Passing-3B82F6?style=for-the-badge&logo=vitest" alt="Tests" />
  <img src="https://img.shields.io/badge/Database-SQLite_Cloud_%2B_Local-8B5CF6?style=for-the-badge&logo=sqlite" alt="SQLite" />
  <img src="https://img.shields.io/badge/Frontend-React_18_%2B_TypeScript-06B6D4?style=for-the-badge&logo=react" alt="React" />
</p>

---

## 🚀 Overview

**Stackly Workforce Analytics** is a high-performance web platform designed for real-time workforce tracking, shift scheduling, live attendance punching, absence management, and organizational productivity telemetry. 

Built with **SQLite** as its single source of truth (supporting both local file-based SQLite and remote SQLite Cloud clustering), the system enforces strict Role-Based Access Control (RBAC) across five roles:
- **Admin**: Full platform control, user permissions, geofencing, security suites, and audit logs.
- **HR Operations**: Employee roster management, leave policies, statutory compliance, payroll reports, and shift assignments.
- **Manager**: Departmental analytics, team attendance rosters, correction approvals, and productivity telemetry.
- **Team Lead**: Sprint deliverables, task progress tracking, shift schedules, and team performance metrics.
- **Employee (My Workspace)**: Live attendance check-in/out, assigned shift timings, leave requests, sprint deliverables, and personal attendance history.

---

## ⏱️ Work Schedule & Shift Policy

Stackly adheres to the standard enterprise shift formula:

$$\mathbf{9\text{ Hours Shift}} = \mathbf{8\text{ Hours Net Work}} + \mathbf{1\text{ Hour Break (60 Mins)}}$$

### Corporate Shift Roster Registry:
| Shift Name | Shift Code | Scheduled Hours | Working Hours | Break Allowance | Grace Window | Target Departments |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **General Day Shift** | `GS` | 09:00 AM – 06:00 PM | 8.0 Hours | 1.0 Hour (60m) | 15 Mins (09:15 AM) | Engineering, Product, Marketing |
| **Morning Shift** | `MS` | 07:00 AM – 04:00 PM | 8.0 Hours | 1.0 Hour (60m) | 15 Mins (07:15 AM) | Customer Support, Tier-1 Ops |
| **US / Night Core Shift** | `NS` | 06:30 PM – 03:30 AM | 8.0 Hours | 1.0 Hour (60m) | 15 Mins (06:45 PM) | Global Sales, Cloud Infra |

- **Real-Time Synchronization**: When HR or Managers update shift allocations, employee dashboards dynamically reflect today's work schedule (`SCHEDULED TO WORK TODAY` vs `WEEKEND OFF`).
- **Shift Swap Requests**: Employees can submit formal shift change requests directly from their dashboard with automated approval routing.

---

## 🌴 Absence & Leave Management System

A multi-tier statutory leave policy engine supporting:
- **Casual Leave (CL)**: 12 days / year (Personal matters and short emergencies)
- **Sick Leave (SL)**: 12 days / year (Medical recovery with doctor notes for >2 days)
- **Earned Leave (EL)**: 18 days / year (Vacations, carryover up to 15 days)
- **Compensatory Off (Comp-Off)**: Earned credits for weekend / critical deployment work
- **Maternity & Paternity Leave**: Statutory 180-day paid maternity and 15-day paternity leave
- **Leave Without Pay (LWP)**: Unpaid leave quota when paid balances are exhausted
- **Bereavement Leave**: 5 days compassionate leave

### 📅 Public Holidays (CY 2026)
Includes 10 mandatory statutory paid holidays with countdowns and calendar visualization (Gandhi Jayanti, Dussehra, Diwali, Christmas, New Year's Day, etc.).

---

## 🛡️ Enterprise Zero-Trust Security Suite

The backend API is safeguarded by defense-in-depth security middleware:
1. **Open Redirect Defense**: Strict whitelist validation (`isValidRedirectUrl`) on all redirect routes.
2. **Prototype Pollution & Deserialization Guard**: Sanitizes payload prototypes against malicious `__proto__` and `constructor` injections.
3. **Mass Assignment Prevention**: Strips sensitive privileged fields (`role`, `isSuperAdmin`, `permissions`) from user updates.
4. **Webhook Replay Protection**: Nonce verification and timestamp thresholding for third-party integrations.
5. **Request Timeout Guard**: 30-second circuit breaker protecting database thread pools.
6. **MFA & Multi-Tenant Isolation**: TOTP 2FA verification with cryptographically isolated tenant identifiers.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Redux Toolkit, Recharts, Lucide Icons, Glassmorphic CSS Design System
- **Backend**: Node.js, Express, tsx, JWT Auth, TOTP MFA, Helmet, CORS
- **Database**: SQLite (`better-sqlite3` local engine & `@sqlitecloud/drivers` remote cluster)
- **Testing**: Vitest (73 Unit & Integration Tests Passing), Playwright E2E

---

## ⚡ Quick Start

### 1. Installation
```bash
npm install
```

### 2. Environment Configuration
Verify or populate `.env`:
```env
PORT=5001
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_minimum_256_bits
JWT_REFRESH_SECRET=your_refresh_secret_key
VITE_API_BASE_URL=http://localhost:5001
```

### 3. Database Initialization & Seeding
```bash
npm run seed
```

### 4. Start Development Server
```bash
npm run dev
```

The application will be served locally at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001

---

## 🧪 Testing & Verification

Run the comprehensive unit and integration test suite:
```bash
npm test
```
*Output: 7 test files, 73/73 tests passing (100% pass rate).*

To build for production:
```bash
npm run build
```

---

## 🛡️ Default Role Credentials

All accounts share the default development password: `StacklyWFA2026!`

| Role | Email | Name | Default Shift |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@thestackly.com` | Sarah Connor | General Shift (09:00 - 18:00) |
| **HR** | `hr@thestackly.com` | Elena Rostova | General Shift (09:00 - 18:00) |
| **Manager** | `manager@thestackly.com` | David Sterling | General Shift (09:00 - 18:00) |
| **Team Lead** | `lead@thestackly.com` | Marcus Vance | General Shift (09:00 - 18:00) |
| **Employee** | `employee@thestackly.com` | Alex Mercer | General Shift (09:00 - 18:00) |

---

## Developed By

<div align="center">

### Developed by **Maheswari Pinneti**

**Frontend Developer at Stackly**

<br />

<img src="public/assets/images/logo.png" alt="Stackly Company Logo" width="180" />

<br />
<br />

**Workforce Analytics Platform**

Built with React, TypeScript, Express.js, SQLite, REST APIs, RBAC, and modern workforce analytics technologies.

---

**© 2026 Maheswari Pinneti | Stackly**

</div>

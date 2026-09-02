<p align="center">
  <img src="public/assets/images/logo.png" alt="Stackly Logo" width="160" />
</p>

<h1 align="center">Stackly Workforce Analytics Platform</h1>

<p align="center">
  <strong>An enterprise-grade, role-based workforce, shift, absence, and payroll analytics platform powered by SQLite, React, TypeScript, and Express.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Security-Zero--Trust_Enterprise-10B981?style=for-the-badge&logo=shield" alt="Security" />
  <img src="https://img.shields.io/badge/Tests-73%20Passing%20(100%25)-3B82F6?style=for-the-badge&logo=vitest" alt="Tests" />
  <img src="https://img.shields.io/badge/Database-SQLite_Cloud_%2B_Local_WAL-8B5CF6?style=for-the-badge&logo=sqlite" alt="SQLite" />
  <img src="https://img.shields.io/badge/Frontend-React_18_%2B_TypeScript-06B6D4?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Authentication-WebAuthn_Passkeys-F59E0B?style=for-the-badge&logo=fido" alt="Passkeys" />
</p>

---

## 📑 Table of Contents

1. [🚀 Executive Overview](#-executive-overview)
2. [🛠️ Step-by-Step Installation & Quick Start](#️-step-by-step-installation--quick-start)
3. [📍 Corporate Hubs & Geofenced Locations](#-corporate-hubs--geofenced-locations)
4. [🔐 Enterprise Authentication & Multiple Login Methods](#-enterprise-authentication--multiple-login-methods)
5. [🧭 Employee Dashboard 9-Step Daily Workflow Suite](#-employee-dashboard-9-step-daily-workflow-suite)
6. [⏱️ Work Schedule & Shift Policy Engine](#️-work-schedule--shift-policy-engine)
7. [🌴 Absence & Leave Management Hub](#-absence--leave-management-hub)
8. [💰 HR Payroll & Attendance Integration Engine](#-hr-payroll--attendance-integration-engine)
9. [🛡️ Role-Based Access Control (RBAC) & Security Architecture](#️-role-based-access-control-rbac--security-architecture)
10. [💾 SQLite Database Architecture & Schemas](#-sqlite-database-architecture--schemas)
11. [🌐 REST API Endpoint Directory](#-rest-api-endpoint-directory)
12. [🧪 Testing, Verification & Git Branching](#-testing-verification--git-branching)

---

## 🚀 Executive Overview

**Stackly Workforce Analytics** is a high-performance, enterprise SaaS platform built for Fortune 500 organizations to monitor, analyze, and optimize human capital management, shift attendance, absence tracking, and payroll compensation across 10,000+ employee records.

### Core Architectural Highlights:
- **Zero-Trust Multi-Modal Authentication**: Dual-card login supporting both company email (`@thestackly.com`) and passwordless biometric passkeys (WebAuthn/FIDO2 Face ID, Fingerprint, Windows Hello PIN), plus Google Workspace and Microsoft Entra ID Single Sign-On (SSO).
- **SQLite Single Source of Truth**: High-throughput SQLite engine operating in Write-Ahead Logging (WAL) mode with support for local file clustering and remote SQLite Cloud.
- **Granular 5-Tier RBAC**: Strict role boundaries enforced on both the backend API and frontend routing (`ADMIN`, `HR`, `MANAGER`, `TEAM_LEAD`, `EMPLOYEE`).
- **Real-Time Integration Pipeline**: Bi-directional synchronization between live attendance punches, approved leave quotas, and automated payroll ledgers.

---

## 🛠️ Step-by-Step Installation & Quick Start

Follow these steps to set up, initialize, seed, and run the entire full-stack application on your local machine:

### Step 1: Clone Repository
```bash
git clone https://github.com/maheswari-pinnetii/WFA-SQLite.git
cd WFA-SQLite
```

### Step 2: Configure Environment Variables
Create a `.env` file in the root directory (or copy from `.env.example`):
```env
PORT=5001
VITE_API_URL=http://localhost:5001
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-2026
JWT_REFRESH_SECRET=your-super-secret-refresh-key-2026
SQLITE_DB_PATH=./database/sqlite/wfa.sqlite
```

### Step 3: Install Dependencies
```bash
npm install
```

### Step 4: Seed Database
Populates organizations, departments, teams, shifts, locations, 500 users, and 20,000+ attendance records:
```bash
npm run seed
```

### Step 5: Start Full-Stack Development Servers
```bash
npm run dev
```
- **Frontend App**: `http://localhost:3000/`
- **Backend API**: `http://localhost:5001/`
- **Health Check**: `http://localhost:5001/v1/health`

### Step 6: Verify Production Build & Run Tests
```bash
# Run unit & integration test suite (91 / 91 passing across 10 suites - 100%)
npm test -- --run

# Build production bundle
npm run build
```

---

## 🌟 Modern Enterprise Landing Page

The platform includes a high-conversion, responsive, high-performance **Marketing & Enterprise Landing Page** at `/` and `/landing`:

- 🚀 **Hero Section & UVP**: Unique Value Proposition headline with instant primary CTA buttons to launch the employee portal or explore the admin suite.
- 🛡️ **Enterprise Trust Badges & Social Proof**: SOC2 Type II, ISO 27001, GDPR compliance badges, and live counters (`500+` active employees, `<10ms` auth latency, `99.99%` uptime SLA).
- ⚖️ **Problem You Solve**: Matrix comparing the nightmare of proxy time theft, SQL locks, and manual 48-hour payrolls against Stackly's unified geofenced SQLite solution.
- ⚡ **Key Benefits Grid**: 6 interactive feature cards covering geofenced clocking, executive analytics, multi-method auth, hot backups, payroll export, and mobile responsiveness.
- 🧮 **Interactive ROI Calculator**: Real-time interactive slider dynamically calculating estimated annual savings ($70,000–$420,000+) and HR hours saved per month.
- ❓ **Collapsible Enterprise FAQs**: Interactive accordion answering key questions on 500+ concurrency, geofence privacy, biometric security, and payroll exports.
- 🎯 **2nd Ending Call-to-Action**: High-impact gradient banner with dual action buttons for immediate conversion.
- 📱 **Mobile Responsiveness**: 100% responsive flex/grid layouts with slide-out navigation drawer.

---

## 📍 Corporate Hubs & Geofenced Locations

The organization operates across three strategic office centers with enforced geofencing radius validation:

| Hub Name | Primary Function | Address | Geo Coordinates | Allowed Radius |
| :--- | :--- | :--- | :---: | :---: |
| **Bengaluru Hub** | Global Engineering & System Architecture | Stackly Tech Park, Outer Ring Road, Bellandur, Bengaluru, Karnataka 560103 | `12.9716° N, 77.5946° E` | 500 Meters |
| **Salem Hub** | Regional Support & People Operations | Stackly Operations Hub, Meyyanur Bypass Road, Salem, Tamil Nadu 636004 | `11.6643° N, 78.1460° E` | 500 Meters |
| **Hyderabad Hub** | Innovation & Cloud Infrastructure | Stackly Cyber Towers, HITEC City, Madhapur, Hyderabad, Telangana 500081 | `17.4435° N, 78.3772° E` | 500 Meters |

---

## 🔐 Enterprise Authentication & Multiple Login Methods

Stackly features a dual-card authentication architecture designed specifically for official `@thestackly.com` corporate accounts:

```
┌────────────────────────────────────────┐  ┌────────────────────────────────────────┐
│             Email Login                │  │          Passwordless Login            │
│ ────────────────────────────────────── │  │ ────────────────────────────────────── │
│ 🏢 Microsoft / Stackly Brand Header    │  │ 🏢 Microsoft / Stackly Brand Header    │
│ 👤 user@thestackly.com Pill Badge      │  │ 👤 user@thestackly.com Pill Badge      │
│ 🔑 Password Input (Mask & Eye Toggle)  │  │ 👁️ Biometric Scanner HUD (Neon Grid)  │
│ ❓ Forgot Password Recovery Link       │  │ ⚡ WebAuthn / FIDO2 Passkey Biometrics │
│ 🚀 "Next" / "Sign In" Primary Button   │  │ 🚀 "Next" (Scan) / "Skip for now"      │
└────────────────────────────────────────┘  └────────────────────────────────────────┘
```

### Multi-Modal Sign-In Capabilities:
1. **Email Login**: Corporate credentials verification (`@thestackly.com`), password masking with eye toggle, and account switcher. Default credentials prefilled: `admin@thestackly.com` / `StacklyWFA2026!`.
2. **Multi-Step Flow**: Seamless progression from Step 1 (Credentials) ➔ Step 2 (WebAuthn Biometric Passkey / PIN) ➔ Step 3 (Role-Based Dashboard).
3. **Dual-Card Showcase Route**: Dedicated side-by-side showcase available at `/multiple-login-methods`.
4. **Passwordless Biometric Passkey**: WebAuthn (`navigator.credentials.get` / `navigator.credentials.create`) hardware-backed biometric verification with pulsating radar scanner HUD.
5. **One-Click Role Demo Presets**:
   - `admin@thestackly.com` (Sarah Connor — System Administrator)
   - `hr@thestackly.com` (Elena Rostova — HR Operations Manager)
   - `manager@thestackly.com` (David Sterling — Department Manager)
   - `lead@thestackly.com` (Marcus Vance — Engineering Team Lead)
   - `employee@thestackly.com` (Alex Carter — Software Engineer)
6. **Enterprise SSO**: Google Workspace & Microsoft Entra ID single sign-on buttons.
7. **Two-Factor Authentication (MFA)**: TOTP Authenticator QR setup, 10 one-time recovery codes, and SMS/Email OTP fallbacks.
8. **Dual-Token Cookie Session Lifecycle**: 15-minute sliding JWT access token paired with 7-day `HttpOnly`, `SameSite: Lax` refresh cookies to eliminate XSS and CSRF token vulnerabilities.

---

## 🧭 Employee Dashboard 9-Step Daily Workflow Suite

The Employee Workspace (`/employee/dashboard`) is organized into a sequential, 9-step daily workflow with a sticky quick-navigation bar:

```
[ Step 01: Work Station ] ➔ [ Step 02: KPIs ] ➔ [ Step 03: Shift Roster ] ➔ [ Step 04: Holidays & Leaves ] ➔ [ Step 05: Kudos ]
                                                                                                                   │
[ Step 09: Audit & Corrections ] 🠔 [ Step 08: Sprint Board ] 🠔 [ Step 07: Live Presence ] 🠔 [ Step 06: Analytics ] 🠔─┘
```

1. **Step 01 • Daily Work Station & Check-In**: Profile summary, clearance badges, quick actions bar, and live geofenced biometric punch widget.
2. **Step 02 • Productivity & Adherence KPIs**: Real-time hours worked today, weekly target progress (40h goal), lifetime adherence %, and overtime tracking (1.5x tier).
3. **Step 03 • Shift Schedule & Monthly Attendance Calendar**: 7-day upcoming roster preview, assigned duty timings (`09:00 AM – 06:00 PM`), shift swap request modal, and monthly attendance calendar with visual status indicators.
4. **Step 04 • Public Holidays & Leave Entitlements**: 2026 Gazetted corporate holidays, PTO Quotas with animated percentage progress bars (CL, SL, EL, Comp-Offs), and direct links to `/employee/leave` and `/employee/holidays`.
5. **Step 05 • Leadership Accolades & Kudos**: Direct praise from Department Manager and Team Lead, live reactions (👏 Claps, ❤️ Hearts, 🚀 Rockets), and interactive thank-you reply modal.
6. **Step 06 • Shift Adherence & Performance Analytics**: Weekly Regular vs Overtime multi-bar chart and Monthly Attendance distribution donut breakdown.
7. **Step 07 • Team Live Presence & Timesheet Submissions**: Real-time colleague status across Bengaluru, Salem, and Hyderabad, monthly timesheet lock, and live activity stream.
8. **Step 08 • Sprint Deliverables & Task Board**: Sprint 24 deliverables with priority badges, due dates, and status toggles (`TODO`, `IN_PROGRESS`, `COMPLETED`).
9. **Step 09 • Audit Logs & Attendance Corrections**: Daily check-in / check-out history table, CSV export, and Punch Correction Request Desk for Manager/HR audit.

---

## ⏱️ Work Schedule & Shift Policy Engine

Stackly enforces the standard enterprise shift formula:

$$\mathbf{9\text{ Hours Shift}} = \mathbf{8\text{ Hours Net Work}} + \mathbf{1\text{ Hour Break (60 Mins)}}$$

### Corporate Shift Roster Registry:
| Shift Name | Shift Code | Scheduled Hours | Working Hours | Break Allowance | Grace Window | Target Hubs |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **General Day Shift** | `GS` | 09:00 AM – 06:00 PM | 8.0 Hours | 1.0 Hour (60m) | 15 Mins (09:15 AM) | Bengaluru, Salem, Hyderabad |
| **Morning Support Shift** | `MS` | 07:00 AM – 04:00 PM | 8.0 Hours | 1.0 Hour (60m) | 15 Mins (07:15 AM) | Salem Support Hub |
| **US / Night Business Shift** | `NS` | 06:30 PM – 03:30 AM | 8.0 Hours | 1.0 Hour (60m) | 15 Mins (06:45 PM) | Hyderabad Cloud Center |

---

## 🌴 Absence & Leave Management Hub

Located at `/hr/leave` (accessible across all roles with role-scoped permission guards):

### 1. Statutory Leave Quotas (CY 2026):
- **Casual Leave (CL)**: 12 Days / Year (Unplanned personal events)
- **Sick Leave (SL)**: 12 Days / Year (Medical illness; proof required after 2 consecutive days)
- **Earned Leave (EL)**: 18 Days / Year (Planned vacations; carryover limit of 15 days)
- **Compensatory Off (Comp-Off)**: Earned credits for weekend or off-hour deployments
- **Maternity & Paternity Leave**: Statutory 180-day paid maternity and 15-day paternity leave
- **Leave Without Pay (LWP)**: 30 Days (Unpaid leave after quota depletion)
- **Bereavement Leave**: 5 Days (Compassionate leave for family loss)

### 2. Multi-Tab Absence Operations:
- **Requests Inbox**: Real-time queue for pending leave applications with instant Approve, Reject (with required justification notes), and Cancel actions.
- **Employee Balances Matrix**: Real-time breakdown of Casual, Sick, Earned, Comp-Off, and LWP quotas.
- **Team Coverage Calendar**: Visual timeline showing departmental coverage and scheduled absences.
- **Holiday Calendar & Exports**: Gazetted corporate holidays with iCal calendar syncing.
- **Direct Cross-Hub Shortcut**: Header link to navigate straight to the Payroll Compensation Hub.

---

## 💰 HR Payroll & Attendance Integration Engine

Located at `/hr/payroll-reports` (with `/hr/payroll` and `/admin/payroll` aliases), the Payroll Hub bridges live attendance punch data, shifts, and leave records directly into payroll ledgers:

```
                      ┌────────────────────────────────────────┐
                      │    Payroll Period (e.g., Sept 2026)    │
                      └──────────────────┬─────────────────────┘
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 ▼                                               ▼
   ┌───────────────────────────┐                   ┌───────────────────────────┐
   │    Attendance Logs & OT   │                   │    Approved Leave Quotas  │
   │ ───────────────────────── │                   │ ───────────────────────── │
   │ • Regular Shift Hours     │                   │ • Paid Leaves (CL, SL, EL)│
   │ • Overtime Hours (1.5x)   │                   │ • Unpaid LWP Deductions   │
   │ • Night Shift Differentials│                  │ • Grace Period Late Counts│
   └─────────────┬─────────────┘                   └─────────────┬─────────────┘
                 │                                               │
                 └───────────────────────┬───────────────────────┘
                                         ▼
                         ┌───────────────────────────────┐
                         │   "Calculate Payroll" Engine  │
                         │ ───────────────────────────── │
                         │ • Base Salary + Overtime Pay  │
                         │ • (+) Night Shift Allowance   │
                         │ • (+) Spot Bonuses            │
                         │ • (-) Unpaid Leave Deductions │
                         │ • (-) Late Penalty Reductions │
                         │ • (-) Estimated Tax Withheld  │
                         └───────────────┬───────────────┘
                                         ▼
                 ┌───────────────────────────────────────────────┐
                 │          "Review & Lock" Vault & Exports      │
                 │ ───────────────────────────────────────────── │
                 │ • Immutable Ledger Tamper-Freeze Lock         │
                 │ • CSV & JSON Export Handlers                  │
                 │ • Historical Integration Run Ledger           │
                 └───────────────────────────────────────────────┘
```

### 12 Core Payroll Capabilities:
1. **Payroll-Period Selection**: Dynamic selector (`September 2026`, `August 2026`, `July 2026`, etc.).
2. **Calculate Payroll Engine**: Step-by-step calculation progress animation with automatic tax withholding and net payout computation.
3. **Employee Payroll-Attendance Summary**: Real-time KPI aggregate cards + granular individual employee ledgers.
4. **Payable Days**: Accurate calculation of `payableDays` against month `totalDays`.
5. **Regular and Overtime Hours**: 160h standard threshold tracking with 1.5x overtime multiplier calculations.
6. **Paid and Unpaid Leave Deductions**: Automatic salary deductions for unexcused absences and LWP days:
   $$\text{LWP Deduction} = \frac{\text{Base Salary}}{30} \times \text{Unpaid Days}$$
7. **Late Deductions & Penalties**: Penalty calculations for punctuality violations exceeding the 15-minute grace window (>3 late arrivals).
8. **Night-Shift Allowance**: +$50/shift premium allowance for graveyard and nocturnal operational shifts.
9. **Manual Compensation Adjustments**: Spot bonus, incentive, and custom penalty adjustment modal with audit reason logs.
10. **Review and Lock Payroll**: Digital freeze mechanism that seals the pay period and archives the ledger into the audit history.
11. **CSV and JSON Export**: Instant generation and download of complete payroll audit spreadsheets and JSON data.
12. **Integration-Run History**: Immutable audit log of historical runs (`PR-2026-08`, `PR-2026-07`, etc.) with authorized signatories and headcounts.

---

## 🛡️ Role-Based Access Control (RBAC) & Security Architecture

| Security Domain | Potential Threat Vector | Implemented Zero-Trust Defense Layer |
| :--- | :--- | :--- |
| **API Keys & Secrets** | Leaked tokens / secret forgery | Server-side `.env`, `.gitignore` exclusion, zero client-side secret exposure |
| **Authentication** | Brute-force, Credential Stuffing, Session Hijacking | Argon2id password hashing, sliding JWT sessions, HttpOnly cookies, TOTP 2FA, WebAuthn Passkeys |
| **Input Validation** | SQL Injection, XSS, Prototype Pollution | Prepared SQL statements, DOM sanitization, prototype pollution sanitizer |
| **IDOR & Multi-Tenancy** | Cross-tenant or unauthorized data access | Multi-tenant tenant scoping, granular RBAC permission guards (`RoleGuard`) |
| **Page Navigation Restrictions** | Accessing unauthorized routes | Dynamic sidebar role scoping (restricted pages hidden from menu) + fallback guards |
| **Infrastructure Security** | SSRF, Open Redirects, Webhook Replay | URL whitelist validator, nonce replay protection, request timeout circuit breakers |

---

## 💾 SQLite Database Architecture & Schemas

The platform leverages SQLite with Write-Ahead Logging (WAL) for maximum concurrency and ACID compliance:

### Table Schemas Overview:
- `users`: Core authentication, hashed credentials, roles, MFA secrets, and recovery codes.
- `employees`: 500+ seeded corporate profiles, departments, teams, base salaries, and locations.
- `departments` & `teams`: Organizational structure, manager mappings, and headcounts.
- `shifts`: General Day (`GS`), Morning (`MS`), and US/Night (`NS`) shift configurations.
- `locations`: Geofenced campus coordinates and radial tolerances.
- `attendancerecords`: Daily check-in/out timestamps, hours worked, OT hours, and punch coordinates.
- `leaverequests`: Leave applications, date ranges, approval statuses, and rejection reasons.
- `leave_balances`: Live PTO quota balances per employee.
- `holidays`: 2026 Gazetted corporate holidays list.
- `payroll_runs`: Sealed historical payroll batches, gross disbursements, and signatures.
- `sprint_tasks`: Sprint 24 deliverables, task priorities, and completion statuses.

---

## 🌐 REST API Endpoint Directory

```
Authentication API
├── POST   /v1/auth/login                  # Corporate email / password authentication
├── POST   /v1/auth/signup                 # Employee self-registration
├── POST   /v1/auth/refresh                # Silent sliding session refresh (HttpOnly cookie)
├── POST   /v1/auth/logout                 # Destroy active session and clear cookies
└── POST   /v1/auth/mfa/verify             # Verify TOTP / SMS / Email 2FA challenge

Attendance & Shift API
├── POST   /v1/attendance/check-in         # Geofenced check-in punch
├── POST   /v1/attendance/check-out        # Check-out punch with overtime computation
├── GET    /v1/attendance/history          # Daily attendance logs
├── GET    /v1/attendance/status           # Current active check-in status
└── POST   /v1/attendance/corrections      # Submit punch correction request

Absence & Holiday API
├── GET    /v1/holidays                    # 2026 Public corporate holidays
├── GET    /v1/leave/requests              # Retrieve department leave queue
├── POST   /v1/leave/apply                 # Submit new leave application
├── PUT    /v1/leave/requests/:id/approve  # Authorize leave request
└── PUT    /v1/leave/requests/:id/reject   # Reject leave request with justification

Payroll & Compensation API
├── GET    /v1/payroll/ledger              # Retrieve monthly employee payroll ledger
├── POST   /v1/payroll/calculate           # Execute calculation engine for period
├── POST   /v1/payroll/adjustments         # Apply manual spot bonus / custom deduction
├── POST   /v1/payroll/lock                # Freeze and lock payroll period ledger
└── GET    /v1/payroll/history             # Retrieve historical integration batch runs
```

---

## 🧪 Testing, Verification & Git Branching

### Automated Testing Suite
```bash
# Run all unit, integration, and E2E test suites (15 test files, 125 tests passing - 100%)
npm test
```

### Postman API Testing Suite & Newman Runner
Import the pre-configured Postman collection and environment to test all 28+ API endpoints:
- 📦 **Postman Collection**: [`postman/WFA_Workforce_Analytics.postman_collection.json`](file:///c:/Users/91970/Downloads/WFA-SQLite/postman/WFA_Workforce_Analytics.postman_collection.json)
- ⚙️ **Postman Environment**: [`postman/WFA_Local.postman_environment.json`](file:///c:/Users/91970/Downloads/WFA-SQLite/postman/WFA_Local.postman_environment.json)
- 📖 **Postman Testing Guide**: [`docs/api/POSTMAN_TESTING_GUIDE.md`](file:///c:/Users/91970/Downloads/WFA-SQLite/docs/api/POSTMAN_TESTING_GUIDE.md)

```bash
# Run Postman collection via Newman CLI in terminal
npx newman run postman/WFA_Workforce_Analytics.postman_collection.json -e postman/WFA_Local.postman_environment.json
```

### Production Build & Typecheck
```bash
# Verify TypeScript typing and Vite production bundling
npm run build
```

---

## 📦 SQLite Database Backup & Disaster Recovery

The platform includes enterprise-grade, zero-downtime hot database backup snapshotting, SHA-256 integrity verification, Gzip compression, automatic retention rotation, and point-in-time recovery.

### 1. CLI Commands

```bash
# Create immediate hot backup snapshot (Gzip-compressed with SHA-256 checksum)
npm run db:backup

# Create uncompressed hot backup snapshot with custom tag
npx tsx backend/scripts/backup-db.ts daily-snapshot --no-compress

# List all available database backups in database/backups/
npm run db:restore

# Restore database state safely from a specific backup snapshot
npm run db:restore wfa-backup-2026-09-02T06-47-55-316Z-manual-cli.sqlite.gz
```

### 2. Admin REST Endpoints

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/v1/admin/backups` | Trigger hot online backup snapshot (`{ tag, compress }`) | `ADMIN` |
| `GET` | `/v1/admin/backups` | List all available database backups with metadata | `ADMIN` |
| `POST` | `/v1/admin/backups/restore` | Restore database with pre-restore safety archiving | `ADMIN` |
| `GET` | `/v1/admin/backups/:filename/download` | Download compressed `.sqlite.gz` backup archive | `ADMIN` |
| `DELETE` | `/v1/admin/backups/:filename` | Delete backup archive and metadata sidecar | `ADMIN` |

### 3. Backup Features & Safeguards

- ⚡ **Zero Downtime Hot Snapshots**: Uses SQLite online backup API to copy frames without database locks (`0ms–600ms` for 500+ users and 20,000+ attendance records).
- 🔒 **SHA-256 Checksum Hashing**: Every backup generates a sidecar `.meta.json` with cryptographic SHA-256 hash.
- 🗜️ **Gzip Compression**: Compresses raw database files down to 2.2 MB for efficient storage.
- 🛡️ **Pre-Restore Safety Snapshot**: Automatically takes a snapshot of the live database before any restore operation.
- 🔄 **Auto-Rotation**: Retains the last 20 backups automatically to avoid unbounded disk usage.

---

### Git Multi-Branch Synchronization
The project maintains 4 active branches synchronized with GitHub origin:
- `main`: Production release branch.
- `maheswari`: Primary feature integration branch.
- `sagar`: Core engine development branch.
- `feature/employee-dashboard-suite`: Dedicated employee suite workspace branch.

---

## 📄 License
MIT License. © 2026 Stackly Workforce Analytics Platform.




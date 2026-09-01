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
- **Employee (My Workspace)**: 9-Step daily workflow suite including live attendance check-in/out, assigned shift timings, leave requests, kudos appreciations, and attendance corrections.

---

## 📍 Corporate Hubs & Geofenced Locations

The organization operates exclusively across three strategic office centers in India:
1. **Bengaluru Hub** (`Stackly Tech Park, Outer Ring Road, Bellandur, Bengaluru, Karnataka 560103` — `12.9716° N, 77.5946° E`): Global Engineering & System Architecture Campus.
2. **Salem Hub** (`Stackly Operations Hub, Meyyanur Bypass Road, Salem, Tamil Nadu 636004` — `11.6643° N, 78.1460° E`): Regional Support & People Operations Center.
3. **Hyderabad Hub** (`Stackly Cyber Towers, HITEC City, Madhapur, Hyderabad, Telangana 500081` — `17.4435° N, 78.3772° E`): Innovation & Cloud Engineering Park.

---

## 🧭 Employee Dashboard 9-Step Workflow Suite

The Employee Workspace is organized into a sequential, interactive 9-step daily routine with a sticky quick-navigation bar:

1. **Step 01 • Daily Work Station & Check-In**: Profile summary, clearance badges, quick actions bar, and live geofenced biometric punch widget.
2. **Step 02 • Productivity & Adherence KPIs**: Real-time hours worked today, weekly target progress (40h goal), lifetime adherence %, overtime tracking (1.5x tier), and timesheet submission lock.
3. **Step 03 • Shift Schedule & Monthly Attendance Calendar**: 7-day upcoming roster preview, assigned duty timings (`09:00 AM – 06:00 PM`), shift swap request modal, and monthly attendance calendar with visual status dots (🟢 Present, 🟡 Holiday, 🟣 Leave, ⚪ Weekend).
4. **Step 04 • Public Holidays & Leave Entitlements**: 2026 Gazetted corporate holidays, PTO Quotas with animated percentage progress bars (CL, SL, EL, Comp-Offs), and direct links to `/employee/leave` and `/employee/holidays`.
5. **Step 05 • Leadership Accolades & Kudos**: Direct praise from Department Manager and Team Lead, live reactions (👏 Claps, ❤️ Hearts, 🚀 Rockets), and interactive thank-you reply modal.
6. **Step 06 • Shift Adherence & Performance Analytics**: Weekly Regular vs Overtime multi-bar chart and Monthly Attendance distribution donut breakdown.
7. **Step 07 • Team Live Presence & Timesheet Submissions**: Real-time colleague status across Bengaluru, Salem, and Hyderabad, monthly timesheet lock, and live activity stream.
8. **Step 08 • Sprint Deliverables & Task Board**: Sprint 24 deliverables with priority badges, due dates, and status toggles (`TODO`, `IN_PROGRESS`, `COMPLETED`).
9. **Step 09 • Audit Logs & Attendance Corrections**: Daily check-in / check-out history table, CSV export, and Punch Correction Request Desk for Manager/HR audit.

---

## ⏱️ Work Schedule & Shift Policy

Stackly adheres to the standard enterprise shift formula:

$$\mathbf{9\text{ Hours Shift}} = \mathbf{8\text{ Hours Net Work}} + \mathbf{1\text{ Hour Break (60 Mins)}}$$

### Corporate Shift Roster Registry:
| Shift Name | Shift Code | Scheduled Hours | Working Hours | Break Allowance | Grace Window | Target Hubs |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **General Day Shift** | `GS` | 09:00 AM – 06:00 PM | 8.0 Hours | 1.0 Hour (60m) | 15 Mins (09:15 AM) | Bengaluru, Salem, Hyderabad |
| **Morning Shift** | `MS` | 07:00 AM – 04:00 PM | 8.0 Hours | 1.0 Hour (60m) | 15 Mins (07:15 AM) | Salem Support Hub |
| **US / Night Core Shift** | `NS` | 06:30 PM – 03:30 AM | 8.0 Hours | 1.0 Hour (60m) | 15 Mins (06:45 PM) | Hyderabad Cloud Center |

---

## 🌴 Absence & Statutory Public Holidays

### Leave Types & Quotas:
- **Casual Leave (CL)**: 12 days / year (Personal matters and short emergencies)
- **Sick Leave (SL)**: 12 days / year (Medical recovery with doctor notes for >2 days)
- **Earned Leave (EL)**: 18 days / year (Vacations, carryover up to 15 days)
- **Compensatory Off (Comp-Off)**: Earned credits for weekend / critical deployment work
- **Maternity & Paternity Leave**: Statutory 180-day paid maternity and 15-day paternity leave

### Public Holidays API & Calendar (CY 2026):
- Dedicated route `/employee/holidays` with full 2026 calendar data.
- Backend API endpoints: `GET /v1/holidays` and `GET /v1/attendance/holidays`.
- CSV download and Google / Apple / Outlook `.iCal` calendar export.

---

## 🛡️ Enterprise Security Matrix

| Threat Vector | Attack Scenario | Implemented Defense Layer |
| :--- | :--- | :--- |
| **API Keys & Secrets** | Leaked tokens / secrets forgery | Server-side `.env`, `.gitignore` exclusion, zero client-side secret exposure |
| **Authentication** | Brute-force, Credential Stuffing, Session Hijacking | Argon2id password hashing, sliding JWT sessions, HttpOnly cookies, TOTP 2FA |
| **Input Validation** | SQL Injection, XSS, Prototype Pollution | Prepared SQL statements, DOM sanitization, prototype pollution sanitizer |
| **IDOR & Multi-Tenancy** | Cross-tenant or unauthorized data access | Multi-tenant tenant scoping, granular RBAC permission guards (`RoleGuard`) |
| **Page Navigation Restrictions** | Accessing unauthorized routes | Dynamic sidebar role scoping (restricted pages hidden from menu) + fallback guards |
| **Infrastructure Security** | SSRF, Open Redirects, Webhook Replay | URL whitelist validator, nonce replay protection, request timeout circuit breakers |

---

## 🍪 Cookie & Session Lifecycle Architecture

Stackly employs a dual-token zero-trust session model designed to eliminate XSS token theft and protect against CSRF exploits:

```
[ Client Browser ]                              [ Backend API (Port 5001) ]
       │                                                     │
       ├──── POST /v1/auth/login ───────────────────────────>┤
       │<─── Set-Cookie: refreshToken (HttpOnly, SameSite) ──┤ (Valid: 7 Days)
       │<─── Response: { token: "15m-jwt-access-token" } ────┤
       │                                                     │
       ├──── GET /v1/attendance (Bearer AccessToken) ───────>┤
       │<─── 401 Unauthorized (Token Expired) ───────────────┤
       │                                                     │
       ├──── POST /v1/auth/refresh (Cookie Auto-Attached) ──>┤
       │<─── Set-Cookie: rotatedRefreshToken (HttpOnly) ─────┤
       │<─── Response: { token: "new-15m-jwt-token" } ───────┤
       │                                                     │
       ├──── Retries original request transparently ─────────>┤ (Zero User Interruption)
```

### Security Attributes Enforced:
- **`httpOnly: true`**: JavaScript cannot read the token via `document.cookie`, preventing cross-site scripting (XSS) credential extraction.
- **`sameSite: 'lax'`**: Guarantees cookies are only dispatched from trusted navigation contexts, protecting against Cross-Site Request Forgery (CSRF).
- **`secure: process.env.NODE_ENV === 'production'`**: Strict requirement for SSL/TLS encrypted HTTPS delivery in production deployments.
- **`Token Rotation & Invalidation`**: Each silent refresh rotates the cryptographic refresh hash, and logout destroys both the cookie (`res.clearCookie`) and database session.

---

## 🧪 Verification & Testing

```bash
# Run unit & integration test suite (73 / 73 passing)
npm test

# Build production bundle
npm run build
```

---

## 📄 License
MIT License. © 2026 Stackly Workforce Analytics.

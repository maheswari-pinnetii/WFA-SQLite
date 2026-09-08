# Project Overview - Stackly Workforce Analytics Platform

The **Stackly Workforce Analytics Platform** is an enterprise SaaS web application built for Fortune 500 organizations to monitor, analyze, and optimize human capital management, department productivity, shift attendance, and workforce performance across **500 verified employee records** (`EMP-001` through `EMP-500`) distributed across 3 tech hubs (Bengaluru: 250, Hyderabad: 150, Salem: 100).

---

## 🌟 Key Application Features

1. **Enterprise Fortune 500 Header**:
   - 72px fixed height header with glassmorphism backdrop blur.
   - Vector SVG STACKLY brand logo.
   - Global search bar with `Ctrl + K` keyboard shortcut and live suggestions dropdown.
   - Quick Actions menu (Add Employee, Generate Report, Schedule Meeting).
   - Theme Switcher (Light / Dark / System), Language Selector, and 8-item User Profile menu.
   - **Data-Driven Notification Bell**: Modern Lucide notification icon displaying real-time unread count, pulsing/bouncing strictly on arrival of new notifications and stopping upon review.

2. **Real-Time Information Bar**:
   - Current Date, live 12-hour Clock, Last Sync Time, **Active Users**, and **Online • 99.98% System Health** status with live WebSocket ping indicator.

3. **Multi-Role RBAC Security**:
   - 5 Granular Security Scopes:
     - `ADMIN`: System Administrator (full access to system settings, audit logs, and user security).
     - `HR`: HR Operations Manager (workforce directory, attendance monitoring, performance scorecards).
     - `MANAGER`: Department Manager (team capacity radar, approval queues, project velocity).
     - `TEAM_LEAD`: Team Lead (sprint matrix, task distribution, productivity scores).
     - `EMPLOYEE`: Employee Self Service (shift punch clock in/out, leave requests, personal profile).

4. **Modern Real-Time Status & Icon Experience**:
   - Powered by lightweight modern **Lucide Icons** (`lucide-react`) connected to real-time application and WebSocket state:
     - **Employee Status**: Live pulse indicator (`Online`), activity badge (`Working`), idle indicator (`Away`), and muted slash (`Offline`).
     - **Attendance**: Active check (`Check-In`), pause/coffee (`Break`), play indicator (`Resume`), completed square (`Check-Out`), and clock alert (`Late`).
     - **Leave & Absence**: Check badge (`Present`), calendar (`Leave`), user warning (`Absent`), clock (`Pending`), and double check (`Approved`).
     - **Geofencing**: Verified shield (`Inside Office`), alert triangle (`Outside Geofence`), and off indicator (`Location Unavailable`).
     - **Synchronization**: Rotating sync (`Syncing`), cloud check (`Synced`), and cloud pending (`Offline Actions Pending`).
     - **Dashboard KPIs**: Real-time live status indicator connected directly to SQLite analytical aggregates.

5. **8 Scorecard KPI Cards Grid**:
   - Total Headcount (`500 Staff`), Active Duty Rate, Attendance Rate, Annual Attrition, Monthly Payroll, Productivity Score, Open Vacancies, Audit Compliance.

6. **7 Recharts Visualizations**:
   - Workforce Trend (Line Chart), Department Overview (Bar Chart), Attendance Analytics (Area Chart), Employee Distribution (Pie Chart), Performance Analysis (Radar Chart), Salary Analytics (Bar Chart), Attrition (Donut Chart).

7. **500 Record Directory Table**:
   - Instant search across 500 employees with instant pagination controls (`10`, `25`, `50`, `100` rows per page), geographic location filters, and real-time status badges.

8. **Multiple Login & Sign Up Methods**:
   - Multi-step login flow: Step 1 (Company Email & Password) -> Step 2 (WebAuthn Passkey / Biometrics / TOTP MFA) -> Step 3 (Role Dashboard).
   - Dedicated side-by-side showcase at `/multiple-login-methods` (Email Login + Passwordless Biometric Passkey).
   - Default prefilled credentials: `admin@thestackly.com`, `hr@thestackly.com`, `manager@thestackly.com`, `teamlead@thestackly.com`, `employee@thestackly.com` / `StacklyWFA2026!`.
   - Strict `@thestackly.com` enterprise domain verification.
   - Enterprise SSO (Google Workspace, Microsoft Entra ID) and TOTP Authenticator 2FA.

8. **HR Payroll & Attendance Integration Hub (`/hr/payroll-reports`)**:
   - Dynamic payroll period selection (`September 2026`, etc.).
   - Interactive payroll calculation engine with animated computation progress.
   - Payable days, 160h regular vs 1.5x overtime hours, night shift differential allowance (+$50/shift), late penalty deductions, and unpaid LWP deductions.
   - Manual bonus & deduction adjustment modal with audit justification notes.
   - Sealed "Review & Lock" freeze mechanism and one-click CSV / JSON exports.
   - Historical integration run ledger with batch IDs and authorized signatories.

9. **Absence & Leave Management Hub (`/hr/leave`)**:
   - Multi-tab management: Requests Inbox, Employee Balances, Team Coverage Calendar, Holiday Calendar, and Policy Configurations.
   - Direct cross-linking between Leave Hub and Payroll Compensation Hub.

10. **Enterprise Security Hardening & Zero-Trust Architecture**:
    - **Strict Schema Validation**: Zod schemas enforcing strict property whitelisting (`.strict()`), corporate email domain boundaries (`@thestackly.com`), employee ID regexes (`STK-YYYY-NNNN`), and bounded geolocations.
    - **Tiered Rate Limiting & Exponential Backoff**: Per-IP and per-account rate limiters with dynamic backoff up to 30 minutes, supported by a self-healing SQLite store.
    - **Binary Magic-Number File Uploads**: Deep byte inspection for avatars and documentation preventing executable payload masquerading.
    - **Safe Error Handling**: Abstracted client error messaging suppressing database schema details, file paths, and internal stack traces.

11. **Modernized Employee Self-Service Workspace (`/employee/dashboard`)**:
    - Clean executive layout without clutter or step indicators.
    - Direct in-header interactive notification bell and popover with unread counters and live system alert previews.

12. **End-to-End Playwright & Multi-Tier Vitest Suite**:
    - Dedicated `playwright/` directory containing Page Object Models (`LoginPage`, `DashboardPage`), custom test fixtures, and automated Chromium test suites.
    - Modular Vitest suites partitioned into `tests/unit/`, `tests/integration/`, `tests/security/`, and `tests/load/`.


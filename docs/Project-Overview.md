# Project Overview - Stackly Workforce Analytics Platform

The **Stackly Workforce Analytics Platform** is a enterprise SaaS web application built for Fortune 500 organizations to monitor, analyze, and optimize human capital management, department productivity, shift attendance, and workforce performance across 10,000+ employee records.

---

## 🌟 Key Application Features

1. **Enterprise Fortune 500 Header**:
   - 72px fixed height header with glassmorphism backdrop blur.
   - Vector SVG STACKLY brand logo.
   - Global search bar with `Ctrl + K` keyboard shortcut and live suggestions dropdown.
   - Quick Actions menu (Add Employee, Generate Report, Schedule Meeting).
   - Theme Switcher (Light / Dark / System), Language Selector, and 8-item User Profile menu.

2. **Real-Time Information Bar**:
   - Current Date, live 12-hour Clock, Last Sync Time, **1,180 Active Users**, and **Online • 99.98% System Health** status.

3. **Multi-Role RBAC Security**:
   - 5 Granular Security Scopes:
     - `ADMIN`: System Administrator (full access to system settings, audit logs, and user security).
     - `HR`: HR Operations Manager (workforce directory, attendance monitoring, performance scorecards).
     - `TEAM_MANAGER`: Department Manager (team capacity radar, approval queues, project velocity).
     - `TEAM_LEAD`: Team Lead (sprint matrix, task distribution, productivity scores).
     - `EMPLOYEE`: Employee Self Service (shift punch clock in/out, leave requests, personal profile).

4. **8 Scorecard KPI Cards Grid**:
   - Total Employees (`10,000`), Active Workforce (`9,450 / 94.5%`), Attendance Rate (`98.2%`), Productivity Score (`94.2/100`), Employee Satisfaction (`95.2 eNPS`), Open Requests (`142 Pending`), Performance Rating (`4.8/5.0`), Attrition Risk (`1.2% Low`).

5. **7 Recharts Visualizations**:
   - Workforce Trend (Line Chart), Department Overview (Bar Chart), Attendance Analytics (Area Chart), Employee Distribution (Pie Chart), Performance Analysis (Radar Chart), Salary Analytics (Bar Chart), Attrition (Donut Chart).

6. **10,000 Record Directory Table**:
   - Instant search across 10,000 employees with instant pagination controls (`10`, `25`, `50`, `100` rows per page).

7. **Multiple Login & Sign Up Methods**:
   - Multi-step login flow: Step 1 (Company Email & Password) -> Step 2 (WebAuthn Passkey / Biometrics) -> Step 3 (Role Dashboard).
   - Dedicated side-by-side showcase at `/multiple-login-methods` (Email Login + Passwordless Biometric Passkey).
   - Default prefilled credentials: `admin@thestackly.com` / `StacklyWFA2026!` with instant role selector chips (Admin, HR, Manager, Employee).
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


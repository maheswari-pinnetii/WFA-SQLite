# 01. Project Overview

## Product Name
**Stackly Workforce Management Application (WFA-SQLite)**

## Purpose
An enterprise-grade, high-concurrency workforce management platform designed to streamline employee lifecycle management, geofenced biometric attendance tracking, leave and roster scheduling, automated payroll engine processing, and organizational analytics.

## Business Problem
Legacy workforce management platforms suffer from fragmented systems, lack of concurrency in local database engines, complex role-based visibility gaps, and poor user experiences for multi-location operational hubs (e.g., Bengaluru, Salem, Hyderabad). WFA-SQLite provides a consolidated, fast, and secure workforce hub powered by SQLite in Write-Ahead Logging (WAL) mode.

## Target Users & Product Roles
1. **ADMIN**: Full system administration, global configuration, audit oversight, and company-wide management.
2. **HR**: Human resources operations, employee onboarding/offboarding, payroll run execution, leave policy control.
3. **MANAGER**: Department-level leadership, team attendance approval, leave requests authorization, shift planning.
4. **TEAM_LEAD**: Operational team leads, shift rosters execution, daily punch tracking, timesheet verification.
5. **EMPLOYEE**: Self-service user, biometric punch clocking, leave balance view, payslip downloads, ticket creation.

## Scope of Application
* **Employee Management**: Comprehensive HRMS directory, designations, departments, teams, lifecycle events.
* **Attendance & Geofencing**: GPS geofenced clock-in/clock-out, break sessions, attendance correction workflows.
* **Leave Management**: Accrual rules, leave requests, manager approvals, carry-forward handling.
* **Payroll Engine**: Salary structure configuration, CTC breakdown, TDS/PF/ESI calculations, payslip PDF generation.
* **Shifts & Rosters**: Shift definition, employee shift assignments, roster swaps.
* **Expenses & Timesheets**: Expense claim submissions, project timesheet tracking.
* **HR Service Desk & Documents**: Employee document storage, HR service ticket management.
* **Analytics & Dashboards**: Role-tailored dashboards featuring 8 KPI cards per role (40 total KPIs).

## Current Status
System is actively implemented with 37 database migrations, full Express TypeScript API layer, React 18 frontend, and robust security middleware.

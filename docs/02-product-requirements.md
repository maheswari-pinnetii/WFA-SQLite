# 02. Product Requirements

## Metadata
* **Version**: 1.0.0
* **Status**: Approved / Production Target
* **Database Target**: SQLite (WAL Mode)

## Product Overview & Problem Statement
Organizations require a single point of truth for workforce operations that guarantees strict data isolation, compliant financial calculations, and instant real-time visibility across all levels of authority.

## Goals & Objectives
* Provide 5 role-tailored dashboards (`ADMIN`, `HR`, `MANAGER`, `TEAM_LEAD`, `EMPLOYEE`), each featuring exactly **8 KPI cards** (40 KPIs total).
* Support scalable management of up to 1000 active employees (`STK-26-1000` format) with server-side pagination.
* Ensure accurate geofenced attendance tracking within corporate hub radiuses (500m threshold).
* Process complex payroll runs with salary components (Basic, HRA, Special Allowance, PF, ESI, TDS, PT, LOP).

## Functional Requirements
1. **Authentication & Security**: Multi-Factor Authentication (MFA), Passkey WebAuthn, JWT refresh tokens, rate limiting.
2. **Attendance & Geofencing**: Real-time punch in/out with GPS validation and break session logging.
3. **Leave Engine**: Multi-level approval flow, leave type entitlement rules, regularization requests.
4. **Payroll & Compensation**: CTC structures, statutory deductions, lock/unlock payroll runs, YTD summary, payslip generation.
5. **Rosters & Shifts**: Shift scheduling, roster overrides, shift swap requests.
6. **Self-Service & HR Desk**: Document storage, service request ticketing, personal attendance timeline.

## Non-Functional Requirements
* **Performance**: Sub-100ms API response time for cached metrics, server-side pagination for datasets > 50 items.
* **Database Concurrency**: SQLite with Write-Ahead Logging (WAL), `PRAGMA foreign_keys = ON;`, `busy_timeout = 10000ms`.
* **Security & Compliance**: Role-Based Access Control (RBAC), Attribute-Based Access Control (ABAC), tenant isolation, strict audit logging.

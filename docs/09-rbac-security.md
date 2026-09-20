# 09. RBAC & Security

## Role-Based Access Control (RBAC) & Scoping

The system enforces strict multi-tenant and role hierarchy scoping:

1. **ADMIN**:
   - Access: Full System (`company_id` wide).
   - Permissions: All endpoints, audit logs, system configuration, database backup/restore.
2. **HR**:
   - Access: Company HR Scope (`company_id` wide).
   - Permissions: Employee directory management, onboarding/offboarding, payroll run execution, leave policies.
3. **MANAGER**:
   - Access: Department Scoped (`department_id`).
   - Permissions: Department employee oversight, leave approvals, attendance corrections review.
4. **TEAM_LEAD**:
   - Access: Team Scoped (`team_id`).
   - Permissions: Team roster execution, daily punch tracking, timesheet approval.
5. **EMPLOYEE**:
   - Access: Self Scoped (`employee_id`).
   - Permissions: Biometric clocking, leave application, payslip download, ticket submission.

## Security Controls
* **Authentication**: JWT token signed with secret + short TTL, Passkey WebAuthn, TOTP MFA.
* **Database Isolation**: All SQL queries enforce `WHERE company_id = ?` and role-specific scope constraints.
* **Input Protection**: Zod schema validation on body/params/query. Parameterized SQL queries via `better-sqlite3`.

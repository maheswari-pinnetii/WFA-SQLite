# 07. Database Architecture

## SQLite Configuration & Pragmas
SQLite is the authoritative application database.

```sql
PRAGMA journal_mode = WAL;
PRAGMA busy_timeout = 10000;
PRAGMA foreign_keys = ON;
PRAGMA synchronous = NORMAL;
```

## Schema Overview & Migration History (37 Migrations)
* **Core & Security**: `companies` (001), `users` (002), `roles` (003), `permissions` (004), `refresh_tokens` (012), `mfa` (013), `audit_logs` (015), `idempotency_keys` (016).
* **Organization & HRMS**: `departments` (005), `teams` (006), `employees` (007, 023), `designations` (022).
* **Attendance & Geofencing**: `attendance_records` (008, 032), `break_sessions` (009), `attendance_events` (010), `attendance_corrections` (011), `regularization_requests` (031).
* **Work Schedules & Leaves**: `shifts` (026), `employee_shifts` (027), `leave_types` (028), `leave_balances` (029), `leave_requests` (030), `holidays` (024), `work_configs` (025).
* **Payroll Domain**: `payroll_structures` (022), `payslips` (022), `payroll_runs` (033).
* **Performance Indexing**: `021_add_indexes_and_constraints.sql` creates index strategies on `employee_id`, `company_id`, `created_at`, `status`, and `date`.

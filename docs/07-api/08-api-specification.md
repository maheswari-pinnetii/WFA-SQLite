# 08. API Specification

## Key Endpoint Taxonomy

### 1. Auth Endpoint Suite (`/api/auth`)
* `POST /api/auth/login`: Authenticate with email/password; returns JWT + Refresh Token.
* `POST /api/auth/mfa/verify`: Verify 6-digit TOTP token.
* `POST /api/auth/passkey/verify`: WebAuthn Passkey biometric validation.
* `POST /api/auth/refresh`: Refresh expired JWT.

### 2. Employee Management (`/api/employees`)
* `GET /api/employees`: Paginated employee directory (`page`, `limit`, `search`, `department_id`).
* `POST /api/employees`: Create new employee record (`STK-26-XXXX`).
* `GET /api/employees/:id`: Retrieve full profile with assigned shift & department.

### 3. Attendance & Geofencing (`/api/attendance`)
* `POST /api/attendance/punch-in`: Geofence validated clock-in (`latitude`, `longitude`).
* `POST /api/attendance/punch-out`: Geofence validated clock-out.
* `POST /api/attendance/break/start` & `end`: Log employee break sessions.

### 4. Role Dashboards Suite (`/api/dashboards`)
* `GET /api/dashboards/admin`: 8 KPI cards + global system analytics.
* `GET /api/dashboards/hr`: 8 KPI cards + HR compliance metrics.
* `GET /api/dashboards/manager`: 8 KPI cards + department attendance & leave metrics.
* `GET /api/dashboards/team-lead`: 8 KPI cards + team roster & timesheet status.
* `GET /api/dashboards/employee`: 8 KPI cards + personal hours & leave balances.

### 5. Payroll Suite (`/api/payroll`)
* `GET /api/payroll/structures`: Fetch CTC salary component breakdown.
* `POST /api/payroll/run`: Trigger monthly payroll execution.
* `GET /api/payroll/payslip/:id`: Fetch payslip breakdown & download PDF.

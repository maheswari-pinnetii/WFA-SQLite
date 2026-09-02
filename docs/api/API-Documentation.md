# API Overview - Stackly Workforce Analytics Platform

This directory contains endpoint specifications for the SQLite-backed enterprise API services powering the **Stackly Workforce Analytics Platform**.

---

## 📮 Postman Collection & Automated API Testing

The project includes an end-to-end Postman testing suite with automatic JWT token injection and assertions:

- 📦 **Postman Collection**: [`postman/WFA_Workforce_Analytics.postman_collection.json`](file:///c:/Users/91970/Downloads/WFA-SQLite/postman/WFA_Workforce_Analytics.postman_collection.json)
- ⚙️ **Postman Environment**: [`postman/WFA_Local.postman_environment.json`](file:///c:/Users/91970/Downloads/WFA-SQLite/postman/WFA_Local.postman_environment.json)
- 📖 **Postman Step-by-Step Guide**: [`docs/api/POSTMAN_TESTING_GUIDE.md`](file:///c:/Users/91970/Downloads/WFA-SQLite/docs/api/POSTMAN_TESTING_GUIDE.md)

---

## 🌐 Endpoints Directory

### 1. Authentication & MFA
- `POST /v1/auth/login`: Authenticate with email/password, returns token or MFA challenge.
- `POST /v1/auth/mfa/verify`: Verify 6-digit email or TOTP OTP code.
- `GET /v1/auth/me`: Get profile of authenticated user.
- `POST /v1/auth/refresh`: Rotate refresh token and issue new access token.
- `GET /v1/auth/mfa/totp/status`: Get user's Google Authenticator status.
- `POST /v1/auth/logout`: Revoke session and logout.

### 2. Geofenced Attendance & Time Clock
- `GET /v1/attendance/today`: Active punch record for today.
- `POST /v1/attendance/check-in`: Geofenced morning check-in (`12.9716, 77.5946`).
- `POST /v1/attendance/break`: Start lunch/coffee break.
- `POST /v1/attendance/resume`: Resume active shift from break.
- `POST /v1/attendance/check-out`: Evening punch-out with overtime calculation.
- `GET /v1/attendance/records`: Scoped attendance history logs.
- `GET /v1/attendance/shifts`: Standard shift schedules (Day, Flexible, Night).
- `GET /v1/attendance/holidays`: 2026 gazetted public holidays.
- `GET /v1/attendance/audit-logs`: Immutable telemetry event logs.

### 3. Attendance Corrections
- `POST /v1/attendance/corrections`: Submit punch adjustment request.
- `GET /v1/attendance/corrections`: List correction requests.
- `PUT /v1/attendance/corrections/:id`: Manager/HR approve or reject correction.

### 4. Leave & Absence Management
- `GET /v1/leave-requests`: List leave applications.
- `POST /v1/leave-requests`: Apply for Casual, Sick, or Earned Leave.
- `PUT /v1/leave-requests/:id`: Review and approve/reject leave.

### 5. Sprint & Tasks Backlog
- `GET /v1/tasks`: Get sprint deliverables.
- `PUT /v1/tasks/:id`: Update task status (`TODO`, `IN_PROGRESS`, `BLOCKED`, `COMPLETED`).

### 6. Corporate Directory & RBAC
- `GET /v1/employees`: 500-employee directory with filters & pagination.
- `GET /v1/employees/:id`: Individual employee detail.
- `GET /v1/departments`: Corporate departments list.
- `GET /v1/teams`: Teams directory.
- `GET /v1/locations`: Geofenced corporate hubs (Bengaluru, Salem, Hyderabad).

### 7. Analytics & Intelligence
- `GET /v1/analytics`: Comprehensive KPIs, hiring rates, and skill matrices.
- `GET /v1/dashboard/headcount`: Headcount distribution.
- `GET /v1/dashboard/risk`: Flight risk & retention metrics.
- `GET /v1/analytics/attendance-trend`: Historical adherence trend.

### 8. System & Health Probes
- `GET /v1/health`: Liveness & health probe (`{"status": "healthy"}`).
- `GET /v1`: Root API welcome.

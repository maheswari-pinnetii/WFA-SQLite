# 06. Backend Architecture

## Express Architecture & Request Flow

```
HTTP Request -> Rate Limiter -> Security Headers -> Auth Middleware -> RBAC Middleware -> Zod Validation -> Controller -> Service -> Repository -> SQLite DB
```

### Key Subsystems
1. **Controllers (`backend/src/controllers`)**:
   - `auth.controller.ts`: Authentication, passkey handles, token refresh.
   - `employee.controller.ts`: HR directory CRUD and lifecycle state machine.
   - `attendance.controller.ts`: Punch processing, geofence radius check, break handling.
   - `payroll.controller.ts`: CTC structure setup, payroll run calculation, payslip rendering.
   - Dashboard Controllers (`admin-dashboard`, `hr-dashboard`, `manager-dashboard`, `team-lead-dashboard`, `employee-dashboard`): Analytics aggregation.
2. **Middleware (`backend/src/middleware`)**:
   - `auth.ts`: JWT signature & expiration verification.
   - `rbac.ts` & `abac.ts`: Role-based (`ADMIN`, `HR`, `MANAGER`, `TEAM_LEAD`, `EMPLOYEE`) and attribute-based department scoping.
   - `validateInput.ts`: Zod schema validator interceptor.
   - `idempotency.ts`: Idempotency key validator for financial operations.
3. **Database Layer (`backend/src/database`)**:
   - Connection wrapper utilizing `better-sqlite3`.
   - Explicit transaction support (`db.transaction(...)`).

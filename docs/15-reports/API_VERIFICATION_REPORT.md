# STACKLY WFA-SQLITE — API VERIFICATION REPORT

> **Document Version**: 1.0  
> **Repository**: `maheswari-pinnetii/WFA-SQLite`  
> **Last Updated**: September 2026

---

## REST API Endpoint Audit Table

| HTTP Method | Canonical Endpoint Path | Controller Handler | RBAC Role Required | Input Validation Schema | Response Format | Status |
| :-: | :--- | :--- | :--- | :--- | :--- | :-: |
| `GET` | `/health` | `app.get('/health')` | Anonymous | None | `{ success: true, service: 'wfa-backend', status: 'UP' }` | **PASS** |
| `GET` | `/ready` | `app.get('/ready')` | Anonymous | None | `{ status: 'UP', timestamp: ... }` | **PASS** |
| `GET` | `/live` | `app.get('/live')` | Anonymous | None | `{ status: 'UP', timestamp: ... }` | **PASS** |
| `POST` | `/api/v1/auth/login` | `authController.login` | Anonymous | `zod.loginSchema` | `{ success: true, token, user }` | **PASS** |
| `POST` | `/api/v1/auth/biometric/login` | `authController.biometricLogin` | Anonymous | `zod.biometricLoginSchema` | `{ success: true, token, user }` | **PASS** |
| `GET` | `/api/v1/employees` | `employeeController.getEmployees` | All Roles | `zod.paginationSchema` | `{ success: true, data: [...], pagination }` | **PASS** |
| `GET` | `/api/v1/employees/:id/profile` | `employeeController.getEmployeeProfile` | All Roles | Ownership / Role | `{ success: true, data: profile }` | **PASS** |
| `POST` | `/api/v1/attendance/punch` | `attendanceController.recordPunch` | All Roles | Geofence Schema | `{ success: true, record }` | **PASS** |
| `POST` | `/api/v1/leave/request` | `workforceController.submitLeave` | All Roles | Leave Schema | `{ success: true, request }` | **PASS** |
| `POST` | `/api/v1/payroll/runs` | `payrollController.createPayrollRun` | HR / Admin | Payroll Schema | `{ success: true, run }` | **PASS** |
| `POST` | `/api/v1/payroll/runs/:id/nach` | `nachGeneratorService.generateNachFile` | HR / Admin | Run ID Params | Text File Stream | **PASS** |
| `POST` | `/api/v1/workflow/requests/:id/action` | `workflowService.takeAction` | Manager / HR | Action Schema | `{ success: true, status }` | **PASS** |
| `GET` | `/api/v1/reports/export` | `reportController.exportReport` | Manager / HR | Export Schema | Streaming CSV / PDF | **PASS** |
| `GET` | `/api/v1/audit-logs` | `auditController.getLogs` | Admin / HR | Query Schema | `{ success: true, logs }` | **PASS** |

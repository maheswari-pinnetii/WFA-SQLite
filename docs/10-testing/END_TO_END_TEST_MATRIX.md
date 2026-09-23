# STACKLY WFA-SQLITE — END-TO-END TEST MATRIX

> **Document Version**: 1.0  
> **Repository**: `maheswari-pinnetii/WFA-SQLite`  
> **Last Updated**: September 2026

---

## End-to-End Layer Flow Matrix

```text
UI → API → Auth → RBAC → Controller → Service → DB → Transaction → Audit → Response → UI State
```

| Workflow ID | Workflow Name | UI Component | REST Endpoint | Controller & Service Layer | SQLite DB Table | Auth & RBAC | Status | Evidence |
| :-: | :--- | :--- | :--- | :--- | :--- | :-: | :-: | :--- |
| **E2E-001** | Employee Biometric Login | [`PasswordlessLoginCard.tsx`](file:///c:/Users/91970/Downloads/WFA-SQLite/frontend/src/auth/PasswordlessLoginCard.tsx) | `POST /api/auth/biometric/login` | `authController.biometricLogin` | `users`, `trusted_devices` | Anonymous / WebAuthn | **PASS** | [`trusted-devices.test.tsx`](file:///c:/Users/91970/Downloads/WFA-SQLite/tests/unit/trusted-devices.test.tsx) |
| **E2E-002** | Geofenced Attendance Punch | [`MyAttendance.tsx`](file:///c:/Users/91970/Downloads/WFA-SQLite/frontend/src/features/employee/attendance/MyAttendance.tsx) | `POST /api/attendance/punch` | `attendanceController.recordPunch` | `attendancerecords`, `attendance_punches` | All Roles | **PASS** | [`attendance.controller.ts`](file:///c:/Users/91970/Downloads/WFA-SQLite/backend/src/controllers/attendance.controller.ts) |
| **E2E-003** | Leave Request & Accrual Check | [`AbsenceManagementPage.tsx`](file:///c:/Users/91970/Downloads/WFA-SQLite/frontend/src/features/employee/absence/AbsenceManagementPage.tsx) | `POST /api/leave/request` | `workforceController.submitLeave` | `leaverequests`, `leave_accruals` | All Roles | **PASS** | [`workforce.controller.ts`](file:///c:/Users/91970/Downloads/WFA-SQLite/backend/src/controllers/workforce.controller.ts) |
| **E2E-004** | Out-of-Office Proxy Approval | [`ApprovalsPage.tsx`](file:///c:/Users/91970/Downloads/WFA-SQLite/frontend/src/features/team-manager/ApprovalsPage.tsx) | `POST /api/workflow/requests/:id/action` | `workflowService.takeAction` | `approval_requests`, `approval_delegations` | Manager / HR | **PASS** | [`workflow.service.ts`](file:///c:/Users/91970/Downloads/WFA-SQLite/backend/src/services/workflow.service.ts) |
| **E2E-005** | Expense Claim Submission | [`MyExpensesPage.tsx`](file:///c:/Users/91970/Downloads/WFA-SQLite/frontend/src/features/employee/expenses/MyExpensesPage.tsx) | `POST /api/expenses` | `expenseController.createClaim` | `expense_claims` | All Roles | **PASS** | [`expense.controller.ts`](file:///c:/Users/91970/Downloads/WFA-SQLite/backend/src/controllers/expense.controller.ts) |
| **E2E-006** | Payroll Run & NACH File Export | [`PayrollRunDetailsPage.tsx`](file:///c:/Users/91970/Downloads/WFA-SQLite/frontend/src/features/hr/payroll/PayrollRunDetailsPage.tsx) | `POST /api/payroll/runs/:id/nach` | `nachGeneratorService.generateNachFile` | `payroll_runs`, `payroll_run_employees` | HR / Admin | **PASS** | [`nach-generator.service.ts`](file:///c:/Users/91970/Downloads/WFA-SQLite/backend/src/services/nach-generator.service.ts) |
| **E2E-007** | Employee Offboarding & F&F | [`FullFinalSettlementPage.tsx`](file:///c:/Users/91970/Downloads/WFA-SQLite/frontend/src/features/hr/FullFinalSettlementPage.tsx) | `POST /api/employees/:id/offboard` | `FullFinalSettlementService` | `full_and_final_settlements` | HR / Admin | **PASS** | [`full-final-settlement.service.ts`](file:///c:/Users/91970/Downloads/WFA-SQLite/backend/src/services/full-final-settlement.service.ts) |
| **E2E-008** | Real-Time Notifications | [`EnterpriseHeader.tsx`](file:///c:/Users/91970/Downloads/WFA-SQLite/frontend/src/components/layout/EnterpriseHeader.tsx) | Socket.IO WebSocket | `socketEmitter.emitToUser` | `notifications` | All Roles | **PASS** | [`socketEmitter.ts`](file:///c:/Users/91970/Downloads/WFA-SQLite/backend/src/sockets/socketEmitter.ts) |
| **E2E-009** | Report CSV Streaming | [`TeamReports.tsx`](file:///c:/Users/91970/Downloads/WFA-SQLite/frontend/src/features/reports/TeamReports.tsx) | `GET /api/reports/export` | `reportController.exportReport` | Streaming Query | Manager / HR | **PASS** | [`report.controller.ts`](file:///c:/Users/91970/Downloads/WFA-SQLite/backend/src/controllers/report.controller.ts) |
| **E2E-010** | Security Audit Event Logging | [`AuditLogsPage.tsx`](file:///c:/Users/91970/Downloads/WFA-SQLite/frontend/src/features/admin/AuditLogsPage.tsx) | `GET /api/audit-logs` | `auditController.getLogs` | `audit_logs` | Admin / HR | **PASS** | [`audit.controller.ts`](file:///c:/Users/91970/Downloads/WFA-SQLite/backend/src/controllers/audit.controller.ts) |

# STACKLY WFA-SQLITE — FINAL SECURITY GAP REGISTER

> **Document Status**: Authoritative Security Audit & Threat Model Register  
> **Repository**: `maheswari-pinnetii/WFA-SQLite`  
> **Last Updated**: September 2026

---

## Security Audit Findings

| Finding ID | Endpoint / Component | Attack Scenario | Affected Role | Scope | Impact | Evidence Codebase Path | Severity | Remediation | Regression Test |
| :-: | :--- | :--- | :---: | :---: | :---: | :--- | :-: | :--- | :--- |
| **SEC-001** | `POST /api/employees` | Parameter Tampering (Role Escalation) | Employee / Manager | Global | Attacker passes `role: 'ADMIN'` during self-registration or profile update. | [`employee.controller.ts`](file:///c:/Users/91970/Downloads/WFA-SQLite/backend/src/controllers/employee.controller.ts#L45) | **High** | Sanitized `role` parameter; non-admin users cannot mutate role field. | `tests/security/role-escalation.test.ts` |
| **SEC-002** | `GET /api/employees/:id/payslips` | IDOR / Direct Object Reference | Employee | Organization | Employee alters `:id` to fetch another employee's payslip PDF. | [`payroll.controller.ts`](file:///c:/Users/91970/Downloads/WFA-SQLite/backend/src/controllers/payroll.controller.ts#L80) | **High** | Added ownership check: `req.user.id === targetId || req.user.role IN ('ADMIN', 'HR')`. | `tests/security/idor-payslip.test.ts` |
| **SEC-003** | `POST /api/auth/login` | Brute Force Password Cracking | Unauthenticated | Global | Automated bot attempts credential stuffing against login endpoint. | [`authController.ts`](file:///c:/Users/91970/Downloads/WFA-SQLite/backend/src/controllers/authController.ts#L25) | **Medium** | Enforced Express rate limiter (`authLimiter`: 5 max attempts per 15 min per IP) and account lock. | `tests/security/rate-limit.test.ts` |
| **SEC-004** | `GET /api/audit-logs` | Information Disclosure (PII) | Manager / Team Lead | Department | Unauthorized role attempts to query global audit logs containing SSN / Tax PII. | [`audit.controller.ts`](file:///c:/Users/91970/Downloads/WFA-SQLite/backend/src/controllers/audit.controller.ts#L10) | **Medium** | Restricted audit log access exclusively to `ADMIN` and `HR` roles with scope filtering. | `tests/security/audit-rbac.test.ts` |
| **SEC-005** | `POST /api/documents/upload` | Malicious File Upload | All Authenticated | User | User uploads executable/script file as an employee HR document attachment. | [`employee.controller.ts`](file:///c:/Users/91970/Downloads/WFA-SQLite/backend/src/controllers/employee.controller.ts#L190) | **Medium** | Configured Multer MIME-type whitelist (`.pdf`, `.png`, `.jpg`, `.jpeg`, `.docx`) and 10MB limit. | `tests/security/file-upload.test.ts` |
| **SEC-006** | `GET /api/reports/export` | Sensitive Data Leak via Export | Manager | Team | Manager attempts CSV export of salary details for employees outside their department. | [`report.controller.ts`](file:///c:/Users/91970/Downloads/WFA-SQLite/backend/src/controllers/report.controller.ts#L50) | **Medium** | Applied department/team SQL scope filtering to streaming export streams. | `tests/security/export-scope.test.ts` |

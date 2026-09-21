# API Reference

| Field | Value |
|-------|-------|
| Document ID | API-001 |
| Version | 1.0 |
| Status | Active |
| Author | Maheswari Pinneti |
| Owner | Engineering |
| Created | 21 September 2026 |
| Last Updated | 21 September 2026 |
| Target Release | Not specified |
| Related Documents | Not specified |

---

## 1. Endpoints
| HTTP Method | Path | Roles |
|-------------|------|-------|
| `GET` | `/health` | Public/Authenticated |
| `GET` | `/health/db` | Public/Authenticated |
| `POST` | `/auth/login` | Public/Authenticated |
| `POST` | `/auth/register` | Public/Authenticated |
| `GET` | `/auth/sso/google` | Public/Authenticated |
| `GET` | `/auth/sso/microsoft` | Public/Authenticated |
| `POST` | `/auth/sso/callback` | Public/Authenticated |
| `POST` | `/auth/mfa/verify` | Public/Authenticated |
| `POST` | `/auth/mfa/resend` | Public/Authenticated |
| `POST` | `/auth/logout` | Public/Authenticated |
| `POST` | `/auth/logout-all` | Public/Authenticated |
| `GET` | `/auth/sessions` | Public/Authenticated |
| `DELETE` | `/auth/sessions/:sessionId` | Public/Authenticated |
| `GET` | `/auth/me` | Public/Authenticated |
| `POST` | `/auth/refresh` | Public/Authenticated |
| `POST` | `/auth/admin/unlock` | ADMIN |
| `POST` | `/auth/forgot-password` | Public/Authenticated |
| `POST` | `/auth/reset-password` | Public/Authenticated |
| `POST` | `/auth/change-password` | Public/Authenticated |
| `POST` | `/auth/send-verification` | Public/Authenticated |
| `POST` | `/auth/verify-email` | Public/Authenticated |
| `GET` | `/auth/mfa/totp/status` | Public/Authenticated |
| `POST` | `/auth/mfa/totp/enroll` | Public/Authenticated |
| `POST` | `/auth/mfa/totp/enroll/verify` | Public/Authenticated |
| `POST` | `/auth/mfa/totp/disable` | Public/Authenticated |
| `POST` | `/auth/mfa/totp/recovery-codes/regenerate` | Public/Authenticated |
| `POST` | `/auth/passkey/register-options` | Public/Authenticated |
| `POST` | `/auth/passkey/register-verify` | Public/Authenticated |
| `POST` | `/auth/passkey/login-options` | Public/Authenticated |
| `POST` | `/auth/passkey/login-verify` | Public/Authenticated |
| `POST` | `/auth/biometric/login` | Public/Authenticated |
| `POST` | `/auth/lock/login` | Public/Authenticated |
| `POST` | `/auth/trusted-devices` | Public/Authenticated |
| `GET` | `/auth/trusted-devices` | Public/Authenticated |
| `POST` | `/auth/trusted-devices/verify` | Public/Authenticated |
| `DELETE` | `/auth/trusted-devices/:id` | Public/Authenticated |
| `GET` | `/admin/mfa/users` | ADMIN |
| `POST` | `/admin/mfa/users/:userId/reset` | ADMIN |
| `POST` | `/uploads/avatar` | Public/Authenticated |
| `POST` | `/uploads/document` | Public/Authenticated |
| `GET` | `/employees` | Public/Authenticated |
| `POST` | `/employees/bulk-update` | ADMIN, HR |
| `GET` | `/employees/:id/export-data` | Public/Authenticated |
| `POST` | `/employees/:id/anonymize-data` | ADMIN |
| `PUT` | `/employees/:id/status` | ADMIN, HR |
| `GET` | `/employees/:id` | Public/Authenticated |
| `POST` | `/employees` | ADMIN, HR |
| `PUT` | `/employees/:id` | EMPLOYEE_UPDATE, EMPLOYEE_MANAGE |
| `DELETE` | `/employees/:id` | ADMIN, HR |
| `GET` | `/employees/:id/profile` | Public/Authenticated |
| `GET` | `/employees/:id/bank-details` | Public/Authenticated |
| `PUT` | `/employees/:id/bank-details` | ADMIN, HR |
| `GET` | `/employees/:id/tax-info` | Public/Authenticated |
| `PUT` | `/employees/:id/tax-info` | ADMIN, HR |
| `GET` | `/employees/:id/emergency-contacts` | Public/Authenticated |
| `POST` | `/employees/:id/emergency-contacts` | Public/Authenticated |
| `PUT` | `/employees/:id/emergency-contacts/:contactId` | Public/Authenticated |
| `DELETE` | `/employees/:id/emergency-contacts/:contactId` | Public/Authenticated |
| `GET` | `/employees/:id/skills` | Public/Authenticated |
| `POST` | `/employees/:id/skills` | Public/Authenticated |
| `PUT` | `/employees/:id/skills/:skillId` | Public/Authenticated |
| `DELETE` | `/employees/:id/skills/:skillId` | Public/Authenticated |
| `GET` | `/employees/:id/education` | Public/Authenticated |
| `POST` | `/employees/:id/education` | Public/Authenticated |
| `PUT` | `/employees/:id/education/:eduId` | Public/Authenticated |
| `DELETE` | `/employees/:id/education/:eduId` | Public/Authenticated |
| `GET` | `/employees/:id/experience` | Public/Authenticated |
| `POST` | `/employees/:id/experience` | Public/Authenticated |
| `PUT` | `/employees/:id/experience/:expId` | Public/Authenticated |
| `DELETE` | `/employees/:id/experience/:expId` | Public/Authenticated |
| `GET` | `/teams` | Public/Authenticated |
| `GET` | `/teams/:id/members` | Public/Authenticated |
| `GET` | `/departments` | Public/Authenticated |
| `POST` | `/departments` | ADMIN, HR |
| `GET` | `/organizations` | Public/Authenticated |
| `GET` | `/roles` | Public/Authenticated |
| `GET` | `/permissions` | Public/Authenticated |
| `GET` | `/job-families` | Public/Authenticated |
| `GET` | `/job-roles` | Public/Authenticated |
| `GET` | `/analytics/job-roles` | Public/Authenticated |
| `GET` | `/locations` | Public/Authenticated |
| `GET` | `/locations/:id` | Public/Authenticated |
| `POST` | `/locations` | ADMIN, HR |
| `PUT` | `/locations/:id` | ADMIN, HR |
| `DELETE` | `/locations/:id` | ADMIN |
| `GET` | `/designations` | Public/Authenticated |
| `POST` | `/designations` | ADMIN, HR |
| `PUT` | `/designations/:id` | ADMIN, HR |
| `DELETE` | `/designations/:id` | ADMIN |
| `GET` | `/job-levels` | Public/Authenticated |
| `POST` | `/job-levels` | ADMIN, HR |
| `PUT` | `/job-levels/:id` | ADMIN, HR |
| `DELETE` | `/job-levels/:id` | ADMIN |
| `GET` | `/cost-centers` | Public/Authenticated |
| `POST` | `/cost-centers` | ADMIN, HR |
| `PUT` | `/cost-centers/:id` | ADMIN, HR |
| `DELETE` | `/cost-centers/:id` | ADMIN |
| `GET` | `/org-policies` | Public/Authenticated |
| `POST` | `/org-policies` | ADMIN, HR |
| `GET` | `/attendance/today` | Public/Authenticated |
| `POST` | `/attendance/check-in` | Public/Authenticated |
| `POST` | `/attendance/break` | Public/Authenticated |
| `POST` | `/attendance/resume` | Public/Authenticated |
| `POST` | `/attendance/check-out` | Public/Authenticated |
| `GET` | `/attendance/records` | Public/Authenticated |
| `GET` | `/attendance/shifts` | Public/Authenticated |
| `GET` | `/attendance/holidays` | Public/Authenticated |
| `GET` | `/attendance/audit-logs` | Public/Authenticated |
| `GET` | `/leave-requests` | Public/Authenticated |
| `POST` | `/leave-requests` | Public/Authenticated |
| `POST` | `/leave-requests/bulk-review` | ADMIN, HR, MANAGER, TEAM_LEAD |
| `PUT` | `/leave-requests/:id` | ADMIN, HR, MANAGER, TEAM_LEAD |
| `PUT` | `/leave-requests/:id/review` | ADMIN, HR, MANAGER, TEAM_LEAD |
| `GET` | `/leave-policies` | ADMIN, HR |
| `POST` | `/leave-policies` | ADMIN, HR |
| `GET` | `/tasks` | Public/Authenticated |
| `PUT` | `/tasks/:id` | Public/Authenticated |
| `POST` | `/attendance/corrections` | Public/Authenticated |
| `GET` | `/attendance/corrections` | Public/Authenticated |
| `POST` | `/attendance/corrections/bulk-review` | ADMIN, HR, MANAGER, TEAM_LEAD |
| `PUT` | `/attendance/corrections/:id` | ADMIN, HR, MANAGER, TEAM_LEAD |
| `GET` | `/attendance/live-status` | ADMIN, HR, MANAGER |
| `GET` | `/attendance/monthly-summary` | ADMIN, HR |
| `GET` | `/attendance/monthly-summary/:employeeId` | Public/Authenticated |
| `POST` | `/attendance/monthly-summary/:employeeId/compute` | ADMIN, HR |
| `GET` | `/shifts` | Public/Authenticated |
| `POST` | `/shifts` | ADMIN, HR |
| `PUT` | `/shifts/:id` | ADMIN, HR |
| `DELETE` | `/shifts/:id` | ADMIN |
| `GET` | `/holidays` | Public/Authenticated |
| `POST` | `/holidays` | ADMIN, HR |
| `DELETE` | `/holidays/:id` | ADMIN, HR |
| `GET` | `/work-configs` | Public/Authenticated |
| `POST` | `/work-configs` | ADMIN, HR |
| `POST` | `/employees/:id/shift-assignment` | ADMIN, HR |
| `GET` | `/notifications` | Public/Authenticated |
| `PUT` | `/notifications/read-all` | Public/Authenticated |
| `PUT` | `/notifications/:id/read` | Public/Authenticated |
| `GET` | `/notifications/preferences` | Public/Authenticated |
| `PUT` | `/notifications/preferences` | Public/Authenticated |
| `GET` | `/employees/:id/shift-assignment` | Public/Authenticated |
| `GET` | `/analytics` | Public/Authenticated |
| `GET` | `/dashboard/metrics` | Public/Authenticated |
| `GET` | `/dashboard/admin` | ADMIN |
| `GET` | `/dashboard/hr` | ADMIN, HR |
| `GET` | `/dashboard/manager` | ADMIN, MANAGER |
| `GET` | `/dashboard/team-lead` | ADMIN, TEAM_LEAD |
| `GET` | `/dashboard/employee` | Public/Authenticated |
| `GET` | `/dashboard/summary` | Public/Authenticated |
| `GET` | `/dashboard/workforce` | Public/Authenticated |
| `GET` | `/dashboard/headcount` | Public/Authenticated |
| `GET` | `/dashboard/risk` | Public/Authenticated |
| `GET` | `/analytics/employee-growth` | Public/Authenticated |
| `GET` | `/analytics/attendance-trend` | Public/Authenticated |
| `GET` | `/analytics/performance` | Public/Authenticated |
| `GET` | `/reports/attendance/export` | ADMIN, HR, MANAGER, TEAM_LEAD |
| `GET` | `/reports/workforce/export` | ADMIN, HR |
| `GET` | `/reports/leave/export` | ADMIN, HR, MANAGER, TEAM_LEAD |
| `GET` | `/reports/payroll/export` | ADMIN, HR |
| `GET` | `/reports/statutory/export` | ADMIN, HR |
| `GET` | `/reports/metrics` | Public/Authenticated |
| `GET` | `/audit/logs` | ADMIN, HR |
| `GET` | `/audit/logs/:id` | ADMIN, HR |
| `GET` | `/admin/security/dashboard` | ADMIN, HR |
| `GET` | `/admin/security/failed-logins` | ADMIN |
| `GET` | `/admin/security/integrity` | ADMIN |
| `GET` | `/users` | ADMIN |
| `PUT` | `/users/:userId/role` | ADMIN |
| `DELETE` | `/users/:userId` | ADMIN |
| `POST` | `/admin/backups` | ADMIN |
| `GET` | `/admin/backups` | ADMIN |
| `POST` | `/admin/backups/restore` | ADMIN |
| `GET` | `/admin/backups/:filename/download` | ADMIN |
| `DELETE` | `/admin/backups/:filename` | ADMIN |
| `GET` | `/admin/backups/:filename/verify` | ADMIN |
| `GET` | `/ai/insights` | Public/Authenticated |
| `POST` | `/ai/insights/refresh` | ADMIN, HR, MANAGER |
| `GET` | `/feature-flags` | Public/Authenticated |
| `PUT` | `/feature-flags/:key` | ADMIN |
| `POST` | `/upload` | Public/Authenticated |
| `GET` | `/employees/:id/status-history` | Public/Authenticated |
| `GET` | `/employees/:id/field-history` | ADMIN, HR |
| `POST` | `/employees/:id/transition` | ADMIN, HR |
| `GET` | `/employees/:id/documents` | Public/Authenticated |
| `POST` | `/employees/:id/documents` | ADMIN, HR |
| `GET` | `/payroll/fnf` | ADMIN, HR |
| `POST` | `/payroll/fnf` | ADMIN, HR |
| `POST` | `/payroll/fnf/:id/approve` | ADMIN, HR |
| `GET` | `/leave/types` | Public/Authenticated |
| `GET` | `/leave-types` | Public/Authenticated |
| `POST` | `/leave/types` | ADMIN, HR |
| `POST` | `/leave-types` | ADMIN, HR |
| `GET` | `/leave/balances/:employeeId` | Public/Authenticated |
| `GET` | `/leave-balances` | Public/Authenticated |
| `GET` | `/leave/holidays` | Public/Authenticated |
| `POST` | `/leave/holidays` | ADMIN, HR |
| `GET` | `/recruitment/requisitions` | ADMIN, HR, MANAGER |
| `POST` | `/recruitment/requisitions` | ADMIN, HR |
| `PATCH` | `/recruitment/requisitions/:id/status` | ADMIN, HR |
| `GET` | `/recruitment/requisitions/:reqId/applications` | ADMIN, HR, MANAGER |
| `POST` | `/recruitment/requisitions/:reqId/applications` | ADMIN, HR |
| `POST` | `/recruitment/applications/:appId/interviews` | ADMIN, HR, MANAGER |
| `PATCH` | `/recruitment/interviews/:interviewId/feedback` | ADMIN, HR, MANAGER |
| `POST` | `/recruitment/applications/:appId/offer` | ADMIN, HR |
| `PATCH` | `/recruitment/offers/:offerId/respond` | ADMIN, HR |
| `GET` | `/recruitment/funnel` | ADMIN, HR, MANAGER |
| `GET` | `/performance/cycles` | Public/Authenticated |
| `POST` | `/performance/cycles` | ADMIN, HR |
| `GET` | `/performance/cycles/:cycleId/analytics` | ADMIN, HR, MANAGER |
| `GET` | `/performance/cycles/:cycleId/employees/:employeeId/goals` | Public/Authenticated |
| `POST` | `/performance/cycles/:cycleId/employees/:employeeId/goals` | Public/Authenticated |
| `PATCH` | `/performance/goals/:goalId/progress` | Public/Authenticated |
| `GET` | `/performance/cycles/:cycleId/employees/:employeeId/reviews` | Public/Authenticated |
| `PATCH` | `/performance/reviews/:reviewId/submit` | Public/Authenticated |
| `GET` | `/payroll/salary/:employeeId` | ADMIN, HR, EMPLOYEE |
| `POST` | `/payroll/salary/:employeeId` | ADMIN, HR |
| `GET` | `/payroll/salary/:employeeId/revisions` | ADMIN, HR, EMPLOYEE |
| `POST` | `/payroll/ctc/calculate` | ADMIN, HR, MANAGER |
| `GET` | `/payroll/runs` | ADMIN, HR, MANAGER |
| `POST` | `/payroll/runs` | ADMIN, HR |
| `POST` | `/payroll/runs/:runId/calculate` | ADMIN, HR |
| `POST` | `/payroll/runs/:runId/generate` | ADMIN, HR |
| `POST` | `/payroll/runs/:runId/validate` | ADMIN, HR |
| `POST` | `/payroll/runs/:runId/submit` | ADMIN, HR |
| `POST` | `/payroll/runs/:runId/approve` | ADMIN, HR, MANAGER |
| `POST` | `/payroll/runs/:runId/reject` | ADMIN, HR, MANAGER |
| `POST` | `/payroll/runs/:runId/lock` | ADMIN |
| `POST` | `/payroll/runs/:runId/finalize` | ADMIN |
| `POST` | `/payroll/runs/:runId/rollback` | ADMIN, HR |
| `POST` | `/payroll/runs/:runId/reverse` | ADMIN |
| `GET` | `/payroll/runs/:runId/payslips` | ADMIN, HR, MANAGER |
| `GET` | `/payroll/runs/:runId/register` | ADMIN, HR |
| `GET` | `/payroll/departments/summary` | ADMIN, HR, MANAGER |
| `GET` | `/payroll/payslips/me` | Public/Authenticated |
| `GET` | `/payroll/payslips/:payslipId/pdf` | Public/Authenticated |
| `GET` | `/payroll/ytd/:employeeId` | Public/Authenticated |
| `GET` | `/payroll/tax/:employeeId` | Public/Authenticated |
| `POST` | `/payroll/tax/:employeeId` | Public/Authenticated |
| `GET` | `/payroll/tax/:employeeId/form16` | Public/Authenticated |
| `GET` | `/compliance/config` | ADMIN, HR |
| `POST` | `/compliance/config` | ADMIN, HR |
| `GET` | `/workflows/pending` | Public/Authenticated |
| `POST` | `/workflows/requests/:requestId/action` | Public/Authenticated |
| `POST` | `/expenses` | Public/Authenticated |
| `GET` | `/expenses/me` | Public/Authenticated |
| `GET` | `/scheduling/employees/:employeeId/schedule` | Public/Authenticated |
| `PUT` | `/scheduling/employees/:employeeId/schedule` | ADMIN, HR, MANAGER |
| `GET` | `/scheduling/employees/:employeeId/shifts` | Public/Authenticated |
| `POST` | `/scheduling/employees/:employeeId/shifts` | ADMIN, HR, MANAGER |
| `GET` | `/scheduling/overtime/rules` | ADMIN, HR |
| `POST` | `/scheduling/overtime/rules` | ADMIN, HR |
| `GET` | `/scheduling/overtime/records` | ADMIN, HR, MANAGER |
| `POST` | `/scheduling/overtime/records` | Public/Authenticated |
| `POST` | `/scheduling/overtime/records/:recordId/approve` | ADMIN, HR, MANAGER |
| `POST` | `/scheduling/overtime/records/:recordId/reject` | ADMIN, HR, MANAGER |
| `GET` | `/assets` | ADMIN, HR |
| `POST` | `/assets` | ADMIN, HR |
| `POST` | `/assets/:id/assign` | ADMIN, HR |
| `POST` | `/assets/:id/return` | ADMIN, HR |
| `GET` | `/assets/:id/history` | ADMIN, HR |
| `GET` | `/training/courses` | Public/Authenticated |
| `POST` | `/training/courses` | ADMIN, HR |
| `POST` | `/training/courses/:courseId/enroll` | ADMIN, HR, MANAGER |
| `PATCH` | `/training/enrollments/:enrollmentId/complete` | ADMIN, HR |
| `GET` | `/training/my-training` | Public/Authenticated |
| `GET` | `/training/mandatory-compliance` | ADMIN, HR |


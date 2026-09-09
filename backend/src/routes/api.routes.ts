import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import * as authFlowController from '../controllers/authFlow.controller.js';
import * as attendanceController from '../controllers/attendance.controller.js';
import * as analyticsController from '../controllers/analytics.controller.js';
import * as workforceController from '../controllers/workforce.controller.js';
import * as employeeController from '../controllers/employee.controller.js';
import * as organizationController from '../controllers/organization.controller.js';
import * as auditController from '../controllers/audit.controller.js';
import * as backupController from '../controllers/backup.controller.js';
import * as aiController from '../controllers/ai.controller.js';
import * as reportController from '../controllers/report.controller.js';
import * as lifecycleController from '../controllers/employee-lifecycle.controller.js';
import * as recruitmentController from '../controllers/recruitment.controller.js';
import * as payrollController from '../controllers/payroll.controller.js';
import * as performanceController from '../controllers/performance.controller.js';
import * as workflowController from '../controllers/workflow.controller.js';
import * as schedulingController from '../controllers/scheduling.controller.js';
import { authenticateToken, authorizeRoles, authorizePermissions, enforceScope } from '../middleware/auth.js';
import { tenantScope } from '../middleware/tenantScope.js';
import {
  loginRateLimiter,
  registerRateLimiter,
  passwordResetLimiter,
  otpRateLimiter,
  publicApiLimiter,
  authenticatedUserLimiter
} from '../middleware/rateLimiter.js';
import {
  validateLogin,
  validateRegistration,
  validateMfaCode,
  validateMfaResend,
  validateAttendanceAction,
  validateLeaveRequest,
  validateForgotPassword,
  validateResetPassword,
  validateChangePassword,
  validateReviewLeaveRequest,
  validateCorrectionRequest,
  validateReviewCorrection,
  validateUpdateUserRole,
  validateBackupRestore,
  validateSaveTrustedDevice,
  validateVerifyTrustedDevice,
  validateBiometricLogin,
  validatePasskeyLoginOptions,
  validatePasskeyLoginVerify,
  validatePasskeyRegisterVerify,
  validateVerifyEmail,
  validateSendVerification,
  validateCreateEmployee,
  validateUpdateEmployee,
  validateUpdateEmployeeStatus,
  validateUpdateTask,
  validateIdParam,
  validateUserIdParam,
  validateBackupFilenameParam,
  validateFeatureFlagParam,
  validateFeatureFlagUpdate
} from '../middleware/validateInput.js';
import { validateFileUpload } from '../middleware/fileUpload.js';
import { idempotencyMiddleware } from '../middleware/idempotency.js';

const router = express.Router();

// Health Check (Public endpoints with moderate limits)
router.get('/health', publicApiLimiter, authController.healthCheck);
router.get('/health/db', publicApiLimiter, authController.healthCheckDb);

// Auth Routes (Strict rate limiting + strict schema validation)
router.post('/auth/login', loginRateLimiter, validateLogin, authController.login);
router.post('/auth/register', registerRateLimiter, validateRegistration, authController.register);
router.get('/auth/sso/google', authController.googleLogin);
router.get('/auth/sso/microsoft', authController.microsoftLogin);
router.post('/auth/sso/callback', loginRateLimiter, authController.ssoCallback);
router.post('/auth/mfa/verify', loginRateLimiter, validateMfaCode, authController.verifyMfa);
router.post('/auth/mfa/resend', otpRateLimiter, validateMfaResend, authController.resendMfa);
router.post('/auth/logout', authenticateToken, authController.logout);
router.post('/auth/logout-all', authenticateToken, authController.logoutAll);
router.get('/auth/sessions', authenticateToken, authenticatedUserLimiter, authController.getActiveSessions);
router.delete('/auth/sessions/:sessionId', authenticateToken, authenticatedUserLimiter, authController.revokeUserSession);
router.get('/auth/me', authenticateToken, authenticatedUserLimiter, authController.getMe);
router.post('/auth/refresh', authenticatedUserLimiter, authController.refresh);
router.post('/auth/admin/unlock', authenticateToken, authorizeRoles(['ADMIN']), authController.adminUnlockUser);

// Password Reset Routes (Forgot Password Flow)
router.post('/auth/forgot-password', passwordResetLimiter, validateForgotPassword, authController.forgotPassword);
router.post('/auth/reset-password', passwordResetLimiter, validateResetPassword, authController.resetPassword);
router.post('/auth/change-password', authenticateToken, passwordResetLimiter, validateChangePassword, authController.changePassword);

// Email Verification Routes
router.post('/auth/send-verification', authenticateToken, otpRateLimiter, validateSendVerification, authController.sendVerification);
router.post('/auth/verify-email', otpRateLimiter, validateVerifyEmail, authController.verifyEmail);

// TOTP MFA Routes
router.get('/auth/mfa/totp/status', authenticateToken, authenticatedUserLimiter, authController.getMfaStatus);
router.post('/auth/mfa/totp/enroll', authenticateToken, authenticatedUserLimiter, authController.enrollTotpMfa);
router.post('/auth/mfa/totp/enroll/verify', authenticateToken, authenticatedUserLimiter, validateMfaCode, authController.confirmEnrollMfa);
router.post('/auth/mfa/totp/disable', authenticateToken, authenticatedUserLimiter, authController.disableTotpMfa);
router.post('/auth/mfa/totp/recovery-codes/regenerate', authenticateToken, authenticatedUserLimiter, authController.regenerateRecoveryCodes);

// Passkey / WebAuthn Routes
router.post('/auth/passkey/register-options', authenticateToken, authenticatedUserLimiter, authFlowController.generatePasskeyRegisterOptions);
router.post('/auth/passkey/register-verify', authenticateToken, authenticatedUserLimiter, validatePasskeyRegisterVerify, authFlowController.verifyPasskeyRegister);
router.post('/auth/passkey/login-options', publicApiLimiter, validatePasskeyLoginOptions, authFlowController.generatePasskeyLoginOptions);
router.post('/auth/passkey/login-verify', loginRateLimiter, validatePasskeyLoginVerify, authFlowController.verifyPasskeyLogin);
router.post('/auth/biometric/login', loginRateLimiter, validateBiometricLogin, authFlowController.biometricLockLogin);
router.post('/auth/lock/login', loginRateLimiter, validateBiometricLogin, authFlowController.biometricLockLogin);
router.post('/auth/trusted-devices', authenticateToken, authenticatedUserLimiter, validateSaveTrustedDevice, authFlowController.saveTrustedDevice);
router.get('/auth/trusted-devices', authenticateToken, authenticatedUserLimiter, authFlowController.getTrustedDevices);
router.post('/auth/trusted-devices/verify', publicApiLimiter, validateVerifyTrustedDevice, authFlowController.verifyTrustedDevice);
router.delete('/auth/trusted-devices/:id', authenticateToken, authenticatedUserLimiter, validateIdParam, authFlowController.revokeTrustedDevice);

// Admin MFA Management
router.get('/admin/mfa/users', authenticateToken, authorizeRoles(['ADMIN']), authController.adminGetMfaUsers);
router.post('/admin/mfa/users/:userId/reset', authenticateToken, authorizeRoles(['ADMIN']), validateUserIdParam, authController.adminResetMfa);

// File Upload Routes (Validated & Restricted: type, size, and binary magic bytes)
router.post(
  '/uploads/avatar',
  authenticateToken,
  authenticatedUserLimiter,
  validateFileUpload({ allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'], maxSize: 2 * 1024 * 1024 }),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Avatar file validated successfully.',
      file: req.body.sanitizedFile || { name: 'avatar.png', size: 1024 }
    });
  }
);

router.post(
  '/uploads/document',
  authenticateToken,
  authenticatedUserLimiter,
  validateFileUpload({ allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png', 'text/csv'], maxSize: 5 * 1024 * 1024 }),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Document file validated and processed successfully.',
      file: req.body.sanitizedFile || { name: 'document.pdf', size: 2048 }
    });
  }
);

// Employees Directory
router.get('/employees', authenticateToken, enforceScope, authenticatedUserLimiter, employeeController.getEmployees);
router.get('/employees/:id/export-data', authenticateToken, validateIdParam, employeeController.exportEmployeeData);
router.post('/employees/:id/anonymize-data', authenticateToken, authorizeRoles(['ADMIN']), validateIdParam, employeeController.anonymizeEmployeeData);
router.put('/employees/:id/status', authenticateToken, enforceScope, authorizePermissions(['EMPLOYEE_UPDATE', 'EMPLOYEE_MANAGE']), validateIdParam, validateUpdateEmployeeStatus, employeeController.updateEmployeeStatus);
router.get('/employees/:id', authenticateToken, enforceScope, validateIdParam, employeeController.getEmployeeById);
router.post('/employees', authenticateToken, enforceScope, authorizePermissions(['EMPLOYEE_CREATE', 'EMPLOYEE_MANAGE']), validateCreateEmployee, employeeController.createEmployee);
router.put('/employees/:id', authenticateToken, enforceScope, authorizePermissions(['EMPLOYEE_UPDATE', 'EMPLOYEE_MANAGE']), validateIdParam, validateUpdateEmployee, employeeController.updateEmployee);
router.delete('/employees/:id', authenticateToken, enforceScope, authorizePermissions(['EMPLOYEE_DELETE', 'EMPLOYEE_MANAGE']), validateIdParam, employeeController.deleteEmployee);

// Team CRUD Route mappings
router.get('/teams', authenticateToken, authenticatedUserLimiter, employeeController.getTeams);
router.get('/teams/:id/members', authenticateToken, enforceScope, validateIdParam, employeeController.getTeamMembers);

// Org, Dept & RBAC Route mappings
router.get('/departments', authenticateToken, authenticatedUserLimiter, organizationController.getDepartments);
router.get('/locations', authenticateToken, authenticatedUserLimiter, organizationController.getLocations);
router.get('/organizations', authenticateToken, authenticatedUserLimiter, organizationController.getOrganizations);
router.get('/roles', authenticateToken, authenticatedUserLimiter, organizationController.getRoles);
router.get('/permissions', authenticateToken, authenticatedUserLimiter, organizationController.getPermissions);

// Attendance Punch & Session Routes
router.get('/attendance/today', authenticateToken, tenantScope, authenticatedUserLimiter, attendanceController.getTodayAttendance);
router.post('/attendance/check-in', authenticateToken, tenantScope, enforceScope, validateAttendanceAction, idempotencyMiddleware, authenticatedUserLimiter, attendanceController.checkIn);
router.post('/attendance/break', authenticateToken, tenantScope, enforceScope, validateAttendanceAction, idempotencyMiddleware, authenticatedUserLimiter, attendanceController.takeBreak);
router.post('/attendance/resume', authenticateToken, tenantScope, enforceScope, validateAttendanceAction, idempotencyMiddleware, authenticatedUserLimiter, attendanceController.resumeWork);
router.post('/attendance/check-out', authenticateToken, tenantScope, enforceScope, validateAttendanceAction, idempotencyMiddleware, authenticatedUserLimiter, attendanceController.checkOut);
router.get('/attendance/records', authenticateToken, tenantScope, enforceScope, authenticatedUserLimiter, attendanceController.getRecords);
router.get('/attendance/shifts', publicApiLimiter, attendanceController.getShifts);
router.get('/attendance/holidays', publicApiLimiter, attendanceController.getPublicHolidays);
router.get('/attendance/audit-logs', authenticateToken, authenticatedUserLimiter, attendanceController.getAuditLogs);

// Persisted leave and task workflows
router.get('/leave-requests', authenticateToken, enforceScope, authenticatedUserLimiter, workforceController.getLeaveRequests);
router.post('/leave-requests', authenticateToken, enforceScope, validateLeaveRequest, idempotencyMiddleware, authenticatedUserLimiter, workforceController.createLeaveRequest);
router.put('/leave-requests/:id', authenticateToken, authorizeRoles(['ADMIN', 'HR', 'MANAGER', 'TEAM_LEAD']), validateIdParam, idempotencyMiddleware, validateReviewLeaveRequest, workforceController.reviewLeaveRequest);
router.get('/tasks', authenticateToken, enforceScope, authenticatedUserLimiter, workforceController.getTasks);
router.put('/tasks/:id', authenticateToken, validateIdParam, validateUpdateTask, workforceController.updateTask);

// Corrections Requests
router.post('/attendance/corrections', authenticateToken, enforceScope, validateCorrectionRequest, idempotencyMiddleware, authenticatedUserLimiter, attendanceController.submitCorrection);
router.get('/attendance/corrections', authenticateToken, enforceScope, authenticatedUserLimiter, attendanceController.getCorrections);
router.put('/attendance/corrections/:id', authenticateToken, authorizeRoles(['ADMIN', 'HR', 'MANAGER', 'TEAM_LEAD']), validateIdParam, idempotencyMiddleware, validateReviewCorrection, attendanceController.reviewCorrection);

// Analytics
router.get('/analytics', authenticateToken, enforceScope, authenticatedUserLimiter, analyticsController.getAnalytics);
router.get('/dashboard/metrics', authenticateToken, enforceScope, authenticatedUserLimiter, analyticsController.getAnalytics);

// Dashboard specific endpoints
router.get('/dashboard/summary', authenticateToken, enforceScope, authenticatedUserLimiter, analyticsController.getDashboardSummary);
router.get('/dashboard/workforce', authenticateToken, enforceScope, authenticatedUserLimiter, analyticsController.getWorkforceDistribution);
router.get('/dashboard/headcount', authenticateToken, enforceScope, authenticatedUserLimiter, analyticsController.getHeadcountAnalytics);
router.get('/dashboard/risk', authenticateToken, enforceScope, authenticatedUserLimiter, analyticsController.getRiskAnalytics);

// Analytics trends
router.get('/analytics/employee-growth', authenticateToken, enforceScope, authenticatedUserLimiter, analyticsController.getEmployeeGrowth);
router.get('/analytics/attendance-trend', authenticateToken, enforceScope, authenticatedUserLimiter, analyticsController.getAttendanceTrend);
router.get('/analytics/performance', authenticateToken, enforceScope, authenticatedUserLimiter, analyticsController.getPerformanceAnalytics);

// Compliance & Intelligence Reports Streaming (CSV / JSON)
router.get('/reports/attendance/export', authenticateToken, enforceScope, authorizeRoles(['ADMIN', 'HR', 'MANAGER', 'TEAM_LEAD']), reportController.exportAttendanceReport);
router.get('/reports/workforce/export', authenticateToken, enforceScope, authorizeRoles(['ADMIN', 'HR', 'MANAGER']), reportController.exportWorkforceReport);
router.get('/reports/leave/export', authenticateToken, enforceScope, authorizeRoles(['ADMIN', 'HR', 'MANAGER', 'TEAM_LEAD']), reportController.exportLeaveReport);
router.get('/reports/metrics', authenticateToken, authenticatedUserLimiter, reportController.getReportMetrics);

// Audit Logs & Security Dashboard
router.get('/audit/logs', authenticateToken, authorizeRoles(['ADMIN', 'HR']), auditController.getAuditLogs);
router.get('/audit/logs/:id', authenticateToken, authorizeRoles(['ADMIN', 'HR']), validateIdParam, auditController.getAuditLogDetail);
router.get('/admin/security/dashboard', authenticateToken, authorizeRoles(['ADMIN', 'HR']), auditController.getSecurityDashboard);
router.get('/admin/security/failed-logins', authenticateToken, authorizeRoles(['ADMIN']), auditController.getFailedLogins);
router.get('/admin/security/integrity', authenticateToken, authorizeRoles(['ADMIN']), auditController.getDatabaseIntegrity);

// User Management (Admin Only)
router.get('/users', authenticateToken, authorizeRoles(['ADMIN']), employeeController.getUsers);
router.put('/users/:userId/role', authenticateToken, authorizeRoles(['ADMIN']), validateUserIdParam, validateUpdateUserRole, employeeController.updateUserRole);
router.delete('/users/:userId', authenticateToken, authorizeRoles(['ADMIN']), validateUserIdParam, employeeController.deleteUser);

// Database Backup & Disaster Recovery (Admin Only)
router.post('/admin/backups', authenticateToken, authorizeRoles(['ADMIN']), backupController.createBackup);
router.get('/admin/backups', authenticateToken, authorizeRoles(['ADMIN']), backupController.listBackups);
router.post('/admin/backups/restore', authenticateToken, authorizeRoles(['ADMIN']), validateBackupRestore, backupController.restoreBackup);
router.get('/admin/backups/:filename/download', authenticateToken, authorizeRoles(['ADMIN']), validateBackupFilenameParam, backupController.downloadBackup);
router.delete('/admin/backups/:filename', authenticateToken, authorizeRoles(['ADMIN']), validateBackupFilenameParam, backupController.deleteBackup);
// Backup integrity verification — does NOT restore to live DB
router.get('/admin/backups/:filename/verify', authenticateToken, authorizeRoles(['ADMIN']), validateBackupFilenameParam, backupController.verifyBackup);

// AI Intelligence & Workforce Insights
router.get('/ai/insights', authenticateToken, authenticatedUserLimiter, aiController.getAIInsights);
router.post('/ai/insights/refresh', authenticateToken, authorizeRoles(['ADMIN', 'HR', 'MANAGER']), aiController.refreshAIInsights);

// Feature Flags
router.get('/feature-flags', authenticateToken, authenticatedUserLimiter, aiController.getFeatureFlags);
router.put('/feature-flags/:key', authenticateToken, authorizeRoles(['ADMIN']), validateFeatureFlagParam, validateFeatureFlagUpdate, aiController.updateFeatureFlag);

// ─── Employee Lifecycle (Step 2) ────────────────────────────────────────────
router.get('/employees/:id/status-history', authenticateToken, enforceScope, authenticatedUserLimiter, lifecycleController.getStatusHistory);
router.get('/employees/:id/field-history', authenticateToken, authorizeRoles(['ADMIN', 'HR']), authenticatedUserLimiter, lifecycleController.getFieldHistory);
router.post('/employees/:id/transition', authenticateToken, authorizeRoles(['ADMIN', 'HR']), authenticatedUserLimiter, lifecycleController.transitionStatus);
router.get('/employees/:id/documents', authenticateToken, enforceScope, authenticatedUserLimiter, lifecycleController.getDocuments);
router.post('/employees/:id/documents', authenticateToken, authorizeRoles(['ADMIN', 'HR']), authenticatedUserLimiter, lifecycleController.addDocument);

// ─── Leave Engine (Step 3) ───────────────────────────────────────────────────
router.get('/leave/types', authenticateToken, authenticatedUserLimiter, performanceController.getLeaveTypes);
router.post('/leave/types', authenticateToken, authorizeRoles(['ADMIN', 'HR']), authenticatedUserLimiter, performanceController.createLeaveType);
router.get('/leave/balances/:employeeId', authenticateToken, enforceScope, authenticatedUserLimiter, performanceController.getLeaveBalances);
router.get('/leave/holidays', authenticateToken, authenticatedUserLimiter, performanceController.getHolidays);
router.post('/leave/holidays', authenticateToken, authorizeRoles(['ADMIN', 'HR']), authenticatedUserLimiter, performanceController.addHoliday);

// ─── Recruitment (Step 4) ───────────────────────────────────────────────────
router.get('/recruitment/requisitions', authenticateToken, authorizeRoles(['ADMIN', 'HR', 'MANAGER']), authenticatedUserLimiter, recruitmentController.listRequisitions);
router.post('/recruitment/requisitions', authenticateToken, authorizeRoles(['ADMIN', 'HR']), authenticatedUserLimiter, recruitmentController.createRequisition);
router.patch('/recruitment/requisitions/:id/status', authenticateToken, authorizeRoles(['ADMIN', 'HR']), validateIdParam, authenticatedUserLimiter, recruitmentController.updateRequisitionStatus);
router.get('/recruitment/requisitions/:reqId/applications', authenticateToken, authorizeRoles(['ADMIN', 'HR', 'MANAGER']), authenticatedUserLimiter, recruitmentController.listApplications);
router.post('/recruitment/requisitions/:reqId/applications', authenticateToken, authorizeRoles(['ADMIN', 'HR']), authenticatedUserLimiter, recruitmentController.createApplication);
router.post('/recruitment/applications/:appId/interviews', authenticateToken, authorizeRoles(['ADMIN', 'HR', 'MANAGER']), authenticatedUserLimiter, recruitmentController.scheduleInterview);
router.patch('/recruitment/interviews/:interviewId/feedback', authenticateToken, authorizeRoles(['ADMIN', 'HR', 'MANAGER']), authenticatedUserLimiter, recruitmentController.submitInterviewFeedback);
router.post('/recruitment/applications/:appId/offer', authenticateToken, authorizeRoles(['ADMIN', 'HR']), authenticatedUserLimiter, recruitmentController.createOffer);
router.patch('/recruitment/offers/:offerId/respond', authenticateToken, authorizeRoles(['ADMIN', 'HR']), authenticatedUserLimiter, recruitmentController.respondToOffer);
router.get('/recruitment/funnel', authenticateToken, authorizeRoles(['ADMIN', 'HR', 'MANAGER']), authenticatedUserLimiter, recruitmentController.getRecruitmentFunnel);

// ─── Performance Management (Step 5) ────────────────────────────────────────
router.get('/performance/cycles', authenticateToken, authenticatedUserLimiter, performanceController.getCycles);
router.post('/performance/cycles', authenticateToken, authorizeRoles(['ADMIN', 'HR']), authenticatedUserLimiter, performanceController.createCycle);
router.get('/performance/cycles/:cycleId/analytics', authenticateToken, authorizeRoles(['ADMIN', 'HR', 'MANAGER']), authenticatedUserLimiter, performanceController.getCycleAnalytics);
router.get('/performance/cycles/:cycleId/employees/:employeeId/goals', authenticateToken, enforceScope, authenticatedUserLimiter, performanceController.getGoals);
router.post('/performance/cycles/:cycleId/employees/:employeeId/goals', authenticateToken, enforceScope, authenticatedUserLimiter, performanceController.createGoal);
router.patch('/performance/goals/:goalId/progress', authenticateToken, enforceScope, authenticatedUserLimiter, performanceController.updateGoalProgress);
router.get('/performance/cycles/:cycleId/employees/:employeeId/reviews', authenticateToken, enforceScope, authenticatedUserLimiter, performanceController.getReviews);
router.patch('/performance/reviews/:reviewId/submit', authenticateToken, enforceScope, authenticatedUserLimiter, performanceController.submitReview);

// ─── Payroll (Step 6) ───────────────────────────────────────────────────────
router.get('/payroll/salary/:employeeId', authenticateToken, authorizeRoles(['ADMIN', 'HR']), authenticatedUserLimiter, payrollController.getSalaryStructure);
router.post('/payroll/salary/:employeeId', authenticateToken, authorizeRoles(['ADMIN', 'HR']), authenticatedUserLimiter, payrollController.setSalaryStructure);
router.get('/payroll/runs', authenticateToken, authorizeRoles(['ADMIN', 'HR']), authenticatedUserLimiter, payrollController.getPayrollRuns);
router.post('/payroll/runs', authenticateToken, authorizeRoles(['ADMIN', 'HR']), authenticatedUserLimiter, payrollController.createPayrollRun);
router.post('/payroll/runs/:runId/generate', authenticateToken, authorizeRoles(['ADMIN', 'HR']), authenticatedUserLimiter, payrollController.generatePayslips);
router.post('/payroll/runs/:runId/finalize', authenticateToken, authorizeRoles(['ADMIN']), authenticatedUserLimiter, payrollController.finalizePayrollRun);
router.get('/payroll/payslips/me', authenticateToken, authenticatedUserLimiter, payrollController.getMyPayslips);

// ─── Approval Workflow (Step 9) ──────────────────────────────────────────────
router.get('/workflows/pending', authenticateToken, authenticatedUserLimiter, workflowController.getPendingApprovals);
router.post('/workflows/requests/:requestId/action', authenticateToken, authenticatedUserLimiter, workflowController.takeApprovalAction);

// ─── Scheduling & Overtime (Step 7) ──────────────────────────────────────────
router.get('/scheduling/employees/:employeeId/schedule', authenticateToken, enforceScope, authenticatedUserLimiter, schedulingController.getSchedule);
router.put('/scheduling/employees/:employeeId/schedule', authenticateToken, authorizeRoles(['ADMIN', 'HR', 'MANAGER']), authenticatedUserLimiter, schedulingController.setSchedule);
router.get('/scheduling/employees/:employeeId/shifts', authenticateToken, enforceScope, authenticatedUserLimiter, schedulingController.getShiftAssignments);
router.post('/scheduling/employees/:employeeId/shifts', authenticateToken, authorizeRoles(['ADMIN', 'HR', 'MANAGER']), authenticatedUserLimiter, schedulingController.assignShift);
router.get('/scheduling/overtime/rules', authenticateToken, authorizeRoles(['ADMIN', 'HR']), authenticatedUserLimiter, schedulingController.getOvertimeRules);
router.post('/scheduling/overtime/rules', authenticateToken, authorizeRoles(['ADMIN', 'HR']), authenticatedUserLimiter, schedulingController.createOvertimeRule);
router.get('/scheduling/overtime/records', authenticateToken, authorizeRoles(['ADMIN', 'HR', 'MANAGER']), authenticatedUserLimiter, schedulingController.getOvertimeRecords);
router.post('/scheduling/overtime/records', authenticateToken, enforceScope, authenticatedUserLimiter, schedulingController.recordOvertime);
router.post('/scheduling/overtime/records/:recordId/approve', authenticateToken, authorizeRoles(['ADMIN', 'HR', 'MANAGER']), authenticatedUserLimiter, schedulingController.approveOvertime);
router.post('/scheduling/overtime/records/:recordId/reject', authenticateToken, authorizeRoles(['ADMIN', 'HR', 'MANAGER']), authenticatedUserLimiter, schedulingController.rejectOvertime);

// ─── Assets Management (Step 8) ──────────────────────────────────────────────
router.get('/assets', authenticateToken, authorizeRoles(['ADMIN', 'HR']), authenticatedUserLimiter, schedulingController.listAssets);
router.post('/assets', authenticateToken, authorizeRoles(['ADMIN', 'HR']), authenticatedUserLimiter, schedulingController.createAsset);
router.post('/assets/:id/assign', authenticateToken, authorizeRoles(['ADMIN', 'HR']), validateIdParam, authenticatedUserLimiter, schedulingController.assignAsset);
router.post('/assets/:id/return', authenticateToken, authorizeRoles(['ADMIN', 'HR']), validateIdParam, authenticatedUserLimiter, schedulingController.returnAsset);
router.get('/assets/:id/history', authenticateToken, authorizeRoles(['ADMIN', 'HR']), validateIdParam, authenticatedUserLimiter, schedulingController.getAssetHistory);

// ─── Training / L&D (Step 8) ─────────────────────────────────────────────────
router.get('/training/courses', authenticateToken, authenticatedUserLimiter, schedulingController.listCourses);
router.post('/training/courses', authenticateToken, authorizeRoles(['ADMIN', 'HR']), authenticatedUserLimiter, schedulingController.createCourse);
router.post('/training/courses/:courseId/enroll', authenticateToken, authorizeRoles(['ADMIN', 'HR', 'MANAGER']), authenticatedUserLimiter, schedulingController.enrollEmployee);
router.patch('/training/enrollments/:enrollmentId/complete', authenticateToken, authorizeRoles(['ADMIN', 'HR']), authenticatedUserLimiter, schedulingController.markCourseComplete);
router.get('/training/my-training', authenticateToken, authenticatedUserLimiter, schedulingController.getMyTraining);
router.get('/training/mandatory-compliance', authenticateToken, authorizeRoles(['ADMIN', 'HR']), authenticatedUserLimiter, schedulingController.getMandatoryCompliance);

export default router;

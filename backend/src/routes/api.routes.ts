import express from 'express';
import * as authController from '../modules/auth/auth.controller.js';
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
import { authenticateToken, authorizeRoles, authorizePermissions, enforceScope } from '../middleware/auth.js';
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
router.get('/attendance/today', authenticateToken, authenticatedUserLimiter, attendanceController.getTodayAttendance);
router.post('/attendance/check-in', authenticateToken, enforceScope, validateAttendanceAction, idempotencyMiddleware, authenticatedUserLimiter, attendanceController.checkIn);
router.post('/attendance/break', authenticateToken, enforceScope, validateAttendanceAction, idempotencyMiddleware, authenticatedUserLimiter, attendanceController.takeBreak);
router.post('/attendance/resume', authenticateToken, enforceScope, validateAttendanceAction, idempotencyMiddleware, authenticatedUserLimiter, attendanceController.resumeWork);
router.post('/attendance/check-out', authenticateToken, enforceScope, validateAttendanceAction, idempotencyMiddleware, authenticatedUserLimiter, attendanceController.checkOut);
router.get('/attendance/records', authenticateToken, enforceScope, authenticatedUserLimiter, attendanceController.getRecords);
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

// AI Intelligence & Workforce Insights
router.get('/ai/insights', authenticateToken, authenticatedUserLimiter, aiController.getAIInsights);
router.post('/ai/insights/refresh', authenticateToken, authorizeRoles(['ADMIN', 'HR', 'MANAGER']), aiController.refreshAIInsights);

// Feature Flags
router.get('/feature-flags', authenticateToken, authenticatedUserLimiter, aiController.getFeatureFlags);
router.put('/feature-flags/:key', authenticateToken, authorizeRoles(['ADMIN']), validateFeatureFlagParam, validateFeatureFlagUpdate, aiController.updateFeatureFlag);

export default router;

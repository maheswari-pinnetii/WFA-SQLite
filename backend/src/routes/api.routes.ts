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
import * as complianceController from '../controllers/compliance.controller.js';
import * as performanceController from '../controllers/performance.controller.js';
import * as workflowController from '../controllers/workflow.controller.js';
import * as expenseController from '../controllers/expense.controller.js';
import * as schedulingController from '../controllers/scheduling.controller.js';
import * as attendanceP2 from '../controllers/attendance-phase2.controller.js';
import * as adminDashboardController from '../controllers/admin-dashboard.controller.js';
import * as hrDashboardController from '../controllers/hr-dashboard.controller.js';
import * as managerDashboardController from '../controllers/manager-dashboard.controller.js';
import * as teamLeadDashboardController from '../controllers/team-lead-dashboard.controller.js';
import * as employeeDashboardController from '../controllers/employee-dashboard.controller.js';
import * as jobRoleController from '../controllers/job-role.controller.js';
import * as notificationController from '../controllers/notification.controller.js';
import { authenticateToken, authorizeRoles, authorizePermissions, enforceScope } from '../middleware/auth.js';
import { tenantScope } from '../middleware/tenantScope.js';
import { uploadMiddleware } from '../middleware/fileUpload.js';
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
router.post('/employees/bulk-update', authenticateToken, authorizeRoles(['ADMIN', 'HR']), authenticatedUserLimiter, employeeController.bulkUpdateEmployees);
router.get('/employees/:id/export-data', authenticateToken, validateIdParam, employeeController.exportEmployeeData);
router.post('/employees/:id/anonymize-data', authenticateToken, authorizeRoles(['ADMIN']), validateIdParam, employeeController.anonymizeEmployeeData);
router.put('/employees/:id/status', authenticateToken, authorizeRoles(['ADMIN', 'HR']), validateIdParam, validateUpdateEmployeeStatus, employeeController.updateEmployeeStatus);
router.get('/employees/:id', authenticateToken, enforceScope, validateIdParam, employeeController.getEmployeeById);
router.post('/employees', authenticateToken, authorizeRoles(['ADMIN', 'HR']), validateCreateEmployee, employeeController.createEmployee);
router.put('/employees/:id', authenticateToken, enforceScope, authorizePermissions(['EMPLOYEE_UPDATE', 'EMPLOYEE_MANAGE']), validateIdParam, validateUpdateEmployee, employeeController.updateEmployee);
router.delete('/employees/:id', authenticateToken, authorizeRoles(['ADMIN', 'HR']), validateIdParam, employeeController.deleteEmployee);

// Employee Master — full profile (aggregated)
router.get('/employees/:id/profile', authenticateToken, enforceScope, validateIdParam, employeeController.getFullProfile);

// Employee Master — Bank Details
router.get('/employees/:id/bank-details', authenticateToken, enforceScope, validateIdParam, employeeController.getBankDetails);
router.put('/employees/:id/bank-details', authenticateToken, authorizeRoles(['ADMIN', 'HR']), validateIdParam, employeeController.upsertBankDetails);

// Employee Master — Tax Info
router.get('/employees/:id/tax-info', authenticateToken, enforceScope, validateIdParam, employeeController.getTaxInfo);
router.put('/employees/:id/tax-info', authenticateToken, authorizeRoles(['ADMIN', 'HR']), validateIdParam, employeeController.upsertTaxInfo);

// Employee Master — Emergency Contacts
router.get('/employees/:id/emergency-contacts', authenticateToken, enforceScope, validateIdParam, employeeController.getEmergencyContacts);
router.post('/employees/:id/emergency-contacts', authenticateToken, enforceScope, validateIdParam, employeeController.addEmergencyContact);
router.put('/employees/:id/emergency-contacts/:contactId', authenticateToken, enforceScope, validateIdParam, employeeController.updateEmergencyContact);
router.delete('/employees/:id/emergency-contacts/:contactId', authenticateToken, enforceScope, validateIdParam, employeeController.deleteEmergencyContact);

// Employee Master — Skills
router.get('/employees/:id/skills', authenticateToken, enforceScope, validateIdParam, employeeController.getSkills);
router.post('/employees/:id/skills', authenticateToken, enforceScope, validateIdParam, employeeController.addSkill);
router.put('/employees/:id/skills/:skillId', authenticateToken, enforceScope, validateIdParam, employeeController.updateSkill);
router.delete('/employees/:id/skills/:skillId', authenticateToken, enforceScope, validateIdParam, employeeController.deleteSkill);

// Employee Master — Education
router.get('/employees/:id/education', authenticateToken, enforceScope, validateIdParam, employeeController.getEducation);
router.post('/employees/:id/education', authenticateToken, enforceScope, validateIdParam, employeeController.addEducation);
router.put('/employees/:id/education/:eduId', authenticateToken, enforceScope, validateIdParam, employeeController.updateEducation);
router.delete('/employees/:id/education/:eduId', authenticateToken, enforceScope, validateIdParam, employeeController.deleteEducation);

// Employee Master — Experience
router.get('/employees/:id/experience', authenticateToken, enforceScope, validateIdParam, employeeController.getExperience);
router.post('/employees/:id/experience', authenticateToken, enforceScope, validateIdParam, employeeController.addExperience);
router.put('/employees/:id/experience/:expId', authenticateToken, enforceScope, validateIdParam, employeeController.updateExperience);
router.delete('/employees/:id/experience/:expId', authenticateToken, enforceScope, validateIdParam, employeeController.deleteExperience);

// Team CRUD Route mappings
router.get('/teams', authenticateToken, authenticatedUserLimiter, employeeController.getTeams);
router.get('/teams/:id/members', authenticateToken, enforceScope, validateIdParam, employeeController.getTeamMembers);

// Org, Dept & RBAC Route mappings
router.get('/departments', authenticateToken, authenticatedUserLimiter, organizationController.getDepartments);
router.post('/departments', authenticateToken, authorizeRoles(['ADMIN', 'HR']), organizationController.createDepartment);
router.get('/organizations', authenticateToken, authenticatedUserLimiter, organizationController.getOrganizations);
// Roles & Permissions
router.get('/roles', authenticateToken, authenticatedUserLimiter, organizationController.getRoles);
router.get('/permissions', authenticateToken, authenticatedUserLimiter, organizationController.getPermissions);

// Job Families & Job Roles
router.get('/job-families', authenticateToken, authenticatedUserLimiter, jobRoleController.getJobFamilies);
router.get('/job-roles', authenticateToken, authenticatedUserLimiter, jobRoleController.getJobRoles);
router.get('/analytics/job-roles', authenticateToken, authenticatedUserLimiter, jobRoleController.getJobRoleAnalytics);

// Locations — full CRUD (Admin + HR)
router.get('/locations', authenticateToken, authenticatedUserLimiter, organizationController.getLocations);
router.get('/locations/:id', authenticateToken, authenticatedUserLimiter, validateIdParam, organizationController.getLocationById);
router.post('/locations', authenticateToken, authorizeRoles(['ADMIN', 'HR']), organizationController.createLocation);
router.put('/locations/:id', authenticateToken, authorizeRoles(['ADMIN', 'HR']), validateIdParam, organizationController.updateLocation);
router.delete('/locations/:id', authenticateToken, authorizeRoles(['ADMIN']), validateIdParam, organizationController.deleteLocation);

// Designations — full CRUD (Admin + HR)
router.get('/designations', authenticateToken, authenticatedUserLimiter, organizationController.getDesignations);
router.post('/designations', authenticateToken, authorizeRoles(['ADMIN', 'HR']), organizationController.createDesignation);
router.put('/designations/:id', authenticateToken, authorizeRoles(['ADMIN', 'HR']), validateIdParam, organizationController.updateDesignation);
router.delete('/designations/:id', authenticateToken, authorizeRoles(['ADMIN']), validateIdParam, organizationController.deleteDesignation);

// Job Levels — full CRUD (Admin + HR)
router.get('/job-levels', authenticateToken, authenticatedUserLimiter, organizationController.getJobLevels);
router.post('/job-levels', authenticateToken, authorizeRoles(['ADMIN', 'HR']), organizationController.createJobLevel);
router.put('/job-levels/:id', authenticateToken, authorizeRoles(['ADMIN', 'HR']), validateIdParam, organizationController.updateJobLevel);
router.delete('/job-levels/:id', authenticateToken, authorizeRoles(['ADMIN']), validateIdParam, organizationController.deleteJobLevel);

// Cost Centers — full CRUD (Admin + HR)
router.get('/cost-centers', authenticateToken, authenticatedUserLimiter, organizationController.getCostCenters);
router.post('/cost-centers', authenticateToken, authorizeRoles(['ADMIN', 'HR']), organizationController.createCostCenter);
router.put('/cost-centers/:id', authenticateToken, authorizeRoles(['ADMIN', 'HR']), validateIdParam, organizationController.updateCostCenter);
router.delete('/cost-centers/:id', authenticateToken, authorizeRoles(['ADMIN']), validateIdParam, organizationController.deleteCostCenter);

// Org Policies (Admin + HR)
router.get('/org-policies', authenticateToken, authenticatedUserLimiter, organizationController.getOrgPolicies);
router.post('/org-policies', authenticateToken, authorizeRoles(['ADMIN', 'HR']), organizationController.upsertOrgPolicy);

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
router.post('/leave-requests/bulk-review', authenticateToken, authorizeRoles(['ADMIN', 'HR', 'MANAGER', 'TEAM_LEAD']), authenticatedUserLimiter, workforceController.bulkReviewLeaveRequests);
router.put('/leave-requests/:id', authenticateToken, authorizeRoles(['ADMIN', 'HR', 'MANAGER', 'TEAM_LEAD']), validateIdParam, idempotencyMiddleware, validateReviewLeaveRequest, workforceController.reviewLeaveRequest);
router.put('/leave-requests/:id/review', authenticateToken, authorizeRoles(['ADMIN', 'HR', 'MANAGER', 'TEAM_LEAD']), validateIdParam, idempotencyMiddleware, validateReviewLeaveRequest, workforceController.reviewLeaveRequest);

router.get('/leave-policies', authenticateToken, authorizeRoles(['ADMIN', 'HR']), workforceController.getLeavePolicies);
router.post('/leave-policies', authenticateToken, authorizeRoles(['ADMIN', 'HR']), workforceController.createLeavePolicy);

router.get('/tasks', authenticateToken, enforceScope, authenticatedUserLimiter, workforceController.getTasks);
router.put('/tasks/:id', authenticateToken, validateIdParam, validateUpdateTask, workforceController.updateTask);

// Corrections Requests
router.post('/attendance/corrections', authenticateToken, enforceScope, validateCorrectionRequest, idempotencyMiddleware, authenticatedUserLimiter, attendanceController.submitCorrection);
router.get('/attendance/corrections', authenticateToken, enforceScope, authenticatedUserLimiter, attendanceController.getCorrections);
router.post('/attendance/corrections/bulk-review', authenticateToken, authorizeRoles(['ADMIN', 'HR', 'MANAGER', 'TEAM_LEAD']), authenticatedUserLimiter, attendanceController.bulkReviewCorrections);
router.put('/attendance/corrections/:id', authenticateToken, authorizeRoles(['ADMIN', 'HR', 'MANAGER', 'TEAM_LEAD']), validateIdParam, idempotencyMiddleware, validateReviewCorrection, attendanceController.reviewCorrection);

// Phase 2: Org-wide live status & monthly summaries
router.get('/attendance/live-status', authenticateToken, authorizeRoles(['ADMIN', 'HR', 'MANAGER']), authenticatedUserLimiter, attendanceP2.getLiveStatus);
router.get('/attendance/monthly-summary', authenticateToken, authorizeRoles(['ADMIN', 'HR']), authenticatedUserLimiter, attendanceP2.getOrgMonthlySummary);
router.get('/attendance/monthly-summary/:employeeId', authenticateToken, enforceScope, authenticatedUserLimiter, attendanceP2.getEmployeeMonthlySummary);
router.post('/attendance/monthly-summary/:employeeId/compute', authenticateToken, authorizeRoles(['ADMIN', 'HR']), authenticatedUserLimiter, attendanceP2.triggerComputeSummary);

// Phase 2: Shifts CRUD
router.get('/shifts', authenticateToken, authenticatedUserLimiter, attendanceP2.listShifts);
router.post('/shifts', authenticateToken, authorizeRoles(['ADMIN', 'HR']), authenticatedUserLimiter, attendanceP2.createShift);
router.put('/shifts/:id', authenticateToken, authorizeRoles(['ADMIN', 'HR']), validateIdParam, authenticatedUserLimiter, attendanceP2.updateShift);
router.delete('/shifts/:id', authenticateToken, authorizeRoles(['ADMIN']), validateIdParam, authenticatedUserLimiter, attendanceP2.deleteShift);

// Holidays & Work Configs
router.get('/holidays', authenticateToken, authenticatedUserLimiter, performanceController.getHolidays);
router.post('/holidays', authenticateToken, authorizeRoles(['ADMIN', 'HR']), authenticatedUserLimiter, performanceController.addHoliday);
router.delete('/holidays/:id', authenticateToken, authorizeRoles(['ADMIN', 'HR']), validateIdParam, authenticatedUserLimiter, performanceController.deleteHoliday);

router.get('/work-configs', authenticateToken, authenticatedUserLimiter, performanceController.getWorkConfigs);
router.post('/work-configs', authenticateToken, authorizeRoles(['ADMIN', 'HR']), authenticatedUserLimiter, performanceController.createWorkConfig);

// Phase 2: Employee Shift Assignments
router.post('/employees/:id/shift-assignment', authenticateToken, authorizeRoles(['ADMIN', 'HR']), validateIdParam, authenticatedUserLimiter, attendanceP2.assignShift);

// Notifications
router.get('/notifications', authenticateToken, authenticatedUserLimiter, notificationController.getNotifications);
router.put('/notifications/read-all', authenticateToken, authenticatedUserLimiter, notificationController.markAllAsRead);
router.put('/notifications/:id/read', authenticateToken, validateIdParam, authenticatedUserLimiter, notificationController.markAsRead);
router.get('/notifications/preferences', authenticateToken, authenticatedUserLimiter, notificationController.getPreferences);
router.put('/notifications/preferences', authenticateToken, authenticatedUserLimiter, notificationController.updatePreferences);
router.get('/employees/:id/shift-assignment', authenticateToken, enforceScope, validateIdParam, authenticatedUserLimiter, attendanceP2.getCurrentShift);

// Analytics
router.get('/analytics', authenticateToken, enforceScope, authenticatedUserLimiter, analyticsController.getAnalytics);
router.get('/dashboard/metrics', authenticateToken, enforceScope, authenticatedUserLimiter, analyticsController.getAnalytics);

// Dashboard specific endpoints (Phase 2: Role-Specific)
router.get('/dashboard/admin', authenticateToken, authorizeRoles(['ADMIN']), authenticatedUserLimiter, adminDashboardController.getAdminDashboard);
router.get('/dashboard/hr', authenticateToken, authorizeRoles(['ADMIN', 'HR']), authenticatedUserLimiter, hrDashboardController.getHrDashboard);
router.get('/dashboard/manager', authenticateToken, authorizeRoles(['ADMIN', 'MANAGER']), authenticatedUserLimiter, managerDashboardController.getManagerDashboard);
router.get('/dashboard/team-lead', authenticateToken, authorizeRoles(['ADMIN', 'TEAM_LEAD']), authenticatedUserLimiter, teamLeadDashboardController.getTeamLeadDashboard);
router.get('/dashboard/employee', authenticateToken, enforceScope, authenticatedUserLimiter, employeeDashboardController.getEmployeeDashboard);

// Legacy Analytics endpoints
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
router.get('/reports/workforce/export', authenticateToken, enforceScope, authorizeRoles(['ADMIN', 'HR']), reportController.exportWorkforceReport);
router.get('/reports/leave/export', authenticateToken, enforceScope, authorizeRoles(['ADMIN', 'HR', 'MANAGER', 'TEAM_LEAD']), reportController.exportLeaveReport);
router.get('/reports/payroll/export', authenticateToken, enforceScope, authorizeRoles(['ADMIN', 'HR']), reportController.exportPayrollReport);
router.get('/reports/statutory/export', authenticateToken, enforceScope, authorizeRoles(['ADMIN', 'HR']), reportController.exportStatutoryReport);
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

// ─── File Uploads ──────────────────────────────────────────────────────────
router.post('/upload', authenticateToken, authenticatedUserLimiter, uploadMiddleware.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded.' });
  }
  const user = (req as any).user;
  const orgId = user?.organizationId || user?.companyId || 'org-stackly';
  const url = `/uploads/${orgId}/${req.file.filename}`;
  res.status(201).json({ success: true, url });
});

// ─── Employee Lifecycle (Step 2) ────────────────────────────────────────────
router.get('/employees/:id/status-history', authenticateToken, enforceScope, authenticatedUserLimiter, lifecycleController.getStatusHistory);
router.get('/employees/:id/field-history', authenticateToken, authorizeRoles(['ADMIN', 'HR']), authenticatedUserLimiter, lifecycleController.getFieldHistory);
router.post('/employees/:id/transition', authenticateToken, authorizeRoles(['ADMIN', 'HR']), authenticatedUserLimiter, lifecycleController.transitionStatus);
router.get('/employees/:id/documents', authenticateToken, enforceScope, authenticatedUserLimiter, lifecycleController.getDocuments);
router.post('/employees/:id/documents', authenticateToken, authorizeRoles(['ADMIN', 'HR']), authenticatedUserLimiter, lifecycleController.addDocument);

// Full & Final Settlement (F&F)
router.get('/payroll/fnf', authenticateToken, authorizeRoles(['ADMIN', 'HR']), authenticatedUserLimiter, lifecycleController.listFnFSettlements);
router.post('/payroll/fnf', authenticateToken, authorizeRoles(['ADMIN', 'HR']), authenticatedUserLimiter, lifecycleController.calculateFnFSettlement);
router.post('/payroll/fnf/:id/approve', authenticateToken, authorizeRoles(['ADMIN', 'HR']), validateIdParam, authenticatedUserLimiter, lifecycleController.approveFnFSettlement);


// ─── Leave Engine (Step 3) ───────────────────────────────────────────────────
router.get('/leave/types', authenticateToken, authenticatedUserLimiter, performanceController.getLeaveTypes);
router.get('/leave-types', authenticateToken, authenticatedUserLimiter, performanceController.getLeaveTypes);
router.post('/leave/types', authenticateToken, authorizeRoles(['ADMIN', 'HR']), authenticatedUserLimiter, performanceController.createLeaveType);
router.post('/leave-types', authenticateToken, authorizeRoles(['ADMIN', 'HR']), authenticatedUserLimiter, performanceController.createLeaveType);
router.get('/leave/balances/:employeeId', authenticateToken, enforceScope, authenticatedUserLimiter, performanceController.getLeaveBalances);
router.get('/leave-balances', authenticateToken, enforceScope, authenticatedUserLimiter, performanceController.getLeaveBalances);
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

// ─── Payroll & Compensation Engine ─────────────────────────────────────────
router.get('/payroll/salary/:employeeId', authenticateToken, authorizeRoles(['ADMIN', 'HR', 'EMPLOYEE']), enforceScope, authenticatedUserLimiter, payrollController.getSalaryStructure);
router.post('/payroll/salary/:employeeId', authenticateToken, authorizeRoles(['ADMIN', 'HR']), authenticatedUserLimiter, payrollController.setSalaryStructure);
router.get('/payroll/salary/:employeeId/revisions', authenticateToken, authorizeRoles(['ADMIN', 'HR', 'EMPLOYEE']), enforceScope, authenticatedUserLimiter, payrollController.getSalaryRevisionHistory);

router.post('/payroll/ctc/calculate', authenticateToken, authorizeRoles(['ADMIN', 'HR', 'MANAGER']), authenticatedUserLimiter, payrollController.calculateCtc);

router.get('/payroll/runs', authenticateToken, authorizeRoles(['ADMIN', 'HR', 'MANAGER']), authenticatedUserLimiter, payrollController.getPayrollRuns);
router.post('/payroll/runs', authenticateToken, authorizeRoles(['ADMIN', 'HR']), authenticatedUserLimiter, payrollController.createPayrollRun);
router.post('/payroll/runs/:runId/calculate', authenticateToken, authorizeRoles(['ADMIN', 'HR']), authenticatedUserLimiter, payrollController.calculatePayrollRun);
router.post('/payroll/runs/:runId/generate', authenticateToken, authorizeRoles(['ADMIN', 'HR']), authenticatedUserLimiter, payrollController.calculatePayrollRun);
router.post('/payroll/runs/:runId/validate', authenticateToken, authorizeRoles(['ADMIN', 'HR']), authenticatedUserLimiter, payrollController.validatePayrollRun);
router.post('/payroll/runs/:runId/submit', authenticateToken, authorizeRoles(['ADMIN', 'HR']), authenticatedUserLimiter, payrollController.submitPayrollRun);
router.post('/payroll/runs/:runId/approve', authenticateToken, authorizeRoles(['ADMIN', 'HR', 'MANAGER']), authenticatedUserLimiter, payrollController.approvePayrollRun);
router.post('/payroll/runs/:runId/reject', authenticateToken, authorizeRoles(['ADMIN', 'HR', 'MANAGER']), authenticatedUserLimiter, payrollController.rejectPayrollRun);
router.post('/payroll/runs/:runId/lock', authenticateToken, authorizeRoles(['ADMIN']), authenticatedUserLimiter, payrollController.lockPayrollRun);
router.post('/payroll/runs/:runId/finalize', authenticateToken, authorizeRoles(['ADMIN']), authenticatedUserLimiter, payrollController.finalizePayrollRun);
router.post('/payroll/runs/:runId/rollback', authenticateToken, authorizeRoles(['ADMIN', 'HR']), authenticatedUserLimiter, payrollController.rollbackPayrollRun);
router.post('/payroll/runs/:runId/reverse', authenticateToken, authorizeRoles(['ADMIN']), authenticatedUserLimiter, payrollController.reversePayrollRun);

router.get('/payroll/runs/:runId/payslips', authenticateToken, authorizeRoles(['ADMIN', 'HR', 'MANAGER']), authenticatedUserLimiter, payrollController.getRunPayslips);
router.get('/payroll/runs/:runId/register', authenticateToken, authorizeRoles(['ADMIN', 'HR']), authenticatedUserLimiter, payrollController.getPayrollRegister);
router.get('/payroll/departments/summary', authenticateToken, authorizeRoles(['ADMIN', 'HR', 'MANAGER']), authenticatedUserLimiter, payrollController.getDepartmentSummary);

router.get('/payroll/payslips/me', authenticateToken, authenticatedUserLimiter, payrollController.getMyPayslips);
router.get('/payroll/payslips/:payslipId/pdf', authenticateToken, authenticatedUserLimiter, payrollController.getPayslipPdf);

router.get('/payroll/ytd/:employeeId', authenticateToken, enforceScope, authenticatedUserLimiter, payrollController.getEmployeeYtd);
router.get('/payroll/tax/:employeeId', authenticateToken, enforceScope, authenticatedUserLimiter, payrollController.getEmployeeTaxProfile);
router.post('/payroll/tax/:employeeId', authenticateToken, enforceScope, authenticatedUserLimiter, payrollController.upsertEmployeeTaxProfile);
router.get('/payroll/tax/:employeeId/form16', authenticateToken, enforceScope, authenticatedUserLimiter, payrollController.getForm16Pdf);

// ─── Compliance (Phase 5) ────────────────────────────────────────────────────
router.get('/compliance/config', authenticateToken, authorizeRoles(['ADMIN', 'HR']), authenticatedUserLimiter, complianceController.getComplianceConfigs);
router.post('/compliance/config', authenticateToken, authorizeRoles(['ADMIN', 'HR']), authenticatedUserLimiter, complianceController.setComplianceConfig);

// ─── Approval Workflow (Step 9) ──────────────────────────────────────────────
router.get('/workflows/pending', authenticateToken, authenticatedUserLimiter, workflowController.getPendingApprovals);
router.post('/workflows/requests/:requestId/action', authenticateToken, authenticatedUserLimiter, workflowController.takeApprovalAction);

// ─── Expenses (Phase 8) ──────────────────────────────────────────────────
router.post('/expenses', authenticateToken, authenticatedUserLimiter, expenseController.submitExpense);
router.get('/expenses/me', authenticateToken, authenticatedUserLimiter, expenseController.getMyExpenses);

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

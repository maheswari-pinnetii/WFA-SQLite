import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  EMAIL_REGEX,
  COMPANY_EMAIL_REGEX,
  EMPLOYEE_ID_REGEX,
  loginSchema,
  registrationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  mfaVerifySchema,
  mfaResendSchema,
  totpConfirmSchema,
  attendanceActionSchema,
  leaveRequestSchema,
  reviewLeaveRequestSchema,
  correctionRequestSchema,
  reviewCorrectionSchema,
  updateUserRoleSchema,
  backupRestoreSchema,
  featureFlagUpdateSchema,
  saveTrustedDeviceSchema,
  verifyTrustedDeviceSchema,
  biometricLoginSchema,
  passkeyLoginOptionsSchema,
  passkeyLoginVerifySchema,
  passkeyRegisterVerifySchema,
  verifyEmailSchema,
  sendVerificationSchema,
  createEmployeeSchema,
  updateEmployeeSchema,
  updateEmployeeStatusSchema,
  updateTaskSchema,
  idParamSchema,
  userIdParamSchema,
  backupFilenameParamSchema,
  featureFlagParamSchema
} from '../schemas/validation.schemas.js';

// Clean prototype pollution without silently modifying legitimate inputs
export const preventPrototypePollution = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(preventPrototypePollution);
  if (typeof obj === 'object') {
    const cleaned: Record<string, any> = {};
    for (const key of Object.keys(obj)) {
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
      cleaned[key] = preventPrototypePollution(obj[key]);
    }
    return cleaned;
  }
  return obj;
};

// Global input guard middleware (guards prototype pollution while keeping inputs intact for strict schema rejection)
export const inputSanitizer = (req: Request, res: Response, next: NextFunction) => {
  if (req.body && typeof req.body === 'object') {
    req.body = preventPrototypePollution(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = preventPrototypePollution(req.query);
  }
  next();
};

// Generic schema validator for Request Body (Strict rejection)
export const validateBody = (schema: z.ZodTypeAny) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return res.status(400).json({
        success: false,
        message: firstIssue?.message || 'Invalid request body.',
        errors: result.error.issues.map(e => ({
          path: e.path.join('.'),
          message: e.message
        }))
      });
    }
    req.body = result.data;
    next();
  };
};

// Generic schema validator for Request Query (Strict rejection)
export const validateQuery = (schema: z.ZodTypeAny) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return res.status(400).json({
        success: false,
        message: firstIssue?.message || 'Invalid query parameters.',
        errors: result.error.issues.map(e => ({
          path: e.path.join('.'),
          message: e.message
        }))
      });
    }
    req.query = result.data as any;
    next();
  };
};

// Generic schema validator for Request Params (Strict rejection)
export const validateParams = (schema: z.ZodTypeAny) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return res.status(400).json({
        success: false,
        message: firstIssue?.message || 'Invalid route parameters.',
        errors: result.error.issues.map(e => ({
          path: e.path.join('.'),
          message: e.message
        }))
      });
    }
    req.params = result.data as any;
    next();
  };
};

// ─── SPECIFIC ROUTE VALIDATORS ───────────────────────────────────────────────

export const validateLogin = validateBody(loginSchema);

export const validateRegistration = (req: Request, res: Response, next: NextFunction) => {
  const result = registrationSchema.safeParse(req.body);
  if (!result.success) {
    const firstIssue = result.error.issues[0];
    return res.status(400).json({
      success: false,
      message: firstIssue?.message || 'Invalid registration payload.',
      errors: result.error.issues.map(e => ({
        path: e.path.join('.'),
        message: e.message
      }))
    });
  }
  const name = (result.data.name || result.data.fullName || '').trim();
  req.body = {
    ...result.data,
    name,
    fullName: name,
    employeeId: result.data.employeeId.toUpperCase()
  };
  next();
};

export const validateForgotPassword = validateBody(forgotPasswordSchema);
export const validateResetPassword = validateBody(resetPasswordSchema);
export const validateChangePassword = validateBody(changePasswordSchema);
export const validateMfaCode = validateBody(mfaVerifySchema);
export const validateMfaResend = validateBody(mfaResendSchema);
export const validateTotpCode = validateBody(totpConfirmSchema);
export const validateAttendanceAction = validateBody(attendanceActionSchema);
export const validateLeaveRequest = validateBody(leaveRequestSchema);
export const validateReviewLeaveRequest = validateBody(reviewLeaveRequestSchema);
export const validateCorrectionRequest = validateBody(correctionRequestSchema);
export const validateReviewCorrection = validateBody(reviewCorrectionSchema);
export const validateUpdateUserRole = validateBody(updateUserRoleSchema);
export const validateBackupRestore = validateBody(backupRestoreSchema);
export const validateSaveTrustedDevice = validateBody(saveTrustedDeviceSchema);
export const validateVerifyTrustedDevice = validateBody(verifyTrustedDeviceSchema);

export const validateBiometricLogin = validateBody(biometricLoginSchema);
export const validatePasskeyLoginOptions = validateBody(passkeyLoginOptionsSchema);
export const validatePasskeyLoginVerify = validateBody(passkeyLoginVerifySchema);
export const validatePasskeyRegisterVerify = validateBody(passkeyRegisterVerifySchema);
export const validateVerifyEmail = validateBody(verifyEmailSchema);
export const validateSendVerification = validateBody(sendVerificationSchema);

export const validateCreateEmployee = validateBody(createEmployeeSchema);
export const validateUpdateEmployee = validateBody(updateEmployeeSchema);
export const validateUpdateEmployeeStatus = validateBody(updateEmployeeStatusSchema);
export const validateUpdateTask = validateBody(updateTaskSchema);

export const validateIdParam = validateParams(idParamSchema);
export const validateUserIdParam = validateParams(userIdParamSchema);
export const validateBackupFilenameParam = validateParams(backupFilenameParamSchema);
export const validateFeatureFlagParam = validateParams(featureFlagParamSchema);
export const validateFeatureFlagUpdate = validateBody(featureFlagUpdateSchema);

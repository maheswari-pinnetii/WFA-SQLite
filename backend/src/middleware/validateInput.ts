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
  saveTrustedDeviceSchema,
  verifyTrustedDeviceSchema
} from '../schemas/validation.schemas.js';

// Sanitize string to prevent basic XSS and injection
export const sanitizeString = (str: string): string => {
  if (typeof str !== 'string') return str;
  return str
    .replace(/[<>]/g, '') // Strip angle brackets
    .trim();
};

// Deep sanitize request body objects
export const sanitizePayload = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') return sanitizeString(obj);
  if (Array.isArray(obj)) return obj.map(sanitizePayload);
  if (typeof obj === 'object') {
    const cleaned: Record<string, any> = {};
    for (const key of Object.keys(obj)) {
      // Prevent prototype pollution
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
      cleaned[key] = sanitizePayload(obj[key]);
    }
    return cleaned;
  }
  return obj;
};

// Global input sanitizer middleware
export const inputSanitizer = (req: Request, res: Response, next: NextFunction) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizePayload(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizePayload(req.query);
  }
  next();
};

// Generic schema validator for Request Body
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

// Generic schema validator for Request Query
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

// Generic schema validator for Request Params
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
      message: firstIssue?.message || 'Invalid registration payload.'
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

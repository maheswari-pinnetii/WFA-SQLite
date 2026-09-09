import { Request, Response } from 'express';
import { logger } from '../config/logger.js';

// ─── Domain-scoped error codes ─────────────────────────────────────────────────
export const ErrorCode = {
  // Auth
  AUTH_INVALID_CREDENTIALS:          'AUTH_INVALID_CREDENTIALS',
  AUTH_TOKEN_EXPIRED:                 'AUTH_TOKEN_EXPIRED',
  AUTH_TOKEN_INVALID:                 'AUTH_TOKEN_INVALID',
  AUTH_TOKEN_REVOKED:                 'AUTH_TOKEN_REVOKED',
  AUTH_ACCOUNT_LOCKED:               'AUTH_ACCOUNT_LOCKED',
  AUTH_ACCOUNT_DISABLED:             'AUTH_ACCOUNT_DISABLED',
  AUTH_MFA_REQUIRED:                  'AUTH_MFA_REQUIRED',
  AUTH_MFA_INVALID:                   'AUTH_MFA_INVALID',
  AUTH_SESSION_NOT_FOUND:            'AUTH_SESSION_NOT_FOUND',
  AUTH_PERMISSION_DENIED:            'AUTH_PERMISSION_DENIED',
  AUTH_TENANT_MISSING:               'AUTH_TENANT_MISSING',

  // Employee
  EMPLOYEE_NOT_FOUND:                'EMPLOYEE_NOT_FOUND',
  EMPLOYEE_ALREADY_EXISTS:           'EMPLOYEE_ALREADY_EXISTS',
  EMPLOYEE_ACCESS_DENIED:            'EMPLOYEE_ACCESS_DENIED',

  // Attendance
  ATTENDANCE_ALREADY_CHECKED_IN:     'ATTENDANCE_ALREADY_CHECKED_IN',
  ATTENDANCE_NOT_CHECKED_IN:         'ATTENDANCE_NOT_CHECKED_IN',
  ATTENDANCE_ALREADY_CHECKED_OUT:    'ATTENDANCE_ALREADY_CHECKED_OUT',
  ATTENDANCE_ALREADY_ON_BREAK:       'ATTENDANCE_ALREADY_ON_BREAK',
  ATTENDANCE_NOT_ON_BREAK:           'ATTENDANCE_NOT_ON_BREAK',
  ATTENDANCE_INVALID_TRANSITION:     'ATTENDANCE_INVALID_TRANSITION',
  ATTENDANCE_GEOFENCE_VIOLATION:     'ATTENDANCE_GEOFENCE_VIOLATION',
  ATTENDANCE_RECORD_NOT_FOUND:       'ATTENDANCE_RECORD_NOT_FOUND',
  ATTENDANCE_DUPLICATE_DATE:         'ATTENDANCE_DUPLICATE_DATE',

  // Leave
  LEAVE_INSUFFICIENT_BALANCE:        'LEAVE_INSUFFICIENT_BALANCE',
  LEAVE_REQUEST_NOT_FOUND:           'LEAVE_REQUEST_NOT_FOUND',
  LEAVE_INVALID_DATES:               'LEAVE_INVALID_DATES',
  LEAVE_OVERLAPPING_REQUEST:         'LEAVE_OVERLAPPING_REQUEST',
  LEAVE_ALREADY_CANCELLED:           'LEAVE_ALREADY_CANCELLED',
  LEAVE_TYPE_NOT_FOUND:              'LEAVE_TYPE_NOT_FOUND',

  // Payroll
  PAYROLL_RUN_NOT_FOUND:             'PAYROLL_RUN_NOT_FOUND',
  PAYROLL_RUN_ALREADY_FINALIZED:     'PAYROLL_RUN_ALREADY_FINALIZED',
  PAYROLL_RUN_ALREADY_LOCKED:        'PAYROLL_RUN_ALREADY_LOCKED',
  PAYROLL_NO_SALARY_STRUCTURE:       'PAYROLL_NO_SALARY_STRUCTURE',
  PAYROLL_PAYSLIP_NOT_FOUND:         'PAYROLL_PAYSLIP_NOT_FOUND',

  // Organization
  ORG_NOT_FOUND:                     'ORG_NOT_FOUND',
  ORG_ACCESS_DENIED:                 'ORG_ACCESS_DENIED',

  // Validation
  VALIDATION_ERROR:                  'VALIDATION_ERROR',
  MISSING_REQUIRED_FIELD:            'MISSING_REQUIRED_FIELD',

  // File
  FILE_TOO_LARGE:                    'FILE_TOO_LARGE',
  FILE_TYPE_NOT_ALLOWED:             'FILE_TYPE_NOT_ALLOWED',
  FILE_NOT_FOUND:                    'FILE_NOT_FOUND',

  // Generic
  NOT_FOUND:                         'NOT_FOUND',
  INTERNAL_SERVER_ERROR:             'INTERNAL_SERVER_ERROR',
  CONFLICT:                          'CONFLICT',
  RATE_LIMITED:                      'RATE_LIMITED',
  IDEMPOTENT_REPLAY:                 'IDEMPOTENT_REPLAY',
} as const;

export type ErrorCodeType = typeof ErrorCode[keyof typeof ErrorCode];

// ─── AppError class ────────────────────────────────────────────────────────────
export class AppError extends Error {
  public readonly code: ErrorCodeType;
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(code: ErrorCodeType, message: string, statusCode = 400, isOperational = true) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }

  static notFound(resource: string, code: ErrorCodeType = ErrorCode.NOT_FOUND) {
    return new AppError(code, `${resource} not found.`, 404);
  }

  static forbidden(code: ErrorCodeType = ErrorCode.AUTH_PERMISSION_DENIED) {
    return new AppError(code, 'You do not have permission to perform this action.', 403);
  }

  static conflict(code: ErrorCodeType, message: string) {
    return new AppError(code, message, 409);
  }

  static badRequest(code: ErrorCodeType, message: string) {
    return new AppError(code, message, 400);
  }

  static internal(message = 'An internal error occurred.') {
    return new AppError(ErrorCode.INTERNAL_SERVER_ERROR, message, 500, false);
  }
}

// ─── Standardized error response sender ───────────────────────────────────────
export const sendError = (res: Response, err: unknown, req?: Request): void => {
  const requestId = (res as any).locals?.requestId ?? (req as any)?.requestId ?? 'unknown';

  if (err instanceof AppError) {
    logger.error('api.error', err.message, { code: err.code, requestId, statusCode: err.statusCode });
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        requestId,
      },
    });
    return;
  }

  // Unknown / unexpected errors — never leak internals
  const raw = err as any;
  const message = raw?.message ?? 'An unexpected error occurred. Please try again later.';
  logger.error('api.error.unhandled', message, { requestId, stack: raw?.stack });

  res.status(500).json({
    success: false,
    error: {
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      message: 'An unexpected error occurred. Please try again later.',
      requestId,
    },
  });
};

import { Request, Response, NextFunction } from 'express';

// Email validation regex (RFC 5322 compliant subset)
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
const COMPANY_EMAIL_REGEX = /^[^\s@]+@thestackly\.com$/i;
const EMPLOYEE_ID_REGEX = /^STK-\d{4}-\d+$/i;

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

// Validate login request
export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    return res.status(400).json({ success: false, message: 'Valid email address is required.' });
  }
  if (!password || typeof password !== 'string' || password.length < 4) {
    return res.status(400).json({ success: false, message: 'Password must be provided.' });
  }
  next();
};

// Validate registration / user creation
export const validateRegistration = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  const name = req.body.fullName || req.body.name;
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({ success: false, message: 'Full name is required (at least 2 characters).' });
  }
  req.body.name = name.trim();
  req.body.fullName = name.trim();
  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim()) || !COMPANY_EMAIL_REGEX.test(email.trim())) {
    return res.status(400).json({ success: false, message: 'Use a valid company email ending with @thestackly.com.' });
  }
  const employeeId = typeof req.body.employeeId === 'string' ? req.body.employeeId.trim() : '';
  if (!EMPLOYEE_ID_REGEX.test(employeeId)) {
    return res.status(400).json({ success: false, message: 'Employee ID must use the format STK-YYYY-RollNumber.' });
  }
  req.body.employeeId = employeeId.toUpperCase();
  if (password !== undefined) {
    if (typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long.' });
    }
  }
  next();
};

// Validate MFA Verification Code
export const validateMfaCode = (req: Request, res: Response, next: NextFunction) => {
  const { otp, code, challengeId } = req.body;
  const token = otp || code;
  if (!token || typeof token !== 'string' || token.trim().length < 6) {
    return res.status(400).json({ success: false, message: 'Valid 6-digit verification code is required.' });
  }
  next();
};

// Validate Attendance Actions (Punch / Check-in / Check-out)
export const validateAttendanceAction = (req: Request, res: Response, next: NextFunction) => {
  const { latitude, longitude } = req.body;
  if (latitude !== undefined && (typeof latitude !== 'number' || latitude < -90 || latitude > 90)) {
    return res.status(400).json({ success: false, message: 'Invalid latitude coordinate (-90 to 90).' });
  }
  if (longitude !== undefined && (typeof longitude !== 'number' || longitude < -180 || longitude > 180)) {
    return res.status(400).json({ success: false, message: 'Invalid longitude coordinate (-180 to 180).' });
  }
  next();
};

// Validate Leave Request payload
export const validateLeaveRequest = (req: Request, res: Response, next: NextFunction) => {
  const { startDate, endDate, type, reason } = req.body;
  if (!startDate || !endDate) {
    return res.status(400).json({ success: false, message: 'Start date and end date are required.' });
  }
  if (new Date(startDate).toString() === 'Invalid Date' || new Date(endDate).toString() === 'Invalid Date') {
    return res.status(400).json({ success: false, message: 'Dates must be valid ISO date strings.' });
  }
  if (new Date(startDate) > new Date(endDate)) {
    return res.status(400).json({ success: false, message: 'Start date cannot be after end date.' });
  }
  next();
};

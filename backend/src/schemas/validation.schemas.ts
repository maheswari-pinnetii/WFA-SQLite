import { z } from 'zod';

// RFC 5322 compliant email regex
export const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
export const COMPANY_EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@thestackly\.com$/i;
export const EMPLOYEE_ID_REGEX = /^STK-\d{4}-\d+$/i;
export const SAFE_FILENAME_REGEX = /^[a-zA-Z0-9_-]+\.(sqlite|sqlite3|db|gz|bak|meta\.json)$/;

// ─── AUTH SCHEMAS ────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string({ required_error: 'Valid email address is required.' })
    .trim()
    .min(5, 'Email is too short.')
    .max(255, 'Email is too long.')
    .regex(EMAIL_REGEX, 'Valid email address is required.'),
  password: z.string({ required_error: 'Password must be provided.' })
    .min(1, 'Password must be provided.')
    .max(128, 'Password exceeds maximum length.')
}).strict();

export const registrationSchema = z.object({
  name: z.string().trim().min(2, 'Full name is required (at least 2 characters).').max(100).optional(),
  fullName: z.string().trim().min(2, 'Full name is required (at least 2 characters).').max(100).optional(),
  email: z.string({ required_error: 'Company email is required.' })
    .trim()
    .min(5)
    .max(255)
    .regex(COMPANY_EMAIL_REGEX, 'Use a valid company email ending with @thestackly.com.'),
  employeeId: z.string({ required_error: 'Employee ID is required.' })
    .trim()
    .regex(EMPLOYEE_ID_REGEX, 'Employee ID must use the format STK-YYYY-RollNumber.'),
  password: z.string().min(12, 'Password must be at least 12 characters long.').max(128)
    .refine((val) => /[A-Z]/.test(val), 'Password must contain uppercase character.')
    .refine((val) => /[a-z]/.test(val), 'Password must contain lowercase character.')
    .refine((val) => /[0-9]/.test(val), 'Password must contain a number.')
    .refine((val) => /[^A-Za-z0-9]/.test(val), 'Password must contain a special character.')
    .refine((val) => !['password123', 'StacklyWFA2026!', 'qwertyuiop', '1234567890'].includes(val), 'Password is too common or easily guessed.')
    .optional(),
  role: z.enum(['ADMIN', 'HR', 'MANAGER', 'TEAM_LEAD', 'EMPLOYEE']).optional(),
  departmentId: z.string().trim().max(100).optional(),
  locationId: z.string().trim().max(100).optional(),
  shiftId: z.string().trim().max(100).optional()
}).refine(data => data.name || data.fullName, {
  message: 'Full name is required (at least 2 characters).',
  path: ['name']
});

export const forgotPasswordSchema = z.object({
  email: z.string({ required_error: 'Valid email address is required.' })
    .trim()
    .min(5)
    .max(255)
    .regex(EMAIL_REGEX, 'Valid email address is required.')
}).strict();

export const resetPasswordSchema = z.object({
  token: z.string({ required_error: 'Reset token is required.' }).trim().min(8).max(256),
  newPassword: z.string({ required_error: 'New password is required.' })
    .min(8, 'Password must be at least 8 characters long.')
    .max(128)
    .refine((val) => /[A-Z]/.test(val) && /[a-z]/.test(val) && /[0-9]/.test(val) && /[^A-Za-z0-9]/.test(val), {
      message: 'Password must contain uppercase, lowercase, number, and special character.'
    })
}).strict();

export const changePasswordSchema = z.object({
  currentPassword: z.string({ required_error: 'Current password is required.' }).min(1).max(128),
  newPassword: z.string({ required_error: 'New password is required.' })
    .min(8, 'Password must be at least 8 characters long.')
    .max(128)
    .refine((val) => /[A-Z]/.test(val) && /[a-z]/.test(val) && /[0-9]/.test(val) && /[^A-Za-z0-9]/.test(val), {
      message: 'Password must contain uppercase, lowercase, number, and special character.'
    })
}).strict();

export const mfaVerifySchema = z.object({
  challengeId: z.string().trim().max(256).optional(),
  otp: z.string().trim().optional(),
  code: z.string().trim().optional()
}).refine(data => {
  const code = data.otp || data.code;
  return code && typeof code === 'string' && /^\d{6}$/.test(code);
}, {
  message: 'Valid 6-digit verification code is required.',
  path: ['otp']
});

export const mfaResendSchema = z.object({
  challengeId: z.string().trim().min(1).max(256).optional(),
  email: z.string().trim().regex(EMAIL_REGEX).max(255).optional()
}).strict();

export const totpConfirmSchema = z.object({
  code: z.string({ required_error: 'Valid 6-digit verification code is required.' })
    .trim()
    .regex(/^\d{6}$/, 'Valid 6-digit verification code is required.')
}).strict();

// ─── ATTENDANCE & WORKFORCE SCHEMAS ──────────────────────────────────────────

export const attendanceActionSchema = z.object({
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  accuracy: z.number().min(0).max(100000).optional(),
  deviceId: z.string().trim().max(255).optional(),
  note: z.string().trim().max(500).optional(),
  employeeId: z.string().trim().max(100).optional(),
  employeeName: z.string().trim().max(255).optional(),
  department: z.string().trim().max(100).optional(),
  shiftType: z.string().trim().max(100).optional(),
  workMode: z.string().trim().max(100).optional(),
  idempotencyKey: z.string().trim().max(255).optional()
}).passthrough();

export const leaveRequestSchema = z.object({
  startDate: z.string({ required_error: 'Start date is required.' }).refine(val => !isNaN(Date.parse(val)), {
    message: 'Start date must be a valid ISO date.'
  }),
  endDate: z.string({ required_error: 'End date is required.' }).refine(val => !isNaN(Date.parse(val)), {
    message: 'End date must be a valid ISO date.'
  }),
  type: z.enum(['ANNUAL', 'SICK', 'CASUAL', 'UNPAID', 'MATERNITY', 'PATERNITY', 'EMERGENCY'], {
    errorMap: () => ({ message: 'Invalid leave type.' })
  }),
  reason: z.string().trim().min(3, 'Reason is required (at least 3 characters).').max(500)
}).refine(data => new Date(data.startDate) <= new Date(data.endDate), {
  message: 'Start date cannot be after end date.',
  path: ['endDate']
});

export const reviewLeaveRequestSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED'], {
    errorMap: () => ({ message: 'Status must be either APPROVED or REJECTED.' })
  }),
  comments: z.string().trim().max(500).optional()
}).strict();

export const correctionRequestSchema = z.object({
  attendanceId: z.string({ required_error: 'Attendance record ID is required.' }).trim().min(1).max(100),
  proposedCheckIn: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), {
    message: 'Proposed check-in must be a valid date.'
  }),
  proposedCheckOut: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), {
    message: 'Proposed check-out must be a valid date.'
  }),
  reason: z.string().trim().min(3, 'Reason is required (at least 3 characters).').max(500)
});

export const reviewCorrectionSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  reviewerNote: z.string().trim().max(500).optional()
}).strict();

// ─── ADMIN & SYSTEM SCHEMAS ──────────────────────────────────────────────────

export const updateUserRoleSchema = z.object({
  role: z.enum(['ADMIN', 'HR', 'MANAGER', 'TEAM_LEAD', 'EMPLOYEE'], {
    errorMap: () => ({ message: 'Invalid role specified.' })
  })
}).strict();

export const backupRestoreSchema = z.object({
  filename: z.string({ required_error: 'Backup filename is required.' })
    .trim()
    .min(1)
    .max(255)
    .regex(SAFE_FILENAME_REGEX, 'Invalid or unsafe backup filename.')
}).strict();

export const featureFlagUpdateSchema = z.object({
  enabled: z.boolean({ required_error: 'Enabled flag must be a boolean.' })
}).strict();

// ─── TRUSTED DEVICES SCHEMAS ─────────────────────────────────────────────────

export const saveTrustedDeviceSchema = z.object({
  email: z.string().trim().regex(EMAIL_REGEX).max(255).optional(),
  deviceName: z.string().trim().min(1, 'Device name is required.').max(150),
  authMethod: z.enum(['face', 'biometric', 'screen_lock', 'device_pin', 'pattern']),
  deviceFingerprint: z.string().trim().min(8, 'Valid device fingerprint is required.').max(256),
  pin: z.string().trim().max(32).optional(),
  pattern: z.array(z.number()).max(30).optional(),
  saveTrustedDevice: z.boolean().optional()
});

export const verifyTrustedDeviceSchema = z.object({
  email: z.string().trim().max(255).optional(),
  deviceFingerprint: z.string({ required_error: 'Device fingerprint is required.' }).trim().min(8).max(256)
});

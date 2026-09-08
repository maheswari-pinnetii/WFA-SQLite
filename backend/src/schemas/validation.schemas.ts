import { z } from 'zod';

// RFC 5322 compliant email regex
export const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
export const COMPANY_EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@thestackly\.com$/i;
export const EMPLOYEE_ID_REGEX = /^STK-\d{4}-\d+$/i;
export const SAFE_FILENAME_REGEX = /^[a-zA-Z0-9_-]+\.(sqlite|sqlite3|db|gz|bak|meta\.json)$/;

// ─── AUTH SCHEMAS ────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string({ message: 'Valid email address is required.' })
    .trim()
    .min(5, 'Email is too short.')
    .max(255, 'Email is too long.')
    .regex(EMAIL_REGEX, 'Valid email address is required.'),
  password: z.string({ message: 'Password must be provided.' })
    .min(1, 'Password must be provided.')
    .max(128, 'Password exceeds maximum length.')
}).strict();

export const registrationSchema = z.object({
  name: z.string().trim().min(2, 'Full name is required (at least 2 characters).').max(100).optional(),
  fullName: z.string().trim().min(2, 'Full name is required (at least 2 characters).').max(100).optional(),
  email: z.string({ message: 'Company email is required.' })
    .trim()
    .min(5)
    .max(255)
    .regex(COMPANY_EMAIL_REGEX, 'Use a valid company email ending with @thestackly.com.'),
  employeeId: z.string({ message: 'Employee ID is required.' })
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
}).strict().refine(data => data.name || data.fullName, {
  message: 'Full name is required (at least 2 characters).',
  path: ['name']
});

export const forgotPasswordSchema = z.object({
  email: z.string({ message: 'Valid email address is required.' })
    .trim()
    .min(5)
    .max(255)
    .regex(EMAIL_REGEX, 'Valid email address is required.')
}).strict();

export const resetPasswordSchema = z.object({
  token: z.string({ message: 'Reset token is required.' }).trim().min(8).max(256),
  newPassword: z.string({ message: 'New password is required.' })
    .min(8, 'Password must be at least 8 characters long.')
    .max(128)
    .refine((val) => /[A-Z]/.test(val) && /[a-z]/.test(val) && /[0-9]/.test(val) && /[^A-Za-z0-9]/.test(val), {
      message: 'Password must contain uppercase, lowercase, number, and special character.'
    })
}).strict();

export const changePasswordSchema = z.object({
  currentPassword: z.string({ message: 'Current password is required.' }).min(1).max(128),
  newPassword: z.string({ message: 'New password is required.' })
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
  code: z.string({ message: 'Valid 6-digit verification code is required.' })
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
  startDate: z.string({ message: 'Start date is required.' }).refine(val => !isNaN(Date.parse(val)), {
    message: 'Start date must be a valid ISO date.'
  }),
  endDate: z.string({ message: 'End date is required.' }).refine(val => !isNaN(Date.parse(val)), {
    message: 'End date must be a valid ISO date.'
  }),
  type: z.enum(['ANNUAL', 'SICK', 'CASUAL', 'UNPAID', 'MATERNITY', 'PATERNITY', 'EMERGENCY'], {
    message: 'Invalid leave type.'
  }),
  reason: z.string().trim().min(3, 'Reason is required (at least 3 characters).').max(500)
}).refine(data => new Date(data.startDate) <= new Date(data.endDate), {
  message: 'Start date cannot be after end date.',
  path: ['endDate']
});

export const reviewLeaveRequestSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED'], {
    message: 'Status must be either APPROVED or REJECTED.'
  }),
  comments: z.string().trim().max(500).optional()
}).strict();

export const correctionRequestSchema = z.object({
  attendanceId: z.string({ message: 'Attendance record ID is required.' }).trim().min(1).max(100),
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
    message: 'Invalid role specified.'
  })
}).strict();

export const backupRestoreSchema = z.object({
  filename: z.string({ message: 'Backup filename is required.' })
    .trim()
    .min(1)
    .max(255)
    .regex(SAFE_FILENAME_REGEX, 'Invalid or unsafe backup filename.')
}).strict();

export const featureFlagUpdateSchema = z.object({
  enabled: z.boolean({ message: 'Enabled flag must be a boolean.' })
}).strict();

// ─── TRUSTED DEVICES SCHEMAS ─────────────────────────────────────────────────

export const saveTrustedDeviceSchema = z.object({
  email: z.string().trim().regex(EMAIL_REGEX).max(255).optional(),
  userId: z.string().trim().max(128).optional(),
  deviceName: z.string().trim().min(1, 'Device name is required.').max(150),
  authMethod: z.enum(['face', 'biometric', 'screen_lock', 'device_pin', 'pattern']),
  deviceFingerprint: z.string().trim().min(8, 'Valid device fingerprint is required.').max(256),
  deviceType: z.string().trim().max(50).optional(),
  pin: z.string().trim().max(32).optional(),
  pattern: z.array(z.number()).max(30).optional(),
  saveTrustedDevice: z.boolean().optional()
}).strict();

export const verifyTrustedDeviceSchema = z.object({
  email: z.string().trim().max(255).optional(),
  deviceFingerprint: z.string({ message: 'Device fingerprint is required.' }).trim().min(8).max(256)
}).strict();

// ─── EXTENDED ROUTE SCHEMAS (EMPLOYEES, TASKS, BIOMETRIC, PASSKEYS) ──────────

export const biometricLoginSchema = z.object({
  email: z.string({ message: 'Valid email address is required.' }).trim().regex(EMAIL_REGEX, 'Valid email address is required.').max(255),
  authMethod: z.enum(['face', 'biometric', 'device_pin', 'pattern', 'screen_lock']).optional(),
  pin: z.string().trim().regex(/^\d{4}$/, 'Device PIN must be 4 numeric digits.').optional(),
  pattern: z.array(z.number().int().min(0).max(8)).min(4, 'Pattern lock must connect at least 4 nodes.').max(9).optional(),
  deviceFingerprint: z.string().trim().max(256).optional(),
  deviceName: z.string().trim().max(150).optional(),
  saveTrustedDevice: z.boolean().optional()
}).strict();

export const passkeyLoginOptionsSchema = z.object({
  email: z.string().trim().regex(EMAIL_REGEX).max(255).optional()
}).strict();

export const passkeyLoginVerifySchema = z.object({
  assertionResponse: z.object({
    id: z.string().trim().min(1).max(1024),
    rawId: z.string().optional(),
    response: z.record(z.string(), z.any()),
    type: z.string().optional(),
    clientExtensionResults: z.record(z.string(), z.any()).optional(),
    authenticatorAttachment: z.string().optional()
  }),
  email: z.string().trim().regex(EMAIL_REGEX).max(255).optional()
}).passthrough();

export const passkeyRegisterVerifySchema = z.object({
  attestationResponse: z.object({
    id: z.string().trim().min(1).max(1024),
    rawId: z.string().optional(),
    response: z.record(z.string(), z.any()),
    type: z.string().optional(),
    clientExtensionResults: z.record(z.string(), z.any()).optional(),
    authenticatorAttachment: z.string().optional()
  }),
  email: z.string().trim().regex(EMAIL_REGEX).max(255).optional()
}).passthrough();

export const verifyEmailSchema = z.object({
  token: z.string().trim().min(1).max(256).optional(),
  code: z.string().trim().min(4).max(64).optional(),
  email: z.string().trim().regex(EMAIL_REGEX).max(255).optional()
}).refine(data => data.token || data.code, {
  message: 'Verification token or code is required.'
});

export const sendVerificationSchema = z.object({
  email: z.string().trim().regex(EMAIL_REGEX).max(255).optional()
}).strict();

export const createEmployeeSchema = z.object({
  id: z.string({ message: 'Employee ID is required.' }).trim().min(2).max(100),
  name: z.string({ message: 'Full name is required.' }).trim().min(2).max(100),
  email: z.string({ message: 'Company email is required.' }).trim().regex(EMAIL_REGEX, 'Valid email is required.').max(255),
  department: z.string({ message: 'Department is required.' }).trim().min(1).max(100),
  designation: z.string().trim().max(100).optional(),
  avatar: z.string().trim().max(500).optional(),
  joinDate: z.string().trim().max(50).optional(),
  team: z.string().trim().max(100).optional(),
  location: z.string().trim().max(100).optional()
}).strict();

export const updateEmployeeSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  department: z.string().trim().max(100).optional(),
  designation: z.string().trim().max(100).optional(),
  avatar: z.string().trim().max(500).optional(),
  team: z.string().trim().max(100).optional(),
  location: z.string().trim().max(100).optional(),
  performanceScore: z.number().min(0).max(100).optional(),
  attendanceRate: z.number().min(0).max(100).optional()
}).strict();

export const updateEmployeeStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'PRESENT', 'REMOTE', 'ON_LEAVE', 'OFFLINE', 'TERMINATED'], {
    message: 'Invalid employee status.'
  })
}).strict();

export const updateTaskSchema = z.object({
  status: z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED'], {
    message: 'Invalid task status.'
  })
}).strict();

export const idParamSchema = z.object({
  id: z.string().trim().min(1).max(128)
}).strict();

export const userIdParamSchema = z.object({
  userId: z.string().trim().min(1).max(128)
}).strict();

export const backupFilenameParamSchema = z.object({
  filename: z.string().trim().min(1).max(255).regex(SAFE_FILENAME_REGEX, 'Invalid or unsafe backup filename.')
}).strict();

export const featureFlagParamSchema = z.object({
  key: z.string().trim().min(1).max(100).regex(/^[a-zA-Z0-9._-]+$/, 'Invalid feature flag key.')
}).strict();

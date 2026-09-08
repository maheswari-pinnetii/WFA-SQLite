import { Router } from 'express';
import {
  register,
  login,
  getCurrentUser,
  generatePasskeyRegisterOptions,
  verifyPasskeyRegister,
  generatePasskeyLoginOptions,
  verifyPasskeyLogin,
  biometricLockLogin,
  saveTrustedDevice,
  getTrustedDevices,
  verifyTrustedDevice,
  revokeTrustedDevice,
} from '../controllers/authFlow.controller.js';
import {
  forgotPassword,
  resetPassword,
  changePassword,
  sendEmailVerification,
  verifyEmail
} from '../controllers/authSecurity.controller.js';
import { authenticateToken } from '../middleware/auth.js';
import { 
  loginRateLimiter, 
  registerRateLimiter, 
  passwordResetLimiter,
  otpRateLimiter
} from '../middleware/rateLimiter.js';

const router = Router();

// ======================================================================
// 1. Standard Authentication Routes (JWT-Based)
// ======================================================================

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user with standard credentials
 * @access  Public
 */
router.post('/register', registerRateLimiter, register);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user with email & password, returns JWT token
 * @access  Public
 */
router.post('/login', loginRateLimiter, login);

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user profile
 * @access  Private (Bearer Token)
 */
router.get('/me', authenticateToken as any, getCurrentUser);

// ======================================================================
// 1.5. Security & Account Recovery Routes
// ======================================================================

router.post('/forgot-password', passwordResetLimiter, forgotPassword);
router.post('/reset-password', passwordResetLimiter, resetPassword);
router.post('/change-password', authenticateToken as any, changePassword);
router.post('/send-verification', authenticateToken as any, otpRateLimiter, sendEmailVerification);
router.post('/verify-email', otpRateLimiter, verifyEmail);

// ======================================================================
// 2. Passkey / WebAuthn FIDO2 Passwordless Routes
// ======================================================================

/**
 * @route   POST /api/auth/passkey/register-options
 * @desc    Generate WebAuthn registration challenge & options
 * @access  Private (Bearer Token)
 */
router.post('/passkey/register-options', authenticateToken as any, generatePasskeyRegisterOptions);

/**
 * @route   POST /api/auth/passkey/register-verify
 * @desc    Verify public-key attestation & save user's passkey credential
 * @access  Private (Bearer Token)
 */
router.post('/passkey/register-verify', authenticateToken as any, verifyPasskeyRegister);

/**
 * @route   POST /api/auth/passkey/login-options
 * @desc    Generate WebAuthn assertion challenge & options for sign-in
 * @access  Public
 */
router.post('/passkey/login-options', generatePasskeyLoginOptions);

/**
 * @route   POST /api/auth/passkey/login-verify
 * @desc    Verify biometric assertion signature & issue JWT session
 * @access  Public
 */
router.post('/passkey/login-verify', verifyPasskeyLogin);

/**
 * @route   POST /api/auth/biometric/login
 * @desc    Authenticate with real-time biometric, Device PIN, pattern, or homescreen lock
 * @access  Public
 */
router.post('/biometric/login', biometricLockLogin);
router.post('/lock/login', biometricLockLogin);

// ======================================================================
// 3. Trusted Devices & Biometric / Homescreen Lock Routes
// ======================================================================

/**
 * @route   POST /api/auth/trusted-devices
 * @desc    Save/register a trusted device (Face, Biometric, or Homescreen Lock)
 * @access  Private (Bearer Token)
 */
router.post('/trusted-devices', authenticateToken as any, saveTrustedDevice);

/**
 * @route   GET /api/auth/trusted-devices
 * @desc    List all trusted devices for a user
 * @access  Private (Bearer Token)
 */
router.get('/trusted-devices', authenticateToken as any, getTrustedDevices);

/**
 * @route   POST /api/auth/trusted-devices/verify
 * @desc    Verify if a device fingerprint is an active trusted device
 * @access  Public
 */
router.post('/trusted-devices/verify', verifyTrustedDevice);

/**
 * @route   DELETE /api/auth/trusted-devices/:id
 * @desc    Revoke a saved trusted device
 * @access  Private (Bearer Token)
 */
router.delete('/trusted-devices/:id', authenticateToken as any, revokeTrustedDevice);

export default router;

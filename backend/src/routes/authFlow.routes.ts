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
  otpRateLimiter,
  publicApiLimiter,
  authenticatedUserLimiter
} from '../middleware/rateLimiter.js';
import {
  validateLogin,
  validateRegistration,
  validateForgotPassword,
  validateResetPassword,
  validateChangePassword,
  validateSendVerification,
  validateVerifyEmail,
  validateBiometricLogin,
  validatePasskeyLoginOptions,
  validatePasskeyLoginVerify,
  validatePasskeyRegisterVerify,
  validateSaveTrustedDevice,
  validateVerifyTrustedDevice,
  validateIdParam
} from '../middleware/validateInput.js';

const router = Router();

// ======================================================================
// 1. Standard Authentication Routes (JWT-Based)
// ======================================================================

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user with standard credentials
 * @access  Public
 */
router.post('/register', registerRateLimiter, validateRegistration, register);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user with email & password, returns JWT token
 * @access  Public
 */
router.post('/login', loginRateLimiter, validateLogin, login);

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user profile
 * @access  Private (Bearer Token)
 */
router.get('/me', authenticateToken as any, authenticatedUserLimiter, getCurrentUser);

// ======================================================================
// 1.5. Security & Account Recovery Routes
// ======================================================================

router.post('/forgot-password', passwordResetLimiter, validateForgotPassword, forgotPassword);
router.post('/reset-password', passwordResetLimiter, validateResetPassword, resetPassword);
router.post('/change-password', authenticateToken as any, passwordResetLimiter, validateChangePassword, changePassword);
router.post('/send-verification', authenticateToken as any, otpRateLimiter, validateSendVerification, sendEmailVerification);
router.post('/verify-email', otpRateLimiter, validateVerifyEmail, verifyEmail);

// ======================================================================
// 2. Passkey / WebAuthn FIDO2 Passwordless Routes
// ======================================================================

/**
 * @route   POST /api/auth/passkey/register-options
 * @desc    Generate WebAuthn registration challenge & options
 * @access  Private (Bearer Token)
 */
router.post('/passkey/register-options', authenticateToken as any, authenticatedUserLimiter, generatePasskeyRegisterOptions);

/**
 * @route   POST /api/auth/passkey/register-verify
 * @desc    Verify public-key attestation & save user's passkey credential
 * @access  Private (Bearer Token)
 */
router.post('/passkey/register-verify', authenticateToken as any, authenticatedUserLimiter, validatePasskeyRegisterVerify, verifyPasskeyRegister);

/**
 * @route   POST /api/auth/passkey/login-options
 * @desc    Generate WebAuthn assertion challenge & options for sign-in
 * @access  Public
 */
router.post('/passkey/login-options', publicApiLimiter, validatePasskeyLoginOptions, generatePasskeyLoginOptions);

/**
 * @route   POST /api/auth/passkey/login-verify
 * @desc    Verify biometric assertion signature & issue JWT session
 * @access  Public
 */
router.post('/passkey/login-verify', loginRateLimiter, validatePasskeyLoginVerify, verifyPasskeyLogin);

/**
 * @route   POST /api/auth/biometric/login
 * @desc    Authenticate with real-time biometric, Device PIN, pattern, or homescreen lock
 * @access  Public
 */
router.post('/biometric/login', loginRateLimiter, validateBiometricLogin, biometricLockLogin);
router.post('/lock/login', loginRateLimiter, validateBiometricLogin, biometricLockLogin);

// ======================================================================
// 3. Trusted Devices & Biometric / Homescreen Lock Routes
// ======================================================================

/**
 * @route   POST /api/auth/trusted-devices
 * @desc    Save/register a trusted device (Face, Biometric, or Homescreen Lock)
 * @access  Private (Bearer Token)
 */
router.post('/trusted-devices', authenticateToken as any, authenticatedUserLimiter, validateSaveTrustedDevice, saveTrustedDevice);

/**
 * @route   GET /api/auth/trusted-devices
 * @desc    List all trusted devices for a user
 * @access  Private (Bearer Token)
 */
router.get('/trusted-devices', authenticateToken as any, authenticatedUserLimiter, getTrustedDevices);

/**
 * @route   POST /api/auth/trusted-devices/verify
 * @desc    Verify if a device fingerprint is an active trusted device
 * @access  Public
 */
router.post('/trusted-devices/verify', publicApiLimiter, validateVerifyTrustedDevice, verifyTrustedDevice);

/**
 * @route   DELETE /api/auth/trusted-devices/:id
 * @desc    Revoke a saved trusted device
 * @access  Private (Bearer Token)
 */
router.delete('/trusted-devices/:id', authenticateToken as any, authenticatedUserLimiter, validateIdParam, revokeTrustedDevice);

export default router;

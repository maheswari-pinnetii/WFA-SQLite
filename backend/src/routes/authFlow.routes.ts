import { Router } from 'express';
import {
  register,
  login,
  getCurrentUser,
  generatePasskeyRegisterOptions,
  verifyPasskeyRegister,
  generatePasskeyLoginOptions,
  verifyPasskeyLogin,
  saveTrustedDevice,
  getTrustedDevices,
  verifyTrustedDevice,
  revokeTrustedDevice,
} from '../controllers/authFlow.controller.js';

const router = Router();

// ======================================================================
// 1. Standard Authentication Routes (JWT-Based)
// ======================================================================

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user with standard credentials
 * @access  Public
 */
router.post('/register', register);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user with email & password, returns JWT token
 * @access  Public
 */
router.post('/login', login);

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user profile
 * @access  Private (Bearer Token)
 */
router.get('/me', getCurrentUser);

// ======================================================================
// 2. Passkey / WebAuthn FIDO2 Passwordless Routes
// ======================================================================

/**
 * @route   POST /api/auth/passkey/register-options
 * @desc    Generate WebAuthn registration challenge & options
 * @access  Public
 */
router.post('/passkey/register-options', generatePasskeyRegisterOptions);

/**
 * @route   POST /api/auth/passkey/register-verify
 * @desc    Verify public-key attestation & save user's passkey credential
 * @access  Public
 */
router.post('/passkey/register-verify', verifyPasskeyRegister);

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

// ======================================================================
// 3. Trusted Devices & Biometric / Homescreen Lock Routes
// ======================================================================

/**
 * @route   POST /api/auth/trusted-devices
 * @desc    Save/register a trusted device (Face, Biometric, or Homescreen Lock)
 * @access  Public (or with Token)
 */
router.post('/trusted-devices', saveTrustedDevice);

/**
 * @route   GET /api/auth/trusted-devices
 * @desc    List all trusted devices for a user
 * @access  Public (or with Token)
 */
router.get('/trusted-devices', getTrustedDevices);

/**
 * @route   POST /api/auth/trusted-devices/verify
 * @desc    Verify if a device fingerprint is an active trusted device
 * @access  Public
 */
router.post('/trusted-devices/verify', verifyTrustedDevice);

/**
 * @route   DELETE /api/auth/trusted-devices/:id
 * @desc    Revoke a saved trusted device
 * @access  Public (or with Token)
 */
router.delete('/trusted-devices/:id', revokeTrustedDevice);

export default router;

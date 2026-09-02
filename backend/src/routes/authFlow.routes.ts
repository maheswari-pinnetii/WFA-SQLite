import { Router } from 'express';
import {
  register,
  login,
  getCurrentUser,
  generatePasskeyRegisterOptions,
  verifyPasskeyRegister,
  generatePasskeyLoginOptions,
  verifyPasskeyLogin,
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

export default router;

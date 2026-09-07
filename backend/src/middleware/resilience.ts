import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import compression from 'compression';
import crypto from 'crypto';
import logger from '../config/logger.js';

// Request ID injector
export const requestIdMiddleware = (req, res, next) => {
  req.requestId = req.headers['x-request-id'] || crypto.randomUUID();
  res.setHeader('X-Request-Id', req.requestId);
  
  // Log request arrival
  const startTime = Date.now();
  res.on('finish', () => {
    const durationMs = Date.now() - startTime;
    logger.info('http.request', `${req.method} ${req.originalUrl} - ${res.statusCode}`, {
      requestId: req.requestId,
      method: req.method,
      route: req.originalUrl,
      statusCode: res.statusCode,
      durationMs,
      ip: req.ip,
      userId: req.user?.id || null,
      role: req.user?.role || null
    });
  });
  next();
};

// Global rate limiting to protect the SQLite database from concurrent spikes
const globalLimiterInstance = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5000, // Limit each IP to 5000 requests per minute to allow spikes of 250 concurrent users making multiple API calls
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('rate_limit.exceeded', `IP ${req.ip} exceeded global rate limit`, { ip: req.ip });
    res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later.'
    });
  }
});

export const globalRateLimiter = (req, res, next) => {
  if (process.env.NODE_ENV === 'test') {
    return next();
  }
  return globalLimiterInstance(req, res, next);
};

// ─── Auth/Login Rate Limiter ─────────────────────────────────────────────────
// SECURITY FIX: Tightened from 10 to 5 requests per 15 minutes per IP
const authLimiterInstance = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts per IP per 15 minutes
  standardHeaders: true,   // Returns RateLimit-* headers
  legacyHeaders: false,
  handler: (req, res) => {
    const retryAfter = Math.ceil(15 * 60); // seconds
    res.set('Retry-After', String(retryAfter));
    logger.warn('security.rate_limit.auth', `IP ${req.ip} exceeded auth rate limit`, { ip: req.ip });
    res.status(429).json({
      success: false,
      message: 'Too many login attempts. Please try again in 15 minutes.',
      retryAfterSeconds: retryAfter
    });
  }
});

export const authRateLimiter = (req, res, next) => {
  if (process.env.NODE_ENV === 'test') return next();
  return authLimiterInstance(req, res, next);
};

// ─── Refresh Token Rate Limiter ───────────────────────────────────────────────
const refreshLimiterInstance = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 refresh requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const retryAfter = 60;
    res.set('Retry-After', String(retryAfter));
    logger.warn('security.rate_limit.refresh', `IP ${req.ip} exceeded refresh limit`, { ip: req.ip });
    res.status(429).json({
      success: false,
      message: 'Too many token refresh attempts. Please try again later.',
      retryAfterSeconds: retryAfter
    });
  }
});

export const refreshRateLimiter = (req, res, next) => {
  if (process.env.NODE_ENV === 'test') return next();
  return refreshLimiterInstance(req, res, next);
};

// ─── Forgot Password Rate Limiter ─────────────────────────────────────────────
// Critical: prevents mass reset email abuse
const forgotPasswordLimiterInstance = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per IP per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const retryAfter = Math.ceil(15 * 60);
    res.set('Retry-After', String(retryAfter));
    logger.warn('security.rate_limit.forgot_password', `IP ${req.ip} exceeded forgot-password limit`, { ip: req.ip });
    // Generic response — even 429 should not reveal account existence
    res.status(429).json({
      success: false,
      message: 'Too many password reset requests. Please try again in 15 minutes.',
      retryAfterSeconds: retryAfter
    });
  }
});

export const forgotPasswordRateLimiter = (req, res, next) => {
  if (process.env.NODE_ENV === 'test') return next();
  return forgotPasswordLimiterInstance(req, res, next);
};

// ─── Register Rate Limiter ────────────────────────────────────────────────────
const registerLimiterInstance = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 registrations per IP per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const retryAfter = Math.ceil(15 * 60);
    res.set('Retry-After', String(retryAfter));
    logger.warn('security.rate_limit.register', `IP ${req.ip} exceeded register limit`, { ip: req.ip });
    res.status(429).json({
      success: false,
      message: 'Too many registration attempts. Please try again in 15 minutes.',
      retryAfterSeconds: retryAfter
    });
  }
});

export const registerRateLimiter = (req, res, next) => {
  if (process.env.NODE_ENV === 'test') return next();
  return registerLimiterInstance(req, res, next);
};

// ─── OTP Resend Rate Limiter ──────────────────────────────────────────────────
const otpResendLimiterInstance = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 resend requests per IP per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const retryAfter = Math.ceil(15 * 60);
    res.set('Retry-After', String(retryAfter));
    logger.warn('security.rate_limit.otp_resend', `IP ${req.ip} exceeded OTP resend limit`, { ip: req.ip });
    res.status(429).json({
      success: false,
      message: 'Too many OTP resend requests. Please try again in 15 minutes.',
      retryAfterSeconds: retryAfter
    });
  }
});

export const otpResendRateLimiter = (req, res, next) => {
  if (process.env.NODE_ENV === 'test') return next();
  return otpResendLimiterInstance(req, res, next);
};

// ─── Change Password Rate Limiter ─────────────────────────────────────────────
const changePasswordLimiterInstance = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 change-password attempts per IP per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const retryAfter = Math.ceil(15 * 60);
    res.set('Retry-After', String(retryAfter));
    logger.warn('security.rate_limit.change_password', `IP ${req.ip} exceeded change-password limit`, { ip: req.ip });
    res.status(429).json({
      success: false,
      message: 'Too many password change attempts. Please try again in 15 minutes.',
      retryAfterSeconds: retryAfter
    });
  }
});

export const changePasswordRateLimiter = (req, res, next) => {
  if (process.env.NODE_ENV === 'test') return next();
  return changePasswordLimiterInstance(req, res, next);
};


// HTTPS Enforcement middleware for production deployments
export const enforceHttps = (req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';
    if (!isHttps) {
      return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
  }
  next();
};

// Secure Cookie Options Helper
export const getSecureCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/'
});

// Wire up security headers, HSTS, and response compression
export const configureResilience = (app) => {
  app.use(enforceHttps);
  app.use(
    helmet({
      contentSecurityPolicy: true, // Enforce strict CSP to prevent XSS
      hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true
      },
      frameguard: { action: 'deny' },
      xContentTypeOptions: true,
      xXssProtection: true
    })
  );
  app.use(compression());
  app.use(requestIdMiddleware);
};

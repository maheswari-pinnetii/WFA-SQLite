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

import {
  globalApiLimiter,
  loginRateLimiter,
  passwordResetLimiter,
  registerRateLimiter as sqliteRegisterRateLimiter,
  otpRateLimiter,
  publicApiLimiter,
  authenticatedUserLimiter
} from './rateLimiter.js';

export const globalRateLimiter = globalApiLimiter;
export const authRateLimiter = loginRateLimiter;
export const refreshRateLimiter = authenticatedUserLimiter;
export const forgotPasswordRateLimiter = passwordResetLimiter;
export const registerRateLimiter = sqliteRegisterRateLimiter;
export const otpResendRateLimiter = otpRateLimiter;
export const changePasswordRateLimiter = passwordResetLimiter;


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

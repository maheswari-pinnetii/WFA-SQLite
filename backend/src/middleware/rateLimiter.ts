import { Request, Response, NextFunction } from 'express';
import rateLimit, { Options, Store, IncrementResponse } from 'express-rate-limit';
import { query, execute } from '../database/sqlite-cloud.js';
import logger from '../config/logger.js';

class SQLiteStore implements Store {
  private windowMs: number;

  constructor(windowMs: number) {
    this.windowMs = windowMs;
    // Periodic cleanup of expired rate limits
    setInterval(() => {
      this.cleanup();
    }, 60000).unref();
  }

  async cleanup() {
    try {
      const now = Date.now();
      await execute('DELETE FROM rate_limits WHERE expiresAt <= ?', [now]);
    } catch (err) {
      logger.error('security.rate_limit.cleanup_error', 'Failed to cleanup rate limits', { error: err });
    }
  }

  async increment(key: string): Promise<IncrementResponse> {
    const now = Date.now();
    const expiresAt = now + this.windowMs;

    try {
      // Clean up first to prevent massive table growth
      if (Math.random() < 0.05) {
        this.cleanup();
      }

      const rows = await query('SELECT hits, expiresAt FROM rate_limits WHERE key = ?', [key]);
      
      if (rows && rows.length > 0) {
        const record = rows[0];
        if (now > record.expiresAt) {
          // Expired, reset
          await execute('UPDATE rate_limits SET hits = 1, expiresAt = ? WHERE key = ?', [expiresAt, key]);
          return { totalHits: 1, resetTime: new Date(expiresAt) };
        } else {
          // Increment
          await execute('UPDATE rate_limits SET hits = hits + 1 WHERE key = ?', [key]);
          return { totalHits: record.hits + 1, resetTime: new Date(record.expiresAt) };
        }
      } else {
        // Insert new
        await execute('INSERT INTO rate_limits (key, hits, expiresAt) VALUES (?, 1, ?)', [key, expiresAt]);
        return { totalHits: 1, resetTime: new Date(expiresAt) };
      }
    } catch (err) {
      logger.error('security.rate_limit.db_error', 'Rate limit database error, falling back to permissive', { error: err });
      return { totalHits: 1, resetTime: new Date(expiresAt) };
    }
  }

  async decrement(key: string): Promise<void> {
    try {
      await execute('UPDATE rate_limits SET hits = MAX(0, hits - 1) WHERE key = ?', [key]);
    } catch (err) {
      // Ignore errors on decrement
    }
  }

  async resetKey(key: string): Promise<void> {
    try {
      await execute('DELETE FROM rate_limits WHERE key = ?', [key]);
    } catch (err) {
      // Ignore errors on reset
    }
  }
}

// ------------------------------------------------------------------
// GLOBAL API RATE LIMIT
// ------------------------------------------------------------------
export const globalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per `window`
  standardHeaders: true,
  legacyHeaders: false,
  store: new SQLiteStore(15 * 60 * 1000),
  message: { success: false, message: 'Too many requests, please try again later.' },
  handler: (req, res, next, options) => {
    logger.warn('security.rate_limit.global', 'Global API rate limit exceeded', { ip: req.ip });
    res.status(options.statusCode).json(options.message);
  }
});

// ------------------------------------------------------------------
// LOGIN RATE LIMIT
// ------------------------------------------------------------------
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  store: new SQLiteStore(15 * 60 * 1000),
  message: { success: false, message: 'Too many login attempts. Please try again in 15 minutes.' },
  keyGenerator: (req) => {
    // Rate limit by IP + Email (if provided)
    return req.body.email ? `login:${req.ip}:${req.body.email.toLowerCase()}` : `login:${req.ip}`;
  },
  handler: (req, res, next, options) => {
    logger.warn('security.rate_limit.login', 'Login rate limit exceeded', { ip: req.ip, email: req.body.email });
    res.status(options.statusCode).json(options.message);
  }
});

// ------------------------------------------------------------------
// FORGOT PASSWORD / PASSWORD RESET RATE LIMIT
// ------------------------------------------------------------------
export const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // 3 password reset attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  store: new SQLiteStore(15 * 60 * 1000),
  message: { success: false, message: 'Too many password reset requests. Please try again in 15 minutes.' },
  keyGenerator: (req) => {
    return req.body.email ? `pwd_reset:${req.ip}:${req.body.email.toLowerCase()}` : `pwd_reset:${req.ip}`;
  },
  handler: (req, res, next, options) => {
    logger.warn('security.rate_limit.pwd_reset', 'Password reset rate limit exceeded', { ip: req.ip, email: req.body.email });
    res.status(options.statusCode).json(options.message);
  }
});

// ------------------------------------------------------------------
// REGISTRATION RATE LIMIT
// ------------------------------------------------------------------
export const registerRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 registrations per hour per IP
  standardHeaders: true,
  legacyHeaders: false,
  store: new SQLiteStore(60 * 60 * 1000),
  message: { success: false, message: 'Too many accounts created from this IP. Please try again later.' },
  keyGenerator: (req) => `register:${req.ip}`,
  handler: (req, res, next, options) => {
    logger.warn('security.rate_limit.register', 'Registration rate limit exceeded', { ip: req.ip });
    res.status(options.statusCode).json(options.message);
  }
});

// ------------------------------------------------------------------
// OTP / VERIFICATION EMAIL RATE LIMIT
// ------------------------------------------------------------------
export const otpRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 OTP resends per hour per IP/Email
  standardHeaders: true,
  legacyHeaders: false,
  store: new SQLiteStore(60 * 60 * 1000),
  message: { success: false, message: 'Too many verification code requests. Please try again later.' },
  keyGenerator: (req) => {
    return req.body.email ? `otp:${req.ip}:${req.body.email.toLowerCase()}` : `otp:${req.ip}`;
  },
  handler: (req, res, next, options) => {
    logger.warn('security.rate_limit.otp', 'OTP rate limit exceeded', { ip: req.ip, email: req.body.email });
    res.status(options.statusCode).json(options.message);
  }
});

import { Request, Response, NextFunction } from 'express';
import rateLimit, { Store, IncrementResponse, ipKeyGenerator } from 'express-rate-limit';
import { query, execute } from '../database/sqlite-cloud.js';
import { env } from '../config/env.js';
import logger from '../config/logger.js';

let tableInitialized = false;
let tableInitPromise: Promise<void> | null = null;

export const ensureRateLimitsTable = async (): Promise<void> => {
  if (tableInitialized) return;
  if (!tableInitPromise) {
    tableInitPromise = (async () => {
      try {
        await execute(`
          CREATE TABLE IF NOT EXISTS rate_limits (
            key TEXT PRIMARY KEY,
            hits INTEGER NOT NULL DEFAULT 1,
            expiresAt INTEGER NOT NULL
          )
        `);
        try {
          await execute(`CREATE INDEX IF NOT EXISTS idx_rate_limits_expiry ON rate_limits(expiresAt)`);
        } catch (_) {}
        tableInitialized = true;
      } catch (err) {
        tableInitPromise = null;
        throw err;
      }
    })();
  }
  return tableInitPromise;
};

class SQLiteStore implements Store {
  private windowMs: number;

  constructor(windowMs: number) {
    this.windowMs = windowMs;
    // Periodic cleanup of expired rate limits
    setInterval(() => {
      this.cleanup().catch(() => undefined);
    }, 60000).unref();
  }

  async cleanup() {
    try {
      await ensureRateLimitsTable();
      const now = Date.now();
      await execute('DELETE FROM rate_limits WHERE expiresAt <= ?', [now]);
    } catch (err: any) {
      const errMsg = err?.message || (typeof err === 'object' ? JSON.stringify(err) : String(err));
      logger.error('security.rate_limit.cleanup_error', 'Failed to cleanup rate limits', { error: errMsg });
    }
  }

  async increment(key: string): Promise<IncrementResponse> {
    const now = Date.now();
    const expiresAt = now + this.windowMs;

    try {
      await ensureRateLimitsTable();

      if (Math.random() < 0.05) {
        this.cleanup().catch(() => undefined);
      }

      const rows = await query('SELECT hits, expiresAt FROM rate_limits WHERE key = ?', [key]);
      
      if (rows && rows.length > 0) {
        const record = rows[0];
        if (now > record.expiresAt) {
          // Expired window, reset
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
    } catch (err: any) {
      const errMsg = err?.message || (typeof err === 'object' ? JSON.stringify(err) : String(err));
      logger.error('security.rate_limit.db_error', 'Rate limit database error, falling back to permissive', { error: errMsg });
      return { totalHits: 1, resetTime: new Date(expiresAt) };
    }
  }

  async decrement(key: string): Promise<void> {
    try {
      await ensureRateLimitsTable();
      await execute('UPDATE rate_limits SET hits = MAX(0, hits - 1) WHERE key = ?', [key]);
    } catch (err) {
      // Ignore errors on decrement
    }
  }

  async resetKey(key: string): Promise<void> {
    try {
      await ensureRateLimitsTable();
      await execute('DELETE FROM rate_limits WHERE key = ?', [key]);
    } catch (err) {
      // Ignore errors on reset
    }
  }
}

// Helper to safely extract and normalize client IP
export const getClientIp = (req: Request): string => {
  const rawIp = req.ip || req.socket?.remoteAddress || '127.0.0.1';
  try {
    return ipKeyGenerator(rawIp);
  } catch (_) {
    return rawIp;
  }
};

const createExponentialBackoffHandler = (
  endpointName: string,
  baseMessage: string,
  maxAllowed: number,
  keyGen: (req: Request) => string
) => {
  return async (req: Request, res: Response, next: NextFunction, options: any) => {
    const ip = getClientIp(req);
    const rawEmail = req.body?.email || req.body?.username || (req as any).user?.id || 'anonymous';
    const key = keyGen(req);

    let hits = maxAllowed + 1;
    try {
      await ensureRateLimitsTable();
      const rows = await query('SELECT hits FROM rate_limits WHERE key = ?', [key]);
      if (rows && rows.length > 0) {
        hits = rows[0].hits;
      }
    } catch (_) {}

    // Exponential backoff calculation:
    // excess 1 -> 15s, excess 2 -> 30s, excess 3 -> 60s, excess 4 -> 120s ... up to 1800s (30m)
    const excess = Math.max(1, hits - maxAllowed);
    const backoffSeconds = Math.min(1800, Math.pow(2, Math.min(excess, 7)) * 15);

    res.set('Retry-After', String(backoffSeconds));
    logger.warn(`security.rate_limit.${endpointName}`, `${endpointName} rate limit exceeded with exponential backoff`, {
      ip,
      account: rawEmail,
      hits,
      excess,
      retryAfterSeconds: backoffSeconds
    });

    res.status(429).json({
      success: false,
      message: `${baseMessage} Please wait ${backoffSeconds} seconds before trying again.`,
      retryAfterSeconds: backoffSeconds
    });
  };
};

// ------------------------------------------------------------------
// KEY GENERATORS (COMBINATION OF PER-IP AND PER-ACCOUNT)
// ------------------------------------------------------------------
export const authKeyGen = (prefix: string) => (req: Request) => {
  const ip = getClientIp(req);
  const rawEmail = req.body?.email || req.body?.username || req.body?.employeeId;
  const account = rawEmail && typeof rawEmail === 'string' ? rawEmail.trim().toLowerCase() : '';
  return account ? `${prefix}:${ip}:${account}` : `${prefix}:${ip}`;
};

const isTestMode = (req: Request) => process.env.NODE_ENV === 'test' && req.headers['x-test-rate-limit'] !== 'true';

// ------------------------------------------------------------------
// 1. STRICT AUTH LIMITERS (Configurable + Per-IP & Per-Account + Backoff)
// ------------------------------------------------------------------

export const loginRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_LOGIN_WINDOW_MS,
  max: env.RATE_LIMIT_LOGIN_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  skip: isTestMode,
  store: new SQLiteStore(env.RATE_LIMIT_LOGIN_WINDOW_MS),
  keyGenerator: authKeyGen('login'),
  handler: createExponentialBackoffHandler(
    'login',
    'Too many login attempts.',
    env.RATE_LIMIT_LOGIN_MAX,
    authKeyGen('login')
  )
});

export const passwordResetLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_RESET_WINDOW_MS,
  max: env.RATE_LIMIT_RESET_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  store: new SQLiteStore(env.RATE_LIMIT_RESET_WINDOW_MS),
  keyGenerator: authKeyGen('pwd_reset'),
  handler: createExponentialBackoffHandler(
    'pwd_reset',
    'Too many password reset requests.',
    env.RATE_LIMIT_RESET_MAX,
    authKeyGen('pwd_reset')
  )
});

export const registerRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_SIGNUP_WINDOW_MS,
  max: env.RATE_LIMIT_SIGNUP_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  skip: isTestMode,
  store: new SQLiteStore(env.RATE_LIMIT_SIGNUP_WINDOW_MS),
  keyGenerator: authKeyGen('register'),
  handler: createExponentialBackoffHandler(
    'register',
    'Too many registration attempts.',
    env.RATE_LIMIT_SIGNUP_MAX,
    authKeyGen('register')
  )
});

export const otpRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_OTP_WINDOW_MS,
  max: env.RATE_LIMIT_OTP_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  skip: isTestMode,
  store: new SQLiteStore(env.RATE_LIMIT_OTP_WINDOW_MS),
  keyGenerator: authKeyGen('otp'),
  handler: createExponentialBackoffHandler(
    'otp',
    'Too many verification code requests.',
    env.RATE_LIMIT_OTP_MAX,
    authKeyGen('otp')
  )
});

// ------------------------------------------------------------------
// 2. MODERATE LIMITS FOR PUBLIC ENDPOINTS
// ------------------------------------------------------------------
export const publicApiLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_PUBLIC_WINDOW_MS,
  max: env.RATE_LIMIT_PUBLIC_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  skip: isTestMode,
  store: new SQLiteStore(env.RATE_LIMIT_PUBLIC_WINDOW_MS),
  keyGenerator: (req) => `public:${getClientIp(req)}`,
  message: { success: false, message: 'Too many public requests, please try again later.' }
});

// ------------------------------------------------------------------
// 3. LOOSER LIMITS FOR AUTHENTICATED USER ACTIONS
// ------------------------------------------------------------------
export const authenticatedUserLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_AUTHENTICATED_WINDOW_MS,
  max: env.RATE_LIMIT_AUTHENTICATED_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  skip: isTestMode,
  store: new SQLiteStore(env.RATE_LIMIT_AUTHENTICATED_WINDOW_MS),
  keyGenerator: (req) => {
    const userId = (req as any).user?.id;
    return userId ? `user_action:${userId}` : `user_action:${getClientIp(req)}`;
  },
  message: { success: false, message: 'Action limit exceeded, please slow down.' }
});

// ------------------------------------------------------------------
// 4. GLOBAL API RATE LIMIT
// ------------------------------------------------------------------
export const globalApiLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_GLOBAL_WINDOW_MS,
  max: env.RATE_LIMIT_GLOBAL_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  skip: isTestMode,
  store: new SQLiteStore(env.RATE_LIMIT_GLOBAL_WINDOW_MS),
  message: { success: false, message: 'Too many requests, please try again later.' },
  handler: (req, res, next, options) => {
    logger.warn('security.rate_limit.global', 'Global API rate limit exceeded', { ip: req.ip });
    res.status(options.statusCode).json(options.message);
  }
});

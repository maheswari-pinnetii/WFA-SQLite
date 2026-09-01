import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger.js';

// -------------------------------------------------------------
// 1. SSRF (Server-Side Request Forgery) Defense
// -------------------------------------------------------------
const BLOCKED_IP_PATTERNS = [
  /^127\./, // 127.0.0.0/8 (Loopback)
  /^10\./, // 10.0.0.0/8 (Private)
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12 (Private)
  /^192\.168\./, // 192.168.0.0/16 (Private)
  /^169\.254\./, // 169.254.0.0/16 (Link-local / AWS instance metadata)
  /^::1$/, // IPv6 Loopback
  /^fc00:/, // IPv6 Unique local
  /^fe80:/ // IPv6 Link-local
];

export const isSafeOutboundUrl = (urlString: string): boolean => {
  try {
    const parsed = new URL(urlString);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }
    const hostname = parsed.hostname.toLowerCase();
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
      return false;
    }
    for (const pattern of BLOCKED_IP_PATTERNS) {
      if (pattern.test(hostname)) {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
};

export const ssrfGuard = (req: Request, res: Response, next: NextFunction) => {
  const targetUrl = req.body?.url || req.query?.url || req.body?.webhookUrl;
  if (targetUrl && typeof targetUrl === 'string') {
    if (!isSafeOutboundUrl(targetUrl)) {
      logger.warn('security.ssrf.blocked', `Blocked potential SSRF attempt to ${targetUrl}`, {
        ip: req.ip,
        url: targetUrl
      });
      return res.status(400).json({
        success: false,
        message: 'Invalid destination URL: Local, private, and metadata network destinations are blocked.'
      });
    }
  }
  next();
};

// -------------------------------------------------------------
// 2. Webhook HMAC Cryptographic Signature Validator
// -------------------------------------------------------------
export const verifyWebhookSignature = (
  rawBody: string | Buffer,
  signatureHeader: string,
  secretKey: string
): boolean => {
  if (!signatureHeader || !secretKey) return false;
  try {
    const hmac = crypto.createHmac('sha256', secretKey);
    hmac.update(rawBody);
    const calculatedSignature = 'sha256=' + hmac.digest('hex');
    const trustedBuf = Buffer.from(calculatedSignature, 'utf8');
    const providedBuf = Buffer.from(signatureHeader, 'utf8');
    if (trustedBuf.length !== providedBuf.length) return false;
    return crypto.timingSafeEqual(trustedBuf, providedBuf);
  } catch {
    return false;
  }
};

// -------------------------------------------------------------
// 3. AI / Prompt Injection Sanitizer
// -------------------------------------------------------------
const INJECTION_PATTERNS = [
  /system\s*:/i,
  /<\|im_start\|>/i,
  /<\|im_end\|>/i,
  /ignore\s+(all\s+)?previous\s+instructions/i,
  /you\s+are\s+now\s+in\s+developer\s+mode/i,
  /reveal\s+(the\s+)?(system\s+)?prompt/i
];

export const sanitizeAiPrompt = (prompt: string): string => {
  if (typeof prompt !== 'string') return '';
  let cleaned = prompt;
  for (const pattern of INJECTION_PATTERNS) {
    cleaned = cleaned.replace(pattern, '[FILTERED_INSTRUCTION]');
  }
  return cleaned.trim();
};

// -------------------------------------------------------------
// 4. CSRF / State Changing Request Origin Validator
// -------------------------------------------------------------
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // Safe read methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Allow test environment bypass
  if (process.env.NODE_ENV === 'test') {
    return next();
  }

  const origin = req.headers['origin'] || req.headers['referer'];
  const allowed = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    process.env.FRONTEND_URL
  ].filter(Boolean);

  if (origin) {
    const isAllowed = allowed.some((allowedOrigin) => origin.startsWith(allowedOrigin!));
    if (!isAllowed) {
      logger.warn('security.csrf.rejected', `Rejected state-changing request from untrusted origin: ${origin}`, {
        origin,
        method: req.method,
        path: req.originalUrl
      });
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Request origin validation failed.'
      });
    }
  }

  next();
};

// -------------------------------------------------------------
// 5. Password Complexity Validator
// -------------------------------------------------------------
export const validatePasswordStrength = (password: string): { valid: boolean; reason?: string } => {
  if (!password || typeof password !== 'string') {
    return { valid: false, reason: 'Password is required.' };
  }
  if (password.length < 8) {
    return { valid: false, reason: 'Password must be at least 8 characters long.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, reason: 'Password must contain at least one uppercase letter.' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, reason: 'Password must contain at least one lowercase letter.' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, reason: 'Password must contain at least one numeric digit.' };
  }
  return { valid: true };
};

// -------------------------------------------------------------
// 6. Open Redirect Prevention Validator
// -------------------------------------------------------------
export const isValidRedirectUrl = (urlStr: string, allowedDomains: string[] = []): boolean => {
  if (!urlStr || typeof urlStr !== 'string') return false;
  // Prevent protocol-relative URLs (e.g. //evil.com) and javascript/data schemes
  if (urlStr.startsWith('//') || urlStr.startsWith('\\') || /^\s*javascript:/i.test(urlStr) || /^\s*data:/i.test(urlStr)) {
    return false;
  }
  // Allow safe relative paths
  if (urlStr.startsWith('/') && !urlStr.startsWith('//')) {
    return true;
  }
  try {
    const parsed = new URL(urlStr);
    const domainWhitelist = [
      'localhost',
      '127.0.0.1',
      ...allowedDomains
    ];
    return domainWhitelist.includes(parsed.hostname.toLowerCase());
  } catch {
    return false;
  }
};

// -------------------------------------------------------------
// 7. Object Prototype Pollution / Insecure Deserialization Guard
// -------------------------------------------------------------
export const sanitizePrototypeKeys = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map(sanitizePrototypeKeys);
  }
  const clean: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      logger.warn('security.prototype_pollution.detected', `Stripped prototype pollution key: ${key}`);
      continue;
    }
    clean[key] = sanitizePrototypeKeys(obj[key]);
  }
  return clean;
};

export const prototypePollutionGuard = (req: Request, res: Response, next: NextFunction) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizePrototypeKeys(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizePrototypeKeys(req.query);
  }
  next();
};

// -------------------------------------------------------------
// 8. Mass Assignment Protection Filter
// -------------------------------------------------------------
export const preventMassAssignment = (allowedKeys: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.body && typeof req.body === 'object') {
      const sanitized: Record<string, any> = {};
      for (const key of allowedKeys) {
        if (req.body[key] !== undefined) {
          sanitized[key] = req.body[key];
        }
      }
      req.body = sanitized;
    }
    next();
  };
};

// -------------------------------------------------------------
// 9. Webhook Replay & Timestamp Drift Defense
// -------------------------------------------------------------
export const webhookReplayGuard = (maxDriftSeconds: number = 300) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const timestampHeader = req.headers['x-webhook-timestamp'] || req.headers['x-stackly-timestamp'];
    if (timestampHeader) {
      const requestTime = parseInt(timestampHeader as string, 10);
      const currentTime = Math.floor(Date.now() / 1000);
      if (isNaN(requestTime) || Math.abs(currentTime - requestTime) > maxDriftSeconds) {
        logger.warn('security.webhook_replay.rejected', 'Rejected webhook due to timestamp drift exceeding limit', {
          requestTime,
          currentTime
        });
        return res.status(401).json({
          success: false,
          message: 'Webhook timestamp verification failed: Request has expired or clock drift exceeded allowed limit.'
        });
      }
    }
    next();
  };
};

// -------------------------------------------------------------
// 10. Request Timeout Guard (Prevents Slowloris / Hung Socket Attacks)
// -------------------------------------------------------------
export const requestTimeoutGuard = (timeoutMs: number = 30000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    res.setTimeout(timeoutMs, () => {
      logger.warn('security.timeout.triggered', `Request timed out after ${timeoutMs}ms`, {
        route: req.originalUrl,
        method: req.method,
        ip: req.ip
      });
      if (!res.headersSent) {
        res.status(408).json({
          success: false,
          message: 'Request timeout: Processing took longer than permitted threshold.'
        });
      }
    });
    next();
  };
};

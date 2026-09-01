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

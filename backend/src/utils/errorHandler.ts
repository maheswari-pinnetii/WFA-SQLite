import { Request, Response } from 'express';
import logger from '../config/logger.js';

// Patterns that indicate internal database, filesystem, or stack trace disclosures
const SENSITIVE_ERROR_PATTERNS = [
  /sqlite/i,
  /sql/i,
  /constraint/i,
  /syntax error/i,
  /no such table/i,
  /no such column/i,
  /enoent/i,
  /eacces/i,
  /c:\\/i,
  /\/users\//i,
  /\/home\//i,
  /at\s+.*\.(ts|js):\d+:\d+/i,
  /node_modules/i,
  /call stack/i
];

/**
 * Sanitizes an error message so that no database details, internal file paths,
 * or raw runtime stack traces are ever exposed to the client.
 */
export const getSafeErrorMessage = (err: any, fallbackMessage: string = 'An unexpected error occurred. Please try again later.'): string => {
  if (!err) return fallbackMessage;
  const message = typeof err === 'string' ? err : (err.message || '');
  
  if (!message) return fallbackMessage;

  // Check if message discloses database, filesystem, or stack traces
  const isSensitive = SENSITIVE_ERROR_PATTERNS.some(pattern => pattern.test(message));
  if (isSensitive) {
    return fallbackMessage;
  }

  return message;
};

/**
 * Standardized controller error responder.
 * Logs full error stack and diagnostic context server-side while
 * returning a safe, sanitized generic message to the client.
 */
export const handleControllerError = (
  err: any,
  req: Request,
  res: Response,
  contextName: string,
  statusCode: number = 500,
  safeFallback: string = 'An unexpected error occurred. Please try again later.'
) => {
  const requestId = (req as any)?.requestId || 'unknown';
  const method = req.method || 'UNKNOWN';
  const route = req.originalUrl || req.url || 'unknown';

  // Server-side: Log full internal details, stack trace, and diagnostic context
  logger.error(`${contextName}.error`, err?.message || 'Unexpected server error', {
    requestId,
    method,
    route,
    error: err?.message,
    stack: err?.stack,
    name: err?.name,
    code: err?.code
  });

  const safeMessage = getSafeErrorMessage(err, safeFallback);

  return res.status(statusCode).json({
    success: false,
    message: safeMessage
  });
};

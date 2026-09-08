import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface UploadedFile {
  name: string;
  mimetype: string;
  size: number;
  data: Buffer | string;
}

// Storage directory outside of the web root (isolated from frontend/dist/public)
export const UPLOAD_STORAGE_DIR = path.resolve(__dirname, '../../../storage/uploads');

// Ensure isolated storage directory exists with restricted permissions
if (!fs.existsSync(UPLOAD_STORAGE_DIR)) {
  fs.mkdirSync(UPLOAD_STORAGE_DIR, { recursive: true, mode: 0o700 });
}

// Dangerous extensions that must NEVER be allowed under any circumstance
const DANGEROUS_EXTENSIONS = new Set([
  '.exe', '.bat', '.cmd', '.sh', '.bash', '.php', '.php3', '.php4', '.php5',
  '.phtml', '.js', '.mjs', '.cjs', '.ts', '.vbs', '.ps1', '.py', '.cgi',
  '.pl', '.jar', '.war', '.dll', '.so', '.com', '.scr', '.hta', '.msi',
  '.jsp', '.asp', '.aspx', '.htaccess', '.env'
]);

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'text/csv'
];

const ALLOWED_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.pdf',
  '.csv'
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

/**
 * Sanitize filename to prevent directory traversal and special character injections
 */
export const sanitizeFileName = (fileName: string): string => {
  const baseName = path.basename(fileName);
  return baseName.replace(/[^a-zA-Z0-9._-]/g, '_');
};

/**
 * Validates actual binary content (magic numbers) to ensure file content
 * matches its declared MIME type, preventing file extension / MIME spoofing.
 */
export const validateMagicNumbers = (buffer: Buffer, declaredMime: string): { valid: boolean; detectedMime?: string } => {
  if (!buffer || buffer.length < 4) {
    return { valid: false };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47 &&
    buffer[4] === 0x0d && buffer[5] === 0x0a && buffer[6] === 0x1a && buffer[7] === 0x0a
  ) {
    return { valid: declaredMime === 'image/png', detectedMime: 'image/png' };
  }

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { valid: declaredMime === 'image/jpeg' || declaredMime === 'image/jpg', detectedMime: 'image/jpeg' };
  }

  // GIF: 47 49 46 38 ('GIF8')
  if (
    buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38
  ) {
    return { valid: declaredMime === 'image/gif', detectedMime: 'image/gif' };
  }

  // WebP: RIFF ... WEBP
  if (
    buffer.length >= 12 &&
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return { valid: declaredMime === 'image/webp', detectedMime: 'image/webp' };
  }

  // PDF: %PDF- (25 50 44 46)
  if (
    buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46
  ) {
    return { valid: declaredMime === 'application/pdf', detectedMime: 'application/pdf' };
  }

  // CSV / Plain text validation
  if (declaredMime === 'text/csv' || declaredMime === 'text/plain') {
    // Ensure no binary null bytes (NUL)
    const hasNullByte = buffer.includes(0x00);
    // Check for dangerous executable script tags in CSV / text
    const textSnippet = buffer.toString('utf-8', 0, Math.min(buffer.length, 2048)).toLowerCase();
    const hasScriptTag = textSnippet.includes('<script') ||
      textSnippet.includes('javascript:') ||
      textSnippet.includes('<?php') ||
      textSnippet.includes('<!entity');

    if (hasNullByte || hasScriptTag) {
      return { valid: false };
    }
    return { valid: true, detectedMime: declaredMime };
  }

  // Unknown or unverified binary format
  return { valid: false };
};

/**
 * Configure execution-prevention security headers for file responses.
 * Ensures the browser downloads files as isolated attachments rather than executing them.
 */
export const setFileDownloadSecurityHeaders = (res: Response, safeMime: string, fileName: string) => {
  res.setHeader('Content-Type', safeMime);
  res.setHeader('Content-Disposition', `attachment; filename="${sanitizeFileName(fileName)}"`);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Security-Policy', "default-src 'none'");
  res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
};

/**
 * Validate and restrict file upload middleware.
 * Validates extension, declared MIME, file size, and actual binary content signatures.
 */
export const validateFileUpload = (options?: {
  allowedMimeTypes?: string[];
  maxSize?: number;
}) => {
  const allowedMimes = options?.allowedMimeTypes || ALLOWED_MIME_TYPES;
  const maxSize = options?.maxSize || MAX_FILE_SIZE;

  return (req: Request, res: Response, next: NextFunction) => {
    const filePayload = req.body?.file || req.body?.avatar || req.body?.document;

    if (!filePayload) {
      // Optional upload
      return next();
    }

    // Base64 Data URL payload: "data:image/png;base64,..."
    if (typeof filePayload === 'string' && filePayload.startsWith('data:')) {
      const match = filePayload.match(/^data:([a-zA-Z0-9/+.-]+);base64,(.*)$/);
      if (!match) {
        return res.status(400).json({ success: false, message: 'Malformed base64 file data.' });
      }

      const mime = match[1].toLowerCase();
      const base64Data = match[2];

      if (!allowedMimes.includes(mime)) {
        return res.status(400).json({
          success: false,
          message: `Forbidden file type: ${mime}. Allowed types: ${allowedMimes.join(', ')}`
        });
      }

      // Convert to buffer to inspect binary magic numbers
      let buffer: Buffer;
      try {
        buffer = Buffer.from(base64Data, 'base64');
      } catch (_) {
        return res.status(400).json({ success: false, message: 'Invalid base64 encoding.' });
      }

      if (buffer.length > maxSize) {
        return res.status(400).json({
          success: false,
          message: `File size exceeds allowed limit of ${maxSize / (1024 * 1024)}MB.`
        });
      }

      // Validate magic numbers to ensure genuine file content
      const { valid } = validateMagicNumbers(buffer, mime);
      if (!valid) {
        return res.status(400).json({
          success: false,
          message: 'File content signature does not match the declared MIME type.'
        });
      }

      const safeExtension = mime === 'image/jpeg' ? '.jpg' : `.${mime.split('/')[1]}`;
      const uniqueFileName = `${crypto.randomUUID()}${safeExtension}`;

      req.body.sanitizedFile = {
        mimetype: mime,
        size: buffer.length,
        name: uniqueFileName,
        originalName: req.body.fileName ? sanitizeFileName(req.body.fileName) : 'upload'
      };

      return next();
    }

    // Object file payload
    if (typeof filePayload === 'object') {
      const { name, mimetype, size, data } = filePayload;

      if (name) {
        const ext = path.extname(name).toLowerCase();
        if (DANGEROUS_EXTENSIONS.has(ext) || !ALLOWED_EXTENSIONS.includes(ext)) {
          return res.status(400).json({
            success: false,
            message: `Disallowed or dangerous file extension: ${ext}`
          });
        }
        filePayload.name = sanitizeFileName(name);
      }

      if (mimetype && !allowedMimes.includes(mimetype.toLowerCase())) {
        return res.status(400).json({
          success: false,
          message: `Unsupported MIME type: ${mimetype}`
        });
      }

      if (size && size > maxSize) {
        return res.status(400).json({
          success: false,
          message: `File exceeds maximum size of ${maxSize / (1024 * 1024)}MB.`
        });
      }

      // If binary buffer or base64 data is present in the object, validate magic numbers
      if (data && mimetype) {
        const buf = Buffer.isBuffer(data) ? data : Buffer.from(String(data), 'base64');
        const { valid } = validateMagicNumbers(buf, mimetype.toLowerCase());
        if (!valid) {
          return res.status(400).json({
            success: false,
            message: 'File content signature does not match declared MIME type.'
          });
        }
      }
    }

    next();
  };
};

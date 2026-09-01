import { Request, Response, NextFunction } from 'express';
import path from 'path';

export interface UploadedFile {
  name: string;
  mimetype: string;
  size: number;
  data: Buffer | string;
}

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv'
];

const ALLOWED_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.svg',
  '.pdf',
  '.xlsx',
  '.csv'
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

// Sanitize filename to prevent directory traversal and path injections
export const sanitizeFileName = (fileName: string): string => {
  const baseName = path.basename(fileName);
  return baseName.replace(/[^a-zA-Z0-9._-]/g, '_');
};

// Validate and restrict file upload middleware
export const validateFileUpload = (options?: {
  allowedMimeTypes?: string[];
  maxSize?: number;
}) => {
  const allowedMimes = options?.allowedMimeTypes || ALLOWED_MIME_TYPES;
  const maxSize = options?.maxSize || MAX_FILE_SIZE;

  return (req: Request, res: Response, next: NextFunction) => {
    // Check if body has file data or base64 upload payload
    const filePayload = req.body?.file || req.body?.avatar || req.body?.document;

    if (!filePayload) {
      // If endpoint permits optional uploads, proceed
      return next();
    }

    // Base64 file format check: "data:image/png;base64,..."
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

      // Calculate approximate size in bytes
      const estimatedSize = (base64Data.length * 3) / 4;
      if (estimatedSize > maxSize) {
        return res.status(400).json({
          success: false,
          message: `File size exceeds allowed limit of ${maxSize / (1024 * 1024)}MB.`
        });
      }

      req.body.sanitizedFile = {
        mimetype: mime,
        size: estimatedSize,
        name: req.body.fileName ? sanitizeFileName(req.body.fileName) : 'upload'
      };

      return next();
    }

    // Object file payload
    if (typeof filePayload === 'object') {
      const { name, mimetype, size } = filePayload;

      if (name) {
        const ext = path.extname(name).toLowerCase();
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
          return res.status(400).json({
            success: false,
            message: `Disallowed file extension: ${ext}`
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
    }

    next();
  };
};

import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger.js';
import crypto from 'crypto';

// Setup basic memory storage (In production, replace with AWS S3/GCS or disk)
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only allow specific mimetypes
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG and PDF are allowed.'));
    }
  }
});

/**
 * Mock Malware Scanner
 * In a real enterprise system, this would pipe the buffer to ClamAV or a cloud scanning API.
 */
export const scanMalware = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    return next();
  }

  try {
    const fileBuffer = req.file.buffer;
    const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    
    // Simulate scan delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // Mock hash of a known EICAR test file or similar
    const mockMaliciousHashes = [
      '275a021bbfb6489e54d471899f7db9d1663fc695ec2fe2a2c4538aabf651fd0f'
    ];

    if (mockMaliciousHashes.includes(hash)) {
      logger.warn(`Malware detected in upload attempt. Hash: ${hash}`);
      return res.status(403).json({ error: 'File upload rejected by security scan.' });
    }

    logger.info(`File scanned successfully. Hash: ${hash}`);
    next();
  } catch (error) {
    logger.error('Error during malware scan', { error });
    res.status(500).json({ error: 'Internal server error during file processing' });
  }
};

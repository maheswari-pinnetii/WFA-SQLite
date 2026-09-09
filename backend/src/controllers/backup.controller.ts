import { Request, Response } from 'express';
import { backupService } from '../services/backup.service.js';
import { AppError, ErrorCode, sendError } from '../utils/apiError.js';

export const createBackup = async (req: any, res: Response): Promise<any> => {
  try {
    const { tag, compress } = req.body || {};
    const userId = req.user?.id || 'admin';
    const metadata = await backupService.createBackup({ tag, compress: compress !== false, userId });
    return res.status(201).json({ success: true, message: 'Database backup created successfully.', data: metadata });
  } catch (err) {
    sendError(res, err);
  }
};

export const listBackups = async (req: Request, res: Response): Promise<any> => {
  try {
    const backups = await backupService.listBackups();
    return res.json({ success: true, count: backups.length, data: backups });
  } catch (err) {
    sendError(res, err);
  }
};

export const restoreBackup = async (req: any, res: Response): Promise<any> => {
  try {
    const { filename } = req.body || {};
    if (!filename) {
      return sendError(res, AppError.badRequest(ErrorCode.MISSING_REQUIRED_FIELD, 'Backup filename is required.'));
    }
    const userId = req.user?.id || 'admin';
    const result = await backupService.restoreBackup(filename, userId);
    return res.json({ success: true, message: result.message });
  } catch (err) {
    sendError(res, err);
  }
};

export const downloadBackup = async (req: Request, res: Response): Promise<any> => {
  try {
    const filename = req.params.filename as string;
    const filePath = backupService.getBackupDownloadPath(filename);
    return res.download(filePath, filename);
  } catch (err) {
    sendError(res, AppError.notFound('Backup file', ErrorCode.FILE_NOT_FOUND));
  }
};

export const deleteBackup = async (req: any, res: Response): Promise<any> => {
  try {
    const { filename } = req.params;
    const userId = req.user?.id || 'admin';
    const deleted = await backupService.deleteBackup(filename, userId);
    if (!deleted) return sendError(res, AppError.notFound('Backup file', ErrorCode.FILE_NOT_FOUND));
    return res.json({ success: true, message: `Backup ${filename} deleted successfully.` });
  } catch (err) {
    sendError(res, err);
  }
};

/**
 * GET /api/v1/admin/backup/:filename/verify
 * Verifies a backup file's integrity without restoring it to the live database.
 * Runs SQLite integrity_check + table/row counts on the backup file in read-only mode.
 */
export const verifyBackup = async (req: Request, res: Response): Promise<any> => {
  try {
    const { filename } = req.params;
    if (!filename || typeof filename !== 'string') {
      return sendError(res, AppError.badRequest(ErrorCode.MISSING_REQUIRED_FIELD, 'filename parameter is required.'));
    }
    const result = await backupService.verifyBackup(filename);
    return res.json({
      success: true,
      message: result.valid ? 'Backup integrity check passed.' : 'Backup integrity check FAILED — backup may be corrupted.',
      data: result,
    });
  } catch (err) {
    sendError(res, err);
  }
};

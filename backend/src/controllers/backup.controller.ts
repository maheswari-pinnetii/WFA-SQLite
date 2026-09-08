import { Request, Response } from 'express';
import { backupService } from '../services/backup.service.js';
import { handleControllerError } from '../utils/errorHandler.js';

export const createBackup = async (req: any, res: Response): Promise<any> => {
  try {
    const { tag, compress } = req.body || {};
    const userId = req.user?.id || 'admin';
    const metadata = await backupService.createBackup({ tag, compress: compress !== false, userId });
    return res.status(201).json({
      success: true,
      message: 'Database backup created successfully.',
      data: metadata
    });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'backup.create', 500, 'Failed to create database backup.');
  }
};

export const listBackups = async (req: Request, res: Response): Promise<any> => {
  try {
    const backups = await backupService.listBackups();
    return res.json({
      success: true,
      count: backups.length,
      data: backups
    });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'backup.list', 500, 'Failed to retrieve backups.');
  }
};

export const restoreBackup = async (req: any, res: Response): Promise<any> => {
  try {
    const { filename } = req.body || {};
    if (!filename) {
      return res.status(400).json({ success: false, message: 'Backup filename is required.' });
    }
    const userId = req.user?.id || 'admin';
    const result = await backupService.restoreBackup(filename, userId);
    return res.json({
      success: true,
      message: result.message
    });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'backup.restore', 500, 'Failed to restore database backup.');
  }
};

export const downloadBackup = async (req: Request, res: Response): Promise<any> => {
  try {
    const filename = req.params.filename as string;
    const filePath = backupService.getBackupDownloadPath(filename);
    return res.download(filePath, filename);
  } catch (err: any) {
    return handleControllerError(err, req, res, 'backup.download', 404, 'Requested backup file was not found.');
  }
};

export const deleteBackup = async (req: any, res: Response): Promise<any> => {
  try {
    const { filename } = req.params;
    const userId = req.user?.id || 'admin';
    const deleted = await backupService.deleteBackup(filename, userId);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Backup file not found.' });
    }
    return res.json({
      success: true,
      message: `Backup ${filename} deleted successfully.`
    });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'backup.delete', 500, 'Failed to delete backup file.');
  }
};

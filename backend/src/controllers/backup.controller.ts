import { Request, Response } from 'express';
import { backupService } from '../services/backup.service.js';

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
    console.error('createBackup Error:', err);
    return res.status(500).json({ success: false, message: err.message });
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
    console.error('listBackups Error:', err);
    return res.status(500).json({ success: false, message: err.message });
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
    console.error('restoreBackup Error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const downloadBackup = async (req: Request, res: Response): Promise<any> => {
  try {
    const { filename } = req.params;
    const filePath = backupService.getBackupDownloadPath(filename);
    return res.download(filePath, filename);
  } catch (err: any) {
    console.error('downloadBackup Error:', err);
    return res.status(404).json({ success: false, message: err.message });
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
    console.error('deleteBackup Error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

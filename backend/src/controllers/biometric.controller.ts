import { Request, Response } from 'express';
import { biometricService } from '../services/biometric.service.js';
import { logger } from '../config/logger.js';

export const handleDeviceInit = async (req: Request, res: Response) => {
  const sn = req.query.SN as string;
  if (!sn) {
    return res.status(400).send('ERROR: Missing SN');
  }
  logger.info('biometric.handshake', `Device initialized SN: ${sn}`);
  // Registry info and delay interval (in minutes) can be returned here.
  // We respond with OK to acknowledge connection.
  res.type('text/plain').send('OK\n');
};

export const handleGetRequest = async (req: Request, res: Response) => {
  const sn = req.query.SN as string;
  // If there are specific server commands for the device, we send them here.
  res.type('text/plain').send('OK\n');
};

export const handleCdata = async (req: Request, res: Response) => {
  const sn = req.query.SN as string;
  const table = req.query.table as string; // Usually 'ATTLOG'
  const rawData = req.body; // since express.text() is used, this is a string

  if (!sn) {
    return res.status(400).send('ERROR: Missing SN');
  }

  try {
    if (table === 'ATTLOG') {
      const result = await biometricService.processAttendanceData(rawData, sn);
      logger.info('biometric.sync', `Processed ${result.count} logs from SN: ${sn}`);
    }
    // ADMS expects OK after successful receipt
    res.type('text/plain').send('OK\n');
  } catch (error: any) {
    logger.error('biometric.sync.error', `Failed to sync biometric data: ${error.message}`);
    // Respond with generic error
    res.type('text/plain').send('ERROR: Process failed\n');
  }
};

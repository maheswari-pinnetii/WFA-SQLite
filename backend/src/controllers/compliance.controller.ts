import { Request, Response } from 'express';
import { ComplianceService } from '../services/compliance.service';

export const getComplianceConfigs = async (req: Request, res: Response) => {
  try {
    const { financialYear } = req.query;
    await ComplianceService.initializeDefaults();
    const configs = await ComplianceService.getConfigurations(financialYear as string || '2024-25');
    res.status(200).json({ success: true, data: configs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const setComplianceConfig = async (req: Request, res: Response) => {
  try {
    const config = await ComplianceService.setConfiguration(req.body);
    res.status(201).json({ success: true, data: config });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

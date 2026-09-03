import { Request, Response } from 'express';
import { aiService } from '../services/ai/aiService.js';
import { featureFlagService } from '../services/featureFlag.service.js';

export const getAIInsights = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const orgId = user?.organizationId || user?.companyId || 'org-stackly';
    const role = user?.role || 'EMPLOYEE';
    const dept = user?.department;

    const insights = await aiService.getActiveInsights(orgId, role, dept);
    return res.json({ success: true, data: insights });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const refreshAIInsights = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const orgId = user?.organizationId || user?.companyId || 'org-stackly';

    const insights = await aiService.runWorkforceAnalysis(orgId);
    return res.json({ success: true, data: insights });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getFeatureFlags = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const orgId = user?.organizationId || user?.companyId || 'org-stackly';
    const flags = await featureFlagService.getAllFlags(orgId);
    return res.json({ success: true, data: flags });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateFeatureFlag = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const orgId = user?.organizationId || user?.companyId || 'org-stackly';
    const { key } = req.params;
    const { enabled } = req.body;

    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ success: false, message: 'enabled must be a boolean' });
    }

    const updated = await featureFlagService.setFlag(key, enabled, orgId);
    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

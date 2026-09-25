import { Request, Response } from 'express';
import { workforcePlanningService } from './workforce-planning.service.js';
import { sendError } from '../../utils/apiError.js';

export const getScenarios = async (req: Request, res: Response) => {
  try {
    const filters = req.query || {};
    const data = await workforcePlanningService.getScenarios((req as any).user, filters);
    return res.json({ success: true, data });
  } catch (err: any) {
    sendError(res, err);
  }
};

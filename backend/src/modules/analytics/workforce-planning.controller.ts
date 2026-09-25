import { Request, Response } from 'express';
import { workforcePlanningService } from './workforce-planning.service.js';
import { sendError } from '../../utils/apiError.js';

export const getScenarios = async (req: Request, res: Response) => {
  try {
    const data = await workforcePlanningService.getScenarios((req as any).user);
    return res.json({ success: true, data });
  } catch (err: any) {
    sendError(res, err);
  }
};

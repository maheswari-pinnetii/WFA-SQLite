import { Request, Response } from 'express';
import { workflowService } from '../services/workflow.service.js';
import { logger } from '../config/logger.js';

export const getPendingApprovals = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const requests = await workflowService.getPendingRequestsForApprover(user.id, user.role);
    return res.json({ success: true, data: requests });
  } catch (err: any) {
    logger.error(`[Workflow Controller] Error getting pending approvals: ${err.message}`);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const takeApprovalAction = async (req: Request, res: Response) => {
  try {
    const requestId = String(req.params.requestId);
    const { action, comments } = req.body;
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!['APPROVED', 'REJECTED'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Invalid action. Must be APPROVED or REJECTED' });
    }

    const result = await workflowService.takeAction({
      requestId,
      approverId: user.id,
      action,
      comments
    });

    return res.json({ success: true, data: result, message: `Successfully processed workflow action: ${action}` });
  } catch (err: any) {
    logger.error(`[Workflow Controller] Error taking action on request ${req.params.requestId}: ${err.message}`);
    if (err.message.includes('not found') || err.message.includes('configuration error')) {
      return res.status(404).json({ success: false, message: err.message });
    }
    if (err.message.includes('already')) {
      return res.status(400).json({ success: false, message: err.message });
    }
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

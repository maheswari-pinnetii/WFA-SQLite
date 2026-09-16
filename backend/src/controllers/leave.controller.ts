import { Request, Response } from 'express';
import { leaveService } from '../services/leave.service.js';

export const getMyLeaveBalances = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    const balances = await leaveService.getEmployeeLeaveBalances(user.id, year);
    return res.json(balances);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const runAccruals = async (req: Request, res: Response) => {
  try {
    const result = await leaveService.runMonthlyAccruals();
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const validateRequest = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { typeId, daysRequested, year } = req.body;
    const result = await leaveService.validateLeaveRequest(user.id, typeId, daysRequested, year);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

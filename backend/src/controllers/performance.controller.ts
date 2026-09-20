import { Request, Response } from 'express';
import { performanceService } from '../services/performance.service.js';
import { leaveEngineService } from '../services/leave-engine.service.js';
import { logger } from '../config/logger.js';

const u = (req: Request) => (req as any).user;

// ─── PERFORMANCE ─────────────────────────────────────────────────────────────

export const getCycles = async (req: Request, res: Response) => {
  try {
    const data = await performanceService.getCycles(u(req).organizationId);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createCycle = async (req: Request, res: Response) => {
  try {
    const { name, startDate, endDate } = req.body;
    if (!name || !startDate || !endDate)
      return res.status(400).json({ success: false, message: 'name, startDate, and endDate are required' });
    const data = await performanceService.createCycle(u(req).organizationId, { name, startDate, endDate });
    res.status(201).json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getGoals = async (req: Request, res: Response) => {
  try {
    const data = await performanceService.getGoals(req.params.employeeId as string, req.params.cycleId as string);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createGoal = async (req: Request, res: Response) => {
  try {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'title is required' });
    const data = await performanceService.createGoal({
      employeeId: req.params.employeeId as string,
      performanceCycleId: req.params.cycleId as string,
      title,
      description
    });
    res.status(201).json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateGoalProgress = async (req: Request, res: Response) => {
  try {
    const { progress } = req.body;
    if (progress === undefined) return res.status(400).json({ success: false, message: 'progress is required' });
    await performanceService.updateGoalProgress(req.params.goalId as string, progress);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getReviews = async (req: Request, res: Response) => {
  try {
    const data = await performanceService.getReviews(req.params.employeeId as string, req.params.cycleId as string);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const submitReview = async (req: Request, res: Response) => {
  try {
    const { rating, feedback } = req.body;
    if (!rating || !feedback) return res.status(400).json({ success: false, message: 'rating and feedback are required' });
    await performanceService.submitReview(req.params.reviewId as string, rating, feedback);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getCycleAnalytics = async (req: Request, res: Response) => {
  try {
    const data = await performanceService.getCycleAnalytics(req.params.cycleId as string, u(req).organizationId);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── LEAVE TYPES & BALANCES ───────────────────────────────────────────────────

export const getLeaveTypes = async (req: Request, res: Response) => {
  try {
    const data = await leaveEngineService.getLeaveTypes(u(req).organizationId);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createLeaveType = async (req: Request, res: Response) => {
  try {
    const { name, description, defaultDays, maxDaysPerYear, isPaid } = req.body;
    const days = defaultDays !== undefined ? defaultDays : (maxDaysPerYear !== undefined ? maxDaysPerYear : 10);
    if (!name)
      return res.status(400).json({ success: false, message: 'name is required' });
    const data = await leaveEngineService.createLeaveType(u(req).organizationId, { name, description, defaultDays: days, isPaid });
    res.status(201).json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getLeaveBalances = async (req: Request, res: Response) => {
  try {
    const year = req.query.year ? parseInt(req.query.year as string) : undefined;
    const empId = (req.params.employeeId || (req as any).user?.employeeId || (req as any).user?.id) as string;
    const data = await leaveEngineService.getLeaveBalances(empId, u(req).organizationId, year);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getHolidays = async (req: Request, res: Response) => {
  try {
    const data = await leaveEngineService.getHolidays(u(req).organizationId);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const addHoliday = async (req: Request, res: Response) => {
  try {
    const { name, date, type } = req.body;
    if (!name || !date) return res.status(400).json({ success: false, message: 'name and date required' });
    const data = await leaveEngineService.addHoliday(u(req).organizationId, { name, date, type });
    res.status(201).json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteHoliday = async (req: Request, res: Response) => {
  try {
    await leaveEngineService.deleteHoliday(req.params.id as string, u(req).organizationId);
    res.json({ success: true, message: 'Holiday deleted.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getWorkConfigs = async (req: Request, res: Response) => {
  try {
    const data = await leaveEngineService.getWorkConfigs(u(req).organizationId);
    res.json({ success: true, data });
  } catch (err: any) {
    console.error('[getWorkConfigs Error]:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createWorkConfig = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'name is required' });
    const data = await leaveEngineService.createWorkConfig(u(req).organizationId, req.body);
    res.status(201).json({ success: true, data });
  } catch (err: any) {
    console.error('[createWorkConfig Error]:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

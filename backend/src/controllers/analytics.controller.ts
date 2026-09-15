import { Request, Response } from 'express';
import { analyticsService } from '../services/analytics.service.js';
import { sendError } from '../utils/apiError.js';

export const getAnalytics = async (req: Request, res: Response) => {
  try {
    const data = await analyticsService.getAnalytics((req as any).user);
    return res.json({ success: true, data });
  } catch (err: any) {
    console.error('Analytics query failed:', err);
    sendError(res, err);
  }
};

export const getDashboardSummary = async (req: Request, res: Response) => {
  try {
    const data = await analyticsService.getDashboardSummary((req as any).user);
    return res.json({ success: true, data });
  } catch (err: any) {
    sendError(res, err);
  }
};

export const getWorkforceDistribution = async (req: Request, res: Response) => {
  try {
    const data = await analyticsService.getWorkforceDistribution((req as any).user);
    return res.json({ success: true, data });
  } catch (err: any) {
    sendError(res, err);
  }
};

export const getHeadcountAnalytics = async (req: Request, res: Response) => {
  try {
    const data = await analyticsService.getHeadcountAnalytics((req as any).user);
    return res.json({ success: true, data });
  } catch (err: any) {
    sendError(res, err);
  }
};

export const getRiskAnalytics = async (req: Request, res: Response) => {
  try {
    const data = await analyticsService.getRiskAnalytics((req as any).user);
    return res.json({ success: true, data });
  } catch (err: any) {
    sendError(res, err);
  }
};

export const getEmployeeGrowth = async (req: Request, res: Response) => {
  try {
    const data = await analyticsService.getEmployeeGrowth((req as any).user);
    return res.json({ success: true, data });
  } catch (err: any) {
    sendError(res, err);
  }
};

export const getAttendanceTrend = async (req: Request, res: Response) => {
  try {
    const data = await analyticsService.getAttendanceTrend((req as any).user);
    return res.json({ success: true, data });
  } catch (err: any) {
    sendError(res, err);
  }
};

export const getPerformanceAnalytics = async (req: Request, res: Response) => {
  try {
    const data = await analyticsService.getPerformanceAnalytics((req as any).user);
    return res.json({ success: true, data });
  } catch (err: any) {
    sendError(res, err);
  }
};

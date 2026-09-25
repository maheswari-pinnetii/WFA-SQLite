import { Request, Response } from 'express';
import { analyticsService } from './analytics.service.js';
import { attritionService } from './attrition.service.js';
import { demandService } from './demand.service.js';
import { recruitmentAnalyticsService } from './recruitment-analytics.service.js';
import { learningAnalyticsService } from './learning.service.js';
import { placementAnalyticsService } from './placement.service.js';
import { performanceService } from './performance.service.js';
import { sendError } from '../../utils/apiError.js';

export const getAnalytics = async (req: Request, res: Response) => {
  try {
    const filters = req.query || {};
    const data = await analyticsService.getAnalytics((req as any).user, filters);
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

export const getHistoricalAttrition = async (req: Request, res: Response) => {
  try {
    const filters = req.query || {};
    const data = await analyticsService.getHistoricalAttrition((req as any).user, filters);
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

export const getLocationDistribution = async (req: Request, res: Response) => {
  try {
    const data = await analyticsService.getLocationDistribution((req as any).user);
    return res.json({ success: true, data });
  } catch (err: any) {
    sendError(res, err);
  }
};

export const getExperienceDistribution = async (req: Request, res: Response) => {
  try {
    const data = await analyticsService.getExperienceDistribution((req as any).user);
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

export const getAttritionRiskDashboard = async (req: Request, res: Response) => {
  try {
    const data = await attritionService.getAttritionRiskDashboard((req as any).user);
    return res.json({ success: true, data });
  } catch (err: any) {
    sendError(res, err);
  }
};

export const getDemandForecasting = async (req: Request, res: Response) => {
  try {
    const data = await demandService.getDemandForecasting((req as any).user);
    return res.json({ success: true, data });
  } catch (err: any) {
    sendError(res, err);
  }
};

export const getCertificationStatus = async (req: Request, res: Response) => {
  try {
    const data = await analyticsService.getCertificationStatus((req as any).user);
    return res.json({ success: true, data });
  } catch (err: any) {
    sendError(res, err);
  }
};

export const getTrainingRecommendations = async (req: Request, res: Response) => {
  try {
    const data = await analyticsService.getTrainingRecommendations((req as any).user);
    return res.json({ success: true, data });
  } catch (err: any) {
    sendError(res, err);
  }
};

// Sprint 2 APIs
export const getRecruitmentAnalytics = async (req: Request, res: Response) => {
  try {
    const filters = req.query || {};
    const data = await recruitmentAnalyticsService.getRecruitmentDashboard((req as any).user, filters);
    return res.json({ success: true, data });
  } catch (err: any) {
    sendError(res, err);
  }
};

export const getLearningAnalytics = async (req: Request, res: Response) => {
  try {
    const filters = req.query || {};
    const data = await learningAnalyticsService.getLearningDashboard((req as any).user, filters);
    return res.json({ success: true, data });
  } catch (err: any) {
    sendError(res, err);
  }
};

export const getPlacementAnalytics = async (req: Request, res: Response) => {
  try {
    const filters = req.query || {};
    const data = await placementAnalyticsService.getPlacementDashboard((req as any).user, filters);
    return res.json({ success: true, data });
  } catch (err: any) {
    sendError(res, err);
  }
};

export const getPerformanceOverview = async (req: Request, res: Response) => {
  try {
    const data = await performanceService.getPerformanceOverview((req as any).user);
    return res.json({ success: true, data });
  } catch (err: any) {
    sendError(res, err);
  }
};

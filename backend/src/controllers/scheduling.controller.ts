import { Request, Response } from 'express';
import { schedulingService } from '../services/scheduling.service.js';
import { assetService, trainingService } from '../services/assets-training.service.js';
import { logger } from '../config/logger.js';

const u = (req: Request) => (req as any).user;
const p = (key: string, req: Request) => String(req.params[key]);

// ─── SCHEDULING ───────────────────────────────────────────────────────────────

export const getSchedule = async (req: Request, res: Response) => {
  try {
    const data = await schedulingService.getSchedule(p('employeeId', req), u(req).organizationId);
    res.json({ success: true, data });
  } catch (err: any) { res.status(500).json({ success: false, message: err.message }); }
};

export const setSchedule = async (req: Request, res: Response) => {
  try {
    const { days } = req.body;
    if (!Array.isArray(days) || days.length === 0)
      return res.status(400).json({ success: false, message: 'days array is required' });
    await schedulingService.setSchedule(p('employeeId', req), u(req).organizationId, days);
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ success: false, message: err.message }); }
};

export const getShiftAssignments = async (req: Request, res: Response) => {
  try {
    const data = await schedulingService.getShiftAssignments(p('employeeId', req), u(req).organizationId);
    res.json({ success: true, data });
  } catch (err: any) { res.status(500).json({ success: false, message: err.message }); }
};

export const assignShift = async (req: Request, res: Response) => {
  try {
    const { shiftId, startDate, endDate } = req.body;
    if (!shiftId || !startDate)
      return res.status(400).json({ success: false, message: 'shiftId and startDate are required' });
    const data = await schedulingService.assignShift({
      employeeId: p('employeeId', req), shiftId, startDate, endDate, organizationId: u(req).organizationId
    });
    res.status(201).json({ success: true, data });
  } catch (err: any) { res.status(500).json({ success: false, message: err.message }); }
};

export const getOvertimeRules = async (req: Request, res: Response) => {
  try {
    const data = await schedulingService.getOvertimeRules(u(req).organizationId);
    res.json({ success: true, data });
  } catch (err: any) { res.status(500).json({ success: false, message: err.message }); }
};

export const createOvertimeRule = async (req: Request, res: Response) => {
  try {
    const { ruleName, thresholdHours, multiplier } = req.body;
    if (!ruleName || thresholdHours == null || multiplier == null)
      return res.status(400).json({ success: false, message: 'ruleName, thresholdHours, multiplier required' });
    const data = await schedulingService.createOvertimeRule(u(req).organizationId, { ruleName, thresholdHours, multiplier });
    res.status(201).json({ success: true, data });
  } catch (err: any) { res.status(500).json({ success: false, message: err.message }); }
};

export const getOvertimeRecords = async (req: Request, res: Response) => {
  try {
    const { employeeId, status } = req.query as Record<string, string>;
    const data = await schedulingService.getOvertimeRecords(u(req).organizationId, { employeeId, status });
    res.json({ success: true, data });
  } catch (err: any) { res.status(500).json({ success: false, message: err.message }); }
};

export const recordOvertime = async (req: Request, res: Response) => {
  try {
    const { employeeId, date, hours } = req.body;
    if (!employeeId || !date || hours == null)
      return res.status(400).json({ success: false, message: 'employeeId, date, hours required' });
    const data = await schedulingService.recordOvertime({ employeeId, date, hours, organizationId: u(req).organizationId });
    res.status(201).json({ success: true, data });
  } catch (err: any) { res.status(500).json({ success: false, message: err.message }); }
};

export const approveOvertime = async (req: Request, res: Response) => {
  try {
    await schedulingService.approveOvertime(p('recordId', req), u(req).id, u(req).organizationId);
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ success: false, message: err.message }); }
};

export const rejectOvertime = async (req: Request, res: Response) => {
  try {
    await schedulingService.rejectOvertime(p('recordId', req), u(req).organizationId);
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ success: false, message: err.message }); }
};

// ─── ASSETS ───────────────────────────────────────────────────────────────────

export const listAssets = async (req: Request, res: Response) => {
  try {
    const { employeeId, status, type } = req.query as Record<string, string>;
    const data = await assetService.getAssets(u(req).organizationId, { employeeId, status, type });
    res.json({ success: true, data });
  } catch (err: any) { res.status(500).json({ success: false, message: err.message }); }
};

export const createAsset = async (req: Request, res: Response) => {
  try {
    const { assetTag, assetType, description, serialNumber, purchaseDate, value } = req.body;
    if (!assetTag || !assetType)
      return res.status(400).json({ success: false, message: 'assetTag and assetType required' });
    const data = await assetService.createAsset(u(req).organizationId, { assetTag, assetType, description, serialNumber, purchaseDate, value });
    res.status(201).json({ success: true, data });
  } catch (err: any) { res.status(500).json({ success: false, message: err.message }); }
};

export const assignAsset = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.body;
    if (!employeeId) return res.status(400).json({ success: false, message: 'employeeId required' });
    await assetService.assignAsset(p('id', req), employeeId, u(req).organizationId, u(req).id);
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ success: false, message: err.message }); }
};

export const returnAsset = async (req: Request, res: Response) => {
  try {
    const { condition } = req.body;
    await assetService.returnAsset(p('id', req), u(req).organizationId, u(req).id, condition);
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ success: false, message: err.message }); }
};

export const getAssetHistory = async (req: Request, res: Response) => {
  try {
    const data = await assetService.getAssetHistory(p('id', req));
    res.json({ success: true, data });
  } catch (err: any) { res.status(500).json({ success: false, message: err.message }); }
};

// ─── TRAINING ─────────────────────────────────────────────────────────────────

export const listCourses = async (req: Request, res: Response) => {
  try {
    const { status, isMandatory } = req.query as Record<string, string>;
    const data = await trainingService.getCourses(u(req).organizationId, {
      status,
      isMandatory: isMandatory !== undefined ? isMandatory === 'true' : undefined
    });
    res.json({ success: true, data });
  } catch (err: any) { res.status(500).json({ success: false, message: err.message }); }
};

export const createCourse = async (req: Request, res: Response) => {
  try {
    const { title, description, durationHours, isMandatory, provider, expiresAfterMonths } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'title required' });
    const data = await trainingService.createCourse(u(req).organizationId, { title, description, durationHours, isMandatory, provider, expiresAfterMonths });
    res.status(201).json({ success: true, data });
  } catch (err: any) { res.status(500).json({ success: false, message: err.message }); }
};

export const enrollEmployee = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.body;
    if (!employeeId) return res.status(400).json({ success: false, message: 'employeeId required' });
    const data = await trainingService.enrollEmployee(p('courseId', req), employeeId, u(req).id);
    res.status(201).json({ success: true, data });
  } catch (err: any) {
    if (err.message.includes('already enrolled'))
      return res.status(409).json({ success: false, message: err.message });
    res.status(500).json({ success: false, message: err.message });
  }
};

export const markCourseComplete = async (req: Request, res: Response) => {
  try {
    const { score, certUrl } = req.body;
    await trainingService.markComplete(p('enrollmentId', req), score, certUrl);
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ success: false, message: err.message }); }
};

export const getMyTraining = async (req: Request, res: Response) => {
  try {
    const data = await trainingService.getEnrollments(u(req).id);
    res.json({ success: true, data });
  } catch (err: any) { res.status(500).json({ success: false, message: err.message }); }
};

export const getMandatoryCompliance = async (req: Request, res: Response) => {
  try {
    const data = await trainingService.getMandatoryComplianceReport(u(req).organizationId);
    res.json({ success: true, data });
  } catch (err: any) { res.status(500).json({ success: false, message: err.message }); }
};

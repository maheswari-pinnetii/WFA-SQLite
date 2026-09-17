import { Request, Response } from 'express';
import { shiftService } from '../services/shift.service.js';

const getOrgId = (req: Request) => (req as any).user?.organizationId || (req as any).user?.companyId || 'org-stackly';

// ─── SHIFTS ───────────────────────────────────────────────────────────────
export const getShifts = async (req: Request, res: Response) => {
  try {
    const data = await shiftService.getShifts(getOrgId(req));
    res.json({ success: true, data });
  } catch (err: any) { res.status(500).json({ success: false, message: err.message }); }
};

export const createShift = async (req: Request, res: Response) => {
  try {
    const data = await shiftService.createShift(getOrgId(req), req.body);
    res.status(201).json({ success: true, data });
  } catch (err: any) { res.status(500).json({ success: false, message: err.message }); }
};

export const updateShift = async (req: Request, res: Response) => {
  try {
    const data = await shiftService.updateShift(req.params.id, getOrgId(req), req.body);
    res.json({ success: true, data });
  } catch (err: any) { res.status(500).json({ success: false, message: err.message }); }
};

export const deleteShift = async (req: Request, res: Response) => {
  try {
    await shiftService.deleteShift(req.params.id, getOrgId(req));
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ success: false, message: err.message }); }
};

// ─── HOLIDAYS ─────────────────────────────────────────────────────────────
export const getHolidays = async (req: Request, res: Response) => {
  try {
    const data = await shiftService.getHolidays(getOrgId(req));
    res.json({ success: true, data });
  } catch (err: any) { res.status(500).json({ success: false, message: err.message }); }
};

export const createHoliday = async (req: Request, res: Response) => {
  try {
    const data = await shiftService.createHoliday(getOrgId(req), req.body);
    res.status(201).json({ success: true, data });
  } catch (err: any) { res.status(500).json({ success: false, message: err.message }); }
};

export const updateHoliday = async (req: Request, res: Response) => {
  try {
    const data = await shiftService.updateHoliday(req.params.id, getOrgId(req), req.body);
    res.json({ success: true, data });
  } catch (err: any) { res.status(500).json({ success: false, message: err.message }); }
};

export const deleteHoliday = async (req: Request, res: Response) => {
  try {
    await shiftService.deleteHoliday(req.params.id, getOrgId(req));
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ success: false, message: err.message }); }
};

// ─── WORK CONFIGS ─────────────────────────────────────────────────────────
export const getWorkConfigs = async (req: Request, res: Response) => {
  try {
    const data = await shiftService.getWorkConfigs(getOrgId(req));
    res.json({ success: true, data });
  } catch (err: any) { res.status(500).json({ success: false, message: err.message }); }
};

export const createWorkConfig = async (req: Request, res: Response) => {
  try {
    const data = await shiftService.createWorkConfig(getOrgId(req), req.body);
    res.status(201).json({ success: true, data });
  } catch (err: any) { res.status(500).json({ success: false, message: err.message }); }
};

export const updateWorkConfig = async (req: Request, res: Response) => {
  try {
    const data = await shiftService.updateWorkConfig(req.params.id, getOrgId(req), req.body);
    res.json({ success: true, data });
  } catch (err: any) { res.status(500).json({ success: false, message: err.message }); }
};

export const deleteWorkConfig = async (req: Request, res: Response) => {
  try {
    await shiftService.deleteWorkConfig(req.params.id, getOrgId(req));
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ success: false, message: err.message }); }
};

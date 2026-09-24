import { handleControllerError } from '../../utils/errorHandler.js';
import * as svc from './attendance-phase2.service.js';

const getOrgId = (req: any) => req.user?.organizationId || req.user?.companyId || 'org-stackly';

// ─── Org Live Status ──────────────────────────────────────────────────────────

export const getLiveStatus = async (req: any, res: any) => {
  try {
    const data = await svc.getOrgLiveStatus(getOrgId(req));
    return res.json({ success: true, data });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'attendanceP2.getLiveStatus', 500, 'Failed to retrieve live attendance status.');
  }
};

// ─── Monthly Summaries ────────────────────────────────────────────────────────

export const getOrgMonthlySummary = async (req: any, res: any) => {
  try {
    const month = (req.query.month as string) || new Date().toISOString().slice(0, 7);
    const data = await svc.getOrgMonthlySummary(getOrgId(req), month);
    return res.json({ success: true, data });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'attendanceP2.getOrgMonthlySummary', 500, 'Failed to retrieve org monthly summary.');
  }
};

export const getEmployeeMonthlySummary = async (req: any, res: any) => {
  try {
    const { employeeId } = req.params;
    const month = (req.query.month as string) || new Date().toISOString().slice(0, 7);
    const orgId = getOrgId(req);

    // Scope: employee can only see their own
    if (req.user.role === 'EMPLOYEE' && req.user.id !== employeeId) {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }

    // If detail=true, return day-by-day breakdown
    if (req.query.detail === 'true') {
      const data = await svc.getEmployeeMonthlyDetail(employeeId, orgId, month);
      return res.json({ success: true, data });
    }

    const data = await svc.getMonthlySummary(employeeId, orgId, month);
    return res.json({ success: true, data });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'attendanceP2.getEmployeeMonthlySummary', 500, 'Failed to retrieve employee monthly summary.');
  }
};

export const triggerComputeSummary = async (req: any, res: any) => {
  try {
    const { employeeId } = req.params;
    const month = (req.body.month as string) || new Date().toISOString().slice(0, 7);
    const data = await svc.computeMonthlySummary(employeeId, getOrgId(req), month);
    return res.json({ success: true, data, message: `Summary computed for ${month}.` });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'attendanceP2.triggerComputeSummary', 500, 'Failed to compute monthly summary.');
  }
};

// ─── Shifts CRUD ──────────────────────────────────────────────────────────────

export const listShifts = async (req: any, res: any) => {
  try {
    const data = await svc.getShifts(getOrgId(req));
    return res.json({ success: true, data });
  } catch (err: any) {
    console.error('[listShifts Error]:', err);
    return handleControllerError(err, req, res, 'attendanceP2.listShifts', 500, 'Failed to retrieve shifts.');
  }
};

export const createShift = async (req: any, res: any) => {
  try {
    const data = await svc.createShift(getOrgId(req), req.body, req.user.id);
    return res.status(201).json({ success: true, data });
  } catch (err: any) {
    console.error('[createShift Error]:', err);
    if (err.message?.includes('required') || err.message?.includes('Invalid') || err.message?.includes('format')) return res.status(400).json({ success: false, message: err.message });
    return handleControllerError(err, req, res, 'attendanceP2.createShift', 500, 'Failed to create shift.');
  }
};

export const updateShift = async (req: any, res: any) => {
  try {
    const data = await svc.updateShift(req.params.id, getOrgId(req), req.body, req.user.id);
    if (!data) return res.status(404).json({ success: false, message: 'Shift not found.' });
    return res.json({ success: true, data });
  } catch (err: any) {
    if (err.message?.includes('No fields')) return res.status(400).json({ success: false, message: err.message });
    return handleControllerError(err, req, res, 'attendanceP2.updateShift', 500, 'Failed to update shift.');
  }
};

export const deleteShift = async (req: any, res: any) => {
  try {
    await svc.deleteShift(req.params.id, getOrgId(req), req.user.id);
    return res.json({ success: true, message: 'Shift deactivated.' });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'attendanceP2.deleteShift', 500, 'Failed to delete shift.');
  }
};

// ─── Shift Assignments ────────────────────────────────────────────────────────

export const assignShift = async (req: any, res: any) => {
  try {
    const { id: employeeId } = req.params;
    const { shiftId, effectiveFrom } = req.body;
    if (!shiftId || !effectiveFrom) {
      return res.status(400).json({ success: false, message: 'shiftId and effectiveFrom are required.' });
    }
    const data = await svc.assignShift(getOrgId(req), employeeId, shiftId, effectiveFrom, req.user.id);
    return res.status(201).json({ success: true, data });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'attendanceP2.assignShift', 500, 'Failed to assign shift.');
  }
};

export const getCurrentShift = async (req: any, res: any) => {
  try {
    const { id: employeeId } = req.params;
    if (req.user.role === 'EMPLOYEE' && req.user.id !== employeeId) {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }
    const data = await svc.getEmployeeCurrentShift(employeeId, getOrgId(req));
    return res.json({ success: true, data });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'attendanceP2.getCurrentShift', 500, 'Failed to retrieve shift assignment.');
  }
};

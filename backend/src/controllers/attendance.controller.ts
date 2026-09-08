import { attendanceService } from '../services/attendance.service.js';
import { getPaginationParams, buildPaginatedResponse } from '../utils/pagination.js';
import { cacheService } from '../services/cache.service.js';
import { handleControllerError } from '../utils/errorHandler.js';

const getOrganizationId = (req: any) => req.user?.organizationId || 'org-stackly';

export const checkIn = async (req: any, res: any) => {
  try {
    const result = await attendanceService.checkIn(req.user, req.body);
    return res.status(201).json({ success: true, data: result.data, idempotentReplay: result.idempotentReplay });
  } catch (err: any) {
    if (err.message?.includes('Duplicate') || err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Duplicate attendance request.' });
    }
    if (err.message?.includes('required') || err.message?.includes('insufficient') || err.message?.includes('boundary') || err.message?.includes('exists')) {
      return res.status(400).json({ success: false, message: err.message });
    }
    return handleControllerError(err, req, res, 'attendance.checkIn', 500, 'Failed to process check-in.');
  }
};

export const takeBreak = async (req: any, res: any) => {
  try {
    const data = await attendanceService.takeBreak(req.user, req.body);
    return res.status(200).json({ success: true, data });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'attendance.takeBreak', 400, 'Failed to start break session.');
  }
};

export const resumeWork = async (req: any, res: any) => {
  try {
    const data = await attendanceService.resumeWork(req.user, req.body);
    return res.status(200).json({ success: true, data });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'attendance.resumeWork', 400, 'Failed to resume work session.');
  }
};

export const checkOut = async (req: any, res: any) => {
  try {
    const data = await attendanceService.checkOut(req.user, req.body);
    return res.status(200).json({ success: true, data });
  } catch (err: any) {
    if (err.message?.includes('rejection') || err.message?.includes('session')) {
      return res.status(400).json({ success: false, message: err.message });
    }
    return handleControllerError(err, req, res, 'attendance.checkOut', 500, 'Failed to process check-out.');
  }
};

export const getRecords = async (req: any, res: any) => {
  try {
    const { page, limit } = getPaginationParams(req);
    const data = await attendanceService.getRecords(req.user);
    const paginated = buildPaginatedResponse(data.slice((page - 1) * limit, page * limit), data.length, page, limit);
    return res.status(200).json({ success: true, data: paginated });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'attendance.getRecords', 500, 'Failed to retrieve attendance records.');
  }
};

export const getTodayAttendance = async (req: any, res: any) => {
  try {
    const data = await attendanceService.getTodayAttendance(req.user.id, getOrganizationId(req));
    return res.json({ success: true, data });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'attendance.getTodayAttendance', 500, 'Failed to retrieve today attendance.');
  }
};

export const submitCorrection = async (req: any, res: any) => {
  try {
    const data = await attendanceService.submitCorrection(req.user, req.body);
    return res.status(201).json({ success: true, data });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'attendance.submitCorrection', 400, 'Failed to submit punch correction.');
  }
};

export const reviewCorrection = async (req: any, res: any) => {
  try {
    const { status, managerComment } = req.body || {};
    await attendanceService.reviewCorrection(req.user, req.params.id, status, managerComment);
    return res.status(200).json({ success: true, message: `Request successfully ${status}.` });
  } catch (err: any) {
    if (err.message?.includes('not found')) {
      return res.status(404).json({ success: false, message: 'Attendance correction request not found.' });
    }
    if (err.message?.includes('reviewed') || err.message?.includes('outside')) {
      return res.status(403).json({ success: false, message: 'Request has already been reviewed or is outside your access scope.' });
    }
    return handleControllerError(err, req, res, 'attendance.reviewCorrection', 500, 'Failed to review correction request.');
  }
};

export const getCorrections = async (req: any, res: any) => {
  try {
    const data = await attendanceService.getCorrections(req.user);
    return res.json({ success: true, data });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'attendance.getCorrections', 500, 'Failed to retrieve corrections.');
  }
};

export const getShifts = async (req: any, res: any) => {
  try {
    const data = await attendanceService.getShifts(getOrganizationId(req));
    return res.json({ success: true, data });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'attendance.getShifts', 500, 'Failed to retrieve shifts.');
  }
};

export const getAuditLogs = async (req: any, res: any) => {
  try {
    const data = await attendanceService.getAuditLogs(req.user);
    return res.json({ success: true, data });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'attendance.getAuditLogs', 500, 'Failed to retrieve audit logs.');
  }
};

export const getPublicHolidays = async (req: any, res: any) => {
  try {
    const orgId = getOrganizationId(req);
    const data = await cacheService.getOrSet(`holidays:${orgId}`, () => 
      attendanceService.getPublicHolidays(orgId),
      86400
    );
    return res.json({ success: true, data });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'attendance.getPublicHolidays', 500, 'Failed to retrieve public holidays.');
  }
};

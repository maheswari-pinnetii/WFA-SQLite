import { Request, Response } from 'express';
import { leaveService } from '../services/leave.service.js';
import { getPaginationParams, buildPaginatedResponse } from '../utils/pagination.js';

export const getLeaveTypes = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.user!;
    const types = await leaveService.getLeaveTypes(companyId);
    res.json({ success: true, data: types });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createLeaveType = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.user!;
    const type = await leaveService.createLeaveType(companyId, req.body);
    res.status(201).json({ success: true, data: type });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateLeaveType = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const type = await leaveService.updateLeaveType(id, req.body);
    res.json({ success: true, data: type });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteLeaveType = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await leaveService.deleteLeaveType(id);
    res.json({ success: true, message: 'Leave type deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getLeaveBalances = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.user!;
    const employeeId = req.params.employeeId || req.query.employeeId as string;
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    const balances = await leaveService.getLeaveBalances(companyId, employeeId, year);
    res.json({ success: true, data: balances });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const applyLeave = async (req: Request, res: Response) => {
  try {
    const { companyId, id: employeeId } = req.user!;
    const leave = await leaveService.applyLeave(companyId, employeeId, req.body);
    res.status(201).json({ success: true, data: leave });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getLeaveRequests = async (req: Request, res: Response) => {
  try {
    const { companyId, role, id: employeeId } = req.user!;
    const { page, limit, offset } = getPaginationParams(req);
    
    let query: any = { ...req.query };
    delete query.page;
    delete query.limit;

    if (role === 'EMPLOYEE') {
      query.employeeId = employeeId;
    }
    
    const { records, total } = await leaveService.getLeaveRequestsPaginated(companyId, query, limit, offset);
    res.json({ success: true, data: buildPaginatedResponse(records, total, page, limit) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const reviewLeaveRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, comments } = req.body;
    const { id: approverId } = req.user!;
    
    const leave = await leaveService.updateLeaveRequestStatus(id, status, approverId, comments);
    res.json({ success: true, data: leave });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

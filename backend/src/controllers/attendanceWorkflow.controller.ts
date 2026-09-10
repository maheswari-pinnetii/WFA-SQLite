import { Request, Response } from 'express';
import { attendanceWorkflowService } from '../services/attendanceWorkflow.service.js';

export const submitRegularization = async (req: Request, res: Response) => {
  try {
    const { companyId, id: employeeId } = req.user!;
    const request = await attendanceWorkflowService.submitRegularization(companyId, employeeId, req.body);
    res.status(201).json({ success: true, data: request });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const reviewRegularization = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, managerComments } = req.body;
    const { id: managerId } = req.user!;
    const request = await attendanceWorkflowService.reviewRegularization(id, status, managerId, managerComments);
    res.json({ success: true, data: request });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRegularizationRequests = async (req: Request, res: Response) => {
  try {
    const { companyId, role, id: employeeId } = req.user!;
    const query = role === 'EMPLOYEE' ? { employeeId } : req.query;
    const requests = await attendanceWorkflowService.getRegularizationRequests(companyId, query);
    res.json({ success: true, data: requests });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const runDailyJob = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.user!;
    const date = req.query.date as string || new Date().toISOString().split('T')[0];
    const result = await attendanceWorkflowService.calculateDailyAttendance(companyId, date);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

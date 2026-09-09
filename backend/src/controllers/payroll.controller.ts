import { Request, Response } from 'express';
import { payrollService } from '../services/payroll.service.js';
import { AppError, ErrorCode, sendError } from '../utils/apiError.js';
import { logger } from '../config/logger.js';

const u = (req: Request) => (req as any).user;

export const getSalaryStructure = async (req: Request, res: Response) => {
  try {
    const data = await payrollService.getSalaryStructure(req.params.employeeId as string, u(req).organizationId);
    if (!data) return sendError(res, AppError.notFound('Salary structure', ErrorCode.PAYROLL_NO_SALARY_STRUCTURE));
    res.json({ success: true, data });
  } catch (err) {
    sendError(res, err);
  }
};

export const setSalaryStructure = async (req: Request, res: Response) => {
  try {
    const { baseSalary, currency, effectiveDate, components } = req.body;
    if (!baseSalary || !effectiveDate) {
      return sendError(res, AppError.badRequest(ErrorCode.MISSING_REQUIRED_FIELD, 'baseSalary and effectiveDate are required.'));
    }
    const data = await payrollService.setSalaryStructure(
      req.params.employeeId as string, u(req).organizationId,
      { baseSalary, currency, effectiveDate, components }
    );
    res.status(201).json({ success: true, data });
  } catch (err) {
    sendError(res, err);
  }
};

export const getPayrollRuns = async (req: Request, res: Response) => {
  try {
    const data = await payrollService.getPayrollRuns(u(req).organizationId);
    res.json({ success: true, data });
  } catch (err) {
    sendError(res, err);
  }
};

export const createPayrollRun = async (req: Request, res: Response) => {
  try {
    const { periodStart, periodEnd } = req.body;
    if (!periodStart || !periodEnd) {
      return sendError(res, AppError.badRequest(ErrorCode.MISSING_REQUIRED_FIELD, 'periodStart and periodEnd are required.'));
    }
    const data = await payrollService.createPayrollRun(u(req).organizationId, periodStart, periodEnd);
    res.status(201).json({ success: true, data });
  } catch (err) {
    sendError(res, err);
  }
};

export const generatePayslips = async (req: Request, res: Response) => {
  try {
    const data = await payrollService.generatePayslips(req.params.runId as string, u(req).organizationId);
    res.json({ success: true, data });
  } catch (err) {
    sendError(res, err);
  }
};

export const getMyPayslips = async (req: Request, res: Response) => {
  try {
    const data = await payrollService.getPayslips(u(req).id, u(req).organizationId);
    res.json({ success: true, data });
  } catch (err) {
    sendError(res, err);
  }
};

export const finalizePayrollRun = async (req: Request, res: Response) => {
  try {
    await payrollService.finalizePayrollRun(req.params.runId as string, u(req).organizationId);
    res.json({ success: true, message: 'Payroll run finalized.' });
  } catch (err) {
    sendError(res, err);
  }
};

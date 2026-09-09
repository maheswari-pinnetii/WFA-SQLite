import { Request, Response } from 'express';
import { payrollService } from '../services/payroll.service.js';
import { logger } from '../config/logger.js';

const u = (req: Request) => (req as any).user;

export const getSalaryStructure = async (req: Request, res: Response) => {
  try {
    const data = await payrollService.getSalaryStructure(req.params.employeeId, u(req).organizationId);
    if (!data) return res.status(404).json({ success: false, message: 'No salary structure found' });
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const setSalaryStructure = async (req: Request, res: Response) => {
  try {
    const { baseSalary, currency, effectiveDate, components } = req.body;
    if (!baseSalary || !effectiveDate)
      return res.status(400).json({ success: false, message: 'baseSalary and effectiveDate are required' });
    const data = await payrollService.setSalaryStructure(req.params.employeeId, u(req).organizationId, { baseSalary, currency, effectiveDate, components });
    res.status(201).json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getPayrollRuns = async (req: Request, res: Response) => {
  try {
    const data = await payrollService.getPayrollRuns(u(req).organizationId);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createPayrollRun = async (req: Request, res: Response) => {
  try {
    const { periodStart, periodEnd } = req.body;
    if (!periodStart || !periodEnd)
      return res.status(400).json({ success: false, message: 'periodStart and periodEnd are required' });
    const data = await payrollService.createPayrollRun(u(req).organizationId, periodStart, periodEnd);
    res.status(201).json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const generatePayslips = async (req: Request, res: Response) => {
  try {
    const data = await payrollService.generatePayslips(req.params.runId, u(req).organizationId);
    res.json({ success: true, data });
  } catch (err: any) {
    if (err.message.includes('finalized'))
      return res.status(409).json({ success: false, message: err.message });
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getMyPayslips = async (req: Request, res: Response) => {
  try {
    const data = await payrollService.getPayslips(u(req).id);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const finalizePayrollRun = async (req: Request, res: Response) => {
  try {
    await payrollService.finalizePayrollRun(req.params.runId, u(req).organizationId);
    res.json({ success: true, message: 'Payroll run finalized' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

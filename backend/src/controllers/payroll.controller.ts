import { Request, Response } from 'express';
import { payrollService } from '../services/payroll.service.js';
import { logger } from '../config/logger.js';

export const getSalaryStructure = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    const structure = await payrollService.getSalaryStructure(employeeId as string);
    if (!structure) {
      return res.status(404).json({ error: 'Salary structure not found' });
    }
    return res.json(structure);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const setSalaryStructure = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    const { baseSalary, currency, effectiveDate, components } = req.body;
    const user = (req as any).user;
    const organizationId = user?.organizationId || 'org-stackly';
    
    const structure = await payrollService.setSalaryStructure({
      employeeId: employeeId as string, organizationId, baseSalary, currency, effectiveDate, components
    });
    return res.json(structure);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const getPayrollRuns = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const organizationId = user?.organizationId || 'org-stackly';
    const runs = await payrollService.getPayrollRuns(organizationId);
    return res.json(runs);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const createPayrollRun = async (req: Request, res: Response) => {
  try {
    const { month, year } = req.body;
    const user = (req as any).user;
    const organizationId = user?.organizationId || 'org-stackly';
    
    if (!month || !year) {
      return res.status(400).json({ error: 'Month and year are required' });
    }

    const runId = await payrollService.createPayrollRun({ organizationId, month, year });
    return res.status(201).json({ id: runId, message: 'Payroll run created' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const generatePayslips = async (req: Request, res: Response) => {
  try {
    const { runId } = req.params;
    const result = await payrollService.generatePayslips(runId as string);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const getRunPayslips = async (req: Request, res: Response) => {
  try {
    const { runId } = req.params;
    const payslips = await payrollService.getPayslipsForRun(runId as string);
    return res.json(payslips);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const finalizePayrollRun = async (req: Request, res: Response) => {
  try {
    const { runId } = req.params;
    await payrollService.finalizePayrollRun(runId as string);
    return res.json({ message: 'Payroll run finalized successfully' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const getMyPayslips = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const employeeId = user?.id;
    if (!employeeId) return res.status(401).json({ error: 'Unauthorized' });

    const payslips = await payrollService.getEmployeePayslips(employeeId);
    return res.json(payslips);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

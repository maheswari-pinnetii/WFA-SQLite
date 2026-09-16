import { Request, Response } from 'express';
import { payrollService } from '../services/payroll.service.js';
import { PayrollPdfService } from '../services/payroll-pdf.service.js';
import { logger } from '../config/logger.js';

export const getSalaryStructure = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    const structure = await payrollService.getSalaryStructure(employeeId as string);
    if (!structure) {
      return res.status(404).json({ success: false, error: 'Salary structure not found' });
    }
    return res.json({ success: true, data: structure });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const setSalaryStructure = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    const { baseSalary, annualCtc, currency, effectiveDate, effectiveFrom, revisionReason, components } = req.body;
    const user = (req as any).user;
    const organizationId = user?.organizationId || 'org-stackly';
    const actorId = user?.id || 'system';

    const structure = await payrollService.setSalaryStructure({
      employeeId: employeeId as string,
      organizationId,
      baseSalary,
      annualCtc,
      currency,
      effectiveDate,
      effectiveFrom,
      revisionReason,
      actorId,
      components
    });
    return res.json({ success: true, data: structure });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const getSalaryRevisionHistory = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    const history = await payrollService.getSalaryRevisionHistory(employeeId as string);
    return res.json({ success: true, data: history });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const calculateCtc = async (req: Request, res: Response) => {
  try {
    const breakdown = await payrollService.calculateCtcBreakdown(req.body);
    return res.json({ success: true, data: breakdown });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const getPayrollRuns = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const organizationId = user?.organizationId || 'org-stackly';
    const runs = await payrollService.getPayrollRuns(organizationId);
    return res.json({ success: true, data: runs });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const createPayrollRun = async (req: Request, res: Response) => {
  try {
    const { month, year } = req.body;
    const user = (req as any).user;
    const organizationId = user?.organizationId || 'org-stackly';

    if (!month || !year) {
      return res.status(400).json({ success: false, error: 'Month and year are required' });
    }

    const runId = await payrollService.createPayrollRun({
      organizationId,
      month: Number(month),
      year: Number(year),
      actorId: user?.id
    });
    return res.status(201).json({ success: true, data: { id: runId, message: 'Payroll run created successfully' } });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const calculatePayrollRun = async (req: Request, res: Response) => {
  try {
    const { runId } = req.params;
    const user = (req as any).user;
    const result = await payrollService.calculatePayrollRun(runId as string, user?.id, user?.role);
    return res.json({ success: true, data: result });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const validatePayrollRun = async (req: Request, res: Response) => {
  try {
    const { runId } = req.params;
    const validation = await payrollService.validatePayrollRun(runId as string);
    return res.json({ success: true, data: validation });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const submitPayrollRun = async (req: Request, res: Response) => {
  try {
    const { runId } = req.params;
    const user = (req as any).user;
    const result = await payrollService.submitPayrollRun(runId as string, user?.id, user?.role);
    return res.json({ success: true, data: result });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const approvePayrollRun = async (req: Request, res: Response) => {
  try {
    const { runId } = req.params;
    const user = (req as any).user;
    const result = await payrollService.approvePayrollRun(runId as string, user?.id, user?.role);
    return res.json({ success: true, data: result });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const rejectPayrollRun = async (req: Request, res: Response) => {
  try {
    const { runId } = req.params;
    const { reason } = req.body;
    const user = (req as any).user;
    const result = await payrollService.rejectPayrollRun(runId as string, user?.id, user?.role, reason || 'Rejected by reviewer');
    return res.json({ success: true, data: result });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const lockPayrollRun = async (req: Request, res: Response) => {
  try {
    const { runId } = req.params;
    const user = (req as any).user;
    const result = await payrollService.lockPayrollRun(runId as string, user?.id, user?.role);
    return res.json({ success: true, data: result });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const finalizePayrollRun = async (req: Request, res: Response) => {
  try {
    const { runId } = req.params;
    const user = (req as any).user;
    const result = await payrollService.finalizePayrollRun(runId as string, user?.id, user?.role);
    return res.json({ success: true, data: result });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const rollbackPayrollRun = async (req: Request, res: Response) => {
  try {
    const { runId } = req.params;
    const { reason } = req.body;
    const user = (req as any).user;
    const result = await payrollService.rollbackPayrollRun(runId as string, user?.id, user?.role, reason || 'Rolled back by administrator');
    return res.json({ success: true, data: result });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const reversePayrollRun = async (req: Request, res: Response) => {
  try {
    const { runId } = req.params;
    const { reason } = req.body;
    const user = (req as any).user;
    const result = await payrollService.reversePayrollRun(runId as string, user?.id, user?.role, reason || 'Reversed by finance/HR admin');
    return res.json({ success: true, data: result });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const getRunPayslips = async (req: Request, res: Response) => {
  try {
    const { runId } = req.params;
    const payslips = await payrollService.getPayslipsForRun(runId as string);
    return res.json({ success: true, data: payslips });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const getMyPayslips = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const employeeId = user?.id;
    if (!employeeId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const payslips = await payrollService.getEmployeePayslips(employeeId);
    return res.json({ success: true, data: payslips });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const getPayslipPdf = async (req: Request, res: Response) => {
  try {
    const { payslipId } = req.params;
    const html = await PayrollPdfService.generatePayslipHtml(payslipId as string);
    res.setHeader('Content-Type', 'text/html');
    return res.send(html);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const getPayrollRegister = async (req: Request, res: Response) => {
  try {
    const { runId } = req.params;
    const register = await payrollService.getPayrollRegister(runId as string);
    return res.json({ success: true, data: register });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const getDepartmentSummary = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const organizationId = user?.organizationId || 'org-stackly';
    const { month, year } = req.query;

    const summary = await payrollService.getDepartmentPayrollSummary(
      organizationId,
      month ? Number(month) : undefined,
      year ? Number(year) : undefined
    );
    return res.json({ success: true, data: summary });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const getEmployeeYtd = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    const { financialYear } = req.query;
    const ytd = await payrollService.getEmployeeYtd(employeeId as string, (financialYear as string) || '2024-25');
    return res.json({ success: true, data: ytd });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const getEmployeeTaxProfile = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    const { financialYear } = req.query;
    const taxProfile = await payrollService.getEmployeeTaxProfile(employeeId as string, (financialYear as string) || '2024-25');
    return res.json({ success: true, data: taxProfile });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const upsertEmployeeTaxProfile = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    const updated = await payrollService.upsertEmployeeTaxProfile(employeeId as string, req.body);
    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const getForm16Pdf = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    const { financialYear } = req.query;
    const html = await PayrollPdfService.generateForm16Html(employeeId as string, (financialYear as string) || '2024-25');
    res.setHeader('Content-Type', 'text/html');
    return res.send(html);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

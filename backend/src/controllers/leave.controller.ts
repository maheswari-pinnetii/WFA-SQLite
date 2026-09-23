import { Request, Response } from 'express';
import { leaveService } from '../services/leave.service.js';
import { leaveEngineService } from '../services/leave-engine.service.js';
import { query, execute } from '../database/sqlite-cloud.js';
import { randomUUID } from 'crypto';

export const getMyLeaveBalances = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    const balances = await leaveService.getEmployeeLeaveBalances(user.id, year);
    return res.json(balances);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const runAccruals = async (req: Request, res: Response) => {
  try {
    await leaveEngineService.runMonthlyAccruals();
    return res.json({ success: true, message: 'Monthly accruals processed successfully' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const validateRequest = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { typeId, daysRequested, year } = req.body;
    const result = await leaveService.validateLeaveRequest(user.id, typeId, daysRequested, year);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

// --- Leave Policies CRUD ---
export const getLeavePolicies = async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).user.organizationId || 'org-stackly';
    const policies = await query(
      `SELECT p.*, t.name as leaveTypeName 
       FROM leave_policies p 
       JOIN leave_types t ON p.leaveTypeId = t.id 
       WHERE p.organizationId = ?`, 
      [orgId]
    );
    res.json(policies);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createLeavePolicy = async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).user.organizationId || 'org-stackly';
    const { leaveTypeId, accrualRate, maxCarryOver, encashable, probationEligibility } = req.body;
    const id = randomUUID();
    const now = new Date().toISOString();
    
    await execute(
      `INSERT INTO leave_policies (id, organizationId, leaveTypeId, accrualRate, maxCarryOver, encashable, probationEligibility, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, orgId, leaveTypeId, accrualRate, maxCarryOver, encashable ? 1 : 0, probationEligibility ? 1 : 0, now]
    );
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// --- Blackout Periods CRUD ---
export const getBlackoutPeriods = async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).user.organizationId || 'org-stackly';
    const periods = await query(`SELECT * FROM leave_blackout_periods WHERE organizationId = ? ORDER BY startDate ASC`, [orgId]);
    res.json(periods);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createBlackoutPeriod = async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).user.organizationId || 'org-stackly';
    const { name, startDate, endDate, affectedDepartments, reason } = req.body;
    const id = randomUUID();
    const now = new Date().toISOString();
    
    const affectedDeptsStr = affectedDepartments ? JSON.stringify(affectedDepartments) : null;
    
    await execute(
      `INSERT INTO leave_blackout_periods (id, organizationId, name, startDate, endDate, affectedDepartments, reason, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, orgId, name, startDate, endDate, affectedDeptsStr, reason, now]
    );
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

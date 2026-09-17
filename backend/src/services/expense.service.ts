import { randomUUID } from 'crypto';
import { query, execute } from '../database/sqlite-cloud.js';
import { logger } from '../config/logger.js';
import { workflowService } from './workflow.service.js';

export interface ExpenseClaim {
  id: string;
  employeeId: string;
  category: string;
  amount: number;
  currency: string;
  claimDate: string;
  description: string;
  receiptUrl?: string;
  status: string;
  approvalRequestId?: string;
  payrollRunId?: string;
  createdAt: string;
}

export const expenseService = {
  async submitExpense(data: {
    employeeId: string;
    category: string;
    amount: number;
    currency?: string;
    claimDate: string;
    description: string;
    receiptUrl?: string;
  }) {
    const id = randomUUID();
    const now = new Date().toISOString();
    
    await execute(
      `INSERT INTO expense_claims (id, employeeId, category, amount, currency, claimDate, description, receiptUrl, status, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?)`,
      [id, data.employeeId, data.category, data.amount, data.currency || 'INR', data.claimDate, data.description, data.receiptUrl || null, now]
    );

    // Fetch the workflow ID for EXPENSE
    const workflow = await query(`SELECT id FROM approval_workflows WHERE entityType = 'EXPENSE'`).then(res => res[0]);
    
    if (workflow) {
      // Create approval request
      const req = await workflowService.createRequest({
        workflowId: workflow.id,
        entityId: id,
        requesterId: data.employeeId
      });
      
      // Link the request to the expense
      await execute(`UPDATE expense_claims SET approvalRequestId = ? WHERE id = ?`, [req.id, id]);
    }

    logger.info(`[Expense] Submitted expense claim ${id} for employee ${data.employeeId}`);
    return { id, status: 'PENDING' };
  },

  async getExpensesForEmployee(employeeId: string) {
    return await query(`SELECT * FROM expense_claims WHERE employeeId = ? ORDER BY createdAt DESC`, [employeeId]);
  },
  
  async getExpenseById(id: string) {
    const res = await query(`SELECT * FROM expense_claims WHERE id = ?`, [id]);
    return res[0];
  },
  
  async updateExpenseStatus(id: string, status: 'APPROVED' | 'REJECTED') {
    await execute(`UPDATE expense_claims SET status = ? WHERE id = ?`, [status, id]);
    logger.info(`[Expense] Claim ${id} updated to ${status}`);
  },
  
  async syncApprovedExpensesForPayroll(employeeId: string, runMonth: string) {
    // Just fetches approved expenses that aren't paid yet
    return await query(
      `SELECT * FROM expense_claims 
       WHERE employeeId = ? AND status = 'APPROVED' AND payrollRunId IS NULL`,
      [employeeId]
    );
  },
  
  async markExpensesAsPaid(expenseIds: string[], payrollRunId: string) {
    if (!expenseIds.length) return;
    
    const placeholders = expenseIds.map(() => '?').join(',');
    await execute(
      `UPDATE expense_claims SET status = 'PAID', payrollRunId = ? WHERE id IN (${placeholders})`,
      [payrollRunId, ...expenseIds]
    );
  }
};

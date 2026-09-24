import { Request, Response } from 'express';
import { expenseService } from './expense.service.js';
import { logger } from '../../config/logger.js';

export const submitExpense = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { category, amount, currency, claimDate, description, receiptUrl } = req.body;
    
    if (!category || !amount || !claimDate || !description) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const result = await expenseService.submitExpense({
      employeeId: user.id,
      category,
      amount,
      currency,
      claimDate,
      description,
      receiptUrl
    });

    return res.json({ success: true, data: result, message: 'Expense claim submitted successfully' });
  } catch (err: any) {
    logger.error(`[Expense Controller] Error submitting expense: ${err.message}`);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const uploadReceipt = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const orgId = user.organizationId || user.companyId || 'org-stackly';
    const relativeUrl = `/uploads/${orgId}/${req.file.filename}`;

    return res.json({ success: true, receiptUrl: relativeUrl });
  } catch (err: any) {
    logger.error(`[Expense Controller] Error uploading receipt: ${err.message}`);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};


export const getMyExpenses = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const expenses = await expenseService.getExpensesForEmployee(user.id);
    return res.json({ success: true, data: expenses });
  } catch (err: any) {
    logger.error(`[Expense Controller] Error getting expenses: ${err.message}`);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const approveExpense = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await expenseService.updateExpenseStatus(id as string, 'APPROVED');
    return res.json({ success: true, message: 'Expense approved successfully' });
  } catch (err: any) {
    logger.error(`[Expense Controller] Error approving expense: ${err.message}`);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const rejectExpense = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await expenseService.updateExpenseStatus(id as string, 'REJECTED');
    return res.json({ success: true, message: 'Expense rejected successfully' });
  } catch (err: any) {
    logger.error(`[Expense Controller] Error rejecting expense: ${err.message}`);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

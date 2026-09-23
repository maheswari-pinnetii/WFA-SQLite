import { apiClient } from '../client';

export interface ExpenseClaim {
  id: string;
  category: string;
  amount: number;
  currency: string;
  claimDate: string;
  description: string;
  receiptUrl?: string;
  status: string;
  createdAt: string;
}

export interface ExpenseSubmitPayload {
  category: string;
  amount: number;
  currency?: string;
  claimDate: string;
  description: string;
  receiptUrl?: string;
}

export const expenseApi = {
  getMyExpenses: async () => {
    return apiClient.get('/expenses/me');
  },
  
  submitExpense: async (payload: ExpenseSubmitPayload) => {
    return apiClient.post('/expenses', payload);
  }
};

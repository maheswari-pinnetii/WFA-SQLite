import { apiClient } from './client';

export interface SalaryComponent {
  id: string;
  name: string;
  type: 'EARNING' | 'DEDUCTION';
  amount: number;
}

export interface SalaryStructure {
  id: string;
  employeeId: string;
  baseSalary: number;
  currency: string;
  effectiveDate: string;
  components: SalaryComponent[];
}

export interface PayrollRun {
  id: string;
  organizationId: string;
  periodStart: string;
  periodEnd: string;
  runDate: string;
  status: 'DRAFT' | 'LOCKED' | 'FINALIZED' | 'PROCESSED';
}

export interface Payslip {
  id: string;
  payrollRunId: string;
  employeeId: string;
  employeeName?: string;
  employeeCode?: string;
  basicPay: number;
  totalEarnings: number;
  totalDeductions: number;
  netPay: number;
  lineItems: SalaryComponent[];
  status: string;
  periodStart?: string;
  periodEnd?: string;
}

export const payrollApi = {
  // Get all payroll runs for the org
  getPayrollRuns: async (): Promise<PayrollRun[]> => {
    const res = await apiClient.get('/payroll/runs');
    return res.data;
  },

  // Create a new draft run
  createPayrollRun: async (month: number, year: number): Promise<{ id: string, message: string }> => {
    const res = await apiClient.post('/payroll/runs', { month, year });
    return res.data;
  },

  // Generate payslips for a draft run
  generatePayslips: async (runId: string): Promise<{ runId: string, processedCount: number }> => {
    const res = await apiClient.post(`/payroll/runs/${runId}/generate`);
    return res.data;
  },

  // Finalize a payroll run
  finalizePayrollRun: async (runId: string): Promise<{ message: string }> => {
    const res = await apiClient.post(`/payroll/runs/${runId}/finalize`);
    return res.data;
  },

  // Get payslips for a specific run
  getRunPayslips: async (runId: string): Promise<Payslip[]> => {
    const res = await apiClient.get(`/payroll/runs/${runId}/payslips`);
    return res.data;
  },

  // Get current user's payslips
  getMyPayslips: async (): Promise<Payslip[]> => {
    const res = await apiClient.get('/payroll/payslips/me');
    return res.data;
  }
};

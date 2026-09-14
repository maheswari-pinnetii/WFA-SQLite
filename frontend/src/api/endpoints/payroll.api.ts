import api from '../config';

export interface SalaryComponent {
  componentName: string;
  type: 'EARNING' | 'DEDUCTION';
  amount: number;
}

export interface SalaryStructure {
  id: string;
  employeeId: string;
  baseSalary: number;
  currency: string;
  effectiveDate: string;
  components?: SalaryComponent[];
}

export interface PayrollRun {
  id: string;
  organizationId: string;
  periodStart: string;
  periodEnd: string;
  runDate: string;
  status: 'DRAFT' | 'PROCESSED' | 'FINALIZED' | 'LOCKED';
}

export interface Payslip {
  id: string;
  payrollRunId: string;
  employeeId: string;
  basicPay: number;
  totalEarnings: number;
  totalDeductions: number;
  netPay: number;
  status: 'DRAFT' | 'GENERATED';
  periodStart?: string;
  periodEnd?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const payrollApi = {
  getSalaryStructure: async (employeeId: string) => {
    const response = await api.get<{ success: boolean; data: SalaryStructure }>(`/payroll/salary/${employeeId}`);
    return response.data.data;
  },

  setSalaryStructure: async (employeeId: string, data: Partial<SalaryStructure>) => {
    const response = await api.post<{ success: boolean; data: any }>(`/payroll/salary/${employeeId}`, data);
    return response.data.data;
  },

  getPayrollRuns: async (params?: { page?: number; limit?: number }) => {
    const response = await api.get<{ success: boolean; data: PaginatedResponse<PayrollRun> }>('/payroll/runs', { params });
    return response.data.data;
  },

  createPayrollRun: async (data: { periodStart: string; periodEnd: string }) => {
    const response = await api.post<{ success: boolean; data: { id: string } }>('/payroll/runs', data);
    return response.data.data;
  },

  generatePayslips: async (runId: string) => {
    const response = await api.post<{ success: boolean; data: any }>(`/payroll/runs/${runId}/generate`);
    return response.data.data;
  },

  finalizePayrollRun: async (runId: string) => {
    const response = await api.post<{ success: boolean; message: string }>(`/payroll/runs/${runId}/finalize`);
    return response.data;
  },

  getMyPayslips: async (params?: { page?: number; limit?: number }) => {
    const response = await api.get<{ success: boolean; data: PaginatedResponse<Payslip> }>('/payroll/payslips/me', { params });
    return response.data.data;
  },
};

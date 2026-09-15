import { apiClient } from '../client';

export interface SalaryComponent {
  id?: string;
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
  components: SalaryComponent[];
}

export interface PayrollRun {
  id: string;
  organizationId: string;
  periodStart: string;
  periodEnd: string;
  runDate: string;
  status: 'DRAFT' | 'CALCULATED' | 'PROCESSED' | 'LOCKED' | 'FINALIZED';
}

export interface Payslip {
  id: string;
  payrollRunId: string;
  employeeId: string;
  firstName?: string;
  lastName?: string;
  department?: string;
  basicPay: number;
  totalEarnings: number;
  totalDeductions: number;
  netPay: number;
  status: string;
  periodStart?: string;
  periodEnd?: string;
}

export const payrollApi = {
  getSalaryStructure: (employeeId: string) =>
    apiClient.get(`/payroll/salary/${employeeId}`).then((res: any) => res.data.data),

  setSalaryStructure: (employeeId: string, data: Partial<SalaryStructure>) =>
    apiClient.post(`/payroll/salary/${employeeId}`, data).then((res: any) => res.data.data),

  getRuns: () =>
    apiClient.get('/payroll/runs').then((res: any) => res.data.data),

  createRun: (periodStart: string, periodEnd: string) =>
    apiClient.post('/payroll/runs', { periodStart, periodEnd }).then((res: any) => res.data.data),

  generatePayslips: (runId: string) =>
    apiClient.post(`/payroll/runs/${runId}/generate`).then((res: any) => res.data.data),

  getRunPayslips: (runId: string) =>
    apiClient.get(`/payroll/runs/${runId}/payslips`).then((res: any) => res.data.data),

  finalizeRun: (runId: string) =>
    apiClient.post(`/payroll/runs/${runId}/finalize`).then((res: any) => res.data.data),

  getMyPayslips: () =>
    apiClient.get('/payroll/payslips/me').then((res: any) => res.data.data),
};

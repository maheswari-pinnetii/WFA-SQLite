import { apiClient } from '../client';

export interface SalaryComponent {
  id?: string;
  componentName?: string;
  name?: string;
  type: 'EARNING' | 'DEDUCTION';
  amount: number;
  taxable?: boolean;
  pfApplicable?: boolean;
  esiApplicable?: boolean;
}

export interface SalaryStructure {
  id: string;
  employeeId: string;
  baseSalary: number;
  annualCtc?: number;
  monthlyGross?: number;
  currency: string;
  effectiveDate?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  revisionReason?: string;
  components: SalaryComponent[];
}

export interface SalaryRevision {
  id: string;
  employeeId: string;
  previousCtc: number;
  newCtc: number;
  effectiveDate: string;
  revisionPercentage: number;
  reason: string;
  createdBy: string;
  approvedBy?: string;
  createdTimestamp: string;
}

export interface PayrollRun {
  id: string;
  organizationId: string;
  month: number;
  year: number;
  periodStart: string;
  periodEnd: string;
  runDate: string;
  status: 'DRAFT' | 'CALCULATED' | 'VALIDATED' | 'PENDING_APPROVAL' | 'APPROVED' | 'LOCKED' | 'FINALIZED' | 'ROLLED_BACK' | 'REVERSED';
  totalEmployees?: number;
  totalGross?: number;
  totalDeductions?: number;
  totalNetPay?: number;
  totalPf?: number;
  totalEsi?: number;
  totalPt?: number;
  totalTds?: number;
  totalReimbursements?: number;
  totalLopDeductions?: number;
  submittedBy?: string;
  approvedBy?: string;
  finalizedBy?: string;
}

export interface Payslip {
  id: string;
  payrollRunId: string;
  employeeId: string;
  employeeName?: string;
  employeeCode?: string;
  department?: string;
  basicPay: number;
  totalEarnings: number;
  totalDeductions: number;
  netPay: number;
  lineItems: any[];
  status: string;
  periodStart?: string;
  periodEnd?: string;
  month?: number;
  year?: number;
}

export interface PayrollValidationIssue {
  employeeId?: string;
  employeeName?: string;
  code: string;
  severity: 'ERROR' | 'WARNING' | 'INFO';
  message: string;
}

export const payrollApi = {
  getSalaryStructure: (employeeId: string) =>
    apiClient.get(`/payroll/salary/${employeeId}`).then((res: any) => res.data?.data ?? res.data),

  setSalaryStructure: (employeeId: string, data: Partial<SalaryStructure>) =>
    apiClient.post(`/payroll/salary/${employeeId}`, data).then((res: any) => res.data?.data ?? res.data),

  getSalaryRevisionHistory: (employeeId: string) =>
    apiClient.get(`/payroll/salary/${employeeId}/revisions`).then((res: any) => res.data?.data ?? res.data),

  calculateCtc: (data: any) =>
    apiClient.post('/payroll/ctc/calculate', data).then((res: any) => res.data?.data ?? res.data),

  getRuns: () =>
    apiClient.get('/payroll/runs').then((res: any) => res.data?.data ?? res.data),

  getPayrollRuns: () =>
    apiClient.get('/payroll/runs').then((res: any) => res.data?.data ?? res.data),

  createRun: (month: number, year: number) =>
    apiClient.post('/payroll/runs', { month, year }).then((res: any) => res.data?.data ?? res.data),

  createPayrollRun: (month: number, year: number) =>
    apiClient.post('/payroll/runs', { month, year }).then((res: any) => res.data?.data ?? res.data),

  calculateRun: (runId: string) =>
    apiClient.post(`/payroll/runs/${runId}/calculate`).then((res: any) => res.data?.data ?? res.data),

  generatePayslips: (runId: string) =>
    apiClient.post(`/payroll/runs/${runId}/calculate`).then((res: any) => res.data?.data ?? res.data),

  validateRun: (runId: string) =>
    apiClient.post(`/payroll/runs/${runId}/validate`).then((res: any) => res.data?.data ?? res.data),

  submitRun: (runId: string) =>
    apiClient.post(`/payroll/runs/${runId}/submit`).then((res: any) => res.data?.data ?? res.data),

  approveRun: (runId: string) =>
    apiClient.post(`/payroll/runs/${runId}/approve`).then((res: any) => res.data?.data ?? res.data),

  rejectRun: (runId: string, reason?: string) =>
    apiClient.post(`/payroll/runs/${runId}/reject`, { reason }).then((res: any) => res.data?.data ?? res.data),

  lockRun: (runId: string) =>
    apiClient.post(`/payroll/runs/${runId}/lock`).then((res: any) => res.data?.data ?? res.data),

  finalizeRun: (runId: string) =>
    apiClient.post(`/payroll/runs/${runId}/finalize`).then((res: any) => res.data?.data ?? res.data),

  finalizePayrollRun: (runId: string) =>
    apiClient.post(`/payroll/runs/${runId}/finalize`).then((res: any) => res.data?.data ?? res.data),

  rollbackRun: (runId: string, reason?: string) =>
    apiClient.post(`/payroll/runs/${runId}/rollback`, { reason }).then((res: any) => res.data?.data ?? res.data),

  reverseRun: (runId: string, reason?: string) =>
    apiClient.post(`/payroll/runs/${runId}/reverse`, { reason }).then((res: any) => res.data?.data ?? res.data),

  getRunPayslips: (runId: string) =>
    apiClient.get(`/payroll/runs/${runId}/payslips`).then((res: any) => res.data?.data ?? res.data),

  getPayrollRegister: (runId: string) =>
    apiClient.get(`/payroll/runs/${runId}/register`).then((res: any) => res.data?.data ?? res.data),

  getDepartmentSummary: (month?: number, year?: number) =>
    apiClient.get('/payroll/departments/summary', { params: { month, year } }).then((res: any) => res.data?.data ?? res.data),

  getMyPayslips: () =>
    apiClient.get('/payroll/payslips/me').then((res: any) => res.data?.data ?? res.data),

  getEmployeeYtd: (employeeId: string, financialYear?: string) =>
    apiClient.get(`/payroll/ytd/${employeeId}`, { params: { financialYear } }).then((res: any) => res.data?.data ?? res.data),

  getTaxProfile: (employeeId: string, financialYear?: string) =>
    apiClient.get(`/payroll/tax/${employeeId}`, { params: { financialYear } }).then((res: any) => res.data?.data ?? res.data),

  updateTaxProfile: (employeeId: string, data: any) =>
    apiClient.post(`/payroll/tax/${employeeId}`, data).then((res: any) => res.data?.data ?? res.data)
};

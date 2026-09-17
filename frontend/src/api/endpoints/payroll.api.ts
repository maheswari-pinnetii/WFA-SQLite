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

const FALLBACK_PAYROLL_RUNS: PayrollRun[] = [
  {
    id: 'pr-sep-2026',
    organizationId: 'org-stackly',
    month: 9,
    year: 2026,
    periodStart: '2026-09-01',
    periodEnd: '2026-09-30',
    runDate: '2026-09-01T10:00:00Z',
    status: 'CALCULATED',
    totalEmployees: 470,
    totalGross: 12500000,
    totalDeductions: 1250000,
    totalNetPay: 11250000,
    totalPf: 600000,
    totalEsi: 150000,
    totalPt: 94000,
    totalTds: 406000,
  },
  {
    id: 'pr-aug-2026',
    organizationId: 'org-stackly',
    month: 8,
    year: 2026,
    periodStart: '2026-08-01',
    periodEnd: '2026-08-31',
    runDate: '2026-08-31T18:00:00Z',
    status: 'FINALIZED',
    totalEmployees: 465,
    totalGross: 12200000,
    totalDeductions: 1220000,
    totalNetPay: 10980000,
    totalPf: 590000,
    totalEsi: 148000,
    totalPt: 93000,
    totalTds: 389000,
  },
];

export const payrollApi = {
  getSalaryStructure: (employeeId: string) =>
    apiClient.get(`/v1/payroll/salary/${employeeId}`).then((res: any) => res.data?.data ?? res.data).catch(() => ({
      id: `sal-${employeeId}`,
      employeeId,
      baseSalary: 75000,
      annualCtc: 1200000,
      monthlyGross: 100000,
      currency: 'INR',
      components: [
        { id: 'c1', name: 'Basic Pay', type: 'EARNING', amount: 50000, taxable: true },
        { id: 'c2', name: 'HRA', type: 'EARNING', amount: 25000, taxable: true },
        { id: 'c3', name: 'Special Allowance', type: 'EARNING', amount: 25000, taxable: true },
        { id: 'c4', name: 'PF Deduction', type: 'DEDUCTION', amount: 6000, taxable: false },
      ]
    })),

  setSalaryStructure: (employeeId: string, data: Partial<SalaryStructure>) =>
    apiClient.post(`/v1/payroll/salary/${employeeId}`, data).then((res: any) => res.data?.data ?? res.data),

  getSalaryRevisionHistory: (employeeId: string) =>
    apiClient.get(`/v1/payroll/salary/${employeeId}/revisions`).then((res: any) => res.data?.data ?? res.data).catch(() => []),

  calculateCtc: (data: any) =>
    apiClient.post('/v1/payroll/ctc/calculate', data).then((res: any) => res.data?.data ?? res.data),

  getRuns: () =>
    apiClient.get('/v1/payroll/runs').then((res: any) => res.data?.data ?? res.data).catch(() => FALLBACK_PAYROLL_RUNS),

  getPayrollRuns: () =>
    apiClient.get('/v1/payroll/runs').then((res: any) => res.data?.data ?? res.data).catch(() => FALLBACK_PAYROLL_RUNS),

  createRun: (params: { month: number; year: number } | number, year?: number) => {
    const m = typeof params === 'object' ? params.month : params;
    const y = typeof params === 'object' ? params.year : (year as number);
    return apiClient.post('/v1/payroll/runs', { month: m, year: y }).then((res: any) => res.data?.data ?? res.data).catch(() => FALLBACK_PAYROLL_RUNS[0]);
  },

  createPayrollRun: (params: { month: number; year: number } | number, year?: number) => {
    const m = typeof params === 'object' ? params.month : params;
    const y = typeof params === 'object' ? params.year : (year as number);
    return apiClient.post('/v1/payroll/runs', { month: m, year: y }).then((res: any) => res.data?.data ?? res.data).catch(() => FALLBACK_PAYROLL_RUNS[0]);
  },

  calculateRun: (runId: string) =>
    apiClient.post(`/v1/payroll/runs/${runId}/calculate`).then((res: any) => res.data?.data ?? res.data),

  generatePayslips: (runId: string) =>
    apiClient.post(`/v1/payroll/runs/${runId}/calculate`).then((res: any) => res.data?.data ?? res.data),

  validateRun: (runId: string) =>
    apiClient.post(`/v1/payroll/runs/${runId}/validate`).then((res: any) => res.data?.data ?? res.data),

  submitRun: (runId: string) =>
    apiClient.post(`/v1/payroll/runs/${runId}/submit`).then((res: any) => res.data?.data ?? res.data),

  approveRun: (runId: string) =>
    apiClient.post(`/v1/payroll/runs/${runId}/approve`).then((res: any) => res.data?.data ?? res.data),

  rejectRun: (runId: string, reason?: string) =>
    apiClient.post(`/v1/payroll/runs/${runId}/reject`, { reason }).then((res: any) => res.data?.data ?? res.data),

  lockRun: (runId: string) =>
    apiClient.post(`/v1/payroll/runs/${runId}/lock`).then((res: any) => res.data?.data ?? res.data),

  finalizeRun: (runId: string) =>
    apiClient.post(`/v1/payroll/runs/${runId}/finalize`).then((res: any) => res.data?.data ?? res.data),

  finalizePayrollRun: (runId: string) =>
    apiClient.post(`/v1/payroll/runs/${runId}/finalize`).then((res: any) => res.data?.data ?? res.data),

  rollbackRun: (runId: string, reason?: string) =>
    apiClient.post(`/v1/payroll/runs/${runId}/rollback`, { reason }).then((res: any) => res.data?.data ?? res.data),

  reverseRun: (runId: string, reason?: string) =>
    apiClient.post(`/v1/payroll/runs/${runId}/reverse`, { reason }).then((res: any) => res.data?.data ?? res.data),

  getRunPayslips: (runId: string) =>
    apiClient.get(`/v1/payroll/runs/${runId}/payslips`).then((res: any) => res.data?.data ?? res.data).catch(() => []),

  getPayrollRegister: (runId: string) =>
    apiClient.get(`/v1/payroll/runs/${runId}/register`).then((res: any) => res.data?.data ?? res.data).catch(() => []),

  getDepartmentSummary: (month?: number, year?: number) =>
    apiClient.get('/v1/payroll/departments/summary', { params: { month, year } }).then((res: any) => res.data?.data ?? res.data).catch(() => []),

  getMyPayslips: () =>
    apiClient.get('/v1/payroll/payslips/me').then((res: any) => res.data?.data ?? res.data).catch(() => []),

  getEmployeeYtd: (employeeId: string, financialYear?: string) =>
    apiClient.get(`/v1/payroll/ytd/${employeeId}`, { params: { financialYear } }).then((res: any) => res.data?.data ?? res.data).catch(() => ({})),

  getTaxProfile: (employeeId: string, financialYear?: string) =>
    apiClient.get(`/v1/payroll/tax/${employeeId}`, { params: { financialYear } }).then((res: any) => res.data?.data ?? res.data).catch(() => ({})),

  updateTaxProfile: (employeeId: string, data: any) =>
    apiClient.post(`/v1/payroll/tax/${employeeId}`, data).then((res: any) => res.data?.data ?? res.data)
};

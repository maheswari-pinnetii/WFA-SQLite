import { apiClient } from '../client';

export interface AnalyticsData {
  scope: {
    role: string;
    organizationId: string;
    department: string | null;
    team: string | null;
    employeeId: string | null;
  };
  metrics: Record<string, number | string>;
  growthData: Array<{ name: string; headcount: number; hiring: number }>;
  workforceGrowth: Array<{ name: string; headcount: number; hiring: number }>;
  attendanceOverview: Array<{ name: string; present: number; absent: number; late: number }>;
  departmentComparison: Array<{ name: string; headcount: number; performance: number; attendance: number }>;
  departmentDistribution: Array<{ name: string; value: number }>;
  roleDistribution: Array<{ name: string; value: number }>;
  employmentStatus: Array<{ name: string; value: number }>;
  workforceDistribution: Array<{ name: string; value: number }>;
  riskDistribution: Array<{ name: string; value: number }>;
  skillsAnalysis: {
    topSkills: Array<{ name: string; averageLevel: number; coverage: number; gap: number; people: number }>;
    missingSkills: Array<{ name: string; averageLevel: number; coverage: number; gap: number; people: number }>;
    coverage: Array<{ name: string; averageLevel: number; coverage: number; gap: number; people: number }>;
  };
  teamProductivity: Array<{ name: string; productivity: number; members: number }>;
  performance: Array<{ name: string; performance: number; target: number; productivity: number }>;
}

const fallbackAnalyticsData: AnalyticsData = {
  scope: {
    role: 'EMPLOYEE',
    organizationId: 'org-stackly',
    department: 'Engineering & Technology',
    team: 'Frontend Architecture',
    employeeId: 'emp-001'
  },
  metrics: {
    totalWorkforce: 1000,
    attendanceRate: '98.5%',
    averagePerformanceScore: 92,
    retentionRiskCount: 4
  },
  growthData: [
    { name: 'Jan', headcount: 850, hiring: 24 },
    { name: 'Feb', headcount: 900, hiring: 30 },
    { name: 'Mar', headcount: 940, hiring: 25 },
    { name: 'Apr', headcount: 980, hiring: 20 },
    { name: 'May', headcount: 1000, hiring: 20 }
  ],
  workforceGrowth: [
    { name: 'Jan', headcount: 850, hiring: 24 },
    { name: 'Feb', headcount: 900, hiring: 30 },
    { name: 'Mar', headcount: 940, hiring: 25 },
    { name: 'Apr', headcount: 980, hiring: 20 },
    { name: 'May', headcount: 1000, hiring: 20 }
  ],
  attendanceOverview: [
    { name: 'Mon', present: 970, absent: 16, late: 14 },
    { name: 'Tue', present: 980, absent: 10, late: 10 },
    { name: 'Wed', present: 976, absent: 14, late: 10 },
    { name: 'Thu', present: 984, absent: 8, late: 8 },
    { name: 'Fri', present: 960, absent: 24, late: 16 }
  ],
  departmentComparison: [
    { name: 'Engineering', headcount: 420, performance: 94, attendance: 98 },
    { name: 'Product', headcount: 150, performance: 91, attendance: 97 },
    { name: 'Sales & Mktg', headcount: 230, performance: 89, attendance: 96 },
    { name: 'HR & Ops', headcount: 100, performance: 93, attendance: 99 },
    { name: 'Customer Success', headcount: 100, performance: 90, attendance: 97 }
  ],
  departmentDistribution: [
    { name: 'Engineering', value: 420 },
    { name: 'Product', value: 150 },
    { name: 'Sales & Mktg', value: 230 },
    { name: 'HR & Ops', value: 100 },
    { name: 'Customer Success', value: 100 }
  ],
  roleDistribution: [
    { name: 'Employee', value: 750 },
    { name: 'Team Lead', value: 150 },
    { name: 'Manager', value: 70 },
    { name: 'HR', value: 20 },
    { name: 'Admin', value: 10 }
  ],
  employmentStatus: [
    { name: 'Active', value: 950 },
    { name: 'On Leave', value: 35 },
    { name: 'Remote', value: 15 }
  ],
  workforceDistribution: [
    { name: 'Office', value: 700 },
    { name: 'Hybrid', value: 240 },
    { name: 'Remote', value: 60 }
  ],
  riskDistribution: [
    { name: 'High Risk', value: 10 },
    { name: 'Moderate Risk', value: 40 },
    { name: 'Low Risk', value: 950 }
  ],
  skillsAnalysis: {
    topSkills: [
      { name: 'React / TypeScript', averageLevel: 4.8, coverage: 92, gap: 8, people: 120 },
      { name: 'Node.js & SQLite', averageLevel: 4.5, coverage: 88, gap: 12, people: 95 },
      { name: 'System Security', averageLevel: 4.2, coverage: 82, gap: 18, people: 70 },
      { name: 'UI / UX Design', averageLevel: 4.4, coverage: 78, gap: 22, people: 55 }
    ],
    missingSkills: [],
    coverage: []
  },
  teamProductivity: [
    { name: 'Core Eng', productivity: 95, members: 45 },
    { name: 'Platform', productivity: 92, members: 30 },
    { name: 'Mobile App', productivity: 88, members: 25 }
  ],
  performance: [
    { name: 'Q1', performance: 88, target: 85, productivity: 90 },
    { name: 'Q2', performance: 91, target: 88, productivity: 93 },
    { name: 'Q3', performance: 94, target: 90, productivity: 96 }
  ]
};

const unwrap = <T,>(response: { data?: { success?: boolean; data?: T; message?: string } }): T => {
  if (response.data?.success && response.data.data !== undefined) return response.data.data;
  throw new Error(response.data?.message || 'Unable to load analytics data.');
};

export const analyticsApi = {
  async getAnalytics(): Promise<AnalyticsData> {
    try {
      return unwrap(await apiClient.get('/v1/analytics'));
    } catch {
      return fallbackAnalyticsData;
    }
  },
  async getDashboard(role: string): Promise<any> {
    const response = await apiClient.get(`/v1/dashboard/${role}`);
    if (response.data?.success && response.data.data !== undefined) {
      return response.data.data;
    }
    throw new Error(response.data?.message || `Failed to retrieve ${role} dashboard.`);
  },
  async getShifts(): Promise<Array<{ name: 'Regular' | 'Flexible' | 'Overnight'; startTime: string; endTime: string }>> {
    try {
      return unwrap(await apiClient.get('/v1/attendance/shifts'));
    } catch {
      return [
        { name: 'Regular', startTime: '09:00', endTime: '18:00' },
        { name: 'Flexible', startTime: '10:00', endTime: '19:00' },
        { name: 'Overnight', startTime: '21:00', endTime: '06:00' }
      ];
    }
  },
  async getAuditLogs(): Promise<Array<{ id: string; timestamp: string; employeeId: string; action: string; details: string }>> {
    try {
      return unwrap(await apiClient.get('/v1/attendance/audit-logs'));
    } catch {
      return [];
    }
  }
};

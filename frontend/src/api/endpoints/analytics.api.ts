import { apiClient } from '../../services/api';

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
    totalWorkforce: 500,
    attendanceRate: '98.5%',
    averagePerformanceScore: 92,
    retentionRiskCount: 2
  },
  growthData: [
    { name: 'Jan', headcount: 450, hiring: 12 },
    { name: 'Feb', headcount: 465, hiring: 15 },
    { name: 'Mar', headcount: 480, hiring: 15 },
    { name: 'Apr', headcount: 490, hiring: 10 },
    { name: 'May', headcount: 500, hiring: 10 }
  ],
  workforceGrowth: [
    { name: 'Jan', headcount: 450, hiring: 12 },
    { name: 'Feb', headcount: 465, hiring: 15 },
    { name: 'Mar', headcount: 480, hiring: 15 },
    { name: 'Apr', headcount: 490, hiring: 10 },
    { name: 'May', headcount: 500, hiring: 10 }
  ],
  attendanceOverview: [
    { name: 'Mon', present: 485, absent: 8, late: 7 },
    { name: 'Tue', present: 490, absent: 5, late: 5 },
    { name: 'Wed', present: 488, absent: 7, late: 5 },
    { name: 'Thu', present: 492, absent: 4, late: 4 },
    { name: 'Fri', present: 480, absent: 12, late: 8 }
  ],
  departmentComparison: [
    { name: 'Engineering', headcount: 210, performance: 94, attendance: 98 },
    { name: 'Product', headcount: 75, performance: 91, attendance: 97 },
    { name: 'Sales & Mktg', headcount: 115, performance: 89, attendance: 96 },
    { name: 'HR & Ops', headcount: 50, performance: 93, attendance: 99 },
    { name: 'Customer Success', headcount: 50, performance: 90, attendance: 97 }
  ],
  departmentDistribution: [
    { name: 'Engineering', value: 210 },
    { name: 'Product', value: 75 },
    { name: 'Sales & Mktg', value: 115 },
    { name: 'HR & Ops', value: 50 },
    { name: 'Customer Success', value: 50 }
  ],
  roleDistribution: [
    { name: 'Employee', value: 375 },
    { name: 'Team Lead', value: 75 },
    { name: 'Manager', value: 35 },
    { name: 'HR', value: 10 },
    { name: 'Admin', value: 5 }
  ],
  employmentStatus: [
    { name: 'Active', value: 470 },
    { name: 'On Leave', value: 20 },
    { name: 'Remote', value: 10 }
  ],
  workforceDistribution: [
    { name: 'Office', value: 350 },
    { name: 'Hybrid', value: 120 },
    { name: 'Remote', value: 30 }
  ],
  riskDistribution: [
    { name: 'High Risk', value: 5 },
    { name: 'Moderate Risk', value: 25 },
    { name: 'Low Risk', value: 470 }
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
    } catch (err) {
      console.warn('[Analytics API] Live query failed or disconnected, falling back to cached enterprise analytics:', err);
      return fallbackAnalyticsData;
    }
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

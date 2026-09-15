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
  
  // New Fields for Required Charts
  joinersExits: Array<{ name: string; joiners: number; exits: number }>;
  leaveTrend: Array<{ name: string; sick: number; vacation: number; other: number }>;
  taskStatusDistribution: Array<{ name: string; value: number }>;
  workloadTrend: Array<{ name: string; workload: number }>;
  workloadByMember: Array<{ name: string; tasks: number }>;
  sprintProgress: Array<{ name: string; completed: number; remaining: number }>;
  leaveUsage: Array<{ name: string; value: number }>;
  blockedWork: Array<{ name: string; blocked: number; open: number }>;
  workingHoursTrend: Array<{ name: string; hours: number }>;
  taskCompletionTrend: Array<{ name: string; completed: number; total: number }>;
  
  // Employee Personal Charts
  personalAttendanceTrend?: Array<{ name: string; present: number; absent: number; late: number }>;
  hoursTracked?: Array<{ name: string; hours: number }>;
  personalTaskCompletion?: Array<{ name: string; completed: number }>;
  personalLeaveHistory?: Array<{ name: string; days: number }>;
  personalOvertime?: Array<{ name: string; hours: number }>;
  personalSprintBurndown?: Array<{ name: string; points: number }>;
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
    retentionRiskCount: 2,
    activeEmployees: 490,
    presentToday: 485,
    onLeave: 15,
    departments: 8,
    openVacancies: 12,
    annualAttrition: '4.2%',
    newJoiners: 8,
    exits: 2,
    pendingHrActions: 5,
    teamMembers: 14,
    activeTasks: 42,
    completedTasks: 124,
    pendingApprovals: 6,
    averageWorkload: '82%',
    blockedTasks: 3,
    pendingReviews: 8,
    workingHours: '42.5h',
    breakDuration: '3.5h',
    leaveBalance: 14,
    assignedTasks: 8,
    overdueTasks: 1,
    productivityScore: 94
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
      { name: 'Node.js & SQLite', averageLevel: 4.5, coverage: 88, gap: 12, people: 95 }
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
  ],
  
  // New Mocks
  joinersExits: [
    { name: 'Q1', joiners: 45, exits: 12 },
    { name: 'Q2', joiners: 32, exits: 8 },
    { name: 'Q3', joiners: 28, exits: 15 },
    { name: 'Q4', joiners: 50, exits: 10 }
  ],
  leaveTrend: [
    { name: 'Mon', sick: 4, vacation: 12, other: 2 },
    { name: 'Tue', sick: 5, vacation: 10, other: 1 },
    { name: 'Wed', sick: 3, vacation: 11, other: 3 },
    { name: 'Thu', sick: 2, vacation: 14, other: 0 },
    { name: 'Fri', sick: 6, vacation: 18, other: 1 }
  ],
  taskStatusDistribution: [
    { name: 'Completed', value: 124 },
    { name: 'In Progress', value: 42 },
    { name: 'Blocked', value: 3 },
    { name: 'To Do', value: 31 }
  ],
  workloadTrend: [
    { name: 'Week 1', workload: 85 },
    { name: 'Week 2', workload: 92 },
    { name: 'Week 3', workload: 88 },
    { name: 'Week 4', workload: 95 }
  ],
  workloadByMember: [
    { name: 'Sarah J.', tasks: 12 },
    { name: 'Mike T.', tasks: 9 },
    { name: 'Alex K.', tasks: 14 },
    { name: 'Emma W.', tasks: 8 }
  ],
  sprintProgress: [
    { name: 'Mon', completed: 10, remaining: 90 },
    { name: 'Tue', completed: 25, remaining: 75 },
    { name: 'Wed', completed: 45, remaining: 55 },
    { name: 'Thu', completed: 70, remaining: 30 },
    { name: 'Fri', completed: 95, remaining: 5 }
  ],
  leaveUsage: [
    { name: 'Vacation', value: 12 },
    { name: 'Sick Leave', value: 4 },
    { name: 'Personal', value: 2 }
  ],
  blockedWork: [
    { name: 'Frontend', blocked: 2, open: 15 },
    { name: 'Backend', blocked: 1, open: 12 },
    { name: 'Design', blocked: 0, open: 5 }
  ],
  workingHoursTrend: [
    { name: 'Mon', hours: 8.5 },
    { name: 'Tue', hours: 8.2 },
    { name: 'Wed', hours: 9.0 },
    { name: 'Thu', hours: 8.0 },
    { name: 'Fri', hours: 8.8 }
  ],
  taskCompletionTrend: [
    { name: 'Week 1', completed: 15, total: 20 },
    { name: 'Week 2', completed: 18, total: 25 },
    { name: 'Week 3', completed: 22, total: 30 },
    { name: 'Week 4', completed: 35, total: 40 }
  ],
  
  // Employee Mocks
  personalAttendanceTrend: [
    { name: 'Mon', present: 1, absent: 0, late: 0 },
    { name: 'Tue', present: 1, absent: 0, late: 0 },
    { name: 'Wed', present: 1, absent: 0, late: 0 },
    { name: 'Thu', present: 1, absent: 0, late: 0 },
    { name: 'Fri', present: 0, absent: 1, late: 0 }
  ],
  hoursTracked: [
    { name: 'Mon', hours: 8.5 },
    { name: 'Tue', hours: 8.2 },
    { name: 'Wed', hours: 9.0 },
    { name: 'Thu', hours: 8.0 },
    { name: 'Fri', hours: 0 }
  ],
  personalTaskCompletion: [
    { name: 'W1', completed: 3 },
    { name: 'W2', completed: 5 },
    { name: 'W3', completed: 4 },
    { name: 'W4', completed: 6 }
  ],
  personalLeaveHistory: [
    { name: 'Jan', days: 1 },
    { name: 'Feb', days: 0 },
    { name: 'Mar', days: 2 },
    { name: 'Apr', days: 0 },
    { name: 'May', days: 3 }
  ],
  personalOvertime: [
    { name: 'Mon', hours: 0.5 },
    { name: 'Tue', hours: 0.2 },
    { name: 'Wed', hours: 1.0 },
    { name: 'Thu', hours: 0 },
    { name: 'Fri', hours: 0 }
  ],
  personalSprintBurndown: [
    { name: 'Sprint 21', points: 12 },
    { name: 'Sprint 22', points: 15 },
    { name: 'Sprint 23', points: 10 },
    { name: 'Sprint 24', points: 18 }
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
      if (import.meta.env.DEV) {
        console.warn('[Analytics API] Live query failed or disconnected, falling back to cached enterprise analytics:', err);
        return fallbackAnalyticsData;
      }
      throw err;
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

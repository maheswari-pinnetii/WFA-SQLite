import { apiClient } from './client';
import { AnalyticsData } from './endpoints/analytics.api';

export const analyticsApi = {
  getAnalytics: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/v1/analytics');
      if (response.data?.success) return response.data.data;
      throw new Error('Not found');
    } catch (err) {
      // Return mock data for now since backend doesn't implement this yet
      return {
        metrics: { totalWorkforce: 120, attendanceRate: '95%', averagePerformanceScore: 8.5, retentionRiskCount: 3 },
        skillsAnalysis: {
          coverage: [{ name: 'React', coverage: 85 }, { name: 'Node.js', coverage: 70 }, { name: 'Python', coverage: 60 }],
          topSkills: [{ name: 'React', coverage: 85 }],
          missingSkills: [{ name: 'Go', gap: 10 }]
        }
      };
    }
  },

  getDashboardSummary: async (): Promise<any> => {
    return {
      totalHeadcount: 120,
      activePresent: 115,
      lateArrivals: 3,
      riskFlags: 2,
      attendanceRate: 96
    };
  },

  getWorkforceDistribution: async (): Promise<Array<{ name: string; value: number }>> => {
    return [
      { name: 'Office', value: 80 },
      { name: 'Remote', value: 30 },
      { name: 'Client Site', value: 10 }
    ];
  },

  getHeadcountAnalytics: async (): Promise<Array<{ name: string; value: number }>> => {
    return [
      { name: 'Engineering', value: 50 },
      { name: 'Sales', value: 30 },
      { name: 'HR', value: 10 },
      { name: 'Product', value: 30 }
    ];
  },

  getRiskAnalytics: async (): Promise<Array<{ name: string; value: number }>> => {
    return [
      { name: 'High Risk', value: 2 },
      { name: 'Medium Risk', value: 5 },
      { name: 'Low Risk', value: 113 }
    ];
  },

  getEmployeeGrowth: async (): Promise<Array<{ name: string; headcount: number; hiring: number }>> => {
    return [
      { name: 'Jan', headcount: 100, hiring: 5 },
      { name: 'Feb', headcount: 105, hiring: 6 },
      { name: 'Mar', headcount: 111, hiring: 8 },
      { name: 'Apr', headcount: 120, hiring: 9 }
    ];
  },

  getAttendanceTrend: async (): Promise<Array<{ name: string; present: number; absent: number }>> => {
    return [
      { name: 'Mon', present: 118, absent: 2 },
      { name: 'Tue', present: 119, absent: 1 },
      { name: 'Wed', present: 115, absent: 5 },
      { name: 'Thu', present: 117, absent: 3 },
      { name: 'Fri', present: 110, absent: 10 }
    ];
  },

  getPerformanceAnalytics: async (): Promise<Array<{ name: string; performance: number; target: number; productivity: number }>> => {
    return [
      { name: 'Q1', performance: 85, target: 80, productivity: 88 },
      { name: 'Q2', performance: 89, target: 85, productivity: 91 },
      { name: 'Q3', performance: 92, target: 90, productivity: 93 }
    ];
  },

  getDepartments: async (): Promise<Array<{ name: string }>> => {
    return [{ name: 'Engineering' }, { name: 'Sales' }, { name: 'HR' }, { name: 'Product' }];
  },

  getLocations: async (): Promise<Array<{ name: string }>> => {
    return [{ name: 'New York' }, { name: 'London' }, { name: 'Remote' }];
  }
};

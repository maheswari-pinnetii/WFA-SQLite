import { apiClient } from './client';
import { AnalyticsData } from './endpoints/analytics.api';

export const analyticsApi = {
  getAnalytics: async (filters?: Record<string, any>): Promise<any> => {
    const response = await apiClient.get('/v1/analytics', { params: filters });
    return response.data?.data;
  },

  getDashboardSummary: async (): Promise<any> => {
    const response = await apiClient.get('/v1/dashboard/summary');
    return response.data?.data;
  },

  getWorkforceDistribution: async (): Promise<Array<{ name: string; value: number }>> => {
    const response = await apiClient.get('/v1/dashboard/workforce');
    return response.data?.data;
  },

  getHeadcountAnalytics: async (): Promise<Array<{ name: string; value: number }>> => {
    const response = await apiClient.get('/v1/dashboard/headcount');
    return response.data?.data;
  },

  getRiskAnalytics: async (): Promise<Array<{ name: string; value: number }>> => {
    const response = await apiClient.get('/v1/dashboard/risk');
    return response.data?.data;
  },

  getEmployeeGrowth: async (): Promise<Array<{ name: string; headcount: number; hiring: number }>> => {
    const response = await apiClient.get('/v1/analytics/employee-growth');
    return response.data?.data;
  },

  getAttendanceTrend: async (): Promise<Array<{ name: string; present: number; absent: number }>> => {
    const response = await apiClient.get('/v1/analytics/attendance-trend');
    return response.data?.data;
  },

  getPerformanceAnalytics: async (): Promise<Array<{ name: string; performance: number; target: number; productivity: number }>> => {
    const response = await apiClient.get('/v1/analytics/performance');
    return response.data?.data;
  },

  getSkillDistribution: async (filters?: Record<string, any>): Promise<any> => {
    const response = await apiClient.get('/v1/analytics/skills/distribution', { params: filters });
    return response.data?.data;
  },

  getSkillGaps: async (filters?: Record<string, any>): Promise<any> => {
    const response = await apiClient.get('/v1/analytics/skills/gaps', { params: filters });
    return response.data?.data;
  },

  getSkillCoverage: async (filters?: Record<string, any>): Promise<any> => {
    const response = await apiClient.get('/v1/analytics/skills/coverage', { params: filters });
    return response.data?.data;
  },

  getCertificationStatus: async (filters?: Record<string, any>): Promise<any> => {
    const response = await apiClient.get('/v1/analytics/certifications', { params: filters });
    return response.data?.data;
  },

  getTrainingRecommendations: async (filters?: Record<string, any>): Promise<any> => {
    const response = await apiClient.get('/v1/analytics/training-recommendations', { params: filters });
    return response.data?.data;
  },

  getRecruitmentAnalytics: async (filters?: Record<string, any>): Promise<any> => {
    const response = await apiClient.get('/v1/analytics/recruitment', { params: filters });
    return response.data?.data;
  },

  triggerPipelineSync: async (): Promise<any> => {
    const response = await apiClient.post('/v1/analytics/pipeline/sync');
    return response.data;
  },

  getLearningAnalytics: async (filters?: Record<string, any>): Promise<any> => {
    const response = await apiClient.get('/v1/analytics/learning', { params: filters });
    return response.data?.data;
  },

  getPlacementAnalytics: async (filters?: Record<string, any>): Promise<any> => {
    const response = await apiClient.get('/v1/analytics/placement', { params: filters });
    return response.data?.data;
  },

  getDepartments: async (): Promise<Array<{ name: string }>> => {
    const response = await apiClient.get('/v1/departments');
    return response.data?.data || [];
  },

  getLocations: async (): Promise<Array<{ name: string }>> => {
    const response = await apiClient.get('/v1/locations');
    return response.data?.data || [];
  }
};

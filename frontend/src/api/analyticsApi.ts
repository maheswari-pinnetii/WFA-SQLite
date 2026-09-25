import { apiClient } from './client';
import { AnalyticsData } from './endpoints/analytics.api';

export const analyticsApi = {
  getAnalytics: async (): Promise<any> => {
    const response = await apiClient.get('/v1/analytics');
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

  getDepartments: async (): Promise<Array<{ name: string }>> => {
    const response = await apiClient.get('/v1/departments');
    return response.data?.data || [];
  },

  getLocations: async (): Promise<Array<{ name: string }>> => {
    const response = await apiClient.get('/v1/locations');
    return response.data?.data || [];
  }
};

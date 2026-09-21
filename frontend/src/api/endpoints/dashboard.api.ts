import { apiClient } from '../client';

export const dashboardApi = {
  getAdminDashboard: async () => {
    return apiClient.get('/dashboard/admin');
  },
  getHrDashboard: async () => {
    return apiClient.get('/dashboard/hr');
  },
  getManagerDashboard: async () => {
    return apiClient.get('/dashboard/manager');
  },
  getTeamLeadDashboard: async () => {
    return apiClient.get('/dashboard/team-lead');
  },
  getEmployeeDashboard: async () => {
    return apiClient.get('/dashboard/employee');
  }
};

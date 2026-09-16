import { apiClient } from './client';

export const leaveApi = {
  getRequests: async (filters?: { status?: string; employeeId?: string }) => {
    const params = new URLSearchParams();
    if (filters?.status && filters.status !== 'ALL') params.append('status', filters.status);
    if (filters?.employeeId) params.append('employeeId', filters.employeeId);
    
    const response = await apiClient.get(`/workforce/leave-requests?${params.toString()}`);
    return response.data;
  },

  createRequest: async (data: any) => {
    const response = await apiClient.post('/workforce/leave-requests', data);
    return response.data;
  },

  reviewRequest: async (id: string, status: 'APPROVED' | 'REJECTED', reviewComment?: string) => {
    const response = await apiClient.post(`/workforce/leave-requests/${id}/review`, { status, reviewComment });
    return response.data;
  },

  getBalances: async (employeeId: string) => {
    const response = await apiClient.get(`/leave/balances/${employeeId}`);
    return response.data;
  },

  getTypes: async () => {
    const response = await apiClient.get('/leave/types');
    return response.data;
  },

  getHolidays: async () => {
    const response = await apiClient.get('/leave/holidays');
    return response.data;
  }
};

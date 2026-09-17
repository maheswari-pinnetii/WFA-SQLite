import { apiClient } from '../client';

export const lifecycleApi = {
  transitionStatus: async (employeeId: string, status: string, reason?: string, effectiveDate?: string) => {
    const response = await apiClient.post(`/employees/${employeeId}/transition`, {
      status,
      reason,
      effectiveDate
    });
    return response.data;
  },

  getDocuments: async (employeeId: string) => {
    const response = await apiClient.get(`/employees/${employeeId}/documents`);
    return response.data;
  },

  addDocument: async (employeeId: string, data: any) => {
    const response = await apiClient.post(`/employees/${employeeId}/documents`, data);
    return response.data;
  },

  getStatusHistory: async (employeeId: string) => {
    const response = await apiClient.get(`/employees/${employeeId}/status-history`);
    return response.data;
  },

  getFieldHistory: async (employeeId: string) => {
    const response = await apiClient.get(`/employees/${employeeId}/field-history`);
    return response.data;
  }
};

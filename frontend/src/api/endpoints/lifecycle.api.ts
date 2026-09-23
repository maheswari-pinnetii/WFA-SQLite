import { apiClient } from '../client';

export interface StatusHistory {
  id: string;
  employeeId: string;
  status: string;
  effectiveDate: string;
  reason?: string;
  organizationId: string;
}

export interface LifecycleDocument {
  id: string;
  employeeId: string;
  documentType: string;
  title?: string;
  documentUrl: string;
  uploadedAt: string;
  uploadedBy: string;
  metadata?: string;
}

export const lifecycleApi = {
  getStatusHistory: async (employeeId: string): Promise<StatusHistory[]> => {
    const response = await apiClient.get(`/employees/${employeeId}/status-history`);
    return response.data?.data || [];
  },

  transitionStatus: async (employeeId: string, payload: { status: string; reason?: string; effectiveDate?: string }) => {
    const response = await apiClient.post(`/employees/${employeeId}/transition`, payload);
    return response.data?.data;
  },

  getDocuments: async (employeeId: string): Promise<LifecycleDocument[]> => {
    const response = await apiClient.get(`/employees/${employeeId}/documents`);
    return response.data?.data || [];
  },

  uploadDocument: async (employeeId: string, payload: { documentType: string; documentUrl: string; metadata?: string }) => {
    const response = await apiClient.post(`/employees/${employeeId}/documents`, payload);
    return response.data?.data;
  }
};

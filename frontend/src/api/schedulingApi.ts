import { apiClient } from './client';

export const schedulingApi = {
  getShifts: async () => {
    const response = await apiClient.get('/shifts');
    return response.data;
  },

  createShift: async (data: any) => {
    const response = await apiClient.post('/shifts', data);
    return response.data;
  },

  assignShift: async (employeeId: string, data: { shiftId: string; effectiveFrom: string }) => {
    const response = await apiClient.post(`/employees/${employeeId}/shift`, data);
    return response.data;
  },

  getWorkSchedules: async (employeeId: string) => {
    const response = await apiClient.get(`/scheduling/schedule/${employeeId}`);
    return response.data;
  }
};

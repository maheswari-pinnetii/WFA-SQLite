import { apiClient as api } from '../client';

export const performanceApi = {
  getCycles: async () => {
    const response = await api.get('/performance/cycles');
    return response.data;
  },
  createCycle: async (data: { name: string; startDate: string; endDate: string }) => {
    const response = await api.post('/performance/cycles', data);
    return response.data;
  },
  getGoals: async (cycleId: string, employeeId: string = 'me') => {
    const response = await api.get(`/performance/cycles/${cycleId}/employees/${employeeId}/goals`);
    return response.data;
  },
  createGoal: async (cycleId: string, employeeId: string = 'me', data: { title: string; description?: string }) => {
    const response = await api.post(`/performance/cycles/${cycleId}/employees/${employeeId}/goals`, data);
    return response.data;
  },
  updateGoalProgress: async (goalId: string, progress: number) => {
    const response = await api.patch(`/performance/goals/${goalId}/progress`, { progress });
    return response.data;
  },
  getReviews: async (cycleId: string, employeeId: string = 'me') => {
    const response = await api.get(`/performance/cycles/${cycleId}/employees/${employeeId}/reviews`);
    return response.data;
  }
};

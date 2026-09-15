import apiClient from '../apiClient';

export const assetsApi = {
  getAssets: async (filters?: any) => {
    const response = await apiClient.get('/assets', { params: filters });
    return response.data;
  },
  
  createAsset: async (data: any) => {
    const response = await apiClient.post('/assets', data);
    return response.data;
  },
  
  assignAsset: async (id: string, employeeId: string) => {
    const response = await apiClient.post(`/assets/${id}/assign`, { employeeId });
    return response.data;
  },
  
  returnAsset: async (id: string, condition: string) => {
    const response = await apiClient.post(`/assets/${id}/return`, { condition });
    return response.data;
  },
  
  getAssetHistory: async (id: string) => {
    const response = await apiClient.get(`/assets/${id}/history`);
    return response.data;
  }
};

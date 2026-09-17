import { apiClient as api } from '../client';

export const recruitmentApi = {
  getRequisitions: async (filters?: { status?: string; department?: string }) => {
    const response = await api.get('/recruitment/requisitions', { params: filters });
    return response.data;
  },
  createRequisition: async (data: { title: string; department?: string; openings?: number }) => {
    const response = await api.post('/recruitment/requisitions', data);
    return response.data;
  },
  updateRequisitionStatus: async (reqId: string, status: string) => {
    const response = await api.patch(`/recruitment/requisitions/${reqId}/status`, { status });
    return response.data;
  },
  getApplications: async (reqId: string, filters?: { status?: string }) => {
    const response = await api.get(`/recruitment/requisitions/${reqId}/applications`, { params: filters });
    return response.data;
  },
  createApplication: async (reqId: string, data: { candidateName: string; candidateEmail: string }) => {
    const response = await api.post(`/recruitment/requisitions/${reqId}/applications`, data);
    return response.data;
  },
  scheduleInterview: async (appId: string, data: { interviewerId: string; scheduledAt: string }) => {
    const response = await api.post(`/recruitment/applications/${appId}/interviews`, data);
    return response.data;
  },
  submitInterviewFeedback: async (interviewId: string, data: { rating: number; feedback: string }) => {
    const response = await api.patch(`/recruitment/interviews/${interviewId}/feedback`, data);
    return response.data;
  },
  createOffer: async (appId: string, data: { salaryOffered: number }) => {
    const response = await api.post(`/recruitment/applications/${appId}/offer`, data);
    return response.data;
  },
  respondToOffer: async (offerId: string, data: { status: 'ACCEPTED' | 'REJECTED' }) => {
    const response = await api.patch(`/recruitment/offers/${offerId}/respond`, data);
    return response.data;
  },
  getFunnel: async () => {
    const response = await api.get('/recruitment/funnel');
    return response.data;
  }
};

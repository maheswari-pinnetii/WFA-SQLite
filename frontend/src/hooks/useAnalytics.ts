import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../api/analyticsApi';

export const useAnalytics = () => {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: () => analyticsApi.getAnalytics(),
  });
};

export const useDashboardSummary = () => {
  return useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: () => analyticsApi.getDashboardSummary(),
  });
};

export const useWorkforceDistribution = () => {
  return useQuery({
    queryKey: ['workforceDistribution'],
    queryFn: () => analyticsApi.getWorkforceDistribution(),
  });
};

export const useHeadcountAnalytics = () => {
  return useQuery({
    queryKey: ['headcountAnalytics'],
    queryFn: () => analyticsApi.getHeadcountAnalytics(),
  });
};

export const useRiskAnalytics = () => {
  return useQuery({
    queryKey: ['riskAnalytics'],
    queryFn: () => analyticsApi.getRiskAnalytics(),
  });
};

export const useEmployeeGrowth = () => {
  return useQuery({
    queryKey: ['employeeGrowth'],
    queryFn: () => analyticsApi.getEmployeeGrowth(),
  });
};

export const useAttendanceTrend = () => {
  return useQuery({
    queryKey: ['attendanceTrend'],
    queryFn: () => analyticsApi.getAttendanceTrend(),
  });
};

export const usePerformanceAnalytics = () => {
  return useQuery({
    queryKey: ['performanceAnalytics'],
    queryFn: () => analyticsApi.getPerformanceAnalytics(),
  });
};

export const useSkillDistribution = (filters?: any) => {
  return useQuery({
    queryKey: ['skillDistribution', filters],
    queryFn: () => analyticsApi.getSkillDistribution(filters),
  });
};

export const useSkillGaps = (filters?: any) => {
  return useQuery({
    queryKey: ['skillGaps', filters],
    queryFn: () => analyticsApi.getSkillGaps(filters),
  });
};

export const useSkillCoverage = (filters?: any) => {
  return useQuery({
    queryKey: ['skillCoverage', filters],
    queryFn: () => analyticsApi.getSkillCoverage(filters),
  });
};

export const useCertificationStatus = (filters?: any) => {
  return useQuery({
    queryKey: ['certificationStatus', filters],
    queryFn: () => analyticsApi.getCertificationStatus(filters),
  });
};

export const useTrainingRecommendations = (filters?: any) => {
  return useQuery({
    queryKey: ['trainingRecommendations', filters],
    queryFn: () => analyticsApi.getTrainingRecommendations(filters),
  });
};

export const useRecruitmentAnalytics = (filters?: any) => {
  return useQuery({
    queryKey: ['recruitmentAnalytics', filters],
    queryFn: () => analyticsApi.getRecruitmentAnalytics(filters),
  });
};

export const useLearningAnalytics = (filters?: any) => {
  return useQuery({
    queryKey: ['learningAnalytics', filters],
    queryFn: () => analyticsApi.getLearningAnalytics(filters),
  });
};

export const usePlacementAnalytics = (filters?: any) => {
  return useQuery({
    queryKey: ['placementAnalytics', filters],
    queryFn: () => analyticsApi.getPlacementAnalytics(filters),
  });
};

export const useDepartments = () => {
  return useQuery({
    queryKey: ['departments'],
    queryFn: () => analyticsApi.getDepartments(),
  });
};

export const useLocations = () => {
  return useQuery({
    queryKey: ['locations'],
    queryFn: () => analyticsApi.getLocations(),
  });
};

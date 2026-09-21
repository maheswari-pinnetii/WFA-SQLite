import { useCallback, useEffect, useState } from 'react';
import { dashboardApi } from '../api/endpoints/dashboard.api';
import { Role } from '../security/roles/roles';

export const useDashboardData = (role: Role) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let response;
      switch (role) {
        case Role.ADMIN:
          response = await dashboardApi.getAdminDashboard();
          break;
        case Role.HR:
          response = await dashboardApi.getHrDashboard();
          break;
        case Role.MANAGER:
          response = await dashboardApi.getManagerDashboard();
          break;
        case Role.TEAM_LEAD:
          response = await dashboardApi.getTeamLeadDashboard();
          break;
        case Role.EMPLOYEE:
          response = await dashboardApi.getEmployeeDashboard();
          break;
        default:
          throw new Error('Invalid role');
      }
      setData(response?.data || response);
    } catch (err: any) {
      setError(err.message || 'Unable to load dashboard data.');
    } finally {
      setIsLoading(false);
    }
  }, [role]);

  useEffect(() => { void reload(); }, [reload]);
  return { data, isLoading, error, reload };
};

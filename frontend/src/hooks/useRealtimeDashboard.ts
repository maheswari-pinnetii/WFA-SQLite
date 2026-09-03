import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { socket, SOCKET_EVENTS } from '../websocket/socket';

export const useRealtimeDashboard = (onKpiUpdated?: (data: any) => void) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleKpiUpdate = (data: any) => {
      void queryClient.invalidateQueries({ queryKey: ['analyticsData'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      void queryClient.invalidateQueries({ queryKey: ['attendanceToday'] });

      if (onKpiUpdated) {
        onKpiUpdated(data);
      }
    };

    socket.on(SOCKET_EVENTS.DASHBOARD_KPI_UPDATED, handleKpiUpdate);
    return () => {
      socket.off(SOCKET_EVENTS.DASHBOARD_KPI_UPDATED, handleKpiUpdate);
    };
  }, [queryClient, onKpiUpdated]);
};

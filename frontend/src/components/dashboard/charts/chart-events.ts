import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { socket } from '../../../websocket/socket';

export const useDashboardChartSocketEvents = (queryKey: string[]) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;

    const handleDataUpdate = () => {
      queryClient.invalidateQueries({ queryKey });
    };

    socket.on('attendance_marked', handleDataUpdate);
    socket.on('leave_status_changed', handleDataUpdate);
    socket.on('payroll_status_changed', handleDataUpdate);
    socket.on('employee_updated', handleDataUpdate);

    return () => {
      socket.off('attendance_marked', handleDataUpdate);
      socket.off('leave_status_changed', handleDataUpdate);
      socket.off('payroll_status_changed', handleDataUpdate);
      socket.off('employee_updated', handleDataUpdate);
    };
  }, [queryClient, queryKey]);
};

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { socket, SOCKET_EVENTS } from '../websocket/socket';

export const useRealtimeLeave = (onLeaveEvent?: (event: string, data: any) => void) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleLeaveUpdate = (event: string) => (data: any) => {
      void queryClient.invalidateQueries({ queryKey: ['leaveRequests'] });
      void queryClient.invalidateQueries({ queryKey: ['pendingLeaves'] });

      if (onLeaveEvent) {
        onLeaveEvent(event, data);
      }
    };

    const handleSubmitted = handleLeaveUpdate('SUBMITTED');
    const handleApproved = handleLeaveUpdate('APPROVED');
    const handleRejected = handleLeaveUpdate('REJECTED');

    socket.on(SOCKET_EVENTS.LEAVE_SUBMITTED, handleSubmitted);
    socket.on(SOCKET_EVENTS.LEAVE_APPROVED, handleApproved);
    socket.on(SOCKET_EVENTS.LEAVE_REJECTED, handleRejected);

    return () => {
      socket.off(SOCKET_EVENTS.LEAVE_SUBMITTED, handleSubmitted);
      socket.off(SOCKET_EVENTS.LEAVE_APPROVED, handleApproved);
      socket.off(SOCKET_EVENTS.LEAVE_REJECTED, handleRejected);
    };
  }, [queryClient, onLeaveEvent]);
};

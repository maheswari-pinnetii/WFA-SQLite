import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { socket, SOCKET_EVENTS } from '../websocket/socket';
import { addNotification, fetchAttendanceDataThunk } from '../store/attendanceSlice';
import { useAuth } from '../auth/hooks/useAuth';

export const useRealtimeAttendance = (onEventReceived?: (event: string, data: any) => void) => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch<any>();
  const { user } = useAuth();

  useEffect(() => {
    const handleAttendanceChange = (event: string) => (data: any) => {
      // Invalidate relevant React Query caches
      void queryClient.invalidateQueries({ queryKey: ['attendanceToday'] });
      void queryClient.invalidateQueries({ queryKey: ['attendanceRecords'] });
      void queryClient.invalidateQueries({ queryKey: ['analyticsData'] });

      // If update affects the current logged-in employee, sync Redux state
      if (user && (data.employeeId === user.id || !data.employeeId)) {
        dispatch(fetchAttendanceDataThunk(user.id));
      }

      if (onEventReceived) {
        onEventReceived(event, data);
      }
    };

    const handleCheckIn = handleAttendanceChange('CHECK_IN');
    const handleCheckOut = handleAttendanceChange('CHECK_OUT');
    const handleBreakStart = handleAttendanceChange('BREAK_START');
    const handleBreakEnd = handleAttendanceChange('BREAK_END');
    const handleUpdated = handleAttendanceChange('UPDATED');

    socket.on(SOCKET_EVENTS.ATTENDANCE_CHECK_IN, handleCheckIn);
    socket.on(SOCKET_EVENTS.ATTENDANCE_CHECK_OUT, handleCheckOut);
    socket.on(SOCKET_EVENTS.ATTENDANCE_BREAK_START, handleBreakStart);
    socket.on(SOCKET_EVENTS.ATTENDANCE_BREAK_END, handleBreakEnd);
    socket.on(SOCKET_EVENTS.ATTENDANCE_UPDATED, handleUpdated);

    return () => {
      socket.off(SOCKET_EVENTS.ATTENDANCE_CHECK_IN, handleCheckIn);
      socket.off(SOCKET_EVENTS.ATTENDANCE_CHECK_OUT, handleCheckOut);
      socket.off(SOCKET_EVENTS.ATTENDANCE_BREAK_START, handleBreakStart);
      socket.off(SOCKET_EVENTS.ATTENDANCE_BREAK_END, handleBreakEnd);
      socket.off(SOCKET_EVENTS.ATTENDANCE_UPDATED, handleUpdated);
    };
  }, [queryClient, dispatch, user, onEventReceived]);
};

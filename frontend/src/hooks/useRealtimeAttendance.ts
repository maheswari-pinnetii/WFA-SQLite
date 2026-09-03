import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { socket, SOCKET_EVENTS } from '../websocket/socket';
import { addNotification, fetchAttendanceDataThunk } from '../store/attendanceSlice';
import { useAuth } from '../auth/hooks/useAuth';

export const useRealtimeAttendance = (onEventReceived?: (event: string, data: any) => void) => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch<any>();
  const { user } = useAuth();
  
  // Use a ref to store the latest callback so we don't re-bind sockets if the callback changes
  const onEventReceivedRef = useRef(onEventReceived);
  
  useEffect(() => {
    onEventReceivedRef.current = onEventReceived;
  }, [onEventReceived]);

  // Memoize the handler creator
  const handleAttendanceChange = useCallback(
    (event: string) => (data: any) => {
      // Invalidate relevant React Query caches
      void queryClient.invalidateQueries({ queryKey: ['attendanceToday'] });
      void queryClient.invalidateQueries({ queryKey: ['attendanceRecords'] });
      void queryClient.invalidateQueries({ queryKey: ['analyticsData'] });

      // If update affects the current logged-in employee, sync Redux state
      if (user && (data.employeeId === user.id || !data.employeeId)) {
        dispatch(fetchAttendanceDataThunk(user.id));
      }

      if (onEventReceivedRef.current) {
        onEventReceivedRef.current(event, data);
      }
    },
    [queryClient, dispatch, user]
  );

  useEffect(() => {

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
  }, [handleAttendanceChange]);
};

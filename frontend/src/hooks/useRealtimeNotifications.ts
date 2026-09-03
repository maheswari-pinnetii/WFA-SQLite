import { useEffect } from 'react';
import { socket, SOCKET_EVENTS } from '../websocket/socket';

export const useRealtimeNotifications = (onNotification: (notif: any) => void) => {
  useEffect(() => {
    const handleNotification = (notif: any) => {
      onNotification(notif);
    };

    socket.on(SOCKET_EVENTS.NOTIFICATION_NEW, handleNotification);
    return () => {
      socket.off(SOCKET_EVENTS.NOTIFICATION_NEW, handleNotification);
    };
  }, [onNotification]);
};

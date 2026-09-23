import { useEffect } from 'react';
import apiClient from '../../services/api';
import { useAuth } from '../../features/auth/useAuth';

export const usePushNotifications = () => {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const registerPush = async () => {
      try {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
          console.warn('Push messaging is not supported.');
          return;
        }

        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          console.warn('Push notification permission denied.');
          return;
        }

        const registration = await navigator.serviceWorker.ready;
        
        // Mock token for simulation, as we don't have Firebase config
        const mockToken = `mock-fcm-token-${Math.random().toString(36).substring(7)}`;

        await apiClient.post('/v1/notifications/push-token', {
          token: mockToken,
          deviceType: 'web'
        });

        console.log('Successfully registered push token');
      } catch (error) {
        console.error('Failed to register push token:', error);
      }
    };

    if (isAuthenticated) {
      registerPush();
    }
  }, [isAuthenticated]);
};

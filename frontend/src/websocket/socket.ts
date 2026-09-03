import { io, Socket } from 'socket.io-client';
import { SOCKET_EVENTS } from './events';

export * from './events';

const SOCKET_URL =
  typeof window !== 'undefined'
    ? window.location.origin
    : 'http://localhost:5001';

export const socket: Socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 10000
});

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected';

type StatusListener = (status: ConnectionStatus) => void;
const statusListeners: Set<StatusListener> = new Set();

let currentStatus: ConnectionStatus = 'disconnected';

const updateStatus = (status: ConnectionStatus) => {
  currentStatus = status;
  statusListeners.forEach((listener) => listener(status));
};

socket.on('connect', () => {
  updateStatus('connected');
});

socket.on('disconnect', () => {
  updateStatus('disconnected');
});

socket.on('connect_error', () => {
  updateStatus('disconnected');
});

socket.on('reconnect_attempt', () => {
  updateStatus('connecting');
});

export const subscribeConnectionStatus = (listener: StatusListener) => {
  statusListeners.add(listener);
  listener(currentStatus);
  return () => {
    statusListeners.delete(listener);
  };
};

export const getConnectionStatus = (): ConnectionStatus => currentStatus;

export const connectSocket = (token?: string, userId?: string, orgId: string = 'org-stackly') => {
  const authToken = token || localStorage.getItem('token') || sessionStorage.getItem('token');
  if (!authToken) return;

  socket.auth = { token: authToken };
  updateStatus('connecting');
  socket.connect();

  if (userId) {
    socket.emit('join-room', `user:${userId}`);
    socket.emit('join-room', `user-${userId}`); // Backward compatibility
  }
  socket.emit('join-room', `org:${orgId}`);
  socket.emit('join-room', `org-${orgId}`); // Backward compatibility
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
    updateStatus('disconnected');
  }
};

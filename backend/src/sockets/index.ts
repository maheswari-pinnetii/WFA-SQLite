import { Server as SocketServer, Socket } from 'socket.io';
import { handleAttendanceEvents } from './attendance.socket.js';
import { handleNotificationEvents } from './notification.socket.js';
import { handleEmployeeEvents } from './employee.socket.js';
import { handleDashboardEvents } from './dashboard.socket.js';
import { socketAuthMiddleware, setupSocketUserRooms } from './socketAuth.js';
import { isUserAuthorizedForRoom } from './rooms.js';
import { setIO } from './socketEmitter.js';
import logger from '../config/logger.js';

export * from './events.js';
export * from './rooms.js';
export * from './socketEmitter.js';

export const initSockets = (io: SocketServer) => {
  // Store singleton for backend services to emit events
  setIO(io);

  // Authentication middleware for sockets
  io.use(socketAuthMiddleware);

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user;
    
    // Automatically join the user to their authorized rooms
    setupSocketUserRooms(socket);
    
    // Connection rate limiting: limit messages/events per second to prevent DOS
    let messageCount = 0;
    const limitInterval = 1000; // 1s
    const maxMessagesPerInterval = 30;
    
    const rateLimitTimer = setInterval(() => {
      messageCount = 0;
    }, limitInterval);
    
    // Wrap socket.on to filter duplicate events & apply rate limiting
    const originalOn = socket.on;
    const lastEvents = new Map(); // Event name -> timestamp
    
    socket.on = function (event: string, fn: any) {
      return originalOn.call(socket, event, async function (...args: any[]) {
        // Connection Rate Limiting
        messageCount++;
        if (messageCount > maxMessagesPerInterval) {
          logger.warn('socket.rate_limit_exceeded', `Rate limit exceeded for socket: ${socket.id}`);
          socket.emit('error', { message: 'Too many requests. Rate limit exceeded.' });
          return;
        }
        
        // Duplicate event filtering (debounce within 50ms)
        const now = Date.now();
        const lastTime = lastEvents.get(event);
        if (lastTime && now - lastTime < 50) {
          return;
        }
        lastEvents.set(event, now);
        
        // Channel / Room Subscription Protection & Scoping
        if (event === 'join-room') {
          const room = args[0];
          if (!isUserAuthorizedForRoom(user, room)) {
            logger.warn('socket.unauthorized_room_join', `User ${user?.email} attempted unauthorized join to room: ${room}`);
            socket.emit('error', { message: `Access denied to room ${room}` });
            return;
          }
        }
        
        return fn.apply(this, args);
      });
    };

    socket.on('join-room', (room: string) => {
      if (isUserAuthorizedForRoom(user, room)) {
        socket.join(room);
        logger.info('socket.room_joined', `Socket ${socket.id} joined room ${room}`);
      }
    });

    socket.on('leave-room', (room: string) => {
      socket.leave(room);
      logger.info('socket.room_left', `Socket ${socket.id} left room ${room}`);
    });
    
    // Register domain socket events
    handleAttendanceEvents(socket, io);
    handleNotificationEvents(socket, io);
    handleEmployeeEvents(socket, io);
    handleDashboardEvents(socket, io);
    
    socket.on('disconnect', () => {
      clearInterval(rateLimitTimer);
      logger.info('socket.disconnected', `Socket disconnected: ${socket.id}`);
    });
  });
};



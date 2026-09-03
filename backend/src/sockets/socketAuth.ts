import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { getAuthorizedRoomsForUser, SocketUserContext } from './rooms.js';
import logger from '../config/logger.js';

const JWT_SECRET = env.JWT_SECRET || 'stackly_wfa_super_secret_jwt_key_2026';

/**
 * Socket.IO Authentication Middleware
 * Validates JWT token from auth header/handshake and attaches decoded user to socket.
 */
export const socketAuthMiddleware = (socket: Socket, next: (err?: Error) => void) => {
  const token =
    socket.handshake.auth?.token ||
    socket.handshake.headers?.authorization?.split(' ')[1] ||
    socket.handshake.query?.token;

  if (!token || typeof token !== 'string') {
    return next(new Error('Authentication error: Token missing'));
  }

  jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
    if (err || !decoded) {
      return next(new Error('Authentication error: Invalid or expired token'));
    }

    const user: SocketUserContext = {
      id: decoded.id || decoded.sub,
      email: decoded.email,
      role: decoded.role,
      department: decoded.department,
      team: decoded.team,
      organizationId: decoded.organizationId || decoded.companyId || 'org-stackly',
      companyId: decoded.companyId || decoded.organizationId || 'org-stackly'
    };

    (socket as any).user = user;
    next();
  });
};

/**
 * Automatically joins the socket to all rooms the user is authorized for.
 */
export const setupSocketUserRooms = (socket: Socket) => {
  const user = (socket as any).user as SocketUserContext;
  if (!user) return;

  const roomsToJoin = getAuthorizedRoomsForUser(user);
  roomsToJoin.forEach((room) => {
    socket.join(room);
  });

  logger.info('socket.connected', `Socket ${socket.id} authenticated for user ${user.email}`, {
    userId: user.id,
    role: user.role,
    roomsJoined: roomsToJoin
  });
};

import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { getAuthorizedRoomsForUser, SocketUserContext } from './rooms.js';
import logger from '../config/logger.js';
import { User } from '../models/User.js';

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

  jwt.verify(token, JWT_SECRET, async (err, decoded: any) => {
      if (err || !decoded) {
        return next(new Error('Authentication error: Invalid or expired token'));
      }

      const supabaseId = decoded.sub;
      const email = decoded.email;

      let appUser = await User.findOne({ supabase_auth_id: supabaseId });
      
      if (!appUser && email) {
        appUser = await User.findOne({ email });
        if (appUser) {
          appUser.supabase_auth_id = supabaseId;
          await appUser.save();
        }
      }

      if (!appUser) {
        return next(new Error('Authentication error: User profile not found'));
      }

      const user: SocketUserContext = {
        id: appUser.id,
        email: appUser.email,
        role: appUser.role,
        department: appUser.department,
        team: appUser.team,
        organizationId: appUser.organizationId || appUser.companyId || 'org-stackly',
        companyId: appUser.companyId || appUser.organizationId || 'org-stackly'
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

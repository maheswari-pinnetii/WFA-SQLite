import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { getAuthorizedRoomsForUser, SocketUserContext } from './rooms.js';
import logger from '../config/logger.js';
import { User } from '../models/User.js';
import { query } from '../database/sqlite-cloud.js';

const JWT_SECRET = env.JWT_SECRET;

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

      if (appUser.status && appUser.status !== 'ACTIVE') {
        return next(new Error('Authentication error: Account is inactive or suspended'));
      }

      // Check if user is locked out
      const lockCheck = await query('SELECT lockedUntil FROM failed_logins WHERE email = ?', [appUser.email]);
      if (lockCheck && lockCheck.length > 0 && lockCheck[0].lockedUntil) {
        if (new Date(lockCheck[0].lockedUntil) > new Date()) {
          return next(new Error('Authentication error: Account is temporarily locked'));
        }
      }

      // Check session revocation if token contains sessionId
      if (decoded.sessionId) {
        const sess = await query('SELECT revokedAt, expiresAt FROM sessions WHERE id = ?', [decoded.sessionId]);
        if (sess && sess.length > 0) {
          if (sess[0].revokedAt) {
            return next(new Error('Authentication error: Session has been revoked'));
          }
          if (new Date(sess[0].expiresAt) < new Date()) {
            return next(new Error('Authentication error: Session has expired'));
          }
        }
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

import { Server as SocketServer } from 'socket.io';
import { ROOMS } from './rooms.js';
import { SocketEventType } from './events.js';
import logger from '../config/logger.js';

let ioInstance: SocketServer | null = null;

export const setIO = (io: SocketServer) => {
  ioInstance = io;
};

export const getIO = (): SocketServer | null => {
  return ioInstance;
};

/**
 * Emit an event to a specific user by user ID.
 */
export const emitToUser = (userId: string, event: SocketEventType | string, data: any) => {
  if (!ioInstance || !userId) return;
  try {
    ioInstance.to(ROOMS.user(userId)).emit(event, data);
  } catch (err: any) {
    logger.error('socket.emit_error', `Failed to emit to user ${userId}: ${err.message}`);
  }
};

/**
 * Emit an event to an employee room.
 */
export const emitToEmployee = (employeeId: string, event: SocketEventType | string, data: any) => {
  if (!ioInstance || !employeeId) return;
  try {
    ioInstance.to(ROOMS.employee(employeeId)).emit(event, data);
  } catch (err: any) {
    logger.error('socket.emit_error', `Failed to emit to employee ${employeeId}: ${err.message}`);
  }
};

/**
 * Emit an event to a team room.
 */
export const emitToTeam = (teamId: string, event: SocketEventType | string, data: any) => {
  if (!ioInstance || !teamId) return;
  try {
    ioInstance.to(ROOMS.team(teamId)).emit(event, data);
  } catch (err: any) {
    logger.error('socket.emit_error', `Failed to emit to team ${teamId}: ${err.message}`);
  }
};

/**
 * Emit an event to a department room.
 */
export const emitToDept = (deptId: string, event: SocketEventType | string, data: any) => {
  if (!ioInstance || !deptId) return;
  try {
    ioInstance.to(ROOMS.department(deptId)).emit(event, data);
  } catch (err: any) {
    logger.error('socket.emit_error', `Failed to emit to dept ${deptId}: ${err.message}`);
  }
};

/**
 * Emit an event to an organization room.
 */
export const emitToOrg = (orgId: string = 'org-stackly', event: SocketEventType | string, data: any) => {
  if (!ioInstance) return;
  try {
    ioInstance.to(ROOMS.organization(orgId)).emit(event, data);
    // Backward compatibility for existing listeners
    ioInstance.to(`org-${orgId}`).emit(event, data);
  } catch (err: any) {
    logger.error('socket.emit_error', `Failed to emit to org ${orgId}: ${err.message}`);
  }
};

/**
 * Emit an event to a specific role room (e.g. HR, ADMIN, MANAGER).
 */
export const emitToRole = (role: string, event: SocketEventType | string, data: any) => {
  if (!ioInstance || !role) return;
  try {
    ioInstance.to(ROOMS.role(role)).emit(event, data);
  } catch (err: any) {
    logger.error('socket.emit_error', `Failed to emit to role ${role}: ${err.message}`);
  }
};

/**
 * Emit an event to multiple rooms simultaneously.
 */
export const emitToRooms = (rooms: string[], event: SocketEventType | string, data: any) => {
  if (!ioInstance || !rooms || rooms.length === 0) return;
  try {
    let target = ioInstance.to(rooms[0]);
    for (let i = 1; i < rooms.length; i++) {
      target = target.to(rooms[i]);
    }
    target.emit(event, data);
  } catch (err: any) {
    logger.error('socket.emit_error', `Failed to emit to rooms ${rooms.join(', ')}: ${err.message}`);
  }
};

/**
 * Global broadcast to all connected clients.
 */
export const broadcastEvent = (event: SocketEventType | string, data: any) => {
  if (!ioInstance) return;
  try {
    ioInstance.emit(event, data);
  } catch (err: any) {
    logger.error('socket.broadcast_error', `Failed to broadcast event ${event}: ${err.message}`);
  }
};

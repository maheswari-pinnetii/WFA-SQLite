/**
 * Room Architecture & Authorization Utilities for Socket.IO
 * Scopes events based on User, Employee, Team, Department, Organization, and Role.
 */

export const ROOMS = {
  user: (userId: string) => `user:${userId}`,
  employee: (employeeId: string) => `employee:${employeeId}`,
  team: (teamId: string) => `team:${teamId}`,
  department: (deptId: string) => `dept:${deptId}`,
  organization: (orgId: string = 'org-stackly') => `org:${orgId}`,
  role: (roleName: string) => `role:${roleName.toUpperCase()}`,
};

export interface SocketUserContext {
  id: string;
  email: string;
  role: 'ADMIN' | 'HR' | 'MANAGER' | 'TEAM_LEAD' | 'EMPLOYEE' | string;
  department?: string;
  team?: string;
  organizationId?: string;
  companyId?: string;
}

/**
 * Returns all room names that a user is authorized to automatically join on connection.
 */
export const getAuthorizedRoomsForUser = (user: SocketUserContext): string[] => {
  const orgId = user.companyId || user.organizationId || 'org-stackly';
  const rooms: string[] = [
    ROOMS.user(user.id),
    ROOMS.employee(user.id),
    ROOMS.organization(orgId),
    ROOMS.role(user.role),
  ];

  if (user.department) {
    rooms.push(ROOMS.department(user.department));
  }

  if (user.team) {
    rooms.push(ROOMS.team(user.team));
  }

  return rooms;
};

/**
 * Validates whether a given socket user is authorized to join a requested room.
 */
export const isUserAuthorizedForRoom = (user: SocketUserContext, room: string): boolean => {
  if (!user || !room) return false;

  // Global Admins have visibility across all organization rooms
  if (user.role === 'ADMIN') {
    return true;
  }

  // HR has visibility across all employee/attendance/dept rooms, but NOT admin-only rooms
  if (user.role === 'HR') {
    if (room.startsWith('role:ADMIN')) {
      return false;
    }
    return true;
  }

  const authorizedRooms = getAuthorizedRoomsForUser(user);
  if (authorizedRooms.includes(room)) {
    return true;
  }

  // Managers can access their own department room
  if (user.role === 'MANAGER' && user.department && room === ROOMS.department(user.department)) {
    return true;
  }

  // Team Leads can access their own team room
  if (user.role === 'TEAM_LEAD' && user.team && room === ROOMS.team(user.team)) {
    return true;
  }

  return false;
};

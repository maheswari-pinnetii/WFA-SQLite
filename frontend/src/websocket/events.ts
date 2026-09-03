/**
 * Centralized Socket.IO Event Constants (Frontend)
 */
export const SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',
  JOIN_ROOM: 'join-room',
  LEAVE_ROOM: 'leave-room',
  ERROR: 'error',

  // Attendance Events
  ATTENDANCE_CHECK_IN: 'attendance:check-in',
  ATTENDANCE_CHECK_OUT: 'attendance:check-out',
  ATTENDANCE_BREAK_START: 'attendance:break-start',
  ATTENDANCE_BREAK_END: 'attendance:break-end',
  ATTENDANCE_UPDATED: 'attendance:updated',
  ATTENDANCE_CORRECTION: 'attendance:correction',

  // Employee Events
  EMPLOYEE_CREATED: 'employee:created',
  EMPLOYEE_UPDATED: 'employee:updated',
  EMPLOYEE_STATUS_CHANGED: 'employee:status-changed',
  EMPLOYEE_DELETED: 'employee:deleted',

  // Leave Management
  LEAVE_SUBMITTED: 'leave:submitted',
  LEAVE_APPROVED: 'leave:approved',
  LEAVE_REJECTED: 'leave:rejected',

  // Notifications
  NOTIFICATION_NEW: 'notification:new',
  NOTIFICATION_READ: 'notification:read',

  // Dashboard KPIs
  DASHBOARD_KPI_UPDATED: 'dashboard:kpi-updated',

  // AI & Workforce Intelligence
  AI_INSIGHT_GENERATED: 'ai:insight-generated',
  AI_ALERT_GENERATED: 'ai:alert-generated',
  AI_PREDICTION_UPDATED: 'ai:prediction-updated',

  // Feature Flags
  FEATURE_FLAG_UPDATED: 'feature-flag:updated'
} as const;

export type SocketEventType = typeof SOCKET_EVENTS[keyof typeof SOCKET_EVENTS];

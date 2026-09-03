/**
 * Centralized Socket.IO Event Constants
 * Used across the entire Workforce Analytics platform to avoid scattered magic strings.
 */
export const SOCKET_EVENTS = {
  // Connection & Room Management
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
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

  // Employee Lifecycle Events
  EMPLOYEE_CREATED: 'employee:created',
  EMPLOYEE_UPDATED: 'employee:updated',
  EMPLOYEE_STATUS_CHANGED: 'employee:status-changed',
  EMPLOYEE_DELETED: 'employee:deleted',

  // Leave Management Events
  LEAVE_SUBMITTED: 'leave:submitted',
  LEAVE_APPROVED: 'leave:approved',
  LEAVE_REJECTED: 'leave:rejected',

  // Notification Events
  NOTIFICATION_NEW: 'notification:new',
  NOTIFICATION_READ: 'notification:read',

  // Dashboard KPI Events
  DASHBOARD_KPI_UPDATED: 'dashboard:kpi-updated',

  // AI & Workforce Intelligence Events
  AI_INSIGHT_GENERATED: 'ai:insight-generated',
  AI_ALERT_GENERATED: 'ai:alert-generated',
  AI_PREDICTION_UPDATED: 'ai:prediction-updated',

  // Feature Flag Events
  FEATURE_FLAG_UPDATED: 'feature-flag:updated'
} as const;

export type SocketEventType = typeof SOCKET_EVENTS[keyof typeof SOCKET_EVENTS];

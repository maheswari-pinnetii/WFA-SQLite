/**
 * Attendance State Machine
 *
 * Enforces valid status transitions on the server side.
 * The frontend may also guard these, but the backend is the source of truth.
 *
 * Valid transitions:
 *   NOT_STARTED  → CHECKED_IN
 *   CHECKED_IN   → ON_BREAK
 *   CHECKED_IN   → CHECKED_OUT
 *   ON_BREAK     → CHECKED_IN   (resume)
 *
 * Everything else is rejected with an AppError.
 */

import { AppError, ErrorCode } from './apiError.js';

export type AttendanceStatus =
  | 'NOT_STARTED'
  | 'Checked Out'    // Legacy value in DB
  | 'CHECKED_IN'
  | 'Checked In'     // Legacy value in DB
  | 'ON_BREAK'
  | 'On Break'       // Legacy value in DB
  | 'CHECKED_OUT';

// Normalize legacy mixed-case values stored in the DB
export const normalizeStatus = (raw: string | null | undefined): AttendanceStatus => {
  if (!raw) return 'NOT_STARTED';
  const s = raw.trim();
  if (s === 'Checked In'  || s === 'CHECKED_IN')  return 'CHECKED_IN';
  if (s === 'On Break'    || s === 'ON_BREAK')     return 'ON_BREAK';
  if (s === 'Checked Out' || s === 'CHECKED_OUT')  return 'CHECKED_OUT';
  if (s === 'NOT_STARTED')                          return 'NOT_STARTED';
  return 'NOT_STARTED';
};

// Define allowed transitions as a map from current → set of allowed next states
const ALLOWED_TRANSITIONS: Record<string, Set<string>> = {
  NOT_STARTED: new Set(['CHECKED_IN']),
  CHECKED_IN:  new Set(['ON_BREAK', 'CHECKED_OUT']),
  ON_BREAK:    new Set(['CHECKED_IN']),   // resume only — must resume before checking out
  CHECKED_OUT: new Set([]),               // terminal state for the day
};

/**
 * Assert that transitioning from `current` to `next` is valid.
 * Throws AppError(ATTENDANCE_INVALID_TRANSITION) if not.
 */
export const assertValidTransition = (
  currentRaw: string | null | undefined,
  next: AttendanceStatus
): void => {
  const current = normalizeStatus(currentRaw);
  const allowed = ALLOWED_TRANSITIONS[current] ?? new Set();

  if (!allowed.has(next)) {
    const reason = buildRejectionReason(current, next);
    throw new AppError(
      ErrorCode.ATTENDANCE_INVALID_TRANSITION,
      reason,
      409
    );
  }
};

/** Human-readable rejection reason for common invalid transitions */
const buildRejectionReason = (current: AttendanceStatus, next: AttendanceStatus): string => {
  if (current === 'CHECKED_OUT') {
    return 'Cannot change attendance status after checking out for the day. A new record must be created for the next working day.';
  }
  if (current === 'ON_BREAK' && next === 'CHECKED_OUT') {
    return 'Cannot check out while on break. Please resume work first, then check out.';
  }
  if (current === 'ON_BREAK' && next === 'ON_BREAK') {
    return 'Already on break. Cannot start a new break without resuming first.';
  }
  if (current === 'NOT_STARTED' && next === 'CHECKED_OUT') {
    return 'Cannot check out without checking in first.';
  }
  if (current === 'NOT_STARTED' && next === 'ON_BREAK') {
    return 'Cannot start a break without checking in first.';
  }
  if (current === 'CHECKED_IN' && next === 'CHECKED_IN') {
    return 'Already checked in. Cannot check in again without checking out.';
  }
  return `Invalid attendance transition: ${current} → ${next}.`;
};

/** Returns the canonical DB value to store for a given normalized status */
export const toDbStatus = (status: AttendanceStatus): string => {
  switch (status) {
    case 'CHECKED_IN':  return 'Checked In';
    case 'ON_BREAK':    return 'On Break';
    case 'CHECKED_OUT': return 'Checked Out';
    default:            return 'Checked Out';
  }
};

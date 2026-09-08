import React from 'react';
import {
  Radio,
  CircleSlash,
  Briefcase,
  Moon,
  LogIn,
  Coffee,
  Play,
  LogOut,
  Clock,
  CheckCircle2,
  Calendar,
  UserX,
  CheckCheck,
  XCircle,
  AlertCircle,
  MapPin,
  MapPinOff,
  NavigationOff,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Cloud,
  CloudOff,
  Bell
} from 'lucide-react';
import clsx from 'clsx';

// ==========================================
// 1. EMPLOYEE STATUS INDICATOR
// ==========================================
export type EmployeeStatus = 'Online' | 'Offline' | 'Working' | 'Away' | 'Active' | 'Inactive';

export interface EmployeeStatusIconProps {
  status: EmployeeStatus | string;
  size?: number;
  showText?: boolean;
  className?: string;
}

export const EmployeeStatusIcon: React.FC<EmployeeStatusIconProps> = ({
  status,
  size = 14,
  showText = false,
  className = ''
}) => {
  const norm = status.toLowerCase();

  if (norm === 'online' || norm === 'active') {
    return (
      <span
        className={clsx("inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400", className)}
        title="Employee Online - Active session"
        aria-label="Status: Online"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <Radio size={size} className="shrink-0" />
        {showText && <span className="text-xs font-semibold">Online</span>}
      </span>
    );
  }

  if (norm === 'working') {
    return (
      <span
        className={clsx("inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400", className)}
        title="Employee Working - Active shift task"
        aria-label="Status: Working"
      >
        <Briefcase size={size} className="shrink-0" />
        {showText && <span className="text-xs font-semibold">Working</span>}
      </span>
    );
  }

  if (norm === 'away' || norm === 'idle') {
    return (
      <span
        className={clsx("inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400", className)}
        title="Employee Away - Idle / Break"
        aria-label="Status: Away"
      >
        <Moon size={size} className="shrink-0" />
        {showText && <span className="text-xs font-semibold">Away</span>}
      </span>
    );
  }

  // Default: Offline / Inactive
  return (
    <span
      className={clsx("inline-flex items-center gap-1.5 text-slate-400 dark:text-slate-500", className)}
      title="Employee Offline"
      aria-label="Status: Offline"
    >
      <CircleSlash size={size} className="shrink-0" />
      {showText && <span className="text-xs font-semibold">Offline</span>}
    </span>
  );
};

// ==========================================
// 2. ATTENDANCE ACTION ICON
// ==========================================
export type AttendanceAction = 'CHECK_IN' | 'BREAK' | 'RESUME' | 'CHECK_OUT' | 'LATE';

export interface AttendanceActionIconProps {
  action: AttendanceAction | string;
  size?: number;
  className?: string;
}

export const AttendanceActionIcon: React.FC<AttendanceActionIconProps> = ({
  action,
  size = 16,
  className = ''
}) => {
  const norm = action.toUpperCase();

  switch (norm) {
    case 'CHECK_IN':
    case 'CHECKIN':
      return <span title="Check-In" aria-label="Check-In" className="inline-flex items-center"><LogIn size={size} className={clsx("text-emerald-500 shrink-0", className)} /></span>;
    case 'BREAK':
    case 'TAKE_BREAK':
    case 'ON_BREAK':
      return <span title="Take Break" aria-label="Break" className="inline-flex items-center"><Coffee size={size} className={clsx("text-amber-500 shrink-0", className)} /></span>;
    case 'RESUME':
    case 'RESUME_WORK':
      return <span title="Resume Work" aria-label="Resume Work" className="inline-flex items-center"><Play size={size} className={clsx("text-blue-500 shrink-0", className)} /></span>;
    case 'CHECK_OUT':
    case 'CHECKOUT':
      return <span title="Check-Out" aria-label="Check-Out" className="inline-flex items-center"><LogOut size={size} className={clsx("text-rose-500 shrink-0", className)} /></span>;
    case 'LATE':
    case 'LATE_ARRIVAL':
      return <span title="Late Arrival" aria-label="Late Arrival" className="inline-flex items-center"><Clock size={size} className={clsx("text-amber-500 shrink-0", className)} /></span>;
    default:
      return <span title={action} aria-label={action} className="inline-flex items-center"><CheckCircle2 size={size} className={clsx("text-slate-400 shrink-0", className)} /></span>;
  }
};

// ==========================================
// 3. LEAVE & ABSENCE STATUS ICON
// ==========================================
export type LeaveStatus = 'PRESENT' | 'LEAVE' | 'ON_LEAVE' | 'ABSENT' | 'PENDING' | 'APPROVED' | 'REJECTED';

export interface LeaveStatusIconProps {
  status: LeaveStatus | string;
  size?: number;
  className?: string;
}

export const LeaveStatusIcon: React.FC<LeaveStatusIconProps> = ({
  status,
  size = 14,
  className = ''
}) => {
  const norm = status.toUpperCase();

  switch (norm) {
    case 'PRESENT':
      return <span title="Present" aria-label="Present" className="inline-flex items-center"><CheckCircle2 size={size} className={clsx("text-emerald-500 shrink-0", className)} /></span>;
    case 'LEAVE':
    case 'ON_LEAVE':
      return <span title="On Leave" aria-label="On Leave" className="inline-flex items-center"><Calendar size={size} className={clsx("text-purple-500 shrink-0", className)} /></span>;
    case 'ABSENT':
      return <span title="Absent" aria-label="Absent" className="inline-flex items-center"><UserX size={size} className={clsx("text-rose-500 shrink-0", className)} /></span>;
    case 'PENDING':
      return <span title="Pending Review" aria-label="Pending Review" className="inline-flex items-center"><Clock size={size} className={clsx("text-amber-500 shrink-0", className)} /></span>;
    case 'APPROVED':
      return <span title="Approved" aria-label="Approved" className="inline-flex items-center"><CheckCheck size={size} className={clsx("text-emerald-500 shrink-0", className)} /></span>;
    case 'REJECTED':
      return <span title="Rejected" aria-label="Rejected" className="inline-flex items-center"><XCircle size={size} className={clsx("text-rose-500 shrink-0", className)} /></span>;
    default:
      return <span title={status} aria-label={status} className="inline-flex items-center"><AlertCircle size={size} className={clsx("text-slate-400 shrink-0", className)} /></span>;
  }
};

// ==========================================
// 4. LOCATION / GEOFENCING STATUS ICON
// ==========================================
export type GeofenceState = 'INSIDE_OFFICE' | 'OUTSIDE_GEOFENCE' | 'LOCATION_UNAVAILABLE';

export interface GeofenceStatusIconProps {
  state: GeofenceState | string;
  size?: number;
  showBadge?: boolean;
  distanceMeters?: number;
  className?: string;
}

export const GeofenceStatusIcon: React.FC<GeofenceStatusIconProps> = ({
  state,
  size = 14,
  showBadge = false,
  distanceMeters,
  className = ''
}) => {
  const norm = state.toUpperCase();

  if (norm === 'INSIDE_OFFICE' || norm === 'INSIDE' || norm === 'OFFICE_VERIFIED') {
    return (
      <span
        className={clsx(
          "inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400",
          showBadge && "px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold",
          className
        )}
        title="Inside Office Geofence - Location Verified"
        aria-label="Location: Inside office"
      >
        <ShieldCheck size={size} className="shrink-0 text-emerald-500" />
        {showBadge && <span>Inside Office</span>}
      </span>
    );
  }

  if (norm === 'OUTSIDE_GEOFENCE' || norm === 'OUTSIDE' || norm === 'GEOFENCE_BREACH') {
    return (
      <span
        className={clsx(
          "inline-flex items-center gap-1.5 text-rose-600 dark:text-rose-400",
          showBadge && "px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-xs font-semibold",
          className
        )}
        title={`Outside Office Geofence${distanceMeters !== undefined ? ` (${Math.round(distanceMeters)}m away)` : ''}`}
        aria-label="Location: Outside office"
      >
        <AlertTriangle size={size} className="shrink-0 text-rose-500" />
        {showBadge && <span>Outside Geofence</span>}
      </span>
    );
  }

  // Location Unavailable / Off
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400",
        showBadge && "px-2 py-0.5 rounded-full bg-slate-500/10 border border-slate-500/20 text-xs font-semibold",
        className
      )}
      title="Location Unavailable / Permissions Denied"
      aria-label="Location: Unavailable"
    >
      <NavigationOff size={size} className="shrink-0" />
      {showBadge && <span>Location Off</span>}
    </span>
  );
};

// ==========================================
// 5. SYNCHRONIZATION STATUS ICON
// ==========================================
export type SyncState = 'SYNCING' | 'SYNCED' | 'FAILED' | 'PENDING';

export interface SyncStatusIconProps {
  status: SyncState | string;
  queueCount?: number;
  size?: number;
  className?: string;
}

export const SyncStatusIcon: React.FC<SyncStatusIconProps> = ({
  status,
  queueCount = 0,
  size = 14,
  className = ''
}) => {
  const norm = status.toUpperCase();

  if (norm === 'SYNCING') {
    return (
      <span
        className={clsx("inline-flex items-center gap-1.5 text-blue-500", className)}
        title="Syncing data with server..."
        aria-label="Synchronization in progress"
      >
        <RefreshCw size={size} className="animate-spin shrink-0" />
        <span className="text-xs font-semibold">Syncing...</span>
      </span>
    );
  }

  if (norm === 'SYNCED' || norm === 'SUCCESS') {
    return (
      <span
        className={clsx("inline-flex items-center gap-1.5 text-emerald-500", className)}
        title="All local actions successfully synchronized"
        aria-label="Synchronized"
      >
        <CheckCircle2 size={size} className="shrink-0" />
        <span className="text-xs font-semibold">Synced</span>
      </span>
    );
  }

  if (norm === 'FAILED' || norm === 'ERROR') {
    return (
      <span
        className={clsx("inline-flex items-center gap-1.5 text-rose-500", className)}
        title="Sync failed. Check network connectivity."
        aria-label="Sync failed"
      >
        <CloudOff size={size} className="shrink-0" />
        <span className="text-xs font-semibold">Sync Error</span>
      </span>
    );
  }

  // PENDING / OFFLINE
  return (
    <span
      className={clsx("inline-flex items-center gap-1.5 text-amber-500", className)}
      title={`${queueCount} offline actions pending sync`}
      aria-label={`${queueCount} offline actions pending`}
    >
      <Cloud size={size} className="shrink-0" />
      <span className="text-xs font-semibold">{queueCount > 0 ? `${queueCount} Pending` : 'Offline'}</span>
    </span>
  );
};

// ==========================================
// 6. NOTIFICATION BELL WITH DATA-DRIVEN ANIMATION
// ==========================================
export interface NotificationBellProps {
  unreadCount: number;
  hasNewNotification: boolean;
  onClick: () => void;
  className?: string;
  isDark?: boolean;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  unreadCount,
  hasNewNotification,
  onClick,
  className = '',
  isDark = true
}) => {
  return (
    <button
      onClick={onClick}
      aria-label={`View Notifications (${unreadCount} unread)`}
      className={clsx(
        "p-2 rounded-xl border transition-all relative cursor-pointer",
        isDark
          ? 'bg-slate-900/90 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
          : 'bg-slate-100 border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-200',
        hasNewNotification && "ring-2 ring-rose-500/50 animate-bounce",
        className
      )}
      title={hasNewNotification ? "New notification received!" : "Notifications & System Alerts"}
    >
      <Bell size={18} className={clsx(hasNewNotification && "text-rose-400")} />
      {unreadCount > 0 && (
        <span
          className={clsx(
            "absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-black flex items-center justify-center shadow-md",
            hasNewNotification && "animate-ping"
          )}
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
      {/* Static badge if not animating */}
      {unreadCount > 0 && hasNewNotification && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-black flex items-center justify-center shadow-md">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
};

// ==========================================
// 7. DASHBOARD KPI LIVE INDICATOR
// ==========================================
export const LiveKpiIndicator: React.FC<{ label?: string; className?: string }> = ({
  label = 'Live',
  className = ''
}) => (
  <span
    className={clsx(
      "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9.5px] font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
      className
    )}
    title="Data-driven live metric connected to SQLite & WebSocket engine"
    aria-label="Real-time live metric"
  >
    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
    {label}
  </span>
);

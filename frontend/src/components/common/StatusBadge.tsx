import React from 'react';
import clsx from 'clsx';
import {
  CheckCircle2,
  Radio,
  CheckCheck,
  UserX,
  XCircle,
  CircleSlash,
  LogOut,
  Clock,
  Coffee,
  Calendar,
  Briefcase,
  Moon,
  AlertCircle
} from 'lucide-react';

export type BadgeStatus =
  | 'PRESENT'
  | 'ABSENT'
  | 'LATE'
  | 'ON_BREAK'
  | 'CHECKED_OUT'
  | 'ON_LEAVE'
  | 'ACTIVE'
  | 'INACTIVE'
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'ONLINE'
  | 'OFFLINE'
  | 'WORKING'
  | 'AWAY';

interface StatusBadgeProps {
  status: BadgeStatus | string;
  label?: string;
  className?: string;
  showIcon?: boolean;
}

const statusConfig: Record<string, { bg: string; text: string; label: string; icon: React.ReactNode }> = {
  PRESENT: { bg: 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40', text: 'text-emerald-700 dark:text-emerald-400', label: 'Present', icon: <CheckCircle2 size={12} className="shrink-0 text-emerald-500" /> },
  ACTIVE: { bg: 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40', text: 'text-emerald-700 dark:text-emerald-400', label: 'Active', icon: <Radio size={12} className="shrink-0 text-emerald-500 animate-pulse" /> },
  ONLINE: { bg: 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40', text: 'text-emerald-700 dark:text-emerald-400', label: 'Online', icon: <Radio size={12} className="shrink-0 text-emerald-500 animate-pulse" /> },
  APPROVED: { bg: 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40', text: 'text-emerald-700 dark:text-emerald-400', label: 'Approved', icon: <CheckCheck size={12} className="shrink-0 text-emerald-500" /> },
  
  WORKING: { bg: 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40', text: 'text-emerald-700 dark:text-emerald-400', label: 'Working', icon: <Briefcase size={12} className="shrink-0 text-emerald-500" /> },
  ON_BREAK: { bg: 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40', text: 'text-emerald-700 dark:text-emerald-400', label: 'On Break', icon: <Coffee size={12} className="shrink-0 text-amber-500" /> },
  
  AWAY: { bg: 'bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40', text: 'text-amber-700 dark:text-amber-400', label: 'Away', icon: <Moon size={12} className="shrink-0 text-amber-500" /> },
  LATE: { bg: 'bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40', text: 'text-amber-700 dark:text-amber-400', label: 'Late', icon: <Clock size={12} className="shrink-0 text-amber-500" /> },
  PENDING: { bg: 'bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40', text: 'text-amber-700 dark:text-amber-400', label: 'Pending', icon: <Clock size={12} className="shrink-0 text-amber-500" /> },
  
  ABSENT: { bg: 'bg-red-50 dark:bg-red-950/40 border border-red-200/60 dark:border-red-800/40', text: 'text-red-700 dark:text-red-400', label: 'Absent', icon: <UserX size={12} className="shrink-0 text-red-500" /> },
  REJECTED: { bg: 'bg-red-50 dark:bg-red-950/40 border border-red-200/60 dark:border-red-800/40', text: 'text-red-700 dark:text-red-400', label: 'Rejected', icon: <XCircle size={12} className="shrink-0 text-red-500" /> },
  
  INACTIVE: { bg: 'bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700', text: 'text-slate-700 dark:text-slate-400', label: 'Inactive', icon: <CircleSlash size={12} className="shrink-0 text-slate-400" /> },
  OFFLINE: { bg: 'bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700', text: 'text-slate-700 dark:text-slate-400', label: 'Offline', icon: <CircleSlash size={12} className="shrink-0 text-slate-400" /> },
  CHECKED_OUT: { bg: 'bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700', text: 'text-slate-700 dark:text-slate-400', label: 'Checked Out', icon: <LogOut size={12} className="shrink-0 text-slate-400" /> },
  
  ON_LEAVE: { bg: 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40', text: 'text-emerald-700 dark:text-emerald-400', label: 'On Leave', icon: <Calendar size={12} className="shrink-0 text-emerald-500" /> },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, className, showIcon = true }) => {
  const normKey = (status || '').toUpperCase().replace(/\s+/g, '_');
  const config = statusConfig[normKey] || {
    bg: 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700',
    text: 'text-slate-700 dark:text-slate-300',
    label: status,
    icon: <AlertCircle size={12} className="shrink-0 text-slate-400" />
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold tracking-wide transition-colors",
        config.bg,
        config.text,
        className
      )}
      title={`Status: ${label || config.label}`}
      aria-label={`Status: ${label || config.label}`}
    >
      {showIcon && config.icon}
      <span>{label || config.label}</span>
    </span>
  );
};

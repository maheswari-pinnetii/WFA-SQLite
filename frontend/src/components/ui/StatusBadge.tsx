import React from 'react';
import clsx from 'clsx';

export type BadgeStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'ON_BREAK' | 'CHECKED_OUT' | 'ON_LEAVE' | 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'APPROVED' | 'REJECTED';

interface StatusBadgeProps {
  status: BadgeStatus | string;
  label?: string;
  className?: string;
}

const statusConfig: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  PRESENT: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Present' },
  ACTIVE: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Active' },
  APPROVED: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Approved' },
  
  ABSENT: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500', label: 'Absent' },
  REJECTED: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500', label: 'Rejected' },
  INACTIVE: { bg: 'bg-slate-100', text: 'text-slate-700', dot: 'bg-slate-500', label: 'Inactive' },
  CHECKED_OUT: { bg: 'bg-slate-100', text: 'text-slate-700', dot: 'bg-slate-500', label: 'Checked Out' },
  
  LATE: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', label: 'Late' },
  PENDING: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', label: 'Pending' },
  
  ON_BREAK: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', label: 'On Break' },
  ON_LEAVE: { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500', label: 'On Leave' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, className }) => {
  const config = statusConfig[status.toUpperCase()] || { bg: 'bg-slate-100', text: 'text-slate-700', dot: 'bg-slate-500', label: status };

  return (
    <span className={clsx("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold tracking-wide", config.bg, config.text, className)}>
      <span className={clsx("w-1.5 h-1.5 rounded-full", config.dot)} />
      {label || config.label}
    </span>
  );
};

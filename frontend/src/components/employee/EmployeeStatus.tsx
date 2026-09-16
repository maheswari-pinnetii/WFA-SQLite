import React from 'react';
import { UserCheck, Clock, Calendar, AlertCircle } from 'lucide-react';

interface EmployeeStatusProps {
  status?: string;
  attendanceStatus?: string;
}

export const EmployeeStatus: React.FC<EmployeeStatusProps> = ({ status = 'Active', attendanceStatus }) => {
  const currentStatus = attendanceStatus || status;

  if (currentStatus === 'Present' || currentStatus === 'Active' || currentStatus === 'Working') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
        <UserCheck size={12} /> Present
      </span>
    );
  }

  if (currentStatus === 'Late' || currentStatus === 'Grace') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
        <Clock size={12} /> Late
      </span>
    );
  }

  if (currentStatus === 'Leave' || currentStatus === 'On Leave' || currentStatus === 'PTO') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800/60">
        <Calendar size={12} /> On Leave
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60">
      <AlertCircle size={12} /> Absent
    </span>
  );
};

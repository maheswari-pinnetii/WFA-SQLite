import React from 'react';
import { Play, CheckCircle2, Clock, XCircle } from 'lucide-react';

interface SprintStatusProps {
  status: 'Active' | 'Planned' | 'Completed' | 'Cancelled' | string;
}

export const SprintStatus: React.FC<SprintStatusProps> = ({ status }) => {
  const upper = (status || 'Active').toUpperCase();

  if (upper === 'ACTIVE') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
        <Play size={10} className="fill-current" /> Active
      </span>
    );
  }

  if (upper === 'COMPLETED') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60">
        <CheckCircle2 size={12} /> Completed
      </span>
    );
  }

  if (upper === 'PLANNED') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
        <Clock size={12} /> Planned
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
      <XCircle size={12} /> {status}
    </span>
  );
};

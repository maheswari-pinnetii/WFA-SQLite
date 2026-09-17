import React from 'react';
import { ShieldAlert, ArrowUpRight, ArrowRight, ArrowDownRight } from 'lucide-react';

interface TaskPriorityProps {
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | string;
}

export const TaskPriority: React.FC<TaskPriorityProps> = ({ priority }) => {
  const upper = (priority || 'MEDIUM').toUpperCase();

  if (upper === 'CRITICAL' || upper === 'URGENT') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
        <ShieldAlert size={11} /> Critical
      </span>
    );
  }

  if (upper === 'HIGH') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
        <ArrowUpRight size={11} /> High
      </span>
    );
  }

  if (upper === 'MEDIUM') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium uppercase bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
        <ArrowRight size={11} /> Medium
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium uppercase bg-slate-50 text-slate-500 dark:bg-slate-900 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
      <ArrowDownRight size={11} /> Low
    </span>
  );
};

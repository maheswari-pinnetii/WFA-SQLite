import React from 'react';
import { Circle, Clock, AlertOctagon, CheckCircle2 } from 'lucide-react';

interface TaskStatusProps {
  status: 'TODO' | 'IN_PROGRESS' | 'BLOCKED' | 'COMPLETED' | string;
}

export const TaskStatus: React.FC<TaskStatusProps> = ({ status }) => {
  const upper = (status || 'TODO').toUpperCase();

  if (upper === 'COMPLETED') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
        <CheckCircle2 size={11} /> Completed
      </span>
    );
  }

  if (upper === 'IN_PROGRESS') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60">
        <Clock size={11} /> In Progress
      </span>
    );
  }

  if (upper === 'BLOCKED') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60">
        <AlertOctagon size={11} /> Blocked
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
      <Circle size={10} /> To Do
    </span>
  );
};

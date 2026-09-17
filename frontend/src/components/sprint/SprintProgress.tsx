import React from 'react';

interface SprintProgressProps {
  completed: number;
  total: number;
  completionPct?: number;
}

export const SprintProgress: React.FC<SprintProgressProps> = ({ completed, total, completionPct }) => {
  const pct = completionPct !== undefined ? completionPct : total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="w-full space-y-1">
      <div className="flex items-center justify-between text-[11px] font-mono">
        <span className="text-slate-500 dark:text-slate-400">
          {completed}/{total} SP
        </span>
        <span className="font-bold text-emerald-600 dark:text-emerald-400">{pct}%</span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all duration-300"
          style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
        />
      </div>
    </div>
  );
};

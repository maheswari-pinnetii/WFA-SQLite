import React from 'react';

export const KpiSkeleton: React.FC = () => {
  return (
    <div className="h-[160px] bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5 flex flex-col justify-between animate-pulse">
      <div className="flex items-start justify-between">
        <div className="h-4 w-28 bg-[var(--border-color)] rounded" />
        <div className="w-10 h-10 bg-[var(--border-color)] rounded-xl" />
      </div>

      <div className="space-y-2">
        <div className="h-8 w-20 bg-[var(--border-color)] rounded-lg" />
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-[var(--border-color)]/50">
        <div className="h-3 w-24 bg-[var(--border-color)] rounded" />
        <div className="h-3 w-12 bg-[var(--border-color)] rounded" />
      </div>
    </div>
  );
};

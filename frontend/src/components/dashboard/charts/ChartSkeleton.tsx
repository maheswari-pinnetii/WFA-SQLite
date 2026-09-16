import React from 'react';

interface ChartSkeletonProps {
  height?: number;
}

export const ChartSkeleton: React.FC<ChartSkeletonProps> = ({ height = 280 }) => {
  return (
    <div
      style={{ height }}
      className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5 flex flex-col justify-between animate-pulse"
    >
      <div className="space-y-2">
        <div className="h-4 w-40 bg-[var(--border-color)] rounded" />
        <div className="h-3 w-64 bg-[var(--border-color)] rounded" />
      </div>

      <div className="w-full h-36 bg-[var(--border-color)]/50 rounded-xl" />

      <div className="flex items-center justify-center gap-4 pt-2">
        <div className="h-3 w-16 bg-[var(--border-color)] rounded" />
        <div className="h-3 w-16 bg-[var(--border-color)] rounded" />
      </div>
    </div>
  );
};

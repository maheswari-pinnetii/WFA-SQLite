import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width,
  height,
  rounded = 'rounded-xl'
}) => {
  return (
    <div
      className={`animate-pulse bg-slate-200/70 dark:bg-slate-800/80 ${rounded} ${className}`}
      style={{
        width: width !== undefined ? width : undefined,
        height: height !== undefined ? height : undefined
      }}
      aria-hidden="true"
    />
  );
};

export const CardSkeleton: React.FC<{ rows?: number }> = ({ rows = 3 }) => {
  return (
    <div className="p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton width="40%" height={20} />
        <Skeleton width={32} height={32} rounded="rounded-xl" />
      </div>
      <div className="space-y-2.5">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} width={`${90 - i * 15}%`} height={14} />
        ))}
      </div>
    </div>
  );
};

export const MetricSkeleton: React.FC = () => {
  return (
    <div className="p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton width="50%" height={14} />
        <Skeleton width={28} height={28} rounded="rounded-lg" />
      </div>
      <Skeleton width="70%" height={32} />
      <div className="flex items-center gap-2 pt-1">
        <Skeleton width={48} height={18} rounded="rounded-md" />
        <Skeleton width="40%" height={12} />
      </div>
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 5
}) => {
  return (
    <div className="w-full rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] overflow-hidden">
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-[var(--border-color)] bg-[var(--bg-tertiary)]/50 flex items-center justify-between gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} width={`${100 / columns - 5}%`} height={16} />
        ))}
      </div>
      {/* Table Rows */}
      <div className="divide-y divide-[var(--border-color)]">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="px-6 py-4 flex items-center justify-between gap-4">
            {Array.from({ length: columns }).map((_, c) => (
              <Skeleton key={c} width={`${100 / columns - (c % 2 === 0 ? 8 : 4)}%`} height={16} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const ChartSkeleton: React.FC = () => {
  return (
    <div className="p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <Skeleton width={140} height={18} />
          <Skeleton width={90} height={12} />
        </div>
        <Skeleton width={80} height={28} rounded="rounded-lg" />
      </div>
      <div className="h-56 flex items-end justify-between gap-2 pt-6 px-2">
        {[40, 70, 55, 90, 65, 80, 45, 95, 60, 75, 85, 50].map((h, i) => (
          <Skeleton
            key={i}
            className="flex-1"
            height={`${h}%`}
            rounded="rounded-t-lg"
          />
        ))}
      </div>
    </div>
  );
};

export default Skeleton;

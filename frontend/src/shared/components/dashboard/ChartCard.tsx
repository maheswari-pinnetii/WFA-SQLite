import React from 'react';
import { LoadingState, EmptyState, ErrorState } from './DataStates';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  isLoading?: boolean;
  error?: string | null;
  isEmpty?: boolean;
  onRetry?: () => void;
  minHeight?: number;
  children: React.ReactNode;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  isLoading = false,
  error = null,
  isEmpty = false,
  onRetry,
  minHeight = 360,
  children
}) => {
  return (
    <section
      className="glass-panel p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 shadow-sm flex flex-col relative w-full min-w-0"
      style={{ minHeight }}
      aria-busy={isLoading}
    >
      <div className="mb-4 shrink-0">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
      </div>

      <div className="flex-1 flex flex-col relative min-h-[200px] w-full min-w-0">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 dark:bg-slate-900/50 rounded-lg">
            <LoadingState />
          </div>
        )}

        {!isLoading && error && (
          <div className="absolute inset-0 z-10">
            <ErrorState message={error} onRetry={onRetry} />
          </div>
        )}

        {!isLoading && !error && isEmpty && (
          <div className="absolute inset-0 z-10">
            <EmptyState title="No chart data" message="There is no data to display for this metric." />
          </div>
        )}

        {/* Content renders even when loading to support background refreshing, but is hidden/replaced by states above if needed */}
        <div className={`flex-1 w-full h-full transition-opacity duration-300 ${(isLoading && !children) || error || isEmpty ? 'opacity-0 hidden' : 'opacity-100'}`}>
          {children}
        </div>
      </div>
    </section>
  );
};

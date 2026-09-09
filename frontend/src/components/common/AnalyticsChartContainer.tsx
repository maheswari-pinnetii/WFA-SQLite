import React from 'react';
import { AlertCircle, Inbox, Loader2 } from 'lucide-react';

interface AnalyticsChartContainerProps {
  title: string;
  subtitle?: string;
  isLoading?: boolean;
  error?: string | null;
  isEmpty?: boolean;
  onRetry?: () => void;
  minHeight?: number;
  children: React.ReactNode;
}

export const AnalyticsChartContainer: React.FC<AnalyticsChartContainerProps> = ({
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
      className="w-full min-w-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-sm font-sans text-slate-900 dark:text-slate-100 flex flex-col justify-between relative"
      style={{ minHeight }}
      aria-busy={isLoading}
    >
      
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-normal">{subtitle}</p>}
      </div>

      {/* Content Area */}
      <div className="flex-1 flex items-center justify-center min-h-[260px] w-full">
        {isLoading && (
          <div className="flex flex-col items-center justify-center space-y-3">
            <Loader2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400 animate-spin" />
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Loading analysis data...</span>
          </div>
        )}

        {!isLoading && error && (
          <div className="flex flex-col items-center justify-center text-center p-4 space-y-2">
            <AlertCircle className="h-6 w-6 text-rose-500" />
            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">Failed to load chart</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 max-w-[240px]">{error}</span>
            {onRetry && (
              <button type="button" onClick={onRetry} className="mt-2 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 shadow-sm transition-colors">
                Try again
              </button>
            )}
          </div>
        )}

        {!isLoading && !error && isEmpty && (
          <div className="flex flex-col items-center justify-center text-center p-4 space-y-2">
            <Inbox className="h-6 w-6 text-slate-400 dark:text-slate-500" />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">No data available</span>
            <span className="text-xs text-slate-400 dark:text-slate-500">There are no records matching current filters</span>
          </div>
        )}

        {!isLoading && !error && !isEmpty && (
          <div className="w-full h-full min-h-[260px]">
            {children}
          </div>
        )}
      </div>
    </section>
  );
};

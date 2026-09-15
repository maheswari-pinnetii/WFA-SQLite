import React from 'react';
import { AlertCircle, FileX } from 'lucide-react';

export const LoadingState: React.FC = () => {
  return (
    <div className="w-full h-full min-h-[200px] flex flex-col items-center justify-center p-6 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
      <div className="w-8 h-8 border-4 border-slate-200 dark:border-slate-700 border-t-emerald-500 rounded-full animate-spin"></div>
      <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">Loading data...</p>
    </div>
  );
};

export const EmptyState: React.FC<{ title?: string; message?: string; action?: React.ReactNode }> = ({
  title = "No data available",
  message = "There is no information for the selected period or filters.",
  action
}) => {
  return (
    <div className="w-full h-full min-h-[200px] flex flex-col items-center justify-center p-6 text-center bg-slate-50/50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
      <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
        <FileX size={24} className="text-slate-400 dark:text-slate-500" />
      </div>
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-4">{message}</p>
      {action}
    </div>
  );
};

export const ErrorState: React.FC<{ message?: string; onRetry?: () => void }> = ({
  message = "Unable to load this data.",
  onRetry
}) => {
  return (
    <div className="w-full h-full min-h-[200px] flex flex-col items-center justify-center p-6 text-center bg-rose-50/50 dark:bg-rose-900/10 rounded-xl border border-rose-100 dark:border-rose-900/30">
      <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mb-3">
        <AlertCircle size={24} className="text-rose-500 dark:text-rose-400" />
      </div>
      <h3 className="text-sm font-semibold text-rose-900 dark:text-rose-300 mb-1">Error Loading Data</h3>
      <p className="text-sm text-rose-600 dark:text-rose-400 max-w-sm mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  );
};

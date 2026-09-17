import React from 'react';
import { Database, AlertTriangle, RefreshCw } from 'lucide-react';

interface DataTableEmptyStateProps {
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  onRetry?: () => void;
  colSpan?: number;
}

export const DataTableEmptyState: React.FC<DataTableEmptyStateProps> = ({
  loading = false,
  error = null,
  emptyMessage = 'No matching records found in database.',
  onRetry,
  colSpan = 10,
}) => {
  if (loading) {
    return (
      <tr>
        <td colSpan={colSpan} className="py-12 text-center text-slate-500 dark:text-slate-400">
          <div className="flex flex-col items-center justify-center gap-2">
            <span className="w-7 h-7 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-medium">Loading database records...</span>
          </div>
        </td>
      </tr>
    );
  }

  if (error) {
    return (
      <tr>
        <td colSpan={colSpan} className="py-10 text-center">
          <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50">
            <AlertTriangle className="text-rose-500" size={24} />
            <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">{error}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-1 px-3 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
              >
                <RefreshCw size={13} /> Retry Connection
              </button>
            )}
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td colSpan={colSpan} className="py-12 text-center text-slate-400 dark:text-slate-500">
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
            <Database size={24} />
          </div>
          <span className="text-xs font-medium max-w-xs">{emptyMessage}</span>
        </div>
      </td>
    </tr>
  );
};

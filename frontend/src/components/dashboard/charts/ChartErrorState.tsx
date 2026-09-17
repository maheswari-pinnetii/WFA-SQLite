import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ChartErrorStateProps {
  error?: string | null;
  message?: string | null;
  onRetry?: () => void;
  height?: number;
}

export const ChartErrorState: React.FC<ChartErrorStateProps> = ({
  error,
  message,
  onRetry,
  height = 220,
}) => {
  const displayMsg = error || message || 'An unexpected error occurred while communicating with the analytics engine.';

  return (
    <div
      style={{ height }}
      className="flex flex-col items-center justify-center text-center p-6 bg-rose-500/5 rounded-xl border border-rose-500/20"
    >
      <div className="p-2.5 rounded-full bg-rose-500/10 text-rose-400 mb-2">
        <AlertCircle size={22} />
      </div>
      <p className="text-xs font-semibold text-rose-400">Unable to load chart data</p>
      <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs">{displayMsg}</p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-medium flex items-center gap-1.5 transition-colors border border-rose-500/30"
        >
          <RefreshCw size={12} />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
};

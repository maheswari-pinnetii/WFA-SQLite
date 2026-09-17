import React from 'react';
import { BarChart2 } from 'lucide-react';

interface ChartEmptyStateProps {
  message?: string;
  height?: number;
}

export const ChartEmptyState: React.FC<ChartEmptyStateProps> = ({
  message = 'No workforce data available for the selected period.',
  height = 220,
}) => {
  return (
    <div
      style={{ height }}
      className="flex flex-col items-center justify-center text-center p-6 bg-slate-900/30 rounded-xl border border-dashed border-slate-700/60"
    >
      <div className="p-3 rounded-full bg-slate-800 text-slate-400 mb-2">
        <BarChart2 size={24} />
      </div>
      <p className="text-xs font-medium text-slate-400 max-w-xs">{message}</p>
    </div>
  );
};

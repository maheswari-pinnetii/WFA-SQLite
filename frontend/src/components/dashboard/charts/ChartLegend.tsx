import React from 'react';
import { ChartSeries } from './chart.types';

interface ChartLegendProps {
  series: ChartSeries[];
  colors?: string[];
}

export const ChartLegend: React.FC<ChartLegendProps> = ({ series, colors = [] }) => {
  if (!series || series.length <= 1) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 pt-3 mt-2 border-t border-[var(--border-color)]/40 text-xs">
      {series.map((item, idx) => (
        <div key={item.key} className="flex items-center gap-1.5 font-medium text-[var(--text-muted)]">
          <span
            className="w-2.5 h-2.5 rounded-full inline-block"
            style={{ backgroundColor: item.color || colors[idx % colors.length] || '#10b981' }}
          />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
};

import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface KpiTrendProps {
  trend?: number;
  direction?: 'up' | 'down' | 'neutral';
  subtitle?: string;
}

export const KpiTrend: React.FC<KpiTrendProps> = ({ trend, direction, subtitle }) => {
  if (trend === undefined && !subtitle) return null;

  const isPositive = direction === 'up' || (trend !== undefined && trend > 0);
  const isNegative = direction === 'down' || (trend !== undefined && trend < 0);

  return (
    <div className="flex items-center gap-1.5 text-xs">
      {trend !== undefined && (
        <span
          className={`inline-flex items-center gap-0.5 font-medium px-2 py-0.5 rounded-md ${
            isPositive
              ? 'bg-emerald-500/10 text-emerald-400'
              : isNegative
              ? 'bg-rose-500/10 text-rose-400'
              : 'bg-slate-500/10 text-slate-400'
          }`}
        >
          {isPositive ? (
            <ArrowUpRight size={14} />
          ) : isNegative ? (
            <ArrowDownRight size={14} />
          ) : (
            <Minus size={14} />
          )}
          {Math.abs(trend)}%
        </span>
      )}
      {subtitle && <span className="text-[var(--text-muted)] truncate">{subtitle}</span>}
    </div>
  );
};

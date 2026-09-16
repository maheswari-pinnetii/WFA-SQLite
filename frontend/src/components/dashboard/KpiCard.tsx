import React from 'react';
import { KpiItemConfig } from './kpi-config';
import { KpiIcon } from './KpiIcon';
import { KpiTrend } from './KpiTrend';
import { KpiSparkline } from './KpiSparkline';
import { KpiSkeleton } from './KpiSkeleton';

interface KpiCardProps {
  config: KpiItemConfig;
  value?: any;
  trend?: number;
  sparklineData?: number[];
  loading?: boolean;
}

export const KpiCard: React.FC<KpiCardProps> = ({ config, value, trend, sparklineData, loading }) => {
  if (loading) {
    return <KpiSkeleton />;
  }

  // Format value or fallback to empty state —
  let formattedValue = '—';

  if (value !== undefined && value !== null && value !== '') {
    if (config.format === 'percentage') {
      formattedValue = typeof value === 'number' ? `${value}%` : `${value}`;
    } else if (config.format === 'number') {
      formattedValue = typeof value === 'number' ? value.toLocaleString() : `${value}`;
    } else if (config.format === 'currency') {
      formattedValue = typeof value === 'number' ? `$${value.toLocaleString()}` : `${value}`;
    } else {
      formattedValue = `${value}`;
    }
  }

  return (
    <div className="group h-[165px] bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-emerald-500/40 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:shadow-emerald-950/10 hover:-translate-y-0.5">
      {/* Top Header: Title Left, Icon Right */}
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider line-clamp-1">
          {config.title}
        </span>
        <KpiIcon icon={config.icon} color={config.color} />
      </div>

      {/* Center: Live Value */}
      <div className="my-auto">
        <div className="text-2xl lg:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
          {formattedValue}
        </div>
      </div>

      {/* Bottom Footer: Trend Left, Sparkline Right */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-[var(--border-color)]/60">
        <KpiTrend trend={trend} subtitle={config.subtitle} />
        <KpiSparkline data={sparklineData} color={config.color} />
      </div>
    </div>
  );
};

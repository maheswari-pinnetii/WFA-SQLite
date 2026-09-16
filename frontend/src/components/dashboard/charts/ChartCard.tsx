import React from 'react';
import { ChartHeader } from './ChartHeader';
import { ChartRenderer } from './ChartRenderer';
import { ChartLegend } from './ChartLegend';
import { ChartSkeleton } from './ChartSkeleton';
import { ChartEmptyState } from './ChartEmptyState';
import { ChartErrorState } from './ChartErrorState';
import { DashboardChartConfig } from './chart.types';

interface ChartCardProps {
  config: DashboardChartConfig;
  data?: any[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  height?: number;
  className?: string;
  actionSlot?: React.ReactNode;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  config,
  data,
  loading = false,
  error = null,
  onRetry,
  height = 280,
  className = '',
  actionSlot,
}) => {
  const hasData = data && data.length > 0;

  return (
    <div
      className={`bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/60 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between ${className}`}
    >
      <div>
        <ChartHeader
          title={config.title}
          subtitle={config.subtitle}
          realtime={config.realtime}
          actionSlot={actionSlot}
        />

        <div className="mt-4 min-h-[200px]">
          {loading ? (
            <ChartSkeleton height={height} />
          ) : error ? (
            <ChartErrorState message={error} onRetry={onRetry} />
          ) : !hasData ? (
            <ChartEmptyState height={height} />
          ) : (
            <ChartRenderer config={config} data={data} height={height} />
          )}
        </div>
      </div>

      {hasData && !loading && !error && config.series.length > 1 && (
        <ChartLegend series={config.series} colors={config.colors} />
      )}
    </div>
  );
};

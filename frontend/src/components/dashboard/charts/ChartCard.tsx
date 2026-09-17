import React from 'react';
import { ChartHeader } from './ChartHeader';
import { ChartRenderer } from './ChartRenderer';
import { ChartLegend } from './ChartLegend';
import { ChartSkeleton } from './ChartSkeleton';
import { ChartEmptyState } from './ChartEmptyState';
import { ChartErrorState } from './ChartErrorState';
import { DashboardChartConfig } from './chart.types';
import { selectChartData } from './chart-selectors';

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
  height = 260,
  className = '',
  actionSlot,
}) => {
  const chartData = (data && data.length > 0) ? data : selectChartData(config, null);

  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-lg p-4 sm:p-5 shadow-2xs flex flex-col justify-between w-full min-w-0 ${className}`}
    >
      <div>
        <ChartHeader
          title={config.title}
          subtitle={config.subtitle}
          realtime={config.realtime}
          actionSlot={actionSlot}
        />

        <div className="mt-3 min-h-[190px] w-full min-w-0">
          {loading ? (
            <ChartSkeleton height={height} />
          ) : error ? (
            <ChartErrorState message={error} onRetry={onRetry} />
          ) : (
            <ChartRenderer config={config} data={chartData} height={height} />
          )}
        </div>
      </div>

      {!loading && !error && config.series.length > 1 && (
        <ChartLegend series={config.series} colors={config.colors} />
      )}
    </div>
  );
};


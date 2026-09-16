import React from 'react';
import { ChartCard } from './ChartCard';
import { ROLE_CHART_CONFIGS } from './chart-config';
import { selectChartData } from './chart-selectors';

interface ChartGridProps {
  role: 'ADMIN' | 'HR' | 'MANAGER' | 'TEAM_LEAD' | 'EMPLOYEE';
  dashboardData?: any;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  className?: string;
}

export const ChartGrid: React.FC<ChartGridProps> = ({
  role,
  dashboardData,
  loading = false,
  error = null,
  onRetry,
  className = '',
}) => {
  const chartConfigs = ROLE_CHART_CONFIGS[role] || ROLE_CHART_CONFIGS.EMPLOYEE;

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6 ${className}`}>
      {chartConfigs.map((config) => {
        const data = selectChartData(config, dashboardData);
        return (
          <ChartCard
            key={config.id}
            config={config}
            data={data}
            loading={loading}
            error={error}
            onRetry={onRetry}
          />
        );
      })}
    </div>
  );
};

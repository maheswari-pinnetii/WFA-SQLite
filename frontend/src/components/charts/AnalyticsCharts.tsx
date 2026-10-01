import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { AnalyticsChartContainer } from '../common/AnalyticsChartContainer';

type ChartRow = Record<string, string | number>;

interface BaseChartProps {
  title: string;
  subtitle?: string;
  data?: ChartRow[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  height?: number;
}

interface Series {
  key: string;
  name: string;
  color: string;
}

const FONT_FAMILY = "'Plus Jakarta Sans', sans-serif";

const tooltipStyle = {
  backgroundColor: 'var(--bg-secondary)',
  borderColor: 'var(--border-color)',
  borderRadius: '8px',
  color: 'var(--text-primary)',
  fontFamily: FONT_FAMILY,
  fontSize: '12px',
};

const tickStyle = {
  fontFamily: FONT_FAMILY,
  fontSize: 12,
};




export const AnalyticsLineChart: React.FC<BaseChartProps & { xKey?: string; series?: Series[] }> = ({
  title,
  subtitle,
  data = [],
  isLoading,
  error,
  onRetry,
  height = 260,
  xKey = 'month',
  series = [{ key: 'headcount', name: 'Value', color: '#10B981' }],
}) => {
  const chartData = data || [];

  return (
    <AnalyticsChartContainer title={title} subtitle={subtitle} isLoading={isLoading} error={error} isEmpty={!data || data.length === 0} onRetry={onRetry} minHeight={height + 100}>
      <div className="w-full min-w-0 min-h-[260px] h-full">
        <ResponsiveContainer width="99%" height={height} minWidth={1}>
          <LineChart data={chartData} margin={{ top: 12, right: 12, left: -18, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color, rgba(255,255,255,0.1))" />
            <XAxis dataKey={xKey} stroke="var(--text-muted, #94A3B8)" tick={tickStyle} />
            <YAxis stroke="var(--text-muted, #94A3B8)" tick={tickStyle} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: '12px', fontFamily: FONT_FAMILY, color: 'var(--text-muted, #94A3B8)' }} />
            {series.map((item) => (
              <Line key={item.key} type="monotone" dataKey={item.key} name={item.name} stroke={item.color || '#20BFB3'} strokeWidth={3} dot={{ r: 3 }} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </AnalyticsChartContainer>
  );
};

export const AnalyticsBarChart: React.FC<BaseChartProps & { xKey?: string; series?: Series[]; layout?: 'horizontal' | 'vertical' }> = ({
  title,
  subtitle,
  data = [],
  isLoading,
  error,
  onRetry,
  height = 260,
  xKey = 'name',
  series = [{ key: 'headcount', name: 'Value', color: '#10B981' }],
  layout = 'horizontal',
}) => {
  const chartData = data || [];

  return (
    <AnalyticsChartContainer title={title} subtitle={subtitle} isLoading={isLoading} error={error} isEmpty={!data || data.length === 0} onRetry={onRetry} minHeight={height + 100}>
      <div className="w-full min-w-0 min-h-[260px] h-full">
        <ResponsiveContainer width="99%" height={height} minWidth={1}>
          <BarChart data={chartData} layout={layout === 'vertical' ? 'vertical' : 'horizontal'} margin={{ top: 12, right: 12, left: layout === 'vertical' ? 36 : -18, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color, rgba(255,255,255,0.1))" />
            {layout === 'vertical' ? (
              <>
                <XAxis type="number" stroke="var(--text-muted, #94A3B8)" tick={tickStyle} />
                <YAxis dataKey={xKey} type="category" width={110} stroke="var(--text-muted, #94A3B8)" tick={{ ...tickStyle, fontSize: 11 }} />
              </>
            ) : (
              <>
                <XAxis dataKey={xKey} stroke="var(--text-muted, #94A3B8)" tick={{ ...tickStyle, fontSize: 11 }} />
                <YAxis stroke="var(--text-muted, #94A3B8)" tick={tickStyle} />
              </>
            )}
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: '12px', fontFamily: FONT_FAMILY, color: 'var(--text-muted, #94A3B8)' }} />
            {series.map((item) => (
              <Bar key={item.key} dataKey={item.key} name={item.name} fill={item.color || '#20BFB3'} radius={[6, 6, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </AnalyticsChartContainer>
  );
};

export const AnalyticsDonutChart: React.FC<BaseChartProps & { nameKey?: string; valueKey?: string; colors?: string[] }> = ({
  title,
  subtitle,
  data = [],
  isLoading,
  error,
  onRetry,
  height = 260,
  nameKey = 'name',
  valueKey = 'value',
  colors = ['#20BFB3', '#0EA5A0', '#5AD8CF', '#10B981', '#3B82F6', '#8B5CF6'],
}) => {
  const chartData = data || [];

  return (
    <AnalyticsChartContainer title={title} subtitle={subtitle} isLoading={isLoading} error={error} isEmpty={!data || data.length === 0} onRetry={onRetry} minHeight={height + 100}>
      <div className="w-full min-w-0 min-h-[260px] h-full">
        <ResponsiveContainer width="99%" height={height} minWidth={1}>
          <PieChart>
            <Pie data={chartData} dataKey={valueKey} nameKey={nameKey} innerRadius={55} outerRadius={85} paddingAngle={4} cx="50%" cy="45%">
              {chartData.map((_, index) => (
                <Cell key={`slice-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend verticalAlign="bottom" height={30} wrapperStyle={{ fontSize: '12px', fontFamily: FONT_FAMILY, color: 'var(--text-muted, #94A3B8)' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </AnalyticsChartContainer>
  );
};

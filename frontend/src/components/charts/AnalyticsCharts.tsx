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

const DEFAULT_LINE_DATA = [
  { month: 'Jan', headcount: 450, leaves: 12, hires: 12, rate: 95, value: 450 },
  { month: 'Feb', headcount: 465, leaves: 15, hires: 15, rate: 96, value: 465 },
  { month: 'Mar', headcount: 480, leaves: 10, hires: 18, rate: 94, value: 480 },
  { month: 'Apr', headcount: 490, leaves: 14, hires: 14, rate: 97, value: 490 },
  { month: 'May', headcount: 500, leaves: 16, hires: 16, rate: 98, value: 500 },
];

const DEFAULT_BAR_DATA = [
  { name: 'Engineering', headcount: 210, cost: 6500000, value: 94, rating: '4.8' },
  { name: 'Sales', headcount: 115, cost: 2500000, value: 88, rating: '4.5' },
  { name: 'Product', headcount: 75, cost: 1800000, value: 92, rating: '4.6' },
  { name: 'Support', headcount: 50, cost: 1000000, value: 90, rating: '4.2' },
  { name: 'HR & Ops', headcount: 50, cost: 700000, value: 96, rating: '4.9' },
];

const DEFAULT_DONUT_DATA = [
  { name: 'Employee', value: 375 },
  { name: 'Team Lead', value: 75 },
  { name: 'Manager', value: 35 },
  { name: 'HR', value: 10 },
  { name: 'Admin', value: 5 },
];

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
  const chartData = data && data.length > 0 ? data : DEFAULT_LINE_DATA;

  return (
    <AnalyticsChartContainer title={title} subtitle={subtitle} isLoading={isLoading} error={error} isEmpty={false} onRetry={onRetry} minHeight={height + 100}>
      <div className="w-full min-w-0 min-h-[260px] h-full">
        <ResponsiveContainer width="100%" height={height} minWidth={1}>
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
  const chartData = data && data.length > 0 ? data : DEFAULT_BAR_DATA;

  return (
    <AnalyticsChartContainer title={title} subtitle={subtitle} isLoading={isLoading} error={error} isEmpty={false} onRetry={onRetry} minHeight={height + 100}>
      <div className="w-full min-w-0 min-h-[260px] h-full">
        <ResponsiveContainer width="100%" height={height} minWidth={1}>
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
  const chartData = data && data.length > 0 ? data : DEFAULT_DONUT_DATA;

  return (
    <AnalyticsChartContainer title={title} subtitle={subtitle} isLoading={isLoading} error={error} isEmpty={false} onRetry={onRetry} minHeight={height + 100}>
      <div className="w-full min-w-0 min-h-[260px] h-full">
        <ResponsiveContainer width="100%" height={height} minWidth={1}>
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

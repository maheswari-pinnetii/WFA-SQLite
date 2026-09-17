import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { DashboardChartConfig } from './chart.types';
import { EMERALD_CHART_COLORS, formatValue } from './chart.utils';

const chartTickStyle = {
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontSize: 12,
  fill: '#64748b',
};

interface ChartRendererProps {
  config: DashboardChartConfig;
  data: any[];
  height?: number;
}

export const ChartRenderer: React.FC<ChartRendererProps> = ({
  config,
  data,
  height = 300,
}) => {
  const colors = config.colors && config.colors.length > 0 ? config.colors : EMERALD_CHART_COLORS;
  const xKey = config.xKey || 'name';

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-slate-900 text-white text-xs p-3 rounded-lg shadow-xl border border-slate-700/50 space-y-1">
        <p className="font-semibold text-slate-300 border-b border-slate-700 pb-1 mb-1">{label}</p>
        {payload.map((entry: any, index: number) => {
          const seriesMatch = config.series.find((s) => s.key === entry.dataKey);
          const unit = seriesMatch?.unit;
          return (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name || seriesMatch?.label || entry.dataKey}:
              </span>
              <span className="font-mono font-medium text-emerald-400">
                {formatValue(entry.value, unit)}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  if (config.type === 'pie' || config.type === 'donut') {
    const isDonut = config.type === 'donut';
    const seriesItem = config.series[0] || { key: 'value', label: 'Value' };
    const valueKey = seriesItem.key;

    return (
      <div className="w-full min-w-0 flex-1" style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height={height} minWidth={1}>
          <PieChart>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => <span className="text-xs text-slate-400 font-medium">{value}</span>}
            />
            <Pie
              data={data}
              dataKey={valueKey}
              nameKey={xKey}
              cx="50%"
              cy="50%"
              innerRadius={isDonut ? 55 : 0}
              outerRadius={85}
              paddingAngle={isDonut ? 4 : 0}
              stroke="#0f172a"
              strokeWidth={2}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 flex-1" style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height={height} minWidth={1}>
        {config.type === 'line' ? (
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
            <XAxis dataKey={xKey} tick={chartTickStyle} stroke="#cbd5e1" />
            <YAxis tick={chartTickStyle} stroke="#cbd5e1" />
            <Tooltip content={<CustomTooltip />} />
            {config.series.map((s, idx) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={s.color || colors[idx % colors.length]}
                strokeWidth={2.5}
                dot={{ r: 3, strokeWidth: 1 }}
                activeDot={{ r: 5, strokeWidth: 2 }}
              />
            ))}
          </LineChart>
        ) : config.type === 'bar' || config.type === 'stacked-bar' ? (
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
            <XAxis dataKey={xKey} tick={chartTickStyle} stroke="#cbd5e1" />
            <YAxis tick={chartTickStyle} stroke="#cbd5e1" />
            <Tooltip content={<CustomTooltip />} />
            {config.series.map((s, idx) => (
              <Bar
                key={s.key}
                dataKey={s.key}
                name={s.label}
                stackId={config.type === 'stacked-bar' ? 'stack' : undefined}
                fill={s.color || colors[idx % colors.length]}
                radius={config.type === 'stacked-bar' ? [0, 0, 0, 0] : [4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        ) : config.type === 'area' ? (
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              {config.series.map((s, idx) => {
                const color = s.color || colors[idx % colors.length];
                return (
                  <linearGradient key={`grad-${s.key}`} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={color} stopOpacity={0.0} />
                  </linearGradient>
                );
              })}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
            <XAxis dataKey={xKey} tick={chartTickStyle} stroke="#cbd5e1" />
            <YAxis tick={chartTickStyle} stroke="#cbd5e1" />
            <Tooltip content={<CustomTooltip />} />
            {config.series.map((s, idx) => (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={s.color || colors[idx % colors.length]}
                fillOpacity={1}
                fill={`url(#grad-${s.key})`}
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        ) : (
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
            <XAxis dataKey={xKey} tick={chartTickStyle} stroke="#cbd5e1" />
            <YAxis tick={chartTickStyle} stroke="#cbd5e1" />
            <Tooltip content={<CustomTooltip />} />
            {config.series.map((s, idx) => {
              const color = s.color || colors[idx % colors.length];
              if (s.type === 'line') {
                return (
                  <Line
                    key={s.key}
                    type="monotone"
                    dataKey={s.key}
                    name={s.label}
                    stroke={color}
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                  />
                );
              }
              if (s.type === 'area') {
                return (
                  <Area
                    key={s.key}
                    type="monotone"
                    dataKey={s.key}
                    name={s.label}
                    stroke={color}
                    fill={color}
                    fillOpacity={0.2}
                  />
                );
              }
              return (
                <Bar key={s.key} dataKey={s.key} name={s.label} fill={color} radius={[4, 4, 0, 0]} />
              );
            })}
          </ComposedChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

import React from 'react';

export type ChartType =
  | 'line'
  | 'bar'
  | 'area'
  | 'stacked-bar'
  | 'pie'
  | 'donut'
  | 'composed';

export interface ChartSeries {
  key: string;
  label: string;
  color?: string;
  type?: 'line' | 'bar' | 'area';
  unit?: string;
}

export interface DashboardChartConfig {
  id: string;
  title: string;
  subtitle?: string;
  type: ChartType;
  xKey?: string;
  series: ChartSeries[];
  realtime?: boolean;
  colors?: string[];
}

export interface ChartCardProps {
  title: string;
  subtitle?: string;
  realtime?: boolean;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  children: React.ReactNode;
  actionSlot?: React.ReactNode;
  className?: string;
}

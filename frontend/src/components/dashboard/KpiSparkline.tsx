import React from 'react';

interface KpiSparklineProps {
  data?: number[];
  color?: 'emerald' | 'cyan' | 'purple' | 'amber' | 'blue' | 'rose' | 'indigo' | 'teal';
}

export const KpiSparkline: React.FC<KpiSparklineProps> = ({ data = [40, 55, 35, 60, 75, 65, 85], color = 'emerald' }) => {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 60;
  const height = 20;

  const points = data
    .map((val, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');

  const strokeColors: Record<string, string> = {
    emerald: '#10b981',
    cyan: '#06b6d4',
    purple: '#a855f7',
    amber: '#f59e0b',
    blue: '#3b82f6',
    rose: '#f43f5e',
    indigo: '#6366f1',
    teal: '#14b8a6',
  };

  const colorHex = strokeColors[color] || strokeColors.emerald;

  return (
    <svg width={width} height={height} className="overflow-visible shrink-0 opacity-80">
      <polyline
        fill="none"
        stroke={colorHex}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};

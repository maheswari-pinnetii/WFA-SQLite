import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export type KPITrend = 'up' | 'down' | 'neutral';
export type KPIColor = 'emerald' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: KPITrend;
  trendValue?: string | number;
  color?: KPIColor;
  onClick?: () => void;
  status?: React.ReactNode;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  color = 'info',
  onClick,
  status
}) => {
  const colorMap = {
    emerald: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400',
    success: 'text-green-500 bg-green-50 dark:bg-green-500/10 dark:text-green-400',
    warning: 'text-amber-500 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400',
    danger: 'text-rose-500 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-400',
    info: 'text-blue-500 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400',
    neutral: 'text-slate-500 bg-slate-50 dark:bg-slate-500/10 dark:text-slate-400',
  };

  const trendIcon = {
    up: <ArrowUpRight size={14} className="text-emerald-500" />,
    down: <ArrowDownRight size={14} className="text-rose-500" />,
    neutral: <Minus size={14} className="text-slate-400" />
  };

  const trendColor = {
    up: 'text-emerald-600 dark:text-emerald-400',
    down: 'text-rose-600 dark:text-rose-400',
    neutral: 'text-slate-500 dark:text-slate-400'
  };

  const baseClasses = "p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between space-y-3 min-w-0";
  const hoverClasses = onClick ? "cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors" : "";

  return (
    <div className={`${baseClasses} ${hoverClasses}`} onClick={onClick}>
      <div className="flex justify-between items-start gap-2 min-w-0">
        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 truncate">{title}</h3>
        <div className={`p-2 rounded-lg shrink-0 flex items-center justify-center ${colorMap[color]}`}>
          {icon}
        </div>
      </div>
      
      <div>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold text-slate-900 dark:text-white">{value}</span>
          {status && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{status}</span>}
        </div>
        
        {(trendValue || subtitle) && (
          <div className="flex items-center gap-2 mt-1.5 text-xs">
            {trend && trendValue && (
              <span className={`flex items-center font-semibold ${trendColor[trend]}`}>
                {trendIcon[trend]}
                <span className="ml-0.5">{trendValue}</span>
              </span>
            )}
            {subtitle && (
              <span className="text-slate-500 dark:text-slate-400">{subtitle}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

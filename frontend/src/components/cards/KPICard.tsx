import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import clsx from 'clsx';

export interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  subtitle?: string;
  icon: React.ReactNode;
  accentColor?: 'blue' | 'emerald' | 'cyan' | 'amber' | 'purple' | 'rose' | 'red';
  isLive?: boolean;
  onClick?: () => void;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  change,
  trend = 'neutral',
  subtitle,
  icon,
  accentColor = 'blue',
  isLive = false,
  onClick
}) => {
  const accentClasses = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    cyan: 'bg-cyan-50 text-cyan-600',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
    rose: 'bg-rose-50 text-rose-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <div
      onClick={onClick}
      className={clsx(
        "rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between shadow-sm transition-all",
        onClick && "cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md"
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <div className={clsx("p-2 rounded-lg flex items-center justify-center", accentClasses[accentColor])}>
              {icon}
            </div>
            {isLive && (
              <span
                className="absolute -top-1 -right-1 flex h-2.5 w-2.5"
                title="Real-time live metric"
                aria-label="Live metric indicator"
              >
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-white dark:border-slate-900"></span>
              </span>
            )}
          </div>
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
            {title}
          </span>
        </div>
        {isLive && (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800" title="Connected to real-time sync">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
          </span>
        )}
      </div>

      <div className="text-[28px] font-semibold tracking-tight text-slate-900 dark:text-slate-100 mb-2 leading-none">
        {value}
      </div>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
        {change !== undefined && (
          <div className={clsx(
            "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium",
            trend === 'up' ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400" :
            trend === 'down' ? "bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400" :
            "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          )}>
            {trend === 'up' && <TrendingUp size={13} />}
            {trend === 'down' && <TrendingDown size={13} />}
            {trend === 'neutral' && <Minus size={13} />}
            {change > 0 ? `+${change}%` : `${change}%`}
          </div>
        )}
        {subtitle && <span className="text-xs font-normal text-slate-500 dark:text-slate-400 truncate max-w-[150px]">{subtitle}</span>}
      </div>
    </div>
  );
};

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
  accentColor = 'emerald',
  isLive = false,
  onClick
}) => {
  const accentClasses = {
    blue: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/40',
    emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/40',
    cyan: 'bg-slate-50 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200/60 dark:border-amber-800/40',
    purple: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/40',
    rose: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200/60 dark:border-rose-800/40',
    red: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200/60 dark:border-rose-800/40',
  };

  return (
    <div
      onClick={onClick}
      className={clsx(
        "rounded-lg border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-4 sm:p-4.5 flex flex-col justify-between shadow-2xs transition-all",
        onClick && "cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs"
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="relative shrink-0">
            <div className={clsx("w-8 h-8 rounded-md border flex items-center justify-center", accentClasses[accentColor])}>
              {React.isValidElement(icon)
                ? React.cloneElement(icon as React.ReactElement<any>, { size: 18 })
                : icon}
            </div>
            {isLive && (
              <span
                className="absolute -top-1 -right-1 flex h-2 w-2"
                title="Real-time live metric"
                aria-label="Live metric indicator"
              >
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            )}
          </div>
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 truncate tracking-wide">
            {title}
          </span>
        </div>
        {isLive && (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/50">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
          </span>
        )}
      </div>

      <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mb-1 leading-tight">
        {value}
      </div>

      <div className="flex items-center justify-between mt-auto pt-2.5 border-t border-slate-100 dark:border-slate-800/60">
        {change !== undefined ? (
          <div className={clsx(
            "inline-flex items-center gap-1 text-[11px] font-medium",
            trend === 'up' ? "text-emerald-600 dark:text-emerald-400" :
            trend === 'down' ? "text-rose-600 dark:text-rose-400" :
            "text-slate-500 dark:text-slate-400"
          )}>
            {trend === 'up' && <TrendingUp size={12} />}
            {trend === 'down' && <TrendingDown size={12} />}
            {trend === 'neutral' && <Minus size={12} />}
            {change > 0 ? `+${change}%` : `${change}%`} vs last period
          </div>
        ) : (
          <span className="text-[11px] font-normal text-slate-400 dark:text-slate-500 truncate">
            {subtitle || 'Standard range'}
          </span>
        )}
        {subtitle && change !== undefined && (
          <span className="text-[11px] font-normal text-slate-400 dark:text-slate-500 truncate max-w-[130px] ml-auto">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};


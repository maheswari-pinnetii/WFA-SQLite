import React from 'react';

export interface MinimalKpiCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBgColor?: 'emerald' | 'blue' | 'amber' | 'rose' | 'purple' | 'indigo' | 'cyan' | 'teal';
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
  isLive?: boolean;
  onClick?: () => void;
}

export const MinimalKpiCard: React.FC<MinimalKpiCardProps> = ({
  title,
  value,
  icon,
  iconBgColor = 'emerald',
  trend,
  trendType = 'positive',
  isLive = false,
  onClick,
}) => {
  const iconStyleMap = {
    emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/40',
    blue: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/40',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200/60 dark:border-amber-800/40',
    rose: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200/60 dark:border-rose-800/40',
    purple: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/40',
    indigo: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/40',
    cyan: 'bg-slate-50 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    teal: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/40',
  };

  const getTrendColor = () => {
    if (trendType === 'positive') return 'text-emerald-600 dark:text-emerald-400';
    if (trendType === 'negative') return 'text-rose-600 dark:text-rose-400';
    return 'text-slate-500 dark:text-slate-400';
  };

  return (
    <div
      onClick={onClick}
      className={`kpi-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-4 sm:p-5 shadow-none transition-all flex items-start justify-between gap-3 ${
        onClick ? 'cursor-pointer hover:border-slate-300 dark:hover:border-slate-700' : 'cursor-default'
      }`}
    >
      {/* Numerical Value & Contextual Title */}
      <div className="flex flex-col justify-between flex-1 min-w-0">
        <span className="text-[13px] font-medium text-slate-600 dark:text-slate-400 truncate tracking-wide">
          {title}
        </span>
        
        <div className="text-[26px] font-[650] leading-[32px] text-slate-900 dark:text-slate-50 tracking-tight truncate my-1">
          {value}
        </div>

        {trend ? (
          <span className={`text-[12px] font-normal truncate ${getTrendColor()}`}>
            {trend}
          </span>
        ) : (
          <span className="text-[12px] font-normal text-slate-400 dark:text-slate-500 truncate">
            Standard scope
          </span>
        )}
      </div>

      {/* Functional 20px Icon Container */}
      <div className="relative shrink-0 mt-0.5">
        <div
          className={`w-9 h-9 rounded-md flex items-center justify-center border ${iconStyleMap[iconBgColor]}`}
        >
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
    </div>
  );
};


import React from 'react';

export interface MinimalKpiCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBgColor?: 'emerald' | 'blue' | 'amber' | 'rose' | 'purple' | 'indigo' | 'cyan' | 'teal';
  trend?: string;
  trendType?: 'positive' | 'negative';
  isLive?: boolean;
  onClick?: () => void;
}

export const MinimalKpiCard: React.FC<MinimalKpiCardProps> = ({
  title,
  value,
  icon,
  iconBgColor = 'blue',
  trend,
  trendType = 'positive',
  isLive = false,
  onClick,
}) => {
  const iconStyleMap = {
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/50',
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border-blue-100 dark:border-blue-800/50',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border-amber-100 dark:border-amber-800/50',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border-rose-100 dark:border-rose-800/50',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 border-purple-100 dark:border-purple-800/50',
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800/50',
    cyan: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-950/60 dark:text-cyan-400 border-cyan-100 dark:border-cyan-800/50',
    teal: 'bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400 border-teal-100 dark:border-teal-800/50',
  };

  return (
    <div
      onClick={onClick}
      className={`kpi-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-sm transition-all flex items-center justify-between gap-4 ${
        onClick ? 'cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md' : 'cursor-default'
      }`}
    >
      {/* Functional Icon Container with Live Status */}
      <div className="relative shrink-0">
        <div
          className={`w-11 h-11 rounded-lg flex items-center justify-center border ${iconStyleMap[iconBgColor]}`}
        >
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

      {/* Numerical Value & Contextual Title */}
      <div className="text-right space-y-0.5 flex-1 min-w-0">
        <h3 className="text-2xl lg:text-3xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight truncate">
          {value}
        </h3>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
          {title}
        </p>

        {trend && (
          <p
            className={`text-xs font-medium pt-0.5 ${
              trendType === 'positive' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {trend}
          </p>
        )}
      </div>
    </div>
  );
};

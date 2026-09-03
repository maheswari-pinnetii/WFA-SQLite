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
        "rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between transition-shadow",
        onClick && "cursor-pointer hover:shadow-md hover:border-blue-200"
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={clsx("p-2.5 rounded-lg flex items-center justify-center shrink-0", accentClasses[accentColor])}>
            {icon}
          </div>
          <span className="text-[14px] font-semibold text-slate-700">
            {title}
          </span>
        </div>
      </div>

      <div className="text-[28px] font-bold tracking-tight text-slate-900 mb-2 leading-none">
        {value}
      </div>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
        {change !== undefined && (
          <div className={clsx(
            "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[12px] font-semibold",
            trend === 'up' ? "bg-emerald-50 text-emerald-700" :
            trend === 'down' ? "bg-red-50 text-red-700" :
            "bg-slate-50 text-slate-700"
          )}>
            {trend === 'up' && <TrendingUp size={14} />}
            {trend === 'down' && <TrendingDown size={14} />}
            {trend === 'neutral' && <Minus size={14} />}
            {change > 0 ? `+${change}%` : `${change}%`}
          </div>
        )}
        {subtitle && <span className="text-[12px] font-medium text-slate-500 truncate max-w-[150px]">{subtitle}</span>}
      </div>
    </div>
  );
};

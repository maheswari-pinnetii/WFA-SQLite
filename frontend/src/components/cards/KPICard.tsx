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
  isLive = false,
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className={clsx(
        "relative p-[1px] rounded-[24px] bg-[linear-gradient(135deg,rgba(32,191,179,0.45),rgba(32,191,179,0.10)_50%,rgba(32,191,179,0.35))] transition-all duration-240",
        onClick ? "cursor-pointer" : "cursor-default"
      )}
    >
      <div className="relative min-h-[165px] h-full w-full p-5 sm:p-6 rounded-[23px] bg-[radial-gradient(220px_circle_at_95%_5%,rgba(32,191,179,0.32),transparent_75%),linear-gradient(145deg,#131C24_0%,#0D131A_100%)] shadow-[0_14px_30px_rgba(0,0,0,0.35)] hover:bg-[radial-gradient(260px_circle_at_90%_5%,rgba(32,191,179,0.55),rgba(14,165,160,0.25)_55%,transparent_85%),linear-gradient(145deg,#15202A_0%,#0E161F_100%)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.45),0_0_25px_rgba(32,191,179,0.22)] hover:-translate-y-1 transition-all duration-240 text-white flex flex-col justify-between overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="relative w-11 h-11 rounded-full flex items-center justify-center bg-[linear-gradient(135deg,#00C49F_0%,#20BFB3_100%)] shadow-[0_0_20px_rgba(32,191,179,0.6),0_4px_12px_rgba(32,191,179,0.35)] text-white hover:scale-105 transition-transform">
            {React.isValidElement(icon)
              ? React.cloneElement(icon as React.ReactElement<any>, { size: 22, color: '#FFFFFF' })
              : icon}
            {isLive && (
              <span
                className="absolute -top-1 -right-1 flex h-2.5 w-2.5"
                title="Real-time live metric"
                aria-label="Live metric indicator"
              >
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
              </span>
            )}
          </div>
          {isLive && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-emerald-950/60 text-[#20BFB3] border border-emerald-800/50">
              <span className="w-1.5 h-1.5 rounded-full bg-[#20BFB3] animate-pulse" /> Live
            </span>
          )}
        </div>

        <div className="mt-auto">
          <div className="text-[1.75rem] font-[800] leading-tight text-white tracking-tight truncate mb-1">
            {value}
          </div>

          <span className="text-[0.82rem] font-[600] text-[#CBD5E1] truncate block mb-1">
            {title}
          </span>

          <div className="flex items-center justify-between mt-1 pt-2 border-t border-slate-800/60">
            {change !== undefined ? (
              <div className={clsx(
                "inline-flex items-center gap-1 text-[0.78rem] font-[500]",
                trend === 'up' ? "text-[#20BFB3]" :
                trend === 'down' ? "text-rose-400" :
                "text-[#94A3B8]"
              )}>
                {trend === 'up' && <TrendingUp size={14} />}
                {trend === 'down' && <TrendingDown size={14} />}
                {trend === 'neutral' && <Minus size={14} />}
                {change > 0 ? `+${change}%` : `${change}%`} vs last period
              </div>
            ) : (
              <span className="text-[0.78rem] font-[500] text-[#94A3B8] truncate">
                {subtitle || 'Standard range'}
              </span>
            )}
            {subtitle && change !== undefined && (
              <span className="text-[0.78rem] font-[500] text-[#94A3B8] truncate max-w-[130px] ml-auto">
                {subtitle}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


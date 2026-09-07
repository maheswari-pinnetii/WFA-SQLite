import * as React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { cn } from '../../lib/utils';

// Tremor Delta Badge
export function DeltaBadge({
  deltaType = 'increase',
  value,
  className,
}: {
  deltaType?: 'increase' | 'decrease' | 'moderateIncrease' | 'moderateDecrease' | 'unchanged';
  value: string | number;
  className?: string;
}) {
  const isPositive = deltaType === 'increase' || deltaType === 'moderateIncrease';
  const isNegative = deltaType === 'decrease' || deltaType === 'moderateDecrease';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold',
        isPositive && 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
        isNegative && 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
        !isPositive && !isNegative && 'bg-slate-500/10 text-slate-400 border border-slate-500/20',
        className
      )}
    >
      {isPositive && <ArrowUpRight size={14} className="stroke-[2.5]" />}
      {isNegative && <ArrowDownRight size={14} className="stroke-[2.5]" />}
      {!isPositive && !isNegative && <Minus size={14} className="stroke-[2.5]" />}
      <span>{value}</span>
    </span>
  );
}

// Tremor Callout Banner
export function Callout({
  title,
  icon,
  variant = 'default',
  className,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error';
  className?: string;
  children?: React.ReactNode;
}) {
  const variantStyles = {
    default: 'bg-blue-950/40 border-blue-800/50 text-blue-300',
    success: 'bg-emerald-950/40 border-emerald-800/50 text-emerald-300',
    warning: 'bg-amber-950/40 border-amber-800/50 text-amber-300',
    error: 'bg-rose-950/40 border-rose-800/50 text-rose-300',
  };

  const defaultIcons = {
    default: <Info size={18} className="text-blue-400 shrink-0" />,
    success: <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />,
    warning: <AlertCircle size={18} className="text-amber-400 shrink-0" />,
    error: <AlertCircle size={18} className="text-rose-400 shrink-0" />,
  };

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-xl border p-4 text-xs backdrop-blur-md',
        variantStyles[variant],
        className
      )}
    >
      {icon || defaultIcons[variant]}
      <div className="space-y-1">
        <h5 className="font-bold text-white text-sm leading-none">{title}</h5>
        {children && <div className="text-slate-300 leading-relaxed">{children}</div>}
      </div>
    </div>
  );
}

// Tremor Progress Bar
export function ProgressBar({
  value = 0,
  max = 100,
  color = 'blue',
  showLabel = false,
  className,
}: {
  value: number;
  max?: number;
  color?: 'blue' | 'emerald' | 'amber' | 'rose' | 'purple';
  showLabel?: boolean;
  className?: string;
}) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const colorStyles = {
    blue: 'bg-blue-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    purple: 'bg-purple-500',
  };

  return (
    <div className={cn('w-full space-y-1.5', className)}>
      {showLabel && (
        <div className="flex justify-between text-xs font-semibold text-slate-400">
          <span>Progress</span>
          <span>{percentage.toFixed(0)}%</span>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
        <div
          className={cn('h-full transition-all duration-500 ease-out rounded-full', colorStyles[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

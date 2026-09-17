import React from 'react';
import { AlertTriangle, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface ExceptionItem {
  id: string;
  title: string;
  subtitle: string;
  count: number;
  severity: 'critical' | 'warning' | 'info';
  actionLabel?: string;
  actionPath?: string;
  onClick?: () => void;
}

interface ExceptionsSectionProps {
  items: ExceptionItem[];
  title?: string;
  className?: string;
}

export const ExceptionsSection: React.FC<ExceptionsSectionProps> = ({
  items,
  title = 'Attention Required',
  className = '',
}) => {
  if (!items || items.length === 0) {
    return (
      <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 flex items-center justify-between gap-3 text-slate-600 dark:text-slate-400 ${className}`}>
        <div className="flex items-center gap-2 text-xs font-medium">
          <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
          <span>No operational exceptions or pending action items. All workflows are in order.</span>
        </div>
      </div>
    );
  }

  const getSeverityBadge = (severity: ExceptionItem['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200 dark:border-rose-800';
      case 'warning':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      default:
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border-blue-200 dark:border-blue-800';
    }
  };

  return (
    <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-2xs space-y-3 ${className}`}>
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <AlertTriangle size={14} className="text-amber-500" />
          {title}
        </h3>
        <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
          {items.length} items requiring review
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={item.onClick}
            className={`p-3 rounded-md border flex items-start justify-between gap-3 transition-colors ${getSeverityBadge(item.severity)} ${item.onClick ? 'cursor-pointer hover:opacity-90' : ''}`}
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold truncate">
                  {item.title}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-white/80 dark:bg-slate-900/80 shadow-2xs">
                  {item.count}
                </span>
              </div>
              <p className="text-[11px] opacity-80 mt-0.5 truncate">
                {item.subtitle}
              </p>
            </div>

            {item.actionPath ? (
              <Link
                to={item.actionPath}
                className="text-[11px] font-medium flex items-center gap-0.5 shrink-0 hover:underline mt-0.5"
              >
                {item.actionLabel || 'View'}
                <ArrowRight size={12} />
              </Link>
            ) : item.onClick ? (
              <span className="text-[11px] font-medium flex items-center gap-0.5 shrink-0 mt-0.5">
                {item.actionLabel || 'View'}
                <ArrowRight size={12} />
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
};

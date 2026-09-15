import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface DashboardHeaderProps {
  breadcrumbs: BreadcrumbItem[];
  title: string;
  badge?: React.ReactNode;
  description: string;
  lastUpdated?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  primaryAction?: React.ReactNode;
  secondaryAction?: React.ReactNode;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  breadcrumbs,
  title,
  badge,
  description,
  lastUpdated,
  onRefresh,
  isRefreshing,
  primaryAction,
  secondaryAction
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
      <div className="space-y-2">
        {/* Breadcrumb */}
        <nav className="flex text-xs font-medium text-slate-500 dark:text-slate-400">
          <ol className="flex items-center space-x-2">
            {breadcrumbs.map((item, index) => (
              <li key={item.label} className="flex items-center">
                {index > 0 && <span className="mx-2 text-slate-400 dark:text-slate-600">/</span>}
                {item.href ? (
                  <Link to={item.href} className="hover:text-emerald-500 transition-colors">
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-slate-700 dark:text-slate-300">{item.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>

        {/* Title and Description */}
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h1>
            {badge && (
              <div className="mt-1">
                {badge}
              </div>
            )}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            {description}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-end gap-3 w-full md:w-auto">
        <div className="flex items-center gap-2 self-start md:self-auto">
          {lastUpdated && (
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500 mr-2 whitespace-nowrap">
              Last updated {lastUpdated}
            </span>
          )}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
              title="Refresh Dashboard"
            >
              <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {secondaryAction}
          {primaryAction}
        </div>
      </div>
    </div>
  );
};

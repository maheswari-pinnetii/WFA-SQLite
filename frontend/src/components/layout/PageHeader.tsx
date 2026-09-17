import React from 'react';
import { Breadcrumbs } from '../common/Breadcrumbs';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  showBreadcrumbs?: boolean;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  actions,
  showBreadcrumbs = true,
  className = '',
}) => {
  return (
    <div className={`space-y-2 pb-2 border-b border-slate-200 dark:border-slate-800 ${className}`}>
      {showBreadcrumbs && (
        <div className="mb-2">
          <Breadcrumbs />
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[24px] sm:text-[28px] font-[650] leading-[32px] sm:leading-[36px] tracking-tight text-slate-900 dark:text-slate-50">
            {title}
          </h1>
          {description && (
            <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1 max-w-3xl leading-[19px]">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

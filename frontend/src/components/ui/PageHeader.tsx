import React from 'react';
import { Breadcrumbs, Typography } from '@mui/material';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description, breadcrumbs, actions }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
      <div className="flex flex-col gap-1.5">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumbs 
            separator={<ChevronRight className="w-3 h-3 text-slate-400" />} 
            aria-label="breadcrumb"
            className="mb-1"
          >
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return isLast || !crumb.href ? (
                <Typography key={index} className="text-[13px] font-medium text-slate-500">
                  {crumb.label}
                </Typography>
              ) : (
                <Link key={index} to={crumb.href} className="text-[13px] font-medium text-slate-500 hover:text-slate-800 transition-colors">
                  {crumb.label}
                </Link>
              );
            })}
          </Breadcrumbs>
        )}
        <h1 className="text-[28px] font-bold text-slate-900 tracking-tight leading-none">{title}</h1>
        {description && (
          <p className="text-[14px] text-slate-500 mt-1">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-3 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
};

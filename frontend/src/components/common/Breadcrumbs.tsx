import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  path: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

const ROUTE_NAME_MAP: Record<string, string> = {
  admin: 'Admin',
  hr: 'HR Operations',
  manager: 'Manager',
  'team-lead': 'Team Lead',
  employee: 'Employee',
  sprints: 'Sprints',
  team: 'Team Members',
  tasks: 'Task Management',
  work: 'My Work',
  attendance: 'Attendance',
  leave: 'Leave Management',
  payroll: 'Payroll',
  analytics: 'Analytics',
  reports: 'Reports',
  settings: 'Settings',
  profile: 'Profile',
};

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
  const location = useLocation();

  const computedItems = React.useMemo(() => {
    if (items && items.length > 0) return items;

    const segments = location.pathname.split('/').filter(Boolean);
    if (segments.length === 0) return [{ label: 'Dashboard', path: '/dashboard' }];

    return segments.map((seg, idx) => {
      const url = `/${segments.slice(0, idx + 1).join('/')}`;
      const label = ROUTE_NAME_MAP[seg.toLowerCase()] || 
        seg.charAt(0).toUpperCase() + seg.slice(1).replace(/[-_]/g, ' ');

      return { label, path: url };
    });
  }, [items, location.pathname]);

  return (
    <nav aria-label="Breadcrumb" className={`flex items-center gap-1.5 text-xs min-w-0 ${className}`}>
      <Link
        to="/"
        className="text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center transition-colors shrink-0"
        title="Home"
      >
        <Home size={14} />
      </Link>

      {computedItems.map((item, idx) => {
        const isLast = idx === computedItems.length - 1;

        return (
          <React.Fragment key={item.path + idx}>
            <ChevronRight size={13} className="text-slate-400 dark:text-slate-600 shrink-0" />
            {isLast ? (
              <span
                aria-current="page"
                className="font-medium text-slate-800 dark:text-slate-100 truncate max-w-[150px]"
              >
                {item.label}
              </span>
            ) : (
              <Link
                to={item.path}
                className="text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 truncate max-w-[130px] transition-colors"
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

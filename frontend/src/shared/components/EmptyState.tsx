import React from 'react';
import { Inbox, RefreshCw } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  compact?: boolean;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  compact = false,
  className = ''
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center rounded-2xl border border-dashed border-[var(--border-color)] bg-[var(--bg-tertiary)]/40 ${
        compact ? 'p-6' : 'p-10 md:p-14'
      } ${className}`}
    >
      <div className="p-3.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--role-primary,var(--primary-color,#3b82f6))] shadow-sm mb-3.5 flex items-center justify-center">
        {icon || <Inbox size={compact ? 24 : 32} className="opacity-80" />}
      </div>

      <h3 className={`font-bold text-[var(--text-primary)] ${compact ? 'text-sm' : 'text-base'}`}>
        {title}
      </h3>

      {description && (
        <p className={`text-[var(--text-secondary)] mt-1.5 max-w-sm ${compact ? 'text-xs' : 'text-xs md:text-sm'}`}>
          {description}
        </p>
      )}

      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
        >
          {action.icon || <RefreshCw size={14} />}
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;

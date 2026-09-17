import React from 'react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  badgeText?: string;
  badgeVariant?: 'blue' | 'emerald' | 'amber' | 'purple' | 'rose';
  isLoading?: boolean;
  error?: string | null;
  isEmpty?: boolean;
  onRetry?: () => void;
  children: React.ReactNode;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  badgeText,
  badgeVariant = 'emerald',
  isLoading = false,
  error = null,
  isEmpty = false,
  onRetry,
  children,
}) => {
  const getBadgeClass = () => {
    switch (badgeVariant) {
      case 'amber':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20';
      case 'rose':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20';
      default:
        return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20';
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="w-full h-full flex flex-col justify-center space-y-4 animate-pulse py-8">
          <div className="h-4 bg-[var(--bg-tertiary)] rounded w-1/3"></div>
          <div className="h-36 bg-[var(--bg-tertiary)] rounded-xl w-full"></div>
          <div className="h-3 bg-[var(--bg-tertiary)] rounded w-2/3"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center text-center py-10 space-y-3">
          <div className="text-rose-600 dark:text-rose-400 text-sm font-semibold bg-rose-500/10 p-4 rounded-xl border border-rose-500/20 max-w-md">
            {error}
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all"
            >
              Retry Loading
            </button>
          )}
        </div>
      );
    }

    if (isEmpty) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center text-center py-12 text-[var(--text-muted)] space-y-2">
          <svg className="w-10 h-10 text-[var(--text-muted)] opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 13h6m-3-3v6m-9 1V4a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          <p className="text-sm font-bold text-[var(--text-primary)]">No Analytics Data Available</p>
          <p className="text-xs text-[var(--text-muted)]">There is no matching information for this period.</p>
        </div>
      );
    }

    return children;
  };

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 min-h-[360px] flex flex-col justify-between shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-[var(--text-primary)] font-heading tracking-tight">{title}</h3>
          {subtitle && <p className="text-xs text-[var(--text-muted)] mt-0.5 font-body">{subtitle}</p>}
        </div>
        {badgeText && (
          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getBadgeClass()}`}>
            {badgeText}
          </span>
        )}
      </div>

      <div className="w-full flex-1 flex flex-col justify-center">{renderContent()}</div>
    </div>
  );
};


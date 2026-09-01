import * as React from 'react';
import { cn } from '../../lib/utils';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'away' | 'busy';
}

export function Avatar({
  src,
  alt = 'Avatar',
  fallback,
  size = 'md',
  status,
  className,
  ...props
}: AvatarProps) {
  const [imageError, setImageError] = React.useState(false);

  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg',
  };

  const statusColors = {
    online: 'bg-emerald-500',
    offline: 'bg-slate-500',
    away: 'bg-amber-500',
    busy: 'bg-rose-500',
  };

  const statusSizes = {
    sm: 'h-2 w-2 ring-1',
    md: 'h-2.5 w-2.5 ring-2',
    lg: 'h-3 w-3 ring-2',
    xl: 'h-3.5 w-3.5 ring-2',
  };

  return (
    <div
      className={cn(
        'relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full bg-slate-800 font-bold text-slate-200 border border-slate-700 shadow-sm',
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {src && !imageError ? (
        <img
          src={src}
          alt={alt}
          onError={() => setImageError(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span>{fallback || alt.slice(0, 2).toUpperCase()}</span>
      )}

      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full ring-slate-900',
            statusColors[status],
            statusSizes[size]
          )}
        />
      )}
    </div>
  );
}

export function AvatarGroup({
  children,
  className,
  max,
}: {
  children: React.ReactNode;
  className?: string;
  max?: number;
}) {
  const array = React.Children.toArray(children);
  const visible = max ? array.slice(0, max) : array;
  const remaining = max ? array.length - max : 0;

  return (
    <div className={cn('flex items-center -space-x-3 overflow-hidden', className)}>
      {visible.map((child, index) => (
        <div key={index} className="ring-2 ring-slate-900 rounded-full">
          {child}
        </div>
      ))}
      {remaining > 0 && (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-xs font-black text-slate-300 ring-2 ring-slate-900 border border-slate-700">
          +{remaining}
        </div>
      )}
    </div>
  );
}

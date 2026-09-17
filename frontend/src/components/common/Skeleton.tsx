import React from 'react';

interface SkeletonProps {
  className?: string;
  type?: 'text' | 'circular' | 'rectangular';
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', type = 'text' }) => {
  let shapeClass = 'rounded-md';
  if (type === 'circular') shapeClass = 'rounded-full';
  if (type === 'rectangular') shapeClass = 'rounded-xl';

  return (
    <div className={`animate-pulse bg-slate-800/50 ${shapeClass} ${className}`} />
  );
};

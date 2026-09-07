import React from 'react';
import { Skeleton } from '@mui/material';
import clsx from 'clsx';

export const KPISkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={clsx("rounded-xl border border-slate-200 bg-white p-5", className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Skeleton variant="rounded" width={40} height={40} />
          <Skeleton variant="text" width={100} height={20} />
        </div>
      </div>
      <Skeleton variant="text" width={140} height={48} className="mb-2" />
      <div className="flex items-center gap-2">
        <Skeleton variant="rounded" width={60} height={24} />
        <Skeleton variant="text" width={100} height={16} />
      </div>
    </div>
  );
};

import React from 'react';
import { Skeleton } from '@mui/material';

export const TableSkeleton: React.FC<{ columns?: number; rows?: number }> = ({ columns = 4, rows = 5 }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-200">
              {Array.from({ length: columns }).map((_, idx) => (
                <th key={idx} className="px-4 py-3">
                  <Skeleton variant="text" width="60%" height={24} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {Array.from({ length: rows }).map((_, rowIdx) => (
              <tr key={rowIdx}>
                {Array.from({ length: columns }).map((_, colIdx) => (
                  <td key={colIdx} className="px-4 py-3.5">
                    <Skeleton variant="text" width="80%" height={20} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

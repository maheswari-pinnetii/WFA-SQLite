import React from 'react';
import { Search, Filter } from 'lucide-react';
import clsx from 'clsx';
import { TableSkeleton } from './TableSkeleton';

interface DataTableProps {
  columns: Array<{ key: string; label: string; render?: (row: any) => React.ReactNode; align?: 'left' | 'right' | 'center' }>;
  data: any[];
  isLoading?: boolean;
  emptyState?: React.ReactNode;
  onRowClick?: (row: any) => void;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
}

export const DataTable: React.FC<DataTableProps> = ({ 
  columns, 
  data, 
  isLoading, 
  emptyState, 
  onRowClick,
  searchPlaceholder,
  onSearch
}) => {
  if (isLoading) {
    return <TableSkeleton columns={columns.length} rows={5} />;
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col">
      {onSearch && (
        <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder={searchPlaceholder || "Search..."} 
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 text-[13px] font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <Filter className="w-3.5 h-3.5" />
            Filter
          </button>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-200">
              {columns.map((col, idx) => (
                <th 
                  key={col.key || idx} 
                  className={clsx(
                    "px-4 py-3 text-[12px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap",
                    col.align === 'right' && "text-right",
                    col.align === 'center' && "text-center"
                  )}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-[13px] text-slate-500">
                  {emptyState || "No records found."}
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr 
                  key={row.id || rowIdx} 
                  onClick={() => onRowClick?.(row)}
                  className={clsx(
                    "group transition-colors",
                    onRowClick ? "cursor-pointer hover:bg-slate-50/80" : ""
                  )}
                >
                  {columns.map((col, colIdx) => (
                    <td 
                      key={col.key || colIdx} 
                      className={clsx(
                        "px-4 py-3.5 text-[13px] text-slate-700",
                        col.align === 'right' && "text-right",
                        col.align === 'center' && "text-center"
                      )}
                    >
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

import React from 'react';
import { ColumnDefinition, Column } from '../types/common.types';

export type { Column };

export interface DataTableProps<T> {
  columns: ColumnDefinition<T>[];
  data: T[];
  keyExtractor?: (item: T) => string;
  emptyMessage?: string;
  searchPlaceholder?: string;
  searchFilter?: (item: T, query: string) => boolean;
  
  // Advanced features (Phase 10)
  page?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onSort?: (key: string) => void;
  sortKey?: string;
  sortDir?: 'asc' | 'desc';
  onExport?: () => void;
  isExporting?: boolean;
}

import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, Download, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from './Button';

export function DataTable<T>({
  columns,
  data,
  keyExtractor = (item: any) => item.id || JSON.stringify(item),
  emptyMessage = 'No records found.',
  page,
  pageSize,
  totalCount,
  totalPages,
  onPageChange,
  onPageSizeChange,
  onSort,
  sortKey,
  sortDir,
  onExport,
  isExporting = false,
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 text-xs font-semibold glass-panel">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-hidden flex flex-col gap-3">
      {onExport && (
        <div className="flex justify-end px-1">
          <Button 
            variant="outline" 
            size="sm" 
            icon={<Download size={14} />} 
            onClick={onExport} 
            disabled={isExporting || data.length === 0}
          >
            {isExporting ? 'Exporting...' : 'Export to CSV'}
          </Button>
        </div>
      )}
      
      <div className="w-full overflow-x-auto max-h-[65vh] overflow-y-auto border border-slate-800 rounded-md bg-[var(--bg-card)]">
        <table className="w-full min-w-[1200px] text-left text-sm">
          <thead className="sticky top-0 z-10 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-b border-[var(--border-color)] text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap">
            <tr>
              {columns.map((col, idx) => (
                <th 
                  key={col.key || col.accessorKey || idx} 
                  className={`py-3.5 px-4 ${onSort && col.accessorKey ? 'cursor-pointer hover:text-[var(--text-primary)] transition-colors' : ''}`}
                  onClick={() => {
                    if (onSort && col.accessorKey) onSort(col.accessorKey);
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    {col.header}
                    {sortKey === col.accessorKey && (
                      sortDir === 'asc' ? <ArrowUp size={12} className="text-emerald-500" /> : <ArrowDown size={12} className="text-emerald-500" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {data.map((item) => (
              <tr key={keyExtractor(item)} className="hover:bg-slate-800/20 transition-colors">
                {columns.map((col, idx) => {
                  const val = col.accessorKey ? (item as any)[col.accessorKey] : undefined;
                  let rendered: React.ReactNode = null;

                  if (col.cell) {
                    rendered = (col.cell as any)(item, { row: { original: item }, getValue: () => val });
                  } else if (col.render) {
                    rendered = col.render(item);
                  } else {
                    rendered = val ?? (col.key ? (item as any)[col.key] : '');
                  }

                  return (
                    <td key={col.key || col.accessorKey || idx} className="py-3.5 px-4 text-slate-200 whitespace-nowrap">
                      {rendered}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages !== undefined && page !== undefined && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 text-xs text-slate-400 pt-2">
          {totalCount !== undefined && pageSize !== undefined ? (
            <span>
              Showing <strong className="text-[var(--text-primary)]">{((page - 1) * pageSize) + 1}</strong> to{' '}
              <strong className="text-[var(--text-primary)]">{Math.min(page * pageSize, totalCount).toLocaleString()}</strong> of{' '}
              <strong className="text-[var(--text-primary)]">{totalCount.toLocaleString()}</strong> records
            </span>
          ) : (
            <span>Page {page} of {totalPages}</span>
          )}

          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange?.(1)}
              disabled={page === 1}
              className="p-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-30 transition-colors"
              title="First Page"
            >
              <ChevronsLeft size={16} />
            </button>

            <button
              onClick={() => onPageChange?.(Math.max(page - 1, 1))}
              disabled={page === 1}
              className="p-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-30 transition-colors"
              title="Previous Page"
            >
              <ChevronLeft size={16} />
            </button>

            <span className="font-medium text-xs text-slate-700 dark:text-slate-300 px-3">
              Page {page.toLocaleString()} of {totalPages.toLocaleString()}
            </span>

            <button
              onClick={() => onPageChange?.(Math.min(page + 1, totalPages))}
              disabled={page === totalPages}
              className="p-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-30 transition-colors"
              title="Next Page"
            >
              <ChevronRight size={16} />
            </button>

            <button
              onClick={() => onPageChange?.(totalPages)}
              disabled={page === totalPages}
              className="p-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-30 transition-colors"
              title="Last Page"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

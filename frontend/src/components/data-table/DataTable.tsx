import React, { useState, useMemo } from 'react';
import { DataTableToolbar, FilterOption } from './DataTableToolbar';
import { DataTablePagination } from './DataTablePagination';
import { DataTableEmptyState } from './DataTableEmptyState';

export interface ColumnDef<T> {
  key: string;
  header: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  cell: (row: T, index: number) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  emptyMessage?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchFilter?: (row: T, query: string) => boolean;
  filters?: FilterOption[];
  actionSlot?: React.ReactNode;
  onExportCsv?: () => void;
  pageSizeOptions?: number[];
  initialPageSize?: number;
  className?: string;
}

export function DataTable<T extends { id?: string | number }>({
  columns,
  data,
  loading = false,
  error = null,
  onRetry,
  emptyMessage,
  searchable = true,
  searchPlaceholder = 'Search records...',
  searchFilter,
  filters = [],
  actionSlot,
  onExportCsv,
  pageSizeOptions = [10, 25, 50, 100],
  initialPageSize = 10,
  className = '',
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const filteredData = useMemo(() => {
    if (!data) return [];
    if (!searchQuery.trim()) return data;

    if (searchFilter) {
      return data.filter((row) => searchFilter(row, searchQuery));
    }

    const queryLower = searchQuery.toLowerCase();
    return data.filter((row) =>
      Object.values(row as Record<string, any>).some((val) =>
        String(val ?? '').toLowerCase().includes(queryLower)
      )
    );
  }, [data, searchQuery, searchFilter]);

  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;

    return [...filteredData].sort((a: any, b: any) => {
      const valA = a[sortKey];
      const valB = b[sortKey];

      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }

      return sortOrder === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [filteredData, sortKey, sortOrder]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, page, pageSize]);

  const handleSort = (key: string, sortable?: boolean) => {
    if (!sortable) return;
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  return (
    <div className={`space-y-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm ${className}`}>
      {(searchable || filters.length > 0 || actionSlot || onExportCsv) && (
        <DataTableToolbar
          searchQuery={searchable ? searchQuery : undefined}
          onSearchChange={searchable ? (q) => { setSearchQuery(q); setPage(1); } : undefined}
          searchPlaceholder={searchPlaceholder}
          filters={filters}
          actionSlot={actionSlot}
          onExportCsv={onExportCsv}
        />
      )}

      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 min-w-0">
        <table className="w-full text-left text-xs min-w-[750px]">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 uppercase font-semibold text-[11px] tracking-wider">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  onClick={() => handleSort(col.key, col.sortable)}
                  className={`py-3 px-4 ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'} ${col.sortable ? 'cursor-pointer select-none hover:text-emerald-500' : ''}`}
                >
                  {col.header}
                  {col.sortable && sortKey === col.key && (
                    <span className="ml-1 font-mono text-emerald-500">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading || error || paginatedData.length === 0 ? (
              <DataTableEmptyState
                loading={loading}
                error={error}
                emptyMessage={emptyMessage}
                onRetry={onRetry}
                colSpan={columns.length}
              />
            ) : (
              paginatedData.map((row, idx) => (
                <tr key={row.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  {columns.map((col) => (
                    <td key={col.key} className={`py-3 px-4 ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'}`}>
                      {col.cell(row, idx)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && !error && sortedData.length > 0 && (
        <DataTablePagination
          page={page}
          pageSize={pageSize}
          totalCount={sortedData.length}
          onPageChange={setPage}
          onPageSizeChange={(sz) => { setPageSize(sz); setPage(1); }}
          pageSizeOptions={pageSizeOptions}
        />
      )}
    </div>
  );
}

import React from 'react';
import { Search, Filter, Download } from 'lucide-react';

export interface FilterOption {
  key: string;
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (val: string) => void;
}

interface DataTableToolbarProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchPlaceholder?: string;
  filters?: FilterOption[];
  actionSlot?: React.ReactNode;
  onExportCsv?: () => void;
  exportTitle?: string;
}

export const DataTableToolbar: React.FC<DataTableToolbarProps> = ({
  searchQuery = '',
  onSearchChange,
  searchPlaceholder = 'Search records...',
  filters = [],
  actionSlot,
  onExportCsv,
  exportTitle,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
        {onSearchChange && (
          <div className="relative w-full sm:w-72">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 font-normal transition-colors"
            />
          </div>
        )}

        {filters.map((filter) => (
          <div key={filter.key} className="flex items-center gap-1.5">
            <Filter size={13} className="text-slate-400 shrink-0" />
            <select
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer font-medium"
            >
              <option value="ALL">All {filter.label}</option>
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {onExportCsv && (
          <button
            onClick={onExportCsv}
            className="px-3 py-1.5 text-xs font-medium rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download size={14} className="text-emerald-500" />
            <span>{exportTitle || 'Export CSV'}</span>
          </button>
        )}
        {actionSlot}
      </div>
    </div>
  );
};

import React from 'react';
import { Search, RotateCcw, Filter } from 'lucide-react';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterBarProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchPlaceholder?: string;
  departments?: FilterOption[];
  selectedDepartment?: string;
  onDepartmentChange?: (dept: string) => void;
  statuses?: FilterOption[];
  selectedStatus?: string;
  onStatusChange?: (status: string) => void;
  dateRange?: string;
  onDateRangeChange?: (range: string) => void;
  onReset?: () => void;
  onApply?: () => void;
  customFilters?: React.ReactNode;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery = '',
  onSearchChange,
  searchPlaceholder = 'Search records...',
  departments = [],
  selectedDepartment = '',
  onDepartmentChange,
  statuses = [],
  selectedStatus = '',
  onStatusChange,
  dateRange = '',
  onDateRangeChange,
  onReset,
  onApply,
  customFilters,
}) => {
  return (
    <div className="bg-slate-900/60 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 mb-6 shadow-sm backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
        {/* Search Input */}
        {onSearchChange && (
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        )}

        {/* Department Select */}
        {onDepartmentChange && departments.length > 0 && (
          <select
            value={selectedDepartment}
            onChange={(e) => onDepartmentChange(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept.value} value={dept.value}>
                {dept.label}
              </option>
            ))}
          </select>
        )}

        {/* Status Select */}
        {onStatusChange && statuses.length > 0 && (
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
          >
            <option value="">All Statuses</option>
            {statuses.map((st) => (
              <option key={st.value} value={st.value}>
                {st.label}
              </option>
            ))}
          </select>
        )}

        {/* Date Range Select */}
        {onDateRangeChange && (
          <select
            value={dateRange}
            onChange={(e) => onDateRangeChange(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
          >
            <option value="today">Today</option>
            <option value="this_week">This Week</option>
            <option value="this_month">This Month</option>
            <option value="this_quarter">This Quarter</option>
            <option value="custom">Custom Range</option>
          </select>
        )}

        {customFilters}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {onReset && (
          <button
            onClick={onReset}
            className="px-3 py-1.5 text-xs font-medium rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw size={14} />
            Reset
          </button>
        )}
        {onApply && (
          <button
            onClick={onApply}
            className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <Filter size={14} />
            Apply Filters
          </button>
        )}
      </div>
    </div>
  );
};

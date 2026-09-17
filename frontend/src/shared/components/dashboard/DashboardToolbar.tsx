import React from 'react';
import { Filter, X, Search, Download } from 'lucide-react';

export interface FilterOption {
  value: string;
  label: string;
}

interface DashboardToolbarProps {
  // Common Date Filter
  dateFilter?: string;
  onDateFilterChange?: (val: string) => void;
  dateOptions?: FilterOption[];

  // Location Filter
  locationFilter?: string;
  onLocationFilterChange?: (val: string) => void;
  locationOptions?: FilterOption[];

  // Department Filter
  departmentFilter?: string;
  onDepartmentFilterChange?: (val: string) => void;
  departmentOptions?: FilterOption[];

  // Team Filter
  teamFilter?: string;
  onTeamFilterChange?: (val: string) => void;
  teamOptions?: FilterOption[];

  // Status Filter
  statusFilter?: string;
  onStatusFilterChange?: (val: string) => void;
  statusOptions?: FilterOption[];

  // Employee Search
  employeeFilter?: string;
  onEmployeeFilterChange?: (val: string) => void;

  // Actions
  onReset?: () => void;
  onExport?: () => void;
}

export const DashboardToolbar: React.FC<DashboardToolbarProps> = ({
  dateFilter, onDateFilterChange, dateOptions = [],
  locationFilter, onLocationFilterChange, locationOptions = [],
  departmentFilter, onDepartmentFilterChange, departmentOptions = [],
  teamFilter, onTeamFilterChange, teamOptions = [],
  statusFilter, onStatusFilterChange, statusOptions = [],
  employeeFilter, onEmployeeFilterChange,
  onReset,
  onExport
}) => {

  const renderSelect = (value: string | undefined, onChange: ((val: string) => void) | undefined, options: FilterOption[], placeholder: string) => {
    if (!onChange) return null;
    return (
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-shadow min-w-[140px]"
      >
        <option value="">{placeholder}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    );
  };

  return (
    <div className="py-2 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 mb-4">
      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium text-sm">
        <Filter size={18} />
        <span>Filters</span>
      </div>

      <div className="flex flex-wrap items-center gap-3 flex-1 lg:justify-end">
        {renderSelect(dateFilter, onDateFilterChange, dateOptions, 'All Time')}
        {renderSelect(locationFilter, onLocationFilterChange, locationOptions, 'All Locations')}
        {renderSelect(departmentFilter, onDepartmentFilterChange, departmentOptions, 'All Departments')}
        {renderSelect(teamFilter, onTeamFilterChange, teamOptions, 'All Teams')}
        {renderSelect(statusFilter, onStatusFilterChange, statusOptions, 'All Statuses')}

        {onEmployeeFilterChange !== undefined && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search..."
              value={employeeFilter || ''}
              onChange={(e) => onEmployeeFilterChange(e.target.value)}
              className="pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-shadow w-full sm:w-[200px]"
            />
          </div>
        )}

        {onReset && (
          <button
            onClick={onReset}
            className="px-3 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1"
          >
            <X size={16} /> Reset
          </button>
        )}

        {onExport && (
          <button
            onClick={onExport}
            className="px-3 py-2 text-sm font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Download size={16} /> Export
          </button>
        )}
      </div>
    </div>
  );
};

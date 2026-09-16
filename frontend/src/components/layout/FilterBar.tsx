import React, { useState } from 'react';
import { Search, RotateCcw, Calendar, Filter } from 'lucide-react';

export interface FilterState {
  search?: string;
  department?: string;
  team?: string;
  location?: string;
  status?: string;
  dateRange?: string;
}

interface FilterBarProps {
  onFilterChange: (filters: FilterState) => void;
  departments?: Array<{ id: string; name: string }>;
  teams?: Array<{ id: string; name: string }>;
  statuses?: Array<{ value: string; label: string }>;
  showDateRange?: boolean;
  className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  onFilterChange,
  departments = [],
  teams = [],
  statuses = [
    { value: 'all', label: 'All Statuses' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'INACTIVE', label: 'Inactive' },
  ],
  showDateRange = true,
  className = '',
}) => {
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('all');
  const [team, setTeam] = useState('all');
  const [status, setStatus] = useState('all');
  const [dateRange, setDateRange] = useState('30d');

  const handleApply = () => {
    onFilterChange({
      search: search.trim(),
      department: department === 'all' ? undefined : department,
      team: team === 'all' ? undefined : team,
      status: status === 'all' ? undefined : status,
      dateRange,
    });
  };

  const handleReset = () => {
    setSearch('');
    setDepartment('all');
    setTeam('all');
    setStatus('all');
    setDateRange('30d');
    onFilterChange({});
  };

  return (
    <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 shadow-xs space-y-3 ${className}`}>
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Quick Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" size={14} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleApply()}
            placeholder="Search employees, tasks, departments..."
            className="w-full text-xs pl-8 pr-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500"
          />
        </div>

        {/* Date Range Selector */}
        {showDateRange && (
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md px-2 py-1">
            <Calendar size={13} className="text-slate-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="text-xs bg-transparent border-none text-slate-700 dark:text-slate-200 outline-none cursor-pointer pr-1"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="ytd">Year to Date</option>
            </select>
          </div>
        )}

        {/* Department Selector */}
        {departments.length > 0 && (
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md px-2.5 py-1.5 text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        )}

        {/* Team Selector */}
        {teams.length > 0 && (
          <select
            value={team}
            onChange={(e) => setTeam(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md px-2.5 py-1.5 text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
          >
            <option value="all">All Teams</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        )}

        {/* Status Selector */}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md px-2.5 py-1.5 text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
        >
          {statuses.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 ml-auto">
          <button
            type="button"
            onClick={handleApply}
            className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-md font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
          >
            <Filter size={13} />
            Apply Filters
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Reset Filters"
          >
            <RotateCcw size={13} />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

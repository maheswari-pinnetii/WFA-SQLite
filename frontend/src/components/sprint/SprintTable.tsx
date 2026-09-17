import React from 'react';
import { DataTable, ColumnDef } from '../data-table';
import { SprintStatus } from './SprintStatus';
import { SprintProgress } from './SprintProgress';
import { Layers, ArrowRight } from 'lucide-react';

export interface SprintItem {
  id: string;
  name: string;
  project: string;
  team?: string;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Planned' | 'Completed' | string;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  blockedTasks: number;
  velocity?: number;
}

interface SprintTableProps {
  sprints: SprintItem[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onSelectSprint?: (sprint: SprintItem) => void;
  className?: string;
}

export const SprintTable: React.FC<SprintTableProps> = ({
  sprints,
  loading = false,
  error = null,
  onRetry,
  onSelectSprint,
  className = '',
}) => {
  const columns: ColumnDef<SprintItem>[] = [
    {
      key: 'name',
      header: 'Sprint Name',
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Layers size={15} className="text-emerald-500 shrink-0" />
          <span className="font-bold text-slate-900 dark:text-slate-100">{row.name}</span>
        </div>
      ),
    },
    {
      key: 'project',
      header: 'Project / Stream',
      sortable: true,
      cell: (row) => (
        <span className="font-medium text-slate-700 dark:text-slate-300">{row.project}</span>
      ),
    },
    {
      key: 'team',
      header: 'Team',
      sortable: true,
      cell: (row) => (
        <span className="text-slate-500 dark:text-slate-400">{row.team || 'Engineering'}</span>
      ),
    },
    {
      key: 'duration',
      header: 'Dates',
      cell: (row) => (
        <span className="font-mono text-slate-500 dark:text-slate-400 text-[11px]">
          {row.startDate} &rarr; {row.endDate}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      cell: (row) => <SprintStatus status={row.status} />,
    },
    {
      key: 'tasksBreakdown',
      header: 'Task Split (C / P / B)',
      align: 'center',
      cell: (row) => (
        <div className="flex items-center justify-center gap-2 font-mono text-[11px]">
          <span className="text-emerald-600 dark:text-emerald-400 font-bold" title="Completed">{row.completedTasks}</span>
          <span>/</span>
          <span className="text-amber-500 font-bold" title="In Progress">{row.inProgressTasks}</span>
          <span>/</span>
          <span className="text-rose-500 font-bold" title="Blocked">{row.blockedTasks}</span>
        </div>
      ),
    },
    {
      key: 'progress',
      header: 'Completion %',
      width: '140px',
      cell: (row) => <SprintProgress completed={row.completedTasks} total={row.totalTasks} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      cell: (row) => (
        <button
          onClick={() => onSelectSprint && onSelectSprint(row)}
          className="px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1 ml-auto cursor-pointer"
        >
          <span>Tasks</span>
          <ArrowRight size={13} />
        </button>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={sprints}
      loading={loading}
      error={error}
      onRetry={onRetry}
      emptyMessage="No active or planned sprints found for the authorized scope."
      searchPlaceholder="Filter sprints by name or project..."
      className={className}
    />
  );
};

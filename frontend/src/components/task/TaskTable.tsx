import React from 'react';
import { DataTable, ColumnDef } from '../data-table';
import { TaskStatus } from './TaskStatus';
import { TaskPriority } from './TaskPriority';
import { Task } from '../../api/endpoints/workforce.api';
import { CheckSquare, User, Calendar } from 'lucide-react';

interface TaskTableProps {
  tasks: Task[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onStatusChange?: (taskId: string, status: Task['status']) => void;
  onSelectTask?: (task: Task) => void;
  readOnlyStatus?: boolean;
  className?: string;
}

export const TaskTable: React.FC<TaskTableProps> = ({
  tasks,
  loading = false,
  error = null,
  onRetry,
  onStatusChange,
  onSelectTask,
  readOnlyStatus = false,
  className = '',
}) => {
  const columns: ColumnDef<Task>[] = [
    {
      key: 'title',
      header: 'Task Requirement',
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-2 max-w-xs sm:max-w-md">
          <CheckSquare size={15} className="text-emerald-500 shrink-0" />
          <div className="min-w-0">
            <span className="font-semibold text-slate-900 dark:text-slate-100 block truncate">{row.title}</span>
            <span className="text-[10px] text-slate-400 font-mono">{row.id}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'assigneeName',
      header: 'Assignee',
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
          <User size={13} className="text-slate-400 shrink-0" />
          <span className="font-medium truncate">{row.assigneeName || 'Unassigned'}</span>
        </div>
      ),
    },
    {
      key: 'points',
      header: 'Estimate',
      sortable: true,
      align: 'center',
      cell: (row) => (
        <span className="px-2 py-0.5 rounded font-mono text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          {row.points || 1} SP
        </span>
      ),
    },
    {
      key: 'priority',
      header: 'Priority',
      sortable: true,
      cell: (row) => <TaskPriority priority={row.priority} />,
    },
    {
      key: 'status',
      header: 'Sprint Status',
      sortable: true,
      cell: (row) => {
        if (readOnlyStatus || !onStatusChange) {
          return <TaskStatus status={row.status} />;
        }

        return (
          <select
            value={row.status}
            onChange={(e) => onStatusChange(row.id, e.target.value as Task['status'])}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs rounded px-2 py-1 font-semibold focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="BLOCKED">Blocked</option>
            <option value="COMPLETED">Completed</option>
          </select>
        );
      },
    },
    {
      key: 'updatedAt',
      header: 'Last Update',
      cell: (row) => (
        <span className="font-mono text-slate-500 dark:text-slate-400 text-[11px]">
          {row.updatedAt ? new Date(row.updatedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'Recent'}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={tasks}
      loading={loading}
      error={error}
      onRetry={onRetry}
      emptyMessage="No sprint tasks found for the current filter criteria."
      searchPlaceholder="Filter tasks by title or assignee..."
      className={className}
    />
  );
};

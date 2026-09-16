import React, { useState } from 'react';
import { SprintTable, SprintItem } from '../../../components/sprint/SprintTable';
import { TaskTable } from '../../../components/task/TaskTable';
import { workforceApi, Task } from '../../../api/endpoints/workforce.api';
import { Layers, Zap, Plus, ArrowLeft } from 'lucide-react';

export const ManagerSprintsPage: React.FC = () => {
  const [selectedSprint, setSelectedSprint] = useState<SprintItem | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);

  const sprints: SprintItem[] = [
    {
      id: 'SPR-24B',
      name: 'Sprint 24B — Core Analytics & SQLite Engine',
      project: 'Workforce Analytics Core',
      team: 'Engineering',
      startDate: '2026-09-01',
      endDate: '2026-09-15',
      status: 'Active',
      totalTasks: 32,
      completedTasks: 21,
      inProgressTasks: 8,
      blockedTasks: 3,
      velocity: 42,
    },
    {
      id: 'SPR-24A',
      name: 'Sprint 24A — Payroll Engine & Payslips Export',
      project: 'Enterprise Payroll',
      team: 'Engineering',
      startDate: '2026-08-15',
      endDate: '2026-08-31',
      status: 'Completed',
      totalTasks: 28,
      completedTasks: 28,
      inProgressTasks: 0,
      blockedTasks: 0,
      velocity: 38,
    },
    {
      id: 'SPR-25A',
      name: 'Sprint 25A — Biometric Geofencing Mobile Integration',
      project: 'Mobile Attendance',
      team: 'Engineering',
      startDate: '2026-09-16',
      endDate: '2026-09-30',
      status: 'Planned',
      totalTasks: 20,
      completedTasks: 0,
      inProgressTasks: 0,
      blockedTasks: 0,
      velocity: 0,
    },
  ];

  const handleSelectSprint = async (sprint: SprintItem) => {
    setSelectedSprint(sprint);
    setLoadingTasks(true);
    try {
      const fetched = await workforceApi.getTasks();
      setTasks(fetched);
    } catch {
      setTasks([]);
    } finally {
      setLoadingTasks(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn font-sans pb-10">
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800 flex items-center justify-center shrink-0">
            <Layers size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                Department Sprint Planning & Velocity
              </h1>
              <span className="badge badge-primary">Department Manager Scope</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Active engineering sprint deliverables, story points completion %, velocity trends, and task backlog.
            </p>
          </div>
        </div>
      </div>

      {selectedSprint ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedSprint(null)}
              className="btn btn-secondary btn-sm flex items-center gap-1.5"
            >
              <ArrowLeft size={14} /> Back to All Sprints
            </button>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              Drill-down: {selectedSprint.name}
            </span>
          </div>

          <TaskTable tasks={tasks} loading={loadingTasks} />
        </div>
      ) : (
        <SprintTable sprints={sprints} onSelectSprint={handleSelectSprint} />
      )}
    </div>
  );
};

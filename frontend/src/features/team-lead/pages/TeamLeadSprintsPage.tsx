import React, { useState } from 'react';
import { SprintTable, SprintItem } from '../../../components/sprint/SprintTable';
import { TaskTable } from '../../../components/task/TaskTable';
import { workforceApi, Task } from '../../../api/endpoints/workforce.api';
import { Layers, ArrowLeft } from 'lucide-react';

export const TeamLeadSprintsPage: React.FC = () => {
  const [selectedSprint, setSelectedSprint] = useState<SprintItem | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);

  const squadSprints: SprintItem[] = [
    {
      id: 'SPR-24B',
      name: 'Sprint 24B — Frontend Squad Deliverables',
      project: 'Workforce Analytics UI',
      team: 'Frontend',
      startDate: '2026-09-01',
      endDate: '2026-09-15',
      status: 'Active',
      totalTasks: 16,
      completedTasks: 12,
      inProgressTasks: 3,
      blockedTasks: 1,
      velocity: 24,
    },
    {
      id: 'SPR-24A',
      name: 'Sprint 24A — Component Design System & Recharts',
      project: 'Workforce Analytics UI',
      team: 'Frontend',
      startDate: '2026-08-15',
      endDate: '2026-08-31',
      status: 'Completed',
      totalTasks: 14,
      completedTasks: 14,
      inProgressTasks: 0,
      blockedTasks: 0,
      velocity: 22,
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
          <div className="w-11 h-11 rounded-lg bg-teal-50 text-teal-600 border border-teal-200 dark:bg-teal-950/50 dark:text-teal-400 dark:border-teal-800 flex items-center justify-center shrink-0">
            <Layers size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                Squad Sprint Work & Velocity
              </h1>
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-800">
                FRONTEND SQUAD SCOPE
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Sprint deliverables, burn-down story points, and task progress for your authorized team.
            </p>
          </div>
        </div>
      </div>

      {selectedSprint ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button onClick={() => setSelectedSprint(null)} className="btn btn-secondary btn-sm flex items-center gap-1.5">
              <ArrowLeft size={14} /> Back to Squad Sprints
            </button>
            <span className="text-xs font-bold text-teal-600 dark:text-teal-400 font-mono">
              Drill-down: {selectedSprint.name}
            </span>
          </div>

          <TaskTable tasks={tasks} loading={loadingTasks} />
        </div>
      ) : (
        <SprintTable sprints={squadSprints} onSelectSprint={handleSelectSprint} />
      )}
    </div>
  );
};

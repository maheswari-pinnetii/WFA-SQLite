import React, { useEffect, useState } from 'react';
import { TaskTable } from '../../../components/task/TaskTable';
import { SprintTable, SprintItem } from '../../../components/sprint/SprintTable';
import { workforceApi, Task } from '../../../api/endpoints/workforce.api';
import { Briefcase, Layers, CheckSquare } from 'lucide-react';

export const EmployeeWorkPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const mySprints: SprintItem[] = [
    {
      id: 'SPR-24B',
      name: 'Sprint 24B — Active Deliverables',
      project: 'Workforce Analytics Core',
      startDate: '2026-09-01',
      endDate: '2026-09-15',
      status: 'Active',
      totalTasks: 4,
      completedTasks: 2,
      inProgressTasks: 1,
      blockedTasks: 1,
    },
  ];

  const loadTasks = async () => {
    setLoading(true);
    try {
      const data = await workforceApi.getTasks();
      setTasks(data);
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleStatusChange = async (taskId: string, status: Task['status']) => {
    try {
      await workforceApi.updateTask(taskId, status);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status } : t)));
    } catch {
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status } : t)));
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn font-sans pb-10">
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800 flex items-center justify-center shrink-0">
            <Briefcase size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                My Work, Tasks & Sprint Assignments
              </h1>
              <span className="badge badge-secondary">Personal Work Workspace</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Track assigned sprint deliverables, story points progress, and update status logs.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Layers size={18} className="text-emerald-500" /> Assigned Sprint
        </h3>
        <SprintTable sprints={mySprints} />
      </div>

      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <CheckSquare size={18} className="text-emerald-500" /> My Sprint Tasks
        </h3>
        <TaskTable tasks={tasks} loading={loading} onStatusChange={handleStatusChange} />
      </div>
    </div>
  );
};

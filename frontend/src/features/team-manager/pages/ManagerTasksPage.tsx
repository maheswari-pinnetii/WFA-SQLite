import React, { useEffect, useState } from 'react';
import { TaskTable } from '../../../components/task/TaskTable';
import { workforceApi, Task } from '../../../api/endpoints/workforce.api';
import { CheckSquare, Plus, Filter } from 'lucide-react';

export const ManagerTasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

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
          <div className="w-11 h-11 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800 flex items-center justify-center shrink-0">
            <CheckSquare size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                Department Task Management & Allocation
              </h1>
              <span className="badge badge-primary">Department Manager Scope</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Track, reassign, update, and audit all tasks across your authorized department engineering streams.
            </p>
          </div>
        </div>
      </div>

      <TaskTable tasks={tasks} loading={loading} onStatusChange={handleStatusChange} />
    </div>
  );
};

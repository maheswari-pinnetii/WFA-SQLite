import React, { useState, useEffect } from 'react';
import { RoleGuard } from '../../../features/auth/security/guards/RoleGuard';
import { Role } from '../../../features/auth/security/roles/roles';
import { Target, Plus, Clock, Edit2 } from 'lucide-react';
import { Button } from '../../../shared/components/Button';
import { performanceApi } from '../../../api/endpoints/performance.api';

export const MyGoalsPage: React.FC = () => {
  const [cycles, setCycles] = useState<any[]>([]);
  const [selectedCycleId, setSelectedCycleId] = useState<string>('');
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  
  // Forms
  const [newGoal, setNewGoal] = useState({ title: '', description: '' });
  const [updatingGoal, setUpdatingGoal] = useState<any>(null);
  const [newProgress, setNewProgress] = useState(0);

  useEffect(() => {
    fetchCycles();
  }, []);

  useEffect(() => {
    if (selectedCycleId) {
      fetchGoals();
    } else {
      setGoals([]);
    }
  }, [selectedCycleId]);

  const fetchCycles = async () => {
    try {
      const res = await performanceApi.getCycles();
      if (res.success) {
        setCycles(res.data);
        if (res.data.length > 0) {
          setSelectedCycleId(res.data[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const res = await performanceApi.getGoals(selectedCycleId, 'me');
      if (res.success) {
        setGoals(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGoal = async () => {
    if (!newGoal.title || !selectedCycleId) return;
    try {
      await performanceApi.createGoal(selectedCycleId, 'me', newGoal);
      setIsAddModalOpen(false);
      setNewGoal({ title: '', description: '' });
      fetchGoals();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProgress = async () => {
    if (!updatingGoal) return;
    try {
      await performanceApi.updateGoalProgress(updatingGoal.id, newProgress);
      setIsUpdateModalOpen(false);
      setUpdatingGoal(null);
      fetchGoals();
    } catch (err) {
      console.error(err);
    }
  };

  const openUpdateModal = (goal: any) => {
    setUpdatingGoal(goal);
    setNewProgress(goal.progress);
    setIsUpdateModalOpen(true);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
              <Target className="text-rose-400" size={24} />
              My Professional Goals
            </h2>
            <p className="text-sm text-slate-400">
              Track your performance goals and OKRs for the cycle.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <select
              className="bg-slate-800 border border-slate-700 text-white text-sm rounded-md focus:ring-rose-500 focus:border-rose-500 block p-2"
              value={selectedCycleId}
              onChange={(e) => setSelectedCycleId(e.target.value)}
            >
              {cycles.length === 0 && <option value="">No Cycles Available</option>}
              {cycles.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <Button variant="primary" className="flex items-center gap-2" onClick={() => setIsAddModalOpen(true)} disabled={!selectedCycleId}>
              <Plus size={16} /> Add New Goal
            </Button>
          </div>
        </div>

        {/* Goals List */}
        {loading ? (
          <div className="text-slate-400">Loading goals...</div>
        ) : goals.length === 0 ? (
          <div className="glass-panel p-8 text-center text-slate-400">
            No goals found for this cycle. Click "Add New Goal" to create one.
          </div>
        ) : (
          <div className="space-y-4">
            {goals.map((g) => (
              <div key={g.id} className="glass-panel p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <h3 className="font-extrabold text-base text-slate-100">{g.title}</h3>
                    {g.description && <p className="text-sm text-slate-400 mt-1">{g.description}</p>}
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold whitespace-nowrap ${
                      g.status === 'COMPLETED'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {g.status}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-400">
                    <span>Target Progress</span>
                    <span className="text-slate-200 font-bold">{g.progress}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-rose-500 to-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${g.progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                  <span className="flex items-center gap-1"></span>
                  {g.status !== 'COMPLETED' && (
                    <Button variant="ghost" size="sm" className="flex items-center gap-1" onClick={() => openUpdateModal(g)}>
                      <Edit2 size={13} /> Update Progress
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Goal Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl w-full max-w-md shadow-2xl">
              <h3 className="text-lg font-bold text-slate-100 mb-4">Add New Goal</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Goal Title</label>
                  <input
                    type="text"
                    className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-slate-100 focus:ring-rose-500 focus:border-rose-500"
                    placeholder="e.g. Complete Advanced React Certification"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Description (Optional)</label>
                  <textarea
                    className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-slate-100 focus:ring-rose-500 focus:border-rose-500"
                    placeholder="Details about the goal..."
                    rows={3}
                    value={newGoal.description}
                    onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                  <Button variant="primary" onClick={handleAddGoal} disabled={!newGoal.title}>Add Goal</Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Update Progress Modal */}
        {isUpdateModalOpen && updatingGoal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl w-full max-w-md shadow-2xl">
              <h3 className="text-lg font-bold text-slate-100 mb-4">Update Progress</h3>
              <p className="text-sm text-slate-400 mb-4">{updatingGoal.title}</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Progress: {newProgress}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                    value={newProgress}
                    onChange={(e) => setNewProgress(Number(e.target.value))}
                  />
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <Button variant="outline" onClick={() => setIsUpdateModalOpen(false)}>Cancel</Button>
                  <Button variant="primary" onClick={handleUpdateProgress}>Save Update</Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

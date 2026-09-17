import React, { useState, useEffect } from 'react';
import { apiClient as api } from '../../../api/client';

interface WorkConfig {
  id: string;
  name: string;
  working_days: string;
  standard_hours_per_day: number;
  is_default: number;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' }
];

export const WorkConfigManagement: React.FC = () => {
  const [configs, setConfigs] = useState<WorkConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    working_days: number[];
    standard_hours_per_day: number;
    is_default: boolean;
  }>({
    name: 'Standard Work Week',
    working_days: [1, 2, 3, 4, 5],
    standard_hours_per_day: 8.0,
    is_default: true
  });

  const fetchConfigs = async () => {
    try {
      const res = await api.get('/work-configs');
      setConfigs(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/work-configs', {
        name: formData.name,
        working_days: JSON.stringify(formData.working_days),
        standard_hours_per_day: formData.standard_hours_per_day,
        is_default: formData.is_default
      });
      setIsModalOpen(false);
      setFormData({ name: '', working_days: [1, 2, 3, 4, 5], standard_hours_per_day: 8.0, is_default: false });
      fetchConfigs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this work configuration?')) return;
    try {
      await api.delete(`/work-configs/${id}`);
      fetchConfigs();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleDay = (dayValue: number) => {
    setFormData(prev => {
      const newDays = prev.working_days.includes(dayValue)
        ? prev.working_days.filter(d => d !== dayValue)
        : [...prev.working_days, dayValue].sort();
      return { ...prev, working_days: newDays };
    });
  };

  if (loading) return <div>Loading configs...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Work Week Configuration</h2>
          <p className="text-gray-400 text-sm mt-1">Define working days and hours for the organization.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-brand-primary/90 transition-colors"
        >
          Add Configuration
        </button>
      </div>

      <div className="glass-panel rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="p-4 text-sm font-semibold text-gray-300">Name</th>
              <th className="p-4 text-sm font-semibold text-gray-300">Working Days</th>
              <th className="p-4 text-sm font-semibold text-gray-300">Standard Hours</th>
              <th className="p-4 text-sm font-semibold text-gray-300">Status</th>
              <th className="p-4 text-sm font-semibold text-gray-300 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {configs.map((config) => {
              const days = JSON.parse(config.working_days || '[]');
              return (
                <tr key={config.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                  <td className="p-4 text-white font-medium">{config.name}</td>
                  <td className="p-4 text-gray-300">
                    <div className="flex gap-1">
                      {DAYS_OF_WEEK.map(day => (
                        <span 
                          key={day.value} 
                          className={`w-6 h-6 flex items-center justify-center rounded-full text-xs ${days.includes(day.value) ? 'bg-brand-primary text-white' : 'bg-white/5 text-gray-500'}`}
                          title={day.label}
                        >
                          {day.label[0]}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-gray-300">{config.standard_hours_per_day} hrs/day</td>
                  <td className="p-4">
                    {config.is_default === 1 && (
                      <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded-full text-xs font-medium">
                        Default
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleDelete(config.id)} className="text-red-400 hover:text-red-300 text-sm">
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
            {configs.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">No work configurations defined.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-white/10 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Add Work Configuration</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Configuration Name</label>
                <input
                  required
                  type="text"
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Working Days</label>
                <div className="flex flex-wrap gap-2">
                  {DAYS_OF_WEEK.map(day => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleDay(day.value)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors border ${formData.working_days.includes(day.value) ? 'bg-brand-primary border-brand-primary text-white' : 'bg-transparent border-white/20 text-gray-400 hover:bg-white/5'}`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Standard Hrs / Day</label>
                  <input
                    required
                    type="number"
                    step="0.5"
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white"
                    value={formData.standard_hours_per_day}
                    onChange={(e) => setFormData({ ...formData, standard_hours_per_day: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-white/20 bg-black/50 text-brand-primary focus:ring-brand-primary"
                      checked={formData.is_default}
                      onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                    />
                    <span className="text-sm font-medium text-gray-300">Set as Default</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-brand-primary/90"
                >
                  Save Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

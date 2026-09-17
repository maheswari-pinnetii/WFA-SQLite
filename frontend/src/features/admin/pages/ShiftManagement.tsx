import React, { useState, useEffect } from 'react';
import { apiClient as api } from '../../../api/client';

interface Shift {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  break_duration: number;
  is_overnight: number;
  color_code: string;
}

export const ShiftManagement: React.FC = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Shift>>({
    name: '',
    start_time: '09:00',
    end_time: '17:00',
    break_duration: 60,
    is_overnight: 0,
    color_code: '#10b981'
  });

  const fetchShifts = async () => {
    try {
      const res = await api.get('/shifts');
      setShifts(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/shifts', formData);
      setIsModalOpen(false);
      setFormData({ name: '', start_time: '09:00', end_time: '17:00', break_duration: 60, is_overnight: 0, color_code: '#10b981' });
      fetchShifts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this shift?')) return;
    try {
      await api.delete(`/shifts/${id}`);
      fetchShifts();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div>Loading shifts...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Shift Management</h2>
          <p className="text-gray-400 text-sm mt-1">Define working shifts for your organization.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-brand-primary/90 transition-colors"
        >
          Add Shift
        </button>
      </div>

      <div className="glass-panel rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="p-4 text-sm font-semibold text-gray-300">Name</th>
              <th className="p-4 text-sm font-semibold text-gray-300">Start Time</th>
              <th className="p-4 text-sm font-semibold text-gray-300">End Time</th>
              <th className="p-4 text-sm font-semibold text-gray-300">Break (mins)</th>
              <th className="p-4 text-sm font-semibold text-gray-300 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {shifts.map((shift) => (
              <tr key={shift.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                <td className="p-4 text-white">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: shift.color_code }}></span>
                    {shift.name}
                  </div>
                </td>
                <td className="p-4 text-gray-300">{shift.start_time}</td>
                <td className="p-4 text-gray-300">{shift.end_time}</td>
                <td className="p-4 text-gray-300">{shift.break_duration}</td>
                <td className="p-4 text-right">
                  <button onClick={() => handleDelete(shift.id)} className="text-red-400 hover:text-red-300 text-sm">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {shifts.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">No shifts defined.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-white/10 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Create New Shift</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Shift Name</label>
                <input
                  required
                  type="text"
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Start Time</label>
                  <input
                    required
                    type="time"
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">End Time</label>
                  <input
                    required
                    type="time"
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Break (mins)</label>
                  <input
                    required
                    type="number"
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white"
                    value={formData.break_duration}
                    onChange={(e) => setFormData({ ...formData, break_duration: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Color Code</label>
                  <input
                    required
                    type="color"
                    className="w-full bg-black/50 border border-white/10 rounded-lg h-10 px-1 py-1 text-white cursor-pointer"
                    value={formData.color_code}
                    onChange={(e) => setFormData({ ...formData, color_code: e.target.value })}
                  />
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
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

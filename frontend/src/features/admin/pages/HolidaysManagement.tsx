import React, { useState, useEffect } from 'react';
import { apiClient as api } from '../../../api/client';

interface Holiday {
  id: string;
  name: string;
  date: string;
  type: string;
  description: string;
}

export const HolidaysManagement: React.FC = () => {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Holiday>>({
    name: '',
    date: '',
    type: 'NATIONAL',
    description: ''
  });

  const fetchHolidays = async () => {
    try {
      const res = await api.get('/holidays');
      setHolidays(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/holidays', formData);
      setIsModalOpen(false);
      setFormData({ name: '', date: '', type: 'NATIONAL', description: '' });
      fetchHolidays();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this holiday?')) return;
    try {
      await api.delete(`/holidays/${id}`);
      fetchHolidays();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div>Loading holidays...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Holiday Calendar</h2>
          <p className="text-gray-400 text-sm mt-1">Manage public and organizational holidays.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-brand-primary/90 transition-colors"
        >
          Add Holiday
        </button>
      </div>

      <div className="glass-panel rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="p-4 text-sm font-semibold text-gray-300">Name</th>
              <th className="p-4 text-sm font-semibold text-gray-300">Date</th>
              <th className="p-4 text-sm font-semibold text-gray-300">Type</th>
              <th className="p-4 text-sm font-semibold text-gray-300">Description</th>
              <th className="p-4 text-sm font-semibold text-gray-300 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {holidays.map((holiday) => (
              <tr key={holiday.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                <td className="p-4 text-white">{holiday.name}</td>
                <td className="p-4 text-gray-300">{holiday.date}</td>
                <td className="p-4 text-gray-300">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${holiday.type === 'NATIONAL' ? 'bg-blue-500/20 text-blue-300' : 'bg-purple-500/20 text-purple-300'}`}>
                    {holiday.type}
                  </span>
                </td>
                <td className="p-4 text-gray-400 text-sm">{holiday.description || '-'}</td>
                <td className="p-4 text-right">
                  <button onClick={() => handleDelete(holiday.id)} className="text-red-400 hover:text-red-300 text-sm">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {holidays.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">No holidays defined.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-white/10 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Add Holiday</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Holiday Name</label>
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
                  <label className="block text-sm font-medium text-gray-400 mb-1">Date</label>
                  <input
                    required
                    type="date"
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Type</label>
                  <select
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="NATIONAL">National</option>
                    <option value="COMPANY">Company</option>
                    <option value="REGIONAL">Regional</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                <textarea
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white h-24"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
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
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

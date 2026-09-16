import React, { useState, useEffect, useCallback } from 'react';
import { schedulingApi } from '../../../api/schedulingApi';
import { useSelector } from 'react-redux';
import { RootState } from '../../../app/store';

export const ShiftManagementPage: React.FC = () => {
  const [shifts, setShifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<any>(null);

  const fetchShifts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await schedulingApi.getShifts();
      setShifts(res.data || res);
    } catch { setShifts([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchShifts(); }, [fetchShifts]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const payload = Object.fromEntries(fd.entries());
    payload.isFlexible = payload.isFlexible === 'on' ? 'true' : 'false';

    try {
      if (editingShift?.id) {
        await schedulingApi.createShift({ ...payload, id: editingShift.id });
      } else {
        await schedulingApi.createShift(payload);
      }
      setIsModalOpen(false);
      fetchShifts();
    } catch (err) {
      alert('Error saving shift');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deactivate shift?')) return;
    try {
      await schedulingApi.createShift({ id, isActive: false });
      fetchShifts();
    } catch (err) {
      alert('Error deleting shift');
    }
  };

  return (
    <div className="p-4 md:p-6 flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Shift Management</h1>
        <button className="btn btn-primary" onClick={() => { setEditingShift(null); setIsModalOpen(true); }}>
          + New Shift
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 rounded-full border-2 border-[var(--role-primary)] border-t-transparent animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {shifts.map(shift => (
            <div key={shift.id} className="card p-4 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-[var(--text-primary)] text-lg">{shift.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${shift.isActive ? 'bg-emerald-500/20 text-emerald-600' : 'bg-rose-500/20 text-rose-600'}`}>
                    {shift.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditingShift(shift); setIsModalOpen(true); }} className="text-[var(--text-secondary)] hover:text-[var(--role-primary)]">✏️</button>
                  <button onClick={() => handleDelete(shift.id)} className="text-[var(--text-secondary)] hover:text-rose-500">🗑️</button>
                </div>
              </div>
              
              <div className="flex flex-col gap-1 text-sm text-[var(--text-secondary)]">
                <p>Time: <span className="font-semibold text-[var(--text-primary)]">{shift.startTime} - {shift.endTime}</span></p>
                {shift.breakDurationMinutes && <p>Break: {shift.breakDurationMinutes} mins</p>}
                {shift.isFlexible && <p className="text-violet-500 font-medium">✨ Flexible Hours</p>}
                {shift.workDays && (
                  <div className="flex gap-1 mt-2">
                    {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d, i) => {
                      const isActive = shift.workDays.includes((i+1).toString()) || (i===6 && shift.workDays.includes('0'));
                      return (
                        <span key={d} className={`text-[10px] w-6 h-6 flex items-center justify-center rounded-full ${isActive ? 'bg-[var(--role-primary)] text-white' : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)]'}`}>
                          {d[0]}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="card p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editingShift ? 'Edit Shift' : 'New Shift'}</h2>
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Shift Name</label>
                <input name="name" defaultValue={editingShift?.name} required className="w-full px-3 py-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] focus:border-[var(--role-primary)]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Time</label>
                  <input type="time" name="startTime" defaultValue={editingShift?.startTime} required className="w-full px-3 py-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)]" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Time</label>
                  <input type="time" name="endTime" defaultValue={editingShift?.endTime} required className="w-full px-3 py-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)]" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Break Duration (mins)</label>
                <input type="number" name="breakDurationMinutes" defaultValue={editingShift?.breakDurationMinutes || 60} className="w-full px-3 py-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)]" />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input type="checkbox" name="isFlexible" id="isFlexible" defaultChecked={editingShift?.isFlexible} />
                <label htmlFor="isFlexible" className="text-sm font-medium cursor-pointer">Flexible Shift?</label>
              </div>
              
              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)]">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Shift</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftManagementPage;

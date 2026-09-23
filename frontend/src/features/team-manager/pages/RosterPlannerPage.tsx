import React, { useState, useEffect, useCallback } from 'react';
import { Calendar as CalendarIcon, Users, Clock, AlertTriangle, Plus, Check } from 'lucide-react';
import { useAuth } from '../../../auth/hooks/useAuth';
import { apiClient as api } from '../../../api/client';

interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  colorCode: string;
}

interface Employee {
  id: string;
  name: string;
  role: string;
  shifts: {
    id: string;
    shiftId: string;
    startDate: string;
    shiftName: string;
    startTime: string;
    endTime: string;
    colorCode: string;
  }[];
}

export const RosterPlannerPage: React.FC = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Create a 7-day view
  const getDaysArray = useCallback(() => {
    const start = new Date(startDate);
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d.toISOString().split('T')[0];
    });
  }, [startDate]);
  
  const weekDays = getDaysArray();

  const fetchRoster = useCallback(async () => {
    if (!user?.department) return;
    setLoading(true);
    try {
      const endDate = weekDays[6];
      const res = await api.get(`/scheduling/departments/${user.department}/roster`, {
        params: { startDate: weekDays[0], endDate }
      });
      setEmployees(res.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.department, weekDays]);

  const fetchShifts = async () => {
    try {
      const res = await api.get('/shifts');
      setShifts(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchShifts();
    fetchRoster();
  }, [fetchRoster]);

  const handleDragStart = (e: React.DragEvent, shift: Shift) => {
    e.dataTransfer.setData('shiftId', shift.id);
    e.dataTransfer.setData('shiftName', shift.name);
  };

  const handleDrop = async (e: React.DragEvent, employeeId: string, date: string) => {
    e.preventDefault();
    const shiftId = e.dataTransfer.getData('shiftId');
    if (!shiftId) return;

    try {
      await api.post(`/scheduling/employees/${employeeId}/shifts`, {
        shiftId,
        startDate: date
      });
      fetchRoster(); // Refresh the roster
    } catch (err: any) {
      alert(`Conflict: ${err.response?.data?.message || 'Could not assign shift'}`);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-[var(--border-color)]">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarIcon className="text-emerald-500" />
            Roster Planner
          </h1>
          <p className="text-slate-400 mt-1">Drag and drop shifts to schedule your team.</p>
        </div>
        <div className="flex gap-4 items-center">
          <input 
            type="date" 
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="input"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Shift Templates Sidebar */}
        <div className="md:col-span-1 bg-[var(--surface-color)] p-4 rounded-xl border border-[var(--border-color)]">
          <h3 className="font-bold mb-4 flex items-center gap-2 text-[var(--text-primary)]">
            <Clock size={16} /> Available Shifts
          </h3>
          <div className="space-y-3">
            {shifts.map(shift => (
              <div 
                key={shift.id}
                draggable
                onDragStart={(e) => handleDragStart(e, shift)}
                className="p-3 rounded-lg border border-[var(--border-color)] cursor-grab active:cursor-grabbing hover:bg-slate-800/50 transition-colors"
                style={{ borderLeft: `4px solid ${shift.colorCode || '#10b981'}` }}
              >
                <div className="font-semibold text-sm">{shift.name}</div>
                <div className="text-xs text-slate-400">{shift.startTime} - {shift.endTime}</div>
              </div>
            ))}
            {shifts.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">No shift templates found.</p>
            )}
          </div>
        </div>

        {/* Roster Grid */}
        <div className="md:col-span-3 overflow-x-auto">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg mb-4 flex items-center gap-2">
              <AlertTriangle size={18} /> {error}
            </div>
          )}
          
          <table className="w-full text-left min-w-[800px] border-collapse">
            <thead>
              <tr>
                <th className="p-3 border-b border-[var(--border-color)] font-semibold text-slate-400">Employee</th>
                {weekDays.map(date => (
                  <th key={date} className="p-3 border-b border-[var(--border-color)] font-semibold text-center text-sm">
                    {new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">Loading roster...</td>
                </tr>
              ) : employees.map(emp => (
                <tr key={emp.id} className="border-b border-[var(--border-color)] hover:bg-slate-800/20">
                  <td className="p-3">
                    <div className="font-semibold text-sm text-[var(--text-primary)]">{emp.name}</div>
                    <div className="text-xs text-slate-400">{emp.role}</div>
                  </td>
                  {weekDays.map(date => {
                    const assignedShift = emp.shifts.find(s => s.startDate === date);
                    return (
                      <td 
                        key={date}
                        className="p-2 align-top text-center"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, emp.id, date)}
                      >
                        <div className={`min-h-[80px] rounded-lg border border-dashed flex flex-col items-center justify-center p-2 transition-colors ${
                          assignedShift 
                            ? 'border-solid border-emerald-500/30 bg-emerald-500/5' 
                            : 'border-[var(--border-color)] hover:border-emerald-500/50 hover:bg-slate-800/30'
                        }`}>
                          {assignedShift ? (
                            <>
                              <div className="text-xs font-bold text-emerald-400 mb-1">{assignedShift.shiftName}</div>
                              <div className="text-[10px] text-slate-400">{assignedShift.startTime} - {assignedShift.endTime}</div>
                            </>
                          ) : (
                            <span className="text-xs text-slate-500">Drop shift here</span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
              {!loading && employees.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No employees found in your department.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

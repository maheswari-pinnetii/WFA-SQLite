import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle2 } from 'lucide-react';
import { apiClient as api } from '../../../api/client';
import { useAuth } from '../../../auth/hooks/useAuth';

export const TimesheetPage: React.FC = () => {
  const { user } = useAuth();
  const [timesheets, setTimesheets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTimesheets = async () => {
      setLoading(true);
      try {
        const response = await api.get('/attendance/records');
        setTimesheets(response.data?.data?.data || []);
      } catch (err) {
        console.error('Failed to fetch timesheets', err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) fetchTimesheets();
  }, [user?.id]);

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight">Timesheet Log</h2>
        <p className="text-xs text-slate-400 mt-1">View your attendance history and hours worked.</p>
      </div>

      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
        <h3 className="text-base font-extrabold text-white mb-4">Historical Timesheets</h3>
        {loading ? (
          <p className="text-slate-400">Loading...</p>
        ) : timesheets.length === 0 ? (
          <p className="text-slate-400 text-sm">No timesheets found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase font-bold text-[10px]">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Check In</th>
                  <th className="py-3 px-4">Check Out</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {timesheets.map((ts, i) => (
                  <tr key={i} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-bold text-white">{new Date(ts.date).toLocaleDateString()}</td>
                    <td className="py-3 px-4 font-mono text-emerald-400">{new Date(ts.checkInTime).toLocaleTimeString()}</td>
                    <td className="py-3 px-4 font-mono text-rose-400">{ts.checkOutTime ? new Date(ts.checkOutTime).toLocaleTimeString() : 'N/A'}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        {ts.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

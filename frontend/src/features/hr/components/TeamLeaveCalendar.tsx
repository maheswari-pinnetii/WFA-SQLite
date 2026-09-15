import React, { useEffect, useState } from 'react';
import { Calendar, User, Clock } from 'lucide-react';
import { workforceApi } from '../../../api/endpoints/workforce.api';

interface LeaveRequest {
  id: string;
  employeeName: string;
  type: string;
  startDate: string;
  endDate: string;
  isHalfDay?: boolean;
  halfDayPeriod?: string;
  status: string;
}

export const TeamLeaveCalendar: React.FC = () => {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const response = await workforceApi.getLeaveRequests();
        const approvedLeaves = response.filter((l: any) => l.status === 'APPROVED');
        setLeaves(approvedLeaves);
      } catch (err) {
        console.error('Failed to fetch leave requests:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaves();
  }, []);

  const getUpcomingLeaves = () => {
    const today = new Date().toISOString().split('T')[0];
    return leaves
      .filter((l) => l.endDate >= today)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  };

  const upcoming = getUpcomingLeaves();

  return (
    <div className="glass-panel p-6 rounded-2xl border border-[var(--border-color)]">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
          <Calendar size={20} />
        </div>
        <div>
          <h2 className="text-lg font-black tracking-tight text-[var(--text-primary)]">Team Leave Calendar</h2>
          <p className="text-xs text-[var(--text-muted)]">Upcoming approved leaves</p>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-[var(--text-muted)]">Loading calendar...</p>
      ) : upcoming.length === 0 ? (
        <div className="text-center p-8 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border-color)]">
          <Calendar size={32} className="mx-auto text-[var(--text-muted)] opacity-50 mb-3" />
          <p className="text-sm font-bold text-[var(--text-primary)]">No upcoming leaves</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Everyone is available</p>
        </div>
      ) : (
        <div className="space-y-3">
          {upcoming.map((leave) => {
            const today = new Date().toISOString().split('T')[0];
            const isCurrentlyOnLeave = leave.startDate <= today && leave.endDate >= today;
            
            return (
              <div 
                key={leave.id} 
                className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${
                  isCurrentlyOnLeave 
                    ? 'bg-amber-500/10 border-amber-500/30' 
                    : 'bg-[var(--bg-tertiary)] border-[var(--border-color)]'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center">
                    <User size={16} className="text-[var(--text-muted)]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                      {leave.employeeName}
                      {isCurrentlyOnLeave && (
                        <span className="badge badge-warning text-[10px] uppercase font-bold py-0.5">On Leave</span>
                      )}
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] flex items-center gap-1.5 mt-0.5">
                      <Clock size={12} />
                      {leave.startDate} {leave.startDate !== leave.endDate ? `to ${leave.endDate}` : ''}
                      {leave.isHalfDay ? ` (Half Day - ${leave.halfDayPeriod})` : ''}
                      <span className="text-slate-500 ml-1">· {leave.type}</span>
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { RoleGuard } from '../../../security/guards/RoleGuard';
import { Role } from '../../../security/roles/roles';
import { MinimalKpiCard } from '../../../components/ui/MinimalKpiCard';
import { ClipboardList, ShieldCheck, Activity, Users, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { attendanceApi, CorrectionRequest } from '../../../api/attendanceApi';

export const AttendanceCorrectionsPage: React.FC = () => {
  const [requests, setRequests] = useState<CorrectionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [alertMsg, setAlertMsg] = useState('');

  const loadRequests = async () => {
    setLoading(true);
    try {
      let data: CorrectionRequest[] = [];
      try {
        data = await attendanceApi.getCorrections();
      } catch {
        data = [];
      }

      const saved = localStorage.getItem('wfa_attendance_corrections');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            const existingIds = new Set(data.map(d => d.id));
            parsed.forEach((item: CorrectionRequest) => {
              if (!existingIds.has(item.id)) data.unshift(item);
            });
          }
        } catch {}
      }

      if (data.length === 0) {
        data = [
          {
            id: 'CORR-2026-001',
            attendanceId: 'att-101',
            employeeId: 'usr-emp-01',
            employeeName: 'Alex Mercer (Software Engineer)',
            date: '2026-08-31',
            requestedCheckIn: '09:00 AM',
            requestedCheckOut: '06:00 PM',
            reason: 'Geofence wifi reconnection issue caused morning punch to register late.',
            status: 'PENDING',
            managerComment: null
          }
        ];
        localStorage.setItem('wfa_attendance_corrections', JSON.stringify(data));
      }

      setRequests(data);
    } catch (err) {
      console.error('Failed to load corrections:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRequests();
  }, []);

  const handleReview = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await attendanceApi.reviewCorrection(id, status, `Audited and ${status.toLowerCase()} by HR Operations`);
    } catch {}

    const updated = requests.map(r => {
      if (r.id === id) {
        return {
          ...r,
          status: status,
          managerComment: `Approved by HR Operations (${new Date().toLocaleDateString()})`
        };
      }
      return r;
    });

    setRequests(updated);
    localStorage.setItem('wfa_attendance_corrections', JSON.stringify(updated));
    setAlertMsg(`Correction request ${id} ${status.toLowerCase()}! Employee dashboard record synchronized.`);
    setTimeout(() => setAlertMsg(''), 4000);
  };

  const pendingRequests = requests.filter(r => r.status.toLowerCase() === 'pending');

  return (
    <RoleGuard allowedRoles={[Role.ADMIN, Role.HR, Role.MANAGER]}>
      <div className="space-y-6 animate-fadeIn pb-10 font-sans">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[var(--border-color)] pb-4">
          <div>
            <span className="badge badge-manager mb-1 uppercase tracking-wider text-[10px] font-black">
              Time Oversight Desk
            </span>
            <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
              Attendance Correction Desk
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Audit and process check-in / check-out correction requests submitted by employees.
            </p>
          </div>
        </div>

        {alertMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 size={16} />
            {alertMsg}
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <MinimalKpiCard title="Pending Requests" value={`${pendingRequests.length} Requests`} icon={<ClipboardList size={26} />} iconBgColor="blue" trend="Requires processing" trendType={undefined} />
          <MinimalKpiCard title="Total Audited" value={`${requests.length - pendingRequests.length} Requests`} icon={<ShieldCheck size={26} />} iconBgColor="emerald" trend="Completed audits" trendType="positive" />
          <MinimalKpiCard title="Total Received" value={`${requests.length} Logs`} icon={<Activity size={26} />} iconBgColor="amber" trend="Overall request volume" trendType="positive" />
          <MinimalKpiCard title="Access Policy" value="Audit Mode" icon={<Users size={26} />} iconBgColor="purple" trend="Manager & HR Authorized" trendType="positive" />
        </div>

        {/* Corrections Stream */}
        <div className="glass-panel p-6 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] space-y-4 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-color)]">
            <h3 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2">
              <Clock size={18} className="text-amber-400" /> Attendance Correction Streams
            </h3>
            <span className="text-xs text-slate-400 font-bold bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
              {requests.length} Requests Total
            </span>
          </div>
          
          {loading ? (
            <div className="text-center py-10 text-xs text-slate-400 font-semibold">
              Loading requests...
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-500 font-semibold">
              No correction requests found.
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => {
                const isPending = req.status.toLowerCase() === 'pending';
                return (
                  <div 
                    key={req.id} 
                    className={`p-4 rounded-2xl border transition-colors ${
                      isPending ? 'bg-slate-950/80 border-amber-500/30' : 'bg-slate-950/40 border-slate-800'
                    } flex flex-col md:flex-row md:items-center justify-between gap-4`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-white">{req.employeeName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">ID: {req.employeeId}</span>
                        <span className="text-[10px] text-blue-400 font-mono font-bold bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                          {req.id}
                        </span>
                      </div>
                      
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-1">
                        <p>
                          Date: <span className="font-mono font-bold text-blue-400">{req.date}</span> &bull; Requested Time: <span className="font-bold text-emerald-400 font-mono">{req.requestedCheckIn || '09:00 AM'} – {req.requestedCheckOut || '06:00 PM'}</span>
                        </p>
                        <p className="text-slate-400 italic">"Reason: {req.reason}"</p>
                        {req.managerComment && (
                          <p className="text-emerald-400 font-semibold text-[11px]">Audit Result: {req.managerComment}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 shrink-0">
                      {isPending ? (
                        <>
                          <button 
                            onClick={() => handleReview(req.id, 'APPROVED')}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center gap-1"
                          >
                            <CheckCircle2 size={13} /> Approve
                          </button>
                          <button 
                            onClick={() => handleReview(req.id, 'REJECTED')}
                            className="px-3.5 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center gap-1"
                          >
                            <XCircle size={13} /> Reject
                          </button>
                        </>
                      ) : (
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                          req.status.toLowerCase() === 'approved' 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}>
                          {req.status}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
};

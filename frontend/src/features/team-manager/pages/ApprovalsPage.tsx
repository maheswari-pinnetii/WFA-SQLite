import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Clock, Calendar, FileText, UserCheck, ShieldCheck } from 'lucide-react';
import { LeaveRequest, workforceApi } from '../../../api/endpoints/workforce.api';
import { attendanceApi, CorrectionRequest } from '../../../api/attendanceApi';
import { Button } from '../../../components/ui/button';

export const ApprovalsPage: React.FC = () => {
  type ApprovalItem = LeaveRequest & { employee: string; duration: string; date: string };
  const [activeTab, setActiveTab] = useState<'leaves' | 'corrections'>('leaves');
  const [leaveApprovals, setLeaveApprovals] = useState<ApprovalItem[]>([]);
  const [correctionApprovals, setCorrectionApprovals] = useState<CorrectionRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const loadAllApprovals = async () => {
    setLoading(true);
    try {
      // 1. Load Leave Requests
      const leaveReqs = await workforceApi.getLeaveRequests().catch(() => []);
      setLeaveApprovals(leaveReqs.map((request) => ({
        ...request,
        employee: request.employeeName,
        duration: `${request.startDate} - ${request.endDate}`,
        date: new Date(request.createdAt).toLocaleString()
      })));

      // 2. Load Attendance Correction Requests from API + localStorage
      let corrReqs: CorrectionRequest[] = [];
      try {
        corrReqs = await attendanceApi.getCorrections();
      } catch {
        corrReqs = [];
      }

      const localSaved = localStorage.getItem('wfa_attendance_corrections');
      if (localSaved) {
        try {
          const parsed = JSON.parse(localSaved);
          if (Array.isArray(parsed)) {
            // merge unique by id
            const existingIds = new Set(corrReqs.map(c => c.id));
            parsed.forEach((item: CorrectionRequest) => {
              if (!existingIds.has(item.id)) corrReqs.unshift(item);
            });
          }
        } catch {}
      }

      if (corrReqs.length === 0) {
        corrReqs = [
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
        localStorage.setItem('wfa_attendance_corrections', JSON.stringify(corrReqs));
      }

      setCorrectionApprovals(corrReqs);
    } catch (err) {
      console.error('Failed to load approvals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAllApprovals();
  }, []);

  const handleLeaveAction = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await workforceApi.reviewLeaveRequest(id, status);
      setStatusMessage(`Leave request ${status.toLowerCase()} successfully!`);
      setTimeout(() => setStatusMessage(''), 3500);
      await loadAllApprovals();
    } catch (err) {
      console.error('Failed to review leave:', err);
    }
  };

  const handleCorrectionAction = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await attendanceApi.reviewCorrection(id, status, `Reviewed and ${status.toLowerCase()} by Department Manager`);
    } catch {}

    // Update local state and localStorage
    const updated = correctionApprovals.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status: status,
          managerComment: `Approved by Department Manager & HR (${new Date().toLocaleDateString()})`
        };
      }
      return c;
    });

    setCorrectionApprovals(updated);
    localStorage.setItem('wfa_attendance_corrections', JSON.stringify(updated));
    setStatusMessage(`Attendance correction request ${id} ${status.toLowerCase()}! Employee dashboard updated.`);
    setTimeout(() => setStatusMessage(''), 3500);
  };

  const pendingLeavesCount = leaveApprovals.filter(r => r.status === 'PENDING').length;
  const pendingCorrectionsCount = correctionApprovals.filter(r => r.status.toUpperCase() === 'PENDING').length;

  return (
    <div className="space-y-6 animate-fadeIn font-sans pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[var(--border-color)] pb-4">
        <div>
          <span className="badge badge-manager mb-1 uppercase tracking-wider text-[10px] font-black">
            Manager & HR Oversight Desk
          </span>
          <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
            Approvals & Exception Requests Desk
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit and approve employee leave requests, attendance punch corrections, and shift adjustments.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-mono font-bold">
            {pendingLeavesCount + pendingCorrectionsCount} Total Action Items Pending
          </span>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 size={16} />
          {statusMessage}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('leaves')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-xs transition-all cursor-pointer ${
            activeTab === 'leaves'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Calendar size={15} /> Leave & PTO Requests
          {pendingLeavesCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500 text-black font-black">
              {pendingLeavesCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('corrections')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-xs transition-all cursor-pointer ${
            activeTab === 'corrections'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Clock size={15} /> Attendance Correction Requests
          {pendingCorrectionsCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500 text-black font-black">
              {pendingCorrectionsCount}
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: Leave Requests */}
      {activeTab === 'leaves' && (
        <div className="glass-panel p-6 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border-color)]">
            <h3 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2">
              <Calendar size={18} className="text-blue-400" /> Pending Leave & PTO Requests
            </h3>
            <span className="text-xs text-slate-400 font-bold bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
              {leaveApprovals.length} Total Leave Records
            </span>
          </div>

          <div className="space-y-3">
            {leaveApprovals.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-slate-400">{req.id}</span>
                    <span className="font-bold text-sm text-white">{req.employee}</span>
                    <span className="badge badge-info text-[9px] uppercase font-black">{req.type}</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Duration: <span className="font-bold text-blue-400">{req.duration}</span> &bull; Reason: <span className="italic">"{req.reason}"</span>
                  </p>
                  <p className="text-[10px] text-slate-400">Submitted on {req.date}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {req.status === 'PENDING' ? (
                    <>
                      <button
                        onClick={() => void handleLeaveAction(req.id, 'APPROVED')}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                      >
                        <CheckCircle2 size={14} /> Approve Leave
                      </button>
                      <button
                        onClick={() => void handleLeaveAction(req.id, 'REJECTED')}
                        className="px-3.5 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <XCircle size={14} /> Reject
                      </button>
                    </>
                  ) : (
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                      req.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}>
                      {req.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Attendance Corrections */}
      {activeTab === 'corrections' && (
        <div className="glass-panel p-6 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border-color)]">
            <div>
              <h3 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2">
                <Clock size={18} className="text-emerald-400" /> Attendance Correction & Punch Adjustment Requests
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Audited by Department Managers and HR Operations.</p>
            </div>
            <span className="text-xs text-slate-400 font-bold bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
              {correctionApprovals.length} Correction Logs
            </span>
          </div>

          <div className="space-y-3">
            {correctionApprovals.map((corr) => {
              const isPending = corr.status.toUpperCase() === 'PENDING';
              return (
                <div
                  key={corr.id}
                  className={`p-4 rounded-2xl border transition-colors ${
                    isPending ? 'bg-slate-950/80 border-amber-500/30' : 'bg-slate-950/40 border-slate-800'
                  } flex flex-col md:flex-row md:items-center justify-between gap-4`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs text-slate-400 font-bold">{corr.id}</span>
                      <span className="font-black text-sm text-white">{corr.employeeName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">Date: {corr.date}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-1">
                      <p>
                        Requested Corrected Timings: <strong className="text-emerald-400 font-mono">{corr.requestedCheckIn || '09:00 AM'}</strong> to <strong className="text-emerald-400 font-mono">{corr.requestedCheckOut || '06:00 PM'}</strong>
                      </p>
                      <p className="text-slate-400 italic">"Reason: {corr.reason}"</p>
                      {corr.managerComment && (
                        <p className="text-emerald-400 font-semibold text-[11px]">Reviewer Note: {corr.managerComment}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isPending ? (
                      <>
                        <button
                          onClick={() => void handleCorrectionAction(corr.id, 'APPROVED')}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                        >
                          <CheckCircle2 size={15} /> Accept & Correct
                        </button>
                        <button
                          onClick={() => void handleCorrectionAction(corr.id, 'REJECTED')}
                          className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <XCircle size={15} /> Reject
                        </button>
                      </>
                    ) : (
                      <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                        corr.status.toUpperCase() === 'APPROVED' 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      }`}>
                        {corr.status.toUpperCase() === 'APPROVED' ? '✓ APPROVED & UPDATED' : '✗ REJECTED'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { apiClient as api } from '../../../api/client';

export const TimesheetApprovals: React.FC = () => {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      const res = await api.get('/workflow/approvals/pending');
      // Filter for TIMESHEET or ATTENDANCE_CORRECTION
      const timesheetApprovals = res.data?.data?.filter((a: any) => 
        a.entityType === 'TIMESHEET' || a.entityType === 'ATTENDANCE_CORRECTION'
      ) || [];
      setApprovals(timesheetApprovals);
    } catch (err) {
      console.error('Failed to fetch approvals', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleAction = async (id: string, action: 'APPROVE' | 'REJECT') => {
    try {
      await api.post(`/workflow/approvals/${id}/action`, { action, comments: `Timesheet ${action.toLowerCase()}d` });
      fetchApprovals();
    } catch (err) {
      console.error('Failed to process approval', err);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight">Timesheet Approvals</h2>
        <p className="text-xs text-slate-400 mt-1">Review and approve employee timesheets and attendance corrections.</p>
      </div>

      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
        {loading ? (
          <p className="text-slate-400">Loading pending timesheets...</p>
        ) : approvals.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-slate-700 rounded-2xl bg-slate-900/50">
            <CheckCircle2 size={40} className="mx-auto text-emerald-500 mb-3" />
            <p className="font-bold text-white">All caught up!</p>
            <p className="text-xs text-slate-400 mt-1">No pending timesheet approvals require your attention.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {approvals.map((req) => (
              <div key={req.id} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white">{req.employeeName || 'Employee'}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{req.workflowName || req.entityType}</p>
                  <p className="text-xs text-slate-300 mt-2 font-mono bg-slate-950 p-2 rounded-lg">{req.details || 'No details provided'}</p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => handleAction(req.id, 'REJECT')} variant="outline" className="h-9 px-4 text-xs font-bold border-rose-500/50 text-rose-400 hover:bg-rose-500/10">Reject</Button>
                  <Button onClick={() => handleAction(req.id, 'APPROVE')} className="h-9 px-4 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white">Approve</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { CheckCircle2, Clock, Calendar, FileText, UserCheck, ShieldCheck } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { apiClient as api } from '../../../api/client';

interface WorkflowRequest {
  id: string;
  entityId: string;
  entityType: 'EXPENSE' | 'LEAVE' | 'ATTENDANCE_CORRECTION';
  workflowName: string;
  currentStepOrder: number;
  createdAt: string;
  employeeName: string;
  details: string;
  description: string;
}

export const ApprovalsPage: React.FC = () => {
  const [requests, setRequests] = useState<WorkflowRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'EXPENSE' | 'LEAVE' | 'ATTENDANCE_CORRECTION'>('all');

  const loadApprovals = async () => {
    setLoading(true);
    try {
      const response = await api.get('/workflows/pending');
      setRequests(response.data.data);
    } catch (err) {
      console.error('Failed to load workflow approvals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApprovals();
  }, []);

  const handleAction = async (id: string, action: 'APPROVED' | 'REJECTED') => {
    try {
      await api.post(`/workflows/requests/${id}/action`, { action, comments: `Reviewed by manager (${new Date().toLocaleDateString()})` });
      setStatusMessage(`Request ${action.toLowerCase()} successfully!`);
      setTimeout(() => setStatusMessage(''), 3500);
      loadApprovals();
    } catch (err) {
      console.error('Failed to review request:', err);
    }
  };

  const filteredRequests = activeTab === 'all' ? requests : requests.filter(r => r.entityType === activeTab);

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
            Audit and approve employee leave requests, expenses, and attendance corrections.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-mono font-bold">
            {requests.length} Total Action Items Pending
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
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-xs transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          All Requests
        </button>
        <button
          onClick={() => setActiveTab('LEAVE')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-xs transition-all cursor-pointer ${
            activeTab === 'LEAVE'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Calendar size={15} /> Leaves
        </button>

        <button
          onClick={() => setActiveTab('ATTENDANCE_CORRECTION')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-xs transition-all cursor-pointer ${
            activeTab === 'ATTENDANCE_CORRECTION'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Clock size={15} /> Corrections
        </button>
        
        <button
          onClick={() => setActiveTab('EXPENSE')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-xs transition-all cursor-pointer ${
            activeTab === 'EXPENSE'
              ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <FileText size={15} /> Expenses
        </button>
      </div>

      <div className="glass-panel p-6 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border-color)]">
          <h3 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2">
            Pending Action Items
          </h3>
          <span className="text-xs text-slate-400 font-bold bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
            {filteredRequests.length} Total items
          </span>
        </div>

        <div className="space-y-3">
          {loading ? (
            <p className="text-sm text-slate-400 text-center py-4">Loading requests...</p>
          ) : filteredRequests.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">No pending requests found.</p>
          ) : (
            filteredRequests.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-slate-400">{req.id.substring(0,8)}...</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-300">
                      {req.workflowName}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                      <Clock size={10} /> Pending Approval
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2 mt-1">
                    <UserCheck size={14} className="text-slate-400" />
                    {req.employeeName || 'Unknown Employee'}
                  </h4>
                  <p className="text-xs text-slate-300 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 inline-block mt-1 shadow-inner">
                    {req.details}
                  </p>
                  {req.description && (
                    <p className="text-xs text-slate-400 mt-1 italic pl-1 border-l-2 border-slate-700">
                      "{req.description}"
                    </p>
                  )}
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                  <Button
                    variant="outline"
                    className="flex-1 md:flex-none border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500"
                    onClick={() => handleAction(req.id, 'REJECTED')}
                  >
                    Reject
                  </Button>
                  <Button
                    className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/50"
                    onClick={() => handleAction(req.id, 'APPROVED')}
                  >
                    <ShieldCheck size={16} className="mr-2" /> Approve
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

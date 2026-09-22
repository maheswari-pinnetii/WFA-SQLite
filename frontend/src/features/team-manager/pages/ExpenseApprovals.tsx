import React, { useState, useEffect } from 'react';
import { IndianRupee, CheckCircle2, Receipt } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { apiClient as api } from '../../../api/client';

export const ExpenseApprovals: React.FC = () => {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      const res = await api.get('/workflow/approvals/pending');
      const expenseApprovals = res.data?.data?.filter((a: any) => a.entityType === 'EXPENSE') || [];
      setApprovals(expenseApprovals);
    } catch (err) {
      console.error('Failed to fetch expense approvals', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleAction = async (id: string, action: 'APPROVE' | 'REJECT') => {
    try {
      await api.post(`/workflow/approvals/${id}/action`, { action, comments: `Expense ${action.toLowerCase()}d` });
      fetchApprovals();
    } catch (err) {
      console.error('Failed to process expense approval', err);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight">Expense Approvals</h2>
        <p className="text-xs text-slate-400 mt-1">Review and approve team expense claims.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p className="col-span-full text-slate-400">Loading expense claims...</p>
        ) : approvals.length === 0 ? (
          <div className="col-span-full text-center py-12 border border-dashed border-slate-700 rounded-2xl bg-slate-900/50">
            <CheckCircle2 size={40} className="mx-auto text-emerald-500 mb-3" />
            <p className="font-bold text-white">All caught up!</p>
            <p className="text-xs text-slate-400 mt-1">No pending expense claims require your attention.</p>
          </div>
        ) : (
          approvals.map((req) => (
            <div key={req.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col gap-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <IndianRupee size={80} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold border border-slate-700">
                    {req.employeeName ? req.employeeName.charAt(0) : 'E'}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{req.employeeName || 'Employee'}</h3>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{req.workflowName}</p>
                  </div>
                </div>
                
                <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <p className="text-xs text-slate-300 mb-1 font-mono leading-relaxed">{req.details || 'No details provided'}</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-2 border-t border-slate-800/60 pt-4 relative z-10">
                <Button variant="ghost" size="sm" className="h-8 text-xs text-slate-400 hover:text-white" onClick={() => window.alert('No receipt provided in test data.')}>
                  <Receipt size={14} className="mr-1" /> View Receipt
                </Button>
                <div className="flex gap-2">
                  <Button onClick={() => handleAction(req.id, 'REJECT')} variant="outline" className="h-8 px-3 text-[11px] font-bold border-rose-500/50 text-rose-400 hover:bg-rose-500/10">Reject</Button>
                  <Button onClick={() => handleAction(req.id, 'APPROVE')} className="h-8 px-3 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white">Approve</Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { payrollApi } from '../../../api/endpoints/payroll.api';
import { History, TrendingUp, Calendar, User, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface SalaryRevisionHistoryPageProps {
  employeeId?: string;
}

export const SalaryRevisionHistoryPage: React.FC<SalaryRevisionHistoryPageProps> = ({ employeeId: propEmpId }) => {
  const [employeeId, setEmployeeId] = useState<string>(propEmpId || 'emp-001');
  const [revisions, setRevisions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (employeeId) {
      fetchRevisions();
    }
  }, [employeeId]);

  const fetchRevisions = async () => {
    try {
      setLoading(true);
      const data = await payrollApi.getSalaryRevisionHistory(employeeId);
      setRevisions(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto font-sans text-slate-100">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <History size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Salary Revision History Audit Trail
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Historical compensation revisions, percentage increments, approval metadata, and effective-dated salary records.
            </p>
          </div>
        </div>
      </div>

      {/* Revisions Timeline List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-2">
          <TrendingUp size={16} className="text-emerald-400" /> Historical Compensation Changes
        </h3>

        {loading ? (
          <div className="py-8 text-center text-slate-500 font-semibold text-xs">Loading salary revisions...</div>
        ) : revisions.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs">
            No salary revisions recorded for this employee. Historical structures are preserved upon revision.
          </div>
        ) : (
          <div className="space-y-4">
            {revisions.map((rev) => {
              const isIncrease = rev.newCtc >= rev.previousCtc;
              return (
                <div key={rev.id} className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-slate-700 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${isIncrease ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                      {rev.revisionPercentage > 0 ? `+${rev.revisionPercentage}%` : `${rev.revisionPercentage}%`}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-200 flex items-center gap-2">
                        <span>₹{rev.previousCtc?.toLocaleString('en-IN')}</span>
                        <span className="text-slate-500">→</span>
                        <span className="text-emerald-400">₹{rev.newCtc?.toLocaleString('en-IN')} / year</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Reason: <strong className="text-slate-300">{rev.reason}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-xs text-slate-400 font-mono">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-slate-500" />
                      <span>Effective: <strong className="text-slate-200">{rev.effectiveDate}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User size={14} className="text-slate-500" />
                      <span>Approved by: <strong className="text-slate-200">{rev.approvedBy || rev.createdBy || 'Admin'}</strong></span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

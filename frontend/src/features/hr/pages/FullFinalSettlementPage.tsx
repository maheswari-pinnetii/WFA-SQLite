import React, { useState, useEffect } from 'react';
import {
  FileCheck,
  User,
  Calculator,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Printer,
  FileSpreadsheet,
  RefreshCw,
  Plus
} from 'lucide-react';
import { useAuth } from '../../../auth/hooks/useAuth';

interface FnFSettlement {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  designation: string;
  exitDate: string;
  resignationDate?: string;
  noticePeriodDays: number;
  noticeServedDays: number;
  unpaidSalaryAmount: number;
  leaveEncashmentAmount: number;
  reimbursementAmount: number;
  noticeShortfallDeduction: number;
  gratuityAmount: number;
  otherDeductions: number;
  netSettlementAmount: number;
  status: 'DRAFT' | 'APPROVED' | 'DISBURSED';
  createdAt: string;
}

export const FullFinalSettlementPage: React.FC = () => {
  const { user } = useAuth();
  const [settlements, setSettlements] = useState<FnFSettlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // New F&F State
  const [employeeId, setEmployeeId] = useState('');
  const [exitDate, setExitDate] = useState(new Date().toISOString().split('T')[0]);
  const [noticePeriodDays, setNoticePeriodDays] = useState(30);
  const [noticeServedDays, setNoticeServedDays] = useState(30);
  const [gratuityAmount, setGratuityAmount] = useState(0);
  const [otherDeductions, setOtherDeductions] = useState(0);

  const token = localStorage.getItem('token');

  const fetchSettlements = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/payroll/fnf', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setSettlements(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch F&F settlements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettlements();
  }, []);

  const handleCalculateFnF = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId || !exitDate) return;
    try {
      const res = await fetch('/api/payroll/fnf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          employeeId,
          exitDate,
          noticePeriodDays: Number(noticePeriodDays),
          noticeServedDays: Number(noticeServedDays),
          gratuityAmount: Number(gratuityAmount),
          otherDeductions: Number(otherDeductions)
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setEmployeeId('');
        fetchSettlements();
      }
    } catch (err) {
      console.error('Failed to calculate F&F:', err);
    }
  };

  const handleApproveFnF = async (id: string) => {
    try {
      const res = await fetch(`/api/payroll/fnf/${id}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchSettlements();
      }
    } catch (err) {
      console.error('Failed to approve F&F:', err);
    }
  };

  return (
    <div className="p-6 space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileCheck className="text-emerald-600 dark:text-emerald-400" size={22} /> Full & Final (F&F) Settlement Hub
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Automated exit clearance statements, leave encashments, gratuity, notice pay recovery, and final disbursal certificates.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchSettlements}
            className="px-3 py-1.5 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1 text-slate-700 dark:text-slate-300"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="px-3.5 py-1.5 text-xs font-medium rounded-md bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-sm"
          >
            <Plus size={15} /> Prepare F&F Settlement
          </button>
        </div>
      </div>

      {/* Settlements Register */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">Employee</th>
                <th className="p-3">Exit Date</th>
                <th className="p-3">Unpaid Salary</th>
                <th className="p-3">Leave Encashment</th>
                <th className="p-3">Gratuity / Bonus</th>
                <th className="p-3">Deductions</th>
                <th className="p-3 font-bold">Net Payable (₹)</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-slate-500">Loading settlements...</td>
                </tr>
              ) : settlements.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-slate-500">No Full & Final settlement records found.</td>
                </tr>
              ) : (
                settlements.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-3">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{s.employeeName}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{s.employeeCode} · {s.department}</p>
                    </td>
                    <td className="p-3 font-mono">{s.exitDate}</td>
                    <td className="p-3 font-mono text-emerald-600">₹{s.unpaidSalaryAmount.toLocaleString('en-IN')}</td>
                    <td className="p-3 font-mono text-emerald-600">₹{s.leaveEncashmentAmount.toLocaleString('en-IN')}</td>
                    <td className="p-3 font-mono text-emerald-600">₹{s.gratuityAmount.toLocaleString('en-IN')}</td>
                    <td className="p-3 font-mono text-rose-600">₹{(s.noticeShortfallDeduction + s.otherDeductions).toLocaleString('en-IN')}</td>
                    <td className="p-3 font-bold text-slate-900 dark:text-slate-100 font-mono text-sm">
                      ₹{s.netSettlementAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3">
                      {s.status === 'APPROVED' ? (
                        <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">APPROVED</span>
                      ) : (
                        <span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400">DRAFT</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {s.status === 'DRAFT' && (
                        <button
                          onClick={() => handleApproveFnF(s.id)}
                          className="px-2.5 py-1 text-xs font-medium rounded bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                          Approve Statement
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Prepare F&F Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg max-w-md w-full p-5 space-y-4 shadow-xl">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Calculator size={18} className="text-emerald-500" /> Prepare Exit Settlement
            </h2>
            <form onSubmit={handleCalculateFnF} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Employee ID *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. emp-001 or UUID"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full p-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Exit Date *</label>
                <input
                  type="date"
                  required
                  value={exitDate}
                  onChange={(e) => setExitDate(e.target.value)}
                  className="w-full p-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Notice Days</label>
                  <input
                    type="number"
                    value={noticePeriodDays}
                    onChange={(e) => setNoticePeriodDays(Number(e.target.value))}
                    className="w-full p-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Notice Served</label>
                  <input
                    type="number"
                    value={noticeServedDays}
                    onChange={(e) => setNoticeServedDays(Number(e.target.value))}
                    className="w-full p-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Gratuity (₹)</label>
                <input
                  type="number"
                  value={gratuityAmount}
                  onChange={(e) => setGratuityAmount(Number(e.target.value))}
                  className="w-full p-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Other Deductions (₹)</label>
                <input
                  type="number"
                  value={otherDeductions}
                  onChange={(e) => setOtherDeductions(Number(e.target.value))}
                  className="w-full p-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 rounded text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                >
                  Calculate & Generate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

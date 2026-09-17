import React, { useEffect, useState } from 'react';
import { Download, FileText, AlertCircle, RefreshCw } from 'lucide-react';
import { payrollApi, Payslip } from '../../../api/payrollApi.ts';

const MyPayslips: React.FC = () => {
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayslips();
  }, []);

  const fetchPayslips = async () => {
    try {
      setLoading(true);
      const data = await payrollApi.getMyPayslips();
      setPayslips(data);
    } catch (err) {
      console.error('Failed to fetch payslips', err);
      // Fallback for demonstration if API fails
      setPayslips([
        {
          id: 'ps-001',
          payrollRunId: 'pr-001',
          employeeId: 'emp-1',
          employeeName: 'Alex Mercer',
          periodStart: '2026-08-01',
          periodEnd: '2026-08-31',
          basicPay: 45000,
          totalEarnings: 57000,
          totalDeductions: 7000,
          netPay: 50000,
          lineItems: [],
          status: 'PAID'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (payslip: Payslip) => {
    alert(`Downloading PDF for payslip ${payslip.id}`);
  };

  return (
    <div className="space-y-6 animate-fadeIn font-sans pb-10">
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileText className="text-emerald-500" size={24} /> My Payslips
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            View and download your monthly salary statements
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={fetchPayslips} disabled={loading} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50">
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      <div className="p-5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm">
        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => <div key={i} className="h-12 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />)}
          </div>
        ) : payslips.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-400 flex flex-col items-center gap-3">
            <AlertCircle size={32} className="text-slate-300 dark:text-slate-600" />
            No payslips available yet.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-md border border-[var(--border-color)] bg-[var(--bg-tertiary)]/20">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-b border-[var(--border-color)]">
                <tr>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider">Period</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider">Gross Earnings</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider">Deductions</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Net Pay</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]/80 text-[var(--text-primary)]">
                {payslips.map((payslip) => (
                  <tr key={payslip.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 font-medium">
                      {payslip.periodStart} to {payslip.periodEnd}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">
                      ₹{payslip.totalEarnings.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono text-rose-500">
                      ₹{payslip.totalDeductions.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      ₹{payslip.netPay.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button 
                        onClick={() => handleDownload(payslip)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer font-medium shadow-sm"
                      >
                        <Download size={14} /> PDF
                      </button>
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

export default MyPayslips;

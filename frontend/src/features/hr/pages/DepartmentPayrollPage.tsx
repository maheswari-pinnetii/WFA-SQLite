import React, { useState, useEffect } from 'react';
import { payrollApi } from '../../../api/endpoints/payroll.api';
import { Building2, Users, DollarSign, PieChart, ShieldCheck } from 'lucide-react';

export const DepartmentPayrollPage: React.FC = () => {
  const [summary, setSummary] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDepartmentSummary();
  }, []);

  const fetchDepartmentSummary = async () => {
    try {
      setLoading(true);
      const data = await payrollApi.getDepartmentSummary();
      setSummary(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalOrgCtc = summary.reduce((acc, curr) => acc + (curr.totalCtc || curr.estimatedMonthlyGross * 12 || 0), 0);
  const totalOrgNet = summary.reduce((acc, curr) => acc + (curr.totalNetPay || 0), 0);
  const totalOrgEmp = summary.reduce((acc, curr) => acc + (curr.employeeCount || 0), 0);

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto font-sans text-slate-100">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Building2 size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Department-Wise Payroll & Cost Breakdown
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Aggregated organization payroll expense metrics by department, headcount distribution, and statutory liabilities.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 font-medium block">Total Payroll Headcount</span>
          <span className="text-xl font-bold font-mono text-slate-100">{totalOrgEmp} Employees</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 font-medium block">Total Annual CTC Budget</span>
          <span className="text-xl font-bold font-mono text-emerald-400">₹{totalOrgCtc.toLocaleString('en-IN')}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 font-medium block">Total Monthly Net Pay</span>
          <span className="text-xl font-bold font-mono text-emerald-400">₹{totalOrgNet.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Department Summary Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <PieChart size={14} className="text-emerald-400" /> Department Breakdown Table
          </h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[900px]">
            <thead className="bg-slate-950 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4 text-center">Headcount</th>
                <th className="py-3 px-4 text-right">Total CTC (₹)</th>
                <th className="py-3 px-4 text-right">Gross Pay (₹)</th>
                <th className="py-3 px-4 text-right">EPF + ESI (₹)</th>
                <th className="py-3 px-4 text-right">TDS Tax (₹)</th>
                <th className="py-3 px-4 text-right">LOP Deduction (₹)</th>
                <th className="py-3 px-4 text-right font-bold text-emerald-400">Net Disbursed (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 font-semibold font-sans">
                    Loading department metrics...
                  </td>
                </tr>
              ) : summary.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 font-semibold font-sans">
                    No department payroll data available.
                  </td>
                </tr>
              ) : (
                summary.map((row: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-100 font-sans">{row.department || 'General'}</td>
                    <td className="py-3 px-4 text-center text-slate-300 font-sans">{row.employeeCount}</td>
                    <td className="py-3 px-4 text-right text-slate-300">₹{(row.totalCtc || row.estimatedMonthlyGross * 12 || 0).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-right text-slate-200 font-bold">₹{(row.totalGross || row.estimatedMonthlyGross || 0).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-right text-rose-400">₹{((row.totalPf || 0) + (row.totalEsi || 0)).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-right text-rose-400">₹{(row.totalTds || 0).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-right text-rose-400">₹{(row.totalLop || 0).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-right text-emerald-400 font-extrabold text-sm font-sans">
                      ₹{(row.totalNetPay || 0).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

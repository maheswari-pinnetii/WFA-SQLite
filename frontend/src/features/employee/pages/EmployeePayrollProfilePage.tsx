import React, { useState, useEffect } from 'react';
import { payrollApi } from '../../../api/endpoints/payroll.api';
import { User, DollarSign, FileText, History, PieChart, ShieldCheck, Download } from 'lucide-react';

export const EmployeePayrollProfilePage: React.FC<{ employeeId?: string }> = ({ employeeId: propEmpId }) => {
  const [employeeId, setEmployeeId] = useState<string>(propEmpId || 'emp-001');
  const [structure, setStructure] = useState<any>(null);
  const [revisions, setRevisions] = useState<any[]>([]);
  const [payslips, setPayslips] = useState<any[]>([]);
  const [ytd, setYtd] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (employeeId) {
      loadProfileData();
    }
  }, [employeeId]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const [structData, revData, psData, ytdData] = await Promise.all([
        payrollApi.getSalaryStructure(employeeId).catch(() => null),
        payrollApi.getSalaryRevisionHistory(employeeId).catch(() => []),
        payrollApi.getMyPayslips().catch(() => []),
        payrollApi.getEmployeeYtd(employeeId).catch(() => null)
      ]);

      setStructure(structData);
      setRevisions(revData || []);
      setPayslips(psData || []);
      setYtd(ytdData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1300px] mx-auto font-sans text-slate-100">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <User size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              Employee Compensation & Payroll Hub
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Complete profile view of effective salary structures, revision history, payslips, and YTD financial summaries.
            </p>
          </div>
        </div>
      </div>

      {/* YTD Cards Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 block font-medium">YTD Gross Earnings</span>
          <span className="text-lg font-bold font-mono text-slate-100">₹{(ytd?.ytdGross || 0).toLocaleString('en-IN')}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-rose-400 block font-medium">YTD EPF Contribution</span>
          <span className="text-lg font-bold font-mono text-rose-400">₹{(ytd?.ytdPf || 0).toLocaleString('en-IN')}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-rose-400 block font-medium">YTD TDS Income Tax</span>
          <span className="text-lg font-bold font-mono text-rose-400">₹{(ytd?.ytdTds || 0).toLocaleString('en-IN')}</span>
        </div>
        <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-4">
          <span className="text-xs text-emerald-400 block font-bold">YTD Net Take-Home</span>
          <span className="text-xl font-extrabold font-mono text-emerald-400">₹{(ytd?.ytdNetPay || 0).toLocaleString('en-IN')}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Effective Structure */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-2">
            <DollarSign size={16} className="text-emerald-400" /> Active Effective Salary Structure
          </h3>

          {structure ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono">
                <span className="text-xs text-slate-400 font-sans">Annual CTC</span>
                <span className="text-base font-bold text-emerald-400">₹{(structure.annualCtc || structure.baseSalary * 12 || 0).toLocaleString('en-IN')}</span>
              </div>

              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 text-[10px] uppercase">
                  <tr>
                    <th className="py-2 px-3">Component</th>
                    <th className="py-2 px-3">Type</th>
                    <th className="py-2 px-3 text-right">Monthly</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {(structure.components || []).map((c: any, i: number) => (
                    <tr key={i}>
                      <td className="py-2 px-3 text-slate-200 font-sans font-semibold">{c.name || c.componentName}</td>
                      <td className="py-2 px-3 font-sans">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.type === 'EARNING' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                          {c.type}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right text-slate-100">₹{c.amount?.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-xs text-slate-500 py-6 text-center">No salary structure assigned.</div>
          )}
        </div>

        {/* Payslips History */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-2">
            <FileText size={16} className="text-emerald-400" /> Issued Payslips History
          </h3>

          {payslips.length === 0 ? (
            <div className="text-xs text-slate-500 py-6 text-center">No finalized payslips available for download yet.</div>
          ) : (
            <div className="space-y-3">
              {payslips.map((ps) => (
                <div key={ps.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between hover:border-slate-700 transition-colors">
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">
                      Pay Period: {ps.periodStart} to {ps.periodEnd}
                    </span>
                    <span className="text-[11px] font-mono text-emerald-400">Net Take-Home: ₹{ps.netPay?.toLocaleString('en-IN')}</span>
                  </div>
                  <a
                    href={`http://localhost:5000/api/payroll/payslips/${ps.id}/pdf`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1 transition-colors"
                  >
                    <Download size={12} /> PDF
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

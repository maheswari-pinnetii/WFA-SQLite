import React, { useState, useEffect } from 'react';
import { payrollApi } from '../../../api/endpoints/payroll.api';
import { FileSpreadsheet, Download, Search, Filter, RefreshCw, DollarSign } from 'lucide-react';

export const PayrollRegisterPage: React.FC = () => {
  const [runs, setRuns] = useState<any[]>([]);
  const [selectedRunId, setSelectedRunId] = useState<string>('');
  const [registerData, setRegisterData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');

  useEffect(() => {
    loadRuns();
  }, []);

  useEffect(() => {
    if (selectedRunId) {
      loadRegister(selectedRunId);
    }
  }, [selectedRunId]);

  const loadRuns = async () => {
    try {
      const data = await payrollApi.getPayrollRuns();
      setRuns(data || []);
      if (data && data.length > 0) {
        setSelectedRunId(data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadRegister = async (runId: string) => {
    try {
      setLoading(true);
      const res = await payrollApi.getPayrollRegister(runId);
      setRegisterData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const exportCsv = () => {
    if (!registerData || !registerData.employees) return;
    const headers = ['Employee ID', 'Employee Name', 'Department', 'Designation', 'Basic Pay', 'HRA', 'Special Allowance', 'Overtime Pay', 'Gross Earnings', 'Reimbursements', 'Employee PF', 'ESI', 'PT', 'TDS', 'LOP Deduction', 'Total Deductions', 'Net Pay'];
    
    const rows = registerData.employees.map((e: any) => [
      e.employeeCode || e.employeeId,
      `"${e.employeeName}"`,
      `"${e.department || 'General'}"`,
      `"${e.designation || 'Specialist'}"`,
      e.basicPay || 0,
      e.hra || 0,
      e.specialAllowance || 0,
      e.overtimePay || 0,
      e.grossEarnings || 0,
      e.eligibleReimbursements || 0,
      e.employeePf || 0,
      e.employeeEsi || 0,
      e.professionalTax || 0,
      e.tdsDeduction || 0,
      e.lopDeduction || 0,
      e.totalDeductions || 0,
      e.netPay || 0
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Payroll_Register_${registerData.run?.periodStart || 'export'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredEmployees = (registerData?.employees || []).filter((e: any) => {
    const matchesSearch = (e.employeeName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (e.employeeCode || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'ALL' || e.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const departments = Array.from(new Set((registerData?.employees || []).map((e: any) => e.department).filter(Boolean)));

  return (
    <div className="p-6 space-y-6 max-w-[1500px] mx-auto font-sans text-slate-100">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <FileSpreadsheet size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Enterprise Payroll Register
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Comprehensive salary register report with component earnings, statutory deductions, TDS, LOP, and net pay.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedRunId}
            onChange={(e) => setSelectedRunId(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs font-semibold text-slate-200 focus:outline-none"
          >
            {runs.map((r) => (
              <option key={r.id} value={r.id}>
                {r.periodStart} to {r.periodEnd} ({r.status})
              </option>
            ))}
          </select>

          <button
            onClick={exportCsv}
            disabled={!registerData}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-md disabled:opacity-40"
          >
            <Download size={14} /> Export CSV Register
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search employee name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Filter size={14} className="text-slate-400" />
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300"
          >
            <option value="ALL">All Departments</option>
            {departments.map((d: any) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[1200px]">
            <thead className="bg-slate-950 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Emp Code</th>
                <th className="py-3 px-4">Employee Name</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4 text-right">Basic Pay</th>
                <th className="py-3 px-4 text-right">HRA</th>
                <th className="py-3 px-4 text-right">Allowances</th>
                <th className="py-3 px-4 text-right">Overtime</th>
                <th className="py-3 px-4 text-right">Gross Earnings</th>
                <th className="py-3 px-4 text-right">Reimbursements</th>
                <th className="py-3 px-4 text-right text-rose-400">EPF</th>
                <th className="py-3 px-4 text-right text-rose-400">ESI</th>
                <th className="py-3 px-4 text-right text-rose-400">PT</th>
                <th className="py-3 px-4 text-right text-rose-400">TDS</th>
                <th className="py-3 px-4 text-right text-rose-400">LOP</th>
                <th className="py-3 px-4 text-right font-bold text-slate-200">Net Take-Home</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {loading ? (
                <tr>
                  <td colSpan={15} className="py-8 text-center text-slate-500 font-semibold font-sans">
                    Loading register data...
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={15} className="py-8 text-center text-slate-500 font-semibold font-sans">
                    No payroll register records found for selection.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((e: any) => (
                  <tr key={e.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-emerald-400 font-bold font-sans">{e.employeeCode || e.employeeId.slice(0, 8)}</td>
                    <td className="py-3 px-4 text-slate-100 font-bold font-sans">{e.employeeName}</td>
                    <td className="py-3 px-4 text-slate-400 font-sans">{e.department || 'General'}</td>
                    <td className="py-3 px-4 text-right text-slate-300">₹{(e.basicPay || 0).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-right text-slate-300">₹{(e.hra || 0).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-right text-slate-300">₹{(e.specialAllowance || 0).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-right text-slate-300">₹{(e.overtimePay || 0).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-right text-slate-100 font-bold">₹{(e.grossEarnings || 0).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-right text-emerald-400">₹{(e.eligibleReimbursements || 0).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-right text-rose-400">₹{(e.employeePf || 0).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-right text-rose-400">₹{(e.employeeEsi || 0).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-right text-rose-400">₹{(e.professionalTax || 0).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-right text-rose-400">₹{(e.tdsDeduction || 0).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-right text-rose-400">₹{(e.lopDeduction || 0).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-right text-emerald-400 font-extrabold text-sm font-sans">
                      ₹{(e.netPay || 0).toLocaleString('en-IN')}
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

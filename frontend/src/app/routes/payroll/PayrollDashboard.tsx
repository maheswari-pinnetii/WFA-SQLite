import React, { useEffect, useState } from 'react';
import { payrollApi, PayrollRun } from '../../../api/payrollApi';
import { MinimalKpiCard } from '../../../components/cards/MinimalKpiCard';
import { 
  FileText, 
  DollarSign, 
  Activity, 
  Users, 
  Plus, 
  CheckCircle2, 
  Play, 
  RefreshCw, 
  AlertCircle,
  FileBarChart
} from 'lucide-react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button as MuiButton } from '@mui/material';

const PayrollDashboard: React.FC = () => {
  const [runs, setRuns] = useState<PayrollRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCreate, setOpenCreate] = useState(false);
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRuns();
  }, []);

  const fetchRuns = async () => {
    try {
      setLoading(true);
      const data = await payrollApi.getPayrollRuns();
      setRuns(data);
    } catch (err) {
      console.error('Failed to fetch payroll runs', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRun = async () => {
    try {
      setSubmitting(true);
      await payrollApi.createPayrollRun(month, year);
      setOpenCreate(false);
      fetchRuns();
    } catch (err) {
      console.error(err);
      alert('Failed to create run');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerate = async (runId: string) => {
    try {
      await payrollApi.generatePayslips(runId);
      alert('Payslips generated successfully!');
      fetchRuns();
    } catch (err) {
      console.error(err);
      alert('Failed to generate payslips');
    }
  };

  const handleFinalize = async (runId: string) => {
    if (!window.confirm('Are you sure? This will lock the payslips permanently.')) return;
    try {
      await payrollApi.finalizePayrollRun(runId);
      alert('Payroll finalized!');
      fetchRuns();
    } catch (err) {
      console.error(err);
      alert('Failed to finalize');
    }
  };

  return (
    <div className="p-6 space-y-6 font-sans max-w-[1400px] mx-auto">
      {/* Header section */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <DollarSign size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Payroll Processing & Analytics
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Manage salary disbursements, compliance, and tax deductions
            </p>
          </div>
        </div>

        <button 
          onClick={() => setOpenCreate(true)}
          className="px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm flex items-center gap-2 transition-colors shadow-sm whitespace-nowrap"
        >
          <Plus size={16} /> New Payroll Run
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MinimalKpiCard title="Active Payroll Runs" value={runs.filter(r => r.status === 'DRAFT').length.toString()} icon={<Activity size={26} />} iconBgColor="amber" trend="Pending Generation" />
        <MinimalKpiCard title="Total Finalized" value={runs.filter(r => r.status === 'FINALIZED').length.toString()} icon={<CheckCircle2 size={26} />} iconBgColor="emerald" trend="Completed Runs" />
        <MinimalKpiCard title="Total Employees" value="142" icon={<Users size={26} />} iconBgColor="blue" trend="Active on Payroll" />
        <MinimalKpiCard title="Compliance Status" value="100%" icon={<FileText size={26} />} iconBgColor="purple" trend="Tax Deductions" />
      </div>

      {/* Payroll Runs Table */}
      <div className="glass-panel p-6 shadow-xl bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl space-y-4 flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]/60">
          <div>
            <h3 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2">
              <FileBarChart size={18} className="text-emerald-500" /> Payroll Runs History
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">All payroll cycles processed in the system</p>
          </div>
          <button onClick={fetchRuns} className="text-slate-400 hover:text-emerald-400 transition-colors p-2 rounded-full hover:bg-slate-800/50">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)]/20">
          <table className="w-full text-left text-xs min-w-[750px]">
            <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-5">Period</th>
                <th className="py-3.5 px-5">Run Date</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading && runs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-500 font-semibold">
                    <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-emerald-500/50" />
                    Loading payroll data...
                  </td>
                </tr>
              ) : runs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-500 font-semibold">
                    <AlertCircle size={24} className="mx-auto mb-2 text-slate-600" />
                    No payroll runs found in the system.
                  </td>
                </tr>
              ) : (
                runs.map((run) => {
                  const isDraft = run.status === 'DRAFT';
                  const isFinalized = run.status === 'FINALIZED';
                  
                  return (
                    <tr key={run.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-5 font-bold text-white">
                        {run.periodStart} <span className="text-slate-500 font-normal mx-1">to</span> {run.periodEnd}
                      </td>
                      <td className="py-3.5 px-5 text-slate-300 font-mono">
                        {new Date(run.runDate).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                          isDraft 
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' 
                            : isFinalized 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                        }`}>
                          {run.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right flex items-center justify-end gap-2">
                        {isDraft && (
                          <>
                            <button 
                              onClick={() => handleGenerate(run.id)}
                              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold border border-slate-700 flex items-center gap-1 transition-colors"
                            >
                              <Play size={12} className="text-amber-400" /> Generate
                            </button>
                            <button 
                              onClick={() => handleFinalize(run.id)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-[11px] font-bold border border-emerald-500/30 flex items-center gap-1 transition-colors"
                            >
                              <CheckCircle2 size={12} /> Finalize
                            </button>
                          </>
                        )}
                        {!isDraft && (
                          <button className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold border border-slate-700 transition-colors">
                            View Report
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} PaperProps={{ className: 'dark:bg-slate-900 dark:text-slate-100' }}>
        <DialogTitle className="font-bold border-b border-slate-200 dark:border-slate-800">
          Create New Payroll Run
        </DialogTitle>
        <DialogContent className="pt-6">
          <div className="flex gap-4 mt-2">
            <TextField 
              label="Month (1-12)" 
              type="number" 
              value={month} 
              onChange={(e) => setMonth(Number(e.target.value))}
              fullWidth
            />
            <TextField 
              label="Year" 
              type="number" 
              value={year} 
              onChange={(e) => setYear(Number(e.target.value))}
              fullWidth
            />
          </div>
        </DialogContent>
        <DialogActions className="border-t border-slate-200 dark:border-slate-800 p-4">
          <MuiButton onClick={() => setOpenCreate(false)} color="inherit">Cancel</MuiButton>
          <MuiButton 
            variant="contained" 
            onClick={handleCreateRun} 
            disabled={submitting}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {submitting ? 'Creating...' : 'Create Run'}
          </MuiButton>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PayrollDashboard;


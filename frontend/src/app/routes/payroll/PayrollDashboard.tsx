import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  FileBarChart,
  Calculator,
  Building2,
  FileSpreadsheet,
  ShieldCheck,
  Eye
} from 'lucide-react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button as MuiButton } from '@mui/material';

const PayrollDashboard: React.FC = () => {
  const navigate = useNavigate();
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
      setRuns(data || []);
    } catch (err) {
      console.error('Failed to fetch payroll runs', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRun = async () => {
    try {
      setSubmitting(true);
      const res = await payrollApi.createPayrollRun(month, year);
      setOpenCreate(false);
      fetchRuns();
      if (res && res.id) {
        navigate(`/payroll/runs/${res.id}`);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to create run');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6 font-sans max-w-[1400px] mx-auto text-slate-100">
      {/* Header section */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <DollarSign size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              Enterprise Payroll & Compensation Control Center
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              End-to-end salary structures, statutory compliance, tax engine, approvals, and disbursement lifecycle.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setOpenCreate(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-lg whitespace-nowrap"
          >
            <Plus size={16} /> Start Payroll Run
          </button>
        </div>
      </div>

      {/* Quick Access Toolbar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => navigate('/payroll/ctc-calculator')}
          className="p-4 bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-xl flex items-center gap-3 transition-colors text-left"
        >
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400"><Calculator size={18} /></div>
          <div>
            <span className="text-xs font-bold text-slate-200 block">CTC Calculator</span>
            <span className="text-[10px] text-slate-400">Simulate compensation packages</span>
          </div>
        </button>

        <button
          onClick={() => navigate('/payroll/register')}
          className="p-4 bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-xl flex items-center gap-3 transition-colors text-left"
        >
          <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400"><FileSpreadsheet size={18} /></div>
          <div>
            <span className="text-xs font-bold text-slate-200 block">Payroll Register</span>
            <span className="text-[10px] text-slate-400">Detailed register reports & export</span>
          </div>
        </button>

        <button
          onClick={() => navigate('/payroll/departments')}
          className="p-4 bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-xl flex items-center gap-3 transition-colors text-left"
        >
          <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400"><Building2 size={18} /></div>
          <div>
            <span className="text-xs font-bold text-slate-200 block">Department Summary</span>
            <span className="text-[10px] text-slate-400">Department cost allocation</span>
          </div>
        </button>

        <button
          onClick={() => navigate('/payroll/tax-declarations')}
          className="p-4 bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-xl flex items-center gap-3 transition-colors text-left"
        >
          <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400"><ShieldCheck size={18} /></div>
          <div>
            <span className="text-xs font-bold text-slate-200 block">Tax & Regimes</span>
            <span className="text-[10px] text-slate-400">Old vs New regime & Form 16</span>
          </div>
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MinimalKpiCard title="Active Draft Runs" value={runs.filter(r => r.status === 'DRAFT' || r.status === 'CALCULATED').length.toString()} icon={<Activity size={26} />} iconBgColor="amber" trend="Pending Approval" />
        <MinimalKpiCard title="Total Finalized Runs" value={runs.filter(r => r.status === 'FINALIZED').length.toString()} icon={<CheckCircle2 size={26} />} iconBgColor="emerald" trend="Completed & Issued" />
        <MinimalKpiCard 
          title="Statutory Compliance" 
          value={runs.length > 0 ? `${Math.round(((runs.filter(r => r.status === 'FINALIZED' || r.status === 'APPROVED').length) / runs.length) * 100)}%` : '100%'} 
          icon={<FileText size={26} />} 
          iconBgColor="purple" 
          trend={`${runs.filter(r => r.status === 'DRAFT').length} Active Draft(s)`} 
        />
        <MinimalKpiCard title="Payroll Coverage" value="Active" icon={<Users size={26} />} iconBgColor="blue" trend="All Departments" />
      </div>


      {/* Payroll Runs Table */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <FileBarChart size={18} className="text-emerald-500" /> Payroll Cycles History
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">All draft, validated, approved, and finalized payroll cycles</p>
          </div>
          <button onClick={fetchRuns} className="text-slate-400 hover:text-emerald-400 transition-colors p-2 rounded-full hover:bg-slate-800">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/40">
          <table className="w-full text-left text-xs min-w-[750px]">
            <thead className="bg-slate-950 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-5">Payroll Period</th>
                <th className="py-3.5 px-5">Created Date</th>
                <th className="py-3.5 px-5">Lifecycle Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {loading && runs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-500 font-semibold font-sans">
                    <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-emerald-500/50" />
                    Loading payroll cycles...
                  </td>
                </tr>
              ) : runs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-500 font-semibold font-sans">
                    <AlertCircle size={24} className="mx-auto mb-2 text-slate-600" />
                    No payroll runs found in the system. Click "Start Payroll Run" to begin.
                  </td>
                </tr>
              ) : (
                runs.map((run) => (
                  <tr key={run.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-white font-sans">
                      {run.periodStart} <span className="text-slate-500 font-normal mx-1">to</span> {run.periodEnd}
                    </td>
                    <td className="py-3.5 px-5 text-slate-300">
                      {new Date(run.runDate).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-5 font-sans">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                        run.status === 'FINALIZED'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : run.status === 'LOCKED'
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                          : run.status === 'APPROVED'
                          ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40'
                          : run.status === 'PENDING_APPROVAL'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}>
                        {run.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right flex items-center justify-end gap-2 font-sans">
                      <button 
                        onClick={() => navigate(`/payroll/runs/${run.id}`)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-[11px] font-bold border border-emerald-500/30 flex items-center gap-1 transition-colors"
                      >
                        <Eye size={12} /> Open Workspace
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} slotProps={{ paper: { className: 'bg-slate-900 text-slate-100 border border-slate-800' } }}>
        <DialogTitle className="font-bold border-b border-slate-800 text-white">
          Start New Monthly Payroll Run
        </DialogTitle>
        <DialogContent className="pt-6">
          <div className="flex gap-4 mt-2">
            <TextField 
              label="Month (1-12)" 
              type="number" 
              value={month} 
              onChange={(e) => setMonth(Number(e.target.value))}
              fullWidth
              slotProps={{ input: { className: 'text-white' }, inputLabel: { className: 'text-slate-400' } }}
            />
            <TextField 
              label="Year" 
              type="number" 
              value={year} 
              onChange={(e) => setYear(Number(e.target.value))}
              fullWidth
              slotProps={{ input: { className: 'text-white' }, inputLabel: { className: 'text-slate-400' } }}
            />
          </div>
        </DialogContent>
        <DialogActions className="border-t border-slate-800 p-4">
          <MuiButton onClick={() => setOpenCreate(false)} color="inherit">Cancel</MuiButton>
          <MuiButton 
            variant="contained" 
            onClick={handleCreateRun} 
            disabled={submitting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {submitting ? 'Creating...' : 'Create Run'}
          </MuiButton>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PayrollDashboard;

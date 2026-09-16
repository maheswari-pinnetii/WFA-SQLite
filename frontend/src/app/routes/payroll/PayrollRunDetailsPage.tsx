import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { payrollApi, PayrollRun, Payslip, PayrollValidationIssue } from '../../../api/endpoints/payroll.api';
import { 
  Play, 
  CheckCircle2, 
  ShieldAlert, 
  Lock, 
  RotateCcw, 
  AlertTriangle, 
  FileText, 
  Users, 
  DollarSign, 
  ArrowLeft,
  RefreshCw,
  Send,
  XCircle
} from 'lucide-react';

export const PayrollRunDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [run, setRun] = useState<PayrollRun | null>(null);
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [validation, setValidation] = useState<{ isValid: boolean; issues: PayrollValidationIssue[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const runs = await payrollApi.getPayrollRuns();
      const currentRun = runs.find((r: PayrollRun) => r.id === id);
      setRun(currentRun || null);

      if (currentRun) {
        const ps = await payrollApi.getRunPayslips(id);
        setPayslips(ps || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculate = async () => {
    if (!id) return;
    try {
      setActionLoading(true);
      await payrollApi.calculateRun(id);
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Calculation failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleValidate = async () => {
    if (!id) return;
    try {
      setActionLoading(true);
      const res = await payrollApi.validateRun(id);
      setValidation(res);
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Validation failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!id) return;
    try {
      setActionLoading(true);
      await payrollApi.submitRun(id);
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Submit failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!id) return;
    try {
      setActionLoading(true);
      await payrollApi.approveRun(id);
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Approval failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!id || !rejectReason) return;
    try {
      setActionLoading(true);
      await payrollApi.rejectRun(id, rejectReason);
      setShowRejectModal(false);
      setRejectReason('');
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Rejection failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLock = async () => {
    if (!id || !window.confirm('Locking this payroll run makes calculations permanently immutable. Proceed?')) return;
    try {
      setActionLoading(true);
      await payrollApi.lockRun(id);
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Lock failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFinalize = async () => {
    if (!id || !window.confirm('Finalizing will issue employee payslips and update YTD tax records. Proceed?')) return;
    try {
      setActionLoading(true);
      await payrollApi.finalizeRun(id);
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Finalization failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRollback = async () => {
    const reason = window.prompt('Enter reason for rollback:');
    if (!id || !reason) return;
    try {
      setActionLoading(true);
      await payrollApi.rollbackRun(id, reason);
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Rollback failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReverse = async () => {
    const reason = window.prompt('Enter reason for reversal of finalized payroll:');
    if (!id || !reason) return;
    try {
      setActionLoading(true);
      await payrollApi.reverseRun(id, reason);
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Reversal failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-400 font-semibold">Loading payroll run details...</div>;
  }

  if (!run) {
    return <div className="p-8 text-center text-rose-400 font-semibold">Payroll run not found.</div>;
  }

  const stages = ['DRAFT', 'CALCULATED', 'VALIDATED', 'PENDING_APPROVAL', 'APPROVED', 'LOCKED', 'FINALIZED'];
  const currentStageIndex = stages.indexOf(run.status);

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto font-sans text-slate-100">
      {/* Header & Back Button */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => navigate('/payroll/dashboard')}
          className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Runs
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Run ID: <code className="text-emerald-400 font-mono">{run.id.slice(0, 8)}</code></span>
        </div>
      </div>

      {/* Main Status & Action Hub */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-3">
              Payroll Run Cycle ({run.periodStart} to {run.periodEnd})
              <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                {run.status}
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Organized calculation, validation, multi-tier approval, locking, and finalization lifecycle.
            </p>
          </div>

          {/* Lifecycle Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {(run.status === 'DRAFT' || run.status === 'CALCULATED' || run.status === 'VALIDATED') && (
              <button
                onClick={handleCalculate}
                disabled={actionLoading}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-colors"
              >
                <Play size={14} className="text-amber-400" /> Calculate Run
              </button>
            )}

            {run.status === 'CALCULATED' && (
              <button
                onClick={handleValidate}
                disabled={actionLoading}
                className="px-4 py-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs font-bold border border-blue-500/30 flex items-center gap-1.5 transition-colors"
              >
                <ShieldAlert size={14} /> Validate
              </button>
            )}

            {(run.status === 'CALCULATED' || run.status === 'VALIDATED') && (
              <button
                onClick={handleSubmit}
                disabled={actionLoading}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Send size={14} /> Submit for Approval
              </button>
            )}

            {run.status === 'PENDING_APPROVAL' && (
              <>
                <button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <CheckCircle2 size={14} /> Approve Run
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 text-xs font-bold border border-rose-500/30 flex items-center gap-1.5 transition-colors"
                >
                  <XCircle size={14} /> Reject
                </button>
              </>
            )}

            {run.status === 'APPROVED' && (
              <button
                onClick={handleLock}
                disabled={actionLoading}
                className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Lock size={14} /> Lock Payroll
              </button>
            )}

            {(run.status === 'LOCKED' || run.status === 'APPROVED') && (
              <button
                onClick={handleFinalize}
                disabled={actionLoading}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md"
              >
                <CheckCircle2 size={14} /> Finalize & Issue Payslips
              </button>
            )}

            {run.status !== 'FINALIZED' && run.status !== 'ROLLED_BACK' && run.status !== 'REVERSED' && (
              <button
                onClick={handleRollback}
                disabled={actionLoading}
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <RotateCcw size={13} /> Rollback
              </button>
            )}

            {run.status === 'FINALIZED' && (
              <button
                onClick={handleReverse}
                disabled={actionLoading}
                className="px-4 py-2 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 text-xs font-bold border border-rose-500/30 flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw size={14} /> Reverse Finalized Run
              </button>
            )}
          </div>
        </div>

        {/* Lifecycle Stepper Bar */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto py-2">
          {stages.map((stg, i) => {
            const isCompleted = i <= currentStageIndex;
            const isCurrent = i === currentStageIndex;

            return (
              <div key={stg} className="flex items-center gap-2 shrink-0">
                <div className={`px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 ${
                  isCurrent 
                    ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-lg shadow-emerald-500/20'
                    : isCompleted
                    ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-950 text-slate-500 border border-slate-800'
                }`}>
                  {isCompleted ? <CheckCircle2 size={12} /> : null}
                  <span>{stg}</span>
                </div>
                {i < stages.length - 1 && <div className={`h-0.5 w-6 ${i < currentStageIndex ? 'bg-emerald-500' : 'bg-slate-800'}`} />}
              </div>
            );
          })}
        </div>

        {/* Validation Issues Panel if triggered */}
        {validation && (
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert size={16} className={validation.isValid ? 'text-emerald-400' : 'text-rose-400'} />
              Validation Status: {validation.isValid ? 'Clean (Passed All Checks)' : 'Issues Detected'}
            </h4>

            {validation.issues.length === 0 ? (
              <p className="text-xs text-emerald-400">All statutory, tax, LOP, and bank account checks passed cleanly.</p>
            ) : (
              <div className="space-y-2">
                {validation.issues.map((iss, idx) => (
                  <div key={idx} className={`p-2.5 rounded-lg text-xs flex items-center justify-between border ${
                    iss.severity === 'ERROR' ? 'bg-rose-500/10 text-rose-300 border-rose-500/30' : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                  }`}>
                    <span><strong>{iss.employeeName || 'System'}:</strong> {iss.message}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-slate-900 border border-current">{iss.severity}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* KPI Cards Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 block font-medium">Total Employees</span>
          <span className="text-lg font-bold font-mono text-slate-100">{run.totalEmployees || payslips.length}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 block font-medium">Total Gross Earnings</span>
          <span className="text-lg font-bold font-mono text-slate-100">₹{(run.totalGross || 0).toLocaleString('en-IN')}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-rose-400 block font-medium">Total Deductions</span>
          <span className="text-lg font-bold font-mono text-rose-400">₹{(run.totalDeductions || 0).toLocaleString('en-IN')}</span>
        </div>
        <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-4">
          <span className="text-xs text-emerald-400 block font-bold">Total Net Pay</span>
          <span className="text-lg font-bold font-mono text-emerald-400">₹{(run.totalNetPay || 0).toLocaleString('en-IN')}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 block font-medium">EPF + ESI</span>
          <span className="text-lg font-bold font-mono text-slate-200">₹{((run.totalPf || 0) + (run.totalEsi || 0)).toLocaleString('en-IN')}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 block font-medium">TDS Tax Deducted</span>
          <span className="text-lg font-bold font-mono text-slate-200">₹{(run.totalTds || 0).toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Payslip Snapshots Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Users size={16} className="text-emerald-400" /> Employee Payslip Snapshots
          </h3>
          <span className="text-xs text-slate-400">{payslips.length} employees calculated</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4 text-right">Basic Pay</th>
                <th className="py-3 px-4 text-right">Gross Earnings</th>
                <th className="py-3 px-4 text-right">Total Deductions</th>
                <th className="py-3 px-4 text-right">Net Take-Home</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {payslips.map((ps) => (
                <tr key={ps.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-100 font-sans">
                    {ps.employeeName || 'Employee'}
                    <span className="text-[10px] text-slate-500 font-mono block">{ps.employeeCode || ps.employeeId.slice(0, 8)}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-300 font-sans">{ps.department || 'General'}</td>
                  <td className="py-3 px-4 text-right text-slate-300">₹{ps.basicPay?.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 text-right text-slate-100 font-bold">₹{ps.totalEarnings?.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 text-right text-rose-400">₹{ps.totalDeductions?.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 text-right text-emerald-400 font-bold text-sm">₹{ps.netPay?.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 text-center font-sans">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {ps.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-sans">
                    <a
                      href={`http://localhost:5000/api/payroll/payslips/${ps.id}/pdf`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold border border-slate-700 inline-flex items-center gap-1"
                    >
                      <FileText size={12} /> Payslip PDF
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

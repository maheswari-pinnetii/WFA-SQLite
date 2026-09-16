import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign,
  Download,
  Calendar,
  Lock,
  Unlock,
  Play,
  RotateCw,
  FileSpreadsheet,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Users,
  Building2,
  Search,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Shield,
  Layers,
  ChevronDown,
  Sparkles,
  Award,
  Palmtree
} from 'lucide-react';
import { RoleGuard } from '../../../security/guards/RoleGuard';
import { Role } from '../../../security/roles/roles';
import { Button, MotionButton } from '../../../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../components/ui/dialog';
import { AnimatedTabs } from '../../../components/ui/tabs';
import { DeltaBadge, Callout, ProgressBar } from '../../../components/cards/tremor-kpi';
import { Avatar } from '../../../components/ui/avatar';
import { Skeleton } from '../../../components/ui/skeleton';
import { payrollApi } from '../../../api/endpoints/payroll.api';

export interface EmployeePayrollRecord {
  employeeId: string;
  employeeName: string;
  department: string;
  baseSalary: number;
  totalDays: number;
  payableDays: number;
  regularHours: number;
  overtimeHours: number;
  overtimePay: number;
  paidLeaves: number;
  unpaidLeaves: number;
  unpaidLeaveDeduction: number;
  lateArrivalCount: number;
  lateDeduction: number;
  nightShiftAllowance: number;
  manualBonus: number;
  manualDeduction: number;
  grossPay: number;
  pfAmount: number;
  esiAmount: number;
  ptAmount: number;
  taxWithheld: number;
  netPay: number;
}

export interface PayrollRunHistory {
  runId: string;
  period: string;
  processedAt: string;
  lockedBy: string;
  employeeCount: number;
  totalGrossPayout: number;
  totalNetPayout: number;
  status: 'DRAFT' | 'CALCULATED' | 'LOCKED' | 'EXPORTED';
}



export const PayrollReports: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'current' | 'history' | 'adjustments'>('current');
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);

  // Queries
  const { data: runs = [], isLoading: runsLoading } = useQuery({
    queryKey: ['payroll-runs'],
    queryFn: payrollApi.getRuns,
  });

  // Automatically select the latest run
  useEffect(() => {
    if (runs.length > 0 && !selectedRunId) {
      setSelectedRunId(runs[0].id);
    }
  }, [runs, selectedRunId]);

  const { data: payslips = [], isLoading: payslipsLoading } = useQuery({
    queryKey: ['payroll-payslips', selectedRunId],
    queryFn: () => payrollApi.getRunPayslips(selectedRunId!),
    enabled: !!selectedRunId,
  });

  const activeRun = runs.find((r: any) => r.id === selectedRunId);
  const isLocked = activeRun?.status === 'LOCKED' || activeRun?.status === 'FINALIZED';
  const payrollPeriod = activeRun?.periodStart ? `Run ${activeRun.periodStart}` : 'Current';

  // Map backend payslips to UI records
  const records: EmployeePayrollRecord[] = useMemo(() => {
    return payslips.map((p: any) => ({
      employeeId: p.employeeId,
      employeeName: `${p.firstName || ''} ${p.lastName || ''}`.trim() || p.employeeId,
      department: p.department || 'General',
      baseSalary: p.basicPay,
      totalDays: 30, // Simplified for UI
      payableDays: 30 - (p.lopDays || 0),
      regularHours: 160,
      overtimeHours: 0,
      overtimePay: p.overtimePay || 0,
      paidLeaves: 0,
      unpaidLeaves: p.lopDays || 0,
      unpaidLeaveDeduction: 0,
      lateArrivalCount: 0,
      lateDeduction: 0,
      nightShiftAllowance: 0,
      manualBonus: 0,
      manualDeduction: 0,
      grossPay: p.totalEarnings,
      pfAmount: p.pfAmount || 0,
      esiAmount: p.esiAmount || 0,
      ptAmount: p.ptAmount || 0,
      taxWithheld: p.tdsAmount || 0,
      netPay: p.netPay
    }));
  }, [payslips]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationProgress, setCalculationProgress] = useState(0);

  // Search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');

  // Manual Adjustment Modal
  const [adjustmentModalRecord, setAdjustmentModalRecord] = useState<EmployeePayrollRecord | null>(null);
  const [bonusInput, setBonusInput] = useState('0');
  const [deductionInput, setDeductionInput] = useState('0');
  const [adjustmentReason, setAdjustmentReason] = useState('');

  // Computed Totals
  const totals = useMemo(() => {
    const totalGross = records.reduce((acc, r) => acc + r.grossPay, 0);
    const totalNet = records.reduce((acc, r) => acc + r.netPay, 0);
    const totalTax = records.reduce((acc, r) => acc + r.taxWithheld, 0);
    const totalOvertime = records.reduce((acc, r) => acc + r.overtimePay, 0);
    const totalDeductions = records.reduce((acc, r) => acc + r.unpaidLeaveDeduction + r.lateDeduction + r.manualDeduction, 0);
    return { totalGross, totalNet, totalTax, totalOvertime, totalDeductions };
  }, [records]);

  // Filtered Records
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchesSearch = r.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            r.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept = selectedDept === 'ALL' || r.department === selectedDept;
      return matchesSearch && matchesDept;
    });
  }, [records, searchQuery, selectedDept]);

  const createRunMutation = useMutation({
    mutationFn: () => {
      // Basic date manipulation to get first/last of month based on selected string
      // Just sending generic strings to keep it simple
      const d = new Date();
      const first = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
      const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0];
      return payrollApi.createRun(first, last);
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['payroll-runs'] });
      setSelectedRunId(data.id);
    }
  });

  const generateMutation = useMutation({
    mutationFn: () => payrollApi.generatePayslips(selectedRunId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-payslips', selectedRunId] });
      queryClient.invalidateQueries({ queryKey: ['payroll-runs'] });
      setIsCalculating(false);
      setCalculationProgress(100);
    },
  });

  // Run Calculation Routine
  const handleCalculatePayroll = () => {
    if (isLocked) {
      alert('This payroll cycle is locked. Unlock the cycle before re-calculating.');
      return;
    }
    if (!selectedRunId) return;

    setIsCalculating(true);
    setCalculationProgress(30);

    setTimeout(() => setCalculationProgress(70), 500);
    generateMutation.mutate();
  };

  const finalizeMutation = useMutation({
    mutationFn: () => payrollApi.finalizeRun(selectedRunId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-runs'] });
    }
  });

  // Lock / Unlock Payroll
  const handleToggleLock = () => {
    if (isLocked) {
      alert('Cannot unlock a finalized payroll cycle.');
    } else {
      if (window.confirm(`Lock and finalize payroll? This will freeze inputs and seal the financial ledger.`)) {
        finalizeMutation.mutate();
      }
    }
  };

  // Open Adjustment Modal
  const handleOpenAdjustment = (rec: EmployeePayrollRecord) => {
    if (isLocked) {
      alert('Payroll is locked. Unlock to make adjustments.');
      return;
    }
    setAdjustmentModalRecord(rec);
    setBonusInput(rec.manualBonus.toString());
    setDeductionInput(rec.manualDeduction.toString());
    setAdjustmentReason('');
  };

  // Save Adjustment
  const handleSaveAdjustment = () => {
    alert('Manual adjustments require Phase 5 Integration to save.');
    setAdjustmentModalRecord(null);
  };

  // CSV Export
  const handleExportCsv = () => {
    const headers = ['Employee ID', 'Name', 'Department', 'Base Salary', 'Payable Days', 'Regular Hours', 'Overtime Hours', 'OT Pay', 'Night Shift', 'Late Penalty', 'Unpaid Leave Deduction', 'Bonus', 'Gross Pay', 'PF', 'ESI', 'PT', 'TDS', 'Net Pay'];
    const rows = records.map(r => [
      r.employeeId,
      r.employeeName,
      r.department,
      r.baseSalary,
      r.payableDays,
      r.regularHours,
      r.overtimeHours,
      r.overtimePay,
      r.nightShiftAllowance,
      r.lateDeduction,
      r.unpaidLeaveDeduction,
      r.manualBonus,
      r.grossPay,
      r.pfAmount,
      r.esiAmount,
      r.ptAmount,
      r.taxWithheld,
      r.netPay
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `payroll-ledger-${payrollPeriod.toLowerCase().replace(' ', '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // JSON Export
  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify({ period: payrollPeriod, generatedAt: new Date().toISOString(), totals, records }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payroll-ledger-${payrollPeriod.toLowerCase().replace(' ', '-')}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <DollarSign className="text-emerald-400" size={28} />
              Payroll & Attendance Integration Hub
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Synchronize bi-directional time logs, calculate payable shifts, apply overtime, late penalties, and lock payroll ledgers.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => window.location.assign('/hr/leave')}>
              <Palmtree size={14} className="mr-1.5 text-emerald-400" /> Leave Hub
            </Button>

            {/* Payroll Period Picker */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800">
              <Calendar size={14} className="text-slate-400 ml-2" />
              <select
                value={selectedRunId || ''}
                onChange={(e) => setSelectedRunId(e.target.value)}
                className="h-8 bg-transparent text-xs font-bold text-slate-200 focus:outline-none pr-3"
              >
                <option value="" disabled>Select Run</option>
                {runs.map((r: any) => (
                  <option key={r.id} value={r.id}>Run {r.periodStart}</option>
                ))}
              </select>
            </div>
            
            <Button variant="outline" size="sm" onClick={() => createRunMutation.mutate()} disabled={createRunMutation.isPending}>
              <Plus size={14} className="mr-1.5 text-emerald-400" /> New Run
            </Button>

            {/* Calculate Button */}
            <Button
              variant="gradient"
              size="sm"
              disabled={isLocked || isCalculating}
              onClick={handleCalculatePayroll}
              className="font-bold"
            >
              {isCalculating ? (
                <>
                  <RotateCw size={14} className="mr-1.5 animate-spin" /> Computing ({calculationProgress}%)...
                </>
              ) : (
                <>
                  <Play size={14} className="mr-1.5" /> Calculate Payroll
                </>
              )}
            </Button>

            {/* Lock / Finalize Button */}
            <Button
              variant={isLocked ? 'destructive' : 'secondary'}
              size="sm"
              onClick={handleToggleLock}
              className="font-bold"
            >
              {isLocked ? (
                <>
                  <Lock size={14} className="mr-1.5 text-amber-300" /> Locked & Finalized
                </>
              ) : (
                <>
                  <Unlock size={14} className="mr-1.5" /> Review & Lock
                </>
              )}
            </Button>

            {/* Export Dropdowns */}
            <Button variant="outline" size="sm" onClick={handleExportCsv} title="Export CSV">
              <FileSpreadsheet size={14} className="mr-1 text-emerald-400" /> CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportJson} title="Export JSON">
              <FileCode size={14} className="mr-1 text-emerald-400" /> JSON
            </Button>
          </div>
        </div>

        {/* Lock Notice Banner */}
        {isLocked && (
          <Callout
            title="Payroll Cycle Locked & Archived"
            variant="warning"
            icon={<Lock size={18} className="text-amber-400" />}
          >
            This payroll run ({payrollPeriod}) has been officially sealed by Sarah Connor. All attendance punch records and deductions are frozen for disbursement.
          </Callout>
        )}

        {/* Top KPI Metrics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-emerald-500 bg-slate-900/90">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Net Disbursement</p>
                <h3 className="text-2xl font-black text-emerald-400 mt-1">${totals.totalNet.toLocaleString()}</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Est. payout across {records.length} heads</p>
              </div>
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
                <DollarSign size={22} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500 bg-slate-900/90">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gross Payroll</p>
                <h3 className="text-2xl font-black text-white mt-1">${totals.totalGross.toLocaleString()}</h3>
                <p className="text-[11px] text-emerald-400 mt-0.5">Before tax & benefits withholdings</p>
              </div>
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
                <Layers size={22} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 bg-slate-900/90">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overtime Payout</p>
                <h3 className="text-2xl font-black text-emerald-400 mt-1">${totals.totalOvertime.toLocaleString()}</h3>
                <p className="text-[11px] text-emerald-300 mt-0.5">Approved extra shift hours (1.5x)</p>
              </div>
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
                <Clock size={22} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-rose-500 bg-slate-900/90">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Attendance Deductions</p>
                <h3 className="text-2xl font-black text-rose-400 mt-1">${totals.totalDeductions.toLocaleString()}</h3>
                <p className="text-[11px] text-rose-300 mt-0.5">LWP & late penalties applied</p>
              </div>
              <div className="p-3 bg-rose-500/10 text-rose-400 rounded-2xl border border-rose-500/20">
                <AlertTriangle size={22} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation */}
        <AnimatedTabs
          activeTab={activeTab}
          onChange={(id) => setActiveTab(id as any)}
          tabs={[
            { id: 'current', label: 'Employee Attendance & Payroll Ledger', icon: <DollarSign size={14} />, badge: records.length },
            { id: 'history', label: 'Integration-Run History', icon: <Calendar size={14} /> },
            { id: 'adjustments', label: 'Bonuses & Allowances Breakdown', icon: <Sparkles size={14} /> }
          ]}
        />

        {/* TAB 1: MAIN PAYROLL LEDGER */}
        {activeTab === 'current' && (
          <Card>
            <CardHeader className="pb-3 border-b border-slate-800">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <CardTitle>Attendance-Driven Compensation Ledger</CardTitle>
                  <CardDescription>Live sync of days worked, overtime hours, night-shift allowances, and tax withholding.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-56">
                    <Input
                      placeholder="Search employee or ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      icon={<Search size={14} />}
                    />
                  </div>
                  <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="h-10 px-3 rounded-xl border border-slate-800 bg-slate-950 text-xs font-bold text-slate-200 focus:outline-none"
                  >
                    <option value="ALL">All Departments</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Human Resources">HR</option>
                    <option value="Management">Management</option>
                    <option value="Product">Product</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Employee</th>
                      <th className="py-3.5 px-4">Base Salary</th>
                      <th className="py-3.5 px-4">Payable Days</th>
                      <th className="py-3.5 px-4">Regular / OT Hrs</th>
                      <th className="py-3.5 px-4">Overtime Pay</th>
                      <th className="py-3.5 px-4">Allowances</th>
                      <th className="py-3.5 px-4">Deductions</th>
                      <th className="py-3.5 px-4">Gross Pay</th>
                      <th className="py-3.5 px-4 text-center">PF</th>
                      <th className="py-3.5 px-4 text-center">ESI</th>
                      <th className="py-3.5 px-4 text-center">PT</th>
                      <th className="py-3.5 px-4 text-center">TDS</th>
                      <th className="py-3.5 px-4">Net Payout</th>
                      <th className="py-3.5 px-4 text-right">Adjust</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredRecords.map((r) => (
                      <tr key={r.employeeId} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <Avatar fallback={r.employeeName.slice(0, 2).toUpperCase()} size="sm" />
                            <div>
                              <div className="font-bold text-white">{r.employeeName}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{r.employeeId} &bull; {r.department}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-200">
                          ${r.baseSalary.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`font-black ${r.payableDays < r.totalDays ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {r.payableDays}
                          </span>
                          <span className="text-slate-500"> / {r.totalDays}d</span>
                        </td>
                        <td className="py-3.5 px-4 font-mono">
                          <span className="text-slate-200">{r.regularHours}h</span>
                          {r.overtimeHours > 0 && (
                            <span className="text-emerald-400 font-bold ml-1">+{r.overtimeHours}h OT</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                          +${r.overtimePay.toFixed(0)}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-emerald-300">
                          +${(r.nightShiftAllowance + r.manualBonus).toFixed(0)}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-rose-400 font-bold">
                          -${(r.unpaidLeaveDeduction + r.lateDeduction + r.manualDeduction).toFixed(0)}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-white">
                          ${r.grossPay.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-center text-rose-400">
                          {r.pfAmount > 0 ? `-$${r.pfAmount}` : '-'}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-center text-rose-400">
                          {r.esiAmount > 0 ? `-$${r.esiAmount}` : '-'}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-center text-rose-400">
                          {r.ptAmount > 0 ? `-$${r.ptAmount}` : '-'}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-center text-rose-400">
                          {r.taxWithheld > 0 ? `-$${r.taxWithheld}` : '-'}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-black text-emerald-400 text-sm">
                          ${r.netPay.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isLocked}
                            onClick={() => handleOpenAdjustment(r)}
                            className="h-7 px-2.5 text-[11px]"
                          >
                            Edit
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* TAB 2: INTEGRATION RUN HISTORY */}
        {activeTab === 'history' && (
          <Card>
            <CardHeader className="pb-3 border-b border-slate-800">
              <CardTitle>Payroll Integration Run History & Audits</CardTitle>
              <CardDescription>Archived execution logs, locking signatures, and total disbursements.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Run Batch ID</th>
                      <th className="py-3.5 px-4">Payroll Cycle</th>
                      <th className="py-3.5 px-4">Processed Date</th>
                      <th className="py-3.5 px-4">Authorized By</th>
                      <th className="py-3.5 px-4">Employees</th>
                      <th className="py-3.5 px-4">Total Gross</th>
                      <th className="py-3.5 px-4">Total Net Payout</th>
                      <th className="py-3.5 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {runs.map((h: any, idx: number) => (
                      <tr key={h.id} className={`border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors ${idx % 2 === 0 ? 'bg-slate-900/10' : ''}`}>
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">{h.id}</td>
                        <td className="py-3.5 px-4 font-bold text-white">{h.period}</td>
                        <td className="py-3.5 px-4 font-mono text-slate-400">{h.processedAt}</td>
                        <td className="py-3.5 px-4 text-slate-300 font-semibold">{h.lockedBy}</td>
                        <td className="py-3.5 px-4 font-mono text-slate-200">{h.employeeCount} Heads</td>
                        <td className="py-3.5 px-4 font-mono text-slate-200">${(h.totalGrossPayout || 0).toLocaleString()}</td>
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">${(h.totalNetPayout || 0).toLocaleString()}</td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full text-xs font-bold">
                            <CheckCircle2 size={12} /> {h.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* TAB 3: BONUSES & ADJUSTMENTS BREAKDOWN */}
        {activeTab === 'adjustments' && (
          <Card>
            <CardHeader className="pb-3 border-b border-slate-800">
              <CardTitle>Shift Allowances & Adjustment Matrix</CardTitle>
              <CardDescription>Breakdown of night-shift differential allowances, performance bonuses, and late penalties.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <Clock size={16} /> Night Shift Allowance
                  </div>
                  <p className="text-xs text-slate-400">Night shift workers receive a standard +$50/shift premium allowance.</p>
                  <div className="text-xl font-black text-white pt-1">
                    ${records.reduce((a, b) => a + b.nightShiftAllowance, 0).toLocaleString()} <span className="text-xs text-slate-400 font-normal">Allocated</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <Sparkles size={16} /> Manual Performance Bonuses
                  </div>
                  <p className="text-xs text-slate-400">Special manager-approved spot awards and quarterly incentives.</p>
                  <div className="text-xl font-black text-white pt-1">
                    ${records.reduce((a, b) => a + b.manualBonus, 0).toLocaleString()} <span className="text-xs text-slate-400 font-normal">Approved</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-2">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                    <AlertTriangle size={16} /> Tardiness & LWP Penalties
                  </div>
                  <p className="text-xs text-slate-400">Automated deductions for grace-period breaches (&gt;3 late punches) and unpaid leaves.</p>
                  <div className="text-xl font-black text-white pt-1">
                    ${records.reduce((a, b) => a + b.lateDeduction + b.unpaidLeaveDeduction, 0).toLocaleString()} <span className="text-xs text-slate-400 font-normal">Deducted</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* MODAL: MANUAL COMPENSATION ADJUSTMENT */}
        <Dialog open={!!adjustmentModalRecord} onOpenChange={(open) => !open && setAdjustmentModalRecord(null)}>
          <DialogContent onClose={() => setAdjustmentModalRecord(null)}>
            <DialogHeader>
              <DialogTitle>Adjust Compensation — {adjustmentModalRecord?.employeeName}</DialogTitle>
              <DialogDescription>
                Modify spot bonuses, performance awards, or custom tax deductions for this pay period.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-2">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
                <p><span className="text-slate-400">Employee ID:</span> <span className="font-mono font-bold text-emerald-400">{adjustmentModalRecord?.employeeId}</span></p>
                <p><span className="text-slate-400">Base Salary:</span> ${adjustmentModalRecord?.baseSalary.toLocaleString()}</p>
                <p><span className="text-slate-400">Overtime Pay:</span> ${adjustmentModalRecord?.overtimePay.toFixed(2)} ({adjustmentModalRecord?.overtimeHours}h)</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Spot Bonus / Incentive ($)</label>
                  <input
                    type="number"
                    value={bonusInput}
                    onChange={(e) => setBonusInput(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-800 bg-slate-950 text-xs font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Custom Deduction ($)</label>
                  <input
                    type="number"
                    value={deductionInput}
                    onChange={(e) => setDeductionInput(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-800 bg-slate-950 text-xs font-bold text-rose-400 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Reason / Justification</label>
                <textarea
                  rows={2}
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  placeholder="e.g., Performance award, relocation support, asset penalty..."
                  className="w-full p-3 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <Button variant="outline" size="sm" onClick={() => setAdjustmentModalRecord(null)}>
                  Cancel
                </Button>
                <Button variant="gradient" size="sm" onClick={handleSaveAdjustment}>
                  Apply Adjustment
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

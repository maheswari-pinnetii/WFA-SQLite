import React, { useState, useMemo } from 'react';
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
  Award
} from 'lucide-react';
import { RoleGuard } from '../../../security/guards/RoleGuard';
import { Role } from '../../../security/roles/roles';
import { Button, MotionButton } from '../../../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../components/ui/dialog';
import { AnimatedTabs } from '../../../components/ui/tabs';
import { DeltaBadge, Callout, ProgressBar } from '../../../components/ui/tremor-kpi';
import { Avatar } from '../../../components/ui/avatar';
import { Skeleton } from '../../../components/ui/skeleton';

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

const INITIAL_PAYROLL_DATA: EmployeePayrollRecord[] = [
  {
    employeeId: 'EMP-001',
    employeeName: 'Sarah Connor',
    department: 'Engineering',
    baseSalary: 14500,
    totalDays: 30,
    payableDays: 30,
    regularHours: 160,
    overtimeHours: 12,
    overtimePay: 1087.5,
    paidLeaves: 2,
    unpaidLeaves: 0,
    unpaidLeaveDeduction: 0,
    lateArrivalCount: 0,
    lateDeduction: 0,
    nightShiftAllowance: 450,
    manualBonus: 1000,
    manualDeduction: 0,
    grossPay: 17037.5,
    taxWithheld: 3407.5,
    netPay: 13630.0
  },
  {
    employeeId: 'EMP-002',
    employeeName: 'Elena Rostova',
    department: 'Human Resources',
    baseSalary: 11000,
    totalDays: 30,
    payableDays: 29,
    regularHours: 152,
    overtimeHours: 0,
    overtimePay: 0,
    paidLeaves: 1,
    unpaidLeaves: 1,
    unpaidLeaveDeduction: 366.67,
    lateArrivalCount: 1,
    lateDeduction: 0,
    nightShiftAllowance: 0,
    manualBonus: 500,
    manualDeduction: 0,
    grossPay: 11133.33,
    taxWithheld: 2226.67,
    netPay: 8906.66
  },
  {
    employeeId: 'EMP-003',
    employeeName: 'David Sterling',
    department: 'Management',
    baseSalary: 16000,
    totalDays: 30,
    payableDays: 30,
    regularHours: 160,
    overtimeHours: 8,
    overtimePay: 800,
    paidLeaves: 0,
    unpaidLeaves: 0,
    unpaidLeaveDeduction: 0,
    lateArrivalCount: 0,
    lateDeduction: 0,
    nightShiftAllowance: 0,
    manualBonus: 1500,
    manualDeduction: 0,
    grossPay: 18300,
    taxWithheld: 3660,
    netPay: 14640
  },
  {
    employeeId: 'EMP-004',
    employeeName: 'Ananya Sharma',
    department: 'Product',
    baseSalary: 12500,
    totalDays: 30,
    payableDays: 28,
    regularHours: 144,
    overtimeHours: 4,
    overtimePay: 312.5,
    paidLeaves: 2,
    unpaidLeaves: 2,
    unpaidLeaveDeduction: 833.33,
    lateArrivalCount: 3,
    lateDeduction: 150,
    nightShiftAllowance: 200,
    manualBonus: 0,
    manualDeduction: 0,
    grossPay: 12029.17,
    taxWithheld: 2405.83,
    netPay: 9623.34
  },
  {
    employeeId: 'EMP-005',
    employeeName: 'Marcus Vance',
    department: 'Engineering',
    baseSalary: 13000,
    totalDays: 30,
    payableDays: 30,
    regularHours: 160,
    overtimeHours: 16,
    overtimePay: 1300,
    paidLeaves: 0,
    unpaidLeaves: 0,
    unpaidLeaveDeduction: 0,
    lateArrivalCount: 0,
    lateDeduction: 0,
    nightShiftAllowance: 600,
    manualBonus: 750,
    manualDeduction: 0,
    grossPay: 15650,
    taxWithheld: 3130,
    netPay: 12520
  },
  {
    employeeId: 'EMP-006',
    employeeName: 'Aarav Sharma',
    department: 'Engineering',
    baseSalary: 10500,
    totalDays: 30,
    payableDays: 30,
    regularHours: 160,
    overtimeHours: 6,
    overtimePay: 393.75,
    paidLeaves: 1,
    unpaidLeaves: 0,
    unpaidLeaveDeduction: 0,
    lateArrivalCount: 1,
    lateDeduction: 0,
    nightShiftAllowance: 300,
    manualBonus: 300,
    manualDeduction: 0,
    grossPay: 11493.75,
    taxWithheld: 2298.75,
    netPay: 9195.0
  }
];

const INITIAL_RUN_HISTORY: PayrollRunHistory[] = [
  { runId: 'PR-2026-08', period: 'August 2026', processedAt: '2026-08-31 18:00', lockedBy: 'Sarah Connor', employeeCount: 500, totalGrossPayout: 5850000, totalNetPayout: 4680000, status: 'LOCKED' },
  { runId: 'PR-2026-07', period: 'July 2026', processedAt: '2026-07-31 17:30', lockedBy: 'Sarah Connor', employeeCount: 492, totalGrossPayout: 5760000, totalNetPayout: 4608000, status: 'LOCKED' },
  { runId: 'PR-2026-06', period: 'June 2026', processedAt: '2026-06-30 18:15', lockedBy: 'David Sterling', employeeCount: 485, totalGrossPayout: 5680000, totalNetPayout: 4544000, status: 'LOCKED' }
];

export const PayrollReports: React.FC = () => {
  const [payrollPeriod, setPayrollPeriod] = useState('September 2026');
  const [activeTab, setActiveTab] = useState<'current' | 'history' | 'adjustments'>('current');
  const [records, setRecords] = useState<EmployeePayrollRecord[]>(INITIAL_PAYROLL_DATA);
  const [history, setHistory] = useState<PayrollRunHistory[]>(INITIAL_RUN_HISTORY);
  const [isLocked, setIsLocked] = useState(false);
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

  // Run Calculation Routine
  const handleCalculatePayroll = () => {
    if (isLocked) {
      alert('This payroll cycle is locked. Unlock the cycle before re-calculating.');
      return;
    }
    setIsCalculating(true);
    setCalculationProgress(15);

    setTimeout(() => setCalculationProgress(45), 300);
    setTimeout(() => setCalculationProgress(80), 700);
    setTimeout(() => {
      setCalculationProgress(100);
      setIsCalculating(false);
      // Re-calculate live records with slight updates
      setRecords(prev => prev.map(r => {
        const gross = r.baseSalary + r.overtimePay + r.nightShiftAllowance + r.manualBonus - r.unpaidLeaveDeduction - r.lateDeduction - r.manualDeduction;
        const tax = gross * 0.20;
        return {
          ...r,
          grossPay: Number(gross.toFixed(2)),
          taxWithheld: Number(tax.toFixed(2)),
          netPay: Number((gross - tax).toFixed(2))
        };
      }));
    }, 1100);
  };

  // Lock / Unlock Payroll
  const handleToggleLock = () => {
    if (isLocked) {
      if (window.confirm('Unlock payroll cycle? This will re-enable manual edits and attendance recalculations.')) {
        setIsLocked(false);
      }
    } else {
      if (window.confirm(`Lock and finalize payroll for ${payrollPeriod}? This will freeze attendance inputs and seal the financial ledger.`)) {
        setIsLocked(true);
        // Add to history
        const newRun: PayrollRunHistory = {
          runId: `PR-2026-09`,
          period: payrollPeriod,
          processedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
          lockedBy: 'Sarah Connor (Admin)',
          employeeCount: records.length,
          totalGrossPayout: totals.totalGross,
          totalNetPayout: totals.totalNet,
          status: 'LOCKED'
        };
        setHistory([newRun, ...history]);
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
    if (!adjustmentModalRecord) return;
    const bonus = parseFloat(bonusInput) || 0;
    const deduction = parseFloat(deductionInput) || 0;

    setRecords(prev => prev.map(r => {
      if (r.employeeId === adjustmentModalRecord.employeeId) {
        const gross = r.baseSalary + r.overtimePay + r.nightShiftAllowance + bonus - r.unpaidLeaveDeduction - r.lateDeduction - deduction;
        const tax = gross * 0.20;
        return {
          ...r,
          manualBonus: bonus,
          manualDeduction: deduction,
          grossPay: Number(gross.toFixed(2)),
          taxWithheld: Number(tax.toFixed(2)),
          netPay: Number((gross - tax).toFixed(2))
        };
      }
      return r;
    }));

    setAdjustmentModalRecord(null);
  };

  // CSV Export
  const handleExportCsv = () => {
    const headers = ['Employee ID', 'Name', 'Department', 'Base Salary', 'Payable Days', 'Regular Hours', 'Overtime Hours', 'OT Pay', 'Night Shift', 'Late Penalty', 'Unpaid Leave Deduction', 'Bonus', 'Gross Pay', 'Tax Withheld', 'Net Pay'];
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
    <RoleGuard allowedRoles={[Role.HR, Role.ADMIN]}>
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
            {/* Payroll Period Picker */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800">
              <Calendar size={14} className="text-slate-400 ml-2" />
              <select
                value={payrollPeriod}
                onChange={(e) => setPayrollPeriod(e.target.value)}
                className="h-8 bg-transparent text-xs font-bold text-slate-200 focus:outline-none pr-3"
              >
                <option value="September 2026">September 2026 (Active)</option>
                <option value="August 2026">August 2026</option>
                <option value="July 2026">July 2026</option>
                <option value="June 2026">June 2026</option>
              </select>
            </div>

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
              <FileCode size={14} className="mr-1 text-blue-400" /> JSON
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
                <p className="text-[11px] text-blue-400 mt-0.5">Before tax & benefits withholdings</p>
              </div>
              <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20">
                <Layers size={22} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 bg-slate-900/90">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overtime Payout</p>
                <h3 className="text-2xl font-black text-purple-400 mt-1">${totals.totalOvertime.toLocaleString()}</h3>
                <p className="text-[11px] text-purple-300 mt-0.5">Approved extra shift hours (1.5x)</p>
              </div>
              <div className="p-3 bg-purple-500/10 text-purple-400 rounded-2xl border border-purple-500/20">
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
                            <span className="text-purple-400 font-bold ml-1">+{r.overtimeHours}h OT</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-purple-400">
                          +${r.overtimePay.toFixed(0)}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-blue-300">
                          +${(r.nightShiftAllowance + r.manualBonus).toFixed(0)}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-rose-400 font-bold">
                          -${(r.unpaidLeaveDeduction + r.lateDeduction + r.manualDeduction).toFixed(0)}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-white">
                          ${r.grossPay.toLocaleString()}
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
                    {history.map((h) => (
                      <tr key={h.runId} className="hover:bg-slate-800/20">
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-400">{h.runId}</td>
                        <td className="py-3.5 px-4 font-bold text-white">{h.period}</td>
                        <td className="py-3.5 px-4 font-mono text-slate-400">{h.processedAt}</td>
                        <td className="py-3.5 px-4 text-slate-300 font-semibold">{h.lockedBy}</td>
                        <td className="py-3.5 px-4 font-mono text-slate-200">{h.employeeCount} Heads</td>
                        <td className="py-3.5 px-4 font-mono text-slate-200">${h.totalGrossPayout.toLocaleString()}</td>
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">${h.totalNetPayout.toLocaleString()}</td>
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
                  <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
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
                <p><span className="text-slate-400">Employee ID:</span> <span className="font-mono font-bold text-blue-400">{adjustmentModalRecord?.employeeId}</span></p>
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
                  className="w-full p-3 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 resize-none"
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
    </RoleGuard>
  );
};

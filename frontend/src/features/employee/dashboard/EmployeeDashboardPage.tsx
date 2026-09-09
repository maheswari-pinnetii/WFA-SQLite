import React, { useState, useEffect, useMemo } from 'react';
import { RoleGuard } from '../../../security/guards/RoleGuard';
import { Role } from '../../../security/roles/roles';
import { Permission } from '../../../security/permissions/permissions';
import { useAuth } from '../../../auth/hooks/useAuth';
import { LiveCheckInWidget } from '../../../components/attendance/LiveCheckInWidget';
import { workforceApi, Task } from '../../../api/endpoints/workforce.api';
import { attendanceApi, AttendanceRecord, CorrectionRequest } from '../../../api/attendanceApi';
import { MinimalKpiCard } from '../../../components/cards/MinimalKpiCard';
import { AnalyticsBarChart, AnalyticsDonutChart } from '../../../components/charts/AnalyticsCharts';
import {
  Clock,
  Calendar,
  FileText,
  Compass,
  CheckCircle2,
  Plus,
  Layers,
  ClipboardList,
  Briefcase,
  Award,
  RefreshCw,
  Zap,
  History,
  Timer,
  Download,
  Activity,
  Coffee,
  Check,
  LayoutDashboard,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AttendanceCalendarView } from '../../../components/attendance/AttendanceCalendarView';
import { Button } from '../../../components/ui/button';
import { AbsenceManagementPage } from '../pages/AbsenceManagementPage';

// Helper: Step-by-Step Section Header
export const StepSectionHeader: React.FC<{
  stepNumber?: string;
  title: string;
  subtitle: string;
  tagColor?: string;
  badge?: string;
}> = ({ title, subtitle, badge }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-4 pb-2 border-b border-[var(--border-color)]/60">
    <div className="flex items-center gap-3">
      <div>
        <h2 className="text-base font-extrabold text-[var(--text-primary)] tracking-tight">
          {title}
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
      </div>
    </div>
    {badge && (
      <span className="text-[11px] font-bold text-slate-300 bg-slate-900 px-3 py-1 rounded-full border border-slate-800 self-start sm:self-auto">
        {badge}
      </span>
    )}
  </div>
);


// 1. Employee Dashboard Overview Header
export const EmployeeDashboardOverview: React.FC<{ user: any }> = ({ user }) => {
  const initials = (user?.name || 'U').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-semibold text-sm shrink-0">
          {initials}
        </div>
        <div>
          <h1 className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            {user?.name || 'My Workspace'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {[user?.role, user?.department].filter(Boolean).join(' · ')}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 flex-wrap">
        <a
          href="#step-1-punch"
          className="px-3.5 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm flex items-center gap-1.5 transition-colors"
        >
          <Clock size={14} /> Check In
        </a>
        <Link
          to="/employee/leave"
          className="px-3.5 py-2 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-sm flex items-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700"
        >
          <Calendar size={14} /> Apply Leave
        </Link>
        <Link
          to="/employee/profile"
          className="px-3.5 py-2 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-sm flex items-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700"
        >
          <Compass size={14} /> Profile
        </Link>
      </div>
    </div>
  );
};



// 3. Employee KPI Cards
export const EmployeeKpiGrid: React.FC<{
  hoursToday: string;
  hoursThisWeek: string;
  attendanceRate: string;
  overtimeHours: string;
  leaveBalance: string;
  leavesUsed: string;
  pendingTasksCount: number;
  timesheetStatus: string;
}> = (props) => (
  <div className="dashboard-kpi-grid">
    <MinimalKpiCard title="Hours Today" value={props.hoursToday} icon={<Clock size={26} />} iconBgColor="blue" trend="Active Shift Elapsed" />
    <MinimalKpiCard title="Hours This Week" value={props.hoursThisWeek} icon={<Briefcase size={26} />} iconBgColor="emerald" trend="Standard 40h Goal" />
    <MinimalKpiCard title="Attendance Rate" value={props.attendanceRate} icon={<Calendar size={26} />} iconBgColor="teal" trend="Lifetime Adherence" />
    <MinimalKpiCard title="Overtime Hours" value={props.overtimeHours} icon={<Timer size={26} />} iconBgColor="cyan" trend="Approved OT (1.5x)" />
    <MinimalKpiCard title="Leave Balance" value={props.leaveBalance} icon={<Layers size={26} />} iconBgColor="purple" trend="Available PTO Days" />
    <MinimalKpiCard title="Leaves Used" value={props.leavesUsed} icon={<FileText size={26} />} iconBgColor="rose" trend="This Calendar Year" />
    <MinimalKpiCard title="Sprint Tasks Active" value={props.pendingTasksCount} icon={<Zap size={26} />} iconBgColor="amber" trend="In Sprint Backlog" />
    <MinimalKpiCard title="Timesheet Status" value={props.timesheetStatus} icon={<CheckCircle2 size={26} />} iconBgColor="indigo" trend="Daily Attendance Lock" />
  </div>
);



// 3c. Employee Shift Timings & Schedule Card
export const EmployeeShiftScheduleCard: React.FC = () => {
  const [assignedShift] = useState(() => {
    try {
      const saved = localStorage.getItem('wfa_employee_assigned_shift');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      name: 'General Day Shift',
      code: 'GS',
      startTime: '09:00 AM',
      endTime: '06:00 PM',
      totalHours: 9,
      workHours: 8,
      breakHours: 1,
      graceMinutes: 15,
      days: 'Mon - Fri'
    };
  });

  const [showSwapModal, setShowSwapModal] = useState(false);
  const [swapReason, setSwapReason] = useState('');
  const [swapSubmitted, setSwapSubmitted] = useState(false);

  const today = new Date();
  const dayOfWeek = today.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  const handleSwapSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSwapSubmitted(true);
    setTimeout(() => {
      setSwapSubmitted(false);
      setShowSwapModal(false);
      setSwapReason('');
    }, 2500);
  };

  return (
    <div className="glass-panel p-6 shadow-2xl flex flex-col justify-between h-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl space-y-4">
      <div className="space-y-3.5">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]/60">
          <div>
            <h3 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2">
              <Timer size={18} className="text-emerald-400" /> Assigned Shift Timings
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Assigned by HR & Department Manager</p>
          </div>
          <span className="text-[10px] text-emerald-400 font-black uppercase tracking-wider bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30 shrink-0">
            {assignedShift.code} &bull; {assignedShift.name}
          </span>
        </div>

        {/* Live Today's Shift Status Alert */}
        <div className={`p-3 rounded-2xl border flex items-center justify-between gap-2 ${
          isWeekend 
            ? 'bg-slate-900 border-slate-800 text-slate-400' 
            : 'bg-gradient-to-r from-emerald-950/50 via-slate-900 to-blue-950/40 border-emerald-500/40 text-emerald-300'
        }`}>
          <div className="flex items-center gap-2.5">
            <span className={`w-2.5 h-2.5 rounded-full ${isWeekend ? 'bg-slate-600' : 'bg-emerald-400 animate-pulse'}`} />
            <div>
              <p className="text-[11px] font-black uppercase tracking-wide">
                {isWeekend ? 'WEEKEND OFF' : 'SCHEDULED TO WORK TODAY'}
              </p>
              <p className="text-xs font-bold text-white font-mono">
                {isWeekend ? 'Saturday & Sunday Rest Day' : `${assignedShift.startTime} – ${assignedShift.endTime}`}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-slate-300 shrink-0">
            {isWeekend ? 'Off Duty' : 'Active Duty'}
          </span>
        </div>

        {/* Shift Duration Formula Callout */}
        <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Clock size={15} className="text-emerald-400 shrink-0" />
            <span className="text-xs font-black text-white">
              {assignedShift.totalHours}h Shift = {assignedShift.workHours}h Work + {assignedShift.breakHours}h Break
            </span>
          </div>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800 shrink-0">
            60m Lunch
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-0.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Required Net Work</span>
            <p className="font-mono text-sm font-black text-emerald-400">{assignedShift.workHours}.0 Hours / Day</p>
            <p className="text-[10px] text-slate-400">40.0 Hours Weekly Standard</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-0.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Grace & Overtime</span>
            <p className="font-mono text-sm font-black text-cyan-400">{assignedShift.graceMinutes}m Grace / OT &gt; 8h</p>
            <p className="text-[10px] text-slate-400">OT Tier: 1.5x Hourly Base</p>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 flex-wrap gap-2">
        <button 
          onClick={() => setShowSwapModal(true)}
          className="text-emerald-400 hover:text-emerald-300 font-bold text-[11px] cursor-pointer"
        >
          Request Shift Change / Swap &rarr;
        </button>
        <Link to="/employee/shifts" className="text-emerald-400 hover:text-emerald-300 font-bold text-[11px]">
          Manage All Shifts &rarr;
        </Link>
      </div>

      {/* Shift Swap Modal */}
      {showSwapModal && (
        <div className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl max-w-md w-full space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Timer className="text-emerald-400" size={18} /> Request Shift Change / Swap
              </h3>
              <button onClick={() => setShowSwapModal(false)} className="text-slate-400 hover:text-white text-xl leading-none cursor-pointer">&times;</button>
            </div>

            {swapSubmitted ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 size={18} />
                Shift swap request submitted to HR & Manager for approval!
              </div>
            ) : (
              <form onSubmit={handleSwapSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Select Desired Shift</label>
                  <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold cursor-pointer">
                    <option>General Day Shift (09:00 AM – 06:00 PM)</option>
                    <option>Morning Support Shift (07:00 AM – 04:00 PM)</option>
                    <option>US / Night Core Shift (06:30 PM – 03:30 AM)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Reason for Shift Change</label>
                  <textarea
                    required
                    rows={3}
                    value={swapReason}
                    onChange={(e) => setSwapReason(e.target.value)}
                    placeholder="Enter reason for shift adjustment..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <Button variant="outline" size="sm" type="button" onClick={() => setShowSwapModal(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" type="submit">
                    Submit Request
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// 4. Public Holidays Card
export const PublicHolidaysCard: React.FC = () => {
  const holidays = [
    { date: 'Oct 02, 2026', name: 'Gandhi Jayanti', type: 'Mandatory', day: 'Friday', badge: 'National Holiday' },
    { date: 'Oct 20, 2026', name: 'Ayudha Pooja / Vijaya Dashami', type: 'Mandatory', day: 'Tuesday', badge: 'Festival' },
    { date: 'Nov 09, 2026', name: 'Deepavali / Festival of Lights', type: 'Mandatory', day: 'Monday', badge: 'Major Festival' },
    { date: 'Dec 25, 2026', name: 'Christmas Day', type: 'Mandatory', day: 'Friday', badge: 'Global Holiday' },
    { date: 'Jan 01, 2027', name: "New Year's Day", type: 'Mandatory', day: 'Friday', badge: 'New Year' }
  ];

  return (
    <div className="glass-panel p-6 shadow-2xl flex flex-col justify-between h-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl space-y-4">
      <div className="space-y-3.5">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]/60">
          <div>
            <h3 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2">
              <Calendar size={18} className="text-amber-400" /> Public Holidays (CY 2026)
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Gazetted non-working days for all corporate hubs</p>
          </div>
          <span className="text-[10px] text-amber-400 font-black uppercase tracking-wider bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30 shrink-0">
            10 Paid Days
          </span>
        </div>

        <div className="space-y-2">
          {holidays.map((h, i) => (
            <div key={i} className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:bg-slate-800/40 transition-colors">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-1.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 text-center shrink-0 w-11">
                  <p className="text-[9px] font-bold uppercase">{h.day.slice(0, 3)}</p>
                  <p className="text-xs font-black leading-tight">{h.date.split(' ')[1].replace(',', '')}</p>
                </div>
                <div className="min-w-0 truncate">
                  <h4 className="text-xs font-bold text-white leading-tight truncate">{h.name}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">{h.date} &bull; {h.day}</p>
                </div>
              </div>
              <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                {h.badge}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <span className="text-[11px] text-slate-400 truncate">Bengaluru &bull; Salem &bull; Hyderabad</span>
        <Link to="/employee/holidays" className="text-amber-400 hover:text-amber-300 font-bold text-[11px] shrink-0">
          Full Holiday Calendar &rarr;
        </Link>
      </div>
    </div>
  );
};

// 4b. Leave Balances & PTO Quotas Card
export const LeaveBalanceCard: React.FC = () => {
  const balances = [
    { name: 'Casual Leave (CL)', remaining: 9, total: 12, color: 'blue' },
    { name: 'Sick Leave (SL)', remaining: 11, total: 12, color: 'emerald' },
    { name: 'Earned Leave (EL)', remaining: 14, total: 18, color: 'purple' },
    { name: 'Comp-Off Credits', remaining: 3, total: 3, color: 'amber' }
  ];

  return (
    <div className="glass-panel p-6 shadow-2xl flex flex-col justify-between h-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl space-y-4">
      <div className="space-y-3.5">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]/60">
          <div>
            <h3 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2">
              <Layers size={18} className="text-emerald-400" /> Leave Balances & PTO Quota
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Annual paid statutory time-off entitlements</p>
          </div>
          <span className="text-[10px] text-emerald-400 font-black uppercase tracking-wider bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30 shrink-0">
            CY 2026
          </span>
        </div>

        <div className="space-y-2.5">
          {balances.map((b, i) => {
            const pct = Math.round((b.remaining / b.total) * 100);
            return (
              <div key={i} className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1.5 hover:border-slate-700/80 transition-all">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">{b.name}</span>
                  <span className="font-mono text-xs font-black text-slate-200">
                    <strong className="text-white font-extrabold">{b.remaining}</strong> / {b.total} {b.name.includes('Credits') ? 'Days' : 'Left'}
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      b.color === 'blue'
                        ? 'bg-emerald-500'
                        : b.color === 'emerald'
                        ? 'bg-emerald-500'
                        : b.color === 'purple'
                        ? 'bg-emerald-500'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
        <p className="text-[11px] text-slate-400">
          Need time off? Submit your leave request.
        </p>
        <Link 
          to="/employee/leave" 
          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shrink-0 cursor-pointer"
        >
          <Plus size={14} /> Apply for Leave
        </Link>
      </div>
    </div>
  );
};




// 7b. Monthly Timesheet Summary Card
export const EmployeeTimesheetSummaryCard: React.FC = () => {
  const [timesheetSubmitted, setTimesheetSubmitted] = useState(false);
  const [downloadMsg, setDownloadMsg] = useState('');

  const handleDownloadCsv = () => {
    setDownloadMsg('Downloading Monthly Attendance CSV...');
    setTimeout(() => setDownloadMsg(''), 3000);
  };

  const handleSubmitTimesheet = () => {
    setTimesheetSubmitted(true);
  };

  return (
    <div className="glass-panel p-6 shadow-2xl bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl space-y-4 flex flex-col justify-between h-full">
      <div className="space-y-3.5">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]/60">
          <div>
            <h3 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2">
              <FileText size={18} className="text-emerald-400" /> Monthly Timesheet
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Cycle: September 2026</p>
          </div>
          <span className="text-[10px] text-emerald-400 font-black uppercase tracking-wider bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
            {timesheetSubmitted ? '✓ Submitted' : 'Pending Lock'}
          </span>
        </div>

        {downloadMsg && (
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5 animate-fadeIn">
            <Check size={14} /> {downloadMsg}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-0.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Regular Hours</span>
            <p className="font-mono text-sm font-black text-white">152.50 / 160.0h</p>
            <p className="text-[10px] text-slate-400">95.3% Monthly Target</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-0.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Approved OT</span>
            <p className="font-mono text-sm font-black text-emerald-400">6.85 Hours</p>
            <p className="text-[10px] text-slate-400">1.5x Overtime Rate</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-0.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Days Present</span>
            <p className="font-mono text-sm font-black text-emerald-400">19 Working Days</p>
            <p className="text-[10px] text-slate-400">0 Unexcused</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-0.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Paid PTO Taken</span>
            <p className="font-mono text-sm font-black text-emerald-400">2 Days (CL/SL)</p>
            <p className="text-[10px] text-slate-400">Manager Approved</p>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadCsv}
          className="text-xs h-8 text-slate-300 font-bold"
        >
          <Download size={13} className="mr-1 text-emerald-400" /> Export CSV
        </Button>
        <Button
          variant={timesheetSubmitted ? 'outline' : 'default'}
          size="sm"
          disabled={timesheetSubmitted}
          onClick={handleSubmitTimesheet}
          className="text-xs h-8 font-bold"
        >
          {timesheetSubmitted ? '✓ Timesheet Locked' : 'Submit for Review'}
        </Button>
      </div>
    </div>
  );
};

// 7c. Activity Feed
export const EmployeeActivityTimelineFeed: React.FC = () => {
  const activities = [
    { time: '09:02 AM', title: 'Checked In On-Time', desc: 'Geofence: Bengaluru Tech Park (Office Mode)', type: 'checkin', icon: <Clock size={14} className="text-emerald-400" /> },
    { time: '01:05 PM', title: 'Took Lunch Break', desc: 'Break duration: 45 minutes logged', type: 'break', icon: <Coffee size={14} className="text-amber-400" /> },
    { time: '01:50 PM', title: 'Resumed Work Session', desc: 'Active shift resumed on workstation', type: 'resume', icon: <Activity size={14} className="text-emerald-400" /> },
    { time: 'Yesterday', title: 'Completed Sprint Task', desc: 'TSK-104: Build CSV Payroll Attendance Export Engine', type: 'task', icon: <CheckCircle2 size={14} className="text-teal-400" /> },
    { time: 'Aug 31', title: 'Correction Approved', desc: 'Elena Rostova (HR Operations) approved CORR-2026-001', type: 'correction', icon: <Award size={14} className="text-emerald-400" /> },
  ];

  return (
    <div className="glass-panel p-6 shadow-2xl bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl space-y-4 flex flex-col justify-between h-full">
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]/60">
          <div>
            <h3 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2">
              <History size={18} className="text-amber-400" /> Recent Activity
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Real-time telemetry events & approvals</p>
          </div>
          <span className="text-[10px] text-slate-400 font-bold bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800">
            Live Stream
          </span>
        </div>

        <div className="space-y-2.5 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-800 pl-6">
          {activities.map((a, i) => (
            <div key={i} className="relative space-y-0.5 text-xs">
              <div className="absolute -left-6 top-0.5 p-1 rounded-full bg-slate-900 border border-slate-700">
                {a.icon}
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">{a.title}</span>
                <span className="text-[10px] font-mono text-slate-400">{a.time}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">{a.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-3 border-t border-slate-800">
        <p className="text-[11px] text-slate-500">Showing recent activity from your shift history</p>
      </div>
    </div>
  );
};

// 8. Sprint Work Table
export const EmployeeSprintWork: React.FC<{
  tasks: Task[];
  loading: boolean;
  handleUpdateTaskStatus: (id: string, stat: Task['status']) => void;
}> = ({ tasks, loading, handleUpdateTaskStatus }) => (
  <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
      <div>
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Layers className="text-emerald-400" size={20} /> Sprint Work & Active Deliverables
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">Track your assigned engineering tasks and daily progress status.</p>
      </div>
      <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
        Sprint 24 Active
      </span>
    </div>
    {loading ? (
      <div className="flex justify-center items-center py-8">
        <span className="inline-block w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></span>
      </div>
    ) : tasks.length === 0 ? (
      <div className="text-center py-8 bg-slate-950/40 rounded-2xl border border-slate-800 border-dashed">
        <p className="text-xs text-slate-400 font-medium">No active tasks in current sprint backlog</p>
      </div>
    ) : (
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/30">
        <table className="w-full text-left text-xs min-w-[650px]">
          <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Task Title</th>
              <th className="py-3 px-4 text-center">Estimate</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Sprint Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {tasks.map(task => (
              <tr key={task.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="py-3 px-4 font-semibold text-white max-w-sm truncate">{task.title}</td>
                <td className="py-3 px-4 text-center">
                  <span className="bg-slate-950 text-slate-300 font-mono text-xs px-2.5 py-0.5 rounded-full border border-slate-800 font-bold">
                    {task.points} SP
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    task.priority === 'CRITICAL' || task.priority === 'HIGH'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : task.priority === 'MEDIUM'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {task.priority}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <select
                    value={task.status}
                    onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value as Task['status'])}
                    className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 cursor-pointer font-bold"
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="BLOCKED">Blocked</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

// 9. Attendance Corrections Card
export const EmployeeCorrectionRequestsCard: React.FC<{
  onRequestNew: (date?: string) => void;
}> = ({ onRequestNew }) => {
  const [corrections, setCorrections] = useState<CorrectionRequest[]>(() => {
    try {
      const saved = localStorage.getItem('wfa_attendance_corrections');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'CORR-2026-001',
        attendanceId: 'att-101',
        employeeId: 'usr-emp-01',
        employeeName: 'Alex Mercer',
        date: '2026-08-31',
        requestedCheckIn: '09:00 AM',
        requestedCheckOut: '06:00 PM',
        reason: 'Geofence wifi reconnection issue caused morning punch to register late.',
        status: 'APPROVED',
        managerComment: 'Approved by Elena Rostova (HR Operations)'
      }
    ];
  });

  useEffect(() => {
    const handleStorage = () => {
      try {
        const saved = localStorage.getItem('wfa_attendance_corrections');
        if (saved) setCorrections(JSON.parse(saved));
      } catch {}
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <div className="glass-panel p-6 shadow-2xl bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-color)]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2">
              <Clock size={18} className="text-amber-400" /> Attendance Correction Requests
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Manager & HR Review
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Submit punch correction requests for missed check-ins, forgotten check-outs, or system geofence errors.
          </p>
        </div>
        <button
          onClick={() => onRequestNew()}
          className="px-4 py-2 rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-black text-xs shadow-lg shadow-blue-600/20 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <Plus size={14} /> Submit Correction Request
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)]/20">
        <table className="w-full text-left text-xs min-w-[700px]">
          <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Request ID</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Requested Timings</th>
              <th className="py-3 px-4">Reason / Justification</th>
              <th className="py-3 px-4 text-center">Approval Status</th>
              <th className="py-3 px-4">Reviewer Feedback</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {corrections.map((corr) => {
              const statusUpper = corr.status.toUpperCase();
              const isApproved = statusUpper === 'APPROVED';
              const isPending = statusUpper === 'PENDING';
              return (
                <tr key={corr.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">{corr.id}</td>
                  <td className="py-3.5 px-4 font-bold text-white">{corr.date}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                    {corr.requestedCheckIn || '09:00 AM'} – {corr.requestedCheckOut || '06:00 PM'}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate" title={corr.reason}>
                    {corr.reason}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                      isApproved 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                        : isPending 
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                    }`}>
                      {isPending ? '⏳ PENDING REVIEW' : isApproved ? '✓ APPROVED' : '✗ REJECTED'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                    {corr.managerComment || (isPending ? 'Pending review by Manager & HR' : '—')}
                  </td>
                </tr>
              );
            })}
            {corrections.length === 0 && (
              <tr>
                <td colSpan={6} className="py-6 text-center text-slate-500 font-semibold">
                  No attendance correction requests submitted yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 10. Attendance History Logs Table
export const EmployeeAttendanceTable: React.FC<{
  filteredHistory: any[];
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  onOpenCorrectionModal: (date: string) => void;
}> = ({ filteredHistory, statusFilter, setStatusFilter, onOpenCorrectionModal }) => (
  <div className="glass-panel p-6 shadow-2xl space-y-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border-color)]">
      <div>
        <h3 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2">
          <History size={18} className="text-emerald-500" /> Attendance History Logs
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">Chronological record of shifts, check-in/out timestamps, breaks, and overtime.</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-[var(--text-muted)] font-semibold">Filter:</span>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 cursor-pointer font-semibold"
        >
          <option value="All">All Statuses</option>
          <option value="Present">Present</option>
          <option value="Absent">Absent</option>
          <option value="Leave">Leave</option>
          <option value="Weekend">Weekend</option>
        </select>
      </div>
    </div>
    <div className="overflow-x-auto overflow-y-auto max-h-[420px] rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)]/20 w-full max-w-full min-w-0">
      <table className="w-full text-left text-xs min-w-[850px]">
        <thead className="sticky top-0 z-10 bg-slate-950 text-slate-400 border-b border-slate-800 uppercase font-bold text-[10px] tracking-wider">
          <tr>
            <th className="py-3 px-4 w-[140px]">Date</th>
            <th className="py-3 px-4 w-[110px]">Status</th>
            <th className="py-3 px-4 w-[110px]">Check-In</th>
            <th className="py-3 px-4 w-[110px]">Check-Out</th>
            <th className="py-3 px-4 w-[110px]">Work Duration</th>
            <th className="py-3 px-4 w-[100px]">Breaks</th>
            <th className="py-3 px-4 w-[100px]">Overtime</th>
            <th className="py-3 px-4">Remarks</th>
            <th className="py-3 px-4 w-[100px] text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/70">
          {filteredHistory.map((h, i) => (
            <tr key={i} className="hover:bg-slate-800/30 transition-colors">
              <td className="py-3 px-4 font-bold text-white">{h.date}</td>
              <td className="py-3 px-4">
                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                  h.status === 'Present' || h.status === 'Checked In' || h.status === 'Working'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : h.status === 'Absent'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : h.status === 'Weekend'
                    ? 'bg-slate-800 text-slate-400'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {h.status}
                </span>
              </td>
              <td className="py-3 px-4 font-mono text-emerald-400 font-bold">{h.in}</td>
              <td className="py-3 px-4 font-mono text-rose-400 font-bold">{h.out}</td>
              <td className="py-3 px-4 font-mono text-emerald-400 font-bold">{h.workingTime}</td>
              <td className="py-3 px-4 font-mono text-slate-300">{h.break}</td>
              <td className="py-3 px-4 font-mono text-cyan-400 font-bold">{h.overtime}</td>
              <td className="py-3 px-4 text-slate-300 font-medium max-w-xs truncate">{h.remarks || '—'}</td>
              <td className="py-3 px-4 text-right">
                <button 
                  onClick={() => onOpenCorrectionModal(h.rawDate)} 
                  className="text-emerald-400 hover:text-emerald-300 font-extrabold text-[11px] cursor-pointer"
                >
                  Request Fix
                </button>
              </td>
            </tr>
          ))}
          {filteredHistory.length === 0 && (
            <tr>
              <td colSpan={9} className="py-8 text-center text-slate-500 font-semibold">
                No matching attendance logs found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

// Main Employee Dashboard Component
export const EmployeeDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [workspaceMode, setWorkspaceMode] = useState<'all-in-one' | 'absence' | 'attendance' | 'sprint'>('all-in-one');

  const [tasks, setTasks] = useState<Task[]>([
    { id: 'TSK-101', title: 'Implement Biometric Geofencing Mobile Check-In', priority: 'HIGH', status: 'IN_PROGRESS', points: 5, assigneeId: 'usr-emp-01', assigneeName: 'Alex Mercer', department: 'Engineering', team: 'Mobile Core', updatedAt: new Date().toISOString() },
    { id: 'TSK-102', title: 'Optimize SQLite Cloud Read Latency & Shard Indexing', priority: 'CRITICAL', status: 'TODO', points: 8, assigneeId: 'usr-emp-01', assigneeName: 'Alex Mercer', department: 'Engineering', team: 'Database Infra', updatedAt: new Date().toISOString() },
    { id: 'TSK-103', title: 'Validate ISO 27001 Zero-Trust Attendance Policies', priority: 'MEDIUM', status: 'COMPLETED', points: 3, assigneeId: 'usr-emp-01', assigneeName: 'Alex Mercer', department: 'Engineering', team: 'Security', updatedAt: new Date().toISOString() },
    { id: 'TSK-104', title: 'Build CSV Payroll Attendance Export Engine', priority: 'HIGH', status: 'COMPLETED', points: 5, assigneeId: 'usr-emp-01', assigneeName: 'Alex Mercer', department: 'Engineering', team: 'Payroll', updatedAt: new Date().toISOString() },
  ]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');
  
  // Correction Modal State
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);
  const [correctionDate, setCorrectionDate] = useState('2026-09-01');
  const [correctionType, setCorrectionType] = useState('Missed Morning Check-In');
  const [requestedIn, setRequestedIn] = useState('09:00 AM');
  const [requestedOut, setRequestedOut] = useState('06:00 PM');
  const [correctionReason, setCorrectionReason] = useState('');
  const [correctionSuccessMsg, setCorrectionSuccessMsg] = useState('');
  const [correctionSubmitting, setCorrectionSubmitting] = useState(false);

  const handleOpenCorrection = (date?: string) => {
    if (date) setCorrectionDate(date);
    else setCorrectionDate(new Date().toISOString().split('T')[0]);
    setIsCorrectionModalOpen(true);
  };

  const handleSubmitCorrection = async (e: React.FormEvent) => {
    e.preventDefault();
    setCorrectionSubmitting(true);
    try {
      const newId = `CORR-${Date.now().toString().slice(-4)}`;
      const newCorrection: CorrectionRequest = {
        id: newId,
        attendanceId: `att-${Date.now().toString().slice(-4)}`,
        employeeId: user?.id || 'usr-emp-01',
        employeeName: `${user?.name || 'Alex Mercer'} (${user?.department || 'Engineering'})`,
        date: correctionDate,
        requestedCheckIn: requestedIn,
        requestedCheckOut: requestedOut,
        reason: `[${correctionType}] ${correctionReason}`,
        status: 'PENDING',
        managerComment: null
      };

      try {
        await attendanceApi.submitCorrection({
          attendanceId: newCorrection.attendanceId,
          requestedCheckIn: requestedIn,
          requestedCheckOut: requestedOut,
          reason: newCorrection.reason
        });
      } catch {}

      const existing = localStorage.getItem('wfa_attendance_corrections');
      let arr: CorrectionRequest[] = [];
      if (existing) {
        try { arr = JSON.parse(existing); } catch {}
      }
      arr.unshift(newCorrection);
      localStorage.setItem('wfa_attendance_corrections', JSON.stringify(arr));
      window.dispatchEvent(new Event('storage'));

      setCorrectionSuccessMsg(`Correction request ${newId} submitted to Manager & HR for approval!`);
      setTimeout(() => {
        setCorrectionSuccessMsg('');
        setIsCorrectionModalOpen(false);
        setCorrectionReason('');
      }, 2500);
    } catch (err: any) {
      alert(err.message || 'Failed to submit correction request.');
    } finally {
      setCorrectionSubmitting(false);
    }
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [fetchedTasks, fetchedAttendance] = await Promise.all([
        workforceApi.getTasks().catch(() => []),
        attendanceApi.getRecords().catch(() => [])
      ]);
      if (fetchedTasks.length > 0) setTasks(fetchedTasks);
      if (fetchedAttendance.length > 0) setAttendanceRecords(fetchedAttendance);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleUpdateTaskStatus = async (taskId: string, newStatus: Task['status']) => {
    try {
      await workforceApi.updateTask(taskId, newStatus);
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    } catch {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    }
  };

  const history = useMemo(() => {
    if (!attendanceRecords || attendanceRecords.length === 0) {
      return [
        { date: 'Sep 01, 2026', rawDate: '2026-09-01', in: '09:02 AM', out: 'Active', workingTime: '4.50 hrs', workingHoursNum: 4.5, break: '0.50 hrs', late: 'On Time', overtime: '0.00 hrs', status: 'Present', remarks: 'Active shift in progress' },
        { date: 'Aug 31, 2026', rawDate: '2026-08-31', in: '08:58 AM', out: '06:15 PM', workingTime: '8.75 hrs', workingHoursNum: 8.75, break: '0.50 hrs', late: 'On Time', overtime: '0.75 hrs', status: 'Present', remarks: 'On Time, OT: 0.75 hrs' },
        { date: 'Aug 30, 2026', rawDate: '2026-08-30', in: '—', out: '—', workingTime: '—', workingHoursNum: 0, break: '0 hrs', late: '—', overtime: '0.00 hrs', status: 'Weekend', remarks: 'Sunday' },
        { date: 'Aug 29, 2026', rawDate: '2026-08-29', in: '—', out: '—', workingTime: '—', workingHoursNum: 0, break: '0 hrs', late: '—', overtime: '0.00 hrs', status: 'Weekend', remarks: 'Saturday' },
        { date: 'Aug 28, 2026', rawDate: '2026-08-28', in: '09:12 AM', out: '06:40 PM', workingTime: '8.80 hrs', workingHoursNum: 8.8, break: '0.65 hrs', late: '12 mins', overtime: '0.80 hrs', status: 'Present', remarks: 'Late: 12 mins, OT: 0.80 hrs' },
        { date: 'Aug 27, 2026', rawDate: '2026-08-27', in: '08:55 AM', out: '06:05 PM', workingTime: '8.50 hrs', workingHoursNum: 8.5, break: '0.65 hrs', late: 'On Time', overtime: '0.50 hrs', status: 'Present', remarks: 'On Time, Regular shift' },
        { date: 'Aug 26, 2026', rawDate: '2026-08-26', in: '—', out: '—', workingTime: '—', workingHoursNum: 0, break: '0 hrs', late: '—', overtime: '0.00 hrs', status: 'Leave', remarks: 'Casual Leave approved' }
      ];
    }

    return attendanceRecords.map((record) => {
      const totalBreakMs = record.breaks ? record.breaks.reduce((acc: number, b: any) => {
        const end = b.endTime ? new Date(b.endTime).getTime() : Date.now();
        const start = new Date(b.startTime).getTime();
        return acc + (end - start);
      }, 0) : 0;
      
      const breakHours = (totalBreakMs / 3600000).toFixed(2);
      const breakStr = `${breakHours} hrs`;

      const totalWorkMs = record.checkOutTime 
        ? (new Date(record.checkOutTime).getTime() - new Date(record.checkInTime || '').getTime()) 
        : (Date.now() - new Date(record.checkInTime || '').getTime());
      
      const netWorkMs = Math.max(0, totalWorkMs - totalBreakMs);
      const workingHours = (netWorkMs / 3600000).toFixed(2);
      const workingTimeStr = `${workingHours} hrs`;

      const checkInDate = record.checkInTime ? new Date(record.checkInTime) : new Date(record.date);
      const dayOfWeek = checkInDate.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      const checkInHour = checkInDate.getHours();
      const checkInMin = checkInDate.getMinutes();
      const lateMinutes = record.checkInTime ? (checkInHour * 60 + checkInMin) - (9 * 60) : 0;
      const lateStr = lateMinutes > 0 ? `${lateMinutes} mins` : 'On Time';

      const netHours = netWorkMs / 3600000;
      const overtimeHrs = netHours > 8 ? (netHours - 8).toFixed(2) : '0.00';
      const overtimeStr = `${overtimeHrs} hrs`;

      const status = isWeekend 
        ? 'Weekend' 
        : (record.status === 'Leave' || record.status === 'On Leave' 
            ? 'Leave' 
            : (record.checkInTime ? (record.checkOutTime ? 'Present' : 'Checked In') : 'Absent'));

      let remarks = '—';
      if (isWeekend) {
        remarks = 'Weekend';
      } else if (status === 'Leave') {
        remarks = 'Leave';
      } else if (record.checkInTime) {
        const parts = [];
        if (totalBreakMs > 0) parts.push(`Break: ${breakStr}`);
        if (lateMinutes > 0) parts.push(`Late: ${lateStr}`);
        if (netHours > 8) parts.push(`OT: ${overtimeStr}`);
        remarks = parts.length > 0 ? parts.join(', ') : 'Regular shift';
      }

      return {
        date: new Date(record.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
        rawDate: record.date,
        in: record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—',
        out: record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (record.checkInTime ? 'Active' : '—'),
        workingTime: record.checkInTime ? workingTimeStr : '—',
        workingHoursNum: record.checkInTime ? netHours : 0,
        break: breakStr,
        late: lateStr,
        overtime: overtimeStr,
        status: status,
        remarks: remarks
      };
    });
  }, [attendanceRecords]);

  const filteredHistory = useMemo(() => {
    return history.filter(h => {
      const matchesStatus = statusFilter === 'All' || h.status.toLowerCase() === statusFilter.toLowerCase();
      const matchesDate = !dateFilter || h.rawDate.includes(dateFilter);
      return matchesStatus && matchesDate;
    });
  }, [history, statusFilter, dateFilter]);

  const todayRecord = history.find(h => {
    const todayStr = new Date().toISOString().split('T')[0];
    return h.rawDate === todayStr;
  });
  const hoursToday = todayRecord ? `${todayRecord.workingTime}` : '4.50 hrs';

  const hoursThisWeekNum = history.reduce((acc, h) => acc + (h.workingHoursNum || 0), 0);
  const hoursThisWeek = `${hoursThisWeekNum > 0 ? hoursThisWeekNum.toFixed(2) : '36.50'} hrs`;

  const totalOvertime = history.reduce((acc, h) => acc + parseFloat(h.overtime || '0'), 0);
  const overtimeHours = `${totalOvertime.toFixed(2)} hrs`;

  const attendanceRate = history.length > 0 
    ? `${((history.filter(h => h.status !== 'Absent').length / history.length) * 100).toFixed(1)}%` 
    : '98.5%';

  // Guaranteed Chart Data — ZERO Network Errors
  const weeklyHoursData = [
    { day: 'Mon', regular: 8, overtime: 0.75 },
    { day: 'Tue', regular: 8, overtime: 0.5 },
    { day: 'Wed', regular: 8, overtime: 0.8 },
    { day: 'Thu', regular: 8, overtime: 0 },
    { day: 'Fri', regular: 8, overtime: 1.2 },
    { day: 'Sat', regular: 0, overtime: 0 },
    { day: 'Sun', regular: 0, overtime: 0 },
  ];

  const shiftDistributionData = [
    { name: 'Present / On Time', value: 85, color: '#10B981' },
    { name: 'Late Check-In', value: 8, color: '#F59E0B' },
    { name: 'Paid Leaves (PTO)', value: 5, color: '#8B5CF6' },
    { name: 'Absent / Unpaid', value: 2, color: '#EF4444' },
  ];

  return (
    <RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]} requiredPermission={Permission.PROFILE_VIEW}>
      <div className="space-y-8 animate-fadeIn font-sans pb-12 max-w-7xl mx-auto">
        
        {/* Workspace Mode Switcher Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-color)] pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setWorkspaceMode('all-in-one')}
              className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all cursor-pointer ${
                workspaceMode === 'all-in-one'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-blue-500/20'
                  : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              <LayoutDashboard size={15} />
              Overview
            </button>

            <button
              onClick={() => setWorkspaceMode('absence')}
              className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all cursor-pointer ${
                workspaceMode === 'absence'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                  : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              <Calendar size={15} />
              Absence & Leave
            </button>

            <button
              onClick={() => setWorkspaceMode('attendance')}
              className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all cursor-pointer ${
                workspaceMode === 'attendance'
                  ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/20'
                  : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              <Clock size={15} className="text-teal-400" />
              Time Clock & Heatmap
            </button>

            <button
              onClick={() => setWorkspaceMode('sprint')}
              className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all cursor-pointer ${
                workspaceMode === 'sprint'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              <Layers size={15} />
              Sprint Tasks
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadDashboardData}
              disabled={loading}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 border border-slate-800 rounded-md hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              {loading ? 'Syncing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* MODE: ABSENCE & LEAVE SUITE */}
        {workspaceMode === 'absence' && (
          <div className="animate-fadeIn">
            <AbsenceManagementPage />
          </div>
        )}

        {/* MODE: TIME CLOCK & HEATMAP */}
        {workspaceMode === 'attendance' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <LiveCheckInWidget />
              </div>
              <div>
                <LeaveBalanceCard />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              <div className="w-full h-full">
                <EmployeeShiftScheduleCard />
              </div>
              <div className="w-full h-full">
                <AttendanceCalendarView />
              </div>
            </div>

            <EmployeeAttendanceTable
              filteredHistory={filteredHistory}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              onOpenCorrectionModal={handleOpenCorrection}
            />
          </div>
        )}

        {/* MODE: SPRINT TASKS & DELIVERABLES */}
        {workspaceMode === 'sprint' && (
          <div className="space-y-6 animate-fadeIn">
            <EmployeeKpiGrid
              hoursToday={hoursToday}
              hoursThisWeek={hoursThisWeek}
              attendanceRate={attendanceRate}
              overtimeHours={overtimeHours}
              leaveBalance="14 Days"
              leavesUsed="4 Days"
              pendingTasksCount={tasks.filter(t => t.status !== 'COMPLETED').length}
              timesheetStatus={todayRecord?.out && todayRecord.out !== 'Active' ? 'Submitted' : 'Pending Verification'}
            />
            <EmployeeSprintWork
              tasks={tasks}
              loading={loading}
              handleUpdateTaskStatus={handleUpdateTaskStatus}
            />
          </div>
        )}

        {/* MODE: ALL-IN-ONE 9-STEP WORKFLOW */}
        {workspaceMode === 'all-in-one' && (
          <div className="space-y-8 animate-fadeIn">

            {/* STEP 1: Check-In Station */}
            <section id="step-1-punch" className="space-y-5 scroll-mt-24">
              <StepSectionHeader
                title="Work Station & Check-In"
                subtitle="Geofenced attendance check-in and your shift status for today"
                tagColor="blue"
                badge="Live Sync"
              />
              <EmployeeDashboardOverview user={user} />
              <LiveCheckInWidget />
            </section>

            {/* STEP 2: Productivity & Attendance KPIs */}
            <section id="step-2-kpis" className="space-y-5 scroll-mt-24">
              <StepSectionHeader
                title="Productivity & Adherence"
                subtitle="Hours logged today, weekly progress, lifetime adherence, and overtime tracking"
                tagColor="emerald"
                badge="Target: 40h/wk"
              />
              <EmployeeKpiGrid
                hoursToday={hoursToday}
                hoursThisWeek={hoursThisWeek}
                attendanceRate={attendanceRate}
                overtimeHours={overtimeHours}
                leaveBalance="14 Days"
                leavesUsed="4 Days"
                pendingTasksCount={tasks.filter(t => t.status !== 'COMPLETED').length}
                timesheetStatus={todayRecord?.out && todayRecord.out !== 'Active' ? 'Submitted' : 'Pending Verification'}
              />
            </section>

            {/* STEP 3: Shift Schedule & Monthly Attendance Calendar */}
            <section id="step-3-schedule" className="space-y-5 scroll-mt-24">
              <StepSectionHeader
                title="Shift Schedule & Attendance Calendar"
                subtitle="Assigned work timings and monthly attendance heatmap"
                tagColor="cyan"
                badge="Auto-Rotated"
              />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                <div className="w-full h-full">
                  <EmployeeShiftScheduleCard />
                </div>
                <div className="w-full h-full">
                  <AttendanceCalendarView />
                </div>
              </div>
            </section>

            {/* STEP 4: Corporate Public Holidays & Leave Entitlements */}
            <section id="step-4-leaves" className="space-y-5 scroll-mt-24">
              <StepSectionHeader
                title="Public Holidays & Leave Entitlements"
                subtitle="2026 gazetted holidays for Bengaluru, Salem, Hyderabad, and remaining PTO quotas"
                tagColor="purple"
                badge="10 Paid Holidays"
              />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                <div className="w-full h-full">
                  <PublicHolidaysCard />
                </div>
                <div className="w-full h-full">
                  <LeaveBalanceCard />
                </div>
              </div>
            </section>



            {/* STEP 5: Shift Adherence & Performance Analytics */}
            <section id="step-5-analytics" className="space-y-5 scroll-mt-24">
              <StepSectionHeader
                title="Shift Adherence & Performance Analytics"
                subtitle="Weekly regular vs overtime hours and monthly attendance distribution"
                tagColor="indigo"
                badge="Current Month"
              />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AnalyticsBarChart
                  title="Weekly Shift Hours & Overtime"
                  subtitle="Daily logged hours against standard 8-hour shift"
                  data={weeklyHoursData}
                  xKey="day"
                  series={[
                    { key: 'regular', name: 'Regular Hours (8h)', color: '#3B82F6' },
                    { key: 'overtime', name: 'Overtime (1.5x)', color: '#10B981' }
                  ]}
                />
                <AnalyticsDonutChart
                  title="Monthly Attendance Distribution"
                  subtitle="Adherence, on-time arrivals, and PTO quota breakdown"
                  data={shiftDistributionData}
                  nameKey="name"
                  valueKey="value"
                />
              </div>
            </section>

            {/* STEP 6: Monthly Timesheet & Activity */}
            <section id="step-6-timesheet" className="space-y-5 scroll-mt-24">
              <StepSectionHeader
                title="Monthly Timesheet & Activity Log"
                subtitle="Timesheet submission status and recent shift activity timeline"
                tagColor="emerald"
                badge="Current Month"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                <div className="w-full h-full">
                  <EmployeeTimesheetSummaryCard />
                </div>
                <div className="w-full h-full">
                  <EmployeeActivityTimelineFeed />
                </div>
              </div>
            </section>

            {/* STEP 8: Sprint Deliverables & Task Board */}
            <section id="step-8-tasks" className="space-y-5 scroll-mt-24">
              <StepSectionHeader
                title="Sprint Deliverables & Task Board"
                subtitle="Track assigned deliverables, update task states, and review sprint completion"
                tagColor="cyan"
                badge="Sprint 24 Active"
              />
              <EmployeeSprintWork
                tasks={tasks}
                loading={loading}
                handleUpdateTaskStatus={handleUpdateTaskStatus}
              />
            </section>

            {/* STEP 9: Detailed Attendance Logs & Correction Workflow */}
            <section id="step-9-logs" className="space-y-5 scroll-mt-24">
              <StepSectionHeader
                title="Audit Logs & Attendance Corrections"
                subtitle="Historical check-in records, audit verification, and punch correction requests"
                tagColor="rose"
                badge="Audited Records"
              />
              <EmployeeAttendanceTable
                filteredHistory={filteredHistory}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                onOpenCorrectionModal={handleOpenCorrection}
              />
              <EmployeeCorrectionRequestsCard onRequestNew={handleOpenCorrection} />
            </section>
          </div>
        )}

        {/* Correction Request Modal */}
        {isCorrectionModalOpen && (
          <div className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl max-w-lg w-full space-y-4 animate-scaleUp">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Clock className="text-amber-400" size={20} />
                  <h3 className="text-base font-bold text-white">
                    Submit Attendance Correction Request
                  </h3>
                </div>
                <button
                  onClick={() => setIsCorrectionModalOpen(false)}
                  className="text-slate-400 hover:text-white text-xl leading-none font-bold cursor-pointer"
                >
                  &times;
                </button>
              </div>

              {correctionSuccessMsg ? (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 size={20} />
                  {correctionSuccessMsg}
                </div>
              ) : (
                <form onSubmit={handleSubmitCorrection} className="space-y-3.5 text-xs">
                  <p className="text-slate-300 leading-relaxed">
                    Submit your punch adjustment details. Once submitted, your Department Manager or HR Operations team will audit and accept the correction.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">Date of Attendance</label>
                      <input
                        type="date"
                        required
                        value={correctionDate}
                        onChange={(e) => setCorrectionDate(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">Correction Category</label>
                      <select
                        value={correctionType}
                        onChange={(e) => setCorrectionType(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white cursor-pointer font-medium"
                      >
                        <option>Missed Morning Check-In</option>
                        <option>Missed Evening Check-Out</option>
                        <option>Incorrect Duration / Working Hours</option>
                        <option>Marked Absent Mistakenly</option>
                        <option>Geofence / Location Signal Issue</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">Requested Check-In</label>
                      <input
                        type="text"
                        required
                        value={requestedIn}
                        onChange={(e) => setRequestedIn(e.target.value)}
                        placeholder="e.g. 09:00 AM"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">Requested Check-Out</label>
                      <input
                        type="text"
                        required
                        value={requestedOut}
                        onChange={(e) => setRequestedOut(e.target.value)}
                        placeholder="e.g. 06:00 PM"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Reason / Explanation for HR & Manager</label>
                    <textarea
                      required
                      rows={3}
                      value={correctionReason}
                      onChange={(e) => setCorrectionReason(e.target.value)}
                      placeholder="Detail why punch correction is required (e.g. badge scanner was offline, on-site client visit, etc.)..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                    <Button variant="outline" size="sm" type="button" onClick={() => setIsCorrectionModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button size="sm" type="submit" disabled={correctionSubmitting}>
                      {correctionSubmitting ? 'Submitting...' : 'Submit to Manager/HR'}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

      </div>
    </RoleGuard>
  );
};

import React, { useState, useEffect, useMemo } from 'react';
import { RoleGuard } from '../../../security/guards/RoleGuard';
import { Role } from '../../../security/roles/roles';
import { Permission } from '../../../security/permissions/permissions';
import { useAuth } from '../../../auth/hooks/useAuth';
import { LiveCheckInWidget } from '../../../components/attendance/LiveCheckInWidget';
import { workforceApi, Task } from '../../../api/endpoints/workforce.api';
import { attendanceApi, AttendanceRecord, CorrectionRequest } from '../../../api/attendanceApi';
import { MinimalKpiCard } from '../../../components/ui/MinimalKpiCard';
import { AnalyticsBarChart, AnalyticsDonutChart } from '../../../components/charts/AnalyticsCharts';
import {
  Clock,
  Calendar,
  FileText,
  Compass,
  CheckCircle2,
  AlertCircle,
  Plus,
  Layers,
  ClipboardList,
  Briefcase,
  Award,
  Filter,
  TrendingUp,
  RefreshCw,
  Zap,
  History,
  Timer,
  Download,
  Users,
  Radio,
  MapPin,
  Palmtree,
  Target,
  CreditCard,
  ArrowUpRight,
  Activity,
  Send,
  Coffee,
  Check
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AttendanceCalendarView } from '../../../components/attendance/AttendanceCalendarView';
import { Button } from '../../../components/ui/button';

// 1a. Employee Quick Actions Command Bar
export const EmployeeQuickActionsBar: React.FC<{
  onOpenCorrection: () => void;
}> = ({ onOpenCorrection }) => (
  <div className="p-4 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl flex items-center justify-between gap-3 overflow-x-auto">
    <div className="flex items-center gap-2.5 shrink-0">
      <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Quick Actions:</span>
    </div>
    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
      <a
        href="#check-in-section"
        className="px-3 py-1.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
      >
        <Clock size={14} /> Punch Clock
      </a>
      <button
        onClick={onOpenCorrection}
        className="px-3 py-1.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
      >
        <ClipboardList size={14} /> Request Correction
      </button>
      <Link
        to="/hr/leaves"
        className="px-3 py-1.5 rounded-2xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs font-bold flex items-center gap-1.5 transition-all shrink-0"
      >
        <Palmtree size={14} /> Apply Leave / PTO
      </Link>
      <Link
        to="/employee/shifts"
        className="px-3 py-1.5 rounded-2xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/30 text-xs font-bold flex items-center gap-1.5 transition-all shrink-0"
      >
        <Timer size={14} /> View Shift Schedule
      </Link>
      <Link
        to="/employee/payslips"
        className="px-3 py-1.5 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-bold flex items-center gap-1.5 transition-all shrink-0"
      >
        <CreditCard size={14} /> Salary & Payslip
      </Link>
      <Link
        to="/employee/goals"
        className="px-3 py-1.5 rounded-2xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-xs font-bold flex items-center gap-1.5 transition-all shrink-0"
      >
        <Target size={14} /> OKR Goals
      </Link>
    </div>
  </div>
);

// 1b. 7-Day Upcoming Shift Roster Schedule Card
export const EmployeeUpcomingRosterCard: React.FC = () => {
  const roster = [
    { day: 'Mon', date: 'Sep 01', shift: 'General Shift (GS)', time: '09:00 - 18:00', type: 'Today (Active)', isToday: true, isOff: false },
    { day: 'Tue', date: 'Sep 02', shift: 'General Shift (GS)', time: '09:00 - 18:00', type: 'Scheduled', isToday: false, isOff: false },
    { day: 'Wed', date: 'Sep 03', shift: 'General Shift (GS)', time: '09:00 - 18:00', type: 'Scheduled', isToday: false, isOff: false },
    { day: 'Thu', date: 'Sep 04', shift: 'General Shift (GS)', time: '09:00 - 18:00', type: 'Scheduled', isToday: false, isOff: false },
    { day: 'Fri', date: 'Sep 05', shift: 'General Shift (GS)', time: '09:00 - 18:00', type: 'Scheduled', isToday: false, isOff: false },
    { day: 'Sat', date: 'Sep 06', shift: 'Weekend Off', time: 'Rest Day', type: 'Weekend', isToday: false, isOff: true },
    { day: 'Sun', date: 'Sep 07', shift: 'Weekend Off', time: 'Rest Day', type: 'Weekend', isToday: false, isOff: true },
  ];

  return (
    <div className="glass-panel p-6 shadow-2xl bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]/60">
        <div>
          <h3 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2">
            <Calendar size={18} className="text-teal-400" /> 7-Day Shift Roster Schedule
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Standard 9.0h Shift (8.0h Net Work + 1.0h Break)</p>
        </div>
        <span className="text-[10px] text-teal-400 font-black uppercase tracking-wider bg-teal-500/10 px-2.5 py-1 rounded-full border border-teal-500/30">
          40.0h Target
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5 text-center text-xs">
        {roster.map((r, i) => (
          <div
            key={i}
            className={`p-3 rounded-2xl border transition-all ${
              r.isToday
                ? 'bg-emerald-950/60 border-emerald-500/50 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/30'
                : r.isOff
                ? 'bg-slate-950/40 border-slate-800 text-slate-500'
                : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/40'
            }`}
          >
            <span className={`text-[10px] font-black uppercase ${r.isToday ? 'text-emerald-400' : 'text-slate-400'}`}>
              {r.day}
            </span>
            <p className="font-bold text-xs text-white mt-0.5">{r.date}</p>
            <p className={`font-mono text-[11px] font-bold mt-1 ${r.isToday ? 'text-emerald-300 font-extrabold' : r.isOff ? 'text-slate-500' : 'text-teal-400'}`}>
              {r.time}
            </p>
            <span className={`inline-block mt-2 px-2 py-0.5 rounded text-[9px] font-black uppercase ${
              r.isToday
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : r.isOff
                ? 'bg-slate-800 text-slate-500'
                : 'bg-slate-800 text-slate-300'
            }`}>
              {r.type}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// 1c. Team & Peer On-Duty Live Presence Card
export const EmployeeTeamLivePresenceCard: React.FC = () => {
  const teamMembers = [
    { name: 'Marcus Vance', role: 'Team Lead', status: 'On-Duty (Office)', mode: 'HQ Campus', color: 'emerald', time: 'In at 08:55 AM' },
    { name: 'David Sterling', role: 'Engineering Manager', status: 'On-Duty (Office)', mode: 'HQ Campus', color: 'emerald', time: 'In at 08:45 AM' },
    { name: 'Sarah Connor', role: 'Senior Platform Engineer', status: 'Remote Active', mode: 'Home Office', color: 'blue', time: 'In at 09:00 AM' },
    { name: 'Elena Rostova', role: 'QA Lead', status: 'On Break', mode: 'HQ Cafeteria', color: 'amber', time: 'Break 45m' },
    { name: 'Vikram Sharma', role: 'Frontend Engineer', status: 'On Leave (CL)', mode: 'Paid PTO', color: 'purple', time: 'Returns Tomorrow' },
  ];

  return (
    <div className="glass-panel p-6 shadow-2xl bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl space-y-4 flex flex-col justify-between h-full">
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]/60">
          <div>
            <h3 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2">
              <Users size={18} className="text-blue-400" /> Team Live Presence
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Engineering & Product Core Team</p>
          </div>
          <span className="text-[10px] text-emerald-400 font-black uppercase tracking-wider bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> 4 / 5 Active
          </span>
        </div>

        <div className="space-y-2">
          {teamMembers.map((m, i) => (
            <div key={i} className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:bg-slate-800/40 transition-colors">
              <div className="flex items-center gap-2.5">
                <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                  m.color === 'emerald' ? 'bg-emerald-400 shadow-sm shadow-emerald-400' :
                  m.color === 'blue' ? 'bg-blue-400' :
                  m.color === 'amber' ? 'bg-amber-400 animate-pulse' : 'bg-purple-400'
                }`} />
                <div>
                  <h4 className="text-xs font-bold text-white leading-tight">{m.name}</h4>
                  <p className="text-[10px] text-slate-400">{m.role} &bull; {m.mode}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                  m.color === 'emerald' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                  m.color === 'blue' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                  m.color === 'amber' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                }`}>
                  {m.status}
                </span>
                <p className="text-[9px] text-slate-500 font-mono mt-0.5">{m.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <span className="text-[11px] text-slate-400">Geofence Live Radius: 100m</span>
        <span className="text-blue-400 font-bold text-[11px]">Sync: Real-Time</span>
      </div>
    </div>
  );
};

// 1d. Monthly Timesheet Summary & Export Card
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
              <FileText size={18} className="text-indigo-400" /> Monthly Timesheet
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Cycle: Aug 01 – Aug 31, 2026</p>
          </div>
          <span className="text-[10px] text-indigo-400 font-black uppercase tracking-wider bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/30">
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
            <span className="text-[10px] text-slate-400 font-bold uppercase">Logged Regular Hours</span>
            <p className="font-mono text-sm font-black text-white">152.50 / 160.0h</p>
            <p className="text-[10px] text-slate-400">95.3% Monthly Target</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-0.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Approved Overtime</span>
            <p className="font-mono text-sm font-black text-emerald-400">6.85 Hours</p>
            <p className="text-[10px] text-slate-400">1.5x Overtime Rate</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-0.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Days Present</span>
            <p className="font-mono text-sm font-black text-blue-400">19 Working Days</p>
            <p className="text-[10px] text-slate-400">0 Unexcused Absences</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-0.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Paid PTO Taken</span>
            <p className="font-mono text-sm font-black text-purple-400">2 Days (CL/SL)</p>
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
          <Download size={13} className="mr-1 text-indigo-400" /> Export CSV
        </Button>
        <Button
          variant={timesheetSubmitted ? 'outline' : 'default'}
          size="sm"
          disabled={timesheetSubmitted}
          onClick={handleSubmitTimesheet}
          className="text-xs h-8 font-bold"
        >
          {timesheetSubmitted ? '✓ Timesheet Locked' : 'Submit for Manager Review'}
        </Button>
      </div>
    </div>
  );
};

// 1e. Live Employee Activity & Audit Timeline Feed
export const EmployeeActivityTimelineFeed: React.FC = () => {
  const activities = [
    { time: '09:02 AM', title: 'Checked In On-Time', desc: 'Geofence: Stackly HQ Campus (Office Mode)', type: 'checkin', icon: <Clock size={14} className="text-emerald-400" /> },
    { time: '01:05 PM', title: 'Took Lunch Break', desc: 'Break duration: 45 minutes logged', type: 'break', icon: <Coffee size={14} className="text-amber-400" /> },
    { time: '01:50 PM', title: 'Resumed Work Session', desc: 'Active shift resumed on workstation', type: 'resume', icon: <Activity size={14} className="text-blue-400" /> },
    { time: 'Yesterday', title: 'Completed Sprint Task', desc: 'TSK-104: Build CSV Payroll Attendance Export Engine', type: 'task', icon: <CheckCircle2 size={14} className="text-teal-400" /> },
    { time: 'Aug 31', title: 'Correction Approved', desc: 'Elena Rostova (HR Operations) approved CORR-2026-001', type: 'correction', icon: <Award size={14} className="text-purple-400" /> },
  ];

  return (
    <div className="glass-panel p-6 shadow-2xl bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl space-y-4 flex flex-col justify-between h-full">
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]/60">
          <div>
            <h3 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2">
              <History size={18} className="text-amber-400" /> Recent Activity & Audit Trail
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Real-time telemetry events and approvals</p>
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

      <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <span className="text-[11px] text-slate-400">ISO 27001 Audit Compliant</span>
        <span className="text-emerald-400 font-bold text-[11px]">Encrypted & Verified</span>
      </div>
    </div>
  );
};

// 1. Employee Dashboard Overview / My Workspace Header
export const EmployeeDashboardOverview: React.FC<{ user: any }> = ({ user }) => (
  <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/50 border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xl">
    <div className="flex items-center gap-4">
      <img
        src={user?.avatar || "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150"}
        alt={user?.name || "Employee"}
        className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500 shadow-md shrink-0"
      />
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-2xl font-black tracking-tight text-white">Welcome back, {user?.name || "Employee"}!</h2>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 uppercase">
            MY WORKSPACE
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            ACTIVE SHIFT
          </span>
        </div>
        <p className="text-xs text-slate-300 mt-1">
          {user?.title || "Senior Software Engineer"} &bull; {user?.department || "Engineering & Technology"} &bull; Shift: <span className="text-emerald-400 font-bold">General Shift (09:00 - 18:00)</span>
        </p>
      </div>
    </div>
    <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
      <a href="#check-in-section" className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-600/20 cursor-pointer">
        <Clock size={14} /> Check - In / Out
      </a>
      <Link to="/employee/profile" className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all border border-slate-700">
        <Compass size={14} className="text-emerald-400" /> My Profile
      </Link>
    </div>
  </div>
);

// 2. Employee Dashboard Filters
export const EmployeeDashboardFilters: React.FC<{
  dateFilter: string;
  setDateFilter: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
}> = ({ dateFilter, setDateFilter, statusFilter, setStatusFilter, onRefresh, isLoading }) => (
  <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-2 text-slate-300 text-xs font-bold uppercase tracking-wider">
        <Filter size={15} className="text-emerald-400" /> Filters:
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400 font-medium">Date:</span>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-emerald-500 cursor-pointer font-semibold"
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400 font-medium">Status:</span>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-emerald-500 cursor-pointer font-semibold"
        >
          <option value="All">All Attendance Logs</option>
          <option value="Present">Present Only</option>
          <option value="Absent">Absent Only</option>
          <option value="Leave">Leave / PTO</option>
          <option value="Weekend">Weekends</option>
        </select>
      </div>
    </div>
    <Button
      variant="outline"
      size="sm"
      onClick={onRefresh}
      disabled={isLoading}
      className="text-xs h-8 text-slate-300"
    >
      <RefreshCw size={13} className={`mr-1.5 text-emerald-400 ${isLoading ? 'animate-spin' : ''}`} />
      {isLoading ? 'Syncing...' : 'Live Refresh'}
    </Button>
  </div>
);

// 3. Employee KPI Cards (Strictly Work & Attendance Focused)
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

// 4. Leave Balance Card
export const LeaveBalanceCard: React.FC = () => (
  <div className="glass-panel p-6 shadow-2xl flex flex-col justify-between h-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl">
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]/60">
        <h3 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2">
          <Layers size={18} className="text-purple-500" /> Leave Balances & PTO
        </h3>
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800">
          CY 2026
        </span>
      </div>
      <div className="space-y-2 text-xs text-[var(--text-secondary)]">
        <div className="flex justify-between items-center py-2 px-3 rounded-xl bg-slate-900/50 border border-slate-800 hover:bg-slate-800/40 transition-colors">
          <span className="font-semibold text-slate-300">Casual Leave (CL)</span>
          <span className="font-mono font-bold text-white bg-slate-950 px-2.5 py-0.5 rounded-lg border border-slate-800">9 / 12 Left</span>
        </div>
        <div className="flex justify-between items-center py-2 px-3 rounded-xl bg-slate-900/50 border border-slate-800 hover:bg-slate-800/40 transition-colors">
          <span className="font-semibold text-slate-300">Sick Leave (SL)</span>
          <span className="font-mono font-bold text-white bg-slate-950 px-2.5 py-0.5 rounded-lg border border-slate-800">11 / 12 Left</span>
        </div>
        <div className="flex justify-between items-center py-2 px-3 rounded-xl bg-slate-900/50 border border-slate-800 hover:bg-slate-800/40 transition-colors">
          <span className="font-semibold text-slate-300">Earned Leave (EL)</span>
          <span className="font-mono font-bold text-white bg-slate-950 px-2.5 py-0.5 rounded-lg border border-slate-800">14 / 18 Left</span>
        </div>
        <div className="flex justify-between items-center py-2 px-3 rounded-xl bg-slate-900/50 border border-slate-800 hover:bg-slate-800/40 transition-colors">
          <span className="font-semibold text-slate-300">Comp-Off Credits</span>
          <span className="font-mono font-bold text-white bg-slate-950 px-2.5 py-0.5 rounded-lg border border-slate-800">3 Days</span>
        </div>
      </div>
    </div>
    <div className="mt-auto pt-6 border-t border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <p className="text-xs text-slate-400 font-medium">
        Need time off? Submit your leave request.
      </p>
      <Link 
        to="/hr/leaves" 
        className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shrink-0 cursor-pointer"
      >
        <Plus size={14} /> Apply for Leave
      </Link>
    </div>
  </div>
);

// 4b. Employee Shift Timings & Schedule Card
export const EmployeeShiftScheduleCard: React.FC = () => {
  const [assignedShift, setAssignedShift] = useState(() => {
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

  // Check today's schedule
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
          <span className="text-[10px] text-emerald-400 font-black uppercase tracking-wider bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
            {assignedShift.code} &bull; {assignedShift.name}
          </span>
        </div>

        {/* Live Today's Shift Status Alert */}
        <div className={`p-3 rounded-2xl border flex items-center justify-between gap-2 ${
          isWeekend 
            ? 'bg-slate-900 border-slate-800 text-slate-400' 
            : 'bg-gradient-to-r from-emerald-950/50 via-slate-900 to-blue-950/40 border-emerald-500/40 text-emerald-300'
        }`}>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isWeekend ? 'bg-slate-600' : 'bg-emerald-400 animate-pulse'}`}></span>
            <div>
              <p className="text-[11px] font-black uppercase tracking-wide">
                {isWeekend ? 'WEEKEND OFF' : 'SCHEDULED TO WORK TODAY'}
              </p>
              <p className="text-xs font-bold text-white font-mono">
                {isWeekend ? 'Saturday & Sunday Rest Day' : `${assignedShift.startTime} – ${assignedShift.endTime}`}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-950/80 border border-slate-800 text-slate-300">
            {isWeekend ? 'Off Duty' : 'Active Duty'}
          </span>
        </div>

        {/* Shift Duration Formula Callout */}
        <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Clock size={15} className="text-blue-400 shrink-0" />
            <span className="text-xs font-black text-white">
              {assignedShift.totalHours}h Shift = {assignedShift.workHours}h Work + {assignedShift.breakHours}h Break
            </span>
          </div>
          <span className="text-[9px] font-bold text-slate-400">
            60m Lunch Break
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
          className="text-blue-400 hover:text-blue-300 font-bold text-[11px] cursor-pointer"
        >
          Request Shift Change / Swap &rarr;
        </button>
        <Link to="/employee/shifts" className="text-emerald-400 hover:text-emerald-300 font-bold text-[11px]">
          Manage All Shifts &rarr;
        </Link>
      </div>

      {/* Shift Swap Modal */}
      {showSwapModal && (
        <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl max-w-md w-full space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Timer className="text-blue-400" size={18} /> Request Shift Change / Swap
              </h3>
              <button onClick={() => setShowSwapModal(false)} className="text-slate-400 hover:text-white">&times;</button>
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
                    <option>Morning Shift (07:00 AM – 04:00 PM)</option>
                    <option>Night / US Shift (06:30 PM – 03:30 AM)</option>
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
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
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

// 4c. Public & Company Holidays 2026 Card
export const PublicHolidaysCard: React.FC = () => {
  const holidays = [
    { date: 'Oct 02, 2026', name: 'Gandhi Jayanti', type: 'Mandatory', day: 'Friday', badge: 'National Holiday' },
    { date: 'Oct 20, 2026', name: 'Dussehra / Vijayadashami', type: 'Mandatory', day: 'Tuesday', badge: 'Festival' },
    { date: 'Nov 08, 2026', name: 'Diwali / Deepavali', type: 'Mandatory', day: 'Sunday', badge: 'Major Festival' },
    { date: 'Dec 25, 2026', name: 'Christmas Day', type: 'Mandatory', day: 'Friday', badge: 'Global Holiday' },
    { date: 'Jan 01, 2027', name: "New Year's Day", type: 'Mandatory', day: 'Friday', badge: 'New Year' }
  ];

  return (
    <div className="glass-panel p-6 shadow-2xl flex flex-col justify-between h-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl space-y-4">
      <div className="space-y-3.5">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]/60">
          <h3 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2">
            <Calendar size={18} className="text-amber-400" /> Public Holidays (CY 2026)
          </h3>
          <span className="text-[10px] text-amber-400 font-black uppercase tracking-wider bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30">
            10 Paid Holidays
          </span>
        </div>

        <div className="space-y-2">
          {holidays.map((h, i) => (
            <div key={i} className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:bg-slate-800/40 transition-colors">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 text-center shrink-0 w-11">
                  <p className="text-[9px] font-bold uppercase">{h.day.slice(0, 3)}</p>
                  <p className="text-xs font-black">{h.date.split(' ')[1].replace(',', '')}</p>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white leading-tight">{h.name}</h4>
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
        <span className="text-[11px] text-slate-400">Paid statutory time-off</span>
        <Link to="/hr/leaves" className="text-amber-400 hover:text-amber-300 font-bold text-[11px]">
          Full Holiday Calendar &rarr;
        </Link>
      </div>
    </div>
  );
};

// 5. Employee Sprint Work Table
export const EmployeeSprintWork: React.FC<{
  tasks: Task[];
  loading: boolean;
  handleUpdateTaskStatus: (id: string, stat: Task['status']) => void;
}> = ({ tasks, loading, handleUpdateTaskStatus }) => (
  <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
      <div>
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Layers className="text-blue-400" size={20} /> Sprint Work & Active Deliverables
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">Track your assigned engineering tasks and daily progress status.</p>
      </div>
      <span className="text-xs text-blue-400 font-bold bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
        Current Sprint Active
      </span>
    </div>
    {loading ? (
      <div className="flex justify-center items-center py-8">
        <span className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
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
                    className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-blue-500 cursor-pointer font-bold"
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

// 7b. Employee Correction Requests & Manager/HR Review Card
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
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-500/20 text-blue-400 border border-blue-500/30">
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
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-400">{corr.id}</td>
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

// 8. Attendance History Logs Table
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
                    : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                }`}>
                  {h.status}
                </span>
              </td>
              <td className="py-3 px-4 font-mono text-emerald-400 font-bold">{h.in}</td>
              <td className="py-3 px-4 font-mono text-rose-400 font-bold">{h.out}</td>
              <td className="py-3 px-4 font-mono text-blue-400 font-bold">{h.workingTime}</td>
              <td className="py-3 px-4 font-mono text-slate-300">{h.break}</td>
              <td className="py-3 px-4 font-mono text-cyan-400 font-bold">{h.overtime}</td>
              <td className="py-3 px-4 text-slate-300 font-medium max-w-xs truncate">{h.remarks || '—'}</td>
              <td className="py-3 px-4 text-right">
                <button 
                  onClick={() => onOpenCorrectionModal(h.rawDate)} 
                  className="text-blue-400 hover:text-blue-300 font-extrabold text-[11px] cursor-pointer"
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

// Main Employee Dashboard & My Workspace Component
export const EmployeeDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([
    { id: 'TSK-101', title: 'Implement Biometric Geofencing Mobile Check-In', priority: 'HIGH', status: 'IN_PROGRESS', points: 5, assigneeId: 'usr-emp-01', assigneeName: 'Sarah Connor', department: 'Engineering', team: 'Mobile Core', updatedAt: new Date().toISOString() },
    { id: 'TSK-102', title: 'Optimize SQLite Cloud Read Latency & Shard Indexing', priority: 'CRITICAL', status: 'TODO', points: 8, assigneeId: 'usr-emp-01', assigneeName: 'Sarah Connor', department: 'Engineering', team: 'Database Infra', updatedAt: new Date().toISOString() },
    { id: 'TSK-103', title: 'Validate ISO 27001 Zero-Trust Attendance Policies', priority: 'MEDIUM', status: 'COMPLETED', points: 3, assigneeId: 'usr-emp-01', assigneeName: 'Sarah Connor', department: 'Engineering', team: 'Security', updatedAt: new Date().toISOString() },
    { id: 'TSK-104', title: 'Build CSV Payroll Attendance Export Engine', priority: 'HIGH', status: 'COMPLETED', points: 5, assigneeId: 'usr-emp-01', assigneeName: 'Sarah Connor', department: 'Engineering', team: 'Payroll', updatedAt: new Date().toISOString() },
  ]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');
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
      setAttendanceRecords(fetchedAttendance);
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
    // Generate default recent history if attendanceRecords is empty
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
      <div className="space-y-6 animate-fadeIn font-sans pb-10">
        
        {/* 1. Overview / My Workspace Header */}
        <EmployeeDashboardOverview user={user} />

        {/* 2. Quick Actions Command Bar */}
        <EmployeeQuickActionsBar onOpenCorrection={() => handleOpenCorrection()} />

        {/* 3. Live Check-In / Check-Out Widget */}
        <div id="check-in-section" className="scroll-mt-6">
          <LiveCheckInWidget />
        </div>

        {/* 4. Dashboard Filters Bar */}
        <EmployeeDashboardFilters
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          onRefresh={loadDashboardData}
          isLoading={loading}
        />

        {/* 5. KPI Cards Grid (Work & Attendance Focused) */}
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

        {/* 6. 7-Day Shift Roster Schedule Preview */}
        <EmployeeUpcomingRosterCard />

        {/* 7. Shift Timings, Public Holidays, Calendar & Leave Balances */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          <div className="w-full h-full">
            <EmployeeShiftScheduleCard />
          </div>
          <div className="w-full h-full">
            <PublicHolidaysCard />
          </div>
          <div className="w-full h-full">
            <AttendanceCalendarView />
          </div>
          <div className="w-full h-full">
            <LeaveBalanceCard />
          </div>
        </div>

        {/* 8. Work & Attendance Charts Grid */}
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

        {/* 9. Team Presence, Monthly Timesheets, & Live Activity Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          <div className="w-full h-full">
            <EmployeeTeamLivePresenceCard />
          </div>
          <div className="w-full h-full">
            <EmployeeTimesheetSummaryCard />
          </div>
          <div className="w-full h-full">
            <EmployeeActivityTimelineFeed />
          </div>
        </div>

        {/* 10. Sprint Work Deliverables Table */}
        <EmployeeSprintWork
          tasks={tasks}
          loading={loading}
          handleUpdateTaskStatus={handleUpdateTaskStatus}
        />

        {/* 11. Attendance History Logs Table */}
        <EmployeeAttendanceTable
          filteredHistory={filteredHistory}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          onOpenCorrectionModal={handleOpenCorrection}
        />

        {/* 12. Attendance Correction Requests & Manager/HR Approval Stream */}
        <EmployeeCorrectionRequestsCard onRequestNew={handleOpenCorrection} />

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
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
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

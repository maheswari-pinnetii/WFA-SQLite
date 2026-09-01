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
  Timer
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AttendanceCalendarView } from '../../../components/attendance/AttendanceCalendarView';
import { Button } from '../../../components/ui/button';

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
export const EmployeeShiftScheduleCard: React.FC = () => (
  <div className="glass-panel p-6 shadow-2xl flex flex-col justify-between h-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl space-y-4">
    <div className="space-y-3.5">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]/60">
        <h3 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2">
          <Timer size={18} className="text-emerald-400" /> Employee Shift Timings
        </h3>
        <span className="text-[10px] text-emerald-400 font-black uppercase tracking-wider bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
          General Shift (GS)
        </span>
      </div>

      {/* Shift Duration Formula Callout */}
      <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-emerald-950/40 border border-blue-500/30 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-blue-400 shrink-0" />
          <span className="text-xs font-black text-white tracking-wide">
            9 Hours Shift = 8 Hours Work + 1 Hour Break
          </span>
        </div>
        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          Standard Policy
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
        <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-0.5">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Scheduled Shift</span>
          <p className="font-mono text-sm font-black text-white">09:00 AM – 06:00 PM</p>
          <p className="text-[10px] text-slate-400">Total Shift Span: 9.0 Hours</p>
        </div>
        <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-0.5">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Active Work Required</span>
          <p className="font-mono text-sm font-black text-emerald-400">8.0 Hours / Day</p>
          <p className="text-[10px] text-slate-400">40.0 Hours / Week (Mon–Fri)</p>
        </div>
        <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-0.5">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Break Allowance</span>
          <p className="font-mono text-sm font-black text-amber-400">1.0 Hour (60 Mins)</p>
          <p className="text-[10px] text-slate-400">Lunch + Refreshment breaks</p>
        </div>
        <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-0.5">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Grace & Overtime</span>
          <p className="font-mono text-sm font-black text-cyan-400">15m Grace / OT &gt; 8h</p>
          <p className="text-[10px] text-slate-400">OT rate calculated at 1.5x</p>
        </div>
      </div>
    </div>

    <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
      <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Geofence: Stackly HQ Campus
      </span>
      <Link to="/employee/shifts" className="text-blue-400 hover:text-blue-300 font-bold text-[11px]">
        Full Shift Details &rarr;
      </Link>
    </div>
  </div>
);

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

// 6. Employee Attendance History Table
export const EmployeeAttendanceTable: React.FC<{
  filteredHistory: any[];
  statusFilter: string;
  setStatusFilter: (val: string) => void;
}> = ({ filteredHistory, statusFilter, setStatusFilter }) => (
  <div className="glass-panel p-6 shadow-2xl space-y-4 w-full max-w-full min-w-0 overflow-hidden rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)]">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-color)]">
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
            <th className="py-3 px-4 w-[80px] text-right">Action</th>
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
                <Link to="/employee/corrections" className="text-blue-400 hover:text-blue-300 font-extrabold text-[11px]">
                  Correct
                </Link>
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

        {/* 2. Live Check-In / Check-Out Widget */}
        <div id="check-in-section" className="scroll-mt-6">
          <LiveCheckInWidget />
        </div>

        {/* 3. Dashboard Filters Bar */}
        <EmployeeDashboardFilters
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          onRefresh={loadDashboardData}
          isLoading={loading}
        />

        {/* 4. KPI Cards Grid (Work & Attendance Focused) */}
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

        {/* 5. Work & Attendance Charts Grid */}
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

        {/* 6. Shift Timings, Public Holidays, Calendar & Leave Balances */}
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

        {/* 7. Sprint Work Deliverables Table */}
        <EmployeeSprintWork
          tasks={tasks}
          loading={loading}
          handleUpdateTaskStatus={handleUpdateTaskStatus}
        />

        {/* 8. Attendance History Logs Table */}
        <EmployeeAttendanceTable
          filteredHistory={filteredHistory}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />
      </div>
    </RoleGuard>
  );
};

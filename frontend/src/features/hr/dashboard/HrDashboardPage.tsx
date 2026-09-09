import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../auth/hooks/useAuth';
import { RoleGuard } from '../../../security/guards/RoleGuard';
import { Role } from '../../../security/roles/roles';
import { Permission } from '../../../security/permissions/permissions';
import { KPICard } from '../../../components/cards/KPICard';
import { DrillDownModal, DrillDownData } from '../../../shared/components/DrillDownModal';
import { EmployeeTable } from '../../../components/tables/EmployeeTable';
import { useAnalyticsData } from '../../../hooks/useAnalyticsData';
import { AnalyticsBarChart, AnalyticsDonutChart, AnalyticsLineChart } from '../../../components/charts/AnalyticsCharts';

import { useRealtimeDashboard } from '../../../hooks/useRealtimeDashboard';
import { useRealtimeAttendance } from '../../../hooks/useRealtimeAttendance';
import { workforceApi, Task } from '../../../api/endpoints/workforce.api';
import { UserCheck, Users, Briefcase, FileText, Plus, Clock, HeartHandshake, Star, AlertTriangle, DollarSign, Filter, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

export const HrDashboardOverview: React.FC<{ getGreeting: () => string; firstName: string }> = ({ getGreeting, firstName }) => (
  <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-sm">
    <div className="flex items-center gap-4">
      <div className="w-11 h-11 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50 flex items-center justify-center shrink-0">
        <UserCheck size={22} />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">{getGreeting()}, {firstName}</h1>
          <span className="badge badge-hr">HR Operations</span>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Workforce lifecycle, candidate recruitment, payroll analysis & employee attendance oversight.
        </p>
      </div>
    </div>
    <div className="flex items-center gap-2 shrink-0">
      <Link to="/hr/employees" className="btn btn-primary btn-sm flex items-center gap-1.5 shadow-sm">
        <Plus size={14} /> Add Employee
      </Link>
      <Link to="/hr/recruitment" className="btn btn-secondary btn-sm flex items-center gap-1.5">
        <Briefcase size={14} /> Recruitment Desk
      </Link>
    </div>
  </div>
);

export const HrDashboardFilters: React.FC<{
  dateFilter: string;
  setDateFilter: (val: string) => void;
  locationFilter: string;
  setLocationFilter: (val: string) => void;
  deptFilter: string;
  setDeptFilter: (val: string) => void;
  teamFilter: string;
  setTeamFilter: (val: string) => void;
  empTypeFilter: string;
  setEmpTypeFilter: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
}> = (props) => (
  <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-xs font-medium uppercase tracking-wider">
      <Filter size={14} className="text-emerald-500" /> HR Operational Filters
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
      <div>
        <label className="text-xs text-slate-500 dark:text-slate-400 font-medium block mb-1">Date</label>
        <input
          type="date"
          value={props.dateFilter}
          onChange={(e) => props.setDateFilter(e.target.value)}
          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs rounded-md px-3 py-2 focus:outline-none focus:border-emerald-500 font-normal"
        />
      </div>
      <div>
        <label className="text-xs text-slate-500 dark:text-slate-400 font-medium block mb-1">Location</label>
        <select
          value={props.locationFilter}
          onChange={(e) => props.setLocationFilter(e.target.value)}
          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs rounded-md px-3 py-2 focus:outline-none focus:border-emerald-500 font-normal cursor-pointer"
        >
          <option value="All">All Locations</option>
          <option value="Bangalore">Bangalore</option>
          <option value="Hyderabad">Hyderabad</option>
          <option value="Remote">Remote</option>
        </select>
      </div>
      <div>
        <label className="text-xs text-slate-500 dark:text-slate-400 font-medium block mb-1">Department</label>
        <select
          value={props.deptFilter}
          onChange={(e) => props.setDeptFilter(e.target.value)}
          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs rounded-md px-3 py-2 focus:outline-none focus:border-emerald-500 font-normal cursor-pointer"
        >
          <option value="All">All Departments</option>
          <option value="Engineering">Engineering</option>
          <option value="HR">HR</option>
          <option value="Sales">Sales</option>
        </select>
      </div>
      <div>
        <label className="text-xs text-slate-500 dark:text-slate-400 font-medium block mb-1">Team</label>
        <select
          value={props.teamFilter}
          onChange={(e) => props.setTeamFilter(e.target.value)}
          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs rounded-md px-3 py-2 focus:outline-none focus:border-emerald-500 font-normal cursor-pointer"
        >
          <option value="All">All Teams</option>
          <option value="Frontend">Frontend</option>
          <option value="Backend">Backend</option>
        </select>
      </div>
      <div>
        <label className="text-xs text-slate-500 dark:text-slate-400 font-medium block mb-1">Emp Type</label>
        <select
          value={props.empTypeFilter}
          onChange={(e) => props.setEmpTypeFilter(e.target.value)}
          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs rounded-md px-3 py-2 focus:outline-none focus:border-emerald-500 font-normal cursor-pointer"
        >
          <option value="All">All Types</option>
          <option value="Full-time">Full-time</option>
          <option value="Contract">Contract</option>
        </select>
      </div>
      <div>
        <label className="text-xs text-slate-500 dark:text-slate-400 font-medium block mb-1">Status</label>
        <select
          value={props.statusFilter}
          onChange={(e) => props.setStatusFilter(e.target.value)}
          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs rounded-md px-3 py-2 focus:outline-none focus:border-emerald-500 font-normal cursor-pointer"
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="On Leave">On Leave</option>
        </select>
      </div>
    </div>
  </div>
);

export const HrSprintOverview: React.FC<{ hrTasks: Task[] }> = ({ hrTasks }) => (
  <div className="p-5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-4">
    <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
      <h3 className="text-base font-semibold text-[var(--text-primary)] flex items-center gap-2">
        <Layers size={17} className="text-emerald-500" /> HR Active Sprint Work
      </h3>
      <span className="badge badge-primary text-xs font-medium">HR OPERATIONS SPRINT</span>
    </div>
    <div className="overflow-x-auto rounded-md border border-[var(--border-color)] bg-[var(--bg-tertiary)]/20">
      <table className="w-full text-left text-xs min-w-[800px]">
        <thead className="bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-b border-[var(--border-color)] font-semibold text-xs">
          <tr>
            <th className="py-2.5 px-4">Task</th>
            <th className="py-2.5 px-4">Assignee</th>
            <th className="py-2.5 px-4">Priority</th>
            <th className="py-2.5 px-4">Status</th>
            <th className="py-2.5 px-4">Due Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border-color)]/80 text-xs">
          {hrTasks.map((task) => (
            <tr key={task.id} className="hover:bg-[var(--bg-hover)] transition-colors">
              <td className="py-2.5 px-4 text-[var(--text-primary)] font-medium max-w-[250px] truncate">{task.title}</td>
              <td className="py-2.5 px-4 text-[var(--text-muted)]">{task.assigneeName || 'Unassigned'}</td>
              <td className="py-2.5 px-4">
                <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                  task.priority === 'CRITICAL' || task.priority === 'HIGH' ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
                }`}>
                  {task.priority}
                </span>
              </td>
              <td className="py-2.5 px-4 text-[var(--text-primary)] font-medium uppercase text-[11px]">{task.status}</td>
              <td className="py-2.5 px-4 font-mono text-[var(--text-muted)]">2026-09-15</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export const HrDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { data: analytics, isLoading, error, reload } = useAnalyticsData();
  const [drillDownData, setDrillDownData] = useState<DrillDownData | null>(null);
  const [hrTasks, setHrTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  // Filters
  const [dateFilter, setDateFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');
  const [teamFilter, setTeamFilter] = useState('All');
  const [empTypeFilter, setEmpTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    workforceApi.getTasks()
      .then(tasks => setHrTasks(tasks.slice(0, 5)))
      .catch(() => setHrTasks([]))
      .finally(() => setLoadingTasks(false));
  }, []);

  const openDrillDown = (title: string, value: string | number, subtitle: string, details: { label: string; value: string | number }[]) => {
    setDrillDownData({
      title,
      metricValue: value,
      subtitle,
      category: 'HR Operations Lifecycle',
      details,
    });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const firstName = user?.name ? user.name.split(' ')[0] : 'HR';

  const rawCount = analytics?.metrics?.totalWorkforce ?? 254;
  const headCount = typeof rawCount === 'number' ? rawCount : Number(rawCount) || 254;
  const attendanceRate = analytics?.metrics?.attendanceRate ?? '96.5%';

  // Real-time synchronization for HR Dashboard
  useRealtimeDashboard(() => reload());
  useRealtimeAttendance(() => reload());

  return (
    <RoleGuard allowedRoles={[Role.ADMIN, Role.HR]} requiredPermission={Permission.EMPLOYEE_READ}>
      <div className="space-y-6 animate-fadeIn font-sans pb-10">
        <HrDashboardOverview getGreeting={getGreeting} firstName={firstName} />



        <HrDashboardFilters
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          locationFilter={locationFilter}
          setLocationFilter={setLocationFilter}
          deptFilter={deptFilter}
          setDeptFilter={setDeptFilter}
          teamFilter={teamFilter}
          setTeamFilter={setTeamFilter}
          empTypeFilter={empTypeFilter}
          setEmpTypeFilter={setEmpTypeFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />

        {/* KPI metrics - Grid controlled by the Page */}
        <div className="dashboard-kpi-grid">
          <KPICard
            title="Total Headcount"
            value={isLoading ? '…' : `${headCount} Staff`}
            change={8.4}
            trend="up"
            subtitle="Global workforce"
            icon={<Users size={20} />}
            accentColor="purple"
            isLive={true}
            onClick={() => openDrillDown('Total Headcount Breakdown', `${headCount} Staff`, 'Full workforce employment contracts', [
              { label: 'Authorized Workforce', value: headCount },
              { label: 'Primary Contracts', value: Math.max(0, headCount - 12) },
              { label: 'External Associates', value: Math.min(12, headCount) },
            ])}
          />
          <KPICard title="Active Employees" value={`${Math.round(headCount * 0.95)} Active`} change={4.2} trend="up" subtitle="Currently online/on-duty" icon={<UserCheck size={20} />} accentColor="blue" isLive={true} />
          <KPICard title="New Joiners" value="12 Joiners" change={1.2} trend="up" subtitle="This Calendar Month" icon={<Plus size={20} />} accentColor="emerald" />
          <KPICard title="Exits" value="2 Exits" change={-2.4} trend="down" subtitle="This Quarter" icon={<FileText size={20} />} accentColor="amber" />
          <KPICard title="On Leave" value="8 Staff" change={0} trend="neutral" subtitle="Approved PTO today" icon={<HeartHandshake size={20} />} accentColor="rose" isLive={true} />
          <KPICard title="Attendance Rate" value={attendanceRate} change={1.5} trend="up" subtitle="Weekly shift compliance" icon={<Clock size={20} />} accentColor="cyan" isLive={true} />
          <KPICard title="Pending Onboarding" value="5 Pending" change={0.4} trend="up" subtitle="Awaiting start date" icon={<Star size={20} />} accentColor="blue" />
          <KPICard title="Pending Documents" value="3 Audits" change={-0.8} trend="down" subtitle="Contract reviews" icon={<AlertTriangle size={20} />} accentColor="rose" />
        </div>

        {/* Primary Analytics Grid */}
        <div className="dashboard-chart-grid">
          <AnalyticsLineChart title="Employee Growth & Hiring" subtitle="Headcount and new hires by join month" data={analytics?.growthData} xKey="name" series={[{ key: 'headcount', name: 'Headcount', color: '#8b5cf6' }, { key: 'hiring', name: 'New hires', color: '#ec4899' }]} isLoading={isLoading} error={error} onRetry={reload} />
          <AnalyticsBarChart title="Attendance Compliance Trend" subtitle="Daily shift present/absent stats" data={analytics?.attendanceOverview} xKey="name" series={[{ key: 'present', name: 'Present', color: '#10b981' }, { key: 'absent', name: 'Absent', color: '#ef4444' }]} isLoading={isLoading} error={error} onRetry={reload} />
        </div>

        {/* Secondary Analytics Grid */}
        <div className="dashboard-chart-grid !mt-4">
          <AnalyticsDonutChart title="Employment Status Mix" subtitle="Active vs On Leave overview" data={analytics?.employmentStatus} isLoading={isLoading} error={error} onRetry={reload} />
          <AnalyticsDonutChart title="Department Breakdown" subtitle="Current staff allocation across departments" data={analytics?.departmentDistribution} isLoading={isLoading} error={error} onRetry={reload} />
          <AnalyticsBarChart title="Skills Coverage Analysis" subtitle="Highest frequency active skills in scope" data={analytics?.skillsAnalysis?.topSkills} xKey="name" series={[{ key: 'coverage', name: 'Coverage %', color: '#06b6d4' }]} layout="vertical" isLoading={isLoading} error={error} onRetry={reload} />
          <AnalyticsDonutChart title="Retention Risk Distribution" subtitle="Workforce stabilization assessment" data={analytics?.riskDistribution} isLoading={isLoading} error={error} onRetry={reload} colors={['#ef4444', '#f59e0b', '#10b981']} />
        </div>

        <EmployeeTable
          locationFilter={locationFilter}
          deptFilter={deptFilter}
          teamFilter={teamFilter}
          statusFilter={statusFilter}
        />
        <HrSprintOverview hrTasks={hrTasks} />
        <DrillDownModal isOpen={drillDownData !== null} onClose={() => setDrillDownData(null)} data={drillDownData} />
      </div>
    </RoleGuard>
  );
};

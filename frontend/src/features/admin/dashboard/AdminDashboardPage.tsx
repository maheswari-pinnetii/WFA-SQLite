import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../auth/hooks/useAuth';
import { RoleGuard } from '../../../security/guards/RoleGuard';
import { Role } from '../../../security/roles/roles';
import { Permission } from '../../../security/permissions/permissions';
import { DrillDownModal, DrillDownData } from '../../../shared/components/DrillDownModal';
import { MinimalKpiCard } from '../../../components/cards/MinimalKpiCard';
import { useAnalyticsData } from '../../../hooks/useAnalyticsData';
import { AnalyticsBarChart, AnalyticsDonutChart, AnalyticsLineChart } from '../../../components/charts/AnalyticsCharts';
import { employeeApi } from '../../../api/endpoints/employee.api';
import { workforceApi, Task } from '../../../api/endpoints/workforce.api';
import { Employee } from '../../../shared/types/common.types';
import { EmployeeTable } from '../../../components/tables/EmployeeTable';
import {
  Users,
  UserPlus,
  Clock,
  FileSpreadsheet,
  Award,
  Calendar,
  CheckCircle2,
  TrendingDown,
  Briefcase,
  ShieldCheck,
  Layers,
  Filter,
  DollarSign
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminDashboardOverview: React.FC<{
  currentDateFormatted: string;
  getGreeting: () => string;
  firstName: string;
  user: any;
}> = ({ currentDateFormatted, getGreeting, firstName, user }) => (
  <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-sm">
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
        <Calendar size={13} className="text-slate-400" />
        <span>{currentDateFormatted}</span>
        <span>•</span>
        <span className="text-emerald-600 dark:text-emerald-400 font-medium">System Administrator</span>
      </div>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
        {getGreeting()}, {firstName}
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Workforce analytics, live attendance governance, and enterprise shift oversight.
      </p>
    </div>
    <div className="flex flex-wrap items-center gap-2.5 shrink-0">
      <Link to="/admin/employees" className="btn btn-primary btn-sm flex items-center gap-2">
        <UserPlus size={15} /> Add Employee
      </Link>
      <Link to="/admin/attendance-overview" className="btn btn-secondary btn-sm flex items-center gap-2">
        <Clock size={15} /> View Attendance
      </Link>
      <Link to="/admin/reports" className="btn btn-secondary btn-sm flex items-center gap-2">
        <FileSpreadsheet size={15} /> Generate Report
      </Link>
    </div>
  </div>
);

export const AdminDashboardFilters: React.FC<{
  dateFilter: string;
  setDateFilter: (val: string) => void;
  locationFilter: string;
  setLocationFilter: (val: string) => void;
  deptFilter: string;
  setDeptFilter: (val: string) => void;
  teamFilter: string;
  setTeamFilter: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
}> = (props) => (
  <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-xs font-medium uppercase tracking-wider">
      <Filter size={14} className="text-emerald-500" /> Executive Analytics Scopes
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
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
          <option value="Bengaluru">Bengaluru</option>
          <option value="Hyderabad">Hyderabad</option>
          <option value="Salem">Salem</option>
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
          <option value="HR">Human Resources</option>
          <option value="Finance">Finance</option>
          <option value="Sales">Sales & Marketing</option>
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
          <option value="Frontend">Frontend Devs</option>
          <option value="Backend">Backend Services</option>
          <option value="QA">Quality Assurance</option>
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
          <option value="Terminated">Terminated</option>
        </select>
      </div>
    </div>
  </div>
);

const calculateTenure = (joinDateStr?: string) => {
  if (!joinDateStr) return 'N/A';
  const joinDate = new Date(joinDateStr);
  const now = new Date();
  if (isNaN(joinDate.getTime()) || joinDate > now) return '0 days';
  
  let years = now.getFullYear() - joinDate.getFullYear();
  let months = now.getMonth() - joinDate.getMonth();
  let days = now.getDate() - joinDate.getDate();
  
  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  
  const parts = [];
  if (years > 0) parts.push(`${years} year${years > 1 ? 's' : ''}`);
  if (months > 0) parts.push(`${months} month${months > 1 ? 's' : ''}`);
  if (days > 0 || parts.length === 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);
  
  return parts.slice(0, 2).join(' ');
};

const formatJoinDate = (dateStr?: string) => {
  if (!dateStr) return 'N/A';
  const dateObj = new Date(dateStr);
  if (isNaN(dateObj.getTime())) return dateStr;
  
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = dateObj.toLocaleString('en-US', { month: 'short' });
  const year = dateObj.getFullYear();
  
  return `${day} ${month} ${year}`;
};

export const AdminSprintOverview: React.FC<{ tasks: Task[] }> = ({ tasks }) => (
  <div className="p-5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-4">
    <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
      <h3 className="text-base font-semibold text-[var(--text-primary)] flex items-center gap-2">
        <Layers size={17} className="text-emerald-500" /> Active Sprint Work
      </h3>
      <span className="badge badge-success text-xs font-medium">ORGANIZATION SPRINT</span>
    </div>
    <div className="overflow-x-auto rounded-md border border-[var(--border-color)] bg-[var(--bg-tertiary)]/20">
      <table className="w-full text-left text-xs min-w-[800px]">
        <thead className="bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-b border-[var(--border-color)] font-semibold text-xs">
          <tr>
            <th className="py-2.5 px-4">Sprint</th>
            <th className="py-2.5 px-4">Task</th>
            <th className="py-2.5 px-4">Assignee</th>
            <th className="py-2.5 px-4">Priority</th>
            <th className="py-2.5 px-4">Status</th>
            <th className="py-2.5 px-4">Progress</th>
            <th className="py-2.5 px-4">Due Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border-color)]/80 text-xs">
          {tasks.slice(0, 8).map((task) => (
            <tr key={task.id} className="hover:bg-[var(--bg-hover)] transition-colors">
              <td className="py-2.5 px-4 font-medium text-[var(--text-secondary)]">Sprint 24B</td>
              <td className="py-2.5 px-4 text-[var(--text-primary)] font-medium max-w-[200px] truncate">{task.title}</td>
              <td className="py-2.5 px-4 text-[var(--text-muted)]">{task.assigneeName || 'Unassigned'}</td>
              <td className="py-2.5 px-4">
                <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                  task.priority === 'CRITICAL' || task.priority === 'HIGH' ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
                }`}>
                  {task.priority}
                </span>
              </td>
              <td className="py-2.5 px-4">
                <span className="text-[var(--text-primary)] font-medium uppercase text-[11px]">{task.status}</span>
              </td>
              <td className="py-2.5 px-4">
                <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-1.5 max-w-[100px]">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: task.status === 'COMPLETED' ? '100%' : task.status === 'IN_PROGRESS' ? '50%' : '0%' }}></div>
                </div>
              </td>
              <td className="py-2.5 px-4 font-mono text-[var(--text-muted)]">2026-09-10</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const analytics = useAnalyticsData();
  const [drillDownData, setDrillDownData] = useState<DrillDownData | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [dateFilter, setDateFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');
  const [teamFilter, setTeamFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [empData, taskData] = await Promise.all([
          employeeApi.getEmployees().catch(() => []),
          workforceApi.getTasks().catch(() => [])
        ]);
        setEmployees(Array.isArray(empData) ? empData : empData.employees || []);
        setTasks(taskData);
      } catch (err) {
        console.error('Error fetching admin dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const openDrillDown = (title: string, value: string | number, subtitle: string, details: { label: string; value: string | number }[]) => {
    const records = employees.map(emp => ({
      id: emp.employeeCode || emp.id,
      name: emp.name,
      role: emp.role,
      department: emp.department || 'N/A',
      metric: `${emp.performanceScore || 0}% Score`,
      status: emp.status
    }));
    
    setDrillDownData({
      title,
      metricValue: value,
      subtitle,
      category: 'Stackly Enterprise Analytics',
      details,
      records
    });
  };

  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const firstName = user?.name ? user.name.split(' ')[0] : 'Admin';

  return (
    <RoleGuard allowedRoles={[Role.ADMIN]} requiredPermission={Permission.SYSTEM_CONFIG}>
      <div className="admin-dashboard space-y-6 animate-fadeIn font-sans pb-10">
        <AdminDashboardOverview
          currentDateFormatted={currentDateFormatted}
          getGreeting={getGreeting}
          firstName={firstName}
          user={user}
        />

        <AdminDashboardFilters
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          locationFilter={locationFilter}
          setLocationFilter={setLocationFilter}
          deptFilter={deptFilter}
          setDeptFilter={setDeptFilter}
          teamFilter={teamFilter}
          setTeamFilter={setTeamFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />

        {/* KPI metrics - Grid controlled by the Page */}
        <div className="dashboard-kpi-grid">
          <MinimalKpiCard
            title="Total Headcount"
            value={employees.length || "500"}
            icon={<Users size={26} />}
            iconBgColor="emerald"
            isLive={true}
            trend="+12.4% than last month"
            trendType="positive"
            onClick={() => openDrillDown('Total Employee Headcount', employees.length || 500, 'Global workforce roster', [
              { label: 'Full-time Permanent', value: Math.round((employees.length || 500) * 0.85) },
              { label: 'Contractors', value: Math.round((employees.length || 500) * 0.15) },
            ])}
          />
          <MinimalKpiCard
            title="Active Duty Rate"
            value={analytics.data?.metrics?.activePresent || Math.round((employees.length || 500) * 0.96)}
            icon={<ShieldCheck size={26} />}
            iconBgColor="blue"
            isLive={true}
            trend="+96.8% active shift"
            trendType="positive"
          />
          <MinimalKpiCard
            title="Attendance Rate"
            value={analytics.data?.metrics?.attendanceRate || "96.5%"}
            icon={<Clock size={26} />}
            iconBgColor="amber"
            isLive={true}
            trend="+1.5% compliance"
            trendType="positive"
          />
          <MinimalKpiCard title="Annual Attrition" value="4.2%" icon={<TrendingDown size={26} />} iconBgColor="rose" trend="-0.8% than last year" trendType="positive" />
          <MinimalKpiCard title="Monthly Payroll" value="$4.8M" icon={<DollarSign size={26} />} iconBgColor="purple" trend="+4.35% budget allocation" trendType="positive" />
          <MinimalKpiCard
            title="Productivity Score"
            value={analytics.data?.metrics?.productivityScore || "94.8%"}
            icon={<Award size={26} />}
            iconBgColor="cyan"
            isLive={true}
            trend="+3.2% performance"
            trendType="positive"
          />
          <MinimalKpiCard title="Open Vacancies" value="124" icon={<Briefcase size={26} />} iconBgColor="indigo" trend="+8.4% open requisitions" trendType="positive" />
          <MinimalKpiCard title="Audit Compliance" value="99.8%" icon={<Layers size={26} />} iconBgColor="teal" trend="100% Zero-Trust Pass" trendType="positive" />
        </div>

        {/* Primary Analytics Grid */}
        <div className="dashboard-chart-grid">
          <AnalyticsLineChart title="Employee Growth & Hiring" subtitle="Headcount and new hires by join month" data={analytics.data?.growthData} xKey="name" series={[{ key: 'headcount', name: 'Headcount', color: '#3b82f6' }, { key: 'hiring', name: 'New hires', color: '#06b6d4' }]} isLoading={analytics.isLoading} error={analytics.error} onRetry={analytics.reload} />
          <AnalyticsBarChart title="Attendance Overview" subtitle="Present, absent and late attendance by weekday" data={analytics.data?.attendanceOverview} xKey="name" series={[{ key: 'present', name: 'Present', color: '#10b981' }, { key: 'absent', name: 'Absent', color: '#ef4444' }, { key: 'late', name: 'Late', color: '#f59e0b' }]} isLoading={analytics.isLoading} error={analytics.error} onRetry={analytics.reload} />
          <AnalyticsBarChart title="Department Comparison" subtitle="Headcount and attendance performance by department" data={analytics.data?.departmentComparison} xKey="name" series={[{ key: 'headcount', name: 'Headcount', color: '#6366f1' }, { key: 'attendance', name: 'Attendance %', color: '#10b981' }]} layout="vertical" isLoading={analytics.isLoading} error={analytics.error} onRetry={analytics.reload} />
          <AnalyticsDonutChart title="Department Distribution" subtitle="Current workforce allocation" data={analytics.data?.departmentDistribution} isLoading={analytics.isLoading} error={analytics.error} onRetry={analytics.reload} />
        </div>

        {/* Secondary Analytics Grid */}
        <div className="dashboard-chart-grid !mt-4">
          <AnalyticsDonutChart title="Role Distribution" subtitle="Role mix in the authorized scope" data={analytics.data?.roleDistribution} isLoading={analytics.isLoading} error={analytics.error} onRetry={analytics.reload} />
          <AnalyticsDonutChart title="Employment Status" subtitle="Active, remote, leave and offline workforce" data={analytics.data?.employmentStatus} isLoading={analytics.isLoading} error={analytics.error} onRetry={analytics.reload} />
          <AnalyticsDonutChart title="Workforce Mode" subtitle="Office, remote and client attendance modes" data={analytics.data?.workforceDistribution} isLoading={analytics.isLoading} error={analytics.error} onRetry={analytics.reload} />
          <AnalyticsDonutChart title="Retention Risk" subtitle="Performance and attendance risk distribution" data={analytics.data?.riskDistribution} isLoading={analytics.isLoading} error={analytics.error} onRetry={analytics.reload} colors={['#ef4444', '#f59e0b', '#10b981']} />
        </div>

        <EmployeeTable
          locationFilter={locationFilter}
          deptFilter={deptFilter}
          teamFilter={teamFilter}
          statusFilter={statusFilter}
        />
        <AdminSprintOverview tasks={tasks} />
        <DrillDownModal isOpen={!!drillDownData} data={drillDownData} onClose={() => setDrillDownData(null)} />
      </div>
    </RoleGuard>
  );
};

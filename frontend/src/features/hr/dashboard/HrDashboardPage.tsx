import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../auth/hooks/useAuth';
import { DashboardErrorBoundary } from '../../../shared/components/DashboardErrorBoundary';
import { RoleGuard } from '../../../security/guards/RoleGuard';
import { Role } from '../../../security/roles/roles';
import { Permission } from '../../../security/permissions/permissions';
import { DrillDownModal, DrillDownData } from '../../../shared/components/DrillDownModal';
import { EmployeeTable } from '../../../components/tables/EmployeeTable';
import { useAnalyticsData } from '../../../hooks/useAnalyticsData';
import { AnalyticsBarChart, AnalyticsDonutChart, AnalyticsLineChart } from '../../../components/charts/AnalyticsCharts';
import { DashboardShell, DashboardHeader, DashboardToolbar, KPIGrid, KPICard, TableCard } from '../../../shared/components/dashboard';

import { useRealtimeDashboard } from '../../../hooks/useRealtimeDashboard';
import { useRealtimeAttendance } from '../../../hooks/useRealtimeAttendance';
import { workforceApi, Task } from '../../../api/endpoints/workforce.api';
import { UserCheck, Users, UserPlus, UserMinus, FileText, CalendarClock, CalendarOff, CheckCircle2, AlertTriangle, DollarSign, Filter, Layers, Plus, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';

export const HrSprintOverview: React.FC<{ hrTasks: Task[] }> = ({ hrTasks }) => (
  <TableCard title="HR Active Sprint Work" subtitle="HR OPERATIONS SPRINT">
    <table className="w-full text-left text-xs min-w-[800px]">
      <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-semibold text-xs">
        <tr>
          <th className="py-3 px-4">Task</th>
          <th className="py-3 px-4">Assignee</th>
          <th className="py-3 px-4">Priority</th>
          <th className="py-3 px-4">Status</th>
          <th className="py-3 px-4">Due Date</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
        {hrTasks.map((task) => (
          <tr key={task.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
            <td className="py-3 px-4 text-slate-900 dark:text-white font-medium max-w-[250px] truncate">{task.title}</td>
            <td className="py-3 px-4 text-slate-500">{task.assigneeName || 'Unassigned'}</td>
            <td className="py-3 px-4">
              <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                task.priority === 'CRITICAL' || task.priority === 'HIGH' ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-slate-100 text-slate-600'
              }`}>
                {task.priority}
              </span>
            </td>
            <td className="py-3 px-4 text-slate-900 dark:text-white font-medium uppercase text-[11px]">{task.status}</td>
            <td className="py-3 px-4 font-mono text-slate-500">2026-09-15</td>
          </tr>
        ))}
      </tbody>
    </table>
  </TableCard>
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

  const rawCount = analytics?.metrics?.totalWorkforce ?? 0;
  const headCount = typeof rawCount === 'number' ? rawCount : Number(rawCount) || 0;
  const attendanceRate = analytics?.metrics?.attendanceRate ?? 'N/A';

  // Real-time synchronization for HR Dashboard
  useRealtimeDashboard(() => reload());
  useRealtimeAttendance(() => reload());

  return (
    <DashboardErrorBoundary dashboardName="HR Dashboard">
      <RoleGuard allowedRoles={[Role.ADMIN, Role.HR]} requiredPermission={Permission.EMPLOYEE_READ}>
        <DashboardHeader
            breadcrumbs={[
              { label: 'Home', href: '/' },
              { label: 'HR', href: '/hr/dashboard' },
              { label: 'Dashboard' }
            ]}
            title="HR Dashboard"
            badge={<span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">HR Operations</span>}
            description="Workforce lifecycle, candidate recruitment, payroll analysis & employee attendance oversight."
            lastUpdated={new Date().toLocaleTimeString()}
            onRefresh={reload}
            isRefreshing={isLoading}
            primaryAction={
              <Link to="/hr/employees" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm">
                <Plus size={16} /> Add Employee
              </Link>
            }
            secondaryAction={
              <Link to="/hr/recruitment" className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2">
                <Briefcase size={16} /> Recruitment Desk
              </Link>
            }
          />

          <DashboardToolbar
            dateFilter={dateFilter}
            onDateFilterChange={setDateFilter}
            locationFilter={locationFilter}
            onLocationFilterChange={setLocationFilter}
            locationOptions={[
              { value: 'Bangalore', label: 'Bangalore' },
              { value: 'Hyderabad', label: 'Hyderabad' },
              { value: 'Remote', label: 'Remote' }
            ]}
            departmentFilter={deptFilter}
            onDepartmentFilterChange={setDeptFilter}
            departmentOptions={[
              { value: 'Engineering', label: 'Engineering' },
              { value: 'HR', label: 'HR' },
              { value: 'Sales', label: 'Sales' }
            ]}
            teamFilter={teamFilter}
            onTeamFilterChange={setTeamFilter}
            teamOptions={[
              { value: 'Frontend', label: 'Frontend' },
              { value: 'Backend', label: 'Backend' }
            ]}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            statusOptions={[
              { value: 'Active', label: 'Active' },
              { value: 'On Leave', label: 'On Leave' }
            ]}
          />

          {/* KPI metrics (8 KPIs) */}
          <KPIGrid>
            <KPICard title="Total Employees" value={analytics?.metrics?.totalWorkforce ?? 0} icon={<Users size={20} />} color="emerald" trend="up" trendValue="12.4%" subtitle="Active workforce" />
            <KPICard title="Active Employees" value={analytics?.metrics?.activeEmployees ?? 0} icon={<UserCheck size={20} />} color="info" trend="up" trendValue="2.1%" subtitle="Currently active" />
            <KPICard title="New Joiners" value={analytics?.metrics?.newJoiners ?? 0} icon={<UserPlus size={20} />} color="emerald" trend="up" trendValue="1.2%" subtitle="This month" />
            <KPICard title="Exits" value={analytics?.metrics?.exits ?? 0} icon={<UserMinus size={20} />} color="warning" trend="down" trendValue="0.5%" subtitle="This month" />
            
            <KPICard title="Present Today" value={analytics?.metrics?.presentToday ?? 0} icon={<CheckCircle2 size={20} />} color="success" subtitle="Checked in today" />
            <KPICard title="Attendance Rate" value={analytics?.metrics?.attendanceRate ?? '0%'} icon={<CalendarClock size={20} />} color="emerald" trend="up" trendValue="1.5%" subtitle="Weekly average" />
            <KPICard title="On Leave" value={analytics?.metrics?.onLeave ?? 0} icon={<CalendarOff size={20} />} color="warning" subtitle="Approved leave" />
            <KPICard title="Pending HR Actions" value={analytics?.metrics?.pendingHrActions ?? 0} icon={<AlertTriangle size={20} />} color="danger" subtitle="Requires attention" />
          </KPIGrid>

          {/* Primary Analytics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 min-w-0">
            <AnalyticsLineChart title="Workforce Trend" subtitle="Headcount growth over time" data={analytics?.growthData} xKey="name" series={[{ key: 'headcount', name: 'Employees', color: '#10b981' }, { key: 'hiring', name: 'New Hires', color: '#3b82f6' }]} isLoading={isLoading} error={error} onRetry={reload} />
            <AnalyticsLineChart title="Attendance Trend" subtitle="Daily attendance overview" data={analytics?.attendanceOverview} xKey="name" series={[{ key: 'present', name: 'Present', color: '#10b981' }, { key: 'absent', name: 'Absent', color: '#ef4444' }]} isLoading={isLoading} error={error} onRetry={reload} />
          </div>

          {/* Secondary Analytics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 min-w-0">
            <AnalyticsBarChart title="Leave Trend" subtitle="Leave usage by type" data={analytics?.leaveTrend} xKey="name" series={[{ key: 'sick', name: 'Sick', color: '#ef4444' }, { key: 'vacation', name: 'Vacation', color: '#3b82f6' }, { key: 'other', name: 'Other', color: '#f59e0b' }]} isLoading={isLoading} error={error} onRetry={reload} />
            <AnalyticsBarChart title="Department Workforce" subtitle="Workforce by department" layout="horizontal" data={analytics?.departmentComparison} xKey="name" series={[{ key: 'headcount', name: 'Employees', color: '#8b5cf6' }]} isLoading={isLoading} error={error} onRetry={reload} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 min-w-0">
            <AnalyticsDonutChart title="Employee Status" subtitle="Active, remote, leave and offline workforce" data={analytics?.employmentStatus} isLoading={isLoading} error={error} onRetry={reload} />
            <AnalyticsBarChart title="Joiners vs Exits" subtitle="Quarterly comparison" data={analytics?.joinersExits} xKey="name" series={[{ key: 'joiners', name: 'Joiners', color: '#10b981' }, { key: 'exits', name: 'Exits', color: '#ef4444' }]} isLoading={isLoading} error={error} onRetry={reload} />
          </div>

          <EmployeeTable
            locationFilter={locationFilter}
            deptFilter={deptFilter}
            teamFilter={teamFilter}
            statusFilter={statusFilter}
          />
          <HrSprintOverview hrTasks={hrTasks} />
        <DrillDownModal isOpen={drillDownData !== null} onClose={() => setDrillDownData(null)} data={drillDownData} />
      </RoleGuard>
    </DashboardErrorBoundary>
  );
};

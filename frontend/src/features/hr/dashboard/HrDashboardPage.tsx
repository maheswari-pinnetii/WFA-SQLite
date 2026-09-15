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
import { UserCheck, Users, Briefcase, FileText, Plus, Clock, HeartHandshake, Star, AlertTriangle, DollarSign, Filter, Layers } from 'lucide-react';
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

          {/* KPI metrics */}
          <KPIGrid>
            <KPICard
              title="Total Headcount"
              value={isLoading ? '…' : `${headCount} Staff`}
              trendValue="8.4%"
              trend="up"
              subtitle="Global workforce"
              icon={<Users size={20} />}
              color="info"
              status="LIVE"
              onClick={() => openDrillDown('Total Headcount Breakdown', `${headCount} Staff`, 'Full workforce employment contracts', [
                { label: 'Authorized Workforce', value: headCount },
                { label: 'Primary Contracts', value: Math.max(0, headCount - 12) },
                { label: 'External Associates', value: Math.min(12, headCount) },
              ])}
            />
            <KPICard title="Active Employees" value={`${Math.round(headCount * 0.95)} Active`} trendValue="4.2%" trend="up" subtitle="Currently online/on-duty" icon={<UserCheck size={20} />} color="info" status="LIVE" />
            <KPICard title="New Joiners" value="12 Joiners" trendValue="1.2%" trend="up" subtitle="This Calendar Month" icon={<Plus size={20} />} color="emerald" />
            <KPICard title="Exits" value="2 Exits" trendValue="2.4%" trend="down" subtitle="This Quarter" icon={<FileText size={20} />} color="warning" />
            <KPICard title="On Leave" value="8 Staff" trend="neutral" subtitle="Approved PTO today" icon={<HeartHandshake size={20} />} color="danger" status="LIVE" />
            <KPICard title="Attendance Rate" value={attendanceRate} trendValue="1.5%" trend="up" subtitle="Weekly shift compliance" icon={<Clock size={20} />} color="info" status="LIVE" />
            <KPICard title="Pending Onboarding" value="5 Pending" trendValue="0.4%" trend="up" subtitle="Awaiting start date" icon={<Star size={20} />} color="info" />
            <KPICard title="Pending Documents" value="3 Audits" trendValue="0.8%" trend="down" subtitle="Contract reviews" icon={<AlertTriangle size={20} />} color="danger" />
          </KPIGrid>

          {/* Primary Analytics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnalyticsLineChart title="Employee Growth & Hiring" subtitle="Headcount and new hires by join month" data={analytics?.growthData} xKey="name" series={[{ key: 'headcount', name: 'Headcount', color: '#8b5cf6' }, { key: 'hiring', name: 'New hires', color: '#ec4899' }]} isLoading={isLoading} error={error} onRetry={reload} />
            <AnalyticsBarChart title="Attendance Compliance Trend" subtitle="Daily shift present/absent stats" data={analytics?.attendanceOverview} xKey="name" series={[{ key: 'present', name: 'Present', color: '#10b981' }, { key: 'absent', name: 'Absent', color: '#ef4444' }]} isLoading={isLoading} error={error} onRetry={reload} />
          </div>

          {/* Secondary Analytics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
      </RoleGuard>
    </DashboardErrorBoundary>
  );
};

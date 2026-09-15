import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../auth/hooks/useAuth';
import { RoleGuard } from '../../../security/guards/RoleGuard';
import { Role } from '../../../security/roles/roles';
import { Permission } from '../../../security/permissions/permissions';
import { DrillDownModal, DrillDownData } from '../../../shared/components/DrillDownModal';
import { useAnalyticsData } from '../../../hooks/useAnalyticsData';
import { AnalyticsBarChart, AnalyticsDonutChart, AnalyticsLineChart } from '../../../components/charts/AnalyticsCharts';
import { DashboardErrorBoundary } from '../../../shared/components/DashboardErrorBoundary';
import { DashboardShell, DashboardHeader, DashboardToolbar, KPIGrid, KPICard, TableCard } from '../../../shared/components/dashboard';
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
  UserCheck,
  Building2,
  Filter,
  DollarSign,
  CalendarClock,
  CalendarOff
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Filter helpers removed in favor of DashboardToolbar inline


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
  <TableCard title="Active Sprint Work" subtitle="ORGANIZATION SPRINT">
    <table className="w-full text-left text-xs min-w-[800px]">
      <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-semibold text-xs">
        <tr>
          <th className="py-3 px-4">Sprint</th>
          <th className="py-3 px-4">Task</th>
          <th className="py-3 px-4">Assignee</th>
          <th className="py-3 px-4">Priority</th>
          <th className="py-3 px-4">Status</th>
          <th className="py-3 px-4">Progress</th>
          <th className="py-3 px-4">Due Date</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
        {tasks.slice(0, 8).map((task) => (
          <tr key={task.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
            <td className="py-3 px-4 font-medium text-slate-600 dark:text-slate-400">Sprint 24B</td>
            <td className="py-3 px-4 text-slate-900 dark:text-white font-medium max-w-[200px] truncate">{task.title}</td>
            <td className="py-3 px-4 text-slate-500">{task.assigneeName || 'Unassigned'}</td>
            <td className="py-3 px-4">
              <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                task.priority === 'CRITICAL' || task.priority === 'HIGH' ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-slate-100 text-slate-600'
              }`}>
                {task.priority}
              </span>
            </td>
            <td className="py-3 px-4">
              <span className="text-slate-900 dark:text-white font-medium uppercase text-[11px]">{task.status}</span>
            </td>
            <td className="py-3 px-4">
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 max-w-[100px]">
                <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: task.status === 'COMPLETED' ? '100%' : task.status === 'IN_PROGRESS' ? '50%' : '0%' }}></div>
              </div>
            </td>
            <td className="py-3 px-4 font-mono text-slate-500">2026-09-10</td>
          </tr>
        ))}
      </tbody>
    </table>
  </TableCard>
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
    <DashboardErrorBoundary dashboardName="Admin Dashboard">
      <RoleGuard allowedRoles={[Role.ADMIN]} requiredPermission={Permission.SYSTEM_CONFIG}>
        <DashboardHeader
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Admin', href: '/admin/dashboard' },
            { label: 'Dashboard' }
          ]}
          title="Administration Dashboard"
          badge={<span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">System Administrator</span>}
          description="Organization-wide workforce governance and operational intelligence."
          lastUpdated={new Date().toLocaleTimeString()}
          onRefresh={analytics.reload}
          isRefreshing={analytics.isLoading}
          primaryAction={
            <Link to="/admin/employees" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm">
              <UserPlus size={16} /> Add Employee
            </Link>
          }
          secondaryAction={
            <Link to="/admin/reports" className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2">
              <FileSpreadsheet size={16} /> Export
            </Link>
          }
        />

        <DashboardToolbar
          dateFilter={dateFilter}
          onDateFilterChange={setDateFilter}
          locationFilter={locationFilter}
          onLocationFilterChange={setLocationFilter}
          locationOptions={[
            { value: 'Bengaluru', label: 'Bengaluru' },
            { value: 'Hyderabad', label: 'Hyderabad' },
            { value: 'Salem', label: 'Salem' }
          ]}
          departmentFilter={deptFilter}
          onDepartmentFilterChange={setDeptFilter}
          departmentOptions={[
            { value: 'Engineering', label: 'Engineering' },
            { value: 'HR', label: 'Human Resources' },
            { value: 'Finance', label: 'Finance' },
            { value: 'Sales', label: 'Sales & Marketing' }
          ]}
          teamFilter={teamFilter}
          onTeamFilterChange={setTeamFilter}
          teamOptions={[
            { value: 'Frontend', label: 'Frontend Devs' },
            { value: 'Backend', label: 'Backend Services' },
            { value: 'QA', label: 'Quality Assurance' }
          ]}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          statusOptions={[
            { value: 'Active', label: 'Active' },
            { value: 'On Leave', label: 'On Leave' },
            { value: 'Terminated', label: 'Terminated' }
          ]}
        />

        {/* KPI metrics (8 KPIs) */}
        <KPIGrid>
          <KPICard title="Total Employees" value={analytics.data?.metrics?.totalWorkforce ?? 0} icon={<Users size={20} />} color="emerald" trend="up" trendValue="12.4%" subtitle="Active workforce" />
          <KPICard title="Active Employees" value={analytics.data?.metrics?.activeEmployees ?? 0} icon={<UserCheck size={20} />} color="info" trend="up" trendValue="2.1%" subtitle="Currently active" />
          <KPICard title="Present Today" value={analytics.data?.metrics?.presentToday ?? 0} icon={<CheckCircle2 size={20} />} color="success" subtitle="Checked in today" />
          <KPICard title="Attendance Rate" value={analytics.data?.metrics?.attendanceRate ?? '0%'} icon={<CalendarClock size={20} />} color="emerald" trend="up" trendValue="1.5%" subtitle="Weekly average" />
          
          <KPICard title="On Leave" value={analytics.data?.metrics?.onLeave ?? 0} icon={<CalendarOff size={20} />} color="warning" subtitle="Approved leave" />
          <KPICard title="Departments" value={analytics.data?.metrics?.departments ?? 0} icon={<Building2 size={20} />} color="neutral" subtitle="Active departments" />
          <KPICard title="Open Vacancies" value={analytics.data?.metrics?.openVacancies ?? 0} icon={<UserPlus size={20} />} color="info" trend="up" trendValue="8.4%" subtitle="Open requisitions" />
          <KPICard title="Annual Attrition" value={analytics.data?.metrics?.annualAttrition ?? '0%'} icon={<TrendingDown size={20} />} color="danger" trend="down" trendValue="0.8%" subtitle="vs last year" />
        </KPIGrid>

        {/* Primary Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 min-w-0">
          <AnalyticsLineChart title="Workforce Trend" subtitle="Headcount growth over time" data={analytics.data?.growthData} xKey="name" series={[{ key: 'headcount', name: 'Employees', color: '#10b981' }, { key: 'hiring', name: 'New Hires', color: '#3b82f6' }]} isLoading={analytics.isLoading} error={analytics.error} onRetry={analytics.reload} />
          <AnalyticsBarChart title="Department Headcount" subtitle="Workforce by department" layout="horizontal" data={analytics.data?.departmentComparison} xKey="name" series={[{ key: 'headcount', name: 'Employees', color: '#8b5cf6' }]} isLoading={analytics.isLoading} error={analytics.error} onRetry={analytics.reload} />
        </div>
        
        {/* Secondary Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 min-w-0">
          <AnalyticsDonutChart title="Location Distribution" subtitle="Headcount by office location" data={analytics.data?.workforceDistribution} isLoading={analytics.isLoading} error={analytics.error} onRetry={analytics.reload} />
          <AnalyticsDonutChart title="Employment Status" subtitle="Active, remote, leave and offline workforce" data={analytics.data?.employmentStatus} isLoading={analytics.isLoading} error={analytics.error} onRetry={analytics.reload} />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 min-w-0">
          <AnalyticsLineChart title="Attendance Trend" subtitle="Daily attendance overview" data={analytics.data?.attendanceOverview} xKey="name" series={[{ key: 'present', name: 'Present', color: '#10b981' }, { key: 'absent', name: 'Absent', color: '#ef4444' }]} isLoading={analytics.isLoading} error={analytics.error} onRetry={analytics.reload} />
          <AnalyticsBarChart title="Role Distribution" subtitle="Workforce allocation by role" layout="vertical" data={analytics.data?.roleDistribution} xKey="name" series={[{ key: 'value', name: 'Headcount', color: '#f59e0b' }]} isLoading={analytics.isLoading} error={analytics.error} onRetry={analytics.reload} />
        </div>

        <EmployeeTable
          locationFilter={locationFilter}
          deptFilter={deptFilter}
          teamFilter={teamFilter}
          statusFilter={statusFilter}
        />
        <AdminSprintOverview tasks={tasks} />
        <DrillDownModal isOpen={!!drillDownData} data={drillDownData} onClose={() => setDrillDownData(null)} />
      </RoleGuard>
    </DashboardErrorBoundary>
  );
};

import React, { useEffect, useState } from 'react';
import { RoleGuard } from '../../../security/guards/RoleGuard';
import { Role } from '../../../security/roles/roles';
import { Permission } from '../../../security/permissions/permissions';
import { DashboardShell, DashboardHeader, DashboardToolbar, KPIGrid, KPICard, TableCard } from '../../../shared/components/dashboard';
import { DrillDownModal, DrillDownData } from '../../../shared/components/DrillDownModal';
import { useAnalyticsData } from '../../../hooks/useAnalyticsData';
import { AnalyticsBarChart, AnalyticsDonutChart, AnalyticsLineChart } from '../../../components/charts/AnalyticsCharts';
import { DashboardErrorBoundary } from '../../../shared/components/DashboardErrorBoundary';
import { employeeApi } from '../../../api/endpoints/employee.api';
import { workforceApi, Task } from '../../../api/endpoints/workforce.api';
import { Employee } from '../../../shared/types/common.types';
import { Flame, GitPullRequest, Users, CheckCircle2, Zap, Clock, Calendar, AlertTriangle, Target, FileText, TrendingUp, Star, ArrowRight, Filter, Layers, CalendarClock, CalendarOff, ClipboardList, ListTodo } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EmployeeTable } from '../../../components/tables/EmployeeTable';

// Filters have been moved inline to DashboardToolbar

export const TeamLeadSprintBoard: React.FC<{ sprintTasks: Task[] }> = ({ sprintTasks }) => (
  <TableCard title="Team Sprint" subtitle="FRONTEND SPRINT">
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
      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
        {sprintTasks.slice(0, 6).map((task) => (
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
            <td className="py-3 px-4 font-mono text-slate-500">2026-09-10</td>
          </tr>
        ))}
      </tbody>
    </table>
  </TableCard>
);

export const TeamLeadDashboardPage: React.FC = () => {
  const analytics = useAnalyticsData();
  const [drillDownData, setDrillDownData] = useState<DrillDownData | null>(null);
  const [directReports, setDirectReports] = useState<Employee[]>([]);
  const [sprintTasks, setSprintTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [dateFilter, setDateFilter] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const teamName = 'Frontend';

  useEffect(() => {
    setLoading(true);
    Promise.all([
      employeeApi.getEmployees().catch(() => []),
      workforceApi.getTasks().catch(() => [])
    ]).then(([employees, tasks]) => {
      const allEmp = Array.isArray(employees) ? employees : employees.employees || [];
      setDirectReports(allEmp.filter((e: Employee) => e.team === teamName));
      setSprintTasks(tasks);
    }).catch((err) => {
      console.error('Error loading team lead data:', err);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  const openDrillDown = (title: string, value: string | number, subtitle: string, details: { label: string; value: string | number }[]) => {
    setDrillDownData({
      title,
      metricValue: value,
      subtitle,
      category: 'Team Lead Scope',
      details,
    });
  };

  return (
    <DashboardErrorBoundary dashboardName="Team Lead Dashboard">
      <RoleGuard allowedRoles={[Role.ADMIN, Role.HR, Role.MANAGER, Role.TEAM_LEAD]} requiredPermission={Permission.TEAM_ANALYTICS_VIEW}>
        <DashboardHeader
            breadcrumbs={[
              { label: 'Home', href: '/' },
              { label: 'Team Lead', href: '/team-lead/dashboard' },
              { label: 'Dashboard' }
            ]}
            title="Team Lead Operational Command"
            badge={<span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-400">FRONTEND SQUAD</span>}
            description="Direct reports tracking, sprint task velocity, daily attendance tracking & developer feedback."
            lastUpdated={new Date().toLocaleTimeString()}
            onRefresh={analytics.reload}
            isRefreshing={analytics.isLoading}
            primaryAction={
              <Link to="/team-lead/tasks" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm">
                <Flame size={16} /> Sprint Tasks
              </Link>
            }
            secondaryAction={
              <Link to="/team-lead/members" className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2">
                <Users size={16} /> Team Roster
              </Link>
            }
          />

          <DashboardToolbar
            dateFilter={dateFilter}
            onDateFilterChange={setDateFilter}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            statusOptions={[
              { value: 'Active', label: 'Active' },
              { value: 'On Leave', label: 'On Leave' }
            ]}
          />

          {/* KPI metrics (8 KPIs) */}
          <KPIGrid>
            <KPICard title="Team Members" value={directReports.length} subtitle="Active team roster" icon={<Users size={20} />} color="info" />
            <KPICard title="Present Today" value={analytics.data?.metrics?.presentToday ?? 0} icon={<CheckCircle2 size={20} />} color="success" subtitle="Checked in today" />
            <KPICard title="Attendance Rate" value={analytics.data?.metrics?.attendanceRate ?? '0%'} icon={<CalendarClock size={20} />} color="emerald" trend="up" trendValue="1.2%" subtitle="Weekly average" />
            <KPICard title="On Leave" value={analytics.data?.metrics?.onLeave ?? 0} icon={<CalendarOff size={20} />} color="warning" subtitle="Currently on leave" />
            
            <KPICard title="Active Tasks" value={analytics.data?.metrics?.activeTasks ?? 0} icon={<ClipboardList size={20} />} color="info" subtitle="In progress" />
            <KPICard title="Completed Today" value={analytics.data?.metrics?.completedTasks ?? 0} icon={<CheckCircle2 size={20} />} color="success" trend="up" trendValue="5.4%" subtitle="Daily velocity" />
            <KPICard title="Blocked Tasks" value={analytics.data?.metrics?.blockedTasks ?? 0} subtitle="Require your intervention" icon={<AlertTriangle size={20} />} color="danger" />
            <KPICard title="Pending Reviews" value={analytics.data?.metrics?.pendingReviews ?? 0} subtitle="Awaiting review" icon={<ListTodo size={20} />} color="warning" />
          </KPIGrid>

          {/* Primary Analytics Grid (6 Charts) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 min-w-0">
            <AnalyticsLineChart title="Sprint Progress" subtitle="Completed vs remaining effort" data={analytics.data?.sprintProgress} xKey="name" series={[{ key: 'completed', name: 'Completed', color: '#10b981' }, { key: 'remaining', name: 'Remaining', color: '#ef4444' }]} isLoading={analytics.isLoading} error={analytics.error} onRetry={analytics.reload} />
            <AnalyticsLineChart title="Task Completion Trend" subtitle="Daily completion velocity" data={analytics.data?.taskCompletionTrend} xKey="name" series={[{ key: 'completed', name: 'Completed', color: '#8b5cf6' }, { key: 'total', name: 'Total', color: '#3b82f6' }]} isLoading={analytics.isLoading} error={analytics.error} onRetry={analytics.reload} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 min-w-0">
            <AnalyticsDonutChart title="Task Status Distribution" subtitle="Sprint task breakdown" data={analytics.data?.taskStatusDistribution} isLoading={analytics.isLoading} error={analytics.error} onRetry={analytics.reload} />
            <AnalyticsBarChart title="Team Workload" subtitle="Active tasks per member" layout="horizontal" data={analytics.data?.workloadByMember} xKey="name" series={[{ key: 'tasks', name: 'Tasks', color: '#f59e0b' }]} isLoading={analytics.isLoading} error={analytics.error} onRetry={analytics.reload} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 min-w-0">
            <AnalyticsBarChart title="Blocked Work" subtitle="Blocked vs open tasks by category" data={analytics.data?.blockedWork} xKey="name" series={[{ key: 'blocked', name: 'Blocked', color: '#ef4444' }, { key: 'open', name: 'Open', color: '#10b981' }]} isLoading={analytics.isLoading} error={analytics.error} onRetry={analytics.reload} />
            <AnalyticsBarChart title="Leave / Availability" subtitle="Scheduled absence breakdown" data={analytics.data?.leaveTrend} xKey="name" series={[{ key: 'sick', name: 'Sick', color: '#ef4444' }, { key: 'vacation', name: 'Vacation', color: '#3b82f6' }, { key: 'other', name: 'Other', color: '#f59e0b' }]} isLoading={analytics.isLoading} error={analytics.error} onRetry={analytics.reload} />
          </div>

          <EmployeeTable
            teamFilter={teamName}
            statusFilter={statusFilter}
          />
          <TeamLeadSprintBoard sprintTasks={sprintTasks} />

        <DrillDownModal isOpen={drillDownData !== null} onClose={() => setDrillDownData(null)} data={drillDownData} />
      </RoleGuard>
    </DashboardErrorBoundary>
  );
};

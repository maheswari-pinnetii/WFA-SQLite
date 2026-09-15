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
import { Flame, GitPullRequest, Users, CheckCircle2, Zap, Clock, Star, FileText, AlertTriangle, ArrowRight, Filter, Layers, Calendar } from 'lucide-react';
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

          {/* KPI metrics */}
          <KPIGrid>
            <KPICard
              title="Team Members"
              value={`${directReports.length} Developers`}
              trend="neutral"
              subtitle="Frontend Core Squad"
              icon={<Users size={20} />}
              color="info"
              onClick={() => openDrillDown('Team Roster', `${directReports.length} Developers`, 'Active squad members', [
                { label: 'Frontend Developers', value: directReports.length }
              ])}
            />
            <KPICard title="Present" value={`${directReports.filter(e => e.status === 'Active').length} Present`} trendValue="5.2%" trend="up" subtitle="On duty today" icon={<CheckCircle2 size={20} />} color="emerald" />
            <KPICard title="Absent" value="0 Absent" trend="neutral" subtitle="No unexcused absences" icon={<AlertTriangle size={20} />} color="danger" />
            <KPICard title="Late" value="1 Late" trendValue="1.5%" trend="down" subtitle="Checked in after shift target" icon={<Clock size={20} />} color="warning" />
            <KPICard title="On Leave" value="0 On Leave" trend="neutral" subtitle="Approved team PTO" icon={<Calendar size={20} />} color="info" />
            <KPICard title="Working Hours" value="45 hrs today" trendValue="8.0%" trend="up" subtitle="Total squad contribution" icon={<Clock size={20} />} color="danger" />
            <KPICard title="Tasks Pending" value={`${sprintTasks.filter(t => t.status !== 'COMPLETED').length} Pending`} trendValue="2.0%" trend="up" subtitle="Sprint tasks in backlog" icon={<FileText size={20} />} color="info" />
            <KPICard title="Tasks Completed" value={`${sprintTasks.filter(t => t.status === 'COMPLETED').length} Closed`} trendValue="100%" trend="up" subtitle="Closed sprint targets" icon={<CheckCircle2 size={20} />} color="emerald" />
          </KPIGrid>

          {/* Primary Analytics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnalyticsBarChart title="Squad Daily Attendance" subtitle="Weekdays breakdown inside squad" data={analytics.data?.attendanceOverview} xKey="name" series={[{ key: 'present', name: 'Present', color: '#0ea5e9' }, { key: 'absent', name: 'Absent', color: '#f43f5e' }]} isLoading={analytics.isLoading} error={analytics.error} onRetry={analytics.reload} />
            <AnalyticsBarChart title="Squad Task Velocity" subtitle="Productivity by sprint task status" data={analytics.data?.teamProductivity} xKey="name" series={[{ key: 'productivity', name: 'Productivity Rate', color: '#10b981' }]} isLoading={analytics.isLoading} error={analytics.error} onRetry={analytics.reload} />
          </div>

          {/* Secondary Analytics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnalyticsDonutChart title="Employment Status Mix" subtitle="Squad duty allocation" data={analytics.data?.employmentStatus} isLoading={analytics.isLoading} error={analytics.error} onRetry={analytics.reload} />
            <AnalyticsLineChart title="Squad Performance History" subtitle="Individual metrics trend" data={analytics.data?.performance} xKey="name" series={[{ key: 'performance', name: 'Performance', color: '#6366f1' }]} isLoading={analytics.isLoading} error={analytics.error} onRetry={analytics.reload} />
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

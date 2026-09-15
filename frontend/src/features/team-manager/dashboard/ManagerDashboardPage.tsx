import React, { useEffect, useState } from 'react';
import { DashboardErrorBoundary } from '../../../shared/components/DashboardErrorBoundary';
import { RoleGuard } from '../../../security/guards/RoleGuard';
import { Role } from '../../../security/roles/roles';
import { Permission } from '../../../security/permissions/permissions';
import { DashboardShell, DashboardHeader, DashboardToolbar, KPIGrid, KPICard, TableCard } from '../../../shared/components/dashboard';
import { DrillDownModal, DrillDownData } from '../../../shared/components/DrillDownModal';
import { useAnalyticsData } from '../../../hooks/useAnalyticsData';
import { AnalyticsBarChart, AnalyticsDonutChart, AnalyticsLineChart } from '../../../components/charts/AnalyticsCharts';
import { workforceApi, Task } from '../../../api/endpoints/workforce.api';
import { employeeApi } from '../../../api/endpoints/employee.api';
import { Employee } from '../../../shared/types/common.types';
import { Briefcase, Users, CheckCircle2, XCircle, Clock, Zap, Star, FileText, AlertTriangle, ArrowRight, Filter, Layers, CalendarClock, CalendarOff, ClipboardList, CheckSquare, Activity, Award, FileSpreadsheet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EmployeeTable } from '../../../components/tables/EmployeeTable';

export const ManagerSprintOverview: React.FC<{ tasks: Task[] }> = ({ tasks }) => (
  <TableCard title="Department Sprint" subtitle="ENGINEERING SPRINT">
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
        {tasks.slice(0, 5).map((task) => (
          <tr key={task.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
            <td className="py-3 px-4 font-medium text-slate-600 dark:text-slate-400">Sprint 24B</td>
            <td className="py-3 px-4 text-slate-900 dark:text-white font-medium max-w-[200px] truncate">{task.title}</td>
            <td className="py-3 px-4 text-slate-500">{task.assigneeName || 'Unassigned'}</td>
            <td className="py-3 px-4">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                task.priority === 'CRITICAL' || task.priority === 'HIGH'
                  ? 'bg-rose-50 dark:bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30'
                  : task.priority === 'MEDIUM'
                  ? 'bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30'
                  : 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'
              }`}>
                {task.priority}
              </span>
            </td>
            <td className="py-3 px-4 text-slate-900 dark:text-white font-medium uppercase text-[11px]">{task.status}</td>
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

export const ManagerDashboardPage: React.FC = () => {
  const analytics = useAnalyticsData();
  const [drillDownData, setDrillDownData] = useState<DrillDownData | null>(null);
  const [approvals, setApprovals] = useState<Array<{ id: string; employee: string; type: string; duration: string; reason: string; status: 'PENDING' | 'APPROVED' | 'REJECTED' }>>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [dateFilter, setDateFilter] = useState('');
  const [teamFilter, setTeamFilter] = useState('All');
  const [employeeFilter, setEmployeeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const loadApprovals = async () => {
    const requests = await workforceApi.getLeaveRequests();
    setApprovals(requests.map((request) => ({
      id: request.id,
      employee: request.employeeName,
      type: request.type,
      duration: `${request.startDate} - ${request.endDate}`,
      reason: request.reason,
      status: request.status
    })));
  };

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
        await loadApprovals().catch(() => setApprovals([]));
      } catch (err) {
        console.error('Error fetching manager dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAction = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await workforceApi.reviewLeaveRequest(id, status);
      await loadApprovals();
    } catch {
      // Fallback
    }
  };

  const openDrillDown = (title: string, value: string | number, subtitle: string, details: { label: string; value: string | number }[]) => {
    setDrillDownData({
      title,
      metricValue: value,
      subtitle,
      category: 'Department Manager Scope',
      details,
    });
  };

  const departmentName = 'Engineering';



  const pendingApprovalsCount = approvals.filter(a => a.status === 'PENDING').length;

  return (
    <DashboardErrorBoundary dashboardName="Manager Dashboard">
      <RoleGuard allowedRoles={[Role.ADMIN, Role.HR, Role.MANAGER]} requiredPermission={Permission.TEAM_ANALYTICS_VIEW}>
        <DashboardHeader
            breadcrumbs={[
              { label: 'Home', href: '/' },
              { label: 'Manager', href: '/manager/dashboard' },
              { label: 'Dashboard' }
            ]}
            title="Department Manager Workspace"
            badge={<span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">ENGINEERING SCOPE</span>}
            description="Resource allocation, sub-team sprint velocity, leave approvals & department throughput."
            lastUpdated={new Date().toLocaleTimeString()}
            onRefresh={analytics.reload}
            isRefreshing={analytics.isLoading}
            primaryAction={
              <Link to="/manager/approvals" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm">
                <CheckCircle2 size={16} /> Leave Approvals
              </Link>
            }
            secondaryAction={
              <Link to="/manager/analytics" className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2">
                <Zap size={16} /> Team Analytics
              </Link>
            }
          />

          <DashboardToolbar
            dateFilter={dateFilter}
            onDateFilterChange={setDateFilter}
            teamFilter={teamFilter}
            onTeamFilterChange={setTeamFilter}
            teamOptions={[
              { value: 'Frontend', label: 'Frontend' },
              { value: 'Backend', label: 'Backend' },
              { value: 'QA', label: 'QA' }
            ]}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            statusOptions={[
              { value: 'Active', label: 'Active' },
              { value: 'On Leave', label: 'On Leave' }
            ]}
          />

          {/* KPI metrics (10 KPIs) */}
          <KPIGrid>
            <KPICard title="Team Members" value={analytics.data?.metrics?.teamMembers ?? 0} icon={<Users size={20} />} color="info" trend="neutral" subtitle="Total direct reports" />
            <KPICard title="Present Today" value={analytics.data?.metrics?.presentToday ?? 0} icon={<CheckCircle2 size={20} />} color="success" subtitle="Checked in today" />
            <KPICard title="Attendance Rate" value={analytics.data?.metrics?.attendanceRate ?? '0%'} icon={<CalendarClock size={20} />} color="emerald" trend="up" trendValue="1.2%" subtitle="Weekly average" />
            <KPICard title="On Leave" value={analytics.data?.metrics?.onLeave ?? 0} icon={<CalendarOff size={20} />} color="warning" subtitle="Currently on leave" />
            
            <KPICard title="Active Tasks" value={analytics.data?.metrics?.activeTasks ?? 0} icon={<FileSpreadsheet size={20} />} color="info" subtitle="In progress" />
            <KPICard title="Completed Tasks" value={analytics.data?.metrics?.completedTasks ?? 0} icon={<CheckCircle2 size={20} />} color="success" trend="up" trendValue="5.4%" subtitle="This sprint" />
            <KPICard title="Overdue Tasks" value={analytics.data?.metrics?.overdueTasks ?? 0} icon={<Clock size={20} />} color="danger" subtitle="Requires attention" />
            <KPICard title="Sprint Progress" value={analytics.data?.metrics?.sprintProgress ?? '0%'} icon={<Activity size={20} />} color="info" subtitle="Team capacity" />
            
            <KPICard title="Pending Approvals" value={pendingApprovalsCount} icon={<Filter size={20} />} color="warning" subtitle="Action required" />
            <KPICard title="Team Performance" value={analytics.data?.metrics?.teamPerformance ?? '0%'} icon={<Award size={20} />} color="emerald" subtitle="Average score" />
          </KPIGrid>

          {/* Leave Requests Approvals Desk */}
          <div className="p-6 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock size={18} className="text-amber-500" /> Pending Team Leave Approvals
              </h3>
              <Link to="/manager/approvals" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">
                Approvals Desk <ArrowRight size={12} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {approvals.length === 0 ? <p className="text-sm text-slate-500 md:col-span-3">No leave requests are waiting in your department.</p> : approvals.map((req) => (
                <div key={req.id} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{req.employee}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">{req.type}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    <span className="font-semibold text-slate-900 dark:text-slate-300">{req.duration}</span> — {req.reason}
                  </p>
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                    {req.status === 'PENDING' ? (
                      <>
                        <button
                          onClick={() => void handleAction(req.id, 'APPROVED')}
                          className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                        >
                          <CheckCircle2 size={14} /> Approve
                        </button>
                        <button
                          onClick={() => void handleAction(req.id, 'REJECTED')}
                          className="px-3 py-1.5 rounded bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center gap-1.5 transition-colors"
                        >
                          <XCircle size={14} /> Reject
                        </button>
                      </>
                    ) : (
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400'}`}>
                        {req.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Primary Analytics Grid (6 Charts) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 min-w-0">
            <AnalyticsLineChart title="Team Attendance Trend" subtitle="Daily attendance overview" data={analytics.data?.attendanceOverview} xKey="name" series={[{ key: 'present', name: 'Present', color: '#10b981' }, { key: 'absent', name: 'Absent', color: '#ef4444' }]} isLoading={analytics.isLoading} error={analytics.error} onRetry={analytics.reload} />
            <AnalyticsLineChart title="Task Completion Trend" subtitle="Completed vs total assigned tasks" data={analytics.data?.taskCompletionTrend} xKey="name" series={[{ key: 'completed', name: 'Completed', color: '#8b5cf6' }, { key: 'total', name: 'Total', color: '#3b82f6' }]} isLoading={analytics.isLoading} error={analytics.error} onRetry={analytics.reload} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 min-w-0">
            <AnalyticsBarChart title="Workload by Team Member" subtitle="Current assigned task load" layout="horizontal" data={analytics.data?.workloadByMember} xKey="name" series={[{ key: 'tasks', name: 'Tasks', color: '#f59e0b' }]} isLoading={analytics.isLoading} error={analytics.error} onRetry={analytics.reload} />
            <AnalyticsDonutChart title="Task Status Distribution" subtitle="Sprint task breakdown" data={analytics.data?.taskStatusDistribution} isLoading={analytics.isLoading} error={analytics.error} onRetry={analytics.reload} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 min-w-0">
            <AnalyticsBarChart title="Leave / Availability" subtitle="Scheduled absence breakdown" data={analytics.data?.leaveTrend} xKey="name" series={[{ key: 'sick', name: 'Sick', color: '#ef4444' }, { key: 'vacation', name: 'Vacation', color: '#3b82f6' }, { key: 'other', name: 'Other', color: '#f59e0b' }]} isLoading={analytics.isLoading} error={analytics.error} onRetry={analytics.reload} />
            <AnalyticsBarChart title="Department Performance" subtitle="Team productivity score index" data={analytics.data?.teamProductivity} xKey="name" series={[{ key: 'productivity', name: 'Productivity', color: '#8b5cf6' }]} layout="vertical" isLoading={analytics.isLoading} error={analytics.error} onRetry={analytics.reload} />
          </div>



          <ManagerSprintOverview tasks={tasks} />
          <div className="mt-6">
            <EmployeeTable
              deptFilter={departmentName}
              teamFilter={teamFilter}
              statusFilter={statusFilter}
            />
          </div>

        <DrillDownModal isOpen={drillDownData !== null} onClose={() => setDrillDownData(null)} data={drillDownData} />
      </RoleGuard>
    </DashboardErrorBoundary>
  );
};

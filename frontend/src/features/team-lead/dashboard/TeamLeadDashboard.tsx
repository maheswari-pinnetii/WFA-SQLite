import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../auth/hooks/useAuth';
import { PageContainer } from '../../../components/layout/PageContainer';
import { PageHeader } from '../../../components/layout/PageHeader';
import { FilterBar, FilterState } from '../../../components/layout/FilterBar';
import { ExceptionsSection, ExceptionItem } from '../../../components/dashboard/widgets/ExceptionsSection';
import KpiCard from '../../../components/dashboard/KpiCard';
import GroupsIcon from '@mui/icons-material/Groups';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import SpeedIcon from '@mui/icons-material/Speed';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import BlockIcon from '@mui/icons-material/Block';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import Grid from '@mui/material/Grid';
import { AnalyticsBarChart, AnalyticsDonutChart, AnalyticsLineChart } from '../../../components/charts/AnalyticsCharts';
import { analyticsApi } from '../../../api/endpoints/analytics.api';
import { Users, AlertCircle, FileCode, Layers, RefreshCw, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const FALLBACK: any = {
  kpis: { 
    squadSize: 12, 
    checkedIn: 11, 
    absent: 0, 
    late: 1, 
    onLeave: 1, 
    pendingLeaveRequests: 2, 
    activeTasks: 18,
    sprintVelocity: 45, 
    blockedTasks: 2, 
    avgResponseTime: '1.2h',
    codeReviews: 8 
  },
  charts: { 
    dailyCheckins: [
      { day: 'Mon', checkedIn: 11 }, { day: 'Tue', checkedIn: 12 }, { day: 'Wed', checkedIn: 10 },
      { day: 'Thu', checkedIn: 11 }, { day: 'Fri', checkedIn: 12 }
    ],
    taskStatus: [
      { name: 'To Do', value: 5, color: '#94a3b8' },
      { name: 'In Progress', value: 8, color: '#059669' },
      { name: 'In Review', value: 3, color: '#f59e0b' },
      { name: 'Done', value: 12, color: '#10b981' }
    ],
    velocityTrend: [
      { sprint: 'S1', points: 35 }, { sprint: 'S2', points: 42 }, { sprint: 'S3', points: 38 },
      { sprint: 'S4', points: 45 }
    ],
    blockersByType: [
      { name: 'Dependencies', value: 50, color: '#ef4444' },
      { name: 'Requirements', value: 30, color: '#f59e0b' },
      { name: 'Environment', value: 20, color: '#8b5cf6' }
    ],
    leaveCalendar: [
      { week: 'W1', leaves: 2 }, { week: 'W2', leaves: 0 }, { week: 'W3', leaves: 1 },
      { week: 'W4', leaves: 3 }
    ],
    workloadDistribution: [
      { name: 'Alex', tasks: 4 },
      { name: 'Sam', tasks: 6 },
      { name: 'Taylor', tasks: 3 },
      { name: 'Jordan', tasks: 5 }
    ]
  },
  tables: { 
    roster: [
      { name: 'Alex Mercer', role: 'Frontend Dev', status: 'Active', joinDate: '2024-03-12' },
      { name: 'Sam Fisher', role: 'Backend Dev', status: 'Active', joinDate: '2023-08-20' },
      { name: 'Taylor Swift', role: 'UI Designer', status: 'Active', joinDate: '2025-01-05' }
    ]
  },
};

export const TeamLeadDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await analyticsApi.getDashboard('team-lead');
      if (res && (res.kpis || res.charts)) {
        setData(res);
      } else {
        setError('Failed to fetch Team Lead dashboard metrics from server.');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load Team Lead metrics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const kpis = data?.kpis || {};
  const charts = data?.charts || {};
  const tables = data?.tables || {};

  const leadExceptions: ExceptionItem[] = [
    {
      id: 'lead-1',
      title: 'Blocked Sprint Tasks',
      subtitle: '2 tasks blocked in active sprint awaiting unblock',
      count: 2,
      severity: 'critical',
      actionLabel: 'Tasks Board',
      actionPath: '/team-lead/tasks',
    },
    {
      id: 'lead-2',
      title: 'Pending PR Reviews',
      subtitle: '8 pull requests pending code review approval',
      count: 8,
      severity: 'warning',
      actionLabel: 'Code Reviews',
      actionPath: '/team-lead/sprints',
    },
    {
      id: 'lead-3',
      title: 'Late Attendance',
      subtitle: '1 team member checked in after standard shift start',
      count: 1,
      severity: 'info',
      actionLabel: 'Squad Roster',
      actionPath: '/team-lead/team',
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Team Lead Overview"
        description="Monitor daily squad attendance, active sprint velocity, task status breakdown, and technical blockers."
        actions={
          <>
            <button
              onClick={fetchDashboard}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              Refresh Metrics
            </button>
            <Link
              to="/team-lead/sprints"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
            >
              <Layers size={13} />
              Active Sprint
            </Link>
          </>
        }
      />

      {/* Filter Bar */}
      <FilterBar
        onFilterChange={(filters: FilterState) => {
          fetchDashboard();
        }}
      />

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-3 p-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs">
          <AlertCircle size={15} className="shrink-0 text-amber-600 dark:text-amber-400" />
          <span>{error}</span>
          <button onClick={fetchDashboard} className="ml-auto text-xs underline font-medium hover:no-underline">Retry</button>
        </div>
      )}

      {/* KPI Section */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {[
          {
            title: 'Team Members',
            value: kpis.squadSize ?? 12,
            meta: 'Assigned squad size',
            trend: { value: 'Full squad active', direction: 'up' as const },
            icon: <GroupsIcon />,
          },
          {
            title: 'Present Today',
            value: kpis.checkedIn ?? 11,
            meta: 'Checked-in squad members',
            trend: { value: '91.6% presence today', direction: 'up' as const },
            icon: <HowToRegIcon />,
          },
          {
            title: 'Attendance Rate',
            value: `${Math.round(((kpis.checkedIn ?? 11) / (kpis.squadSize ?? 12)) * 100)}%`,
            meta: 'Sprint 24 average',
            trend: { value: '↑ 1.5% target', direction: 'up' as const },
            icon: <EventAvailableIcon />,
          },
          {
            title: 'Sprint Progress',
            value: `${kpis.sprintVelocity ?? 45} pts`,
            meta: 'Current sprint velocity',
            trend: { value: '↑ 3 pts vs last sprint', direction: 'up' as const },
            icon: <SpeedIcon />,
          },
          {
            title: 'Tasks Completed',
            value: kpis.activeTasks ? kpis.activeTasks : 18,
            meta: 'Done in current sprint',
            trend: { value: 'On track', direction: 'up' as const },
            icon: <TaskAltIcon />,
          },
          {
            title: 'Blocked Tasks',
            value: kpis.blockedTasks ?? 2,
            meta: 'Awaiting unblock',
            trend: { value: 'Requires unblock', direction: 'down' as const },
            icon: <BlockIcon />,
          },
          {
            title: 'Productivity',
            value: '92%',
            meta: 'Code review speed',
            trend: { value: '1.2h response SLA', direction: 'up' as const },
            icon: <TrendingUpIcon />,
          },
          {
            title: 'Pending Actions',
            value: kpis.pendingLeaveRequests ?? 2,
            meta: 'Code reviews & leaves',
            trend: { value: 'Action required', direction: 'down' as const },
            icon: <PendingActionsIcon />,
          },
        ].map((kpi) => (
          <Grid key={kpi.title} size={{ xs: 12, sm: 6, lg: 3 }}>
            <KpiCard {...kpi} loading={loading} />
          </Grid>
        ))}
      </Grid>

      {/* Exceptions Section */}
      <ExceptionsSection items={leadExceptions} title="Squad Blockers & Task Alerts" />

      {/* Analytics Charts */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-60 rounded-lg bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnalyticsLineChart
            title="Daily Attendance Roster"
            data={charts.dailyCheckins || []}
            xKey="day"
            series={[{ key: 'checkedIn', name: 'Checked In', color: '#059669' }]}
          />
          <AnalyticsDonutChart
            title="Task Status Breakdown"
            data={charts.taskStatus || []}
          />
          <AnalyticsLineChart
            title="Sprint Velocity Trend (pts)"
            data={charts.velocityTrend || []}
            xKey="sprint"
            series={[{ key: 'points', name: 'Velocity', color: '#10b981' }]}
          />
          <AnalyticsDonutChart
            title="Blockers by Category"
            data={charts.blockersByType || []}
          />
          <AnalyticsBarChart
            title="Planned Leave Calendar"
            data={charts.leaveCalendar || []}
            xKey="week"
            series={[{ key: 'leaves', name: 'Leaves', color: '#f59e0b' }]}
          />
          <AnalyticsBarChart
            title="Workload Task Allocation"
            data={charts.workloadDistribution || []}
            xKey="name"
            series={[{ key: 'tasks', name: 'Assigned Tasks', color: '#059669' }]}
          />
        </div>
      )}

      {/* Squad Roster Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-2xs">
        <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Squad Member Status</h3>
          <Link to="/team-lead/team" className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline">View Squad Table →</Link>
        </div>
        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => <div key={i} className="h-8 rounded bg-slate-100 dark:bg-slate-800/60 animate-pulse" />)}
          </div>
        ) : (tables.roster || []).length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">No squad members available.</div>
        ) : (
          <div className="overflow-x-auto rounded-md border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-medium">
                <tr>
                  <th className="py-2.5 px-3">Member Name</th>
                  <th className="py-2.5 px-3">Employee Code</th>
                  <th className="py-2.5 px-3">Designation</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Join Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-800 dark:text-slate-200">
                {(tables.roster || []).map((emp: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-100">{emp.name || '—'}</td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500 dark:text-slate-400">{emp.employeeCode || emp.id || '—'}</td>
                    <td className="py-2.5 px-3">{emp.designation || emp.role || '—'}</td>
                    <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800">{emp.status || '—'}</span></td>
                    <td className="py-2.5 px-3 text-slate-500">{emp.joinDate ? new Date(emp.joinDate).toLocaleDateString('en-IN') : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Navigation Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Squad Roster', path: '/team-lead/team', icon: <Users size={16} /> },
          { label: 'Active Sprint', path: '/team-lead/sprints', icon: <Layers size={16} /> },
          { label: 'Task Tracking', path: '/team-lead/tasks', icon: <FileCode size={16} /> },
          { label: 'Attendance', path: '/attendance/team', icon: <Clock size={16} /> },
        ].map((a) => (
          <Link key={a.path} to={a.path} className="flex items-center gap-2.5 p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors shadow-2xs group">
            <span className="text-slate-500 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{a.icon}</span>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{a.label}</span>
          </Link>
        ))}
      </div>
    </PageContainer>
  );
};

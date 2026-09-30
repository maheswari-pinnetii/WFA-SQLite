import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../features/auth/hooks/useAuth';
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
        setData(null);
      }
    } catch (err: any) {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const kpis = data?.kpis || {
    squadSize: 12,
    presentToday: 11,
    activeTasks: 24,
    blockedTasks: 2,
    sprintProgress: '68%',
    codeReviews: 8,
    teamVelocity: 42,
    openBugs: 5
  };
  const charts = data?.charts || {
    sprintBurndown: [
      { day: 'Mon', remaining: 40, ideal: 40 },
      { day: 'Tue', remaining: 35, ideal: 32 },
      { day: 'Wed', remaining: 28, ideal: 24 },
      { day: 'Thu', remaining: 20, ideal: 16 },
      { day: 'Fri', remaining: 12, ideal: 8 },
    ],
    taskStatus: [
      { name: 'To Do', value: 8, color: '#64748b' },
      { name: 'In Progress', value: 12, color: '#3b82f6' },
      { name: 'In Review', value: 4, color: '#f59e0b' },
      { name: 'Done', value: 24, color: '#10b981' },
    ],
    memberWorkload: [
      { name: 'Aryan S.', count: 5 },
      { name: 'Meera G.', count: 4 },
      { name: 'Kiran K.', count: 6 },
      { name: 'Rahul S.', count: 4 },
      { name: 'Priya P.', count: 5 },
    ]
  };
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
            value: kpis.teamMembers ?? 0,
            meta: 'Assigned squad size',
            trend: { value: 'Full squad active', direction: 'neutral' as const },
            icon: <GroupsIcon />,
          },
          {
            title: 'Present Today',
            value: kpis.presentToday ?? 0,
            meta: 'Checked-in squad members',
            trend: { value: 'Today\'s presence', direction: 'neutral' as const },
            icon: <HowToRegIcon />,
          },
          {
            title: 'Attendance Rate',
            value: (kpis.teamMembers && kpis.presentToday) ? `${Math.round((kpis.presentToday / kpis.teamMembers) * 100)}%` : '0%',
            meta: 'Daily average',
            trend: { value: 'Squad attendance rate', direction: 'neutral' as const },
            icon: <EventAvailableIcon />,
          },
          {
            title: 'Sprint Progress',
            value: kpis.sprintProgress != null ? `${kpis.sprintProgress}%` : '0%',
            meta: 'Current sprint milestone',
            trend: { value: 'Sprint completion rate', direction: 'neutral' as const },
            icon: <SpeedIcon />,
          },
          {
            title: 'Tasks Completed',
            value: kpis.taskCompletion ?? 0,
            meta: 'Done in current sprint',
            trend: { value: 'Sprint velocity', direction: 'neutral' as const },
            icon: <TaskAltIcon />,
          },
          {
            title: 'Blocked Tasks',
            value: kpis.blockedTasks ?? 0,
            meta: 'Awaiting unblock',
            trend: { value: 'Requires unblock', direction: 'down' as const },
            icon: <BlockIcon />,
          },
          {
            title: 'Productivity',
            value: kpis.productivity != null ? `${kpis.productivity}%` : '0%',
            meta: 'Output velocity',
            trend: { value: 'Efficiency score', direction: 'neutral' as const },
            icon: <TrendingUpIcon />,
          },
          {
            title: 'Pending Actions',
            value: kpis.pendingActions ?? 0,
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

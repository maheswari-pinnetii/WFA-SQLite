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
import EventBusyIcon from '@mui/icons-material/EventBusy';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import SpeedIcon from '@mui/icons-material/Speed';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssessmentIcon from '@mui/icons-material/Assessment';
import Grid from '@mui/material/Grid';
import { AnalyticsBarChart, AnalyticsDonutChart, AnalyticsLineChart } from '../../../components/charts/AnalyticsCharts';
import { analyticsApi } from '../../../api/endpoints/analytics.api';
import { Users, Clock, Briefcase, Layers, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';


export const ManagerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await analyticsApi.getDashboard('manager').catch(() => null);
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

  const kpis = data?.kpis || {};
  const charts = data?.charts || {};
  const tables = data?.tables || {};

  const managerExceptions: ExceptionItem[] = [
    {
      id: 'mgr-1',
      title: 'Late Check-Ins Today',
      subtitle: '3 team members arrived after 09:30 AM threshold',
      count: 3,
      severity: 'warning',
      actionLabel: 'View Team Roster',
      actionPath: '/manager/team',
    },
    {
      id: 'mgr-2',
      title: 'Pending Leave Requests',
      subtitle: '4 leave applications awaiting department approval',
      count: 4,
      severity: 'info',
      actionLabel: 'Approvals',
      actionPath: '/leave/requests',
    },
    {
      id: 'mgr-3',
      title: 'Blocked Sprint Tasks',
      subtitle: '2 critical tasks blocked in active sprint',
      count: 2,
      severity: 'critical',
      actionLabel: 'Task Board',
      actionPath: '/manager/tasks',
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Department Overview"
        description="Monitor team capacity, daily attendance, sprint progress, task workload, and department performance."
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
              to="/manager/team"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
            >
              <Users size={13} />
              Team Directory
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
            title: 'Team Size',
            value: kpis.totalTeam ?? 0,
            meta: 'Department members',
            trend: { value: 'Full headcount active', direction: 'neutral' as const },
            icon: <GroupsIcon />,
          },
          {
            title: 'Present Today',
            value: kpis.teamPresent ?? 0,
            meta: 'Checked-in headcount',
            trend: { value: 'Today\'s presence', direction: 'neutral' as const },
            icon: <HowToRegIcon />,
          },
          {
            title: 'Team Attendance',
            value: (kpis.totalTeam && kpis.teamPresent) ? `${Math.round((kpis.teamPresent / kpis.totalTeam) * 100)}%` : '0%',
            meta: 'Daily average',
            trend: { value: 'Team presence rate', direction: 'neutral' as const },
            icon: <EventAvailableIcon />,
          },
          {
            title: 'Pending Leaves',
            value: kpis.onLeave ?? 0,
            meta: 'Awaiting manager approval',
            trend: { value: 'Action required', direction: 'down' as const },
            icon: <EventBusyIcon />,
          },
          {
            title: 'Active Projects',
            value: kpis.openTasks ?? 0,
            meta: 'In-progress deliverables',
            trend: { value: 'Ongoing tasks', direction: 'neutral' as const },
            icon: <WorkOutlineOutlinedIcon />,
          },
          {
            title: 'Sprint Progress',
            value: kpis.taskCompletion != null ? `${kpis.taskCompletion}%` : '0%',
            meta: 'Sprint milestone',
            trend: { value: 'Task completion rate', direction: 'neutral' as const },
            icon: <SpeedIcon />,
          },
          {
            title: 'Productivity',
            value: kpis.productivity != null ? `${kpis.productivity}%` : '0%',
            meta: 'Output velocity',
            trend: { value: 'Efficiency score', direction: 'neutral' as const },
            icon: <TrendingUpIcon />,
          },
          {
            title: 'Department Budget',
            value: kpis.budget || '$0',
            meta: 'Allocated base salaries',
            trend: { value: 'Budget utilization', direction: 'neutral' as const },
            icon: <AssessmentIcon />,
          },
        ].map((kpi) => (
          <Grid item key={kpi.title} xs={12} sm={6} lg={3}>
            <KpiCard {...kpi} loading={loading} />
          </Grid>
        ))}
      </Grid>

      {/* Exceptions Section */}
      <ExceptionsSection items={managerExceptions} title="Department Operational Exceptions" />

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
            title="Weekly Attendance Trend (%)"
            data={charts.teamAttendanceTrend || []}
            xKey="day"
            series={[{ key: 'attendance', name: 'Attendance', color: '#059669' }]}
          />
          <AnalyticsDonutChart
            title="Workload Risk Distribution"
            data={charts.taskBurnout || []}
          />
          <AnalyticsBarChart
            title="Key Competency Levels"
            data={charts.skillCoverage || []}
            xKey="skill"
            series={[{ key: 'level', name: 'Level %', color: '#10b981' }]}
          />
          <AnalyticsBarChart
            title="Overtime Hours by Week"
            data={charts.overtimeByWeek || []}
            xKey="week"
            series={[{ key: 'hours', name: 'Hours', color: '#f59e0b' }]}
          />
          <AnalyticsBarChart
            title="Leave Pipeline Requests"
            data={charts.leavePipeline || []}
            xKey="month"
            series={[{ key: 'approved', name: 'Approved', color: '#059669' }, { key: 'pending', name: 'Pending', color: '#f59e0b' }]}
          />
          <AnalyticsDonutChart
            title="Performance Review Matrix"
            data={charts.performanceMatrix || []}
          />
        </div>
      )}

      {/* Roster Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-2xs">
        <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Department Members Roster</h3>
          <Link to="/manager/team" className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline">Full Team Table →</Link>
        </div>
        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => <div key={i} className="h-8 rounded bg-slate-100 dark:bg-slate-800/60 animate-pulse" />)}
          </div>
        ) : (tables.roster || []).length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">No team members available.</div>
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
                    <td className="py-2.5 px-3"><span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${emp.status === 'Active' || emp.status === 'ACTIVE' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800' : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200'}`}>{emp.status || '—'}</span></td>
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
          { label: 'My Team', path: '/manager/team', icon: <Users size={16} /> },
          { label: 'Sprint Planning', path: '/manager/sprints', icon: <Layers size={16} /> },
          { label: 'Task Tracking', path: '/manager/tasks', icon: <CheckCircle size={16} /> },
          { label: 'Leave Approvals', path: '/leave/requests', icon: <Clock size={16} /> },
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

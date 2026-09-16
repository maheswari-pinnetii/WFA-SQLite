import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../auth/hooks/useAuth';
import { PageContainer } from '../../../components/layout/PageContainer';
import { PageHeader } from '../../../components/layout/PageHeader';
import { FilterBar, FilterState } from '../../../components/layout/FilterBar';
import { ExceptionsSection, ExceptionItem } from '../../../components/dashboard/widgets/ExceptionsSection';
import { MinimalKpiCard } from '../../../components/cards/MinimalKpiCard';
import { AnalyticsBarChart, AnalyticsDonutChart, AnalyticsLineChart } from '../../../components/charts/AnalyticsCharts';
import { analyticsApi } from '../../../api/endpoints/analytics.api';
import { Clock, Calendar, DollarSign, Award, RefreshCw, AlertCircle, Layers, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const FALLBACK: any = {
  kpis: { 
    hoursLogged: '152.5', 
    overtime: '6.5', 
    leaveBalance: '14', 
    pendingLeaves: '2',
    tasksAssigned: '12',
    tasksCompleted: '8',
    upcomingHolidays: '1',
    nextReview: 'Oct 15'
  },
  charts: {
    myAttendanceTrend: [
      { day: 'Mon', hours: 8.5 }, { day: 'Tue', hours: 8.2 }, { day: 'Wed', hours: 9.0 },
      { day: 'Thu', hours: 8.0 }, { day: 'Fri', hours: 8.5 }
    ],
    taskProgress: [
      { name: 'To Do', value: 3, color: '#94a3b8' },
      { name: 'In Progress', value: 4, color: '#059669' },
      { name: 'Review', value: 2, color: '#f59e0b' },
      { name: 'Done', value: 8, color: '#10b981' }
    ],
    leaveUsage: [
      { type: 'Casual', used: 2, remaining: 10 },
      { type: 'Sick', used: 1, remaining: 11 },
      { type: 'Earned', used: 5, remaining: 13 }
    ],
    overtimeHistory: [
      { month: 'Jun', hours: 12 }, { month: 'Jul', hours: 15 }, { month: 'Aug', hours: 8 }, { month: 'Sep', hours: 6.5 }
    ],
    peerFeedbackScore: [
      { category: 'Teamwork', score: 4.5 },
      { category: 'Communication', score: 4.2 },
      { category: 'Initiative', score: 4.8 }
    ],
    skillProgression: [
      { name: 'React', level: 85 },
      { name: 'Node.js', level: 70 },
      { name: 'SQL', level: 90 }
    ]
  },
  tables: { 
    roster: [
      { task: 'Implement biometric check-in', date: 'Sep 14', status: 'Done' },
      { task: 'Fix Payroll Export bug', date: 'Sep 15', status: 'In Progress' },
      { task: 'Update API Docs', date: 'Sep 16', status: 'Pending' }
    ]
  },
};

export const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(FALLBACK);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const firstName = user?.name ? user.name.split(' ')[0] : 'Employee';

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await analyticsApi.getDashboard('employee');
      if (res) setData(res);
      else setError('Dashboard returned empty data. Showing personal baseline.');
    } catch (err: any) {
      setError(err?.message || 'Could not load your workspace metrics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const kpis = data?.kpis || FALLBACK.kpis;
  const charts = data?.charts || FALLBACK.charts;
  const tables = data?.tables || FALLBACK.tables;

  const myExceptions: ExceptionItem[] = [
    {
      id: 'emp-1',
      title: 'Pending Leave Approvals',
      subtitle: '2 leave applications submitted awaiting manager review',
      count: 2,
      severity: 'warning',
      actionLabel: 'My Leave',
      actionPath: '/leave/my',
    },
    {
      id: 'emp-2',
      title: 'Assigned Work Items',
      subtitle: '4 active tasks assigned in current sprint',
      count: 4,
      severity: 'info',
      actionLabel: 'My Tasks',
      actionPath: '/employee/work',
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title={`Good Morning, ${firstName}`}
        description="View today's work schedule, attendance hours, assigned sprint tasks, and personal leave balance."
        actions={
          <>
            <button
              onClick={fetchDashboard}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              Refresh Dashboard
            </button>
            <Link
              to="/employee/work"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
            >
              <CheckCircle2 size={13} />
              My Work Board
            </Link>
          </>
        }
      />

      {/* Filter Bar */}
      <FilterBar
        showDateRange={true}
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
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-24 rounded-lg bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MinimalKpiCard title="Hours Logged (Month)" value={`${kpis.hoursLogged ?? 0}h`} icon={<Clock size={18} />} iconBgColor="emerald" trend="Standard 40h/week" trendType="positive" />
          <MinimalKpiCard title="Overtime Hours" value={`${kpis.overtime ?? 0}h`} icon={<Clock size={18} />} iconBgColor="emerald" trend="Approved overtime" trendType="positive" />
          <MinimalKpiCard title="Leave Balance" value={`${kpis.leaveBalance ?? 0} Days`} icon={<Calendar size={18} />} iconBgColor="emerald" trend="Available for use" trendType="positive" />
          <MinimalKpiCard title="Pending Leave Requests" value={kpis.pendingLeaves ?? 0} icon={<AlertCircle size={18} />} iconBgColor="amber" trend="Awaiting manager approval" trendType="neutral" />
          <MinimalKpiCard title="Assigned Tasks" value={kpis.tasksAssigned ?? 0} icon={<Layers size={18} />} iconBgColor="emerald" trend="Current sprint items" trendType="positive" />
          <MinimalKpiCard title="Tasks Completed" value={kpis.tasksCompleted ?? 0} icon={<CheckCircle2 size={18} />} iconBgColor="emerald" trend="↑ 2 completed this week" trendType="positive" />
          <MinimalKpiCard title="Upcoming Holidays" value={`${kpis.upcomingHolidays ?? 0} Day`} icon={<Calendar size={18} />} iconBgColor="emerald" trend="Gandhi Jayanti (Oct 2)" trendType="positive" />
          <MinimalKpiCard title="Next Performance Review" value={kpis.nextReview ?? '—'} icon={<Award size={18} />} iconBgColor="emerald" trend="Scheduled review" trendType="positive" />
        </div>
      )}

      {/* Action Items */}
      <ExceptionsSection items={myExceptions} title="Personal Work & Approval Status" />

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
            title="My Daily Working Hours"
            data={charts.myAttendanceTrend || []}
            xKey="day"
            series={[{ key: 'hours', name: 'Hours', color: '#059669' }]}
          />
          <AnalyticsDonutChart
            title="My Task Status Breakdown"
            data={charts.taskProgress || []}
          />
          <AnalyticsBarChart
            title="Leave Type Balances"
            data={charts.leaveUsage || []}
            xKey="type"
            series={[{ key: 'used', name: 'Used', color: '#f59e0b' }, { key: 'remaining', name: 'Remaining', color: '#059669' }]}
          />
          <AnalyticsLineChart
            title="Overtime History (Hours)"
            data={charts.overtimeHistory || []}
            xKey="month"
            series={[{ key: 'hours', name: 'Hours', color: '#10b981' }]}
          />
          <AnalyticsBarChart
            title="Peer Feedback Ratings"
            data={charts.peerFeedbackScore || []}
            xKey="category"
            series={[{ key: 'score', name: 'Rating', color: '#059669' }]}
          />
          <AnalyticsBarChart
            title="Skill Proficiency Level"
            data={charts.skillProgression || []}
            xKey="name"
            series={[{ key: 'level', name: 'Level %', color: '#10b981' }]}
          />
        </div>
      )}

      {/* Assigned Tasks Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-2xs">
        <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">My Assigned Tasks</h3>
          <Link to="/employee/work" className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline">Full Work Board →</Link>
        </div>
        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => <div key={i} className="h-8 rounded bg-slate-100 dark:bg-slate-800/60 animate-pulse" />)}
          </div>
        ) : (tables.roster || []).length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">No assigned tasks for current sprint.</div>
        ) : (
          <div className="overflow-x-auto rounded-md border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-medium">
                <tr>
                  <th className="py-2.5 px-3">Task Description</th>
                  <th className="py-2.5 px-3">Target Date</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-800 dark:text-slate-200">
                {(tables.roster || []).map((t: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-2.5 px-3 font-medium">{t.task}</td>
                    <td className="py-2.5 px-3 text-slate-500">{t.date}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                        t.status === 'Done' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800' :
                        t.status === 'In Progress' ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border-blue-200' :
                        'bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200'
                      }`}>
                        {t.status}
                      </span>
                    </td>
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
          { label: 'My Work & Tasks', path: '/employee/work', icon: <CheckCircle2 size={16} /> },
          { label: 'My Attendance', path: '/attendance/my', icon: <Clock size={16} /> },
          { label: 'My Leave Balance', path: '/leave/my', icon: <Calendar size={16} /> },
          { label: 'My Documents', path: '/documents/my', icon: <Layers size={16} /> },
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

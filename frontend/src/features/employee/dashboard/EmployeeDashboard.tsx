import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../auth/hooks/useAuth';
import { Role } from '../../../security/roles/roles';
import { MinimalKpiCard } from '../../../components/cards/MinimalKpiCard';
import { KpiGrid } from '../../../components/dashboard/KpiGrid';

import { AnalyticsBarChart, AnalyticsDonutChart, AnalyticsLineChart } from '../../../components/charts/AnalyticsCharts';
import { analyticsApi } from '../../../api/endpoints/analytics.api';
import { Clock, Calendar, DollarSign, Award, RefreshCw, AlertCircle, Link as LinkIcon, Layers } from 'lucide-react';
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
      { name: 'In Progress', value: 4, color: '#3b82f6' },
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

  const firstName = user?.name ? user.name.split(' ')[0] : 'there';

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await analyticsApi.getDashboard('employee');
      if (res) setData(res);
      else setError('Dashboard returned empty data. Showing defaults.');
    } catch (err: any) {
      setError(err?.message || 'Could not load your dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const kpis = data?.kpis || FALLBACK.kpis;
  const charts = data?.charts || FALLBACK.charts;
  const tables = data?.tables || FALLBACK.tables;

  return (
    <div className="employee-dashboard space-y-6 animate-fadeIn font-sans pb-10">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Hi, {firstName} 👋
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {user?.department ? `${user.department} · ` : ''}{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={fetchDashboard} disabled={loading} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50">
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <Link to="/employee/attendance" className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">
            <Clock size={13} /> My Attendance
          </Link>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-sm">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
          <button onClick={fetchDashboard} className="ml-auto text-xs underline underline-offset-2 hover:no-underline">Retry</button>
        </div>
      )}

      {/* KPIs */}
      {/* Enterprise KPI Grid */}
      <KpiGrid
        role={Role.EMPLOYEE}
        loading={loading}
        data={{
          todayStatus: 'On Duty',
          checkInTime: '09:05 AM',
          workHoursToday: `${kpis.hoursLogged || 8.5}h`,
          breakTimeToday: '45m',
          myAttendanceRate: 98,
          availableLeaveBalance: kpis.leaveBalance || 14,
          myPendingRequests: kpis.pendingLeaves || 2,
          currentActivity: 'Active on Sprint Tasks',
        }}
      />


      {/* Charts */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-6">
          <AnalyticsLineChart
            title="My Attendance (This Week)"
            data={charts.myAttendanceTrend || []}
            xKey="day"
            series={[{ key: 'hours', name: 'Hours', color: '#10b981' }]}
          />
          <AnalyticsDonutChart
            title="Task Progress"
            data={charts.taskProgress || []}
          />
          <AnalyticsBarChart
            title="Leave Usage"
            data={charts.leaveUsage || []}
            xKey="type"
            series={[
              { key: 'used', name: 'Used', color: '#f59e0b' },
              { key: 'remaining', name: 'Remaining', color: '#10b981' }
            ]}
          />
          <AnalyticsLineChart
            title="Overtime History"
            data={charts.overtimeHistory || []}
            xKey="month"
            series={[{ key: 'hours', name: 'Hours', color: '#f43f5e' }]}
          />
          <AnalyticsBarChart
            title="Peer Feedback Score"
            data={charts.peerFeedbackScore || []}
            xKey="category"
            series={[{ key: 'score', name: 'Score / 5', color: '#8b5cf6' }]}
          />
          <AnalyticsBarChart
            title="Skill Progression"
            data={charts.skillProgression || []}
            xKey="name"
            series={[{ key: 'level', name: 'Level %', color: '#6366f1' }]}
          />
        </div>
      )}

      {/* My Recent Tasks */}
      <div className="p-5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold">My Recent Tasks</h3>
          <Link to="/employee/tasks" className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline">View all →</Link>
        </div>
        {loading ? (
          <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-9 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />)}</div>
        ) : (tables.roster || []).length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-400">No recent tasks found.</div>
        ) : (
          <div className="overflow-x-auto rounded-md border border-[var(--border-color)]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-b border-[var(--border-color)]">
                <tr>
                  <th className="py-2.5 px-4">Task</th>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]/80">
                {(tables.roster || []).map((task: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-2.5 px-4 font-medium">{task.task || '—'}</td>
                    <td className="py-2.5 px-4 text-slate-500">{task.date || '—'}</td>
                    <td className="py-2.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${task.status === 'Done' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400' : 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800 dark:border-slate-700'}`}>
                        {task.status || 'Done'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'My Profile', path: '/employee/profile', icon: <Award size={16} /> },
          { label: 'Apply Leave', path: '/employee/leave', icon: <Calendar size={16} /> },
          { label: 'Payslips', path: '/employee/payslips', icon: <DollarSign size={16} /> },
          { label: 'Attendance', path: '/employee/attendance', icon: <Clock size={16} /> },
        ].map((a) => (
          <Link key={a.path} to={a.path} className="flex items-center gap-2 p-3.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-emerald-400 dark:hover:border-emerald-600 transition-all group shadow-sm">
            <span className="text-slate-500 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{a.icon}</span>
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{a.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

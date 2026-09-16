import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../auth/hooks/useAuth';
import { MinimalKpiCard } from '../../../components/cards/MinimalKpiCard';
import { AnalyticsBarChart, AnalyticsDonutChart, AnalyticsLineChart } from '../../../components/charts/AnalyticsCharts';
import { analyticsApi } from '../../../api/endpoints/analytics.api';
import { Users, AlertCircle, FileCode, Layers, RefreshCw, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const FALLBACK: any = {
  kpis: { teamSize: 0, present: 0, absent: 0, late: 0, onLeave: 0, pendingLeaveRequests: 0, sprintVelocity: null, blockedTasks: null, codeReviews: null },
  charts: { weeklyAttendance: [], memberStats: [] },
  tables: { teamMembers: [] },
};

export const TeamLeadDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(FALLBACK);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const firstName = user?.name ? user.name.split(' ')[0] : 'Team Lead';

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await analyticsApi.getDashboard('team-lead');
      if (res) setData(res);
      else setError('Dashboard returned empty data. Showing last known state.');
    } catch (err: any) {
      setError(err?.message || 'Failed to load Team Lead dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const kpis = data?.kpis || FALLBACK.kpis;
  const charts = data?.charts || FALLBACK.charts;
  const tables = data?.tables || FALLBACK.tables;

  return (
    <div className="team-lead-dashboard space-y-6 animate-fadeIn font-sans pb-10">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Welcome, {firstName} 👋
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Team Operations · {user?.team || 'Your Team'}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={fetchDashboard} disabled={loading} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50">
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <Link to="/team-lead/tasks" className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">
            <FileCode size={13} /> Tasks
          </Link>
          <Link to="/team-lead/team-members" className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <Users size={13} /> Team
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
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[...Array(8)].map((_, i) => <div key={i} className="h-28 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <MinimalKpiCard title="Squad Size" value={kpis.squadSize ?? 0} icon={<Users size={26} />} iconBgColor="emerald" />
          <MinimalKpiCard title="Checked In" value={kpis.checkedIn ?? 0} icon={<Clock size={26} />} iconBgColor="blue" />
          <MinimalKpiCard title="Absent" value={kpis.absent ?? 0} icon={<AlertCircle size={26} />} iconBgColor="rose" />
          <MinimalKpiCard title="Active Tasks" value={kpis.activeTasks ?? 0} icon={<FileCode size={26} />} iconBgColor="purple" />
          <MinimalKpiCard title="Blocked Tasks" value={kpis.blockedTasks ?? 0} icon={<AlertCircle size={26} />} iconBgColor="amber" />
          <MinimalKpiCard title="Sprint Velocity" value={kpis.sprintVelocity ?? 0} icon={<RefreshCw size={26} />} iconBgColor="emerald" />
          <MinimalKpiCard title="Avg Response" value={kpis.avgResponseTime ?? '0h'} icon={<Clock size={26} />} iconBgColor="blue" />
          <MinimalKpiCard title="Code Reviews" value={kpis.codeReviews ?? 0} icon={<Layers size={26} />} iconBgColor="emerald" />
        </div>
      )}

      {/* Charts */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-6">
          <AnalyticsBarChart
            title="Daily Check-ins"
            data={charts.dailyCheckins || []}
            xKey="day"
            series={[{ key: 'checkedIn', name: 'Checked In', color: '#10b981' }]}
          />
          <AnalyticsDonutChart
            title="Task Status"
            data={charts.taskStatus || []}
          />
          <AnalyticsLineChart
            title="Velocity Trend"
            data={charts.velocityTrend || []}
            xKey="sprint"
            series={[{ key: 'points', name: 'Points', color: '#6366f1' }]}
          />
          <AnalyticsDonutChart
            title="Blockers by Type"
            data={charts.blockersByType || []}
          />
          <AnalyticsBarChart
            title="Leave Calendar"
            data={charts.leaveCalendar || []}
            xKey="week"
            series={[{ key: 'leaves', name: 'Leaves', color: '#f59e0b' }]}
          />
          <AnalyticsBarChart
            title="Workload Distribution"
            data={charts.workloadDistribution || []}
            xKey="name"
            series={[{ key: 'tasks', name: 'Tasks', color: '#8b5cf6' }]}
          />
        </div>
      )}

      {/* Squad Roster Table */}
      <div className="p-5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold">Squad Roster</h3>
          <Link to="/team-lead/team-members" className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline">View all →</Link>
        </div>
        {loading ? (
          <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-9 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />)}</div>
        ) : (tables.roster || []).length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-400">No squad members found.</div>
        ) : (
          <div className="overflow-x-auto rounded-md border border-[var(--border-color)]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-b border-[var(--border-color)]">
                <tr>
                  <th className="py-2.5 px-4">Name</th>
                  <th className="py-2.5 px-4">Role</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Join Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]/80">
                {(tables.roster || []).slice(0, 8).map((m: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-2.5 px-4 font-medium">{m.name || '—'}</td>
                    <td className="py-2.5 px-4 text-slate-500">{m.role || '—'}</td>
                    <td className="py-2.5 px-4">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${m.status === 'Active' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'}`}>{m.status || 'Active'}</span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-500">{m.joinDate ? new Date(m.joinDate).toLocaleDateString() : '—'}</td>
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
          { label: 'Team Members', path: '/team-lead/team-members', icon: <Users size={16} /> },
          { label: 'Attendance', path: '/team-lead/attendance', icon: <Clock size={16} /> },
          { label: 'Task Tracking', path: '/team-lead/tasks', icon: <FileCode size={16} /> },
          { label: 'Feedback', path: '/team-lead/feedback', icon: <Layers size={16} /> },
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

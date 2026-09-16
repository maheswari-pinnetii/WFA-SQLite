import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../auth/hooks/useAuth';
import { MinimalKpiCard } from '../../../components/cards/MinimalKpiCard';
import { AnalyticsBarChart, AnalyticsDonutChart, AnalyticsLineChart } from '../../../components/charts/AnalyticsCharts';
import { analyticsApi } from '../../../api/endpoints/analytics.api';
import { Users, Clock, Briefcase, Layers, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const FALLBACK: any = {
  kpis: { teamSize: 0, presentToday: 0, onLeave: 0, pendingApprovals: 0 },
  charts: { attendanceTrend: [], performanceTrend: [] },
  tables: { teamMembers: [], pendingApprovals: [] },
};

export const ManagerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(FALLBACK);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const firstName = user?.name ? user.name.split(' ')[0] : 'Manager';

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await analyticsApi.getDashboard('manager');
      if (res) setData(res);
      else setError('Dashboard returned empty data. Showing last known state.');
    } catch (err: any) {
      setError(err?.message || 'Failed to load Manager dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const kpis = data?.kpis || FALLBACK.kpis;
  const charts = data?.charts || FALLBACK.charts;
  const tables = data?.tables || FALLBACK.tables;

  return (
    <div className="manager-dashboard space-y-6 animate-fadeIn font-sans pb-10">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Welcome, {firstName} 👋
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Department Overview · {user?.department || 'All Departments'}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={fetchDashboard} disabled={loading} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50">
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <Link to="/manager/approvals" className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">
            <CheckCircle size={13} /> Approvals
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
          <MinimalKpiCard title="Team Size" value={kpis.teamSize ?? 0} icon={<Users size={26} />} iconBgColor="emerald" />
          <MinimalKpiCard title="Present Today" value={kpis.presentToday ?? 0} icon={<Briefcase size={26} />} iconBgColor="blue" />
          <MinimalKpiCard title="On Leave" value={kpis.onLeave ?? 0} icon={<Clock size={26} />} iconBgColor="amber" />
          <MinimalKpiCard title="Open Tasks" value={kpis.openTasks ?? 0} icon={<Layers size={26} />} iconBgColor="purple" />
          <MinimalKpiCard title="Task Completion" value={`${kpis.taskCompletion ?? 0}%`} icon={<CheckCircle size={26} />} iconBgColor="emerald" />
          <MinimalKpiCard title="Overtime Hours" value={kpis.overtimeHours ?? 0} icon={<Clock size={26} />} iconBgColor="rose" />
          <MinimalKpiCard title="Skill Gaps" value={kpis.skillGaps ?? 0} icon={<AlertCircle size={26} />} iconBgColor="amber" />
          <MinimalKpiCard title="Upcoming Reviews" value={kpis.upcomingReviews ?? 0} icon={<RefreshCw size={26} />} iconBgColor="blue" />
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
            title="Team Attendance (Trend)"
            data={charts.teamAttendanceTrend || []}
            xKey="day"
            series={[{ key: 'attendance', name: 'Attendance %', color: '#10b981' }]}
          />
          <AnalyticsDonutChart
            title="Task Burnout"
            data={charts.taskBurnout || []}
          />
          <AnalyticsBarChart
            title="Skill Coverage"
            data={charts.skillCoverage || []}
            xKey="skill"
            series={[{ key: 'level', name: 'Coverage %', color: '#6366f1' }]}
          />
          <AnalyticsLineChart
            title="Overtime Trend"
            data={charts.overtimeByWeek || []}
            xKey="week"
            series={[{ key: 'hours', name: 'Hours', color: '#f43f5e' }]}
          />
          <AnalyticsBarChart
            title="Leave Pipeline"
            data={charts.leavePipeline || []}
            xKey="month"
            series={[
              { key: 'approved', name: 'Approved', color: '#10b981' },
              { key: 'pending', name: 'Pending', color: '#f59e0b' }
            ]}
          />
          <AnalyticsDonutChart
            title="Performance Matrix"
            data={charts.performanceMatrix || []}
          />
        </div>
      )}

      {/* Team Roster Table */}
      <div className="p-5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold">Department Roster</h3>
          <Link to="/manager/team-members" className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline">View all →</Link>
        </div>
        {loading ? (
          <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-9 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />)}</div>
        ) : (tables.roster || []).length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-400">No team members found.</div>
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
          { label: 'My Team', path: '/manager/team', icon: <Users size={16} /> },
          { label: 'Attendance', path: '/manager/attendance', icon: <Clock size={16} /> },
          { label: 'Approvals', path: '/manager/approvals', icon: <CheckCircle size={16} /> },
          { label: 'Analytics', path: '/manager/analytics', icon: <Briefcase size={16} /> },
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

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../auth/hooks/useAuth';
import { MinimalKpiCard } from '../../../components/cards/MinimalKpiCard';
import { AnalyticsBarChart, AnalyticsDonutChart, AnalyticsLineChart } from '../../../components/charts/AnalyticsCharts';
import { analyticsApi } from '../../../api/endpoints/analytics.api';
import { Users, UserPlus, Clock, Briefcase, Layers, RefreshCw, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const FALLBACK: any = {
  kpis: { 
    totalHeadcount: 500, 
    presentToday: 475, 
    onLeaveToday: 20, 
    newHires: 12, 
    turnoverRate: 4.5,
    openReqs: 18,
    trainingCompletion: 85,
    employeeSatisfaction: 4.2
  },
  charts: { 
    hiringTrend: [
      { month: 'May', hires: 8 }, { month: 'Jun', hires: 15 }, { month: 'Jul', hires: 10 },
      { month: 'Aug', hires: 12 }, { month: 'Sep', hires: 18 }
    ],
    retentionRate: [
      { month: 'May', rate: 94 }, { month: 'Jun', rate: 95 }, { month: 'Jul', rate: 96 },
      { month: 'Aug', rate: 95.5 }, { month: 'Sep', rate: 97 }
    ],
    leaveByDept: [
      { name: 'Engineering', value: 45, color: '#3b82f6' },
      { name: 'Sales', value: 25, color: '#10b981' },
      { name: 'Product', value: 15, color: '#f59e0b' }
    ],
    trainingProgress: [
      { name: 'Security', value: 98 },
      { name: 'Compliance', value: 85 },
      { name: 'Diversity', value: 92 }
    ],
    performanceBellCurve: [
      { rating: 'Needs Imp.', count: 25 },
      { rating: 'Meets', count: 350 },
      { rating: 'Exceeds', count: 125 }
    ],
    hrTicketTypes: [
      { name: 'Payroll', value: 40, color: '#10b981' },
      { name: 'Benefits', value: 35, color: '#3b82f6' },
      { name: 'Policies', value: 25, color: '#f59e0b' }
    ]
  },
  tables: { 
    roster: [
      { name: 'Sarah Connor', role: 'HR Business Partner', department: 'HR', status: 'Active', joinDate: '2023-04-10' },
      { name: 'John Doe', role: 'Talent Acquisition', department: 'HR', status: 'Active', joinDate: '2024-02-15' },
      { name: 'Jane Smith', role: 'Compensation Specialist', department: 'HR', status: 'Active', joinDate: '2022-11-05' }
    ]
  },
};

export const HrDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(FALLBACK);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const firstName = user?.name ? user.name.split(' ')[0] : 'HR';

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await analyticsApi.getDashboard('hr');
      if (res) setData(res);
      else setError('Dashboard returned empty data. Showing last known state.');
    } catch (err: any) {
      setError(err?.message || 'Failed to load HR dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const kpis = data?.kpis || FALLBACK.kpis;
  const charts = data?.charts || FALLBACK.charts;
  const tables = data?.tables || FALLBACK.tables;

  return (
    <div className="hr-dashboard space-y-6 animate-fadeIn font-sans pb-10">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Welcome, {firstName} 👋
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">HR Operations · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={fetchDashboard} disabled={loading} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50">
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <Link to="/hr/employees" className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">
            <Users size={13} /> Employees
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
          <MinimalKpiCard title="Total Employees" value={kpis.totalHeadcount ?? 0} icon={<Users size={26} />} iconBgColor="emerald" />
          <MinimalKpiCard title="Present Today" value={kpis.presentToday ?? 0} icon={<Briefcase size={26} />} iconBgColor="blue" />
          <MinimalKpiCard title="On Leave" value={kpis.onLeaveToday ?? 0} icon={<Clock size={26} />} iconBgColor="amber" />
          <MinimalKpiCard title="New Hires" value={kpis.newHires ?? 0} icon={<UserPlus size={26} />} iconBgColor="emerald" />
          <MinimalKpiCard title="Turnover Rate" value={`${kpis.turnoverRate ?? 0}%`} icon={<AlertCircle size={26} />} iconBgColor="rose" />
          <MinimalKpiCard title="Open Reqs" value={kpis.openReqs ?? 0} icon={<Layers size={26} />} iconBgColor="purple" />
          <MinimalKpiCard title="Training Completion" value={`${kpis.trainingCompletion ?? 0}%`} icon={<RefreshCw size={26} />} iconBgColor="blue" />
          <MinimalKpiCard title="Satisfaction" value={`${kpis.employeeSatisfaction ?? 0}/5`} icon={<Users size={26} />} iconBgColor="emerald" />
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
            title="Hiring Trend"
            data={charts.hiringTrend || []}
            xKey="month"
            series={[{ key: 'hires', name: 'Hires', color: '#10b981' }]}
          />
          <AnalyticsLineChart
            title="Retention Rate"
            data={charts.retentionRate || []}
            xKey="month"
            series={[{ key: 'rate', name: 'Rate %', color: '#6366f1' }]}
          />
          <AnalyticsDonutChart
            title="Leave By Dept"
            data={charts.leaveByDept || []}
          />
          <AnalyticsBarChart
            title="Training Progress"
            data={charts.trainingProgress || []}
            xKey="name"
            series={[{ key: 'value', name: 'Progress %', color: '#f59e0b' }]}
          />
          <AnalyticsLineChart
            title="Performance Distribution"
            data={charts.performanceBellCurve || []}
            xKey="rating"
            series={[{ key: 'count', name: 'Employees', color: '#8b5cf6' }]}
          />
          <AnalyticsDonutChart
            title="HR Ticket Types"
            data={charts.hrTicketTypes || []}
          />
        </div>
      )}

      {/* Employee Roster Table */}
      <div className="p-5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold">Employee Roster</h3>
          <Link to="/hr/employees" className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline">View all →</Link>
        </div>
        {loading ? (
          <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-9 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />)}</div>
        ) : (tables.roster || []).length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-400">No employees found.</div>
        ) : (
          <div className="overflow-x-auto rounded-md border border-[var(--border-color)]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-b border-[var(--border-color)]">
                <tr>
                  <th className="py-2.5 px-4">Name</th>
                  <th className="py-2.5 px-4">Role</th>
                  <th className="py-2.5 px-4">Department</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Join Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]/80">
                {(tables.roster || []).slice(0, 5).map((emp: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-2.5 px-4 font-medium">{emp.name || '—'}</td>
                    <td className="py-2.5 px-4">{emp.role || '—'}</td>
                    <td className="py-2.5 px-4 text-slate-500">{emp.department || '—'}</td>
                    <td className="py-2.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${emp.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400' : 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800 dark:border-slate-700'}`}>
                        {emp.status || 'Active'}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-500">{emp.joinDate ? new Date(emp.joinDate).toLocaleDateString() : '—'}</td>
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
          { label: 'Employees', path: '/hr/employees', icon: <Users size={16} /> },
          { label: 'Attendance', path: '/hr/attendance', icon: <Clock size={16} /> },
          { label: 'Leave Management', path: '/hr/leave', icon: <Layers size={16} /> },
          { label: 'HR Reports', path: '/hr/reports', icon: <Briefcase size={16} /> },
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

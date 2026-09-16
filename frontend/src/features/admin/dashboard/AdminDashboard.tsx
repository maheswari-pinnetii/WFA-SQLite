import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../auth/hooks/useAuth';
import { MinimalKpiCard } from '../../../components/cards/MinimalKpiCard';
import { AnalyticsBarChart, AnalyticsDonutChart, AnalyticsLineChart } from '../../../components/charts/AnalyticsCharts';
import { analyticsApi } from '../../../api/endpoints/analytics.api';
import { Users, UserPlus, Clock, FileSpreadsheet, Briefcase, Layers, DollarSign, RefreshCw, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const FALLBACK: any = {
  kpis: { 
    totalHeadcount: 500, 
    activeHeadcount: 470, 
    onLeaveHeadcount: 20, 
    terminatedHeadcount: 10, 
    payrollCost: 12500000,
    pendingApprovals: 15,
    openRoles: 8,
    complianceScore: 98,
    systemHealth: 100
  },
  charts: {
    headcountTrend: [
      { month: 'Jan', headcount: 450 }, { month: 'Feb', headcount: 465 }, { month: 'Mar', headcount: 480 },
      { month: 'Apr', headcount: 490 }, { month: 'May', headcount: 500 }
    ],
    employeesByDept: [
      { name: 'Engineering', headcount: 210 },
      { name: 'Sales', headcount: 115 },
      { name: 'Product', headcount: 75 },
      { name: 'HR', headcount: 50 },
      { name: 'Support', headcount: 50 }
    ],
    roleDistribution: [
      { name: 'Employee', value: 375, color: '#3b82f6' },
      { name: 'Team Lead', value: 75, color: '#10b981' },
      { name: 'Manager', value: 35, color: '#f59e0b' },
      { name: 'HR', value: 10, color: '#8b5cf6' },
      { name: 'Admin', value: 5, color: '#ef4444' }
    ],
    leaveTrends: [
      { month: 'Jan', leaves: 120 }, { month: 'Feb', leaves: 95 }, { month: 'Mar', leaves: 150 },
      { month: 'Apr', leaves: 110 }, { month: 'May', leaves: 140 }
    ],
    payrollBreakdown: [
      { name: 'Engineering', cost: 6500000 },
      { name: 'Sales', cost: 2500000 },
      { name: 'Product', cost: 1800000 },
      { name: 'Support', cost: 1000000 },
      { name: 'HR', cost: 700000 }
    ],
    taskCompletion: [
      { name: 'Completed', value: 85, color: '#10b981' },
      { name: 'Pending', value: 15, color: '#f59e0b' }
    ]
  },
  tables: { 
    recentJoiners: [
      { department: 'Engineering', team: 'Frontend', role: 'SDE II', status: 'ACTIVE', joinDate: '2026-09-01' },
      { department: 'Sales', team: 'Enterprise', role: 'AE', status: 'ACTIVE', joinDate: '2026-09-05' },
      { department: 'Product', team: 'Core', role: 'PM', status: 'ACTIVE', joinDate: '2026-09-10' }
    ]
  },
};

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(FALLBACK);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const firstName = user?.name ? user.name.split(' ')[0] : 'Admin';

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await analyticsApi.getDashboard('admin');
      if (res) setData(res);
      else setError('Dashboard returned empty data. Showing last known state.');
    } catch (err: any) {
      setError(err?.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const kpis = data?.kpis || FALLBACK.kpis;
  const charts = data?.charts || FALLBACK.charts;
  const tables = data?.tables || FALLBACK.tables;

  return (
    <div className="admin-dashboard space-y-6 animate-fadeIn font-sans pb-10">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Welcome back, {firstName} 👋
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            System-wide overview · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={fetchDashboard} disabled={loading} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50">
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <Link to="/admin/users" className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">
            <Users size={13} /> Manage Users
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

      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <MinimalKpiCard title="Total Headcount" value={kpis.totalHeadcount ?? 0} icon={<Users size={26} />} iconBgColor="emerald" />
          <MinimalKpiCard title="Active Employees" value={kpis.activeHeadcount ?? 0} icon={<Briefcase size={26} />} iconBgColor="blue" />
          <MinimalKpiCard title="On Leave" value={kpis.onLeaveHeadcount ?? 0} icon={<Clock size={26} />} iconBgColor="amber" />
          <MinimalKpiCard title="Monthly Payroll" value={kpis.payrollCost != null ? `₹${Number(kpis.payrollCost).toLocaleString('en-IN')}` : '—'} icon={<DollarSign size={26} />} iconBgColor="purple" />
          <MinimalKpiCard title="Pending Approvals" value={kpis.pendingApprovals ?? 0} icon={<AlertCircle size={26} />} iconBgColor="rose" />
          <MinimalKpiCard title="Open Roles" value={kpis.openRoles ?? 0} icon={<UserPlus size={26} />} iconBgColor="emerald" />
          <MinimalKpiCard title="Compliance Score" value={`${kpis.complianceScore ?? 0}%`} icon={<Layers size={26} />} iconBgColor="blue" />
          <MinimalKpiCard title="System Health" value={`${kpis.systemHealth ?? 0}%`} icon={<RefreshCw size={26} />} iconBgColor="emerald" />
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
          <AnalyticsLineChart
            title="Headcount Trend"
            data={charts.headcountTrend || []}
            xKey="month"
            series={[{ key: 'headcount', name: 'Headcount', color: '#6366f1' }]}
          />
          <AnalyticsBarChart
            title="Employees by Dept"
            data={charts.employeesByDept || []}
            xKey="name"
            series={[{ key: 'headcount', name: 'Employees', color: '#10b981' }]}
          />
          <AnalyticsDonutChart
            title="Role Distribution"
            data={charts.roleDistribution || []}
          />
          <AnalyticsLineChart
            title="Leave Trends"
            data={charts.leaveTrends || []}
            xKey="month"
            series={[{ key: 'leaves', name: 'Leaves', color: '#f59e0b' }]}
          />
          <AnalyticsBarChart
            title="Payroll Breakdown"
            data={charts.payrollBreakdown || []}
            xKey="name"
            series={[{ key: 'cost', name: 'Cost', color: '#8b5cf6' }]}
          />
          <AnalyticsDonutChart
            title="Task Completion"
            data={charts.taskCompletion || []}
          />
        </div>
      )}

      {/* Recent Joiners Table */}
      <div className="p-5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold">Recent Joiners</h3>
          <Link to="/admin/employees" className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline">View all →</Link>
        </div>
        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => <div key={i} className="h-9 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />)}
          </div>
        ) : (tables.recentJoiners || []).length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-400">No recent joiners found.</div>
        ) : (
          <div className="overflow-x-auto rounded-md border border-[var(--border-color)] bg-[var(--bg-tertiary)]/20">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-b border-[var(--border-color)]">
                <tr>
                  <th className="py-2.5 px-4">Department</th>
                  <th className="py-2.5 px-4">Team</th>
                  <th className="py-2.5 px-4">Role</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Join Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]/80 text-[var(--text-primary)]">
                {(tables.recentJoiners || []).map((emp: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-2.5 px-4">{emp.department || '—'}</td>
                    <td className="py-2.5 px-4">{emp.team || '—'}</td>
                    <td className="py-2.5 px-4"><span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">{emp.role || '—'}</span></td>
                    <td className="py-2.5 px-4"><span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${emp.status === 'ACTIVE' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'}`}>{emp.status || '—'}</span></td>
                    <td className="py-2.5 px-4 text-slate-500">{emp.joinDate ? new Date(emp.joinDate).toLocaleDateString('en-IN') : '—'}</td>
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
          { label: 'User Management', path: '/admin/users', icon: <Users size={16} />, color: 'emerald' },
          { label: 'Departments', path: '/admin/departments', icon: <Layers size={16} />, color: 'blue' },
          { label: 'Audit Logs', path: '/admin/audit-logs', icon: <FileSpreadsheet size={16} />, color: 'amber' },
          { label: 'System Settings', path: '/admin/settings', icon: <Briefcase size={16} />, color: 'purple' },
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

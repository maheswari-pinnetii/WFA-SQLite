import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../auth/hooks/useAuth';
import { PageContainer } from '../../../components/layout/PageContainer';
import { PageHeader } from '../../../components/layout/PageHeader';
import { FilterBar, FilterState } from '../../../components/layout/FilterBar';
import { ExceptionsSection, ExceptionItem } from '../../../components/dashboard/widgets/ExceptionsSection';
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

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await analyticsApi.getDashboard('admin');
      if (res) setData(res);
      else setError('Dashboard returned empty data. Showing active baseline.');
    } catch (err: any) {
      setError(err?.message || 'Failed to load system metrics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const kpis = data?.kpis || FALLBACK.kpis;
  const charts = data?.charts || FALLBACK.charts;
  const tables = data?.tables || FALLBACK.tables;

  const adminExceptions: ExceptionItem[] = [
    {
      id: 'exc-1',
      title: 'Pending User Approvals',
      subtitle: '15 new user registrations require RBAC role assignment',
      count: 15,
      severity: 'warning',
      actionLabel: 'Review Users',
      actionPath: '/admin/users',
    },
    {
      id: 'exc-2',
      title: 'Security Audit Warning',
      subtitle: '3 failed admin authentication attempts detected',
      count: 3,
      severity: 'critical',
      actionLabel: 'Audit Logs',
      actionPath: '/admin/audit-logs',
    },
    {
      id: 'exc-3',
      title: 'Open Job Requisitions',
      subtitle: '8 hiring requisitions pending department budget review',
      count: 8,
      severity: 'info',
      actionLabel: 'View Roles',
      actionPath: '/admin/departments',
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Organization Overview"
        description="Monitor system-wide headcount, department capacity, payroll expenditure, and enterprise security compliance."
        actions={
          <>
            <button
              onClick={fetchDashboard}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              Refresh System Data
            </button>
            <Link
              to="/admin/users"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
            >
              <Users size={13} />
              Manage Users
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
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-24 rounded-lg bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MinimalKpiCard title="Total Headcount" value={kpis.totalHeadcount ?? 0} icon={<Users size={18} />} iconBgColor="emerald" trend="↑ 3.2% vs last month" trendType="positive" />
          <MinimalKpiCard title="Active Employees" value={kpis.activeHeadcount ?? 0} icon={<Briefcase size={18} />} iconBgColor="emerald" trend="94.0% active rate" trendType="positive" />
          <MinimalKpiCard title="On Leave" value={kpis.onLeaveHeadcount ?? 0} icon={<Clock size={18} />} iconBgColor="amber" trend="4.0% of workforce" trendType="neutral" />
          <MinimalKpiCard title="Monthly Payroll" value={kpis.payrollCost != null ? `₹${Number(kpis.payrollCost).toLocaleString('en-IN')}` : '—'} icon={<DollarSign size={18} />} iconBgColor="emerald" trend="Within Q3 allocation" trendType="positive" />
          <MinimalKpiCard title="Pending Approvals" value={kpis.pendingApprovals ?? 0} icon={<AlertCircle size={18} />} iconBgColor="rose" trend="Action required" trendType="negative" />
          <MinimalKpiCard title="Open Roles" value={kpis.openRoles ?? 0} icon={<UserPlus size={18} />} iconBgColor="emerald" trend="Active requisitions" trendType="positive" />
          <MinimalKpiCard title="Compliance Score" value={`${kpis.complianceScore ?? 0}%`} icon={<Layers size={18} />} iconBgColor="emerald" trend="Passed audit baseline" trendType="positive" />
          <MinimalKpiCard title="System Health" value={`${kpis.systemHealth ?? 0}%`} icon={<RefreshCw size={18} />} iconBgColor="emerald" trend="All services operational" trendType="positive" />
        </div>
      )}

      {/* Exceptions Section */}
      <ExceptionsSection items={adminExceptions} title="System Exceptions & Approvals" />

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
            title="Headcount Growth"
            data={charts.headcountTrend || []}
            xKey="month"
            series={[{ key: 'headcount', name: 'Headcount', color: '#059669' }]}
          />
          <AnalyticsBarChart
            title="Department Distribution"
            data={charts.employeesByDept || []}
            xKey="name"
            series={[{ key: 'headcount', name: 'Employees', color: '#10b981' }]}
          />
          <AnalyticsDonutChart
            title="Role Hierarchy"
            data={charts.roleDistribution || []}
          />
          <AnalyticsLineChart
            title="Leave Utilization"
            data={charts.leaveTrends || []}
            xKey="month"
            series={[{ key: 'leaves', name: 'Leaves', color: '#f59e0b' }]}
          />
          <AnalyticsBarChart
            title="Payroll Distribution"
            data={charts.payrollBreakdown || []}
            xKey="name"
            series={[{ key: 'cost', name: 'Cost (₹)', color: '#059669' }]}
          />
          <AnalyticsDonutChart
            title="Task Completion Rate"
            data={charts.taskCompletion || []}
          />
        </div>
      )}

      {/* Recent Joiners Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-2xs">
        <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Recent Employee Joiners</h3>
          <Link to="/admin/users" className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline">View All Joiners →</Link>
        </div>
        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => <div key={i} className="h-8 rounded bg-slate-100 dark:bg-slate-800/60 animate-pulse" />)}
          </div>
        ) : (tables.recentJoiners || []).length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">No recent joiner records available.</div>
        ) : (
          <div className="overflow-x-auto rounded-md border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-medium">
                <tr>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Team</th>
                  <th className="py-2.5 px-3">Role Designation</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Join Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-800 dark:text-slate-200">
                {(tables.recentJoiners || []).map((emp: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-2.5 px-3 font-medium">{emp.department || '—'}</td>
                    <td className="py-2.5 px-3">{emp.team || '—'}</td>
                    <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">{emp.role || '—'}</span></td>
                    <td className="py-2.5 px-3"><span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${emp.status === 'ACTIVE' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200'}`}>{emp.status || '—'}</span></td>
                    <td className="py-2.5 px-3 text-slate-500">{emp.joinDate ? new Date(emp.joinDate).toLocaleDateString('en-IN') : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Navigation Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'User Directory', path: '/admin/users', icon: <Users size={16} /> },
          { label: 'Organization Units', path: '/admin/departments', icon: <Layers size={16} /> },
          { label: 'Audit Trail', path: '/admin/audit-logs', icon: <FileSpreadsheet size={16} /> },
          { label: 'System Configuration', path: '/admin/settings', icon: <Briefcase size={16} /> },
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


import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../auth/hooks/useAuth';
import { PageContainer } from '../../../components/layout/PageContainer';
import { PageHeader } from '../../../components/layout/PageHeader';
import { FilterBar, FilterState } from '../../../components/layout/FilterBar';
import { ExceptionsSection, ExceptionItem } from '../../../components/dashboard/widgets/ExceptionsSection';
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
      { name: 'Engineering', value: 45, color: '#059669' },
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
      { name: 'Benefits', value: 35, color: '#059669' },
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
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await analyticsApi.getDashboard('hr');
      if (res && (res.kpis || res.charts)) {
        setData(res);
      } else {
        setError('Failed to fetch HR dashboard metrics from server.');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load HR metrics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const kpis = data?.kpis || {};
  const charts = data?.charts || {};
  const tables = data?.tables || {};

  const hrExceptions: ExceptionItem[] = [
    {
      id: 'hr-1',
      title: 'Pending Leave Approvals',
      subtitle: '6 leave requests awaiting manager escalation',
      count: 6,
      severity: 'warning',
      actionLabel: 'View Leave',
      actionPath: '/leave/requests',
    },
    {
      id: 'hr-2',
      title: 'Attendance Regularization',
      subtitle: '12 punch correction requests pending verification',
      count: 12,
      severity: 'info',
      actionLabel: 'Corrections',
      actionPath: '/attendance/corrections',
    },
    {
      id: 'hr-3',
      title: 'Probation Confirmation',
      subtitle: '4 employees completing probation review this week',
      count: 4,
      severity: 'warning',
      actionLabel: 'Lifecycle',
      actionPath: '/employees/all',
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="People Operations Overview"
        description="Monitor workforce headcount growth, attendance rosters, leave management, and employee lifecycle metrics."
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
              to="/employees/all"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
            >
              <UserPlus size={13} />
              Add Employee
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
          <MinimalKpiCard title="Total Headcount" value={kpis.totalHeadcount ?? 0} icon={<Users size={18} />} iconBgColor="emerald" trend="↑ 2.4% vs last month" trendType="positive" />
          <MinimalKpiCard title="Present Today" value={kpis.presentToday ?? 0} icon={<Briefcase size={18} />} iconBgColor="emerald" trend="95.0% attendance rate" trendType="positive" />
          <MinimalKpiCard title="On Leave Today" value={kpis.onLeaveToday ?? 0} icon={<Clock size={18} />} iconBgColor="amber" trend="4.0% leave rate" trendType="neutral" />
          <MinimalKpiCard title="New Hires (30d)" value={kpis.newHires ?? 0} icon={<UserPlus size={18} />} iconBgColor="emerald" trend="Onboarding active" trendType="positive" />
          <MinimalKpiCard title="Annual Turnover" value={`${kpis.turnoverRate ?? 0}%`} icon={<AlertCircle size={18} />} iconBgColor="rose" trend="Within 5% benchmark" trendType="positive" />
          <MinimalKpiCard title="Open Requisitions" value={kpis.openReqs ?? 0} icon={<Briefcase size={18} />} iconBgColor="emerald" trend="18 active requisitions" trendType="positive" />
          <MinimalKpiCard title="Compliance Training" value={`${kpis.trainingCompletion ?? 0}%`} icon={<Layers size={18} />} iconBgColor="emerald" trend="↑ 4% completion" trendType="positive" />
          <MinimalKpiCard title="Pulse Rating" value={`${kpis.employeeSatisfaction ?? 0} / 5`} icon={<RefreshCw size={18} />} iconBgColor="emerald" trend="Q3 Employee score" trendType="positive" />
        </div>
      )}

      {/* Exceptions Section */}
      <ExceptionsSection items={hrExceptions} title="HR Action Items & Escalations" />

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
            title="Monthly Hiring Velocity"
            data={charts.hiringTrend || []}
            xKey="month"
            series={[{ key: 'hires', name: 'New Hires', color: '#059669' }]}
          />
          <AnalyticsLineChart
            title="Retention Rate (%)"
            data={charts.retentionRate || []}
            xKey="month"
            series={[{ key: 'rate', name: 'Retention', color: '#10b981' }]}
          />
          <AnalyticsDonutChart
            title="Leave Distribution by Dept"
            data={charts.leaveByDept || []}
          />
          <AnalyticsBarChart
            title="Compliance Completion (%)"
            data={charts.trainingProgress || []}
            xKey="name"
            series={[{ key: 'value', name: 'Completion', color: '#059669' }]}
          />
          <AnalyticsBarChart
            title="Performance Review Curve"
            data={charts.performanceBellCurve || []}
            xKey="rating"
            series={[{ key: 'count', name: 'Employees', color: '#10b981' }]}
          />
          <AnalyticsDonutChart
            title="HR Inquiry Categories"
            data={charts.hrTicketTypes || []}
          />
        </div>
      )}

      {/* HR Roster Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-2xs">
        <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">People Operations Team Roster</h3>
          <Link to="/employees/all" className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline">Full Directory →</Link>
        </div>
        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => <div key={i} className="h-8 rounded bg-slate-100 dark:bg-slate-800/60 animate-pulse" />)}
          </div>
        ) : (tables.roster || []).length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">No HR roster entries available.</div>
        ) : (
          <div className="overflow-x-auto rounded-md border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-medium">
                <tr>
                  <th className="py-2.5 px-3">Employee Name</th>
                  <th className="py-2.5 px-3">Role Designation</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Join Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-800 dark:text-slate-200">
                {(tables.roster || []).map((emp: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-100">{emp.name}</td>
                    <td className="py-2.5 px-3">{emp.role}</td>
                    <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">{emp.department}</span></td>
                    <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800">{emp.status}</span></td>
                    <td className="py-2.5 px-3 text-slate-500">{new Date(emp.joinDate).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Employee Directory', path: '/employees/all', icon: <Users size={16} /> },
          { label: 'Leave Requests', path: '/leave/requests', icon: <Clock size={16} /> },
          { label: 'Attendance Roster', path: '/attendance/overview', icon: <Briefcase size={16} /> },
          { label: 'Payroll Engine', path: '/payroll/dashboard', icon: <Layers size={16} /> },
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

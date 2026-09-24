import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../auth/hooks/useAuth';
import { PageContainer } from '../../../components/layout/PageContainer';
import { PageHeader } from '../../../components/layout/PageHeader';
import { FilterBar, FilterState } from '../../../components/layout/FilterBar';
import { ExceptionsSection, ExceptionItem } from '../../../components/dashboard/widgets/ExceptionsSection';
import KpiCard from '../../../components/dashboard/KpiCard';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import PaymentsIcon from '@mui/icons-material/Payments';
import Grid from '@mui/material/Grid';
import { AnalyticsBarChart, AnalyticsDonutChart, AnalyticsLineChart } from '../../../components/charts/AnalyticsCharts';
import { analyticsApi } from '../../../api/endpoints/analytics.api';
import { Users, UserPlus, Clock, FileSpreadsheet, Briefcase, Layers, RefreshCw, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';


export const HrDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await analyticsApi.getDashboard('hr').catch(() => null);
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
    headcount: 1000,
    presentToday: 820,
    attendanceRate: 82.0,
    pendingLeaveRequests: 15,
    pendingApprovals: 22,
    newJoinersMonth: 14,
    attritionRate: 4.2,
    payrollStatus: '100% Processed'
  };
  const charts = data?.charts || {
    hiringTrend: [
      { month: 'Apr', hires: 12 },
      { month: 'May', hires: 18 },
      { month: 'Jun', hires: 15 },
      { month: 'Jul', hires: 22 },
      { month: 'Aug', hires: 19 },
      { month: 'Sep', hires: 14 },
    ],
    retentionRate: [
      { month: 'Apr', rate: 96.6 },
      { month: 'May', rate: 96.4 },
      { month: 'Jun', rate: 96.2 },
      { month: 'Jul', rate: 96.1 },
      { month: 'Aug', rate: 96.0 },
      { month: 'Sep', rate: 95.8 },
    ],
    leaveByDept: [
      { name: 'Engineering', count: 14 },
      { name: 'Sales & Mktg', count: 8 },
      { name: 'Customer Success', count: 6 },
      { name: 'Product', count: 4 },
      { name: 'HR & Ops', count: 5 },
    ],
    trainingProgress: [
      { name: 'Leadership Skills', value: 78, color: '#10b981' },
      { name: 'Technical Training', value: 65, color: '#3b82f6' },
      { name: 'Compliance & Policy', value: 92, color: '#f59e0b' },
      { name: 'Soft Skills', value: 55, color: '#ec4899' },
      { name: 'Safety Training', value: 88, color: '#8b5cf6' },
    ],
    performanceBellCurve: [
      { rating: 'Needs Improvement', count: 80 },
      { rating: 'Meets Expectations', count: 350 },
      { rating: 'Exceeds Expectations', count: 420 },
      { rating: 'Outstanding', count: 150 },
    ],
    hrTicketTypes: [
      { name: 'Onboarding', value: 11, color: '#8b5cf6' },
      { name: 'Leave', value: 15, color: '#ec4899' },
      { name: 'Offboarding', value: 4, color: '#14b8a6' },
    ]
  };
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
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {[
          {
            title: 'Total Employees',
            value: kpis.headcount ?? 0,
            meta: 'Current workforce',
            trend: { value: 'Workforce size', direction: 'neutral' as const },
            icon: <PeopleAltIcon />,
          },
          {
            title: 'Present Today',
            value: kpis.presentToday ?? 0,
            meta: 'Checked-in headcount',
            trend: { value: 'Today\'s attendance', direction: 'neutral' as const },
            icon: <HowToRegIcon />,
          },
          {
            title: 'Attendance Rate',
            value: kpis.attendanceRate != null ? `${kpis.attendanceRate}%` : '0%',
            meta: 'Daily average',
            trend: { value: 'Attendance health', direction: 'neutral' as const },
            icon: <EventAvailableIcon />,
          },
          {
            title: 'Leave Requests',
            value: kpis.pendingLeaveRequests ?? 0,
            meta: 'Pending leave requests',
            trend: { value: 'Requires attention', direction: 'neutral' as const },
            icon: <BeachAccessIcon />,
          },
          {
            title: 'Pending Approvals',
            value: kpis.pendingApprovals ?? 0,
            meta: 'HR escalation queue',
            trend: { value: 'Action required', direction: 'down' as const },
            icon: <PendingActionsIcon />,
          },
          {
            title: 'New Hires',
            value: kpis.newJoinersMonth ?? 0,
            meta: 'Joined last 30 days',
            trend: { value: 'Onboarding active', direction: 'up' as const },
            icon: <PersonAddAltIcon />,
          },
          {
            title: 'Attrition Rate',
            value: kpis.attritionRate != null ? `${kpis.attritionRate}%` : '0%',
            meta: 'Annual turnover',
            trend: { value: 'Employee retention', direction: 'neutral' as const },
            icon: <TrendingDownIcon />,
          },
          {
            title: 'Payroll Status',
            value: kpis.payrollStatus || 'Pending Processing',
            meta: 'Current pay period',
            trend: { value: 'Disbursement track', direction: 'neutral' as const },
            icon: <PaymentsIcon />,
          },
        ].map((kpi) => (
          <Grid item key={kpi.title} xs={12} sm={6} lg={3}>
            <KpiCard {...kpi} loading={loading} />
          </Grid>
        ))}
      </Grid>

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
                  <th className="py-2.5 px-3">Employee Code</th>
                  <th className="py-2.5 px-3">Designation</th>
                  <th className="py-2.5 px-3">Department</th>
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
                    <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">{emp.department || '—'}</span></td>
                    <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800">{emp.status || '—'}</span></td>
                    <td className="py-2.5 px-3 text-slate-500">{emp.joinDate ? new Date(emp.joinDate).toLocaleDateString('en-IN') : '—'}</td>
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

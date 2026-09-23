import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../auth/hooks/useAuth';
import { PageContainer } from '../../../components/layout/PageContainer';
import { PageHeader } from '../../../components/layout/PageHeader';
import { FilterBar, FilterState } from '../../../components/layout/FilterBar';
import { LiveCheckInWidget } from '../../../components/attendance/LiveCheckInWidget';
import KpiCard from '../../../components/dashboard/KpiCard';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import SpeedIcon from '@mui/icons-material/Speed';
import AssessmentIcon from '@mui/icons-material/Assessment';
import MoreTimeIcon from '@mui/icons-material/MoreTime';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import Grid from '@mui/material/Grid';
import { AnalyticsBarChart, AnalyticsDonutChart, AnalyticsLineChart } from '../../../components/charts/AnalyticsCharts';
import { analyticsApi } from '../../../api/endpoints/analytics.api';
import {
  Clock,
  Calendar,
  DollarSign,
  AlertCircle,
  FileCheck,
  CheckCircle2,
  FolderOpen,
  Send,
  Receipt,
  Award,
  Layers,
  FileText,
  ShieldCheck,
  HelpCircle,
  BookOpen,
  Bell,
  RefreshCw,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const firstName = user?.name ? user.name.split(' ')[0] : 'Employee';

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await analyticsApi.getDashboard('employee');
      if (res) {
        setData(res);
      } else {
        setError('No employee dashboard data returned from server.');
      }
    } catch (err: any) {
      setError(err?.message || 'Could not load your workspace metrics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const kpis = data?.kpis || {};
  const charts = data?.charts || {};
  const tables = data?.tables || {};

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
        <div className="flex items-center gap-3 p-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs mb-4">
          <AlertCircle size={15} className="shrink-0 text-amber-600 dark:text-amber-400" />
          <span>{error}</span>
          <button onClick={fetchDashboard} className="ml-auto text-xs underline font-medium hover:no-underline">Retry</button>
        </div>
      )}

      {/* Live Punch Check-In / Break / Check-Out Widget */}
      <div className="mb-4">
        <LiveCheckInWidget />
      </div>

      {/* Employment Overview & Shift Widget */}
      {data?.employee && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Employee Badge & Details */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-2xs">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Employment Information</div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-sm border border-emerald-300/40">
                {firstName.charAt(0)}
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">{user?.name || 'Employee Profile'}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{data.employee.designation}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-100 dark:border-slate-800 pt-2.5">
              <div><span className="text-slate-400">Code:</span> <span className="font-mono text-slate-700 dark:text-slate-300">{data.employee.employeeCode}</span></div>
              <div><span className="text-slate-400">Dept:</span> <span className="text-slate-700 dark:text-slate-300">{data.employee.department}</span></div>
              <div><span className="text-slate-400">Location:</span> <span className="text-slate-700 dark:text-slate-300">{data.employee.location}</span></div>
              <div><span className="text-slate-400">Manager:</span> <span className="text-slate-700 dark:text-slate-300">{data.employee.reportingManager}</span></div>
            </div>
          </div>

          {/* Shift & Work Mode */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-2xs">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Shift & Work Mode</div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Current Shift:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{data.shiftInfo?.shiftName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Shift Timing:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono font-medium">{data.shiftInfo?.shiftTiming}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Work Mode:</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800">
                  {data.shiftInfo?.workMode}
                </span>
              </div>
              <div className="border-t border-slate-100 dark:border-slate-800 pt-2 flex justify-between items-center text-[11px]">
                <span className="text-slate-400">Hybrid Compliance:</span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">{data.shiftInfo?.hybridCompliance}</span>
              </div>
            </div>
          </div>

          {/* Lifecycle & Probation Status */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-2xs">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Lifecycle & Probation</div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Probation Status:</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 border border-emerald-300/40">
                  {data.employee?.probationStatus}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Confirmation Date:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{data.employee?.probationCompletionDate}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Notice Period:</span>
                <span className="text-slate-700 dark:text-slate-300">{data.employee?.noticePeriod}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Tax Regime:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">New Tax Regime FY26</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPI Section */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {[
          {
            title: 'Attendance Rate',
            value: kpis.attendance != null ? `${kpis.attendance}%` : '0%',
            meta: 'Current month',
            trend: { value: 'Monthly rate', direction: 'neutral' as const },
            icon: <EventAvailableIcon />,
          },
          {
            title: 'Working Hours',
            value: `${kpis.timeLogs ?? 0}h`,
            meta: 'This pay period',
            trend: { value: 'Logged hours', direction: 'neutral' as const },
            icon: <AccessTimeIcon />,
          },
          {
            title: 'Pending Leaves',
            value: `${kpis.upcomingLeave ?? 0} Days`,
            meta: 'Upcoming PTO',
            trend: { value: 'Leave requests', direction: 'neutral' as const },
            icon: <BeachAccessIcon />,
          },
          {
            title: 'Training Completed',
            value: kpis.training ?? 0,
            meta: 'Current period',
            trend: { value: 'Training progress', direction: 'neutral' as const },
            icon: <TaskAltIcon />,
          },
          {
            title: 'Task Progress',
            value: kpis.taskProgress != null ? `${kpis.taskProgress}%` : '0%',
            meta: 'Sprint milestone',
            trend: { value: 'Sprint completion rate', direction: 'neutral' as const },
            icon: <SpeedIcon />,
          },
          {
            title: 'Performance',
            value: kpis.productivity != null ? `${kpis.productivity}/100` : '0/100',
            meta: 'Appraisal rating',
            trend: { value: 'Productivity score', direction: 'neutral' as const },
            icon: <AssessmentIcon />,
          },
          {
            title: 'Core Hours',
            value: `${kpis.coreHours ?? 0}h`,
            meta: 'This week',
            trend: { value: 'Weekly core hours', direction: 'neutral' as const },
            icon: <MoreTimeIcon />,
          },
          {
            title: 'Open Tickets',
            value: kpis.openTickets ?? 0,
            meta: 'Support & HR requests',
            trend: { value: 'Pending requests', direction: 'neutral' as const },
            icon: <LocalFireDepartmentIcon />,
          },
        ].map((kpi) => (
          <Grid item key={kpi.title} xs={12} sm={6} lg={3}>
            <KpiCard {...kpi} loading={loading} />
          </Grid>
        ))}
      </Grid>

      {/* Critical Action Center */}
      {data?.actionCenter && data.actionCenter.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 mb-4 shadow-2xs">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              <AlertCircle size={15} /> Action Required ({data.actionCenter.length})
            </div>
            <span className="text-[11px] text-slate-400">Personal Tasks & Statutory Deadlines</span>
          </div>
          <div className="space-y-2.5">
            {data.actionCenter.map((item: any) => (
              <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-md bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 dark:text-white">{item.title}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-200/70 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200">
                      {item.category}
                    </span>
                  </div>
                  <div className="text-slate-600 dark:text-slate-300 mt-0.5">{item.description}</div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[11px] text-slate-500 font-mono">Due: {item.dueDate}</span>
                  <Link to={item.actionPath} className="px-3 py-1 rounded text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-colors">
                    {item.actionLabel}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payroll Summary & Policy Compliance Grid */}
      {data?.payrollSummary && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          {/* Payroll Breakdown Card */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-2xs">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                <DollarSign size={15} className="text-emerald-600" /> Current Payroll ({data.payrollSummary.payPeriod})
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200">
                {data.payrollSummary.status}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-3 text-center bg-slate-50 dark:bg-slate-950 p-3 rounded-md border border-slate-100 dark:border-slate-800">
              <div>
                <div className="text-[11px] text-slate-400">Gross Earnings</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white font-mono">{data.payrollSummary.grossEarnings}</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-400">Total Deductions</div>
                <div className="text-sm font-bold text-rose-600 dark:text-rose-400 font-mono">{data.payrollSummary.totalDeductions}</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-400">Net Take Home</div>
                <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">{data.payrollSummary.netPay}</div>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-500">Pay Date: <span className="font-medium text-slate-800 dark:text-slate-200">{data.payrollSummary.payDate}</span></span>
              <div className="flex items-center gap-3">
                <Link to="/employee/payroll/payslips" className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline">View Payslips →</Link>
                <Link to="/employee/payroll/tax" className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline">Tax Profile →</Link>
              </div>
            </div>
          </div>

          {/* Policy Compliance & Upcoming Deadlines */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-2xs">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Upcoming Deadlines</div>
            <div className="space-y-2 text-xs">
              {(data.deadlines || []).map((d: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800/60 last:border-0">
                  <span className="text-slate-700 dark:text-slate-300 truncate max-w-[170px]">{d.title}</span>
                  <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">{d.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Benefits, Documents, Requests & Expenses Grid */}
      {data?.benefitsSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Benefits & Insurance */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-2xs">
            <div className="flex items-center justify-between mb-2 pb-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Benefits & Insurance</span>
              <Link to="/employee/profile" className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline">View All</Link>
            </div>
            <div className="space-y-2 text-xs">
              {(data.benefitsSummary || []).map((b: any, idx: number) => (
                <div key={idx} className="p-2 rounded bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">{b.name}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{b.coverage || b.uan}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Requests Summary */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-2xs">
            <div className="flex items-center justify-between mb-2 pb-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">My Requests</span>
              <Link to="/employee/requests/my" className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline">New Request</Link>
            </div>
            <div className="grid grid-cols-3 gap-1 text-center bg-slate-50 dark:bg-slate-950 p-2 rounded mb-2 text-xs">
              <div><div className="text-[10px] text-slate-400">Open</div><div className="font-bold text-amber-600">{data.requestSummary?.open}</div></div>
              <div><div className="text-[10px] text-slate-400">In Progress</div><div className="font-bold text-blue-600">{data.requestSummary?.inProgress}</div></div>
              <div><div className="text-[10px] text-slate-400">Resolved</div><div className="font-bold text-emerald-600">{data.requestSummary?.resolved}</div></div>
            </div>
            <div className="space-y-1.5 text-xs">
              {(data.requestSummary?.recent || []).map((r: any) => (
                <div key={r.id} className="flex justify-between items-center text-[11px]">
                  <span className="truncate max-w-[140px] text-slate-700 dark:text-slate-300">{r.subject}</span>
                  <span className="font-mono text-[10px] text-slate-500">{r.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Assets & IT Support */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-2xs">
            <div className="flex items-center justify-between mb-2 pb-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Assigned Assets & IT</span>
              <Link to="/employee/profile" className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline">Report Issue</Link>
            </div>
            <div className="space-y-2 text-xs">
              {(data.assetSummary || []).map((a: any) => (
                <div key={a.id} className="p-2 rounded bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">{a.name}</div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">{a.id} · {a.condition}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Profile Completeness & Policy Compliance */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-2xs">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 pb-1 border-b border-slate-100 dark:border-slate-800">
              Profile & Policy Status
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500">Profile Completion:</span>
                  <span className="font-bold text-emerald-600">85%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Policies Acknowledged:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{data.policySummary?.acknowledged} / {data.policySummary?.totalPolicies}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Pending Review:</span>
                  <span className="text-amber-600 font-bold">{data.policySummary?.pending} Policies</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* Assigned Tasks Table & Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-2xs">
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

        {/* Recent Activity Timeline */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-2xs">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
            Recent Activity Log
          </div>
          <div className="space-y-2.5 text-xs">
            {(data?.recentActivity || []).map((act: any, idx: number) => (
              <div key={idx} className="flex gap-2 text-[11px] border-b border-slate-100 dark:border-slate-800/60 pb-2 last:border-0">
                <span className="font-mono text-slate-400 shrink-0">{act.time}</span>
                <div>
                  <div className="text-slate-800 dark:text-slate-200 font-medium">{act.action}</div>
                  <div className="text-slate-400 text-[10px]">{act.date} · {act.category}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Shortcuts & Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'My Work & Tasks', path: '/employee/work', icon: <CheckCircle2 size={16} /> },
          { label: 'My Attendance', path: '/employee/attendance/today', icon: <Clock size={16} /> },
          { label: 'My Leave Balance', path: '/employee/leave/overview', icon: <Calendar size={16} /> },
          { label: 'My Payslips & Tax', path: '/employee/payroll/payslips', icon: <DollarSign size={16} /> },
          { label: 'My Documents', path: '/employee/documents/my', icon: <Layers size={16} /> },
          { label: 'My Requests', path: '/employee/requests/my', icon: <AlertCircle size={16} /> },
          { label: 'My Profile & Bank', path: '/employee/profile/personal', icon: <Award size={16} /> },
          { label: 'Security Center', path: '/employee/security', icon: <RefreshCw size={16} /> }
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

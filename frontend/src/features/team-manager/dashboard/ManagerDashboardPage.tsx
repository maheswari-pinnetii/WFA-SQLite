import React, { useEffect, useState } from 'react';
import { RoleGuard } from '../../../security/guards/RoleGuard';
import { Role } from '../../../security/roles/roles';
import { Permission } from '../../../security/permissions/permissions';
import { KPICard } from '../../../components/cards/KPICard';
import { KpiGrid } from '../../../components/dashboard/KpiGrid';

import { DrillDownModal, DrillDownData } from '../../../shared/components/DrillDownModal';
import { useDashboardData } from '../../../hooks/useDashboardData';
import { ChartGrid } from '../../../components/dashboard/charts';
import { employeeApi } from '../../../api/endpoints/employee.api';
import { workforceApi, Task } from '../../../api/endpoints/workforce.api';
import { Employee } from '../../../shared/types/common.types';
import { Briefcase, Users, CheckCircle2, XCircle, Clock, Zap, Star, FileText, AlertTriangle, ArrowRight, Filter, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EmployeeTable } from '../../../components/tables/EmployeeTable';

export const ManagerDashboardOverview: React.FC = () => (
  <div className="p-6 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
    <div className="flex items-center gap-4">
      <div className="w-11 h-11 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800/80 flex items-center justify-center shrink-0">
        <Briefcase size={22} />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">Department Manager Workspace</h2>
          <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800">ENGINEERING SCOPE</span>
        </div>
        <p className="text-xs text-[var(--text-secondary)] mt-1 font-normal">
          Resource allocation, sub-team sprint velocity, leave approvals & department throughput.
        </p>
      </div>
    </div>
    <div className="flex flex-col items-end gap-2 shrink-0">
      <div className="flex items-center gap-2 flex-wrap">
        <Link to="/manager/approvals" className="btn btn-primary btn-sm flex items-center gap-1.5 shadow-sm">
          <CheckCircle2 size={14} /> Leave Approvals
        </Link>
        <Link to="/manager/analytics" className="btn btn-secondary btn-sm flex items-center gap-1.5">
          <Zap size={14} /> Team Analytics
        </Link>
      </div>
      <div className="flex items-center gap-1.5 flex-wrap text-xs">
        <Link to="/attendance/regularization" className="px-2 py-0.5 rounded bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-emerald-400 font-medium">Regularization</Link>
        <Link to="/leave/requests" className="px-2 py-0.5 rounded bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-emerald-400 font-medium">Leave Requests</Link>
        <Link to="/payroll/payslips" className="px-2 py-0.5 rounded bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-emerald-400 font-medium">My Payroll</Link>
        <Link to="/payroll/revisions" className="px-2 py-0.5 rounded bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-emerald-400 font-medium">Salary Revisions</Link>
        <Link to="/performance/okrs" className="px-2 py-0.5 rounded bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-emerald-400 font-medium">OKRs</Link>
        <Link to="/performance/360-feedback" className="px-2 py-0.5 rounded bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-emerald-400 font-medium">360 Feedback</Link>
        <Link to="/expenses/claims" className="px-2 py-0.5 rounded bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-emerald-400 font-medium">Claims</Link>
      </div>
    </div>
  </div>
);

export const ManagerDashboardFilters: React.FC<{
  dateFilter: string;
  setDateFilter: (val: string) => void;
  teamFilter: string;
  setTeamFilter: (val: string) => void;
  employeeFilter: string;
  setEmployeeFilter: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  employees: Employee[];
  departmentName: string;
}> = (props) => (
  <div className="p-4 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-3">
    <div className="flex items-center gap-2 text-[var(--text-primary)] text-xs font-semibold uppercase tracking-wider">
      <Filter size={15} className="text-emerald-600 dark:text-emerald-400" /> Scoped Department Filters
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <div>
        <label className="text-xs text-[var(--text-muted)] font-medium block mb-1">Date</label>
        <input
          type="date"
          value={props.dateFilter}
          onChange={(e) => props.setDateFilter(e.target.value)}
          className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-normal"
        />
      </div>
      <div>
        <label className="text-xs text-[var(--text-muted)] font-medium block mb-1">Team</label>
        <select
          value={props.teamFilter}
          onChange={(e) => props.setTeamFilter(e.target.value)}
          className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-normal cursor-pointer"
        >
          <option value="All">All Teams</option>
          <option value="Frontend">Frontend</option>
          <option value="Backend">Backend</option>
          <option value="QA">QA</option>
        </select>
      </div>
      <div>
        <label className="text-xs text-[var(--text-muted)] font-medium block mb-1">Employee</label>
        <select
          value={props.employeeFilter}
          onChange={(e) => props.setEmployeeFilter(e.target.value)}
          className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-normal cursor-pointer"
        >
          <option value="All">All Department Employees</option>
          {props.employees.filter(e => e.department === props.departmentName).map(emp => (
            <option key={emp.id} value={emp.id}>{emp.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-xs text-[var(--text-muted)] font-medium block mb-1">Status</label>
        <select
          value={props.statusFilter}
          onChange={(e) => props.setStatusFilter(e.target.value)}
          className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-normal cursor-pointer"
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="On Leave">On Leave</option>
        </select>
      </div>
    </div>
  </div>
);

export const ManagerSprintOverview: React.FC<{ tasks: Task[] }> = ({ tasks }) => (
  <div className="p-5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-4">
    <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
      <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
        <Layers size={16} className="text-emerald-600 dark:text-emerald-400" /> Department Sprint
      </h3>
      <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800">ENGINEERING SPRINT</span>
    </div>
    <div className="overflow-x-auto rounded-md border border-[var(--border-color)] bg-[var(--bg-card)]">
      <table className="w-full text-left text-xs min-w-[800px]">
        <thead className="bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-b border-[var(--border-color)] uppercase font-semibold text-[11px]">
          <tr>
            <th className="py-2.5 px-4">Sprint</th>
            <th className="py-2.5 px-4">Task</th>
            <th className="py-2.5 px-4">Assignee</th>
            <th className="py-2.5 px-4">Priority</th>
            <th className="py-2.5 px-4">Status</th>
            <th className="py-2.5 px-4">Progress</th>
            <th className="py-2.5 px-4">Due Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {tasks.slice(0, 5).map((task) => (
            <tr key={task.id} className="hover:bg-slate-800/40">
              <td className="py-3 px-4 font-bold text-slate-300">Sprint 24B</td>
              <td className="py-3 px-4 text-white font-medium max-w-[200px] truncate">{task.title}</td>
              <td className="py-3 px-4 text-slate-400">{task.assigneeName || 'Unassigned'}</td>
              <td className="py-3 px-4">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  task.priority === 'CRITICAL' || task.priority === 'HIGH' ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-800 text-slate-300'
                }`}>
                  {task.priority}
                </span>
              </td>
              <td className="py-3 px-4 text-slate-300 font-bold uppercase">{task.status}</td>
              <td className="py-3 px-4">
                <div className="w-full bg-slate-800 rounded-full h-1.5 max-w-[100px]">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: task.status === 'COMPLETED' ? '100%' : task.status === 'IN_PROGRESS' ? '50%' : '0%' }}></div>
                </div>
              </td>
              <td className="py-3 px-4 font-mono text-slate-400">2026-09-10</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export const ManagerDashboardPage: React.FC = () => {
  const dashboard = useDashboardData(Role.MANAGER);
  const [drillDownData, setDrillDownData] = useState<DrillDownData | null>(null);
  const [approvals, setApprovals] = useState<Array<{ id: string; employee: string; type: string; duration: string; reason: string; status: 'PENDING' | 'APPROVED' | 'REJECTED' }>>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [dateFilter, setDateFilter] = useState('');
  const [teamFilter, setTeamFilter] = useState('All');
  const [employeeFilter, setEmployeeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const loadApprovals = async () => {
    const requests = await workforceApi.getLeaveRequests();
    setApprovals(requests.map((request) => ({
      id: request.id,
      employee: request.employeeName,
      type: request.type,
      duration: `${request.startDate} - ${request.endDate}`,
      reason: request.reason,
      status: request.status
    })));
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [empData, taskData] = await Promise.all([
          employeeApi.getEmployees({ pageSize: 1000 }).catch(() => []),
          workforceApi.getTasks().catch(() => [])
        ]);
        setEmployees(Array.isArray(empData) ? empData : empData.employees || []);
        setTasks(taskData);
        await loadApprovals().catch(() => setApprovals([]));
      } catch (err) {
        console.error('Error fetching manager dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAction = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await workforceApi.reviewLeaveRequest(id, status);
      await loadApprovals();
    } catch {
      // Fallback
    }
  };

  const openDrillDown = (title: string, value: string | number, subtitle: string, details: { label: string; value: string | number }[]) => {
    setDrillDownData({
      title,
      metricValue: value,
      subtitle,
      category: 'Department Manager Scope',
      details,
    });
  };

  const departmentName = 'Engineering';



  const pendingApprovalsCount = approvals.filter(a => a.status === 'PENDING').length;

  return (
    <>
      <div className="space-y-6 animate-fadeIn font-sans pb-10">
        <ManagerDashboardOverview />

        <ManagerDashboardFilters
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          teamFilter={teamFilter}
          setTeamFilter={setTeamFilter}
          employeeFilter={employeeFilter}
          setEmployeeFilter={setEmployeeFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          employees={employees}
          departmentName={departmentName}
        />

        {/* Enterprise KPI Grid */}
        <KpiGrid
          role={Role.MANAGER}
          loading={loading || dashboard.isLoading}
          data={dashboard.data?.kpis || {}}
        />


        {/* Reusable Enterprise Chart Grid (8 Charts) */}
        <ChartGrid
          role="MANAGER"
          dashboardData={dashboard.data}
          loading={dashboard.isLoading}
          error={dashboard.error ? String(dashboard.error) : null}
          onRetry={dashboard.reload}
        />

        <EmployeeTable
          deptFilter={departmentName}
          teamFilter={teamFilter}
          statusFilter={statusFilter}
        />
        <ManagerSprintOverview tasks={tasks} />

        {/* Leave Requests Approvals Desk */}
        <div className="glass-panel p-6 rounded-2xl border-[var(--border-color)] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Clock size={18} className="text-amber-400" /> Pending Team Leave & Request Approvals Desk
            </h3>
            <Link to="/manager/approvals" className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1">
              Approvals Desk <ArrowRight size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {approvals.length === 0 ? <p className="text-sm text-[var(--text-muted)] md:col-span-3">No leave requests are waiting in your department.</p> : approvals.map((req) => (
              <div key={req.id} className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[var(--text-primary)]">{req.employee}</span>
                  <span className="badge badge-info text-[9px] uppercase font-bold">{req.type}</span>
                </div>
                <p className="text-xs text-slate-300">
                  <span className="font-semibold text-emerald-400">{req.duration}</span> — {req.reason}
                </p>
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-color)]">
                  {req.status === 'PENDING' ? (
                    <>
                      <button
                        onClick={() => void handleAction(req.id, 'APPROVED')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                      >
                        <CheckCircle2 size={14} /> Approve
                      </button>
                      <button
                        onClick={() => void handleAction(req.id, 'REJECTED')}
                        className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 font-bold text-xs flex items-center gap-1.5 transition-all"
                      >
                        <XCircle size={14} /> Reject
                      </button>
                    </>
                  ) : (
                    <span className={`badge ${req.status === 'APPROVED' ? 'badge-success' : 'badge-danger'} text-xs font-bold uppercase`}>
                      {req.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <DrillDownModal isOpen={drillDownData !== null} onClose={() => setDrillDownData(null)} data={drillDownData} />
      </div>
    </>
  );
};

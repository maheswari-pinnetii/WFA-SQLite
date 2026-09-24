import React, { useEffect, useState } from 'react';
import { RoleGuard } from '../../../features/auth/security/guards/RoleGuard';
import { Role } from '../../../features/auth/security/roles/roles';
import { Permission } from '../../../features/auth/security/permissions/permissions';
import { KPICard } from '../../../components/cards/KPICard';
import { KpiGrid } from '../../../components/dashboard/KpiGrid';

import { DrillDownModal, DrillDownData } from '../../../shared/components/DrillDownModal';
import { useDashboardData } from '../../../hooks/useDashboardData';
import { ChartGrid } from '../../../components/dashboard/charts';
import { employeeApi } from '../../../api/endpoints/employee.api';
import { workforceApi, Task } from '../../../api/endpoints/workforce.api';
import { Employee } from '../../../shared/types/common.types';
import { Flame, GitPullRequest, Users, CheckCircle2, Zap, Clock, Star, FileText, AlertTriangle, ArrowRight, Filter, Layers, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EmployeeTable } from '../../../components/tables/EmployeeTable';

export const TeamLeadDashboardOverview: React.FC = () => (
  <div className="p-6 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
    <div className="flex items-center gap-4">
      <div className="w-11 h-11 rounded-lg bg-teal-50 text-teal-600 border border-teal-200 dark:bg-teal-950/50 dark:text-teal-400 dark:border-teal-800/80 flex items-center justify-center shrink-0">
        <GitPullRequest size={22} />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">Team Lead Operational Command</h2>
          <span className="px-2 py-0.5 rounded text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-800">FRONTEND SQUAD</span>
        </div>
        <p className="text-xs text-[var(--text-secondary)] mt-1 font-normal">
          Direct reports tracking, sprint task velocity, daily attendance tracking & developer feedback.
        </p>
      </div>
    </div>
    <div className="flex flex-col items-end gap-2 shrink-0">
      <div className="flex items-center gap-2 flex-wrap">
        <Link to="/team-lead/tasks" className="btn btn-primary btn-sm flex items-center gap-1.5 shadow-sm">
          <Flame size={14} /> Sprint Tasks
        </Link>
        <Link to="/team-lead/members" className="btn btn-secondary btn-sm flex items-center gap-1.5">
          <Users size={14} /> Team Roster
        </Link>
      </div>
      <div className="flex items-center gap-1.5 flex-wrap text-xs">
        <Link to="/attendance/regularization" className="px-2.5 py-1 rounded bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-teal-400 font-medium">Regularization</Link>
        <Link to="/leave/requests" className="px-2.5 py-1 rounded bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-teal-400 font-medium">Leave Requests</Link>
        <Link to="/payroll/payslips" className="px-2.5 py-1 rounded bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-teal-400 font-medium">My Payroll</Link>
        <Link to="/payroll/ctc-calculator" className="px-2.5 py-1 rounded bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-teal-400 font-medium">CTC Calculator</Link>
        <Link to="/payroll/revisions" className="px-2.5 py-1 rounded bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-teal-400 font-medium">Salary Revisions</Link>
        <Link to="/performance/okrs" className="px-2.5 py-1 rounded bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-teal-400 font-medium">OKRs</Link>
        <Link to="/performance/360-feedback" className="px-2.5 py-1 rounded bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-teal-400 font-medium">360 Feedback</Link>
        <Link to="/expenses/claims" className="px-2.5 py-1 rounded bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-teal-400 font-medium">Claims</Link>
      </div>
    </div>
  </div>
);

export const TeamLeadDashboardFilters: React.FC<{
  dateFilter: string;
  setDateFilter: (val: string) => void;
  employeeFilter: string;
  setEmployeeFilter: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  directReports: Employee[];
}> = (props) => (
  <div className="p-4 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-3">
    <div className="flex items-center gap-2 text-[var(--text-primary)] text-xs font-semibold uppercase tracking-wider">
      <Filter size={15} className="text-teal-600 dark:text-teal-400" /> Scoped Team Filters
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <div>
        <label className="text-xs text-[var(--text-muted)] font-medium block mb-1">Date</label>
        <input
          type="date"
          value={props.dateFilter}
          onChange={(e) => props.setDateFilter(e.target.value)}
          className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-500 font-normal"
        />
      </div>
      <div>
        <label className="text-xs text-[var(--text-muted)] font-medium block mb-1">Employee</label>
        <select
          value={props.employeeFilter}
          onChange={(e) => props.setEmployeeFilter(e.target.value)}
          className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-500 font-normal cursor-pointer"
        >
          <option value="All">All Team Members</option>
          {props.directReports.map(emp => (
            <option key={emp.id} value={emp.id}>{emp.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-xs text-[var(--text-muted)] font-medium block mb-1">Status</label>
        <select
          value={props.statusFilter}
          onChange={(e) => props.setStatusFilter(e.target.value)}
          className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-500 font-normal cursor-pointer"
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="On Leave">On Leave</option>
        </select>
      </div>
    </div>
  </div>
);

export const TeamLeadSprintBoard: React.FC<{ sprintTasks: Task[] }> = ({ sprintTasks }) => (
  <div className="p-5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-4">
    <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
      <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
        <Layers size={16} className="text-teal-600 dark:text-teal-400" /> Team Sprint
      </h3>
      <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800">FRONTEND SPRINT</span>
    </div>
    <div className="overflow-x-auto rounded-md border border-[var(--border-color)] bg-[var(--bg-card)]">
      <table className="w-full text-left text-xs min-w-[800px]">
        <thead className="bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-b border-[var(--border-color)] uppercase font-semibold text-[11px]">
          <tr>
            <th className="py-2.5 px-4">Task</th>
            <th className="py-2.5 px-4">Assignee</th>
            <th className="py-2.5 px-4">Priority</th>
            <th className="py-2.5 px-4">Status</th>
            <th className="py-2.5 px-4">Due Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {sprintTasks.slice(0, 6).map((task) => (
            <tr key={task.id} className="hover:bg-slate-800/40">
              <td className="py-3 px-4 text-white font-medium max-w-[250px] truncate">{task.title}</td>
              <td className="py-3 px-4 text-slate-400">{task.assigneeName || 'Unassigned'}</td>
              <td className="py-3 px-4">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  task.priority === 'CRITICAL' || task.priority === 'HIGH' ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-800 text-slate-300'
                }`}>
                  {task.priority}
                </span>
              </td>
              <td className="py-3 px-4 text-slate-300 font-bold uppercase">{task.status}</td>
              <td className="py-3 px-4 font-mono text-slate-400">2026-09-10</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export const TeamLeadDashboardPage: React.FC = () => {
  const dashboard = useDashboardData(Role.TEAM_LEAD);
  const [drillDownData, setDrillDownData] = useState<DrillDownData | null>(null);
  const [directReports, setDirectReports] = useState<Employee[]>([]);
  const [sprintTasks, setSprintTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [dateFilter, setDateFilter] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const teamName = 'Frontend';

  useEffect(() => {
    setLoading(true);
    Promise.all([
      employeeApi.getEmployees({ pageSize: 1000 }).catch(() => []),
      workforceApi.getTasks().catch(() => [])
    ]).then(([employees, tasks]) => {
      const allEmp = Array.isArray(employees) ? employees : employees.employees || [];
      setDirectReports(allEmp.filter((e: Employee) => e.team === teamName));
      setSprintTasks(tasks);
    }).catch((err) => {
      console.error('Error loading team lead data:', err);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  const openDrillDown = (title: string, value: string | number, subtitle: string, details: { label: string; value: string | number }[]) => {
    setDrillDownData({
      title,
      metricValue: value,
      subtitle,
      category: 'Team Lead Scope',
      details,
    });
  };



  return (
    <>
      <div className="space-y-6 animate-fadeIn font-sans pb-10">
        <TeamLeadDashboardOverview />

        <TeamLeadDashboardFilters
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          employeeFilter={employeeFilter}
          setEmployeeFilter={setEmployeeFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          directReports={directReports}
        />

        {/* Enterprise KPI Grid */}
        <KpiGrid
          role={Role.TEAM_LEAD}
          loading={loading || dashboard.isLoading}
          data={dashboard.data?.kpis || {}}
        />


        {/* Reusable Enterprise Chart Grid (8 Charts) */}
        <ChartGrid
          role="TEAM_LEAD"
          dashboardData={dashboard.data}
          loading={dashboard.isLoading}
          error={dashboard.error ? String(dashboard.error) : null}
          onRetry={dashboard.reload}
        />

        <EmployeeTable
          teamFilter={teamName}
          statusFilter={statusFilter}
        />
        <TeamLeadSprintBoard sprintTasks={sprintTasks} />

        <DrillDownModal isOpen={drillDownData !== null} onClose={() => setDrillDownData(null)} data={drillDownData} />
      </div>
    </>
  );
};

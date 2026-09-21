import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../auth/hooks/useAuth';
import { RoleGuard } from '../../../security/guards/RoleGuard';
import { Role } from '../../../security/roles/roles';
import { Permission } from '../../../security/permissions/permissions';
import { DrillDownModal, DrillDownData } from '../../../shared/components/DrillDownModal';
import { MinimalKpiCard } from '../../../components/cards/MinimalKpiCard';
import { KpiGrid } from '../../../components/dashboard/KpiGrid';

import { useDashboardData } from '../../../hooks/useDashboardData';
import { ChartGrid } from '../../../components/dashboard/charts';
import { employeeApi } from '../../../api/endpoints/employee.api';
import { workforceApi, Task } from '../../../api/endpoints/workforce.api';
import { Employee } from '../../../shared/types/common.types';
import { EmployeeTable } from '../../../components/tables/EmployeeTable';
import {
  Users,
  UserPlus,
  Clock,
  FileSpreadsheet,
  Award,
  Calendar,
  CheckCircle2,
  TrendingDown,
  Briefcase,
  ShieldCheck,
  Layers,
  Filter,
  DollarSign
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminDashboardOverview: React.FC<{
  currentDateFormatted: string;
  getGreeting: () => string;
  firstName: string;
  user: any;
}> = ({ currentDateFormatted, getGreeting, firstName, user }) => (
  <div className="bg-[var(--bg-card)] rounded-lg border border-[var(--border-color)] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-sm">
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-muted)]">
        <Calendar size={13} className="text-slate-400" />
        <span>{currentDateFormatted}</span>
        <span>•</span>
        <span className="text-emerald-600 dark:text-emerald-400 font-medium">System Administrator</span>
      </div>
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
        {getGreeting()}, {firstName}
      </h1>
      <p className="text-sm text-[var(--text-secondary)]">
        Workforce analytics, live attendance governance, and enterprise shift oversight.
      </p>
    </div>
    <div className="flex flex-wrap items-center gap-2.5 shrink-0">
      <Link to="/admin/employees" className="btn btn-primary btn-sm flex items-center gap-2">
        <UserPlus size={15} /> Add Employee
      </Link>
      <Link to="/admin/attendance-overview" className="btn btn-secondary btn-sm flex items-center gap-2">
        <Clock size={15} /> View Attendance
      </Link>
      <Link to="/admin/reports" className="btn btn-secondary btn-sm flex items-center gap-2">
        <FileSpreadsheet size={15} /> Generate Report
      </Link>
    </div>
  </div>
);

export const AdminDashboardFilters: React.FC<{
  dateFilter: string;
  setDateFilter: (val: string) => void;
  locationFilter: string;
  setLocationFilter: (val: string) => void;
  deptFilter: string;
  setDeptFilter: (val: string) => void;
  teamFilter: string;
  setTeamFilter: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
}> = (props) => (
  <div className="p-3.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm flex flex-wrap items-center gap-4">
    <div className="flex items-center gap-2 text-[var(--text-primary)] text-xs font-semibold uppercase tracking-wider shrink-0 mr-1">
      <Filter size={14} className="text-emerald-500" /> Executive Analytics Scopes
    </div>
    <div className="flex flex-wrap items-center gap-3 flex-1 min-w-0">
      <div className="flex items-center gap-2 flex-1 min-w-[150px]">
        <label className="text-xs text-[var(--text-muted)] font-medium shrink-0">Date:</label>
        <input
          type="date"
          value={props.dateFilter}
          onChange={(e) => props.setDateFilter(e.target.value)}
          className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs rounded-md px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 font-normal"
        />
      </div>
      <div className="flex items-center gap-2 flex-1 min-w-[150px]">
        <label className="text-xs text-[var(--text-muted)] font-medium shrink-0">Location:</label>
        <select
          value={props.locationFilter}
          onChange={(e) => props.setLocationFilter(e.target.value)}
          className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs rounded-md px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 font-normal cursor-pointer"
        >
          <option value="All">All Locations</option>
          <option value="Bengaluru">Bengaluru</option>
          <option value="Hyderabad">Hyderabad</option>
          <option value="Salem">Salem</option>
        </select>
      </div>
      <div className="flex items-center gap-2 flex-1 min-w-[160px]">
        <label className="text-xs text-[var(--text-muted)] font-medium shrink-0">Department:</label>
        <select
          value={props.deptFilter}
          onChange={(e) => props.setDeptFilter(e.target.value)}
          className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs rounded-md px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 font-normal cursor-pointer"
        >
          <option value="All">All Departments</option>
          <option value="Engineering">Engineering</option>
          <option value="HR">Human Resources</option>
          <option value="Finance">Finance</option>
          <option value="Sales">Sales & Marketing</option>
        </select>
      </div>
      <div className="flex items-center gap-2 flex-1 min-w-[140px]">
        <label className="text-xs text-[var(--text-muted)] font-medium shrink-0">Team:</label>
        <select
          value={props.teamFilter}
          onChange={(e) => props.setTeamFilter(e.target.value)}
          className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs rounded-md px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 font-normal cursor-pointer"
        >
          <option value="All">All Teams</option>
          <option value="Frontend">Frontend Devs</option>
          <option value="Backend">Backend Services</option>
          <option value="QA">Quality Assurance</option>
        </select>
      </div>
      <div className="flex items-center gap-2 flex-1 min-w-[140px]">
        <label className="text-xs text-[var(--text-muted)] font-medium shrink-0">Status:</label>
        <select
          value={props.statusFilter}
          onChange={(e) => props.setStatusFilter(e.target.value)}
          className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs rounded-md px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 font-normal cursor-pointer"
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="On Leave">On Leave</option>
          <option value="Terminated">Terminated</option>
        </select>
      </div>
    </div>
  </div>
);

const calculateTenure = (joinDateStr?: string) => {
  if (!joinDateStr) return 'N/A';
  const joinDate = new Date(joinDateStr);
  const now = new Date();
  if (isNaN(joinDate.getTime()) || joinDate > now) return '0 days';
  
  let years = now.getFullYear() - joinDate.getFullYear();
  let months = now.getMonth() - joinDate.getMonth();
  let days = now.getDate() - joinDate.getDate();
  
  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  
  const parts = [];
  if (years > 0) parts.push(`${years} year${years > 1 ? 's' : ''}`);
  if (months > 0) parts.push(`${months} month${months > 1 ? 's' : ''}`);
  if (days > 0 || parts.length === 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);
  
  return parts.slice(0, 2).join(' ');
};

const formatJoinDate = (dateStr?: string) => {
  if (!dateStr) return 'N/A';
  const dateObj = new Date(dateStr);
  if (isNaN(dateObj.getTime())) return dateStr;
  
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = dateObj.toLocaleString('en-US', { month: 'short' });
  const year = dateObj.getFullYear();
  
  return `${day} ${month} ${year}`;
};

export const AdminSprintOverview: React.FC<{ tasks: Task[] }> = ({ tasks }) => (
  <div className="p-5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-4">
    <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
      <h3 className="text-base font-semibold text-[var(--text-primary)] flex items-center gap-2">
        <Layers size={17} className="text-emerald-500" /> Active Sprint Work
      </h3>
      <span className="badge badge-success text-xs font-medium">ORGANIZATION SPRINT</span>
    </div>
    <div className="overflow-x-auto rounded-md border border-[var(--border-color)] bg-[var(--bg-tertiary)]/20">
      <table className="w-full text-left text-xs min-w-[800px]">
        <thead className="bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-b border-[var(--border-color)] font-semibold text-xs">
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
        <tbody className="divide-y divide-[var(--border-color)]/80 text-xs">
          {tasks.slice(0, 8).map((task) => (
            <tr key={task.id} className="hover:bg-[var(--bg-hover)] transition-colors">
              <td className="py-2.5 px-4 font-medium text-[var(--text-secondary)]">Sprint 24B</td>
              <td className="py-2.5 px-4 text-[var(--text-primary)] font-medium max-w-[200px] truncate">{task.title}</td>
              <td className="py-2.5 px-4 text-[var(--text-muted)]">{task.assigneeName || 'Unassigned'}</td>
              <td className="py-2.5 px-4">
                <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                  task.priority === 'CRITICAL' || task.priority === 'HIGH' ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
                }`}>
                  {task.priority}
                </span>
              </td>
              <td className="py-2.5 px-4">
                <span className="text-[var(--text-primary)] font-medium uppercase text-[11px]">{task.status}</span>
              </td>
              <td className="py-2.5 px-4">
                <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-1.5 max-w-[100px]">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: task.status === 'COMPLETED' ? '100%' : task.status === 'IN_PROGRESS' ? '50%' : '0%' }}></div>
                </div>
              </td>
              <td className="py-2.5 px-4 font-mono text-[var(--text-muted)]">2026-09-10</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const dashboard = useDashboardData(Role.ADMIN);
  const [drillDownData, setDrillDownData] = useState<DrillDownData | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [dateFilter, setDateFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');
  const [teamFilter, setTeamFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

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
      } catch (err) {
        console.error('Error fetching admin dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const openDrillDown = (title: string, value: string | number, subtitle: string, details: { label: string; value: string | number }[]) => {
    const records = employees.map(emp => ({
      id: emp.employeeCode || emp.id,
      name: emp.name,
      role: emp.role,
      department: emp.department || 'N/A',
      metric: `${emp.performanceScore || 0}% Score`,
      status: emp.status
    }));
    
    setDrillDownData({
      title,
      metricValue: value,
      subtitle,
      category: 'Stackly Enterprise Analytics',
      details,
      records
    });
  };

  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const firstName = user?.name ? user.name.split(' ')[0] : 'Admin';

  return (
    <>
      <div className="admin-dashboard space-y-6 animate-fadeIn font-sans pb-10">
        <AdminDashboardOverview
          currentDateFormatted={currentDateFormatted}
          getGreeting={getGreeting}
          firstName={firstName}
          user={user}
        />

        <AdminDashboardFilters
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          locationFilter={locationFilter}
          setLocationFilter={setLocationFilter}
          deptFilter={deptFilter}
          setDeptFilter={setDeptFilter}
          teamFilter={teamFilter}
          setTeamFilter={setTeamFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />

        {/* Executive Needs Attention Operational Alert Banner */}
        <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 flex flex-wrap items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">Executive Attention Required</h4>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                <span className="font-semibold text-amber-600 dark:text-amber-400">12 Pending Approvals</span> • <span className="font-semibold text-rose-500">8 Late Arrivals</span> • <span className="font-semibold text-emerald-600 dark:text-emerald-400">2 Statutory Compliance Actions</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/admin/approvals" className="px-3 py-1.5 rounded-md bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition-colors">
              Review Approvals
            </Link>
          </div>
        </div>

        {/* Enterprise KPI Grid */}
        <KpiGrid
          role={Role.ADMIN}
          loading={loading || dashboard.isLoading}
          data={dashboard.data?.kpis || {}}
        />


        {/* Reusable Enterprise Chart Grid (8 Charts) */}
        <ChartGrid
          role="ADMIN"
          dashboardData={dashboard.data}
          loading={dashboard.isLoading}
          error={dashboard.error ? String(dashboard.error) : null}
          onRetry={dashboard.reload}
        />

        <EmployeeTable
          locationFilter={locationFilter}
          deptFilter={deptFilter}
          teamFilter={teamFilter}
          statusFilter={statusFilter}
        />
        <AdminSprintOverview tasks={tasks} />
        <DrillDownModal isOpen={!!drillDownData} data={drillDownData} onClose={() => setDrillDownData(null)} />
      </div>
    </>
  );
};

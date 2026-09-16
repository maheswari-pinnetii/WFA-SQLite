import React from 'react';
import {
  LayoutDashboard,
  Users,
  Building2,
  Clock,
  TrendingUp,
  BarChart3,
  Sliders,
  Zap,
  User,
  FileText,
  Layers,
  FileSpreadsheet,
  History,
  Briefcase,
  ClipboardList,
  UserCog,
  Network,
  Globe,
  Calendar,
  CalendarDays,
  Timer,
  CheckSquare,
  ShieldAlert,
  Compass,
  Target,
  Map,
  Activity,
  Key,
  ShieldCheck,
  MapPin,
  HelpCircle,
  Award,
  AlertTriangle,
  Star,
  Palmtree,
  Settings,
  Banknote
} from 'lucide-react';
import { Role } from '../../../security/roles/roles';

export interface NavigationItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  path?: string;
  children?: NavigationItem[];
  roles?: Role[];
  permissions?: string[];
  badge?: {
    text: string | number;
    variant: 'emerald' | 'purple' | 'amber' | 'rose' | 'cyan' | 'teal';
  };
  disabled?: boolean;
}

const ALL_ROLES = [Role.ADMIN, Role.HR, Role.MANAGER, Role.TEAM_LEAD, Role.EMPLOYEE];
const LEADERSHIP_ROLES = [Role.ADMIN, Role.HR, Role.MANAGER, Role.TEAM_LEAD];
const HR_ADMIN_ROLES = [Role.ADMIN, Role.HR];

export const MAIN_NAVIGATION: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard size={18} strokeWidth={2} />,
    // We handle the role-based routing dynamically inside the Sidebar component or rely on Outlet,
    // but here we can define the base path or rely on redirect logic.
    // For now, let's keep it abstract or use a relative path that redirects.
    path: '/dashboard', 
    roles: ALL_ROLES
  },
  {
    id: 'people',
    label: 'People',
    icon: <Users size={18} strokeWidth={2} />,
    roles: LEADERSHIP_ROLES,
    children: [
      {
        id: 'people.employees',
        label: 'Employees',
        roles: LEADERSHIP_ROLES,
        children: [
          { id: 'people.employees.all', label: 'All Employees', path: '/employees/all', roles: HR_ADMIN_ROLES },
          { id: 'people.employees.active', label: 'Active Employees', path: '/employees/active', roles: HR_ADMIN_ROLES },
          { id: 'people.employees.new_joiners', label: 'New Joiners', path: '/employees/new-joiners', roles: HR_ADMIN_ROLES },
          { id: 'people.employees.exits', label: 'Exits', path: '/employees/exits', roles: HR_ADMIN_ROLES },
          { id: 'people.employees.import', label: 'Employee Import', path: '/employees/import', roles: [Role.ADMIN] },
          { id: 'people.employees.team', label: 'My Team', path: '/team-members', roles: [Role.MANAGER, Role.TEAM_LEAD] },
        ]
      },
      {
        id: 'people.organization',
        label: 'Organization',
        roles: HR_ADMIN_ROLES,
        children: [
          { id: 'people.org.departments', label: 'Departments', path: '/organization/departments' },
          { id: 'people.org.teams', label: 'Teams', path: '/organization/teams' },
          { id: 'people.org.designations', label: 'Designations', path: '/organization/designations' },
          { id: 'people.org.locations', label: 'Locations', path: '/organization/locations' },
          { id: 'people.org.cost_centers', label: 'Cost Centers', path: '/organization/cost-centers' },
        ]
      },
      {
        id: 'people.lifecycle',
        label: 'Employee Lifecycle',
        roles: HR_ADMIN_ROLES,
        children: [
          { id: 'people.lifecycle.onboarding', label: 'Onboarding', path: '/lifecycle/onboarding' },
          { id: 'people.lifecycle.probation', label: 'Probation', path: '/lifecycle/probation' },
          { id: 'people.lifecycle.confirmation', label: 'Confirmation', path: '/lifecycle/confirmation' },
          { id: 'people.lifecycle.transfers', label: 'Transfers', path: '/lifecycle/transfers' },
          { id: 'people.lifecycle.promotions', label: 'Promotions', path: '/lifecycle/promotions' },
          { id: 'people.lifecycle.exit', label: 'Exit', path: '/lifecycle/exit' },
        ]
      }
    ]
  },
  {
    id: 'attendance',
    label: 'Attendance',
    icon: <Clock size={18} strokeWidth={2} />,
    roles: ALL_ROLES,
    children: [
      { id: 'attendance.overview', label: 'Overview', path: '/attendance/overview', roles: HR_ADMIN_ROLES },
      { id: 'attendance.my', label: 'My Attendance', path: '/attendance/my', roles: ALL_ROLES },
      { id: 'attendance.team', label: 'Team Attendance', path: '/attendance/team', roles: LEADERSHIP_ROLES },
      { id: 'attendance.register', label: 'Attendance Register', path: '/attendance/register', roles: HR_ADMIN_ROLES },
      { id: 'attendance.corrections', label: 'Corrections', path: '/attendance/corrections', roles: ALL_ROLES },
      { id: 'attendance.regularization', label: 'Regularization', path: '/attendance/regularization', roles: ALL_ROLES },
      { id: 'attendance.shifts', label: 'Shifts', path: '/attendance/shifts', roles: ALL_ROLES, badge: { text: '9h', variant: 'emerald' } },
      { id: 'attendance.overtime', label: 'Overtime', path: '/attendance/overtime', roles: LEADERSHIP_ROLES },
    ]
  },
  {
    id: 'leave',
    label: 'Leave',
    icon: <Palmtree size={18} strokeWidth={2} />,
    roles: ALL_ROLES,
    children: [
      { id: 'leave.overview', label: 'Overview', path: '/leave/overview', roles: HR_ADMIN_ROLES },
      { id: 'leave.my', label: 'My Leave', path: '/leave/my', roles: ALL_ROLES },
      { id: 'leave.team', label: 'Team Leave', path: '/leave/team', roles: LEADERSHIP_ROLES },
      { id: 'leave.requests', label: 'Leave Requests', path: '/leave/requests', roles: LEADERSHIP_ROLES },
      { id: 'leave.types', label: 'Leave Types', path: '/leave/types', roles: HR_ADMIN_ROLES },
      { id: 'leave.policies', label: 'Leave Policies', path: '/leave/policies', roles: HR_ADMIN_ROLES },
      { id: 'leave.holiday', label: 'Holiday Calendar', path: '/leave/holiday', roles: ALL_ROLES, badge: { text: '12 Days', variant: 'amber' } },
      { id: 'leave.reports', label: 'Leave Reports', path: '/leave/reports', roles: HR_ADMIN_ROLES },
    ]
  },
  {
    id: 'payroll',
    label: 'Payroll',
    icon: <FileSpreadsheet size={18} strokeWidth={2} />,
    roles: ALL_ROLES,
    children: [
      { id: 'payroll.dashboard', label: 'Dashboard', path: '/payroll/dashboard', roles: LEADERSHIP_ROLES },
      { id: 'payroll.register', label: 'Payroll Register', path: '/payroll/register', roles: HR_ADMIN_ROLES },
      { id: 'payroll.ctc', label: 'CTC Calculator', path: '/payroll/ctc-calculator', roles: ALL_ROLES },
      { id: 'payroll.departments', label: 'Department Payroll', path: '/payroll/departments', roles: LEADERSHIP_ROLES },
      { id: 'payroll.fnf', label: 'Full & Final (F&F)', path: '/payroll/fnf', roles: HR_ADMIN_ROLES },
      { id: 'payroll.revisions', label: 'Salary Revisions', path: '/payroll/revisions', roles: ALL_ROLES },
      { id: 'payroll.payslips', label: 'Payslips', path: '/payroll/payslips', roles: ALL_ROLES },
      { id: 'payroll.tax.declarations', label: 'Tax & Declarations', path: '/payroll/tax-declarations', roles: ALL_ROLES },
      { id: 'payroll.reports', label: 'Payroll Reports', path: '/payroll/reports', roles: HR_ADMIN_ROLES },

    ]
  },
  {
    id: 'performance',
    label: 'Performance',
    icon: <Star size={18} strokeWidth={2} />,
    roles: ALL_ROLES,
    children: [
      { id: 'performance.dashboard', label: 'Dashboard', path: '/performance/dashboard', roles: HR_ADMIN_ROLES },
      { id: 'performance.goals', label: 'Goals', path: '/performance/goals', roles: ALL_ROLES },
      { id: 'performance.okrs', label: 'OKRs', path: '/performance/okrs', roles: ALL_ROLES },
      { id: 'performance.reviews', label: 'Reviews', path: '/performance/reviews', roles: ALL_ROLES },
      { id: 'performance.360', label: '360 Feedback', path: '/performance/360-feedback', roles: ALL_ROLES },
      { id: 'performance.calibration', label: 'Calibration', path: '/performance/calibration', roles: HR_ADMIN_ROLES },
      { id: 'performance.reports', label: 'Performance Reports', path: '/performance/reports', roles: HR_ADMIN_ROLES },
    ]
  },
  {
    id: 'expenses',
    label: 'Expenses',
    icon: <Banknote size={18} strokeWidth={2} />,
    roles: ALL_ROLES,
    children: [
      { id: 'expenses.my', label: 'My Expenses', path: '/expenses/my', roles: ALL_ROLES },
      { id: 'expenses.claims', label: 'Claims', path: '/expenses/claims', roles: ALL_ROLES },
      { id: 'expenses.approvals', label: 'Approvals', path: '/expenses/approvals', roles: LEADERSHIP_ROLES },
      { id: 'expenses.policies', label: 'Policies', path: '/expenses/policies', roles: HR_ADMIN_ROLES },
      { id: 'expenses.reimbursements', label: 'Reimbursements', path: '/expenses/reimbursements', roles: HR_ADMIN_ROLES },
    ]
  },
  {
    id: 'recruitment',
    label: 'Recruitment',
    icon: <Briefcase size={18} strokeWidth={2} />,
    roles: HR_ADMIN_ROLES,
    children: [
      { id: 'recruitment.dashboard', label: 'Dashboard', path: '/recruitment/dashboard' },
      { id: 'recruitment.requisitions', label: 'Job Requisitions', path: '/recruitment/requisitions' },
      {
        id: 'recruitment.candidates',
        label: 'Candidates',
        children: [
          { id: 'recruitment.candidates.all', label: 'All Candidates', path: '/recruitment/candidates/all' },
          { id: 'recruitment.candidates.screening', label: 'Screening', path: '/recruitment/candidates/screening' },
          { id: 'recruitment.candidates.interviews', label: 'Interviews', path: '/recruitment/candidates/interviews' },
          { id: 'recruitment.candidates.offers', label: 'Offers', path: '/recruitment/candidates/offers' },
          { id: 'recruitment.candidates.joined', label: 'Joined', path: '/recruitment/candidates/joined' },
        ]
      },
      { id: 'recruitment.interviews', label: 'Interviews', path: '/recruitment/interviews' },
      { id: 'recruitment.offers', label: 'Offers', path: '/recruitment/offers' },
    ]
  },
  {
    id: 'documents',
    label: 'Documents',
    icon: <FileText size={18} strokeWidth={2} />,
    roles: ALL_ROLES,
    children: [
      { id: 'documents.my', label: 'My Documents', path: '/documents/my', roles: ALL_ROLES },
      { id: 'documents.employee', label: 'Employee Documents', path: '/documents/employee', roles: HR_ADMIN_ROLES },
      { id: 'documents.policies', label: 'Policies', path: '/documents/policies', roles: ALL_ROLES },
      { id: 'documents.expiring', label: 'Expiring Documents', path: '/documents/expiring', roles: HR_ADMIN_ROLES },
    ]
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: <BarChart3 size={18} strokeWidth={2} />,
    roles: LEADERSHIP_ROLES,
    children: [
      { id: 'reports.workforce', label: 'Workforce', path: '/reports/workforce' },
      { id: 'reports.attendance', label: 'Attendance', path: '/reports/attendance' },
      { id: 'reports.leave', label: 'Leave', path: '/reports/leave' },
      { id: 'reports.payroll', label: 'Payroll', path: '/reports/payroll', roles: HR_ADMIN_ROLES },
      { id: 'reports.expenses', label: 'Expenses', path: '/reports/expenses' },
      { id: 'reports.recruitment', label: 'Recruitment', path: '/reports/recruitment', roles: HR_ADMIN_ROLES },
      { id: 'reports.performance', label: 'Performance', path: '/reports/performance' },
    ]
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: <Activity size={18} strokeWidth={2} />,
    roles: LEADERSHIP_ROLES,
    children: [
      { id: 'analytics.workforce', label: 'Workforce', path: '/analytics/workforce' },
      { id: 'analytics.headcount', label: 'Headcount', path: '/analytics/headcount' },
      { id: 'analytics.attrition', label: 'Attrition', path: '/analytics/attrition' },
      { id: 'analytics.attendance', label: 'Attendance', path: '/analytics/attendance' },
      { id: 'analytics.payroll', label: 'Payroll Cost', path: '/analytics/payroll', roles: HR_ADMIN_ROLES },
      { id: 'analytics.productivity', label: 'Productivity', path: '/analytics/productivity' },
    ]
  },
  {
    id: 'administration',
    label: 'Administration',
    icon: <Settings size={18} strokeWidth={2} />,
    roles: [Role.ADMIN],
    children: [
      { id: 'admin.users', label: 'Users', path: '/administration/users' },
      { id: 'admin.roles', label: 'Roles', path: '/administration/roles' },
      { id: 'admin.permissions', label: 'Permissions', path: '/administration/permissions' },
      { id: 'admin.organization', label: 'Organization', path: '/administration/organization' },
      { id: 'admin.features', label: 'Feature Flags', path: '/administration/features' },
      { id: 'admin.audit', label: 'Audit Logs', path: '/administration/audit-logs' },
      { id: 'admin.security', label: 'Security', path: '/administration/security' },
      { id: 'admin.settings', label: 'System Settings', path: '/administration/settings' },
    ]
  }
];

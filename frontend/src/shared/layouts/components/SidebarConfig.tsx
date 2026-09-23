import React from 'react';
import {
  LayoutDashboard,
  Users,
  Building2,
  Clock,
  TrendingUp,
  BarChart3,
  Sliders,
  GraduationCap,
  User,
  FileText,
  Layers,
  FileSpreadsheet,
  History,
  Briefcase,
  ClipboardList,
  UserCheck,
  Calendar,
  CalendarDays,
  CheckSquare,
  Bell,
  Target,
  Activity,
  ShieldCheck,
  MapPin,
  HelpCircle,
  Award,
  Star,
  Settings,
  DollarSign,
  Banknote,
  FolderKanban,
  Code2,
  Globe2,
  Database
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
      { id: 'attendance.roster-planner', label: 'Roster Planner', path: '/manager/roster-planner', roles: LEADERSHIP_ROLES, badge: { text: 'New', variant: 'cyan' } },
      { id: 'attendance.overtime', label: 'Overtime', path: '/attendance/overtime', roles: LEADERSHIP_ROLES },
    ]
  },
  {
    id: 'timesheets',
    label: 'Timesheets',
    icon: <Clock size={18} strokeWidth={2} />,
    roles: ALL_ROLES,
    children: [
      { id: 'timesheets.my', label: 'My Timesheets', path: '/timesheets/my', roles: ALL_ROLES },
      { id: 'timesheets.entry', label: 'Timesheet Entry', path: '/timesheets/entry', roles: ALL_ROLES },
    ]
  },
  {
    id: 'leave',
    label: 'Leave',
    icon: <Calendar size={18} strokeWidth={2} />,
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
      {
        id: 'payroll.salary',
        label: 'Salary Management',
        roles: HR_ADMIN_ROLES,
        children: [
          { id: 'payroll.salary.structures', label: 'Salary Structures', path: '/payroll/salary-structures' },
          { id: 'payroll.salary.components', label: 'Salary Components', path: '/payroll/salary-components' },
          { id: 'payroll.salary.revisions', label: 'Salary Revisions', path: '/payroll/revisions' },
          { id: 'payroll.salary.ctc', label: 'CTC Calculator', path: '/payroll/ctc-calculator' },
        ]
      },
      {
        id: 'payroll.runs',
        label: 'Payroll Runs',
        roles: HR_ADMIN_ROLES,
        children: [
          { id: 'payroll.runs.active', label: 'Active Run', path: '/payroll/runs/active' },
          { id: 'payroll.runs.history', label: 'Run History', path: '/payroll/runs/history' },
          { id: 'payroll.runs.register', label: 'Payroll Register', path: '/payroll/register' },
        ]
      },
      {
        id: 'payroll.compliance',
        label: 'Compliance & Tax',
        roles: ALL_ROLES,
        children: [
          { id: 'payroll.compliance.statutory', label: 'Statutory Settings', path: '/payroll/compliance/statutory', roles: HR_ADMIN_ROLES },
          { id: 'payroll.compliance.tax', label: 'Tax Declarations', path: '/payroll/tax-declarations', roles: ALL_ROLES },
          { id: 'payroll.compliance.ytd', label: 'YTD Summary', path: '/payroll/ytd', roles: ALL_ROLES },
        ]
      },
      { id: 'payroll.fnf', label: 'Full & Final (F&F)', path: '/payroll/fnf', roles: HR_ADMIN_ROLES },
      { id: 'payroll.payslips', label: 'My Payslips', path: '/payroll/payslips', roles: ALL_ROLES },
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

export const EMPLOYEE_NAVIGATION: NavigationItem[] = [
  {
    id: 'emp.dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard size={18} strokeWidth={2} />,
    path: '/employee/dashboard',
    roles: [Role.EMPLOYEE]
  },
  {
    id: 'emp.work',
    label: 'My Work',
    icon: <Briefcase size={18} strokeWidth={2} />,
    roles: [Role.EMPLOYEE],
    children: [
      { id: 'emp.work.tasks', label: 'My Tasks', path: '/employee/work/tasks', roles: [Role.EMPLOYEE] },
      { id: 'emp.work.projects', label: 'My Projects', path: '/employee/work/projects', roles: [Role.EMPLOYEE] },
      { id: 'emp.work.sprints', label: 'My Sprints', path: '/employee/work/sprints', roles: [Role.EMPLOYEE] },
      { id: 'emp.work.logs', label: 'Work Logs', path: '/employee/work/logs', roles: [Role.EMPLOYEE] }
    ]
  },
  {
    id: 'emp.attendance',
    label: 'Attendance',
    icon: <Clock size={18} strokeWidth={2} />,
    roles: [Role.EMPLOYEE],
    children: [
      { id: 'emp.attendance.today', label: "Today's Attendance", path: '/employee/attendance/today', roles: [Role.EMPLOYEE] },
      { id: 'emp.attendance.history', label: 'Attendance History', path: '/employee/attendance/history', roles: [Role.EMPLOYEE] },
      { id: 'emp.attendance.hours', label: 'Work Hours', path: '/employee/attendance/hours', roles: [Role.EMPLOYEE] },
      { id: 'emp.attendance.corrections', label: 'Attendance Corrections', path: '/employee/attendance/corrections', roles: [Role.EMPLOYEE] }
    ]
  },
  {
    id: 'emp.timesheets',
    label: 'Timesheets',
    icon: <Clock size={18} strokeWidth={2} />,
    roles: [Role.EMPLOYEE],
    children: [
      { id: 'emp.timesheets.my', label: 'My Timesheets', path: '/timesheets/my', roles: [Role.EMPLOYEE] },
      { id: 'emp.timesheets.entry', label: 'Timesheet Entry', path: '/timesheets/entry', roles: [Role.EMPLOYEE] },
    ]
  },
  {
    id: 'emp.leave',
    label: 'Leave',
    icon: <Calendar size={18} strokeWidth={2} />,
    roles: [Role.EMPLOYEE],
    children: [
      { id: 'emp.leave.overview', label: 'Leave Overview', path: '/employee/leave/overview', roles: [Role.EMPLOYEE] },
      { id: 'emp.leave.apply', label: 'Apply Leave', path: '/employee/leave/apply', roles: [Role.EMPLOYEE] },
      { id: 'emp.leave.balance', label: 'Leave Balance', path: '/employee/leave/balance', roles: [Role.EMPLOYEE] },
      { id: 'emp.leave.history', label: 'Leave History', path: '/employee/leave/history', roles: [Role.EMPLOYEE] },
      { id: 'emp.leave.policies', label: 'Leave Policies', path: '/employee/leave/policies', roles: [Role.EMPLOYEE] },
      { id: 'emp.leave.holidays', label: 'Holiday Calendar', path: '/employee/holidays', roles: [Role.EMPLOYEE] }
    ]
  },
  {
    id: 'emp.payroll',
    label: 'Payroll',
    icon: <FileSpreadsheet size={18} strokeWidth={2} />,
    roles: [Role.EMPLOYEE],
    children: [
      { id: 'emp.payroll.overview', label: 'Payroll Overview', path: '/employee/payroll/overview', roles: [Role.EMPLOYEE] },
      { id: 'emp.payroll.salary', label: 'Salary Details', path: '/employee/payroll/salary', roles: [Role.EMPLOYEE] },
      { id: 'emp.payroll.payslips', label: 'Payslips', path: '/employee/payroll/payslips', roles: [Role.EMPLOYEE] },
      { id: 'emp.payroll.history', label: 'Payroll History', path: '/employee/payroll/history', roles: [Role.EMPLOYEE] },
      { id: 'emp.payroll.tax', label: 'Tax & Statutory', path: '/employee/payroll/tax', roles: [Role.EMPLOYEE] },
      { id: 'emp.payroll.reimbursements', label: 'Reimbursements', path: '/employee/payroll/reimbursements', roles: [Role.EMPLOYEE] }
    ]
  },
  {
    id: 'emp.benefits',
    label: 'Benefits',
    icon: <Award size={18} strokeWidth={2} />,
    roles: [Role.EMPLOYEE],
    children: [
      { id: 'emp.benefits.overview', label: 'Benefits Overview', path: '/employee/benefits/overview', roles: [Role.EMPLOYEE] },
      { id: 'emp.benefits.health', label: 'Health Benefits', path: '/employee/benefits/health', roles: [Role.EMPLOYEE] },
      { id: 'emp.benefits.insurance', label: 'Insurance', path: '/employee/benefits/insurance', roles: [Role.EMPLOYEE] },
      { id: 'emp.benefits.other', label: 'Other Benefits', path: '/employee/benefits/other', roles: [Role.EMPLOYEE] }
    ]
  },
  {
    id: 'emp.performance',
    label: 'Performance',
    icon: <Star size={18} strokeWidth={2} />,
    roles: [Role.EMPLOYEE],
    children: [
      { id: 'emp.performance.overview', label: 'My Performance', path: '/employee/performance/overview', roles: [Role.EMPLOYEE] },
      { id: 'emp.performance.goals', label: 'Goals', path: '/employee/performance/goals', roles: [Role.EMPLOYEE] },
      { id: 'emp.performance.reviews', label: 'Reviews', path: '/employee/performance/reviews', roles: [Role.EMPLOYEE] },
      { id: 'emp.performance.feedback', label: 'Feedback', path: '/employee/performance/feedback', roles: [Role.EMPLOYEE] }
    ]
  },
  {
    id: 'emp.learning',
    label: 'Learning',
    icon: <GraduationCap size={18} strokeWidth={2} />,
    roles: [Role.EMPLOYEE],
    children: [
      { id: 'emp.learning.training', label: 'Training', path: '/employee/learning/training', roles: [Role.EMPLOYEE] },
      { id: 'emp.learning.courses', label: 'Courses', path: '/employee/learning/courses', roles: [Role.EMPLOYEE] },
      { id: 'emp.learning.certifications', label: 'Certifications', path: '/employee/learning/certifications', roles: [Role.EMPLOYEE] }
    ]
  },
  {
    id: 'emp.documents',
    label: 'Documents',
    icon: <FileText size={18} strokeWidth={2} />,
    roles: [Role.EMPLOYEE],
    children: [
      { id: 'emp.documents.my', label: 'My Documents', path: '/employee/documents/my', roles: [Role.EMPLOYEE] },
      { id: 'emp.documents.company', label: 'Company Documents', path: '/employee/documents/company', roles: [Role.EMPLOYEE] },
      { id: 'emp.documents.policies', label: 'Policy Documents', path: '/employee/documents/policies', roles: [Role.EMPLOYEE] }
    ]
  },
  {
    id: 'emp.requests',
    label: 'Requests',
    icon: <ClipboardList size={18} strokeWidth={2} />,
    roles: [Role.EMPLOYEE],
    children: [
      { id: 'emp.requests.my', label: 'My Requests', path: '/employee/requests/my', roles: [Role.EMPLOYEE] },
      { id: 'emp.requests.new', label: 'New Request', path: '/employee/requests/new', roles: [Role.EMPLOYEE] },
      { id: 'emp.requests.history', label: 'Request History', path: '/employee/requests/history', roles: [Role.EMPLOYEE] }
    ]
  },
  {
    id: 'emp.assets',
    label: 'Assets',
    icon: <Building2 size={18} strokeWidth={2} />,
    roles: [Role.EMPLOYEE],
    children: [
      { id: 'emp.assets.my', label: 'My Assets', path: '/employee/assets/my', roles: [Role.EMPLOYEE] },
      { id: 'emp.assets.requests', label: 'Asset Requests', path: '/employee/assets/requests', roles: [Role.EMPLOYEE] }
    ]
  },
  {
    id: 'emp.expenses',
    label: 'Expenses',
    icon: <Banknote size={18} strokeWidth={2} />,
    roles: [Role.EMPLOYEE],
    children: [
      { id: 'emp.expenses.my', label: 'My Expenses', path: '/employee/expenses/my', roles: [Role.EMPLOYEE] },
      { id: 'emp.expenses.submit', label: 'Submit Expense', path: '/employee/expenses/submit', roles: [Role.EMPLOYEE] },
      { id: 'emp.expenses.history', label: 'Expense History', path: '/employee/expenses/history', roles: [Role.EMPLOYEE] }
    ]
  },
  {
    id: 'emp.analytics',
    label: 'Analytics',
    icon: <Activity size={18} strokeWidth={2} />,
    path: '/employee/analytics',
    roles: [Role.EMPLOYEE]
  },
  {
    id: 'emp.notifications',
    label: 'Notifications',
    icon: <Bell size={18} strokeWidth={2} />,
    path: '/employee/notifications',
    roles: [Role.EMPLOYEE]
  },
  {
    id: 'emp.profile',
    label: 'My Profile',
    icon: <User size={18} strokeWidth={2} />,
    roles: [Role.EMPLOYEE],
    children: [
      { id: 'emp.profile.personal', label: 'Personal Information', path: '/employee/profile/personal', roles: [Role.EMPLOYEE] },
      { id: 'emp.profile.employment', label: 'Employment Information', path: '/employee/profile/employment', roles: [Role.EMPLOYEE] },
      { id: 'emp.profile.emergency', label: 'Emergency Contacts', path: '/employee/profile/emergency-contacts', roles: [Role.EMPLOYEE] },
      { id: 'emp.profile.bank', label: 'Bank Details', path: '/employee/profile/bank', roles: [Role.EMPLOYEE] },
      { id: 'emp.profile.statutory', label: 'Statutory Details', path: '/employee/profile/statutory', roles: [Role.EMPLOYEE] }
    ]
  },
  {
    id: 'emp.security',
    label: 'Security',
    icon: <ShieldCheck size={18} strokeWidth={2} />,
    path: '/employee/security',
    roles: [Role.EMPLOYEE]
  },
  {
    id: 'emp.settings',
    label: 'Settings',
    icon: <Settings size={18} strokeWidth={2} />,
    path: '/employee/settings',
    roles: [Role.EMPLOYEE]
  }
];

export const hasRoleAccess = (item: NavigationItem, userRole: Role): boolean => {
  if (!item.roles || item.roles.length === 0) return true;
  return item.roles.includes(userRole);
};

export const getNavigationForRole = (userRole: Role): NavigationItem[] => {
  if (userRole === Role.EMPLOYEE) {
    return EMPLOYEE_NAVIGATION;
  }

  const filterItems = (items: NavigationItem[]): NavigationItem[] => {
    return items
      .filter((item) => hasRoleAccess(item, userRole))
      .map((item) => {
        if (item.children) {
          return {
            ...item,
            children: filterItems(item.children),
          };
        }
        return item;
      });
  };

  return filterItems(MAIN_NAVIGATION);
};

export const filterNavigationByQuery = (items: NavigationItem[], query: string): NavigationItem[] => {
  if (!query.trim()) return items;
  const q = query.toLowerCase().trim();

  const filterRecursive = (itemList: NavigationItem[]): NavigationItem[] => {
    const matched: NavigationItem[] = [];

    for (const item of itemList) {
      const labelMatches = item.label.toLowerCase().includes(q);
      const childMatches = item.children ? filterRecursive(item.children) : [];

      if (labelMatches || childMatches.length > 0) {
        matched.push({
          ...item,
          children: childMatches.length > 0 ? childMatches : item.children,
        });
      }
    }

    return matched;
  };

  return filterRecursive(items);
};


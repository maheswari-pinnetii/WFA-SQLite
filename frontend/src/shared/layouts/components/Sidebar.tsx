import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../auth/hooks/useAuth';
import { useTheme } from '../../../design-system/theme/theme';
import { ROLE_LABELS, Role } from '../../../security/roles/roles';
import { StacklyLogo } from '../../../components/common/StacklyLogo';
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
  PanelLeftClose,
  LockKeyhole,
  Moon,
  LogOut,
  ChevronDown,
  ChevronRight,
  UserCircle,
  Sun,
  Search,
  X,
  Palmtree,
  Wallet,
  Settings,
  Bell,
  Blocks
} from 'lucide-react';

export interface NavigationItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
  badge?: {
    text: string;
    variant: 'emerald' | 'purple' | 'amber' | 'rose' | 'blue';
  };
  children?: NavigationItem[];
}

export interface NavigationCategory {
  category: string;
  items: NavigationItem[];
}

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (value: boolean | ((prev: boolean) => boolean)) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  onOpenSupport: () => void;
}

const ROLE_ACCENTS: Record<Role, { className: string; shortLabel: string }> = {
  [Role.ADMIN]: { className: '', shortLabel: 'Admin workspace' },
  [Role.HR]: { className: '', shortLabel: 'People operations' },
  [Role.MANAGER]: { className: '', shortLabel: 'Department workspace' },
  [Role.TEAM_LEAD]: { className: '', shortLabel: 'Team workspace' },
  [Role.EMPLOYEE]: { className: '', shortLabel: 'Employee workspace' },
};

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
  onOpenSupport,
}) => {
  const { role } = useAuth();
  const location = useLocation();
  const [navigationQuery, setNavigationQuery] = useState('');
  
  // Track expanded state for drill-down menus
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

  const toggleMenu = (label: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
    if (collapsed) {
      setCollapsed(false);
    }
  };

  // Stackly Enterprise Drill-Down Structure
  const roleCategorizedNavMap: Record<Role, NavigationCategory[]> = {
    [Role.ADMIN]: [
      {
        category: 'Workspace',
        items: [
          { label: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={18} strokeWidth={2} className="text-emerald-400" /> },
        ]
      },
      {
        category: 'Core Modules',
        items: [
          { 
            label: 'People', path: '#people', icon: <Users size={18} strokeWidth={2} className="text-cyan-400" />,
            children: [
              { label: 'Employees', path: '/admin/employees' },
              { label: 'Employee 360', path: '/hr/employees/360' },
              { label: 'Onboarding', path: '/admin/onboarding' },
              { label: 'Documents', path: '/admin/documents' },
              { label: 'Organization Chart', path: '/admin/org-chart' },
              { label: 'Requests', path: '/admin/requests' },
            ]
          },
          { 
            label: 'Attendance', path: '#attendance', icon: <Clock size={18} strokeWidth={2} className="text-emerald-400" />,
            children: [
              { label: 'Overview', path: '/admin/attendance-overview' },
              { label: 'Today', path: '/admin/attendance-today' },
              { label: 'Records', path: '/admin/attendance-records' },
              { label: 'Calendar', path: '/admin/attendance-calendar' },
              { label: 'Corrections', path: '/admin/corrections' },
              { label: 'Shifts', path: '/admin/shifts' },
              { label: 'Geofence & Locations', path: '/admin/geofencing' },
            ]
          },
          { 
            label: 'Leave', path: '#leave', icon: <Palmtree size={18} strokeWidth={2} className="text-emerald-400" />,
            children: [
              { label: 'Overview', path: '/admin/leave-overview' },
              { label: 'Requests', path: '/admin/leave-requests' },
              { label: 'Calendar', path: '/admin/leave-calendar' },
              { label: 'Leave Balances', path: '/admin/leave-balances' },
              { label: 'Holidays', path: '/admin/holidays' },
            ]
          },
          { 
            label: 'Payroll', path: '#payroll', icon: <FileSpreadsheet size={18} strokeWidth={2} className="text-teal-400" />,
            children: [
              { label: 'Dashboard', path: '/admin/payroll/dashboard' },
              { label: 'Payroll Runs', path: '/hr/payroll' },
              { label: 'Salary', path: '/admin/payroll/salary' },
              { label: 'Reimbursements', path: '/admin/payroll/reimbursements' },
              { label: 'Tax & Compliance', path: '/admin/payroll/tax' },
              { label: 'Payslips', path: '/admin/payroll/payslips' },
              { label: 'Reports', path: '/hr/payroll-reports' },
            ]
          },
          { 
            label: 'Expenses', path: '#expenses', icon: <Wallet size={18} strokeWidth={2} className="text-amber-400" />,
            children: [
              { label: 'Dashboard', path: '/admin/expenses/dashboard' },
              { label: 'Claims', path: '/admin/expenses/claims' },
              { label: 'Travel', path: '/admin/expenses/travel' },
              { label: 'Approvals', path: '/admin/expenses/approvals' },
              { label: 'Policies', path: '/admin/expenses/policies' },
            ]
          },
          { 
            label: 'Organization', path: '#organization', icon: <Building2 size={18} strokeWidth={2} className="text-indigo-400" />,
            children: [
              { label: 'Overview', path: '/admin/org-overview' },
              { label: 'Company Profile', path: '/admin/company' },
              { label: 'Departments', path: '/admin/departments' },
              { label: 'Teams', path: '/admin/teams' },
              { label: 'Locations', path: '/admin/locations' },
              { label: 'Positions', path: '/admin/designations' },
            ]
          },
          { 
            label: 'Reports', path: '#reports', icon: <BarChart3 size={18} strokeWidth={2} className="text-emerald-400" />,
            children: [
              { label: 'Overview', path: '/admin/analytics' },
              { label: 'Workforce', path: '/admin/reports/workforce' },
              { label: 'Attendance', path: '/admin/reports/attendance' },
              { label: 'Leave', path: '/admin/reports/leave' },
              { label: 'Payroll', path: '/admin/reports/payroll' },
              { label: 'Compliance', path: '/admin/reports/compliance' },
            ]
          }
        ]
      },
      {
        category: 'Administration',
        items: [
          { 
            label: 'Action Center', path: '#actions', icon: <Zap size={18} strokeWidth={2} className="text-amber-400" />,
            badge: { text: '3 Pending', variant: 'amber' },
            children: [
              { label: 'My Pending Actions', path: '/admin/actions/pending' },
              { label: 'Approvals', path: '/admin/actions/approvals' },
              { label: 'Exceptions', path: '/admin/actions/exceptions' },
            ]
          },
          { label: 'Notifications', path: '/admin/notifications', icon: <Bell size={18} strokeWidth={2} className="text-cyan-400" /> },
          { 
            label: 'Security', path: '#security', icon: <ShieldCheck size={18} strokeWidth={2} className="text-rose-400" />,
            children: [
              { label: 'Overview', path: '/admin/security/overview' },
              { label: 'Audit Logs', path: '/admin/audit-logs' },
              { label: 'Active Sessions', path: '/admin/security/sessions' },
              { label: 'Roles & Permissions', path: '/admin/permissions' },
              { label: 'Access Control', path: '/admin/access-control' },
              { label: 'Users', path: '/admin/users' },
            ]
          },
          { 
            label: 'Settings', path: '#settings', icon: <Settings size={18} strokeWidth={2} className="text-slate-400" />,
            children: [
              { label: 'My Profile', path: '/me/profile' },
              { label: 'System', path: '/admin/settings/system' },
              { label: 'Organization', path: '/admin/settings/org' },
              { label: 'Integrations', path: '/admin/settings/integrations' },
            ]
          }
        ]
      }
    ],

    [Role.HR]: [
      {
        category: 'Workspace',
        items: [
          { label: 'Dashboard', path: '/hr/dashboard', icon: <LayoutDashboard size={18} strokeWidth={2} className="text-emerald-400" /> },
        ]
      },
      {
        category: 'Core Modules',
        items: [
          { 
            label: 'People', path: '#people', icon: <Users size={18} strokeWidth={2} className="text-cyan-400" />,
            children: [
              { label: 'Employees', path: '/hr/employees' },
              { label: 'Employee 360', path: '/hr/employees/360' },
              { label: 'Onboarding', path: '/hr/onboarding' },
              { label: 'Offboarding', path: '/hr/offboarding' },
              { label: 'Documents', path: '/hr/documents' },
              { label: 'Requests', path: '/hr/requests' },
            ]
          },
          { 
            label: 'Attendance', path: '#attendance', icon: <Clock size={18} strokeWidth={2} className="text-emerald-400" />,
            children: [
              { label: 'Overview', path: '/hr/attendance-overview' },
              { label: 'Records', path: '/hr/attendance-records' },
              { label: 'Corrections', path: '/hr/corrections' },
              { label: 'Approvals', path: '/hr/approvals' },
              { label: 'Shifts', path: '/hr/shifts' },
            ]
          },
          { 
            label: 'Leave', path: '#leave', icon: <Palmtree size={18} strokeWidth={2} className="text-emerald-400" />,
            children: [
              { label: 'Overview', path: '/hr/leave-overview' },
              { label: 'Requests', path: '/hr/leaves' },
              { label: 'Calendar', path: '/hr/leave-calendar' },
              { label: 'Balances', path: '/hr/leave-balances' },
              { label: 'Holidays', path: '/employee/holidays' },
            ]
          },
          { 
            label: 'Payroll', path: '#payroll', icon: <FileSpreadsheet size={18} strokeWidth={2} className="text-teal-400" />,
            children: [
              { label: 'Dashboard', path: '/hr/payroll/dashboard' },
              { label: 'Payroll Runs', path: '/hr/payroll' },
              { label: 'Salary', path: '/hr/payroll/salary' },
              { label: 'Reports', path: '/hr/payroll-reports' },
            ]
          },
          { 
            label: 'Reports', path: '#reports', icon: <BarChart3 size={18} strokeWidth={2} className="text-emerald-400" />,
            children: [
              { label: 'Overview', path: '/hr/workforce-analytics' },
              { label: 'Workforce', path: '/hr/reports/workforce' },
              { label: 'Attendance', path: '/hr/reports/attendance' },
              { label: 'Payroll', path: '/hr/reports/payroll' },
            ]
          }
        ]
      },
      {
        category: 'Administration',
        items: [
          { 
            label: 'Action Center', path: '#actions', icon: <Zap size={18} strokeWidth={2} className="text-amber-400" />,
            children: [
              { label: 'Pending Approvals', path: '/hr/actions/approvals' },
              { label: 'Exceptions', path: '/hr/actions/exceptions' },
            ]
          },
          { label: 'Notifications', path: '/hr/notifications', icon: <Bell size={18} strokeWidth={2} className="text-cyan-400" /> },
          { 
            label: 'Settings', path: '#settings', icon: <Settings size={18} strokeWidth={2} className="text-slate-400" />,
            children: [
              { label: 'My Profile', path: '/me/profile' },
              { label: 'My Account', path: '/hr/settings/account' },
              { label: 'Workflow Config', path: '/hr/settings/workflow' },
            ]
          }
        ]
      }
    ],

    [Role.MANAGER]: [
      {
        category: 'Workspace',
        items: [
          { label: 'Dashboard', path: '/manager/dashboard', icon: <LayoutDashboard size={18} strokeWidth={2} className="text-emerald-400" /> },
        ]
      },
      {
        category: 'Team Management',
        items: [
          { 
            label: 'My Team', path: '#team', icon: <Network size={18} strokeWidth={2} className="text-teal-400" />,
            children: [
              { label: 'Team Overview', path: '/manager/team-overview' },
              { label: 'Team Members', path: '/manager/team-members' },
              { label: 'Employee 360', path: '/manager/team/360' },
              { label: 'Team Activity', path: '/manager/team-activity' },
            ]
          },
          { 
            label: 'Attendance', path: '#attendance', icon: <Clock size={18} strokeWidth={2} className="text-emerald-400" />,
            children: [
              { label: 'Team Attendance', path: '/manager/team-attendance' },
              { label: 'Corrections', path: '/manager/corrections' },
              { label: 'Calendar', path: '/manager/team-calendar' },
            ]
          },
          { 
            label: 'Leave', path: '#leave', icon: <Palmtree size={18} strokeWidth={2} className="text-emerald-400" />,
            children: [
              { label: 'Requests', path: '/manager/leave-requests' },
              { label: 'Team Calendar', path: '/manager/leave-calendar' },
              { label: 'History', path: '/manager/leave-history' },
            ]
          },
          { 
            label: 'Work', path: '#work', icon: <Blocks size={18} strokeWidth={2} className="text-indigo-400" />,
            children: [
              { label: 'Workload', path: '/manager/workload' },
              { label: 'Activity', path: '/manager/activity' },
              { label: 'Sprint Work', path: '/manager/sprint' },
            ]
          },
          { 
            label: 'Reports', path: '#reports', icon: <BarChart3 size={18} strokeWidth={2} className="text-rose-400" />,
            children: [
              { label: 'Analytics Overview', path: '/manager/analytics' },
              { label: 'Team Productivity', path: '/manager/productivity' },
            ]
          }
        ]
      },
      {
        category: 'Action Items',
        items: [
          { label: 'Action Center', path: '/manager/actions', icon: <Zap size={18} strokeWidth={2} className="text-amber-400" />, badge: { text: '2', variant: 'amber' } },
          { label: 'Notifications', path: '/manager/notifications', icon: <Bell size={18} strokeWidth={2} className="text-cyan-400" /> },
          { 
            label: 'Settings', path: '#settings', icon: <Settings size={18} strokeWidth={2} className="text-slate-400" />,
            children: [
              { label: 'My Profile', path: '/me/profile' },
              { label: 'Manager Settings', path: '/manager/settings' }
            ]
          },
        ]
      }
    ],

    [Role.TEAM_LEAD]: [
      {
        category: 'Workspace',
        items: [
          { label: 'Dashboard', path: '/team-lead/dashboard', icon: <LayoutDashboard size={18} strokeWidth={2} className="text-emerald-400" /> },
        ]
      },
      {
        category: 'Team Management',
        items: [
          { 
            label: 'My Team', path: '#team', icon: <Network size={18} strokeWidth={2} className="text-teal-400" />,
            children: [
              { label: 'Team Members', path: '/team-lead/team-members' },
              { label: 'Availability', path: '/team-lead/team-availability' },
              { label: 'Team Calendar', path: '/team-lead/calendar' },
            ]
          },
          { 
            label: 'Attendance', path: '#attendance', icon: <Clock size={18} strokeWidth={2} className="text-emerald-400" />,
            children: [
              { label: 'Today', path: '/team-lead/attendance-today' },
              { label: 'Corrections', path: '/team-lead/corrections' },
              { label: 'History', path: '/team-lead/attendance-history' },
            ]
          },
          { 
            label: 'Leave', path: '#leave', icon: <Palmtree size={18} strokeWidth={2} className="text-emerald-400" />,
            children: [
              { label: 'Requests', path: '/team-lead/leave-requests' },
              { label: 'Calendar', path: '/team-lead/leave-calendar' },
            ]
          },
        ]
      },
      {
        category: 'Action Items',
        items: [
          { label: 'Action Center', path: '/team-lead/actions', icon: <Zap size={18} strokeWidth={2} className="text-amber-400" /> },
          { label: 'Notifications', path: '/team-lead/notifications', icon: <Bell size={18} strokeWidth={2} className="text-cyan-400" /> },
          { 
            label: 'Settings', path: '#settings', icon: <Settings size={18} strokeWidth={2} className="text-slate-400" />,
            children: [
              { label: 'My Profile', path: '/me/profile' },
              { label: 'Team Lead Settings', path: '/team-lead/settings' }
            ]
          },
        ]
      }
    ],

    [Role.EMPLOYEE]: [
      {
        category: 'Workspace',
        items: [
          { label: 'My Workday', path: '/employee/dashboard', icon: <LayoutDashboard size={18} strokeWidth={2} className="text-emerald-400" /> },
        ]
      },
      {
        category: 'My Actions',
        items: [
          { 
            label: 'Attendance', path: '#attendance', icon: <Clock size={18} strokeWidth={2} className="text-emerald-400" />,
            children: [
              { label: 'Today', path: '/employee/attendance' },
              { label: 'Calendar', path: '/employee/attendance-calendar' },
              { label: 'Punch Corrections', path: '/employee/corrections' },
            ]
          },
          { 
            label: 'Leave', path: '#leave', icon: <Palmtree size={18} strokeWidth={2} className="text-emerald-400" />,
            children: [
              { label: 'My Leave', path: '/employee/leave' },
              { label: 'Apply Leave', path: '/employee/leave-apply' },
              { label: 'Leave Balance', path: '/employee/leave-balance' },
              { label: 'Public Holidays', path: '/employee/holidays' },
            ]
          },
          { 
            label: 'Payroll', path: '#payroll', icon: <FileSpreadsheet size={18} strokeWidth={2} className="text-teal-400" />,
            children: [
              { label: 'My Payslips', path: '/employee/payslips' },
              { label: 'Salary Structure', path: '/employee/salary' },
              { label: 'Tax & Declarations', path: '/employee/tax' },
            ]
          },
          { 
            label: 'Expenses', path: '#expenses', icon: <Wallet size={18} strokeWidth={2} className="text-amber-400" />,
            children: [
              { label: 'My Claims', path: '/employee/claims' },
              { label: 'New Claim', path: '/employee/claims/new' },
              { label: 'History', path: '/employee/claims/history' },
            ]
          },
          { label: 'Documents', path: '/employee/documents', icon: <FileText size={18} strokeWidth={2} className="text-blue-400" /> },
          { label: 'My Requests', path: '/employee/requests', icon: <ClipboardList size={18} strokeWidth={2} className="text-cyan-400" /> },
        ]
      },
      {
        category: 'System',
        items: [
          { label: 'Notifications', path: '/employee/notifications', icon: <Bell size={18} strokeWidth={2} className="text-amber-400" /> },
          { 
            label: 'Settings', path: '#settings', icon: <Settings size={18} strokeWidth={2} className="text-slate-400" />,
            children: [
              { label: 'My Profile', path: '/me/profile' },
              { label: 'Account', path: '/employee/account' },
              { label: 'Security', path: '/employee/security' },
            ]
          }
        ]
      }
    ],
  };

  const { theme, toggleTheme } = useTheme();
  const activeRole = role as Role;
  const currentCategories = roleCategorizedNavMap[activeRole] || roleCategorizedNavMap[Role.EMPLOYEE];
  const roleAccent = ROLE_ACCENTS[activeRole] || ROLE_ACCENTS[Role.EMPLOYEE];
  const roleLabel = ROLE_LABELS[activeRole] || ROLE_LABELS[Role.EMPLOYEE];
  const isDark = theme === 'dark';

  const visibleCategories = (() => {
    const query = navigationQuery.trim().toLowerCase();
    if (!query) return currentCategories;

    return currentCategories
      .map((category) => {
        const filteredItems = category.items.map(item => {
          if (item.children) {
            const filteredChildren = item.children.filter(child => 
              child.label.toLowerCase().includes(query)
            );
            if (filteredChildren.length > 0 || item.label.toLowerCase().includes(query)) {
              return { ...item, children: filteredChildren.length > 0 ? filteredChildren : item.children };
            }
            return null;
          }
          return item.label.toLowerCase().includes(query) ? item : null;
        }).filter(Boolean) as NavigationItem[];

        return {
          ...category,
          items: filteredItems,
        };
      })
      .filter((category) => category.items.length > 0);
  })();

  const getBadgeStyle = (variant: string) => {
    return isDark ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-emerald-50 text-emerald-600 border-emerald-200';
  };

  return (
    <>
      {/* Mobile Off-Canvas Drawer Overlay Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          aria-label="Close Off-Canvas Drawer"
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-30 md:hidden transition-opacity"
        />
      )}

      {/* Role-aware workspace navigation */}
      <aside
        aria-label="Primary navigation"
        className={`app-sidebar ${roleAccent.className} border-r flex flex-col shrink-0 fixed md:sticky left-0 z-30 transition-all duration-300 ease-in-out font-sans ${
          collapsed ? 'sidebar-is-collapsed w-[76px]' : 'sidebar-is-expanded w-[280px]'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Sidebar Navigation Items List */}
        <nav className="sidebar-nav sidebar-nav-scroll flex-1 overflow-y-auto w-full scrollbar-thin pt-4 px-3 space-y-1 pb-20">
          {visibleCategories.map((cat: NavigationCategory, groupIdx: number) => {
            return (
              <div key={groupIdx} className="mb-6">
                {/* Section Header Title */}
                {!collapsed && cat.category && (
                  <div className="px-3 mb-2 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {cat.category}
                  </div>
                )}

                {/* Clean Navigation Links */}
                <div className="space-y-1">
                  {cat.items.map((item: NavigationItem) => {
                    const hasChildren = !!item.children && item.children.length > 0;
                    const isExpanded = expandedMenus[item.label] || false;
                    
                    const active = item.path !== '#support' && !item.path.startsWith('#') && (
                      location.pathname === item.path || location.pathname.startsWith(`${item.path}/`)
                    );
                    
                    const hasActiveChild = hasChildren && item.children?.some(child => 
                      location.pathname === child.path || location.pathname.startsWith(`${child.path}/`)
                    );

                    const isParentActive = active || hasActiveChild;

                    return (
                      <div key={item.label} className="w-full">
                        <Link
                          to={hasChildren ? '#' : item.path}
                          onClick={(event) => {
                            if (item.path === '#support') {
                              event.preventDefault();
                              onOpenSupport();
                              setMobileOpen(false);
                            } else if (hasChildren) {
                              event.preventDefault();
                              toggleMenu(item.label);
                            } else {
                              setMobileOpen(false);
                            }
                          }}
                          title={collapsed ? item.label : undefined}
                          aria-current={active ? 'page' : undefined}
                          className={`flex items-center gap-3 transition-all duration-200 group relative no-underline px-3 py-2 rounded-lg font-medium text-sm
                            ${isParentActive
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 font-semibold'
                              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            } ${collapsed ? 'justify-center' : ''}`}
                        >
                          {item.icon && (
                            <span className={`shrink-0 flex items-center justify-center ${
                              isParentActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'
                            }`}>
                              {item.icon}
                            </span>
                          )}

                          {!collapsed && (
                            <>
                              <span className="truncate flex-1 min-w-0">
                                {item.label}
                              </span>
                              {hasChildren && (
                                <span className="shrink-0 text-slate-400">
                                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                </span>
                              )}
                            </>
                          )}

                          {/* Unread Badge Counter */}
                          {!collapsed && item.badge && !hasChildren && (
                            <span
                              className={`px-1.5 py-0.5 text-xs font-medium rounded border ml-auto shrink-0 ${getBadgeStyle(
                                item.badge.variant
                              )}`}
                            >
                              {item.badge.text}
                            </span>
                          )}

                          {/* Collapsed Hover Tooltip */}
                          {collapsed && (
                            <span className="sidebar-tooltip absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none z-50 whitespace-nowrap transition-opacity">
                              {item.label}
                              {hasChildren && <span className="ml-2 opacity-50">›</span>}
                            </span>
                          )}
                        </Link>

                        {/* Nested Children Rendering */}
                        {hasChildren && isExpanded && !collapsed && (
                          <div className="mt-1 ml-4 pl-4 border-l border-slate-200 dark:border-slate-800 flex flex-col space-y-1">
                            {item.children?.map((child) => {
                              const isChildActive = location.pathname === child.path || location.pathname.startsWith(`${child.path}/`);
                              return (
                                <Link
                                  key={child.label}
                                  to={child.path}
                                  onClick={() => setMobileOpen(false)}
                                  className={`flex items-center px-3 py-1.5 text-sm rounded-md transition-colors ${
                                    isChildActive
                                      ? 'text-emerald-600 font-medium dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-500/10'
                                      : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                  }`}
                                >
                                  {child.label}
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {visibleCategories.length === 0 && (
            <p className="px-3 py-6 text-center text-xs font-semibold text-slate-500">
              No navigation items found.
            </p>
          )}
        </nav>

        {/* Footer Area */}
        <div className={`p-4 border-t bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 flex items-center justify-between transition-all ${collapsed ? 'flex-col gap-2' : ''}`}>
            <button
              type="button"
              className={`flex items-center justify-center p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors ${collapsed ? 'w-full' : ''}`}
              onClick={toggleTheme}
              title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            
            <button
              type="button"
              className={`flex items-center justify-center p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors ${collapsed ? 'w-full' : ''}`}
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              <PanelLeftClose size={18} className={collapsed ? 'rotate-180 transition-transform' : 'transition-transform'} />
            </button>
        </div>
      </aside>
    </>
  );
};

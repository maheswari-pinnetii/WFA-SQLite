import React, { ReactNode } from 'react';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import PaymentsIcon from '@mui/icons-material/Payments';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import WorkIcon from '@mui/icons-material/Work';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

import HowToRegIcon from '@mui/icons-material/HowToReg';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';

import GroupsIcon from '@mui/icons-material/Groups';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import SpeedIcon from '@mui/icons-material/Speed';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssessmentIcon from '@mui/icons-material/Assessment';

import TaskAltIcon from '@mui/icons-material/TaskAlt';
import BlockIcon from '@mui/icons-material/Block';

import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MoreTimeIcon from '@mui/icons-material/MoreTime';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';

import { Role } from '../../features/auth/security/roles/roles';

export interface KpiItemConfig {
  key: string;
  title: string;
  icon: ReactNode;
  dataKey: string;
  trendKey?: string;
  subtitle?: string;
}

export const ROLE_KPI_CONFIGS: Record<Role, KpiItemConfig[]> = {
  [Role.ADMIN]: [
    { key: 'totalHeadcount', title: 'Total Headcount', icon: <PeopleAltIcon />, dataKey: 'totalHeadcount', subtitle: 'All employees' },
    { key: 'activeHeadcount', title: 'Active Employees', icon: <PersonIcon />, dataKey: 'activeHeadcount', subtitle: 'Currently active' },
    { key: 'totalStorage', title: 'Total Storage', icon: <BusinessIcon />, dataKey: 'totalStorage', subtitle: 'Database size' },
    { key: 'errorRate', title: 'Error Rate', icon: <TrendingDownIcon />, dataKey: 'errorRate', subtitle: 'System errors' },
    { key: 'pendingApprovals', title: 'Pending Approvals', icon: <PendingActionsIcon />, dataKey: 'pendingApprovals', subtitle: 'Requires action' },
    { key: 'departments', title: 'Departments', icon: <BusinessIcon />, dataKey: 'totalDepartments', subtitle: 'Active departments' },
    { key: 'integrationsHealth', title: 'Integrations Health', icon: <TaskAltIcon />, dataKey: 'integrationsHealth', subtitle: 'System integrations' },
    { key: 'onLeave', title: 'On Leave', icon: <SpeedIcon />, dataKey: 'onLeaveHeadcount', subtitle: 'On leave today' }
  ],

  [Role.HR]: [
    { key: 'totalEmployees', title: 'Total Employees', icon: <PeopleAltIcon />, dataKey: 'headcount', trendKey: 'headcountTrend', subtitle: 'Active staff' },
    { key: 'presentToday', title: 'Present Today', icon: <HowToRegIcon />, dataKey: 'presentToday', subtitle: 'Punched in today' },
    { key: 'attendanceRate', title: 'Attendance Rate', icon: <EventAvailableIcon />, dataKey: 'attendanceRate', trendKey: 'attendanceRateTrend', subtitle: 'Organization wide' },
    { key: 'leaveRequests', title: 'Leave Requests', icon: <BeachAccessIcon />, dataKey: 'pendingLeaveRequests', subtitle: 'Pending HR review' },
    { key: 'pendingApprovals', title: 'Pending Approvals', icon: <PendingActionsIcon />, dataKey: 'pendingApprovals', subtitle: 'Action required' },
    { key: 'newHires', title: 'New Hires', icon: <PersonAddAltIcon />, dataKey: 'newJoinersMonth', subtitle: 'This month' },
    { key: 'attritionRate', title: 'Attrition Rate', icon: <TrendingDownIcon />, dataKey: 'attritionRate', trendKey: 'attritionTrend', subtitle: 'Annualized turnover' },
    { key: 'payrollStatus', title: 'Payroll Status', icon: <PaymentsIcon />, dataKey: 'payrollStatus', subtitle: 'Compliance & disbursement' }
  ],

  [Role.MANAGER]: [
    { key: 'totalTeam', title: 'Total Team', icon: <GroupsIcon />, dataKey: 'totalTeam', subtitle: 'Direct & indirect reports' },
    { key: 'teamPresent', title: 'Team Present', icon: <HowToRegIcon />, dataKey: 'teamPresent', subtitle: 'Punched in' },
    { key: 'taskCompletion', title: 'Task Completion', icon: <TaskAltIcon />, dataKey: 'taskCompletion', subtitle: 'Current sprint' },
    { key: 'openRoles', title: 'Open Roles', icon: <WorkIcon />, dataKey: 'openRoles', subtitle: 'Active hiring' },
    { key: 'pendingReviews', title: 'Pending Reviews', icon: <PendingActionsIcon />, dataKey: 'pendingReviews', subtitle: 'Leaves & appraisals' },
    { key: 'onLeave', title: 'On Leave', icon: <EventBusyIcon />, dataKey: 'onLeave', subtitle: 'Current' },
    { key: 'productivity', title: 'Productivity', icon: <TrendingUpIcon />, dataKey: 'productivity', subtitle: 'Sprint metrics' },
    { key: 'budget', title: 'Budget', icon: <PaymentsIcon />, dataKey: 'budget', subtitle: 'Utilization' }
  ],

  [Role.TEAM_LEAD]: [
    { key: 'teamMembers', title: 'Team Members', icon: <GroupsIcon />, dataKey: 'teamMembers', subtitle: 'Active sprint members' },
    { key: 'presentToday', title: 'Present Today', icon: <HowToRegIcon />, dataKey: 'presentToday', subtitle: 'Active in shift' },
    { key: 'taskCompletion', title: 'Task Completion', icon: <TaskAltIcon />, dataKey: 'taskCompletion', subtitle: 'Current sprint' },
    { key: 'blockedTasks', title: 'Blocked Tasks', icon: <BlockIcon />, dataKey: 'blockedTasks', subtitle: 'Action required' },
    { key: 'sprintProgress', title: 'Sprint Progress', icon: <SpeedIcon />, dataKey: 'sprintProgress', subtitle: 'Current sprint' },
    { key: 'pendingActions', title: 'Pending Actions', icon: <PendingActionsIcon />, dataKey: 'pendingActions', subtitle: 'Peer feedback & logs' },
    { key: 'productivity', title: 'Productivity', icon: <TrendingUpIcon />, dataKey: 'productivity', subtitle: 'Output rating' },
    { key: 'performance', title: 'Performance', icon: <AssessmentIcon />, dataKey: 'performance', subtitle: 'Team evaluation' }
  ],

  [Role.EMPLOYEE]: [
    { key: 'attendance', title: 'Attendance', icon: <EventAvailableIcon />, dataKey: 'attendance', subtitle: 'This month' },
    { key: 'productivity', title: 'Productivity', icon: <TrendingUpIcon />, dataKey: 'productivity', subtitle: 'Personal rating' },
    { key: 'taskProgress', title: 'Task Progress', icon: <TaskAltIcon />, dataKey: 'taskProgress', subtitle: 'Current sprint' },
    { key: 'timeLogs', title: 'Time Logs', icon: <AccessTimeIcon />, dataKey: 'timeLogs', subtitle: 'Logged today' },
    { key: 'upcomingLeave', title: 'Upcoming Leave', icon: <BeachAccessIcon />, dataKey: 'upcomingLeave', subtitle: 'Approved days off' },
    { key: 'coreHours', title: 'Core Hours', icon: <MoreTimeIcon />, dataKey: 'coreHours', subtitle: 'Compliance' },
    { key: 'openTickets', title: 'Open Tickets', icon: <PendingActionsIcon />, dataKey: 'openTickets', subtitle: 'IT / HR requests' },
    { key: 'training', title: 'Training', icon: <AssessmentIcon />, dataKey: 'training', subtitle: 'Modules completed' }
  ],

  [Role.EXECUTIVE]: [
    { key: 'totalEmployees', title: 'Total Employees', icon: <PeopleAltIcon />, dataKey: 'headcount', trendKey: 'headcountTrend', subtitle: 'Active staff' },
    { key: 'attritionRate', title: 'Attrition Rate', icon: <TrendingDownIcon />, dataKey: 'attritionRate', trendKey: 'attritionTrend', subtitle: 'Annualized turnover' },
    { key: 'revenuePerEmployee', title: 'Revenue / Employee', icon: <PaymentsIcon />, dataKey: 'revenuePerEmployee', subtitle: 'Efficiency' },
    { key: 'openRoles', title: 'Open Roles', icon: <WorkIcon />, dataKey: 'openRoles', subtitle: 'Active hiring' },
    { key: 'productivity', title: 'Productivity', icon: <TrendingUpIcon />, dataKey: 'productivity', subtitle: 'Company output' },
    { key: 'budget', title: 'Budget Status', icon: <PaymentsIcon />, dataKey: 'budget', subtitle: 'Utilization' },
    { key: 'compliance', title: 'Compliance', icon: <TaskAltIcon />, dataKey: 'compliance', subtitle: 'Status' },
    { key: 'training', title: 'Training ROI', icon: <AssessmentIcon />, dataKey: 'training', subtitle: 'Company-wide' }
  ]
};

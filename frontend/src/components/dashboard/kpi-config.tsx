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

import { Role } from '../../security/roles/roles';

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
    { key: 'totalEmployees', title: 'Total Employees', icon: <PeopleAltIcon />, dataKey: 'totalEmployees', trendKey: 'totalEmployeesTrend', subtitle: 'Current workforce' },
    { key: 'activeEmployees', title: 'Active Employees', icon: <PersonIcon />, dataKey: 'activeEmployees', subtitle: 'Currently active' },
    { key: 'departments', title: 'Departments', icon: <BusinessIcon />, dataKey: 'totalDepartments', subtitle: 'Active departments' },
    { key: 'attendanceRate', title: 'Attendance Rate', icon: <EventAvailableIcon />, dataKey: 'attendanceRate', trendKey: 'attendanceRateTrend', subtitle: 'Current period' },
    { key: 'payrollCost', title: 'Payroll Cost', icon: <PaymentsIcon />, dataKey: 'payrollCost', subtitle: 'Current period' },
    { key: 'pendingApprovals', title: 'Pending Approvals', icon: <PendingActionsIcon />, dataKey: 'pendingApprovals', subtitle: 'Requires action' },
    { key: 'openPositions', title: 'Open Positions', icon: <WorkIcon />, dataKey: 'openPositions', subtitle: 'Current openings' },
    { key: 'attritionRate', title: 'Attrition Rate', icon: <TrendingDownIcon />, dataKey: 'attritionRate', trendKey: 'attritionTrend', subtitle: 'Current period' }
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
    { key: 'teamSize', title: 'Team Size', icon: <GroupsIcon />, dataKey: 'teamSize', subtitle: 'Direct & indirect reports' },
    { key: 'presentToday', title: 'Present Today', icon: <HowToRegIcon />, dataKey: 'presentCount', subtitle: 'Punched in' },
    { key: 'teamAttendance', title: 'Team Attendance', icon: <EventAvailableIcon />, dataKey: 'teamAttendanceRate', trendKey: 'teamAttendanceTrend', subtitle: 'Current sprint' },
    { key: 'pendingLeaves', title: 'Pending Leaves', icon: <EventBusyIcon />, dataKey: 'onLeaveCount', subtitle: 'Awaiting review' },
    { key: 'activeProjects', title: 'Active Projects', icon: <WorkIcon />, dataKey: 'activeProjects', subtitle: 'In progress' },
    { key: 'sprintProgress', title: 'Sprint Progress', icon: <SpeedIcon />, dataKey: 'sprintProgress', subtitle: 'Current sprint completion' },
    { key: 'productivity', title: 'Productivity', icon: <TrendingUpIcon />, dataKey: 'productivityScore', trendKey: 'productivityTrend', subtitle: 'Target: 90%' },
    { key: 'performance', title: 'Performance', icon: <AssessmentIcon />, dataKey: 'performanceScore', subtitle: 'Team evaluation' }
  ],

  [Role.TEAM_LEAD]: [
    { key: 'teamMembers', title: 'Team Members', icon: <GroupsIcon />, dataKey: 'teamMembersCount', subtitle: 'Active sprint members' },
    { key: 'presentToday', title: 'Present Today', icon: <HowToRegIcon />, dataKey: 'presentTodayCount', subtitle: 'Active in shift' },
    { key: 'attendanceRate', title: 'Attendance Rate', icon: <EventAvailableIcon />, dataKey: 'attendanceRate', subtitle: 'Team average' },
    { key: 'sprintProgress', title: 'Sprint Progress', icon: <SpeedIcon />, dataKey: 'sprintProgress', subtitle: 'Current sprint' },
    { key: 'tasksCompleted', title: 'Tasks Completed', icon: <TaskAltIcon />, dataKey: 'completedTasksCount', subtitle: 'Current sprint' },
    { key: 'blockedTasks', title: 'Blocked Tasks', icon: <BlockIcon />, dataKey: 'blockedTasksCount', subtitle: 'Action required' },
    { key: 'productivity', title: 'Productivity', icon: <TrendingUpIcon />, dataKey: 'productivityScore', subtitle: 'Output rating' },
    { key: 'pendingActions', title: 'Pending Actions', icon: <PendingActionsIcon />, dataKey: 'pendingItemsCount', subtitle: 'Peer feedback & logs' }
  ],

  [Role.EMPLOYEE]: [
    { key: 'attendance', title: 'Attendance', icon: <EventAvailableIcon />, dataKey: 'myAttendanceRate', subtitle: 'This month' },
    { key: 'workingHours', title: 'Working Hours', icon: <AccessTimeIcon />, dataKey: 'hoursToday', subtitle: 'Logged today' },
    { key: 'leaveBalance', title: 'Leave Balance', icon: <BeachAccessIcon />, dataKey: 'leaveBalance', subtitle: 'Available paid days' },
    { key: 'tasksCompleted', title: 'Tasks Completed', icon: <TaskAltIcon />, dataKey: 'completedTasks', subtitle: 'Current sprint' },
    { key: 'sprintProgress', title: 'Sprint Progress', icon: <SpeedIcon />, dataKey: 'sprintProgress', subtitle: 'Target completion' },
    { key: 'performance', title: 'Performance', icon: <AssessmentIcon />, dataKey: 'performanceScore', subtitle: 'Evaluation rating' },
    { key: 'overtime', title: 'Overtime', icon: <MoreTimeIcon />, dataKey: 'overtimeHours', subtitle: 'Extra hours logged' },
    { key: 'attendanceStreak', title: 'Attendance Streak', icon: <LocalFireDepartmentIcon />, dataKey: 'attendanceStreak', subtitle: 'Consecutive days' }
  ]
};

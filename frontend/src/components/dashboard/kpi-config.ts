import { 
  Users, 
  UserCheck, 
  Percent, 
  Palmtree, 
  Clock, 
  TrendingUp, 
  CheckCircle2, 
  Building2, 
  UserPlus, 
  UserMinus, 
  DollarSign, 
  CheckSquare, 
  Calendar, 
  Activity, 
  AlertTriangle,
  Timer,
  FileCheck
} from 'lucide-react';
import { Role } from '../../security/roles/roles';

export interface KpiItemConfig {
  key: string;
  title: string;
  icon: any;
  color: 'emerald' | 'cyan' | 'purple' | 'amber' | 'blue' | 'rose' | 'indigo' | 'teal';
  format?: 'number' | 'percentage' | 'currency' | 'time' | 'raw';
  socketEvent?: string;
  dataKey: string;
  trendKey?: string;
  sparklineKey?: string;
  subtitle?: string;
}

export const ROLE_KPI_CONFIGS: Record<Role, KpiItemConfig[]> = {
  [Role.ADMIN]: [
    { key: 'totalEmployees', title: 'Total Employees', icon: Users, color: 'emerald', format: 'number', socketEvent: 'employee-update', dataKey: 'totalEmployees', trendKey: 'totalEmployeesTrend', sparklineKey: 'totalEmployeesHistory', subtitle: 'Active across organization' },
    { key: 'presentToday', title: 'Present Today', icon: UserCheck, color: 'cyan', format: 'number', socketEvent: 'attendance-update', dataKey: 'presentToday', trendKey: 'presentTodayTrend', sparklineKey: 'attendanceHistory', subtitle: 'Punched in today' },
    { key: 'attendanceRate', title: 'Attendance Rate', icon: Percent, color: 'indigo', format: 'percentage', socketEvent: 'attendance-update', dataKey: 'attendanceRate', trendKey: 'attendanceRateTrend', sparklineKey: 'rateHistory', subtitle: 'Target: 95%' },
    { key: 'departments', title: 'Departments', icon: Building2, color: 'blue', format: 'number', dataKey: 'totalDepartments', subtitle: 'Active business units' },
    { key: 'onLeave', title: 'On Leave', icon: Palmtree, color: 'purple', format: 'number', socketEvent: 'leave-update', dataKey: 'onLeaveToday', trendKey: 'onLeaveTrend', subtitle: 'Approved absence' },
    { key: 'pendingApprovals', title: 'Pending Approvals', icon: Clock, color: 'amber', format: 'number', socketEvent: 'approval-update', dataKey: 'pendingApprovals', subtitle: 'Action required' },
    { key: 'lateArrivals', title: 'Late Arrivals', icon: Timer, color: 'rose', format: 'number', socketEvent: 'attendance-update', dataKey: 'lateArrivalsToday', subtitle: 'After grace period' },
    { key: 'avgWorkHours', title: 'Avg Work Hours', icon: Activity, color: 'teal', format: 'time', socketEvent: 'attendance-update', dataKey: 'avgWorkHours', subtitle: 'Per employee today' }
  ],

  [Role.HR]: [
    { key: 'headcount', title: 'Headcount', icon: Users, color: 'emerald', format: 'number', socketEvent: 'employee-update', dataKey: 'headcount', trendKey: 'headcountTrend', sparklineKey: 'headcountHistory', subtitle: 'Active staff' },
    { key: 'attendanceRate', title: 'Attendance Rate', icon: Percent, color: 'indigo', format: 'percentage', socketEvent: 'attendance-update', dataKey: 'attendanceRate', trendKey: 'attendanceRateTrend', subtitle: 'Organization wide' },
    { key: 'leaveRequests', title: 'Leave Requests', icon: Palmtree, color: 'purple', format: 'number', socketEvent: 'leave-update', dataKey: 'pendingLeaveRequests', subtitle: 'Pending HR review' },
    { key: 'pendingCorrections', title: 'Pending Corrections', icon: AlertTriangle, color: 'amber', format: 'number', socketEvent: 'attendance-update', dataKey: 'pendingCorrections', subtitle: 'Punch regularization' },
    { key: 'newJoiners', title: 'New Joiners', icon: UserPlus, color: 'cyan', format: 'number', socketEvent: 'employee-update', dataKey: 'newJoinersMonth', subtitle: 'This month' },
    { key: 'attritionRate', title: 'Attrition Rate', icon: UserMinus, color: 'rose', format: 'percentage', dataKey: 'attritionRate', trendKey: 'attritionTrend', subtitle: 'Annualized turnover' },
    { key: 'lateArrivals', title: 'Late Arrivals', icon: Timer, color: 'amber', format: 'number', socketEvent: 'attendance-update', dataKey: 'lateArrivalsToday', subtitle: 'Today' },
    { key: 'payrollStatus', title: 'Payroll Compliance', icon: DollarSign, color: 'teal', format: 'percentage', socketEvent: 'payroll-update', dataKey: 'complianceScore', subtitle: 'Statutory filing readiness' }
  ],

  [Role.MANAGER]: [
    { key: 'teamSize', title: 'Team Size', icon: Users, color: 'emerald', format: 'number', socketEvent: 'employee-update', dataKey: 'teamSize', subtitle: 'Direct & indirect reports' },
    { key: 'teamAttendance', title: 'Team Attendance Rate', icon: Percent, color: 'cyan', format: 'percentage', socketEvent: 'attendance-update', dataKey: 'teamAttendanceRate', trendKey: 'teamAttendanceTrend', subtitle: 'Current sprint' },
    { key: 'presentCount', title: 'Present Today', icon: UserCheck, color: 'indigo', format: 'number', socketEvent: 'attendance-update', dataKey: 'presentCount', subtitle: 'Punched in' },
    { key: 'onLeaveCount', title: 'On Leave', icon: Palmtree, color: 'purple', format: 'number', socketEvent: 'leave-update', dataKey: 'onLeaveCount', subtitle: 'Approved leave' },
    { key: 'lateCount', title: 'Late Today', icon: Timer, color: 'amber', format: 'number', socketEvent: 'attendance-update', dataKey: 'lateCount', subtitle: 'Grace period exceeded' },
    { key: 'workHours', title: 'Avg Team Hours', icon: Clock, color: 'teal', format: 'time', socketEvent: 'attendance-update', dataKey: 'avgTeamWorkHours', subtitle: 'Effective daily hours' },
    { key: 'productivity', title: 'Productivity Score', icon: TrendingUp, color: 'blue', format: 'percentage', dataKey: 'productivityScore', trendKey: 'productivityTrend', subtitle: 'Target: 90%' },
    { key: 'pendingApprovals', title: 'Pending Approvals', icon: CheckSquare, color: 'rose', format: 'number', socketEvent: 'approval-update', dataKey: 'pendingTeamApprovals', subtitle: 'Leaves & corrections' }
  ],

  [Role.TEAM_LEAD]: [
    { key: 'teamMembers', title: 'Team Members', icon: Users, color: 'emerald', format: 'number', socketEvent: 'employee-update', dataKey: 'teamMembersCount', subtitle: 'Active sprint members' },
    { key: 'presentToday', title: 'Present Today', icon: UserCheck, color: 'cyan', format: 'number', socketEvent: 'attendance-update', dataKey: 'presentTodayCount', subtitle: 'Active in shift' },
    { key: 'attendanceRate', title: 'Attendance Rate', icon: Percent, color: 'indigo', format: 'percentage', socketEvent: 'attendance-update', dataKey: 'attendanceRate', subtitle: 'Team average' },
    { key: 'lateArrivals', title: 'Late Arrivals', icon: Timer, color: 'amber', format: 'number', socketEvent: 'attendance-update', dataKey: 'lateArrivalsCount', subtitle: 'Today' },
    { key: 'activeTasks', title: 'Active Tasks', icon: Activity, color: 'blue', format: 'number', dataKey: 'activeTasksCount', subtitle: 'In progress' },
    { key: 'completedTasks', title: 'Completed Tasks', icon: CheckCircle2, color: 'teal', format: 'number', dataKey: 'completedTasksCount', subtitle: 'Current sprint' },
    { key: 'workHours', title: 'Work Hours Logged', icon: Clock, color: 'purple', format: 'time', socketEvent: 'attendance-update', dataKey: 'workHoursLogged', subtitle: 'Total team hours' },
    { key: 'pendingItems', title: 'Pending Reviews', icon: FileCheck, color: 'rose', format: 'number', socketEvent: 'approval-update', dataKey: 'pendingItemsCount', subtitle: 'Peer feedback & logs' }
  ],

  [Role.EMPLOYEE]: [
    { key: 'todayStatus', title: "Today's Status", icon: UserCheck, color: 'emerald', format: 'raw', socketEvent: 'attendance-update', dataKey: 'todayStatus', subtitle: 'Current punch status' },
    { key: 'checkInTime', title: 'Check-in Time', icon: Clock, color: 'cyan', format: 'raw', socketEvent: 'attendance-update', dataKey: 'checkInTime', subtitle: 'First punch today' },
    { key: 'workHours', title: 'Work Hours Today', icon: Timer, color: 'indigo', format: 'time', socketEvent: 'attendance-update', dataKey: 'workHoursToday', subtitle: 'Effective time' },
    { key: 'breakTime', title: 'Break Time', icon: Calendar, color: 'purple', format: 'time', socketEvent: 'attendance-update', dataKey: 'breakTimeToday', subtitle: 'Cumulative break' },
    { key: 'attendanceRate', title: 'My Attendance %', icon: Percent, color: 'teal', format: 'percentage', socketEvent: 'attendance-update', dataKey: 'myAttendanceRate', subtitle: 'This month' },
    { key: 'leaveBalance', title: 'Leave Balance', icon: Palmtree, color: 'blue', format: 'number', socketEvent: 'leave-update', dataKey: 'availableLeaveBalance', subtitle: 'Available paid days' },
    { key: 'pendingRequests', title: 'Pending Requests', icon: Clock, color: 'amber', socketEvent: 'leave-update', dataKey: 'myPendingRequests', subtitle: 'Awaiting manager approval' },
    { key: 'currentTask', title: 'Current Activity', icon: Activity, color: 'rose', format: 'raw', dataKey: 'currentActivity', subtitle: 'Active assignment' }
  ]
};

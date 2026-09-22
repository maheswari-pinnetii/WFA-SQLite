import { DashboardChartConfig } from './chart.types';

export const selectChartData = (config: DashboardChartConfig, rawData: any): any[] => {
  if (!rawData) {
    return getFallbackChartData(config.id);
  }

  const d = rawData.charts || rawData;
  const dashboardData = {
    ...d,
    departmentDistribution: d.departmentDistribution || d.employeesByDept,
    workforceGrowth: d.workforceGrowth || d.headcountTrend,
    onboardingPipeline: d.onboardingPipeline || d.hiringTrend,
    attritionRisk: d.attritionRisk || d.retentionRate,
    leaveDistribution: d.leaveDistribution || d.leaveByDept
  };

  switch (config.id) {
    case 'admin_headcount_dept':
      return dashboardData.departmentDistribution || [
        { department: 'Engineering', fullTime: 45, contract: 8, intern: 4 },
        { department: 'Sales & Mktg', fullTime: 28, contract: 4, intern: 2 },
        { department: 'HR & Ops', fullTime: 14, contract: 2, intern: 1 },
        { department: 'Finance', fullTime: 10, contract: 1, intern: 0 },
        { department: 'Support', fullTime: 18, contract: 5, intern: 2 },
      ];

    case 'admin_workforce_growth':
      return dashboardData.workforceGrowth || [
        { month: 'May', joined: 12, exited: 3 },
        { month: 'Jun', joined: 15, exited: 4 },
        { month: 'Jul', joined: 9, exited: 2 },
        { month: 'Aug', joined: 18, exited: 5 },
        { month: 'Sep', joined: 14, exited: 3 },
      ];

    case 'admin_payroll_expense':
      return dashboardData.payrollExpenses || [
        { month: 'May', grossSalary: 4200000, netPayout: 3780000 },
        { month: 'Jun', grossSalary: 4350000, netPayout: 3915000 },
        { month: 'Jul', grossSalary: 4400000, netPayout: 3960000 },
        { month: 'Aug', grossSalary: 4600000, netPayout: 4140000 },
        { month: 'Sep', grossSalary: 4750000, netPayout: 4275000 },
      ];

    case 'admin_attendance_rate':
      return dashboardData.attendanceRates || [
        { date: 'Mon', presentPct: 94, latePct: 4 },
        { date: 'Tue', presentPct: 96, latePct: 3 },
        { date: 'Wed', presentPct: 92, latePct: 5 },
        { date: 'Thu', presentPct: 95, latePct: 3 },
        { date: 'Fri', presentPct: 89, latePct: 7 },
      ];

    case 'admin_dept_overtime':
      return dashboardData.deptOvertime || [
        { department: 'Engineering', otHours: 140 },
        { department: 'Support', otHours: 95 },
        { department: 'Sales', otHours: 60 },
        { department: 'Operations', otHours: 45 },
        { department: 'HR', otHours: 12 },
      ];

    case 'admin_login_devices':
      return dashboardData.loginDevices || [
        { device: 'Web Desktop', count: 68 },
        { device: 'Mobile App', count: 24 },
        { device: 'Biometric Kiosk', count: 8 },
      ];

    case 'admin_audit_activity':
      return dashboardData.auditActivity || [
        { date: 'Mon', events: 142, alerts: 2 },
        { date: 'Tue', events: 189, alerts: 0 },
        { date: 'Wed', events: 165, alerts: 4 },
        { date: 'Thu', events: 210, alerts: 1 },
        { date: 'Fri', events: 178, alerts: 3 },
      ];

    case 'admin_work_location':
      return dashboardData.workLocations || [
        { mode: 'Office', count: 72 },
        { mode: 'Remote', count: 20 },
        { mode: 'Hybrid / Field', count: 8 },
      ];

    case 'hr_onboarding_pipeline':
      return dashboardData.onboardingPipeline || [
        { month: 'May', onboarded: 10, offboarded: 2 },
        { month: 'Jun', onboarded: 14, offboarded: 3 },
        { month: 'Jul', onboarded: 8, offboarded: 1 },
        { month: 'Aug', onboarded: 16, offboarded: 4 },
        { month: 'Sep', onboarded: 12, offboarded: 2 },
      ];

    case 'hr_leave_distribution':
      return dashboardData.leaveDistribution || [
        { type: 'Casual Leave', days: 42 },
        { type: 'Sick Leave', days: 28 },
        { type: 'Earned Leave', days: 65 },
        { type: 'Unpaid Leave', days: 8 },
      ];

    case 'hr_attrition_risk':
      return dashboardData.attritionRisk || [
        { department: 'Engineering', turnoverRate: 4.2 },
        { department: 'Sales', turnoverRate: 8.5 },
        { department: 'Support', turnoverRate: 6.1 },
        { department: 'Marketing', turnoverRate: 3.8 },
        { department: 'HR', turnoverRate: 2.1 },
      ];

    case 'hr_diversity_ratio':
      return dashboardData.diversityRatio || [
        { gender: 'Male', count: 62 },
        { gender: 'Female', count: 35 },
        { gender: 'Other / Undisclosed', count: 3 },
      ];

    case 'hr_performance_reviews':
      return dashboardData.performanceReviews || [
        { quarter: 'Q1', completed: 85, pending: 10, overdue: 5 },
        { quarter: 'Q2', completed: 90, pending: 8, overdue: 2 },
        { quarter: 'Q3', completed: 78, pending: 18, overdue: 4 },
      ];

    case 'hr_statutory_claims':
      return dashboardData.statutoryClaims || [
        { month: 'May', pfClaim: 320000, esiClaim: 85000 },
        { month: 'Jun', pfClaim: 340000, esiClaim: 90000 },
        { month: 'Jul', pfClaim: 335000, esiClaim: 88000 },
        { month: 'Aug', pfClaim: 360000, esiClaim: 95000 },
        { month: 'Sep', pfClaim: 375000, esiClaim: 98000 },
      ];

    case 'hr_time_to_hire':
      return dashboardData.timeToHire || [
        { month: 'May', avgDays: 24 },
        { month: 'Jun', avgDays: 21 },
        { month: 'Jul', avgDays: 19 },
        { month: 'Aug', avgDays: 22 },
        { month: 'Sep', avgDays: 18 },
      ];

    case 'hr_absenteeism_pattern':
      return dashboardData.absenteeismPattern || [
        { month: 'May', unplannedDays: 14, sickLeavePct: 3.2 },
        { month: 'Jun', unplannedDays: 18, sickLeavePct: 4.1 },
        { month: 'Jul', unplannedDays: 12, sickLeavePct: 2.8 },
        { month: 'Aug', unplannedDays: 22, sickLeavePct: 5.0 },
        { month: 'Sep', unplannedDays: 15, sickLeavePct: 3.5 },
      ];

    case 'mgr_team_attendance':
      return dashboardData.teamAttendance || [
        { date: 'Mon', present: 14, late: 1, absent: 0 },
        { date: 'Tue', present: 15, late: 0, absent: 0 },
        { date: 'Wed', present: 13, late: 2, absent: 0 },
        { date: 'Thu', present: 14, late: 0, absent: 1 },
        { date: 'Fri', present: 12, late: 1, absent: 2 },
      ];

    case 'mgr_project_allocation':
      return dashboardData.projectAllocation || [
        { project: 'WFA Core UI', allocatedHours: 160, loggedHours: 148 },
        { project: 'Payroll Engine', allocatedHours: 120, loggedHours: 125 },
        { project: 'SQLite Sync', allocatedHours: 80, loggedHours: 72 },
        { project: 'Mobile API', allocatedHours: 60, loggedHours: 58 },
      ];

    case 'mgr_leave_coverage':
      return dashboardData.leaveCoverage || [
        { member: 'Rahul S.', casualRemaining: 5, sickRemaining: 4, earnedRemaining: 12 },
        { member: 'Priya M.', casualRemaining: 3, sickRemaining: 6, earnedRemaining: 8 },
        { member: 'Amit K.', casualRemaining: 7, sickRemaining: 2, earnedRemaining: 15 },
        { member: 'Neha V.', casualRemaining: 2, sickRemaining: 5, earnedRemaining: 10 },
      ];

    case 'mgr_overtime_trend':
      return dashboardData.overtimeTrend || [
        { week: 'Wk 1', regularHours: 600, otHours: 35 },
        { week: 'Wk 2', regularHours: 600, otHours: 48 },
        { week: 'Wk 3', regularHours: 580, otHours: 52 },
        { week: 'Wk 4', regularHours: 600, otHours: 28 },
      ];

    case 'mgr_sprint_performance':
      return dashboardData.sprintPerformance || [
        { sprint: 'Sprint 21', targetPoints: 40, completedPoints: 38 },
        { sprint: 'Sprint 22', targetPoints: 42, completedPoints: 42 },
        { sprint: 'Sprint 23', targetPoints: 45, completedPoints: 41 },
        { sprint: 'Sprint 24', targetPoints: 40, completedPoints: 44 },
      ];

    case 'mgr_task_status':
      return dashboardData.taskStatus || [
        { status: 'Completed', count: 28 },
        { status: 'In Progress', count: 14 },
        { status: 'In Review', count: 6 },
        { status: 'Blocked', count: 2 },
      ];

    case 'mgr_shift_coverage':
      return dashboardData.shiftCoverage || [
        { shift: 'Day Shift (9 AM - 6 PM)', count: 12 },
        { shift: 'Evening Shift (2 PM - 11 PM)', count: 3 },
      ];

    case 'mgr_remote_pattern':
      return dashboardData.remotePattern || [
        { mode: 'Office', count: 60 },
        { mode: 'Work From Home', count: 15 },
      ];

    case 'tl_checkin_timings':
      return dashboardData.checkinTimings || [
        { day: 'Mon', avgCheckinHour: 9.15 },
        { day: 'Tue', avgCheckinHour: 9.05 },
        { day: 'Wed', avgCheckinHour: 9.20 },
        { day: 'Thu', avgCheckinHour: 9.10 },
        { day: 'Fri', avgCheckinHour: 9.25 },
      ];

    case 'tl_active_backlog':
      return dashboardData.activeBacklog || [
        { status: 'In Progress', count: 8 },
        { status: 'Code Review', count: 4 },
        { status: 'QA Testing', count: 3 },
        { status: 'To Do', count: 7 },
      ];

    case 'tl_velocity_burndown':
      return dashboardData.velocityBurndown || [
        { day: 'Day 1', idealRemaining: 100, actualRemaining: 100 },
        { day: 'Day 3', idealRemaining: 80, actualRemaining: 82 },
        { day: 'Day 5', idealRemaining: 60, actualRemaining: 55 },
        { day: 'Day 7', idealRemaining: 40, actualRemaining: 38 },
        { day: 'Day 10', idealRemaining: 0, actualRemaining: 0 },
      ];

    case 'tl_code_reviews':
      return dashboardData.codeReviews || [
        { member: 'Alex', openedPRs: 6, mergedPRs: 5 },
        { member: 'Sara', openedPRs: 8, mergedPRs: 8 },
        { member: 'David', openedPRs: 4, mergedPRs: 3 },
        { member: 'Elena', openedPRs: 7, mergedPRs: 6 },
      ];

    case 'tl_weekly_overtime':
      return dashboardData.weeklyOvertime || [
        { day: 'Mon', otHours: 4 },
        { day: 'Tue', otHours: 6 },
        { day: 'Wed', otHours: 8 },
        { day: 'Thu', otHours: 5 },
        { day: 'Fri', otHours: 2 },
      ];

    case 'tl_availability_calendar':
      return dashboardData.availabilityCalendar || [
        { status: 'Available', count: 7 },
        { status: 'On Leave', count: 1 },
        { status: 'Remote / Client Site', count: 2 },
      ];

    case 'tl_incident_resolution':
      return dashboardData.incidentResolution || [
        { week: 'Wk 1', avgHoursToResolve: 3.5 },
        { week: 'Wk 2', avgHoursToResolve: 2.8 },
        { week: 'Wk 3', avgHoursToResolve: 4.1 },
        { week: 'Wk 4', avgHoursToResolve: 2.2 },
      ];

    case 'tl_skill_assignment':
      return dashboardData.skillAssignment || [
        { skill: 'React / TS', assignedCount: 5 },
        { skill: 'Node / Express', assignedCount: 4 },
        { skill: 'SQLite DB', assignedCount: 3 },
        { skill: 'DevOps / CI', assignedCount: 2 },
      ];

    case 'emp_personal_attendance':
      return dashboardData.personalAttendance || [
        { date: 'Mon', workedHours: 8.5, targetHours: 8.0 },
        { date: 'Tue', workedHours: 8.2, targetHours: 8.0 },
        { date: 'Wed', workedHours: 9.0, targetHours: 8.0 },
        { date: 'Thu', workedHours: 8.0, targetHours: 8.0 },
        { date: 'Fri', workedHours: 7.5, targetHours: 8.0 },
      ];

    case 'emp_salary_trend':
      return dashboardData.salaryTrend || [
        { month: 'Apr', netSalary: 65000 },
        { month: 'May', netSalary: 65000 },
        { month: 'Jun', netSalary: 65000 },
        { month: 'Jul', netSalary: 68500 },
        { month: 'Aug', netSalary: 68500 },
        { month: 'Sep', netSalary: 68500 },
      ];

    case 'emp_leave_entitlement':
      return dashboardData.leaveEntitlement || [
        { leaveType: 'Casual', totalQuota: 12, remaining: 7 },
        { leaveType: 'Sick', totalQuota: 10, remaining: 6 },
        { leaveType: 'Earned', totalQuota: 15, remaining: 12 },
      ];

    case 'emp_weekly_hours':
      return dashboardData.weeklyHours || [
        { day: 'Mon', projectA: 5, projectB: 3.5 },
        { day: 'Tue', projectA: 4, projectB: 4.2 },
        { day: 'Wed', projectA: 6, projectB: 3.0 },
        { day: 'Thu', projectA: 5, projectB: 3.0 },
        { day: 'Fri', projectA: 3.5, projectB: 4.0 },
      ];

    case 'emp_overtime_logged':
      return dashboardData.overtimeLogged || [
        { month: 'May', approvedOtHours: 6 },
        { month: 'Jun', approvedOtHours: 8 },
        { month: 'Jul', approvedOtHours: 4 },
        { month: 'Aug', approvedOtHours: 10 },
        { month: 'Sep', approvedOtHours: 5 },
      ];

    case 'emp_goal_progression':
      return dashboardData.goalProgression || [
        { quarter: 'Q1', progressPct: 88 },
        { quarter: 'Q2', progressPct: 92 },
        { quarter: 'Q3', progressPct: 79 },
        { quarter: 'Q4', progressPct: 95 },
      ];

    case 'emp_checkin_punctuality':
      return dashboardData.checkinPunctuality || [
        { status: 'On-Time', count: 18 },
        { status: 'Grace Period (<15m)', count: 3 },
        { status: 'Late', count: 1 },
      ];

    case 'emp_tax_deductions':
      return dashboardData.taxDeductions || [
        { category: 'TDS Income Tax', amount: 85000 },
        { category: 'PF Contribution', amount: 48000 },
        { category: 'Professional Tax', amount: 2500 },
        { category: '80C Investment', amount: 150000 },
      ];

    default:
      return [];
  }
};

const getFallbackChartData = (chartId: string): any[] => {
  return selectChartData({ id: chartId } as DashboardChartConfig, {});
};

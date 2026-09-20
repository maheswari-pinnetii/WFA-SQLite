import { analyticsRepository } from '../repositories/analytics.repository.js';
import { Employee, LeaveBalance } from '../models/index.js';

const getScope = (user: any, employeeIdKey = 'employeeId') => {
  const query: any = { organizationId: user.organizationId || 'org-stackly' };

  if (user.role === 'MANAGER') {
    query.department = user.department;
  }
  if (user.role === 'TEAM_LEAD') {
    query.team = user.team;
  }
  if (user.role === 'EMPLOYEE') {
    query[employeeIdKey] = user.id;
  }

  return query;
};

const percentage = (value: number, total: number) => (total ? Number(((value / total) * 100).toFixed(1)) : 0);

const buildGrowth = async (user: any) => {
  const query = getScope(user, 'id');
  const employees = await Employee.find(query).sort({ joinDate: 1 }) as any[];
  const monthlyHires: Record<string, number> = {};
  employees.forEach(emp => {
    if (emp.joinDate) {
      const month = emp.joinDate.substring(0, 7);
      monthlyHires[month] = (monthlyHires[month] || 0) + 1;
    }
  });
  
  const sortedMonths = Object.keys(monthlyHires).sort();
  let headcount = 0;
  const trend = sortedMonths.map(month => {
    headcount += monthlyHires[month];
    return { name: month, headcount, hiring: monthlyHires[month] };
  });
  return trend.slice(-12);
};

export class AnalyticsService {
  async getAnalytics(reqUser: any) {
    const employeeQuery = getScope(reqUser, 'id');
    const attendanceQuery = getScope(reqUser, 'employeeId');
    const performanceQuery = getScope(reqUser, 'employeeId');
    const skillQuery = getScope(reqUser, 'employeeId');

    const [
      employees,
      attendance,
      departmentComparison,
      roleDistribution,
      employmentStatus,
      modeDistribution,
      performanceByQuarter,
      teamProductivity,
      skills,
      tasks,
      leaveRequests
    ] = await Promise.all([
      analyticsRepository.getEmployeesSummary(employeeQuery),
      analyticsRepository.getAttendanceRecords(attendanceQuery),
      analyticsRepository.getDepartmentComparison(employeeQuery),
      analyticsRepository.getRoleDistribution(employeeQuery),
      analyticsRepository.getEmploymentStatus(employeeQuery),
      analyticsRepository.getWorkModeDistribution(attendanceQuery),
      analyticsRepository.getPerformanceByQuarter(performanceQuery),
      analyticsRepository.getTeamProductivity(performanceQuery),
      analyticsRepository.getSkillsMetrics(skillQuery),
      analyticsRepository.getTasksSummary(employeeQuery),
      analyticsRepository.getLeaveRequestsSummary(employeeQuery)
    ]) as [any[], any[], any[], any[], any[], any[], any[], any[], any[], any[], any[]];

    const growthData = await buildGrowth(reqUser);
    const totalEmployees = employees.length;

    const employeeJoinDateMap = new Map<string, string>();
    employees.forEach((emp: any) => {
      if (emp.joinDate) {
        employeeJoinDateMap.set(emp.id, emp.joinDate);
      }
    });

    const isAfterOrOnJoinDate = (recordDateStr: string, joinDateStr?: string) => {
      if (!joinDateStr) return true;
      const recDate = recordDateStr.substring(0, 10);
      const joinDate = joinDateStr.substring(0, 10);
      return recDate >= joinDate;
    };

    const validAttendance = attendance.filter((record: any) => {
      const joinDate = employeeJoinDateMap.get(record.employeeId);
      const recordDate = record.createdAt || record.date;
      if (!recordDate) return true;
      return isAfterOrOnJoinDate(recordDate, joinDate);
    });

    const activePresent = validAttendance.filter((record: any) => record.status !== 'Checked Out').length;
    
    const lateCount = validAttendance.filter((record: any) => {
      if (!record.checkInTime) return false;
      const parts = record.checkInTime.split(':');
      if (parts.length < 2) return false;
      const hr = parseInt(parts[0], 10);
      const min = parseInt(parts[1], 10);
      return hr >= 9 && min > 15;
    }).length;

    const attendanceRate = totalEmployees
      ? Number((employees.reduce((sum: number, emp: any) => sum + (emp.attendanceRate || 0), 0) / totalEmployees).toFixed(1))
      : 0;

    const averagePerformance = totalEmployees
      ? Number((employees.reduce((sum: number, emp: any) => sum + (emp.performanceScore || 0), 0) / totalEmployees).toFixed(1))
      : 0;

    const attendanceOverview = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((name, index) => {
      const dayRecords = validAttendance.filter((record: any) => {
        const dateObj = record.createdAt ? new Date(record.createdAt) : new Date();
        return dateObj.getDay() === (index + 1);
      });
      const present = dayRecords.filter((record: any) => record.status !== 'Checked Out' || record.checkInTime).length;
      const late = dayRecords.filter((record: any) => {
        if (!record.checkInTime) return false;
        const parts = record.checkInTime.split(':');
        const min = parseInt(parts[1] || '0', 10);
        return min > 15;
      }).length;
      return { name, present, absent: Math.max(0, totalEmployees - present), late };
    });

    const riskBuckets: Record<string, number> = { 'High Risk': 0, 'Medium Risk': 0, 'Low Risk': 0 };
    employees.forEach((employee: any) => {
      const perf = employee.performanceScore || 0;
      const att = employee.attendanceRate || 0;
      if (perf < 75 || att < 85) riskBuckets['High Risk'] += 1;
      else if (perf < 85 || att < 95) riskBuckets['Medium Risk'] += 1;
      else riskBuckets['Low Risk'] += 1;
    });

    const skillsAnalysis = skills.map((skill: any) => ({
      name: skill.name,
      averageLevel: skill.averageLevel || 0,
      coverage: percentage(skill.covered || 0, totalEmployees),
      gap: skill.gap || 0,
      people: skill.people || 0
    }));

    // Base Metrics
    const activeEmployees = employees.filter((e: any) => e.status === 'Active').length;
    const departmentsCount = new Set(employees.map((e: any) => e.department).filter(Boolean)).size;
    const teamsCount = new Set(employees.map((e: any) => e.team).filter(Boolean)).size;
    const onLeaveCount = validAttendance.filter((record: any) => record.status === 'On Leave').length;

    // Task Metrics
    const totalTasks = tasks.length;
    const todoTasks = tasks.filter((t: any) => t.status === 'TODO').length;
    const inProgressTasks = tasks.filter((t: any) => t.status === 'IN_PROGRESS').length;
    const completedTasks = tasks.filter((t: any) => t.status === 'COMPLETED').length;
    const blockedTasks = tasks.filter((t: any) => t.status === 'BLOCKED').length;
    const openTasks = todoTasks + inProgressTasks + blockedTasks;
    const overdueTasks = tasks.filter((t: any) => t.status !== 'COMPLETED' && t.priority === 'CRITICAL').length; // proxy for overdue
    const completedToday = tasks.filter((t: any) => {
      if (t.status !== 'COMPLETED' || !t.updatedAt) return false;
      const today = new Date().toISOString().substring(0, 10);
      return t.updatedAt.startsWith(today);
    }).length;
    const sprintProgressMetric = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Leave Request Metrics
    const openLeaveRequests = leaveRequests.filter((l: any) => l.status === 'PENDING').length;

    // HR Metrics (Proxy)
    const newJoiners = employees.filter((e: any) => {
      if (!e.joinDate) return false;
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return new Date(e.joinDate) >= thirtyDaysAgo;
    }).length;
    const exits = employees.filter((e: any) => e.status === 'Terminated' || e.status === 'Resigned').length;
    
    // Performance
    const teamPerformance = averagePerformance;

    // Employee specific
    const myTodayRecords = validAttendance.filter((record: any) => {
      const today = new Date().toISOString().substring(0, 10);
      const recordDate = record.createdAt || record.date || '';
      return recordDate.startsWith(today);
    });
    const todaysAttendanceStatus = myTodayRecords.length > 0 ? myTodayRecords[0].status : 'Pending';
    let actualWorkingHours = 0;
    validAttendance.forEach((record: any) => {
      // Very basic working hours aggregation
      if (record.checkInTime && record.checkOutTime) {
        const inParts = record.checkInTime.split(':');
        const outParts = record.checkOutTime.split(':');
        if (inParts.length >= 2 && outParts.length >= 2) {
          const start = new Date(); start.setHours(parseInt(inParts[0]), parseInt(inParts[1]));
          const end = new Date(); end.setHours(parseInt(outParts[0]), parseInt(outParts[1]));
          actualWorkingHours += Math.max(0, (end.getTime() - start.getTime()) / (1000 * 60 * 60));
        }
      }
    });
    const workingHours = `${actualWorkingHours > 0 ? (actualWorkingHours / validAttendance.length).toFixed(1) : 0}h`;

    // Real Leave Balance
    let totalLeaveBalanceDays = 0;
    if (reqUser.id) {
      const year = new Date().getFullYear();
      const balances = await LeaveBalance.find({ employeeId: reqUser.id, year, organizationId: reqUser.organizationId || 'org-stackly' }) as any[];
      balances.forEach(b => {
        totalLeaveBalanceDays += Math.max(0, (b.allocated || 0) - (b.used || 0));
      });
    }
    const leaveBalance = `${totalLeaveBalanceDays} Days`;


    return {
      scope: {
        role: reqUser.role,
        organizationId: reqUser.organizationId || 'org-stackly',
        department: reqUser.department || null,
        team: reqUser.team || null,
        employeeId: reqUser.role === 'EMPLOYEE' ? reqUser.id : null
      },
      metrics: {
        totalEmployees,
        totalWorkforce: totalEmployees,
        activeEmployees,
        presentToday: activePresent,
        attendanceRate: `${attendanceRate}%`,
        departments: departmentsCount,
        teams: teamsCount,
        pendingApprovals: reqUser.role === 'EMPLOYEE' ? 0 : openLeaveRequests, // actually only managers should see this
        openLeaveRequests,
        attendanceExceptions: lateCount,
        openTasks,
        
        newJoiners,
        exits,
        onboarding: newJoiners,
        onLeaveToday: onLeaveCount,
        onLeave: onLeaveCount,
        pendingLeave: openLeaveRequests,
        employeeRequests: openLeaveRequests,
        hrTasks: openTasks,

        teamMembers: totalEmployees,
        activeTasks: inProgressTasks,
        completedTasks,
        overdueTasks,
        sprintProgress: `${sprintProgressMetric}%`,
        sprintCompletion: `${sprintProgressMetric}%`,
        teamPerformance: `${teamPerformance}%`,

        completedToday,
        inProgress: inProgressTasks,
        blockedTasks,
        pendingReviews: reqUser.role === 'EMPLOYEE' ? 0 : openTasks, // only managers should see this

        todaysAttendance: todaysAttendanceStatus,
        workingHours,
        attendanceThisMonth: `${attendanceRate}%`,
        leaveBalance,
        tasksAssigned: totalTasks,
        tasksCompleted: completedTasks,
        tasksInProgress: inProgressTasks
      },
      growthData,
      workforceGrowth: growthData,
      attendanceOverview,
      departmentComparison,
      departmentDistribution: departmentComparison.map((item: any) => ({ name: item.name, value: item.headcount })),
      roleDistribution,
      employmentStatus,
      workforceDistribution: modeDistribution.length ? modeDistribution : [{ name: 'No attendance data', value: 0 }],
      riskDistribution: Object.entries(riskBuckets).map(([name, value]) => ({ name, value })),
      skillsAnalysis: {
        topSkills: skillsAnalysis.filter((skill: any) => skill.averageLevel >= 4).slice(0, 8),
        missingSkills: skillsAnalysis.filter((skill: any) => skill.gap > 0).sort((a: any, b: any) => b.gap - a.gap).slice(0, 8),
        coverage: skillsAnalysis
      },
      teamProductivity,
      performance: performanceByQuarter,
      // HR specific charts
      leaveTrend: [
        { name: 'Mon', sick: 2, vacation: 5, other: 1 },
        { name: 'Tue', sick: 3, vacation: 4, other: 0 },
        { name: 'Wed', sick: 1, vacation: 5, other: 2 },
        { name: 'Thu', sick: 4, vacation: 3, other: 1 },
        { name: 'Fri', sick: 2, vacation: 6, other: 0 }
      ],
      joinersExits: [
        { name: 'Q1', joiners: 12, exits: 4 },
        { name: 'Q2', joiners: 18, exits: 6 },
        { name: 'Q3', joiners: 15, exits: 5 },
        { name: 'Q4', joiners: 22, exits: 3 }
      ],
      // Manager/TeamLead specific charts
      taskCompletionTrend: [
        { name: 'Week 1', completed: 15, total: 20 },
        { name: 'Week 2', completed: 18, total: 25 },
        { name: 'Week 3', completed: 22, total: 30 },
        { name: 'Week 4', completed: Math.max(22, completedTasks), total: totalTasks }
      ],
      workloadByMember: [
        { name: 'Alice M', tasks: 4 },
        { name: 'Bob S', tasks: 6 },
        { name: 'Charlie D', tasks: 3 },
        { name: 'Dana R', tasks: 5 }
      ],
      taskStatusDistribution: [
        { name: 'To Do', value: todoTasks },
        { name: 'In Progress', value: inProgressTasks },
        { name: 'Completed', value: completedTasks },
        { name: 'Blocked', value: blockedTasks }
      ],
      blockedWork: [
        { name: 'Frontend', blocked: 2, open: 5 },
        { name: 'Backend', blocked: 1, open: 8 },
        { name: 'Design', blocked: 0, open: 3 }
      ],
      sprintProgress: [
        { name: 'Day 1', completed: 0, remaining: totalTasks },
        { name: 'Day 5', completed: Math.floor(completedTasks/2), remaining: totalTasks - Math.floor(completedTasks/2) },
        { name: 'Day 10', completed: completedTasks, remaining: totalTasks - completedTasks }
      ],
      // Employee specific charts
      personalAttendanceTrend: attendanceOverview, // use the same shape
      hoursTracked: [
        { name: 'Mon', hours: 8.5 },
        { name: 'Tue', hours: 8.2 },
        { name: 'Wed', hours: 9.0 },
        { name: 'Thu', hours: 8.0 },
        { name: 'Fri', hours: 8.8 }
      ],
      personalTaskCompletion: [
        { name: 'W1', completed: 3 },
        { name: 'W2', completed: 5 },
        { name: 'W3', completed: 4 },
        { name: 'W4', completed: 6 }
      ],
      personalLeaveHistory: [
        { name: 'Jan', days: 1 },
        { name: 'Feb', days: 0 },
        { name: 'Mar', days: 2 },
        { name: 'Apr', days: 0 },
        { name: 'May', days: 3 }
      ],
      personalOvertime: [
        { name: 'Mon', hours: 0.5 },
        { name: 'Tue', hours: 0.2 },
        { name: 'Wed', hours: 1.0 },
        { name: 'Thu', hours: 0 },
        { name: 'Fri', hours: 0.8 }
      ],
      personalSprintBurndown: [
        { name: 'Sprint 21', points: 12 },
        { name: 'Sprint 22', points: 15 },
        { name: 'Sprint 23', points: 10 },
        { name: 'Sprint 24', points: 18 }
      ]
    };
  }

  async getDashboardSummary(reqUser: any) {
    const orgId = reqUser.organizationId || 'org-stackly';
    const employeeQuery = getScope(reqUser, 'id');
    const attendanceQuery = getScope(reqUser, 'employeeId');

    const [mvSummary, employees, attendance] = await Promise.all([
      analyticsRepository.getDashboardSummaryMV(orgId),
      analyticsRepository.getEmployeesSummary(employeeQuery),
      analyticsRepository.getAttendanceRecords(attendanceQuery)
    ]);

    // Use MV for total headcount if available, fallback to full count
    const totalHeadcount = mvSummary ? mvSummary.totalEmployees : employees.length;
    const activePresent = attendance.filter((record: any) => record.status !== 'Checked Out').length;
    
    const lateCount = attendance.filter((record: any) => {
      if (!record.checkInTime) return false;
      const parts = record.checkInTime.split(':');
      const hr = parseInt(parts[0] || '0', 10);
      const min = parseInt(parts[1] || '0', 10);
      return hr >= 9 && min > 15;
    }).length;
    
    let riskCount = 0;
    employees.forEach((employee: any) => {
      if ((employee.performanceScore || 0) < 75 || (employee.attendanceRate || 0) < 85) {
        riskCount += 1;
      }
    });

    return {
      totalHeadcount,
      activePresent,
      lateArrivals: lateCount,
      riskFlags: riskCount,
      attendanceRate: totalHeadcount ? Math.round((activePresent / totalHeadcount) * 100) : 0
    };
  }

  async getWorkforceDistribution(reqUser: any) {
    const attendanceQuery = getScope(reqUser, 'employeeId');
    const rows = await analyticsRepository.getWorkModeDistribution(attendanceQuery);
    return rows.length ? rows : [{ name: 'No data', value: 0 }];
  }

  async getHeadcountAnalytics(reqUser: any) {
    const employeeQuery = getScope(reqUser, 'id');
    return analyticsRepository.getDepartmentComparison(employeeQuery);
  }

  async getRiskAnalytics(reqUser: any) {
    const employeeQuery = getScope(reqUser, 'id');
    const employees = await analyticsRepository.getEmployeesSummary(employeeQuery);
    const riskBuckets: Record<string, number> = { 'High Risk': 0, 'Medium Risk': 0, 'Low Risk': 0 };
    
    employees.forEach((employee: any) => {
      const perf = employee.performanceScore || 0;
      const att = employee.attendanceRate || 0;
      if (perf < 75 || att < 85) riskBuckets['High Risk'] += 1;
      else if (perf < 85 || att < 95) riskBuckets['Medium Risk'] += 1;
      else riskBuckets['Low Risk'] += 1;
    });
    
    return Object.entries(riskBuckets).map(([name, value]) => ({ name, value }));
  }

  async getEmployeeGrowth(reqUser: any) {
    return buildGrowth(reqUser);
  }

  async getAttendanceTrend(reqUser: any) {
    const employeeQuery = getScope(reqUser, 'id');
    const attendanceQuery = getScope(reqUser, 'employeeId');

    const [employees, attendance] = await Promise.all([
      analyticsRepository.getEmployeesSummary(employeeQuery),
      analyticsRepository.getAttendanceRecords(attendanceQuery)
    ]);

    const totalHeadcount = employees.length;
    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((name, index) => {
      const dayRecords = attendance.filter((record: any) => {
        const dateObj = record.createdAt ? new Date(record.createdAt) : new Date();
        return dateObj.getDay() === (index + 1);
      });
      const present = dayRecords.filter((record: any) => record.status !== 'Checked Out' || record.checkInTime).length;
      return { name, present, absent: Math.max(0, totalHeadcount - present) };
    });
  }

  async getPerformanceAnalytics(reqUser: any) {
    const performanceQuery = getScope(reqUser, 'employeeId');
    return analyticsRepository.getPerformanceByQuarter(performanceQuery);
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;

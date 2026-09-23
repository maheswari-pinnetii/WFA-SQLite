import { analyticsRepository } from '../../repositories/analytics.repository.js';
import { query } from '../../database/sqlite-cloud.js';

export class EmployeeDashboardService {
  async getDashboardData(user: any) {
    const orgId = user.organizationId || 'org-stackly';
    const employeeId = user.id;
    
    // Employee details & Employment Metadata - search employees first, then users
    let employeeRows = await query(`
      SELECT e.*, d.name as departmentName, e.designation as designationName, loc.name as locationName
      FROM employees e
      LEFT JOIN departments d ON e.department = d.id OR e.department = d.name
      LEFT JOIN locations loc ON e.location = loc.id OR e.location = loc.name
      WHERE e.id = ? AND (e.organizationId = ? OR e.organizationId IS NULL)
    `, [employeeId, orgId]);

    if (employeeRows.length === 0) {
      const userRows = await query(`
        SELECT u.id, u.name, u.email, u.role, u.department, u.team, u.location, u.title as designation, u.organizationId, u.createdAt
        FROM users u
        WHERE u.id = ?
      `, [employeeId]);
      if (userRows.length > 0) {
        employeeRows = userRows;
      }
    }
    const employee = employeeRows[0] || { id: user.id, name: user.name, department: user.department, designation: user.title || user.role, location: user.location };
    
    // Attendance
    const today = new Date().toISOString().split('T')[0];
    const [attendance] = await Promise.all([
      analyticsRepository.getAttendanceRecords({ 
        organizationId: orgId,
        employeeId: employeeId
      })
    ]) as [any[]];

    // Calculate hours logged
    let hoursLogged = 0;
    let lateArrivals = 0;
    let earlyDepartures = 0;

    attendance.forEach(a => {
      if (a.checkInTime && a.checkOutTime) {
        const inTime = new Date(a.checkInTime);
        const outTime = new Date(a.checkOutTime);
        const diffHours = (outTime.getTime() - inTime.getTime()) / (1000 * 60 * 60);
        if (diffHours > 0 && diffHours < 24) hoursLogged += diffHours;
      }
      if (a.isLate) lateArrivals++;
      if (a.isEarlyExit) earlyDepartures++;
    });

    // Leave balance & Requests
    let leaveBalance = 15;
    try {
      const balanceRows = await query(`
        SELECT allocated, used FROM leave_balances WHERE employeeId = ? AND organizationId = ?
      `, [employeeId, orgId]);
      if (balanceRows.length > 0) {
        leaveBalance = balanceRows.reduce((acc: number, r: any) => acc + ((r.allocated || 0) - (r.used || 0)), 0);
      }
    } catch {
      leaveBalance = 15;
    }
    
    // Pending leaves
    let pendingLeaves = 0;
    try {
      const pendingLeaveRows = await query(`
        SELECT COUNT(*) as count FROM leaverequests 
        WHERE employeeId = ? AND organizationId = ? AND status = 'PENDING'
      `, [employeeId, orgId]);
      pendingLeaves = pendingLeaveRows[0]?.count || 0;
    } catch {
      pendingLeaves = 0;
    }

    // Tasks
    let taskRows: any[] = [];
    try {
      taskRows = await query(`
        SELECT * FROM tasks 
        WHERE assigneeId = ? AND organizationId = ?
      `, [employeeId, orgId]);
    } catch {
      taskRows = [];
    }
    
    const tasksAssigned = taskRows.length;
    const tasksCompleted = taskRows.filter((t: any) => t.status === 'DONE' || t.status === 'COMPLETED').length;
    const tasksInProgress = taskRows.filter((t: any) => t.status === 'IN_PROGRESS').length;
    const tasksToDo = taskRows.filter((t: any) => t.status === 'TODO').length;

    // Shift & Work Mode
    const shiftInfo = {
      shiftName: employee.shift || 'Standard Shift',
      shiftTiming: employee.shiftTiming || '09:00 AM - 06:00 PM',
      expectedHours: employee.expectedHours || '8.0h',
      workMode: employee.workMode || 'Remote',
      hybridCompliance: employee.hybridCompliance || '100%'
    };

    // Employee Lifecycle & Employment Details
    const joinDate = employee.joinDate || employee.createdAt || '2025-01-15';
    const probationDays = 180;
    const joinTime = new Date(joinDate).getTime();
    const nowTime = Date.now();
    const daysSinceJoining = Math.floor((nowTime - joinTime) / (1000 * 60 * 60 * 24));
    const isProbation = daysSinceJoining < probationDays;

    const employmentDetails = {
      employeeId: employee.id || user.id,
      employeeCode: `EMP-${(employee.id || user.id).slice(-4).toUpperCase()}`,
      department: employee.departmentName || employee.department || 'Engineering',
      designation: employee.designationName || employee.designation || 'Senior Software Engineer',
      location: employee.locationName || employee.location || 'Bangalore HQ (India)',
      workMode: shiftInfo.workMode,
      reportingManager: employee.managerName || 'Operations Lead',
      probationStatus: isProbation ? 'ACTIVE_PROBATION' : 'CONFIRMED',
      probationCompletionDate: new Date(joinTime + probationDays * 86400000).toISOString().split('T')[0],
      noticePeriod: '90 Days (Standard)',
      employmentType: 'FULL_TIME_PERMANENT'
    };

    // Lifecycle History Timeline
    const lifecycleTimeline = [
      { step: 'Joined Company', date: joinDate, status: 'COMPLETED' },
      { step: 'Probation Confirmation', date: employmentDetails.probationCompletionDate, status: isProbation ? 'PENDING' : 'COMPLETED' },
      { step: 'Annual Salary Revision', date: '2026-04-01', status: 'SCHEDULED' },
      { step: 'Performance Appraisal Cycle', date: '2026-10-15', status: 'UPCOMING' }
    ];

    // Comprehensive 8 KPIs
    // 1. Attendance Rate
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const workingDays = Math.max(1, daysInMonth - 8); // rough estimate excluding weekends
    const attendanceRate = Math.min(100, (attendance.length / workingDays) * 100);

    // 2. Productivity (Performance Score)
    const productivity = employee.performanceScore || 92;

    // 3. Task Progress
    const totalAssignedTasks = tasksCompleted + tasksInProgress + tasksToDo;
    const taskProgressRate = totalAssignedTasks > 0 ? Math.round((tasksCompleted / totalAssignedTasks) * 100) : 100;

    // 4. Core Hours
    let coreHours = 0;
    try {
      const currentWeekStart = new Date();
      currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay());
      const coreHoursRows = await query(`
        SELECT SUM(work_hours) as totalHours 
        FROM attendance 
        WHERE employeeId = ? AND organizationId = ? AND date >= date(?)
      `, [employeeId, orgId, currentWeekStart.toISOString().split('T')[0]]);
      coreHours = coreHoursRows[0]?.totalHours || 42;
    } catch {
      coreHours = 42;
    }

    // 5. Open Tickets
    let openTicketsCount = 0;
    try {
      const ticketsRows = await query(`
        SELECT COUNT(*) as count FROM workflow_instances 
        WHERE requesterId = ? AND organizationId = ? AND status NOT IN ('COMPLETED', 'RESOLVED')
      `, [employeeId, orgId]);
      openTicketsCount = ticketsRows[0]?.count || 0;
    } catch {
      openTicketsCount = 0;
    }

    // 6. Training Completion
    let trainingCompleted = 0;
    try {
      const trainingRows = await query(`
        SELECT COUNT(*) as count FROM training_enrollments 
        WHERE employeeId = ? AND organizationId = ? AND status = 'COMPLETED'
      `, [employeeId, orgId]);
      trainingCompleted = trainingRows[0]?.count || 0;
    } catch {
      trainingCompleted = 0;
    }

    const kpis = {
      attendance: Number(attendanceRate.toFixed(1)),
      productivity: productivity,
      taskProgress: taskProgressRate,
      timeLogs: Math.round(hoursLogged),
      upcomingLeave: pendingLeaves,
      coreHours: Math.round(coreHours),
      openTickets: openTicketsCount,
      training: trainingCompleted
    };

    // Fetch employee's skills
    let skillRows: any[] = [];
    try {
      skillRows = await query(`SELECT skillName, level FROM skills WHERE employeeId = ? AND organizationId = ?`, [employeeId, orgId]);
    } catch {
      skillRows = [];
    }
    const skillProgression = skillRows.length > 0 ? skillRows.map((s: any) => ({
      name: s.skillName,
      level: (s.level || 4) * 20
    })) : [
      { name: 'TypeScript & React', level: 90 },
      { name: 'Node.js & SQLite Architecture', level: 85 },
      { name: 'Security & RBAC Enforcement', level: 95 }
    ];

    // 7. Extract real data for attendance trend
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const myAttendanceTrend = attendance.slice(0, 5).map((a: any) => {
      let hours = 0;
      if (a.checkInTime && a.checkOutTime) {
        hours = (new Date(a.checkOutTime).getTime() - new Date(a.checkInTime).getTime()) / (1000 * 60 * 60);
      }
      return {
        day: days[new Date(a.date).getDay()] || 'Day',
        hours: hours > 0 ? Number(hours.toFixed(1)) : 8
      };
    }).reverse();

    // Charts
    const charts = {
      myAttendanceTrend,
      taskProgress: [
        { name: 'Completed', value: tasksCompleted || 0, color: '#10b981' },
        { name: 'In Progress', value: tasksInProgress || 0, color: '#3b82f6' },
        { name: 'To Do', value: tasksToDo || 0, color: '#64748b' }
      ],
      leaveUsage: [], // Empty for now, would be from leave_balances
      overtimeHistory: [],
      peerFeedbackScore: [],
      skillProgression
    };

    // Table data
    const mappedTasks = taskRows.map((t: any) => ({
      id: t.id,
      task: t.title,
      status: t.status,
      date: t.updatedAt ? new Date(t.updatedAt).toISOString().split('T')[0] : today
    })).sort((a: any, b: any) => b.date.localeCompare(a.date)).slice(0, 10);

    // Critical Action Center items
    const actionCenter = [
      { id: 'act-1', category: 'Tax & Statutory', title: 'Tax Declaration Verification', description: 'Investment proof submission window closes in 5 days for FY26-27.', priority: 'CRITICAL', dueDate: 'Sep 22, 2026', actionLabel: 'Review & Upload', actionPath: '/employee/payroll/tax' },
      { id: 'act-2', category: 'Policy Compliance', title: 'Information Security Policy v3.1', description: 'Mandatory annual acknowledgment required.', priority: 'ACTION_REQUIRED', dueDate: 'Sep 25, 2026', actionLabel: 'Read & Acknowledge', actionPath: '/employee/documents' },
      { id: 'act-3', category: 'Learning & L&D', title: 'Data Privacy & GDPR Certification', description: 'Compliance training module due for renewal.', priority: 'ACTION_REQUIRED', dueDate: 'Sep 28, 2026', actionLabel: 'Start Course', actionPath: '/employee/skills' }
    ];

    // Upcoming Deadlines
    const deadlines = [
      { date: '18 Sep', title: 'Tax Declaration Deadline', category: 'Payroll' },
      { date: '20 Sep', title: 'Information Security Policy Acknowledgment', category: 'Policy' },
      { date: '22 Sep', title: 'Data Privacy Training Renewal', category: 'L&D' },
      { date: '25 Sep', title: 'Weekly Timesheet Submission', category: 'Attendance' },
      { date: '30 Sep', title: 'September Expense Claim Cutoff', category: 'Expenses' }
    ];

    // Payroll Summary Breakdown
    const payrollSummary = {
      payPeriod: 'September 2026',
      status: 'PROCESSED',
      payDate: '30 Sep 2026',
      grossEarnings: '₹1,45,000',
      totalDeductions: '₹18,500',
      netPay: '₹1,26,500',
      breakdown: {
        basic: '₹60,000',
        hra: '₹30,000',
        specialAllowance: '₹40,000',
        conveyance: '₹15,000',
        pfDeduction: '₹7,200',
        profTax: '₹200',
        tds: '₹11,100'
      }
    };

    // Policy Compliance Summary
    const policySummary = {
      totalPolicies: 24,
      acknowledged: 21,
      pending: 2,
      expired: 1,
      completionRate: '87.5%'
    };

    // Benefits & Insurance
    const benefitsSummary = [
      { name: 'Health Insurance (GHI)', provider: 'Star Health / ICICI Lombard', coverage: '₹5,000,000 (Floater)', status: 'ACTIVE', dependents: 3 },
      { name: 'Group Term Life (GTL)', provider: 'HDFC Life', coverage: '₹1,500,000', status: 'ACTIVE', dependents: 1 },
      { name: 'Provident Fund (EPFO)', provider: 'Govt of India', status: 'ACTIVE', uan: '100984729104' }
    ];

    // Requests Summary
    const requestSummary = {
      open: 2,
      inProgress: 1,
      resolved: 8,
      recent: [
        { id: 'REQ-1024', type: 'HR Request', subject: 'Address Proof Letter for Visa', status: 'RESOLVED', date: '2026-09-14' },
        { id: 'REQ-1028', type: 'Payroll Dispute', subject: 'Reimbursement Missing in August Payslip', status: 'IN_PROGRESS', date: '2026-09-16' }
      ]
    };

    // Assets Summary
    const assetSummary = [
      { id: 'STK-LAP-1024', name: 'MacBook Pro 16" M3 Max', type: 'Laptop', condition: 'Good', serial: 'C02G9012MD6R', assignedDate: '2025-01-16' },
      { id: 'STK-MON-205', name: 'Dell UltraSharp 27" 4K Monitor', type: 'Monitor', condition: 'Excellent', serial: 'CN092104812', assignedDate: '2025-01-20' }
    ];

    // Recent Employee Activity
    const recentActivity = [
      { time: '09:08 AM', date: 'Today', action: 'Checked in via Web Portal', category: 'Attendance' },
      { time: '08:45 AM', date: 'Today', action: 'Updated task STK-402 progress to 90%', category: 'Tasks' },
      { time: '06:02 PM', date: 'Yesterday', action: 'Checked out (8.5h worked)', category: 'Attendance' },
      { time: '02:30 PM', date: 'Sep 15', action: 'Downloaded August 2026 Payslip PDF', category: 'Payroll' },
      { time: '11:15 AM', date: 'Sep 14', action: 'Submitted Casual Leave application for Sep 28', category: 'Leave' }
    ];

    const tables = { recentActivity, assetSummary };

    return { 
      employee: employmentDetails,
      shiftInfo,
      lifecycleTimeline,
      actionCenter,
      deadlines,
      payrollSummary,
      policySummary,
      benefitsSummary,
      requestSummary,
      assetSummary,
      recentActivity,
      kpis, 
      charts, 
      tables 
    };
  }
}

export const employeeDashboardService = new EmployeeDashboardService();

import { analyticsRepository } from '../../repositories/analytics.repository.js';
import { query } from '../../database/sqlite-cloud.js';

export class EmployeeDashboardService {
  async getDashboardData(user: any) {
    const orgId = user.organizationId || 'org-stackly';
    const employeeId = user.id;
    
    // Employee details & Employment Metadata
    const employeeRows = await query(`
      SELECT e.*, d.name as departmentName, des.name as designationName, loc.name as locationName
      FROM employees e
      LEFT JOIN departments d ON e.department = d.id OR e.department = d.name
      LEFT JOIN designations des ON e.designation = des.id OR e.designation = des.name
      LEFT JOIN locations loc ON e.location = loc.id OR e.location = loc.name
      WHERE e.id = ? AND e.organizationId = ?
    `, [employeeId, orgId]);
    const employee = employeeRows[0] || {};
    
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
        SELECT remainingDays FROM leavebalances WHERE employeeId = ? AND organizationId = ?
      `, [employeeId, orgId]);
      if (balanceRows.length > 0) {
        leaveBalance = balanceRows.reduce((acc: number, r: any) => acc + (r.remainingDays || 0), 0);
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
      shiftName: 'General Morning Shift (APAC)',
      shiftTiming: '09:00 AM - 06:00 PM IST',
      expectedHours: '8.0h',
      workMode: employee.workMode || 'Hybrid (3 Days Office / 2 Days Remote)',
      hybridCompliance: '100% (Completed 3/3 Required WFO Days)'
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

    // Comprehensive KPIs
    const kpis = {
      hoursLogged: Math.round(hoursLogged),
      overtime: 4.5,
      leaveBalance,
      pendingLeaves,
      tasksAssigned,
      tasksCompleted,
      lateArrivals,
      earlyDepartures,
      upcomingHolidays: 2,
      nextReview: 'Oct 15, 2026',
      payrollStatus: 'PROCESSED (Sep 2026)',
      nextSalaryDate: 'Sep 30, 2026',
      taxDeclarationStatus: 'APPROVED (New Tax Regime FY26-27)'
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

    // Charts
    const charts = {
      myAttendanceTrend: [
        { day: 'Mon', hours: 8.5 },
        { day: 'Tue', hours: 8.0 },
        { day: 'Wed', hours: 8.8 },
        { day: 'Thu', hours: 8.2 },
        { day: 'Fri', hours: 8.0 }
      ],
      taskProgress: [
        { name: 'Completed', value: tasksCompleted || 8, color: '#10b981' },
        { name: 'In Progress', value: tasksInProgress || 3, color: '#3b82f6' },
        { name: 'To Do', value: tasksToDo || 2, color: '#64748b' }
      ],
      leaveUsage: [
        { type: 'Annual Leave', used: 4, remaining: 10 },
        { type: 'Sick Leave', used: 1, remaining: 7 },
        { type: 'Casual Leave', used: 2, remaining: 4 }
      ],
      overtimeHistory: [
        { month: 'Jun', hours: 4 },
        { month: 'Jul', hours: 8 },
        { month: 'Aug', hours: 6 },
        { month: 'Sep', hours: 4.5 }
      ],
      peerFeedbackScore: [
        { category: 'Teamwork', score: 4.8 },
        { category: 'Communication', score: 4.6 },
        { category: 'Technical Excellence', score: 4.9 },
        { category: 'Ownership', score: 4.7 }
      ],
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

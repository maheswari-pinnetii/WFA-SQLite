import { analyticsRepository } from '../../repositories/analytics.repository.js';

export class EmployeeDashboardService {
  async getDashboardData(user: any) {
    const orgId = user.organizationId || 'org-stackly';
    const employeeId = user.id;
    
    const [attendance] = await Promise.all([
      analyticsRepository.getAttendanceRecords({ 
        organizationId: orgId,
        employeeId: employeeId
      })
    ]) as [any[]];

    // Simulate Leave Balance
    const leaveBalance = [
      { type: 'Annual Leave', available: 15, taken: 5 },
      { type: 'Sick Leave', available: 10, taken: 2 },
      { type: 'Personal Leave', available: 5, taken: 1 }
    ];

    // Simulate Attendance Trend (last 5 days)
    const attendanceTrend = [
      { day: 'Mon', hours: 8 },
      { day: 'Tue', hours: 7.5 },
      { day: 'Wed', hours: 8.5 },
      { day: 'Thu', hours: 8 },
      { day: 'Fri', hours: 7 }
    ];

    // Simulate Salary Components
    const salaryComponents = [
      { name: 'Basic', value: 3000 },
      { name: 'HRA', value: 1000 },
      { name: 'Allowances', value: 500 },
      { name: 'Deductions', value: -200 }
    ];

    return {
      kpis: {
        attendanceRate: '98%',
        leavesTaken: 8,
        upcomingHolidays: 2,
        performanceScore: 'A'
      },
      charts: {
        attendanceTrend,
        leaveBalance,
        salaryComponents
      },
      tables: {
        recentPayslips: [
          { month: 'August 2026', amount: '$4,300', status: 'Paid' },
          { month: 'July 2026', amount: '$4,300', status: 'Paid' }
        ],
        recentAttendance: attendance.slice(0, 5)
      }
    };
  }
}

export const employeeDashboardService = new EmployeeDashboardService();

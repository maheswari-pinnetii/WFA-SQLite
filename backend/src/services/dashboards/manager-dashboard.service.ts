import { analyticsRepository } from '../../repositories/analytics.repository.js';
import { query } from '../../database/sqlite-cloud.js';

export class ManagerDashboardService {
  async getDashboardData(user: any) {
    const orgId = user.organizationId || 'org-stackly';
    const dept = user.department;
    
    // Only query if user has a department, otherwise return empty or all?
    // Let's assume a manager sees their department's data. If no department, maybe they see organization data.
    const deptFilter = dept ? 'AND department = ?' : '';
    const deptParams = dept ? [orgId, dept] : [orgId];

    const employees = await analyticsRepository.getEmployeesSummary(
      dept ? { organizationId: orgId, department: dept } : { organizationId: orgId }
    ) as any[];

    const teamCount = employees.length;
    
    // Calculate Present Today vs On Leave using real data
    const today = new Date().toISOString().split('T')[0];
    const attendanceStats = await query(`
      SELECT ar.status, COUNT(*) as count 
      FROM attendancerecords ar
      JOIN employees e ON ar.employeeId = e.id
      WHERE ar.organizationId = ? AND ar.date = ? ${deptFilter.replace('department', 'e.department')}
      GROUP BY ar.status
    `, [...deptParams.slice(0, 1), today, ...deptParams.slice(1)]);
    
    const attMap: Record<string, number> = {};
    for (const row of attendanceStats) attMap[row.status] = row.count;
    
    const presentToday = attMap['PRESENT'] || 0;
    const onLeave = attMap['ON_LEAVE'] || attMap['On Leave'] || 0;

    // Real task stats for manager's department
    const taskStats = await query(`
      SELECT status, COUNT(*) as count 
      FROM tasks 
      WHERE organizationId = ? ${deptFilter}
      GROUP BY status
    `, deptParams);
    
    const taskMap: Record<string, number> = {};
    for (const t of taskStats) taskMap[t.status] = t.count;
    
    const openTasks = (taskMap['TODO'] || 0) + (taskMap['IN_PROGRESS'] || 0);
    const completedTasks = taskMap['DONE'] || taskMap['COMPLETED'] || 0;
    const taskCompletion = openTasks + completedTasks > 0 ? Math.round((completedTasks / (openTasks + completedTasks)) * 100) : 0;

    // 8 KPIs
    const kpis = {
      teamSize: teamCount,
      presentToday,
      onLeave,
      openTasks,
      taskCompletion, // %
      overtimeHours: 24, // Assuming we don't have real overtime column, keeping static or estimated
      skillGaps: 3,
      upcomingReviews: 2
    };

    // Performance Matrix from actual scores
    const perfScoreRanges = {
      'High Performers': employees.filter(e => e.performanceScore >= 90).length,
      'Solid Contributors': employees.filter(e => e.performanceScore >= 75 && e.performanceScore < 90).length,
      'Needs Development': employees.filter(e => e.performanceScore < 75).length
    };
    
    const performanceMatrix = [
      { name: 'High Performers', value: perfScoreRanges['High Performers'], color: '#6366f1' },
      { name: 'Solid Contributors', value: perfScoreRanges['Solid Contributors'], color: '#10b981' },
      { name: 'Needs Development', value: perfScoreRanges['Needs Development'], color: '#f59e0b' }
    ];

    // 6 Charts
    const charts = {
      teamAttendanceTrend: [
        { day: 'Mon', attendance: 95 },
        { day: 'Tue', attendance: 92 },
        { day: 'Wed', attendance: 98 },
        { day: 'Thu', attendance: 90 },
        { day: 'Fri', attendance: 85 }
      ],
      taskBurnout: [
        { name: 'On Track', value: 70, color: '#10b981' },
        { name: 'At Risk', value: 20, color: '#f59e0b' },
        { name: 'Burned Out', value: 10, color: '#ef4444' }
      ],
      skillCoverage: [
        { skill: 'React', level: 85 },
        { skill: 'Node.js', level: 75 },
        { skill: 'Python', level: 60 },
        { skill: 'AWS', level: 50 },
        { skill: 'Docker', level: 65 }
      ],
      overtimeByWeek: [
        { week: 'W1', hours: 10 },
        { week: 'W2', hours: 15 },
        { week: 'W3', hours: 8 },
        { week: 'W4', hours: 24 }
      ],
      leavePipeline: [
        { month: 'Jan', approved: 2, pending: 1 },
        { month: 'Feb', approved: 4, pending: 0 },
        { month: 'Mar', approved: 1, pending: 3 },
        { month: 'Apr', approved: 5, pending: 2 }
      ],
      performanceMatrix
    };

    // Table
    const tables = {
      roster: employees // Full roster for the employee table
    };

    return { kpis, charts, tables };
  }
}

export const managerDashboardService = new ManagerDashboardService();

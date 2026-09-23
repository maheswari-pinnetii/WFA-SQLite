import { analyticsRepository } from '../../repositories/analytics.repository.js';
import { query } from '../../database/sqlite-cloud.js';

export class HrDashboardService {
  async getDashboardData(user: any) {
    const orgId = user.organizationId || 'org-stackly';
    
    const [
      employees,
      attendance,
      departmentComparison,
      leaveByDeptRows,
      skillsMetrics
    ] = await Promise.all([
      analyticsRepository.getEmployeesSummary({ organizationId: orgId }),
      analyticsRepository.getAttendanceRecords({ organizationId: orgId }),
      analyticsRepository.getDepartmentComparison({ organizationId: orgId }),
      analyticsRepository.getLeaveByDept({ organizationId: orgId }),
      analyticsRepository.getSkillsMetrics({ organizationId: orgId })
    ]) as [any[], any[], any[], any[], any[]];

    const totalHeadcount = employees.length;
    const activeHeadcount = employees.filter(e => e.status === 'ACTIVE').length;

    // Real new hires (e.g. joined in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newHires = employees.filter(e => e.joinDate && new Date(e.joinDate) >= thirtyDaysAgo).length;

    // Turnover calculation
    const terminatedCount = employees.filter(e => e.status === 'TERMINATED' || e.status === 'Terminated').length;
    const turnoverRate = totalHeadcount > 0 ? Number(((terminatedCount / totalHeadcount) * 100).toFixed(1)) : 0;

    // Query pending leave requests
    const leaveReqs = await query(`SELECT COUNT(*) as count FROM leaverequests WHERE status = 'PENDING' AND organizationId = ?`, [orgId]);
    const leaveRequests = leaveReqs[0]?.count || 0;

    // HR Issues (workflow instances)
    const activeWorkflows = await query(`SELECT COUNT(*) as count FROM workflow_instances WHERE status IN ('OPEN', 'IN_PROGRESS') AND organizationId = ?`, [orgId]);
    const hrIssues = activeWorkflows[0]?.count || 0;

    // Workflow types for chart
    const workflowTypesRows = await query(`SELECT type as name, COUNT(*) as value FROM workflow_instances WHERE organizationId = ? GROUP BY type`, [orgId]);
    const hrTicketTypes = workflowTypesRows.length > 0 ? workflowTypesRows : [
      { name: 'Onboarding', value: 0 }
    ];

    // Real Hiring Trend (Last 6 months)
    const hiringTrendRows = await query(`
      SELECT strftime('%Y-%m', joinDate) as month, COUNT(*) as count
      FROM employees
      WHERE organizationId = ? AND joinDate >= date('now', '-6 months')
      GROUP BY month
      ORDER BY month ASC
    `, [orgId]);

    const hiringTrend = hiringTrendRows.map((r: any) => ({
      month: new Date(`${r.month}-01`).toLocaleDateString('en-US', { month: 'short' }),
      hires: r.count
    }));

    // Real Performance Curve
    const perfScoreRanges = {
      'Needs Improvement': employees.filter(e => e.performanceScore < 70).length,
      'Meets Expectations': employees.filter(e => e.performanceScore >= 70 && e.performanceScore < 85).length,
      'Exceeds Expectations': employees.filter(e => e.performanceScore >= 85 && e.performanceScore < 95).length,
      'Outstanding': employees.filter(e => e.performanceScore >= 95).length
    };
    const performanceBellCurve = Object.keys(perfScoreRanges).map(k => ({
      rating: k, count: (perfScoreRanges as any)[k]
    }));

    // 8 KPIs matching config exactly
    const presentTodayRow = await query(`SELECT COUNT(DISTINCT employeeId) as count FROM attendance WHERE date = date('now') AND organizationId = ?`, [orgId]);
    const presentToday = presentTodayRow[0]?.count || 0;
    const attendanceRate = totalHeadcount > 0 ? Number(((presentToday / totalHeadcount) * 100).toFixed(1)) : 0;

    // Check payroll runs
    const payrollRunsRows = await query(`
      SELECT status FROM payroll_runs 
      WHERE organizationId = ? 
      ORDER BY rowid DESC LIMIT 1
    `, [orgId]);
    const latestPayrollStatus = payrollRunsRows.length > 0 ? payrollRunsRows[0].status : null;
    let payrollStatusStr = "Pending Processing";
    if (latestPayrollStatus === 'PROCESSED' || latestPayrollStatus === 'COMPLETED') {
      payrollStatusStr = "100% Processed";
    } else if (latestPayrollStatus === 'DRAFT' || latestPayrollStatus === 'IN_PROGRESS') {
      payrollStatusStr = "Processing Active";
    }

    const kpis = {
      headcount: totalHeadcount,
      presentToday: presentToday,
      attendanceRate: attendanceRate,
      pendingLeaveRequests: leaveRequests,
      pendingApprovals: leaveRequests + hrIssues,
      newJoinersMonth: newHires,
      attritionRate: turnoverRate,
      payrollStatus: payrollStatusStr
    };

    // 6 Charts
    // 6 Charts
    const charts = {
      hiringTrend: hiringTrend,
      retentionRate: [
        { month: 'Jan', rate: 98 },
        { month: 'Feb', rate: 97.5 },
        { month: 'Mar', rate: 98.2 },
        { month: 'Apr', rate: 97.8 },
        { month: 'May', rate: 96.5 },
        { month: 'Jun', rate: turnoverRate > 0 ? (100 - turnoverRate) : 95.8 }
      ],
      leaveByDept: leaveByDeptRows,
      trainingProgress: skillsMetrics.slice(0, 5).map((s: any, i: number) => ({
        name: s.name,
        value: Math.round((s.covered / (s.people || 1)) * 100),
        color: ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'][i % 5]
      })),
      performanceBellCurve,
      hrTicketTypes: hrTicketTypes.map((t: any, i: number) => ({
        name: t.name.replace('_', ' '),
        value: t.value,
        color: ['#8b5cf6', '#ec4899', '#14b8a6', '#64748b', '#f59e0b'][i % 5]
      }))
    };

    // Table
    const tables = {
      roster: employees
    };

    return { kpis, charts, tables };
  }
}

export const hrDashboardService = new HrDashboardService();

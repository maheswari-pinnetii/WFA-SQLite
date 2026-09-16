import { analyticsRepository } from '../../repositories/analytics.repository.js';
import { Employee } from '../../models/index.js';

export class HrDashboardService {
  async getDashboardData(user: any) {
    const orgId = user.organizationId || 'org-stackly';
    
    const [
      employees,
      attendance
    ] = await Promise.all([
      analyticsRepository.getEmployeesSummary({ organizationId: orgId }),
      analyticsRepository.getAttendanceRecords({ organizationId: orgId })
    ]) as [any[], any[]];

    const totalHeadcount = employees.length;
    const activeHeadcount = employees.filter(e => e.status === 'Active').length;
    
    // Simulate Leave Utilization
    const leaveUtilization = [
      { name: 'Sick Leave', value: 45 },
      { name: 'Casual Leave', value: 30 },
      { name: 'Earned Leave', value: 25 }
    ];

    // Simulate Hiring Funnel
    const hiringFunnel = [
      { stage: 'Applied', count: 120 },
      { stage: 'Screened', count: 80 },
      { stage: 'Interviewed', count: 40 },
      { stage: 'Offered', count: 15 },
      { stage: 'Hired', count: 10 }
    ];

    // Simulate Tenure Distribution
    const tenureDistribution = [
      { category: '< 1 Year', count: employees.filter(e => {
        const j = new Date(e.joinDate);
        return (new Date().getTime() - j.getTime()) < (365 * 24 * 60 * 60 * 1000);
      }).length },
      { category: '1-3 Years', count: employees.filter(e => {
        const j = new Date(e.joinDate);
        const diff = (new Date().getTime() - j.getTime());
        return diff >= (365 * 24 * 60 * 60 * 1000) && diff < (3 * 365 * 24 * 60 * 60 * 1000);
      }).length },
      { category: '> 3 Years', count: employees.filter(e => {
        const j = new Date(e.joinDate);
        return (new Date().getTime() - j.getTime()) >= (3 * 365 * 24 * 60 * 60 * 1000);
      }).length }
    ];

    return {
      kpis: {
        totalHeadcount,
        activeHeadcount,
        openRequisitions: 12,
        pendingLeaves: 5
      },
      charts: {
        leaveUtilization,
        hiringFunnel,
        tenureDistribution
      },
      tables: {
        pendingActions: [
          { action: 'Review Leave Request', user: 'John Doe', date: new Date().toISOString() },
          { action: 'Offer Letter Approval', user: 'Jane Smith', date: new Date().toISOString() }
        ]
      }
    };
  }
}

export const hrDashboardService = new HrDashboardService();

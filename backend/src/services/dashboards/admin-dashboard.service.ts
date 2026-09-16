import { analyticsRepository } from '../../repositories/analytics.repository.js';
import { Employee } from '../../models/index.js';

export class AdminDashboardService {
  async getDashboardData(user: any) {
    const orgId = user.organizationId || 'org-stackly';
    
    // Use analytics repo for basic metrics
    const [
      employees,
      departmentComparison,
      roleDistribution
    ] = await Promise.all([
      analyticsRepository.getEmployeesSummary({ organizationId: orgId }),
      analyticsRepository.getDepartmentComparison({ organizationId: orgId }),
      analyticsRepository.getRoleDistribution({ organizationId: orgId })
    ]) as [any[], any[], any[]];

    const totalHeadcount = employees.length;
    const activeHeadcount = employees.filter(e => e.status === 'Active').length;
    const onLeaveHeadcount = employees.filter(e => e.status === 'On Leave').length;
    const terminatedHeadcount = employees.filter(e => e.status === 'Terminated').length;

    // Simulate payroll cost (in a real app, this would come from a payroll repo)
    const payrollCost = totalHeadcount * 5000; 

    // Headcount trend over last 6 months (mocked for visualization)
    const headcountTrend = [
      { month: 'Jan', headcount: Math.round(totalHeadcount * 0.8) },
      { month: 'Feb', headcount: Math.round(totalHeadcount * 0.85) },
      { month: 'Mar', headcount: Math.round(totalHeadcount * 0.9) },
      { month: 'Apr', headcount: Math.round(totalHeadcount * 0.92) },
      { month: 'May', headcount: Math.round(totalHeadcount * 0.98) },
      { month: 'Jun', headcount: totalHeadcount },
    ];

    return {
      kpis: {
        totalHeadcount,
        activeHeadcount,
        onLeaveHeadcount,
        terminatedHeadcount,
        payrollCost
      },
      charts: {
        headcountTrend,
        employeesByDept: departmentComparison,
        roleDistribution
      },
      tables: {
        recentJoiners: employees.sort((a, b) => new Date(b.joinDate || 0).getTime() - new Date(a.joinDate || 0).getTime()).slice(0, 5)
      }
    };
  }
}

export const adminDashboardService = new AdminDashboardService();

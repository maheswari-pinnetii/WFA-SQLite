import { analyticsRepository } from '../../repositories/analytics.repository.js';
import { Employee } from '../../models/index.js';

export class ManagerDashboardService {
  async getDashboardData(user: any) {
    const orgId = user.organizationId || 'org-stackly';
    const dept = user.department;
    
    const employees = await analyticsRepository.getEmployeesSummary({ 
      organizationId: orgId,
      department: dept
    }) as any[];

    const teamCount = employees.length;
    
    // Simulate Team Workload
    const teamWorkload = employees.map(emp => ({
      name: emp.name || `User ${emp.id}`,
      tasks: Math.floor(Math.random() * 10) + 1,
      hoursLogged: Math.floor(Math.random() * 40) + 20
    }));

    // Simulate Capacity vs Utilization
    const capacityVsUtilization = [
      { week: 'W1', capacity: teamCount * 40, utilization: teamCount * 35 },
      { week: 'W2', capacity: teamCount * 40, utilization: teamCount * 38 },
      { week: 'W3', capacity: teamCount * 40, utilization: teamCount * 42 },
      { week: 'W4', capacity: teamCount * 40, utilization: teamCount * 39 },
    ];

    return {
      kpis: {
        teamSize: teamCount,
        openTasks: teamWorkload.reduce((acc, w) => acc + w.tasks, 0),
        avgProductivity: '92%',
        pendingApprovals: 3
      },
      charts: {
        teamWorkload,
        capacityVsUtilization
      },
      tables: {
        teamOverview: employees
      }
    };
  }
}

export const managerDashboardService = new ManagerDashboardService();

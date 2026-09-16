import { analyticsRepository } from '../../repositories/analytics.repository.js';

export class TeamLeadDashboardService {
  async getDashboardData(user: any) {
    const orgId = user.organizationId || 'org-stackly';
    const team = user.team;
    
    const employees = await analyticsRepository.getEmployeesSummary({ 
      organizationId: orgId,
      team: team
    }) as any[];

    const teamCount = employees.length;
    
    // Simulate Sprint Progress
    const sprintProgress = [
      { status: 'To Do', count: 12 },
      { status: 'In Progress', count: 8 },
      { status: 'In Review', count: 4 },
      { status: 'Done', count: 15 }
    ];

    // Simulate Sprint Burndown
    const sprintBurndown = [
      { day: 'Day 1', remaining: 40 },
      { day: 'Day 2', remaining: 35 },
      { day: 'Day 3', remaining: 30 },
      { day: 'Day 4', remaining: 20 },
      { day: 'Day 5', remaining: 15 },
    ];

    // Simulate Task Status
    const taskStatus = employees.map(emp => ({
      name: emp.name || `User ${emp.id}`,
      completed: Math.floor(Math.random() * 5),
      pending: Math.floor(Math.random() * 3) + 1
    }));

    return {
      kpis: {
        teamSize: teamCount,
        sprintVelocity: '42 pts',
        blockedTasks: 2,
        codeReviews: 5
      },
      charts: {
        sprintProgress,
        sprintBurndown,
        taskStatus
      },
      tables: {
        sprintTasks: [
          { id: 'TSK-101', title: 'Implement Dashboard', assignee: 'Jane', status: 'In Progress' },
          { id: 'TSK-102', title: 'Fix Auth Bug', assignee: 'John', status: 'Blocked' }
        ],
        blockedTasks: [
          { id: 'TSK-102', title: 'Fix Auth Bug', reason: 'Waiting for API response' }
        ]
      }
    };
  }
}

export const teamLeadDashboardService = new TeamLeadDashboardService();

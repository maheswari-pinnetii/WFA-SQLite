import { analyticsRepository } from './analytics.repository.js';

const getScope = (user: any, employeeIdKey = 'employeeId') => {
  const query: any = { organizationId: user.organizationId || 'org-stackly' };
  if (user.role === 'MANAGER') query.department = user.department;
  if (user.role === 'TEAM_LEAD') query.team = user.team;
  if (user.role === 'EMPLOYEE') query[employeeIdKey] = user.id;
  return query;
};

export class WorkforcePlanningService {
  async getScenarios(reqUser: any) {
    const employees = await analyticsRepository.getEmployeesSummary(getScope(reqUser, 'id'));
    const totalEmployees = employees.length || 1; // avoid div/0
    
    // Baseline growth assumptions
    const baseGrowthRate = 0.15; // 15%
    const baseAttritionRate = 0.10; // 10%
    
    const scenarios = [
      {
        scenario: 'Best Case (Aggressive Growth, Low Attrition)',
        projectedGrowthRate: baseGrowthRate + 0.10, // 25%
        projectedAttritionRate: Math.max(0, baseAttritionRate - 0.05), // 5%
        description: 'Assumes successful hiring campaigns and high employee retention.',
      },
      {
        scenario: 'Expected (Baseline)',
        projectedGrowthRate: baseGrowthRate,
        projectedAttritionRate: baseAttritionRate,
        description: 'Based on current historical averages and standard turnover.',
      },
      {
        scenario: 'Worst Case (Low Growth, High Attrition)',
        projectedGrowthRate: Math.max(0, baseGrowthRate - 0.10), // 5%
        projectedAttritionRate: baseAttritionRate + 0.08, // 18%
        description: 'Assumes hiring freezes or difficulty attracting talent, coupled with elevated turnover.',
      }
    ];

    const results = scenarios.map(s => {
      const newHires = Math.round(totalEmployees * s.projectedGrowthRate);
      const departing = Math.round(totalEmployees * s.projectedAttritionRate);
      const netChange = newHires - departing;
      const finalHeadcount = totalEmployees + netChange;
      
      return {
        ...s,
        currentHeadcount: totalEmployees,
        projectedNewHires: newHires,
        projectedDepartures: departing,
        netChange,
        finalHeadcount
      };
    });

    return results;
  }
}

export const workforcePlanningService = new WorkforcePlanningService();
export default workforcePlanningService;

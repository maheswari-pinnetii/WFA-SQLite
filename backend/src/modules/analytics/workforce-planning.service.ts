import { analyticsRepository } from './analytics.repository.js';

export class WorkforcePlanningService {
  async getScenarios(reqUser: any, filters?: any) {
    const orgId = reqUser.organizationId || 'org-stackly';
    const queryFilters = { ...filters, organizationId: orgId };
    
    const employees = await analyticsRepository.getEmployeesSummary(queryFilters);
    const totalEmployees = employees.length || 1; // avoid div/0
    
    // Dynamically calculate baseline assumptions based on real historical rates
    const rates = await analyticsRepository.getHistoricalRates(queryFilters);
    const baseGrowthRate = rates.growthRate;
    const baseAttritionRate = rates.attritionRate;
    
    const scenarios = [
      {
        scenario: 'Best Case (Aggressive Growth, Low Attrition)',
        projectedGrowthRate: baseGrowthRate + 0.10, // 10% higher than baseline
        projectedAttritionRate: Math.max(0, baseAttritionRate - 0.05), // 5% lower than baseline
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
        projectedGrowthRate: Math.max(0, baseGrowthRate - 0.10), // 10% lower
        projectedAttritionRate: baseAttritionRate + 0.08, // 8% higher
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
        projectedNewHires: Math.max(0, newHires),
        projectedDepartures: Math.max(0, departing),
        netChange,
        finalHeadcount: Math.max(0, finalHeadcount)
      };
    });

    return results;
  }
}

export const workforcePlanningService = new WorkforcePlanningService();
export default workforcePlanningService;

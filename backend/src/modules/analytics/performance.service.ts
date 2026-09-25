import { analyticsRepository } from './analytics.repository.js';
import { query } from '../../database/sqlite-cloud.js';

const getScope = (user: any, employeeIdKey = 'employeeId') => {
  const q: any = { organizationId: user.organizationId || 'org-stackly' };
  if (user.role === 'MANAGER') q.department = user.department;
  if (user.role === 'TEAM_LEAD') q.team = user.team;
  if (user.role === 'EMPLOYEE') q[employeeIdKey] = user.id;
  return q;
};

export class PerformanceService {
  async getPerformanceOverview(reqUser: any) {
    const scope = getScope(reqUser, 'id');
    const employees = await analyticsRepository.getEmployeesSummary(scope);
    
    let exceptional = 0;
    let strong = 0;
    let meets = 0;
    let needsImprovement = 0;

    let highPotential = 0;
    let coreContributors = 0;

    let totalScore = 0;
    let appraised = 0;

    employees.forEach((emp: any) => {
      const score = emp.performanceScore || 0;
      if (score > 0) {
        appraised++;
        totalScore += (score / 10);
        
        if (score >= 90) exceptional++;
        else if (score >= 80) strong++;
        else if (score >= 70) meets++;
        else needsImprovement++;

        // Mocking 9-box potential
        if (score >= 85) highPotential++;
        else if (score >= 70) coreContributors++;
      }
    });

    const avg = appraised > 0 ? (totalScore / appraised).toFixed(1) : "0.0";
    
    return {
      totalAppraised: appraised,
      topTalentTier: exceptional,
      corporateAverage: avg,
      growthReadiness: appraised > 0 ? ((highPotential / appraised) * 100).toFixed(1) : "0.0",
      ratingsDistribution: [
        { rating: 'Exceptional (9-10)', count: exceptional, percentage: appraised ? Math.round((exceptional / appraised) * 100) + '%' : '0%' },
        { rating: 'Strong (8-9)', count: strong, percentage: appraised ? Math.round((strong / appraised) * 100) + '%' : '0%' },
        { rating: 'Meets Standards (7-8)', count: meets, percentage: appraised ? Math.round((meets / appraised) * 100) + '%' : '0%' },
        { rating: 'Needs Improvement (<7)', count: needsImprovement, percentage: appraised ? Math.round((needsImprovement / appraised) * 100) + '%' : '0%' }
      ],
      talentGrid: {
        highPotential,
        coreContributors
      }
    };
  }
}

export const performanceService = new PerformanceService();

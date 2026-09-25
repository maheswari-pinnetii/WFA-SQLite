import { analyticsRepository } from './analytics.repository.js';

const getScope = (user: any, employeeIdKey = 'employeeId') => {
  const query: any = { organizationId: user.organizationId || 'org-stackly' };
  if (user.role === 'MANAGER') query.department = user.department;
  if (user.role === 'TEAM_LEAD') query.team = user.team;
  if (user.role === 'EMPLOYEE') query[employeeIdKey] = user.id;
  return query;
};

export class DemandService {
  async getDemandForecasting(reqUser: any) {
    const employees = await analyticsRepository.getEmployeesSummary(getScope(reqUser, 'id'));
    
    // Derive dept distribution from current workforce
    const deptCounts: Record<string, number> = {};
    employees.forEach((e: any) => {
      const dept = e.department || 'Unassigned';
      deptCounts[dept] = (deptCounts[dept] || 0) + 1;
    });

    const growthRate = 0.15; // Assumed 15% growth based on historical trends
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    const currentQuarter = Math.ceil((new Date().getMonth() + 1) / 3);
    const year = new Date().getFullYear();

    const hiringByQuarter = quarters.map((q, i) => {
      const qNum = ((currentQuarter - 1 + i) % 4) + 1;
      const yr = year + Math.floor((currentQuarter - 1 + i) / 4);
      const hiring = Math.round(employees.length * growthRate / 4);
      return { quarter: `${yr} Q${qNum}`, projected: hiring, confirmed: Math.round(hiring * 0.6) };
    });

    const hiringByDept = Object.entries(deptCounts).map(([dept, count]) => ({
      department: dept,
      current: count,
      projected: Math.round(count * (1 + growthRate)),
      needed: Math.round(count * growthRate),
    }));

    const skills = await analyticsRepository.getSkillsMetrics(getScope(reqUser, 'id'));
    const requiredSkills = skills.slice(0, 10).map((s: any) => ({
      skill: s.name,
      currentCoverage: s.people,
      projectedDemand: Math.round(s.people * 1.2),
      gap: Math.max(0, Math.round(s.people * 0.2)),
    }));

    return {
      hiringByQuarter,
      hiringByDept,
      requiredSkills,
      expectedShortages: hiringByDept.filter((d: any) => d.needed > 5).map((d: any) => ({
        department: d.department,
        shortage: d.needed,
        severity: d.needed > 10 ? 'High' : d.needed > 5 ? 'Medium' : 'Low',
      })),
      totalProjectedHiring: hiringByQuarter.reduce((sum: number, q: any) => sum + q.projected, 0),
    };
  }
}

export const demandService = new DemandService();
export default demandService;

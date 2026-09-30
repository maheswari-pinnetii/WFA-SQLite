import { analyticsRepository } from './analytics.repository.js';
import { statisticalEngine } from '../ai/services/statisticalEngine.js';

export class AttritionService {
  async getAttritionRiskDashboard(reqUser: any, filters?: any) {
    const orgId = reqUser.organizationId || 'org-stackly';
    const queryFilters = { ...filters, organizationId: orgId };
    const employees = await analyticsRepository.getAttritionRiskScores(queryFilters);

    // Provide the raw data to the statistical engine to do the scoring
    const riskScored = statisticalEngine.calculateAttritionRisk(employees);

    // Department risk aggregation
    const deptRisk: Record<string, { total: number; high: number; medium: number; low: number }> = {};
    riskScored.forEach((e: any) => {
      if (!deptRisk[e.department]) deptRisk[e.department] = { total: 0, high: 0, medium: 0, low: 0 };
      deptRisk[e.department].total++;
      if (e.riskCategory === 'High') deptRisk[e.department].high++;
      else if (e.riskCategory === 'Medium') deptRisk[e.department].medium++;
      else deptRisk[e.department].low++;
    });

    const riskDistribution = [
      { name: 'High Risk', value: riskScored.filter((e: any) => e.riskCategory === 'High').length },
      { name: 'Medium Risk', value: riskScored.filter((e: any) => e.riskCategory === 'Medium').length },
      { name: 'Low Risk', value: riskScored.filter((e: any) => e.riskCategory === 'Low').length },
    ];

    const topFactors = [
      'Below-average performance', 'Inconsistent attendance', 'New hire retention risk',
      'Mid-tenure flight risk window', 'Low engagement indicators', 'Critical performance deficit',
    ].map(factor => ({
      factor,
      count: riskScored.filter((e: any) => e.contributingFactors.includes(factor)).length,
    })).filter(f => f.count > 0).sort((a, b) => b.count - a.count);

    // IMPORTANT: This is a rule-based scoring engine, NOT a trained ML model.
    // Hard-coded model metrics (accuracy, precision, recall) have been removed.
    // Real metrics must be generated from a model_evaluations run (see S3.3 spec).
    const modelMetrics = {
      scoringMethod: 'rule-based',
      modelVersion: 'stat-engine-v2.1',
      disclaimer: 'Rule-based risk scoring. Not a validated ML model. Accuracy/precision/recall metrics require a model evaluation pipeline (S3-GAP-02).',
      lastUpdated: new Date().toISOString().substring(0, 10),
    };

    return {
      summary: {
        totalAnalyzed: employees.length,
        highRiskCount: riskDistribution.find(d => d.name === 'High Risk')?.value || 0,
        mediumRiskCount: riskDistribution.find(d => d.name === 'Medium Risk')?.value || 0,
        lowRiskCount: riskDistribution.find(d => d.name === 'Low Risk')?.value || 0,
        overallRiskScore: employees.length ? Math.round((riskScored.reduce((sum: number, e: any) => sum + e.riskScore, 0)) / employees.length) : 0,
      },
      departmentRisk: Object.entries(deptRisk).map(([dept, counts]) => ({
        department: dept, ...counts
      })).sort((a, b) => b.high - a.high),
      riskDistribution,
      topContributingFactors: topFactors,
      modelMetrics,
      highRiskEmployees: riskScored.filter((e: any) => e.riskCategory === 'High').sort((a: any, b: any) => b.riskScore - a.riskScore).slice(0, 50),
      riskDetails: riskScored.sort((a: any, b: any) => b.riskScore - a.riskScore).slice(0, 50),
    };
  }
}

export const attritionService = new AttritionService();
export default attritionService;

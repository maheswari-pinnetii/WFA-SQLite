import { query } from '../../database/connection.js';
import { buildWhereClause } from './analytics.repository.js';

export class RecruitmentAnalyticsService {
  async getRecruitmentDashboard(user: any, filters?: any) {
    const orgId = user.organizationId || 'org-stackly';
    
    const queryFilters = { ...filters, organizationId: orgId };
    const { clause: reqClause, params: reqParams } = buildWhereClause(queryFilters, 'r');
    
    // Build the query clause for reqs, handling the existing WHERE correctly
    const reqWhere = reqClause ? `${reqClause} AND p.status = 'OPEN'` : `WHERE p.status = 'OPEN'`;
    
    // Fetch open positions (job_postings)
    const reqs = await query(
      `SELECT p.id, 'General' as department, p.createdAt as targetHireDate FROM job_postings p ${reqWhere}`,
      reqParams
    );
    const openPositions = reqs.length;

    // Fetch applications
    const apps = await query(
      `SELECT c.id, c.status, c.jobId, c.appliedAt 
       FROM candidates c
       JOIN job_postings p ON c.jobId = p.id
       ${reqClause.replace('r.', 'p.')}`,
      reqParams
    );

    const applications = apps.length;
    const interviewing = apps.filter((a: any) => a.status === 'INTERVIEWING').length;
    const offered = apps.filter((a: any) => a.status === 'OFFERED').length;
    const hired = apps.filter((a: any) => a.status === 'HIRED').length;
    
    const shortlisted = Math.max(0, applications - interviewing - offered - hired);

    const funnel = [
      { name: "Open Positions", value: openPositions, fill: "#6366f1" },
      { name: "Applications", value: applications, fill: "#06b6d4" },
      { name: "Shortlisted", value: shortlisted, fill: "#10b981" },
      { name: "Interviews", value: interviewing, fill: "#f59e0b" },
      { name: "Offers Made", value: offered, fill: "#8b5cf6" },
      { name: "Hired", value: hired, fill: "#ef4444" },
    ];

    // Department Distribution
    const deptMap: Record<string, { openings: number, applications: number, hired: number }> = {};
    reqs.forEach((r: any) => {
      const dept = r.department || 'Unknown';
      if (!deptMap[dept]) deptMap[dept] = { openings: 0, applications: 0, hired: 0 };
      deptMap[dept].openings++;
    });
    apps.forEach((a: any) => {
      const req = reqs.find((r: any) => r.id === a.jobId);
      const dept = req ? req.department : 'Unknown';
      if (!deptMap[dept]) deptMap[dept] = { openings: 0, applications: 0, hired: 0 };
      deptMap[dept].applications++;
      if (a.status === 'HIRED') deptMap[dept].hired++;
    });

    const hiringByDept = Object.entries(deptMap).map(([dept, counts]) => ({
      dept,
      ...counts
    }));

    const sourceDistribution: any[] = [];

    const kpis = {
      openPositions,
      totalApplications: applications,
      offerAcceptanceRate: offered > 0 ? Math.round((hired / offered) * 100) : 0,
      avgTimeToHire: 0, // Replaced hardcoded proxy with 0 until tracking added
      costPerHire: 0,   // Replaced hardcoded proxy with 0 until tracking added
      hiredThisQuarter: hired,
    };

    return { funnel, hiringByDept, sourceDistribution, kpis };
  }
}

export const recruitmentAnalyticsService = new RecruitmentAnalyticsService();

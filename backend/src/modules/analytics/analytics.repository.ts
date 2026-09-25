import { query } from '../../database/sqlite-cloud.js';

export function buildWhereClause(queryData: any, alias: string = '') {
  const clauses: string[] = [];
  const params: any[] = [];
  const pfx = alias ? `${alias}.` : '';
  
  for (const [key, value] of Object.entries(queryData)) {
    if (value === undefined || value === null) continue;
    
    if (key === 'companyId' || key === 'organizationId') {
      clauses.push(`(${pfx}companyId = ? OR ${pfx}organizationId = ?)`);
      params.push(value, value);
    } else if (value instanceof RegExp) {
      const val = value.source.replace('^', '').replace('$', '').replace(/\\/g, '');
      clauses.push(`${pfx}${key} LIKE ?`);
      params.push(`%${val}%`);
    } else if (typeof value === 'object' && value !== null && !(value instanceof Date)) {
      const operators = Object.keys(value);
      operators.forEach(op => {
        if (op === '$ne') {
          clauses.push(`${pfx}${key} != ?`);
          const val = (value as any)[op];
          params.push(val instanceof Date ? val.toISOString() : val);
        } else if (op === '$gte') {
          clauses.push(`${pfx}${key} >= ?`);
          const val = (value as any)[op];
          params.push(val instanceof Date ? val.toISOString() : val);
        } else if (op === '$lte') {
          clauses.push(`${pfx}${key} <= ?`);
          const val = (value as any)[op];
          params.push(val instanceof Date ? val.toISOString() : val);
        } else if (op === '$in') {
          const list = (value as any)[op];
          if (Array.isArray(list) && list.length > 0) {
            const placeholders = list.map(() => '?').join(', ');
            clauses.push(`${pfx}${key} IN (${placeholders})`);
            params.push(...list);
          } else if (Array.isArray(list) && list.length === 0) {
            clauses.push(`1=0`);
          }
        }
      });
    } else {
      clauses.push(`${pfx}${key} = ?`);
      params.push(value instanceof Date ? value.toISOString() : value);
    }
  }

  return {
    clause: clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '',
    params
  };
}

export class AnalyticsRepository {
  async getEmployeesSummary(queryData: any) {
    const { clause, params } = buildWhereClause(queryData);
    const sql = `
      SELECT id, employeeCode, name, designation, department, team, role, status, performanceScore, attendanceRate, joinDate 
      FROM employees 
      ${clause}
    `;
    console.log('[DEBUG] getEmployeesSummary SQL:', sql, 'PARAMS:', params);
    try {
      const rows = await query(sql, params);
      console.log('[DEBUG] getEmployeesSummary returned rows:', rows.length);
      return rows;
    } catch (e) {
      console.log('[DEBUG] getEmployeesSummary error:', e);
      return [];
    }
  }

  async getDashboardSummaryMV(orgId: string) {
    const rows = await query(`
      SELECT totalEmployees, lastCalculatedAt 
      FROM dashboard_summary_mv 
      WHERE organizationId = ?
    `, [orgId]);
    return rows.length ? rows[0] : null;
  }

  async getAttendanceRecords(queryData: any) {
    const { clause, params } = buildWhereClause(queryData);
    const rows = await query(`
      SELECT employeeId, date, status, workMode, checkInTime, checkOutTime, createdAt 
      FROM attendancerecords 
      ${clause}
      ORDER BY date DESC
      LIMIT 500
    `, params);
    return rows;
  }

  async getDepartmentComparison(queryData: any) {
    const { clause, params } = buildWhereClause(queryData);
    const rows = await query(`
      SELECT 
        COALESCE(department, 'Unassigned') as name,
        COUNT(*) as headcount,
        ROUND(AVG(performanceScore), 1) as performance,
        ROUND(AVG(attendanceRate), 1) as attendance
      FROM employees
      ${clause}
      GROUP BY department
      ORDER BY headcount DESC
    `, params);
    return rows;
  }

  async getRoleDistribution(queryData: any) {
    const { clause, params } = buildWhereClause(queryData);
    const rows = await query(`
      SELECT role as name, COUNT(*) as value
      FROM employees
      ${clause}
      GROUP BY role
      ORDER BY value DESC
    `, params);
    return rows;
  }

  async getEmploymentStatus(queryData: any) {
    const { clause, params } = buildWhereClause(queryData);
    const rows = await query(`
      SELECT status as name, COUNT(*) as value
      FROM employees
      ${clause}
      GROUP BY status
      ORDER BY value DESC
    `, params);
    return rows;
  }

  async getWorkModeDistribution(queryData: any) {
    const { clause, params } = buildWhereClause(queryData);
    const rows = await query(`
      SELECT workMode as name, COUNT(DISTINCT employeeId) as value
      FROM attendancerecords
      ${clause}
      GROUP BY workMode
    `, params);
    return rows;
  }

  async getPerformanceByQuarter(queryData: any) {
    const { clause, params } = buildWhereClause(queryData, 'p');
    const where = clause ? `${clause} AND (p.createdAt >= e.joinDate OR e.joinDate IS NULL)` : `WHERE (p.createdAt >= e.joinDate OR e.joinDate IS NULL)`;
    const rows = await query(`
      SELECT 
        p.quarter as name,
        ROUND(AVG(p.kpiScore), 1) as performance,
        ROUND(AVG(p.targetScore), 1) as target,
        ROUND(AVG(p.productivityScore), 1) as productivity
      FROM performancerecords p
      JOIN employees e ON p.employeeId = e.id
      ${where}
      GROUP BY p.quarter
      ORDER BY name ASC
    `, params);
    return rows;
  }

  async getTeamProductivity(queryData: any) {
    const { clause, params } = buildWhereClause(queryData, 'p');
    const where = clause ? `${clause} AND (p.createdAt >= e.joinDate OR e.joinDate IS NULL)` : `WHERE (p.createdAt >= e.joinDate OR e.joinDate IS NULL)`;
    const rows = await query(`
      SELECT 
        COALESCE(p.team, 'Unassigned') as name,
        ROUND(AVG(p.productivityScore), 1) as productivity,
        COUNT(DISTINCT p.employeeId) as members
      FROM performancerecords p
      JOIN employees e ON p.employeeId = e.id
      ${where}
      GROUP BY p.team
      ORDER BY productivity DESC
    `, params);
    return rows;
  }

  async getSkillsMetrics(queryData: any) {
    const { clause, params } = buildWhereClause(queryData);
    const rows = await query(`
      SELECT 
        skillName as name,
        ROUND(AVG(level), 1) as averageLevel,
        COUNT(DISTINCT employeeId) as people,
        SUM(CASE WHEN level >= 3 THEN 1 ELSE 0 END) as covered,
        SUM(CASE WHEN level <= 2 THEN 1 ELSE 0 END) as gap
      FROM skills
      ${clause}
      GROUP BY skillName
    `, params);
    return rows;
  }

  async getStaffSkillsRoster(queryData: any) {
    const { clause, params } = buildWhereClause(queryData, 'e');
    const rows = await query(`
      SELECT 
        e.id,
        e.name,
        COALESCE(e.designation, e.role) as role,
        GROUP_CONCAT(s.skillName, ', ') as primarySkills,
        'N/A' as certification
      FROM employees e
      LEFT JOIN skills s ON e.id = s.employeeId
      ${clause}
      GROUP BY e.id
      ORDER BY e.name ASC
      LIMIT 100
    `, params);
    return rows;
  }

  async getTasksSummary(queryData: any) {
    const { clause, params } = buildWhereClause(queryData);
    const rows = await query(`
      SELECT status, COUNT(*) as count 
      FROM tasks 
      ${clause}
      GROUP BY status
    `, params);
    return rows;
  }

  async getLeaveTrends(queryData: any) {
    const { clause, params } = buildWhereClause(queryData);
    const whereClause = clause ? `${clause} AND startDate IS NOT NULL` : `WHERE startDate IS NOT NULL`;
    const rows = await query(`
      SELECT strftime('%Y-%m', startDate) as month, COUNT(*) as count
      FROM leaverequests
      ${whereClause}
      GROUP BY month
      ORDER BY month ASC
      LIMIT 6
    `, params);
    return rows;
  }

  async getLeaveByDept(queryData: any) {
    const { clause, params } = buildWhereClause(queryData);
    // Join with employees to get the department from the employee record
    const orgId = queryData.organizationId || queryData.companyId || 'org-stackly';
    const rows = await query(`
      SELECT COALESCE(e.department, 'Unassigned') as name, COUNT(*) as count
      FROM leaverequests lr
      LEFT JOIN employees e ON lr.employeeId = e.id
      WHERE (lr.organizationId = ? OR lr.companyId = ?)
      GROUP BY e.department
      ORDER BY count DESC
    `, [orgId, orgId]);
    return rows;
  }

  async getAttendanceTrend(queryData: any) {
    const { clause, params } = buildWhereClause(queryData);
    const whereClause = clause ? `${clause} AND status = 'PRESENT'` : `WHERE status = 'PRESENT'`;
    const rows = await query(`
      SELECT date, COUNT(*) as count
      FROM attendancerecords
      ${whereClause}
      GROUP BY date
      ORDER BY date DESC
      LIMIT 7
    `, params);
    return rows;
  }

  async getTasksList(queryData: any) {
    const { clause, params } = buildWhereClause(queryData);
    const rows = await query(`
      SELECT id, status, priority, points, createdAt, updatedAt
      FROM tasks
      ${clause}
    `, params);
    return rows;
  }

  async getLeaveRequestsSummary(queryData: any) {
    const { clause, params } = buildWhereClause(queryData);
    const rows = await query(`
      SELECT id, status, type, startDate, endDate, createdAt, updatedAt
      FROM leaverequests
      ${clause}
    `, params);
    return rows;
  }
  async getLocationDistribution(queryData: any) {
    const { clause, params } = buildWhereClause(queryData);
    const rows = await query(`
      SELECT 
        COALESCE(locationId, location, 'Remote') as name,
        COUNT(*) as value
      FROM employees
      ${clause}
      GROUP BY name
      ORDER BY value DESC
    `, params);
    return rows;
  }

  async getExperienceDistribution(queryData: any) {
    const { clause, params } = buildWhereClause(queryData);
    const rows = await query(`
      SELECT
        CASE
          WHEN julianday('now') - julianday(joinDate) < 365 THEN '0-1 years'
          WHEN julianday('now') - julianday(joinDate) < 1095 THEN '1-3 years'
          WHEN julianday('now') - julianday(joinDate) < 1825 THEN '3-5 years'
          WHEN julianday('now') - julianday(joinDate) < 2920 THEN '5-8 years'
          ELSE '8+ years'
        END as name,
        COUNT(*) as value
      FROM employees
      ${clause}
      GROUP BY name
      ORDER BY
        CASE name
          WHEN '0-1 years' THEN 1
          WHEN '1-3 years' THEN 2
          WHEN '3-5 years' THEN 3
          WHEN '5-8 years' THEN 4
          ELSE 5
        END
    `, params);
    return rows;
  }

  async getOpenPositionsCount(queryData: any) {
    const { clause, params } = buildWhereClause(queryData);
    // Since job_requisitions might not have all employee fields, we map the filters safely
    // Or we just rely on buildWhereClause to filter by department, location, etc.
    // Ensure status is OPEN, ACTIVE, or APPROVED
    const statusClause = clause ? `AND status IN ('OPEN', 'ACTIVE', 'APPROVED')` : `WHERE status IN ('OPEN', 'ACTIVE', 'APPROVED')`;
    const finalClause = clause ? `${clause} ${statusClause}` : statusClause;
    
    try {
      const rows = await query(`
        SELECT COUNT(*) as count
        FROM job_requisitions
        ${finalClause}
      `, params);
      return rows[0]?.count || 0;
    } catch {
      return 0;
    }
  }

  async getCertificationStatus(queryData: any) {
    const orgId = queryData.organizationId || queryData.companyId || 'org-stackly';
    try {
      const rows = await query(`
        SELECT 
          certificationName as name,
          COUNT(DISTINCT employeeId) as certified,
          SUM(CASE WHEN expiryDate IS NOT NULL AND expiryDate < date('now') THEN 1 ELSE 0 END) as expired,
          SUM(CASE WHEN expiryDate IS NOT NULL AND expiryDate BETWEEN date('now') AND date('now','+90 days') THEN 1 ELSE 0 END) as expiringSoon
        FROM certifications
        WHERE (organizationId = ? OR companyId = ?)
        GROUP BY certificationName
        ORDER BY certified DESC
        LIMIT 20
      `, [orgId, orgId]);
      return rows;
    } catch {
      return [];
    }
  }

  async getTrainingRecommendations(queryData: any) {
    const orgId = queryData.organizationId || queryData.companyId || 'org-stackly';
    try {
      const rows = await query(`
        SELECT 
          s.skillName,
          COUNT(DISTINCT s.employeeId) as gapCount,
          CASE
            WHEN AVG(s.level) < 2 THEN 'Beginner Training'
            WHEN AVG(s.level) < 3 THEN 'Intermediate Course'
            ELSE 'Advanced Workshop'
          END as recommendedTraining
        FROM skills s
        WHERE (s.organizationId = ? OR s.companyId = ?)
          AND s.level < 3
        GROUP BY s.skillName
        ORDER BY gapCount DESC
        LIMIT 10
      `, [orgId, orgId]);
      return rows;
    } catch {
      return [];
    }
  }

  async getAttritionRiskScores(queryData: any) {
    try {
      const { clause, params } = buildWhereClause(queryData, 'e');
      // Always enforce active employees for risk score
      const finalClause = clause ? `${clause} AND e.status = 'Active'` : `WHERE e.status = 'Active'`;
      
      const rows = await query(`
        SELECT 
          e.id,
          e.name,
          COALESCE(e.department, 'Unassigned') as department,
          COALESCE(e.designation, e.role) as role,
          COALESCE(e.performanceScore, 75) as performanceScore,
          COALESCE(e.attendanceRate, 90) as attendanceRate,
          COALESCE(julianday('now') - julianday(e.joinDate), 730) as tenureDays
        FROM employees e
        ${finalClause}
      `, params);
      return rows;
    } catch {
      return [];
    }
  }

  async getHistoricalRates(queryData: any) {
    try {
      const { clause, params } = buildWhereClause(queryData, 'e');
      
      const rows = await query(`
        SELECT 
          COUNT(CASE WHEN e.status = 'Active' THEN 1 END) as activeHeadcount,
          COUNT(CASE WHEN e.status IN ('Resigned', 'Terminated') AND julianday('now') - julianday(e.updatedAt) <= 365 THEN 1 END) as departuresLastYear,
          COUNT(CASE WHEN julianday('now') - julianday(e.joinDate) <= 365 THEN 1 END) as hiredLastYear
        FROM employees e
        ${clause}
      `, params);
      
      if (!rows || rows.length === 0) return { growthRate: 0.15, attritionRate: 0.10, activeHeadcount: 1 };
      
      const active = rows[0].activeHeadcount || 1;
      const departed = rows[0].departuresLastYear || 0;
      const hired = rows[0].hiredLastYear || 0;
      
      // Calculate rates
      const attritionRate = departed / (active + departed);
      const headcountLastYear = active + departed - hired;
      const growthRate = headcountLastYear > 0 ? (active - headcountLastYear) / headcountLastYear : hired / active;
      
      return {
        growthRate: Math.max(-0.5, Math.min(1.0, growthRate)), // Cap between -50% and +100%
        attritionRate: Math.max(0, Math.min(0.5, attritionRate)), // Cap between 0 and 50%
        activeHeadcount: active
      };
    } catch (e) {
      return { growthRate: 0.15, attritionRate: 0.10, activeHeadcount: 1 };
    }
  }
}

export const analyticsRepository = new AnalyticsRepository();
export default analyticsRepository;

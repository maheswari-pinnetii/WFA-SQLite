import { getDatabase, query } from '../../database/sqlite-cloud.js';

export const skillAnalyticsService = {
  getSkillDistribution: async (user: any, filters: any = {}) => {
    let sql = `
      SELECT 
        s.name as skillName,
        COUNT(es.employeeId) as employeeCount,
        ROUND(AVG(es.level), 2) as averageLevel
      FROM employee_skills es
      JOIN skills s ON es.skillId = s.id
      JOIN employees e ON es.employeeId = e.id
      WHERE e.organizationId = ?
    `;
    const params: any[] = [user.organizationId || 'org-stackly'];

    if (filters.department && filters.department !== 'All') {
      sql += ' AND e.department = ?';
      params.push(filters.department);
    }
    
    sql += ' GROUP BY s.name ORDER BY employeeCount DESC';
    
    const data = await query(sql, params);
    return data;
  },

  getSkillGaps: async (user: any, filters: any = {}) => {
    let sql = `
      SELECT 
        s.name as skillName,
        COUNT(es.employeeId) as missingCount
      FROM employee_skills es
      JOIN skills s ON es.skillId = s.id
      JOIN employees e ON es.employeeId = e.id
      WHERE es.isMissingSkill = 1 AND e.organizationId = ?
    `;
    const params: any[] = [user.organizationId || 'org-stackly'];
    
    if (filters.department && filters.department !== 'All') {
      sql += ' AND e.department = ?';
      params.push(filters.department);
    }
    
    sql += ' GROUP BY s.name ORDER BY missingCount DESC';
    
    const data = await query(sql, params);
    return data;
  },

  getDepartmentSkillCoverage: async (user: any, filters: any = {}) => {
    let sql = `
      SELECT 
        e.department,
        COUNT(DISTINCT es.employeeId) as totalEmployeesWithSkills,
        COUNT(es.skillId) as totalSkillsLogged
      FROM employees e
      LEFT JOIN employee_skills es ON e.id = es.employeeId
      WHERE e.organizationId = ? AND e.department IS NOT NULL
    `;
    const params: any[] = [user.organizationId || 'org-stackly'];
    
    if (filters.department && filters.department !== 'All') {
      sql += ' AND e.department = ?';
      params.push(filters.department);
    }
    
    sql += ' GROUP BY e.department';
    
    const data = await query(sql, params);
    return data;
  },

  getCertificationStatus: async (user: any, filters: any = {}) => {
    let sql = `
      SELECT 
        tp.title as certificationName,
        COUNT(te.employeeId) as certifiedCount
      FROM training_programs tp
      LEFT JOIN training_enrollments te ON tp.id = te.programId AND te.status = 'COMPLETED'
      WHERE tp.organizationId = ?
    `;
    const params: any[] = [user.organizationId || 'org-stackly'];
    
    // Simplistic count
    sql += ' GROUP BY tp.title ORDER BY certifiedCount DESC';
    
    const data = await query(sql, params);
    return data;
  },

  getTrainingRecommendations: async (user: any, filters: any = {}) => {
    // Top missing skills become training recommendations
    let sql = `
      SELECT 
        s.name as skillName,
        COUNT(es.employeeId) as gapCount,
        'Recommend ' || s.name || ' Training' as recommendation
      FROM employee_skills es
      JOIN skills s ON es.skillId = s.id
      JOIN employees e ON es.employeeId = e.id
      WHERE es.isMissingSkill = 1 AND e.organizationId = ?
    `;
    const params: any[] = [user.organizationId || 'org-stackly'];
    
    if (filters.department && filters.department !== 'All') {
      sql += ' AND e.department = ?';
      params.push(filters.department);
    }
    
    sql += ' GROUP BY s.name ORDER BY gapCount DESC LIMIT 5';
    
    const data = await query(sql, params);
    return data;
  }
};

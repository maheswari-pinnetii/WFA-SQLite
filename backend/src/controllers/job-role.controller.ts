import { Request, Response } from 'express';
import { query } from '../database/sqlite-cloud.js';
import { handleControllerError } from '../utils/errorHandler.js';

export const getJobFamilies = async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).user?.organizationId || 'org-stackly';
    const rows = await query(`
      SELECT jf.*, COUNT(e.id) as employeeCount
      FROM job_families jf
      LEFT JOIN employees e ON jf.id = e.jobFamilyId
      WHERE jf.organizationId = ?
      GROUP BY jf.id
      ORDER BY jf.name ASC
    `, [orgId]);
    return res.json({ success: true, data: rows });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'jobRole.getJobFamilies', 500, 'Failed to retrieve job families.');
  }
};

export const getJobRoles = async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).user?.organizationId || 'org-stackly';
    const { familyId } = req.query;
    let sql = `
      SELECT jr.*, jf.name as jobFamilyName, COUNT(e.id) as employeeCount
      FROM job_roles jr
      JOIN job_families jf ON jr.jobFamilyId = jf.id
      LEFT JOIN employees e ON jr.id = e.jobRoleId
      WHERE jr.organizationId = ?
    `;
    const params: any[] = [orgId];

    if (familyId) {
      sql += ` AND jr.jobFamilyId = ?`;
      params.push(familyId);
    }

    sql += ` GROUP BY jr.id ORDER BY jr.name ASC`;
    const rows = await query(sql, params);
    return res.json({ success: true, data: rows });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'jobRole.getJobRoles', 500, 'Failed to retrieve job roles.');
  }
};

export const getJobRoleAnalytics = async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).user?.organizationId || 'org-stackly';

    const [
      workforceByFamily,
      topJobRoles,
      pythonWorkforce,
      webWorkforce,
      dataWorkforce,
      sapWorkforce,
      hiringTrendsByFamily
    ] = await Promise.all([
      query(`
        SELECT COALESCE(jf.name, 'Other') as familyName, COUNT(e.id) as headcount
        FROM employees e
        LEFT JOIN job_families jf ON e.jobFamilyId = jf.id
        WHERE e.organizationId = ?
        GROUP BY familyName
        ORDER BY headcount DESC
      `, [orgId]),
      query(`
        SELECT designation, COUNT(*) as count
        FROM employees
        WHERE organizationId = ?
        GROUP BY designation
        ORDER BY count DESC
        LIMIT 10
      `, [orgId]),
      query(`
        SELECT id, employeeCode, name, designation, department, location, joinDate, status
        FROM employees
        WHERE organizationId = ? AND (designation LIKE '%Python%' OR jobRoleId LIKE '%py%')
        ORDER BY joinDate DESC
      `, [orgId]),
      query(`
        SELECT id, employeeCode, name, designation, department, location, joinDate, status
        FROM employees
        WHERE organizationId = ? AND (designation LIKE '%Web%' OR jobRoleId LIKE '%web%')
        ORDER BY joinDate DESC
      `, [orgId]),
      query(`
        SELECT id, employeeCode, name, designation, department, location, joinDate, status
        FROM employees
        WHERE organizationId = ? AND (designation LIKE '%Data%' OR department = 'Data & Analytics' OR jobRoleId LIKE '%data%')
        ORDER BY joinDate DESC
      `, [orgId]),
      query(`
        SELECT id, employeeCode, name, designation, department, location, joinDate, status
        FROM employees
        WHERE organizationId = ? AND (designation LIKE '%SAP%' OR jobRoleId LIKE '%sap%')
        ORDER BY joinDate DESC
      `, [orgId]),
      query(`
        SELECT strftime('%Y', joinDate) as year, COUNT(*) as totalHires
        FROM employees
        WHERE organizationId = ? AND joinDate IS NOT NULL
        GROUP BY year
        ORDER BY year ASC
      `, [orgId])
    ]);

    const kpis = {
      totalWorkforce: 1000,
      pythonWorkforceCount: pythonWorkforce.length,
      webWorkforceCount: webWorkforce.length,
      dataWorkforceCount: dataWorkforce.length,
      sapWorkforceCount: sapWorkforce.length
    };

    return res.json({
      success: true,
      data: {
        kpis,
        charts: {
          workforceByFamily,
          topJobRoles,
          hiringTrendsByFamily
        },
        specializedWorkforces: {
          pythonWorkforce,
          webWorkforce,
          dataWorkforce,
          sapWorkforce
        }
      }
    });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'jobRole.getJobRoleAnalytics', 500, 'Failed to compute job role analytics.');
  }
};

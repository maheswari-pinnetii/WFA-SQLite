import { query, execute } from '../database/sqlite-cloud.js';
import { v4 as uuidv4 } from 'uuid';

const now = () => new Date().toISOString();

// ─── Locations ────────────────────────────────────────────────────────────────

export const getLocations = async (orgId: string) =>
  query(`SELECT * FROM org_locations WHERE organizationId = ? AND status != 'DELETED' ORDER BY name ASC`, [orgId]);

export const getLocationById = async (id: string, orgId: string) => {
  const rows = await query(`SELECT * FROM org_locations WHERE id = ? AND organizationId = ?`, [id, orgId]);
  return rows[0] || null;
};

export const createLocation = async (orgId: string, data: any) => {
  const id = uuidv4(); const ts = now();
  await execute(
    `INSERT INTO org_locations (id,organizationId,name,code,address,city,state,country,pincode,timezone,isHeadquarters,status,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,'ACTIVE',?,?)`,
    [id,orgId,data.name,data.code||null,data.address||null,data.city||null,data.state||null,data.country||'India',data.pincode||null,data.timezone||'Asia/Kolkata',data.isHeadquarters?1:0,ts,ts]
  );
  return getLocationById(id, orgId);
};

export const updateLocation = async (id: string, orgId: string, data: any) => {
  await execute(
    `UPDATE org_locations SET name=?,code=?,address=?,city=?,state=?,country=?,pincode=?,timezone=?,isHeadquarters=?,updatedAt=? WHERE id=? AND organizationId=?`,
    [data.name,data.code||null,data.address||null,data.city||null,data.state||null,data.country||'India',data.pincode||null,data.timezone||'Asia/Kolkata',data.isHeadquarters?1:0,now(),id,orgId]
  );
  return getLocationById(id, orgId);
};

export const deleteLocation = async (id: string, orgId: string) =>
  execute(`UPDATE org_locations SET status='DELETED',updatedAt=? WHERE id=? AND organizationId=?`, [now(),id,orgId]);

// ─── Designations ─────────────────────────────────────────────────────────────

export const getDesignations = async (orgId: string, departmentId?: string) => {
  const baseSQL = `SELECT d.*,jl.name as jobLevelName FROM designations d LEFT JOIN job_levels jl ON d.jobLevelId=jl.id WHERE d.organizationId=? AND d.status!='DELETED'`;
  if (departmentId) return query(`${baseSQL} AND d.departmentId=? ORDER BY d.title ASC`, [orgId, departmentId]);
  return query(`${baseSQL} ORDER BY d.title ASC`, [orgId]);
};

export const getDesignationById = async (id: string, orgId: string) => {
  const rows = await query(`SELECT * FROM designations WHERE id=? AND organizationId=?`, [id, orgId]);
  return rows[0] || null;
};

export const createDesignation = async (orgId: string, data: any) => {
  const id = uuidv4(); const ts = now();
  await execute(
    `INSERT INTO designations (id,organizationId,title,code,departmentId,jobLevelId,description,status,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,'ACTIVE',?,?)`,
    [id,orgId,data.title,data.code||null,data.departmentId||null,data.jobLevelId||null,data.description||null,ts,ts]
  );
  return getDesignationById(id, orgId);
};

export const updateDesignation = async (id: string, orgId: string, data: any) => {
  await execute(
    `UPDATE designations SET title=?,code=?,departmentId=?,jobLevelId=?,description=?,updatedAt=? WHERE id=? AND organizationId=?`,
    [data.title,data.code||null,data.departmentId||null,data.jobLevelId||null,data.description||null,now(),id,orgId]
  );
  return getDesignationById(id, orgId);
};

export const deleteDesignation = async (id: string, orgId: string) =>
  execute(`UPDATE designations SET status='DELETED',updatedAt=? WHERE id=? AND organizationId=?`, [now(),id,orgId]);

// ─── Job Levels ───────────────────────────────────────────────────────────────

export const getJobLevels = async (orgId: string) =>
  query(`SELECT * FROM job_levels WHERE organizationId=? AND status!='DELETED' ORDER BY code ASC`, [orgId]);

export const getJobLevelById = async (id: string, orgId: string) => {
  const rows = await query(`SELECT * FROM job_levels WHERE id=? AND organizationId=?`, [id, orgId]);
  return rows[0] || null;
};

export const createJobLevel = async (orgId: string, data: any) => {
  const id = uuidv4(); const ts = now();
  await execute(
    `INSERT INTO job_levels (id,organizationId,name,code,band,minCtc,maxCtc,description,status,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,'ACTIVE',?,?)`,
    [id,orgId,data.name,data.code,data.band||null,data.minCtc||null,data.maxCtc||null,data.description||null,ts,ts]
  );
  return getJobLevelById(id, orgId);
};

export const updateJobLevel = async (id: string, orgId: string, data: any) => {
  await execute(
    `UPDATE job_levels SET name=?,code=?,band=?,minCtc=?,maxCtc=?,description=?,updatedAt=? WHERE id=? AND organizationId=?`,
    [data.name,data.code,data.band||null,data.minCtc||null,data.maxCtc||null,data.description||null,now(),id,orgId]
  );
  return getJobLevelById(id, orgId);
};

export const deleteJobLevel = async (id: string, orgId: string) =>
  execute(`UPDATE job_levels SET status='DELETED',updatedAt=? WHERE id=? AND organizationId=?`, [now(),id,orgId]);

// ─── Cost Centers ─────────────────────────────────────────────────────────────

export const getCostCenters = async (orgId: string) =>
  query(`SELECT cc.*,e.name as headName FROM cost_centers cc LEFT JOIN employees e ON cc.headId=e.id WHERE cc.organizationId=? AND cc.status!='DELETED' ORDER BY cc.name ASC`, [orgId]);

export const getCostCenterById = async (id: string, orgId: string) => {
  const rows = await query(`SELECT * FROM cost_centers WHERE id=? AND organizationId=?`, [id, orgId]);
  return rows[0] || null;
};

export const createCostCenter = async (orgId: string, data: any) => {
  const id = uuidv4(); const ts = now();
  await execute(
    `INSERT INTO cost_centers (id,organizationId,name,code,description,headId,parentId,status,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,'ACTIVE',?,?)`,
    [id,orgId,data.name,data.code,data.description||null,data.headId||null,data.parentId||null,ts,ts]
  );
  return getCostCenterById(id, orgId);
};

export const updateCostCenter = async (id: string, orgId: string, data: any) => {
  await execute(
    `UPDATE cost_centers SET name=?,code=?,description=?,headId=?,parentId=?,updatedAt=? WHERE id=? AND organizationId=?`,
    [data.name,data.code,data.description||null,data.headId||null,data.parentId||null,now(),id,orgId]
  );
  return getCostCenterById(id, orgId);
};

export const deleteCostCenter = async (id: string, orgId: string) =>
  execute(`UPDATE cost_centers SET status='DELETED',updatedAt=? WHERE id=? AND organizationId=?`, [now(),id,orgId]);

// ─── Org Policies ─────────────────────────────────────────────────────────────

export const getOrgPolicies = async (orgId: string, policyType?: string) => {
  if (policyType) return query(`SELECT * FROM org_policies WHERE organizationId=? AND policyType=? AND status!='DELETED' ORDER BY name ASC`, [orgId, policyType]);
  return query(`SELECT * FROM org_policies WHERE organizationId=? AND status!='DELETED' ORDER BY policyType,name ASC`, [orgId]);
};

export const getOrgPolicyById = async (id: string, orgId: string) => {
  const rows = await query(`SELECT * FROM org_policies WHERE id=? AND organizationId=?`, [id, orgId]);
  return rows[0] || null;
};

export const upsertOrgPolicy = async (orgId: string, data: any) => {
  const id = data.id || uuidv4(); const ts = now();
  const cfg = typeof data.config === 'string' ? data.config : JSON.stringify(data.config || {});
  await execute(
    `INSERT INTO org_policies (id,organizationId,policyType,name,description,config,effectiveFrom,status,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,'ACTIVE',?,?)
     ON CONFLICT(id) DO UPDATE SET name=excluded.name,description=excluded.description,config=excluded.config,effectiveFrom=excluded.effectiveFrom,updatedAt=excluded.updatedAt`,
    [id,orgId,data.policyType,data.name,data.description||null,cfg,data.effectiveFrom||null,ts,ts]
  );
  return getOrgPolicyById(id, orgId);
};

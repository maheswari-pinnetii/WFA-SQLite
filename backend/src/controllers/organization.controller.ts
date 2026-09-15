import { Employee } from '../models/Employee.js';
import { Organization } from '../models/Department.js';
import { handleControllerError } from '../utils/errorHandler.js';
import * as orgService from '../services/organization.service.js';

const getOrgId = (req: any) => req.user?.organizationId || 'org-stackly';

// ─── Organization ─────────────────────────────────────────────────────────────

export const getOrganizations = async (req: any, res: any) => {
  try {
    const orgId = getOrgId(req);
    const org = await Organization.findOne({ id: orgId });
    const data = org ? [org] : [{ id: orgId, name: 'Stackly Enterprise HQ', domain: 'thestackly.com', status: 'ACTIVE' }];
    return res.json({ success: true, data });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'org.getOrganizations', 500, 'Failed to retrieve organization.');
  }
};

// ─── Departments (derived from employees table) ───────────────────────────────

export const getDepartments = async (req: any, res: any) => {
  try {
    const orgId = getOrgId(req);
    const depts = await Employee.distinct('department', { organizationId: orgId, department: { $ne: [null, ''] } });
    return res.json({ success: true, data: depts.sort().map((d: any) => ({ name: d })) });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'org.getDepartments', 500, 'Failed to retrieve departments.');
  }
};

// ─── Locations ────────────────────────────────────────────────────────────────

export const getLocations = async (req: any, res: any) => {
  try {
    const data = await orgService.getLocations(getOrgId(req));
    return res.json({ success: true, data });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'org.getLocations', 500, 'Failed to retrieve locations.');
  }
};

export const getLocationById = async (req: any, res: any) => {
  try {
    const loc = await orgService.getLocationById(req.params.id, getOrgId(req));
    if (!loc) return res.status(404).json({ success: false, message: 'Location not found.' });
    return res.json({ success: true, data: loc });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'org.getLocationById', 500, 'Failed to retrieve location.');
  }
};

export const createLocation = async (req: any, res: any) => {
  try {
    if (!req.body.name) return res.status(400).json({ success: false, message: 'name is required.' });
    const data = await orgService.createLocation(getOrgId(req), req.body);
    return res.status(201).json({ success: true, data });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'org.createLocation', 500, 'Failed to create location.');
  }
};

export const updateLocation = async (req: any, res: any) => {
  try {
    const data = await orgService.updateLocation(req.params.id, getOrgId(req), req.body);
    return res.json({ success: true, data });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'org.updateLocation', 500, 'Failed to update location.');
  }
};

export const deleteLocation = async (req: any, res: any) => {
  try {
    await orgService.deleteLocation(req.params.id, getOrgId(req));
    return res.json({ success: true, message: 'Location deactivated.' });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'org.deleteLocation', 500, 'Failed to delete location.');
  }
};

// ─── Designations ─────────────────────────────────────────────────────────────

export const getDesignations = async (req: any, res: any) => {
  try {
    const data = await orgService.getDesignations(getOrgId(req), req.query.departmentId as string);
    return res.json({ success: true, data });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'org.getDesignations', 500, 'Failed to retrieve designations.');
  }
};

export const createDesignation = async (req: any, res: any) => {
  try {
    if (!req.body.title) return res.status(400).json({ success: false, message: 'title is required.' });
    const data = await orgService.createDesignation(getOrgId(req), req.body);
    return res.status(201).json({ success: true, data });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'org.createDesignation', 500, 'Failed to create designation.');
  }
};

export const updateDesignation = async (req: any, res: any) => {
  try {
    const data = await orgService.updateDesignation(req.params.id, getOrgId(req), req.body);
    return res.json({ success: true, data });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'org.updateDesignation', 500, 'Failed to update designation.');
  }
};

export const deleteDesignation = async (req: any, res: any) => {
  try {
    await orgService.deleteDesignation(req.params.id, getOrgId(req));
    return res.json({ success: true, message: 'Designation deactivated.' });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'org.deleteDesignation', 500, 'Failed to delete designation.');
  }
};

// ─── Job Levels ───────────────────────────────────────────────────────────────

export const getJobLevels = async (req: any, res: any) => {
  try {
    const data = await orgService.getJobLevels(getOrgId(req));
    return res.json({ success: true, data });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'org.getJobLevels', 500, 'Failed to retrieve job levels.');
  }
};

export const createJobLevel = async (req: any, res: any) => {
  try {
    if (!req.body.name || !req.body.code) return res.status(400).json({ success: false, message: 'name and code are required.' });
    const data = await orgService.createJobLevel(getOrgId(req), req.body);
    return res.status(201).json({ success: true, data });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'org.createJobLevel', 500, 'Failed to create job level.');
  }
};

export const updateJobLevel = async (req: any, res: any) => {
  try {
    const data = await orgService.updateJobLevel(req.params.id, getOrgId(req), req.body);
    return res.json({ success: true, data });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'org.updateJobLevel', 500, 'Failed to update job level.');
  }
};

export const deleteJobLevel = async (req: any, res: any) => {
  try {
    await orgService.deleteJobLevel(req.params.id, getOrgId(req));
    return res.json({ success: true, message: 'Job level deactivated.' });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'org.deleteJobLevel', 500, 'Failed to delete job level.');
  }
};

// ─── Cost Centers ─────────────────────────────────────────────────────────────

export const getCostCenters = async (req: any, res: any) => {
  try {
    const data = await orgService.getCostCenters(getOrgId(req));
    return res.json({ success: true, data });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'org.getCostCenters', 500, 'Failed to retrieve cost centers.');
  }
};

export const createCostCenter = async (req: any, res: any) => {
  try {
    if (!req.body.name || !req.body.code) return res.status(400).json({ success: false, message: 'name and code are required.' });
    const data = await orgService.createCostCenter(getOrgId(req), req.body);
    return res.status(201).json({ success: true, data });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'org.createCostCenter', 500, 'Failed to create cost center.');
  }
};

export const updateCostCenter = async (req: any, res: any) => {
  try {
    const data = await orgService.updateCostCenter(req.params.id, getOrgId(req), req.body);
    return res.json({ success: true, data });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'org.updateCostCenter', 500, 'Failed to update cost center.');
  }
};

export const deleteCostCenter = async (req: any, res: any) => {
  try {
    await orgService.deleteCostCenter(req.params.id, getOrgId(req));
    return res.json({ success: true, message: 'Cost center deactivated.' });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'org.deleteCostCenter', 500, 'Failed to delete cost center.');
  }
};

// ─── Org Policies ─────────────────────────────────────────────────────────────

export const getOrgPolicies = async (req: any, res: any) => {
  try {
    const data = await orgService.getOrgPolicies(getOrgId(req), req.query.type as string);
    return res.json({ success: true, data });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'org.getOrgPolicies', 500, 'Failed to retrieve policies.');
  }
};

export const upsertOrgPolicy = async (req: any, res: any) => {
  try {
    if (!req.body.policyType || !req.body.name) return res.status(400).json({ success: false, message: 'policyType and name are required.' });
    const data = await orgService.upsertOrgPolicy(getOrgId(req), req.body);
    return res.json({ success: true, data });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'org.upsertOrgPolicy', 500, 'Failed to save policy.');
  }
};

// ─── Static lookups (RBAC) ───────────────────────────────────────────────────

export const getRoles = (_req: any, res: any) => res.json({
  success: true,
  data: [
    { role: 'ADMIN',     label: 'System Administrator',    clearanceLevel: 5 },
    { role: 'HR',        label: 'HR Operations Manager',   clearanceLevel: 4 },
    { role: 'MANAGER',   label: 'Department Manager',      clearanceLevel: 3 },
    { role: 'TEAM_LEAD', label: 'Team Lead',               clearanceLevel: 2 },
    { role: 'EMPLOYEE',  label: 'Employee',                clearanceLevel: 1 },
  ]
});

export const getPermissions = (_req: any, res: any) => res.json({
  success: true,
  data: [
    { permission: 'USER_CREATE',       description: 'Create user profiles' },
    { permission: 'USER_UPDATE',       description: 'Update user profiles' },
    { permission: 'USER_DELETE',       description: 'Deactivate user profiles' },
    { permission: 'EMPLOYEE_VIEW_ALL', description: 'Access global employee directory' },
    { permission: 'VIEW_ALL_DATA',     description: 'Cross-department operations' },
    { permission: 'EMPLOYEE_CREATE',   description: 'Create employee records' },
    { permission: 'EMPLOYEE_UPDATE',   description: 'Update employee records' },
    { permission: 'EMPLOYEE_DELETE',   description: 'Delete employee records' },
    { permission: 'EMPLOYEE_MANAGE',   description: 'Full employee management' },
    { permission: 'PAYROLL_VIEW',      description: 'View payroll data' },
    { permission: 'PAYROLL_MANAGE',    description: 'Manage payroll runs' },
    { permission: 'LEAVE_APPROVE',     description: 'Approve leave requests' },
    { permission: 'REPORT_VIEW',       description: 'View reports' },
  ]
});


/**
 * GET /api/departments
 */
export const getDepartments = async (req: any, res: any) => {
  try {
    const orgId = getOrganizationId(req);
    const depts = await Employee.distinct('department', { organizationId: orgId, department: { $ne: [null, ''] } });
    const formatted = depts.sort().map((d: any) => ({ name: d }));
    return res.json({ success: true, data: formatted });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'organization.getDepartments', 500, 'Failed to retrieve departments.');
  }
};

/**
 * GET /api/locations
 */
export const getLocations = async (req: any, res: any) => {
  try {
    const orgId = getOrganizationId(req);
    const locs = await Employee.distinct('location', { organizationId: orgId, location: { $ne: [null, ''] } });
    const formatted = locs.sort().map((l: any) => ({ name: l }));
    return res.json({ success: true, data: formatted });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'organization.getLocations', 500, 'Failed to retrieve locations.');
  }
};

/**
 * GET /api/organizations
 */
export const getOrganizations = async (req: any, res: any) => {
  try {
    const currentOrg = getOrganizationId(req);
    const org = await Organization.findOne({ id: currentOrg });
    const data = org ? [org] : [{
      id: currentOrg,
      name: 'Stackly Enterprise HQ',
      domain: 'thestackly.com',
      status: 'ACTIVE'
    }];
    return res.json({
      success: true,
      data
    });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'organization.getOrganizations', 500, 'Failed to retrieve organization details.');
  }
};

/**
 * GET /api/roles
 */
export const getRoles = (req: any, res: any) => {
  return res.json({
    success: true,
    data: [
      { role: 'ADMIN', label: 'System Administrator', clearanceLevel: 5 },
      { role: 'HR', label: 'HR Operations Manager', clearanceLevel: 4 },
      { role: 'MANAGER', label: 'Department Manager', clearanceLevel: 3 },
      { role: 'TEAM_LEAD', label: 'Team Lead', clearanceLevel: 2 },
      { role: 'EMPLOYEE', label: 'Full Stack Developer', clearanceLevel: 1 }
    ]
  });
};

/**
 * GET /api/permissions
 */
export const getPermissions = (req: any, res: any) => {
  return res.json({
    success: true,
    data: [
      { permission: 'USER_CREATE', description: 'Create user profiles' },
      { permission: 'USER_UPDATE', description: 'Update user profiles' },
      { permission: 'USER_DELETE', description: 'Deactivate user profiles' },
      { permission: 'EMPLOYEE_VIEW_ALL', description: 'Access global employee directory' },
      { permission: 'VIEW_ALL_DATA', description: 'Cross-department operations' }
    ]
  });
};

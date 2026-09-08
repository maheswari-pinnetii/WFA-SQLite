import { Employee } from '../models/Employee.js';
import { Organization } from '../models/Department.js';
import { handleControllerError } from '../utils/errorHandler.js';

const getOrganizationId = (req: any) => req.user?.organizationId || 'org-stackly';

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

import { Department, Team, Location, Designation, Organization } from '../models/index.js';
import { handleControllerError } from '../utils/errorHandler.js';

const getOrganizationId = (req: any) => req.user?.organizationId || 'org-stackly';

// --- Departments ---
export const getDepartments = async (req: any, res: any) => {
  try {
    const orgId = getOrganizationId(req);
    const depts = await Department.find({ organizationId: orgId });
    return res.json({ success: true, data: depts });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'organization.getDepartments', 500, 'Failed to retrieve departments.');
  }
};

export const createDepartment = async (req: any, res: any) => {
  try {
    const orgId = getOrganizationId(req);
    const newDept = await Department.create({ ...req.body, organizationId: orgId, companyId: orgId });
    return res.json({ success: true, data: newDept });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'organization.createDepartment', 500, 'Failed to create department.');
  }
};

export const updateDepartment = async (req: any, res: any) => {
  try {
    const orgId = getOrganizationId(req);
    const updated = await Department.findOneAndUpdate({ id: req.params.id, organizationId: orgId }, req.body);
    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'organization.updateDepartment', 500, 'Failed to update department.');
  }
};

export const deleteDepartment = async (req: any, res: any) => {
  try {
    const orgId = getOrganizationId(req);
    await Department.findOneAndDelete({ id: req.params.id, organizationId: orgId });
    return res.json({ success: true });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'organization.deleteDepartment', 500, 'Failed to delete department.');
  }
};

// --- Teams ---
export const getTeams = async (req: any, res: any) => {
  try {
    const orgId = getOrganizationId(req);
    const teams = await Team.find({ organizationId: orgId });
    return res.json({ success: true, data: teams });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'organization.getTeams', 500, 'Failed to retrieve teams.');
  }
};

export const createTeam = async (req: any, res: any) => {
  try {
    const orgId = getOrganizationId(req);
    const newTeam = await Team.create({ ...req.body, organizationId: orgId, companyId: orgId });
    return res.json({ success: true, data: newTeam });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'organization.createTeam', 500, 'Failed to create team.');
  }
};

export const updateTeam = async (req: any, res: any) => {
  try {
    const orgId = getOrganizationId(req);
    const updated = await Team.findOneAndUpdate({ id: req.params.id, organizationId: orgId }, req.body);
    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'organization.updateTeam', 500, 'Failed to update team.');
  }
};

export const deleteTeam = async (req: any, res: any) => {
  try {
    const orgId = getOrganizationId(req);
    await Team.findOneAndDelete({ id: req.params.id, organizationId: orgId });
    return res.json({ success: true });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'organization.deleteTeam', 500, 'Failed to delete team.');
  }
};

// --- Locations ---
export const getLocations = async (req: any, res: any) => {
  try {
    const orgId = getOrganizationId(req);
    const locs = await Location.find({ organizationId: orgId });
    return res.json({ success: true, data: locs });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'organization.getLocations', 500, 'Failed to retrieve locations.');
  }
};

export const createLocation = async (req: any, res: any) => {
  try {
    const orgId = getOrganizationId(req);
    const newLoc = await Location.create({ ...req.body, organizationId: orgId, companyId: orgId });
    return res.json({ success: true, data: newLoc });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'organization.createLocation', 500, 'Failed to create location.');
  }
};

export const updateLocation = async (req: any, res: any) => {
  try {
    const orgId = getOrganizationId(req);
    const updated = await Location.findOneAndUpdate({ id: req.params.id, organizationId: orgId }, req.body);
    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'organization.updateLocation', 500, 'Failed to update location.');
  }
};

export const deleteLocation = async (req: any, res: any) => {
  try {
    const orgId = getOrganizationId(req);
    await Location.findOneAndDelete({ id: req.params.id, organizationId: orgId });
    return res.json({ success: true });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'organization.deleteLocation', 500, 'Failed to delete location.');
  }
};

// --- Designations ---
export const getDesignations = async (req: any, res: any) => {
  try {
    const orgId = getOrganizationId(req);
    const desigs = await Designation.find({ organizationId: orgId });
    return res.json({ success: true, data: desigs });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'organization.getDesignations', 500, 'Failed to retrieve designations.');
  }
};

export const createDesignation = async (req: any, res: any) => {
  try {
    const orgId = getOrganizationId(req);
    const newDesig = await Designation.create({ ...req.body, organizationId: orgId, companyId: orgId });
    return res.json({ success: true, data: newDesig });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'organization.createDesignation', 500, 'Failed to create designation.');
  }
};

export const updateDesignation = async (req: any, res: any) => {
  try {
    const orgId = getOrganizationId(req);
    const updated = await Designation.findOneAndUpdate({ id: req.params.id, organizationId: orgId }, req.body);
    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'organization.updateDesignation', 500, 'Failed to update designation.');
  }
};

export const deleteDesignation = async (req: any, res: any) => {
  try {
    const orgId = getOrganizationId(req);
    await Designation.findOneAndDelete({ id: req.params.id, organizationId: orgId });
    return res.json({ success: true });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'organization.deleteDesignation', 500, 'Failed to delete designation.');
  }
};

// --- Organizations & Roles ---
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
    return res.json({ success: true, data });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'organization.getOrganizations', 500, 'Failed to retrieve organizations.');
  }
};

export const getRoles = (req: any, res: any) => {
  return res.json({
    success: true,
    data: [
      { role: 'ADMIN', label: 'System Administrator', clearanceLevel: 5 },
      { role: 'HR', label: 'HR Operations Manager', clearanceLevel: 4 },
      { role: 'MANAGER', label: 'Department Manager', clearanceLevel: 3 },
      { role: 'TEAM_LEAD', label: 'Team Lead', clearanceLevel: 2 },
      { role: 'EMPLOYEE', label: 'Employee', clearanceLevel: 1 }
    ]
  });
};

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

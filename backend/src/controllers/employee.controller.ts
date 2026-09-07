import { employeeService } from '../services/employee.service.js';
import { logAudit } from '../config/db.js';
import { emitToOrg, SOCKET_EVENTS } from '../sockets/index.js';

const getOrganizationId = (req) => req.user.organizationId || 'org-stackly';

export const getEmployees = async (req, res) => {
  try {
    const data = await employeeService.getEmployees(req.user, req.query);
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await employeeService.getEmployeeById(id, getOrganizationId(req));
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }
    return res.json({ success: true, data: employee });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const createEmployee = async (req, res) => {
  try {
    const body = req.body || {};
    const { id, name, email, department, designation, avatar, joinDate, team, location } = body;
    if (!id || !name || !email || !department) {
      return res.status(400).json({ success: false, message: 'Required fields: id, name, email, department.' });
    }

    const orgId = getOrganizationId(req);
    const newEmp = await employeeService.createEmployee({
      id, name, email, department, designation, avatar, joinDate, team, location,
      organizationId: orgId,
      companyId: orgId
    });

    logAudit(req.user.id, 'EMPLOYEE_CREATE', `Created employee profile for ${name} (${id})`, orgId);
    return res.status(201).json({ success: true, data: newEmp });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const orgId = getOrganizationId(req);

    // Prevent mass assignment and BOLA by extracting only allowed fields
    const { name, department, designation, avatar, team, location, performanceScore, attendanceRate } = req.body;
    
    // Only ADMIN/HR can update performance and attendance directly via this route
    const updateData: any = { name, department, designation, avatar, team, location };
    if (['ADMIN', 'HR'].includes(req.user.role)) {
      if (performanceScore !== undefined) updateData.performanceScore = performanceScore;
      if (attendanceRate !== undefined) updateData.attendanceRate = attendanceRate;
    }

    // Clean undefined values
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields provided for update.' });
    }

    const updatedEmp = await employeeService.updateEmployee(id, orgId, updateData);
    if (!updatedEmp) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    logAudit(req.user.id, 'EMPLOYEE_UPDATE', `Updated employee profile: ${id}`, orgId);
    emitToOrg(orgId, SOCKET_EVENTS.EMPLOYEE_UPDATED, updatedEmp);
    return res.json({ success: true, data: updatedEmp });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateEmployeeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['ACTIVE', 'PRESENT', 'REMOTE', 'ON_LEAVE', 'OFFLINE', 'TERMINATED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid employee status.' });
    }

    const orgId = getOrganizationId(req);
    const updated = await employeeService.updateEmployeeStatus(id, orgId, status);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    logAudit(req.user.id, 'EMPLOYEE_STATUS_CHANGED', `Changed employee ${id} status to ${status}`, orgId);
    emitToOrg(orgId, SOCKET_EVENTS.EMPLOYEE_STATUS_CHANGED, { id, status, updatedAt: new Date().toISOString() });
    return res.json({ success: true, data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const orgId = getOrganizationId(req);

    const updated = await employeeService.deleteEmployee(id, orgId);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    logAudit(req.user.id, 'EMPLOYEE_DELETE', `Soft deleted/terminated employee: ${id}`, orgId);
    return res.json({ success: true, message: 'Employee successfully terminated.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getTeams = async (req, res) => {
  try {
    const teams = await employeeService.getTeams(getOrganizationId(req));
    return res.json({ success: true, data: teams });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getTeamMembers = async (req, res) => {
  try {
    const { id } = req.params;
    const members = await employeeService.getTeamMembers(id, getOrganizationId(req));
    return res.json({ success: true, data: members });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await employeeService.getUsers(getOrganizationId(req));
    return res.json({ success: true, data: users });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    if (!['ADMIN', 'HR', 'MANAGER', 'TEAM_LEAD', 'EMPLOYEE'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role.' });
    }

    const updated = await employeeService.updateUserRole(userId, role, getOrganizationId(req));
    if (!updated) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.json({ success: true, data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const deleted = await employeeService.deleteUser(userId, getOrganizationId(req));
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

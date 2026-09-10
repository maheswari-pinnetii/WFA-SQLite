import { employeeService } from '../services/employee.service.js';
import { logAudit } from '../config/db.js';
import { emitToOrg, emitToUser, SOCKET_EVENTS } from '../sockets/index.js';
import { query, execute } from '../database/sqlite-cloud.js';
import { handleControllerError } from '../utils/errorHandler.js';

const getOrganizationId = (req: any) => req.user?.organizationId || 'org-stackly';

import { getPaginationParams, buildPaginatedResponse } from '../utils/pagination.js';

export const getEmployees = async (req: any, res: any) => {
  try {
    const { page, limit, offset } = getPaginationParams(req);
    const { employees, totalItems } = await employeeService.getEmployees(req.user, req.query, limit, offset);
    const paginated = buildPaginatedResponse(employees, totalItems, page, limit);
    return res.json({ success: true, data: paginated });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'employee.getEmployees', 500, 'Failed to retrieve employees.');
  }
};

export const getEmployeeById = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const employee = await employeeService.getEmployeeById(id, getOrganizationId(req));
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }
    return res.json({ success: true, data: employee });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'employee.getEmployeeById', 500, 'Failed to retrieve employee profile.');
  }
};

export const createEmployee = async (req: any, res: any) => {
  try {
    const body = req.body || {};
    const { id, name, email, department, designation, avatar, joinDate, team, location } = body;
    if (!id || !name || !email || !department) {
      return res.status(400).json({ success: false, message: 'Required fields: id, name, email, department.' });
    }

    const orgId = getOrganizationId(req);
    const newEmp = await employeeService.createEmployee({
      id, name, email, department, designation, avatar, joinDate, team, location,
      managerId: body.managerId, departmentId: body.departmentId, teamId: body.teamId, locationId: body.locationId, designationId: body.designationId,
      organizationId: orgId,
      companyId: orgId
    });

    logAudit(req.user.id, 'EMPLOYEE_CREATE', `Created employee profile for ${name} (${id})`, orgId);
    return res.status(201).json({ success: true, data: newEmp });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'employee.createEmployee', 500, 'Failed to create employee profile.');
  }
};

export const updateEmployee = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const orgId = getOrganizationId(req);

    const isPrivileged = ['ADMIN', 'HR'].includes(req.user.role);
    if (!isPrivileged && req.user.id !== id) {
      return res.status(403).json({ success: false, message: 'Forbidden: You can only update your own profile.' });
    }

    const { name, department, designation, avatar, team, location, performanceScore, attendanceRate, managerId, departmentId, teamId, locationId, designationId } = req.body;
    
    const updateData: any = { avatar, location };
    
    if (isPrivileged) {
      if (name !== undefined) updateData.name = name;
      if (department !== undefined) updateData.department = department;
      if (designation !== undefined) updateData.designation = designation;
      if (team !== undefined) updateData.team = team;
      if (performanceScore !== undefined) updateData.performanceScore = performanceScore;
      if (attendanceRate !== undefined) updateData.attendanceRate = attendanceRate;
      if (managerId !== undefined) updateData.managerId = managerId;
      if (departmentId !== undefined) updateData.departmentId = departmentId;
      if (teamId !== undefined) updateData.teamId = teamId;
      if (locationId !== undefined) updateData.locationId = locationId;
      if (designationId !== undefined) updateData.designationId = designationId;
    }

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
  } catch (err: any) {
    return handleControllerError(err, req, res, 'employee.updateEmployee', 500, 'Failed to update employee profile.');
  }
};

export const updateEmployeeStatus = async (req: any, res: any) => {
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
  } catch (err: any) {
    return handleControllerError(err, req, res, 'employee.updateEmployeeStatus', 500, 'Failed to update employee status.');
  }
};

export const deleteEmployee = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const orgId = getOrganizationId(req);

    const updated = await employeeService.deleteEmployee(id, orgId);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    logAudit(req.user.id, 'EMPLOYEE_DELETE', `Soft deleted/terminated employee: ${id}`, orgId);
    return res.json({ success: true, message: 'Employee successfully terminated.' });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'employee.deleteEmployee', 500, 'Failed to delete employee.');
  }
};

export const getTeams = async (req: any, res: any) => {
  try {
    const teams = await employeeService.getTeams(getOrganizationId(req));
    return res.json({ success: true, data: teams });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'employee.getTeams', 500, 'Failed to retrieve teams.');
  }
};

export const getTeamMembers = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const members = await employeeService.getTeamMembers(id, getOrganizationId(req));
    return res.json({ success: true, data: members });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'employee.getTeamMembers', 500, 'Failed to retrieve team members.');
  }
};

export const getUsers = async (req: any, res: any) => {
  try {
    const users = await employeeService.getUsers(getOrganizationId(req));
    return res.json({ success: true, data: users });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'employee.getUsers', 500, 'Failed to retrieve users.');
  }
};

export const updateUserRole = async (req: any, res: any) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    if (!['ADMIN', 'HR', 'MANAGER', 'TEAM_LEAD', 'EMPLOYEE'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role.' });
    }

    const orgId = getOrganizationId(req);
    const updated = await employeeService.updateUserRole(userId, role, orgId);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    logAudit(req.user.id, 'ROLE_CHANGED', `Changed role of user ${userId} to ${role}`, orgId);
    emitToUser(userId, SOCKET_EVENTS.AUTH_ROLE_CHANGED, {
      userId,
      role,
      timestamp: new Date().toISOString()
    });

    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'employee.updateUserRole', 500, 'Failed to update user role.');
  }
};

export const deleteUser = async (req: any, res: any) => {
  try {
    const { userId } = req.params;
    const deleted = await employeeService.deleteUser(userId, getOrganizationId(req));
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    return res.json({ success: true });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'employee.deleteUser', 500, 'Failed to delete user.');
  }
};

export const exportEmployeeData = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const orgId = getOrganizationId(req);

    const isSelf = req.user.id === id;
    const isPrivileged = ['ADMIN', 'HR'].includes(req.user.role);
    if (!isSelf && !isPrivileged) {
      return res.status(403).json({ success: false, message: 'Forbidden: You can only export your own personal data.' });
    }

    const employee = await employeeService.getEmployeeById(id, orgId);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    let attendance = [];
    try {
      attendance = await query('SELECT date, checkInTime, checkOutTime, status, workMode, shiftType FROM attendancerecords WHERE employeeId = ?', [id]);
    } catch {
      attendance = [];
    }

    let leaves = [];
    try {
      leaves = await query('SELECT type as leaveType, startDate, endDate, status, reason FROM leaverequests WHERE employeeId = ?', [id]);
    } catch {
      leaves = [];
    }

    let auditLogs = [];
    try {
      auditLogs = await query('SELECT timestamp, action, details FROM audit_logs WHERE employeeId = ? LIMIT 50', [id]);
    } catch {
      auditLogs = [];
    }

    logAudit(req.user.id, 'DATA_EXPORT_REQUESTED', `Exported full GDPR/PII data bundle for employee ${id}`, orgId);

    return res.json({
      success: true,
      data: {
        exportedAt: new Date().toISOString(),
        dataClassification: 'CONFIDENTIAL_PII',
        profile: employee,
        attendanceHistory: attendance || [],
        leaveHistory: leaves || [],
        auditHistory: auditLogs || []
      }
    });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'employee.exportEmployeeData', 500, 'Failed to export employee data.');
  }
};

export const anonymizeEmployeeData = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const orgId = getOrganizationId(req);

    const employee = await employeeService.getEmployeeById(id, orgId);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    const anonymousName = `Anonymized Employee ${id.slice(-4)}`;
    const anonymousEmail = `redacted-${id.slice(-6)}@thestackly.com`;

    await execute(`
      UPDATE employees 
      SET name = ?, email = ?, avatar = NULL, status = 'TERMINATED', updatedAt = ?
      WHERE id = ? AND organizationId = ?
    `, [anonymousName, anonymousEmail, new Date().toISOString(), id, orgId]);

    await execute(`
      UPDATE users 
      SET name = ?, email = ?, password_hash = 'REDACTED', status = 'TERMINATED', updatedAt = ?
      WHERE id = ? AND organizationId = ?
    `, [anonymousName, anonymousEmail, new Date().toISOString(), id, orgId]);

    logAudit(req.user.id, 'DATA_ANONYMIZED', `Anonymized PII for employee ${id} pursuant to erasure request`, orgId);

    return res.json({
      success: true,
      message: `Employee ${id} PII has been successfully anonymized.`
    });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'employee.anonymizeEmployeeData', 500, 'Failed to anonymize employee data.');
  }
};

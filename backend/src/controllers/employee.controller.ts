import { employeeService } from '../services/employee.service.js';
import { logAudit } from '../config/db.js';
import { emitToOrg, emitToUser, SOCKET_EVENTS } from '../sockets/index.js';
import { query, execute } from '../database/sqlite-cloud.js';

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

    // 1. IDOR / BOLA Prevention
    // An employee can only update their OWN profile unless they are ADMIN or HR
    const isPrivileged = ['ADMIN', 'HR'].includes(req.user.role);
    if (!isPrivileged && req.user.id !== id) {
      return res.status(403).json({ success: false, message: 'Forbidden: You can only update your own profile.' });
    }

    // 2. Mass Assignment Prevention
    const { name, department, designation, avatar, team, location, performanceScore, attendanceRate } = req.body;
    
    // Base update data allowed for the employee themselves
    const updateData: any = { avatar, location };
    
    // Only privileged roles can update structural fields
    if (isPrivileged) {
      if (name !== undefined) updateData.name = name;
      if (department !== undefined) updateData.department = department;
      if (designation !== undefined) updateData.designation = designation;
      if (team !== undefined) updateData.team = team;
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

/**
 * GET /api/employees/:id/export-data
 * GDPR / CCPA Data Subject Access Request (DSAR) - Export employee data bundle
 */
export const exportEmployeeData = async (req, res) => {
  try {
    const { id } = req.params;
    const orgId = getOrganizationId(req);

    // BOLA/IDOR protection: Only self or ADMIN/HR can export
    const isSelf = req.user.id === id;
    const isPrivileged = ['ADMIN', 'HR'].includes(req.user.role);
    if (!isSelf && !isPrivileged) {
      return res.status(403).json({ success: false, message: 'Forbidden: You can only export your own personal data.' });
    }

    const employee = await employeeService.getEmployeeById(id, orgId);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    // Pull attendance records, leave requests, and audit logs safely
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
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/employees/:id/anonymize-data
 * Right to Erasure / Anonymization (ADMIN only)
 */
export const anonymizeEmployeeData = async (req, res) => {
  try {
    const { id } = req.params;
    const orgId = getOrganizationId(req);

    const employee = await employeeService.getEmployeeById(id, orgId);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    // Anonymize employee PII
    const anonymousName = `Anonymized Employee ${id.slice(-4)}`;
    const anonymousEmail = `redacted-${id.slice(-6)}@thestackly.com`;

    await execute(`
      UPDATE employees 
      SET name = ?, email = ?, avatar = NULL, status = 'TERMINATED', updatedAt = ?
      WHERE id = ? AND organizationId = ?
    `, [anonymousName, anonymousEmail, new Date().toISOString(), id, orgId]);

    // Anonymize associated user record if exists
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
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};


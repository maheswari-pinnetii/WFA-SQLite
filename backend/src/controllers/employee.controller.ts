import { employeeService } from '../services/employee.service.js';
import { logAudit } from '../config/db.js';
import { emitToOrg, emitToUser, SOCKET_EVENTS } from '../sockets/index.js';
import { query, execute } from '../database/sqlite-cloud.js';
import { handleControllerError } from '../utils/errorHandler.js';

const getOrganizationId = (req: any) => req.user?.organizationId || 'org-stackly';

export const getEmployees = async (req: any, res: any) => {
  try {
    const data = await employeeService.getEmployees(req.user, req.query);
    return res.json({ success: true, data });
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

    const { name, department, designation, avatar, team, location, performanceScore, attendanceRate } = req.body;
    
    const updateData: any = { avatar, location };
    
    if (isPrivileged) {
      if (name !== undefined) updateData.name = name;
      if (department !== undefined) updateData.department = department;
      if (designation !== undefined) updateData.designation = designation;
      if (team !== undefined) updateData.team = team;
      if (performanceScore !== undefined) updateData.performanceScore = performanceScore;
      if (attendanceRate !== undefined) updateData.attendanceRate = attendanceRate;
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

// ─── PHASE 1: Employee Master Sub-resources ───────────────────────────────────
import * as empMaster from '../services/employee-master.service.js';

export const getFullProfile = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const orgId = getOrganizationId(req);
    const canViewAll = ['ADMIN', 'HR', 'MANAGER', 'TEAM_LEAD'].includes(req.user.role);
    if (!canViewAll && req.user.id !== id) {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }
    const profile = await empMaster.getFullEmployeeProfile(id, orgId);
    if (!profile) return res.status(404).json({ success: false, message: 'Employee not found.' });
    return res.json({ success: true, data: profile });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'employee.getFullProfile', 500, 'Failed to retrieve employee profile.');
  }
};

// Bank Details
export const getBankDetails = async (req: any, res: any) => {
  try {
    const canView = ['ADMIN', 'HR'].includes(req.user.role) || req.user.id === req.params.id;
    if (!canView) return res.status(403).json({ success: false, message: 'Forbidden.' });
    const data = await empMaster.getBankDetails(req.params.id, getOrganizationId(req));
    return res.json({ success: true, data });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'employee.getBankDetails', 500, 'Failed to retrieve bank details.');
  }
};

export const upsertBankDetails = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const orgId = getOrganizationId(req);
    const { accountHolderName, accountNumber, ifscCode, bankName } = req.body;
    if (!accountHolderName || !accountNumber || !ifscCode || !bankName) {
      return res.status(400).json({ success: false, message: 'accountHolderName, accountNumber, ifscCode, bankName are required.' });
    }
    const data = await empMaster.upsertBankDetails(id, orgId, req.body);
    logAudit(req.user.id, 'BANK_DETAILS_UPDATED', `Updated bank details for employee ${id}`, orgId);
    return res.json({ success: true, data });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'employee.upsertBankDetails', 500, 'Failed to update bank details.');
  }
};

// Tax Info
export const getTaxInfo = async (req: any, res: any) => {
  try {
    const canView = ['ADMIN', 'HR'].includes(req.user.role) || req.user.id === req.params.id;
    if (!canView) return res.status(403).json({ success: false, message: 'Forbidden.' });
    const data = await empMaster.getTaxInfo(req.params.id, getOrganizationId(req));
    return res.json({ success: true, data });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'employee.getTaxInfo', 500, 'Failed to retrieve tax info.');
  }
};

export const upsertTaxInfo = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const orgId = getOrganizationId(req);
    const data = await empMaster.upsertTaxInfo(id, orgId, req.body);
    logAudit(req.user.id, 'TAX_INFO_UPDATED', `Updated tax info for employee ${id}`, orgId);
    return res.json({ success: true, data });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'employee.upsertTaxInfo', 500, 'Failed to update tax info.');
  }
};

// Emergency Contacts
export const getEmergencyContacts = async (req: any, res: any) => {
  try {
    const canView = ['ADMIN', 'HR'].includes(req.user.role) || req.user.id === req.params.id;
    if (!canView) return res.status(403).json({ success: false, message: 'Forbidden.' });
    const data = await empMaster.getEmergencyContacts(req.params.id, getOrganizationId(req));
    return res.json({ success: true, data });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'employee.getEmergencyContacts', 500, 'Failed to retrieve emergency contacts.');
  }
};

export const addEmergencyContact = async (req: any, res: any) => {
  try {
    const { name, relationship, phone } = req.body;
    if (!name || !relationship || !phone) return res.status(400).json({ success: false, message: 'name, relationship, phone are required.' });
    const data = await empMaster.addEmergencyContact(req.params.id, getOrganizationId(req), req.body);
    return res.status(201).json({ success: true, data });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'employee.addEmergencyContact', 500, 'Failed to add emergency contact.');
  }
};

export const updateEmergencyContact = async (req: any, res: any) => {
  try {
    const data = await empMaster.updateEmergencyContact(req.params.contactId, getOrganizationId(req), req.body);
    return res.json({ success: true, data });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'employee.updateEmergencyContact', 500, 'Failed to update emergency contact.');
  }
};

export const deleteEmergencyContact = async (req: any, res: any) => {
  try {
    await empMaster.deleteEmergencyContact(req.params.contactId, getOrganizationId(req));
    return res.json({ success: true, message: 'Emergency contact removed.' });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'employee.deleteEmergencyContact', 500, 'Failed to delete emergency contact.');
  }
};

// Skills
export const getSkills = async (req: any, res: any) => {
  try {
    const data = await empMaster.getSkills(req.params.id, getOrganizationId(req));
    return res.json({ success: true, data });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'employee.getSkills', 500, 'Failed to retrieve skills.');
  }
};

export const addSkill = async (req: any, res: any) => {
  try {
    if (!req.body.skillName) return res.status(400).json({ success: false, message: 'skillName is required.' });
    const data = await empMaster.addSkill(req.params.id, getOrganizationId(req), req.body);
    return res.status(201).json({ success: true, data });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'employee.addSkill', 500, 'Failed to add skill.');
  }
};

export const updateSkill = async (req: any, res: any) => {
  try {
    const data = await empMaster.updateSkill(req.params.skillId, getOrganizationId(req), req.body);
    return res.json({ success: true, data });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'employee.updateSkill', 500, 'Failed to update skill.');
  }
};

export const deleteSkill = async (req: any, res: any) => {
  try {
    await empMaster.deleteSkill(req.params.skillId, getOrganizationId(req));
    return res.json({ success: true, message: 'Skill removed.' });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'employee.deleteSkill', 500, 'Failed to delete skill.');
  }
};

// Education
export const getEducation = async (req: any, res: any) => {
  try {
    const data = await empMaster.getEducation(req.params.id, getOrganizationId(req));
    return res.json({ success: true, data });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'employee.getEducation', 500, 'Failed to retrieve education.');
  }
};

export const addEducation = async (req: any, res: any) => {
  try {
    const { degree, institutionName } = req.body;
    if (!degree || !institutionName) return res.status(400).json({ success: false, message: 'degree and institutionName are required.' });
    const data = await empMaster.addEducation(req.params.id, getOrganizationId(req), req.body);
    return res.status(201).json({ success: true, data });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'employee.addEducation', 500, 'Failed to add education.');
  }
};

export const updateEducation = async (req: any, res: any) => {
  try {
    const data = await empMaster.updateEducation(req.params.eduId, getOrganizationId(req), req.body);
    return res.json({ success: true, data });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'employee.updateEducation', 500, 'Failed to update education.');
  }
};

export const deleteEducation = async (req: any, res: any) => {
  try {
    await empMaster.deleteEducation(req.params.eduId, getOrganizationId(req));
    return res.json({ success: true, message: 'Education entry removed.' });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'employee.deleteEducation', 500, 'Failed to delete education.');
  }
};

// Experience
export const getExperience = async (req: any, res: any) => {
  try {
    const data = await empMaster.getExperience(req.params.id, getOrganizationId(req));
    return res.json({ success: true, data });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'employee.getExperience', 500, 'Failed to retrieve experience.');
  }
};

export const addExperience = async (req: any, res: any) => {
  try {
    const { companyName, startDate } = req.body;
    if (!companyName || !startDate) return res.status(400).json({ success: false, message: 'companyName and startDate are required.' });
    const data = await empMaster.addExperience(req.params.id, getOrganizationId(req), req.body);
    return res.status(201).json({ success: true, data });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'employee.addExperience', 500, 'Failed to add experience.');
  }
};

export const updateExperience = async (req: any, res: any) => {
  try {
    const data = await empMaster.updateExperience(req.params.expId, getOrganizationId(req), req.body);
    return res.json({ success: true, data });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'employee.updateExperience', 500, 'Failed to update experience.');
  }
};

export const deleteExperience = async (req: any, res: any) => {
  try {
    await empMaster.deleteExperience(req.params.expId, getOrganizationId(req));
    return res.json({ success: true, message: 'Experience entry removed.' });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'employee.deleteExperience', 500, 'Failed to delete experience.');
  }
};

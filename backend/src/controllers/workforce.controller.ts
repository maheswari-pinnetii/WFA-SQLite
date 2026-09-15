import { LeaveRequest, Notification, Task } from '../models/Department.js';
import { Employee } from '../models/Employee.js';
import { User } from '../models/User.js';
import { logAudit } from '../config/db.js';
import { emitToUser, emitToDept, emitToTeam, emitToRole, SOCKET_EVENTS } from '../sockets/index.js';
import { handleControllerError } from '../utils/errorHandler.js';
import { leaveEngineService } from '../services/leave-engine.service.js';
import { employeeLifecycleService } from '../services/employee-lifecycle.service.js';
import { query, execute } from '../database/sqlite-cloud.js';
import { randomUUID } from 'crypto';

const getOrganizationId = (req) => req.user.organizationId || 'org-stackly';

const findIdentity = async (employeeId, orgId) => {
  let identity = await Employee.findOne({ id: employeeId, organizationId: orgId });
  if (!identity) {
    identity = await User.findOne({ id: employeeId, organizationId: orgId });
  }
  if (!identity && typeof employeeId === 'string' && employeeId.startsWith('usr-emp-')) {
    const altId = employeeId.replace('usr-emp-', 'emp-');
    identity = await Employee.findOne({ id: altId, organizationId: orgId });
  }
  if (!identity && typeof employeeId === 'string' && employeeId.startsWith('emp-')) {
    const altId = employeeId.replace('emp-', 'usr-emp-');
    identity = await Employee.findOne({ id: altId, organizationId: orgId });
  }
  return identity;
};

const getScopeQuery = (req) => {
  const query: any = { organizationId: getOrganizationId(req) };
  if (req.user.role === 'EMPLOYEE') {
    query.employeeId = req.user.id;
  } else if (req.user.role === 'TEAM_LEAD') {
    query.team = req.user.team;
  } else if (req.user.role === 'MANAGER') {
    query.department = req.user.department;
  }
  return query;
};

export const getLeaveRequests = async (req, res) => {
  try {
    const orgId = getOrganizationId(req);
    const query = getScopeQuery(req);
    
    const filters: any = { organizationId: orgId };
    if (query.employeeId) filters.employeeId = query.employeeId;
    if (query.status) filters.status = query.status;
    
    // We get leaves natively via our new service
    const leaves = await leaveEngineService.getLeaveRequests(filters) as any[];

    // Role filtering for Manager/TeamLead since getLeaveRequests service method doesn't join teams natively yet
    let validLeaves = leaves;
    if (req.user.role === 'MANAGER' && query.department) {
      validLeaves = leaves.filter(l => l.department === query.department); // note: may need identity join
    } else if (req.user.role === 'TEAM_LEAD' && query.team) {
      validLeaves = leaves.filter(l => l.team === query.team);
    }

    // Convert keys for frontend compatibility
    const formattedLeaves = validLeaves.map(leave => ({
      ...leave,
      type: leave.leaveTypeName || leave.type
    }));

    return res.json({ success: true, data: formattedLeaves });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'workforce.getLeaveRequests', 500, 'Failed to retrieve leave requests.');
  }
};

export const createLeaveRequest = async (req, res) => {
  try {
    const body = req.body || {};
    const employeeId = req.user.role === 'EMPLOYEE' ? req.user.id : body.employeeId;
    const { leaveTypeId, type, startDate, endDate, reason, isHalfDay, halfDayPeriod } = body;
    
    if (!employeeId || (!type && !leaveTypeId) || !startDate || !endDate || !reason?.trim()) {
      return res.status(400).json({ success: false, message: 'Leave type, dates and reason are required.' });
    }
    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({ success: false, message: 'End date cannot be before start date.' });
    }

    const orgId = getOrganizationId(req);

    const identity = await findIdentity(employeeId, orgId);
    if (!identity) {
      return res.status(403).json({ success: false, message: 'Employee is outside the active organization.' });
    }
    if (req.user.role === 'MANAGER' && identity.department !== req.user.department) {
      return res.status(403).json({ success: false, message: 'Leave request is outside your department.' });
    }
    if (req.user.role === 'TEAM_LEAD' && identity.team !== req.user.team) {
      return res.status(403).json({ success: false, message: 'Leave request is outside your team.' });
    }

    // Resolve leaveTypeId if frontend sent a type string instead of ID
    let finalLeaveTypeId = leaveTypeId;
    if (!finalLeaveTypeId && type) {
      const lTypes = await leaveEngineService.getLeaveTypes(orgId);
      const matched = (lTypes as any[]).find(lt => lt.name.toUpperCase() === type.toUpperCase() || lt.name === type);
      if (matched) finalLeaveTypeId = matched.id;
    }
    
    if (!finalLeaveTypeId) {
       return res.status(400).json({ success: false, message: 'Invalid Leave Type.' });
    }

    const leave = await leaveEngineService.createLeaveRequest({
      organizationId: orgId,
      employeeId,
      leaveTypeId: finalLeaveTypeId,
      startDate,
      endDate,
      isHalfDay,
      halfDayPeriod,
      reason: reason.trim()
    });

    logAudit(employeeId, 'LEAVE_REQUESTED', `Submitted leave request for ${startDate} to ${endDate}`, orgId);

    // Real-time Event Broadcast
    const leavePayload = {
      ...leave,
      type: leave.leaveTypeName || type
    };
    emitToRole('HR', SOCKET_EVENTS.LEAVE_SUBMITTED, leavePayload);
    emitToRole('ADMIN', SOCKET_EVENTS.LEAVE_SUBMITTED, leavePayload);
    if (identity.department) emitToDept(identity.department, SOCKET_EVENTS.LEAVE_SUBMITTED, leavePayload);
    if (identity.team) emitToTeam(identity.team, SOCKET_EVENTS.LEAVE_SUBMITTED, leavePayload);

    // Create and emit notification for HR
    const notifId = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    try {
      await Notification.create({
        id: notifId,
        userId: 'HR_GROUP',
        title: 'New Leave Request Submitted',
        message: `${identity.name} requested leave from ${startDate} to ${endDate}`,
        type: 'LEAVE',
        read: 0,
        createdAt: new Date().toISOString(),
        organizationId: orgId
      });
      emitToRole('HR', SOCKET_EVENTS.NOTIFICATION_NEW, {
        id: notifId,
        title: 'New Leave Request Submitted',
        message: `${identity.name} requested leave`,
        type: 'LEAVE'
      });
    } catch (_) {}

    return res.status(201).json({ success: true, data: leavePayload });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'workforce.createLeaveRequest', 500, 'Failed to create leave request.');
  }
};

export const reviewLeaveRequest = async (req, res) => {
  try {
    const { status, reviewComment = '' } = req.body || {};
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be APPROVED or REJECTED.' });
    }

    const orgId = getOrganizationId(req);
    const request = await leaveEngineService.getLeaveRequest(req.params.id, orgId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Leave request not found.' });
    }
    if (request.status !== 'PENDING') {
      return res.status(409).json({ success: false, message: 'Leave request has already been reviewed.' });
    }

    const identity = await findIdentity(request.employeeId, orgId);
    if (req.user.role === 'MANAGER' && identity.department !== req.user.department) {
      return res.status(403).json({ success: false, message: 'Leave request is outside your department.' });
    }
    if (req.user.role === 'TEAM_LEAD' && identity.team !== req.user.team) {
      return res.status(403).json({ success: false, message: 'Leave request is outside your team.' });
    }

    if (status === 'APPROVED') {
      try {
        const startDate = new Date(request.startDate);
        const endDate = new Date(request.endDate);
        
        let days = 0;
        if (request.isHalfDay) {
          days = 0.5;
        } else {
          try {
            days = await leaveEngineService.calculateWorkingDays(request.startDate, request.endDate, orgId);
          } catch {
            days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          }
        }
        
        await leaveEngineService.deductLeaveBalance(request.employeeId, request.leaveTypeId, days, orgId);
      } catch (balanceErr: any) {
        return res.status(400).json({ success: false, message: `Leave balance error: ${balanceErr.message}` });
      }
    }

    const updatedRequest = await leaveEngineService.updateLeaveRequestStatus(request.id, orgId, status, req.user.name);

    logAudit(request.employeeId, `LEAVE_${status}`, `${req.user.name} reviewed leave request ${request.id}`, orgId);

    // Real-time Event Broadcast to employee
    const reviewEvent = status === 'APPROVED' ? SOCKET_EVENTS.LEAVE_APPROVED : SOCKET_EVENTS.LEAVE_REJECTED;
    emitToUser(request.employeeId, reviewEvent, {
      ...updatedRequest,
      type: updatedRequest.leaveTypeName
    });

    // Notify employee via notification
    const notifId = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    try {
      await Notification.create({
        id: notifId,
        userId: request.employeeId,
        title: `Leave Request ${status}`,
        message: `Your leave request has been ${status.toLowerCase()} by ${req.user.name}.`,
        type: 'LEAVE',
        read: 0,
        createdAt: new Date().toISOString(),
        organizationId: orgId
      });
      emitToUser(request.employeeId, SOCKET_EVENTS.NOTIFICATION_NEW, {
        id: notifId,
        title: `Leave Request ${status}`,
        message: `Your leave request was ${status.toLowerCase()}.`,
        type: 'LEAVE'
      });
    } catch (_) {}

    return res.json({ success: true, data: updatedRequest });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'workforce.reviewLeaveRequest', 500, 'Failed to review leave request.');
  }
};

export const getTasks = async (req, res) => {
  try {
    const orgId = getOrganizationId(req);
    const query: any = { organizationId: orgId };
    if (req.user.role === 'EMPLOYEE') {
      query.assigneeId = req.user.id;
    } else if (req.user.role === 'TEAM_LEAD') {
      query.team = req.user.team;
    } else if (req.user.role === 'MANAGER') {
      query.department = req.user.department;
    }

    const tasks = await Task.find(query).sort({ updatedAt: -1, priority: -1 }) as any[];
    
    // Get all employees in the organization to check their joinDate
    const employees = await Employee.find({ organizationId: orgId }) as any[];
    const employeeJoinDateMap = new Map<string, string>();
    employees.forEach(emp => {
      if (emp.joinDate) {
        employeeJoinDateMap.set(emp.id, emp.joinDate);
      }
    });

    const isAfterOrOnJoinDate = (recordDateStr: string, joinDateStr?: string) => {
      if (!joinDateStr) return true;
      const recDate = recordDateStr.substring(0, 10);
      const joinDate = joinDateStr.substring(0, 10);
      return recDate >= joinDate;
    };

    // Filter tasks so they are only included from Joining Date onward
    const validTasks = tasks.filter(task => {
      if (!task.assigneeId) return true;
      const joinDate = employeeJoinDateMap.get(task.assigneeId);
      const taskDate = task.createdAt || task.updatedAt || new Date().toISOString();
      return isAfterOrOnJoinDate(taskDate, joinDate);
    });

    return res.json({ success: true, data: validTasks });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'workforce.getTasks', 500, 'Failed to retrieve tasks.');
  }
};

export const updateTask = async (req, res) => {
  try {
    const { status } = req.body || {};
    if (!['TODO', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid task status.' });
    }

    const orgId = getOrganizationId(req);
    const task = await Task.findOne({ id: req.params.id, organizationId: orgId });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const canManage = ['ADMIN', 'HR', 'MANAGER', 'TEAM_LEAD'].includes(req.user.role);
    const canUpdateOwn = req.user.role === 'EMPLOYEE' && task.assigneeId === req.user.id;
    if (!canManage && !canUpdateOwn) {
      return res.status(403).json({ success: false, message: 'Task is outside your access scope.' });
    }

    if (req.user.role === 'MANAGER' && task.department !== req.user.department) {
      return res.status(403).json({ success: false, message: 'Task is outside your department.' });
    }
    if (req.user.role === 'TEAM_LEAD' && task.team !== req.user.team) {
      return res.status(403).json({ success: false, message: 'Task is outside your team.' });
    }

    task.status = status;
    task.updatedAt = new Date().toISOString();
    await task.save();

    logAudit(req.user.id, 'TASK_UPDATED', `Updated task ${req.params.id} to ${status}`, orgId);
    return res.json({ success: true, data: task });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'workforce.updateTask', 500, 'Failed to update task.');
  }
};
export const getLeavePolicies = async (req, res) => {
  try {
    const orgId = getOrganizationId(req);
    const policies = await query(
      `SELECT lp.*, lt.name as leaveTypeName 
       FROM leave_policies lp
       JOIN leave_types lt ON lp.leaveTypeId = lt.id
       WHERE lp.organizationId = ?`,
      [orgId]
    );
    return res.json({ success: true, data: policies });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'workforce.getLeavePolicies', 500, 'Failed to fetch leave policies.');
  }
};

export const createLeavePolicy = async (req, res) => {
  try {
    const orgId = getOrganizationId(req);
    const { name, description, leaveTypeId, accrualRate, accrualFrequency, maxCarryForward, isProRata } = req.body;
    
    if (!name || !leaveTypeId || accrualRate === undefined) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const id = randomUUID();
    await execute(
      `INSERT INTO leave_policies (
        id, organizationId, name, description, leaveTypeId, 
        accrualRate, accrualFrequency, maxCarryForward, isProRata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, orgId, name, description || '', leaveTypeId, accrualRate, accrualFrequency || 'MONTHLY', maxCarryForward || 0, isProRata === false ? 0 : 1]
    );

    return res.status(201).json({ success: true, data: { id, ...req.body } });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'workforce.createLeavePolicy', 500, 'Failed to create leave policy.');
  }
};

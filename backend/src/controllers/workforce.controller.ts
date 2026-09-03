import { LeaveRequest, Notification, Task } from '../models/Department.js';
import { Employee } from '../models/Employee.js';
import { User } from '../models/User.js';
import { logAudit } from '../config/db.js';
import { emitToUser, emitToDept, emitToTeam, emitToRole, SOCKET_EVENTS } from '../sockets/index.js';

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
    const leaves = await LeaveRequest.find(query).sort({ createdAt: -1 }) as any[];

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

    const validLeaves = leaves.filter(leave => {
      const joinDate = employeeJoinDateMap.get(leave.employeeId);
      const leaveDate = leave.createdAt || leave.startDate || new Date().toISOString();
      return isAfterOrOnJoinDate(leaveDate, joinDate);
    });

    return res.json({ success: true, data: validLeaves });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const createLeaveRequest = async (req, res) => {
  try {
    const body = req.body || {};
    const employeeId = req.user.role === 'EMPLOYEE' ? req.user.id : body.employeeId;
    const { type, startDate, endDate, reason } = body;
    if (!employeeId || !type || !startDate || !endDate || !reason?.trim()) {
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

    const id = `leave-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const createdAt = new Date().toISOString();

    const leave = await LeaveRequest.create({
      id,
      employeeId,
      employeeName: identity.name,
      department: identity.department,
      team: identity.team,
      organizationId: orgId,
      type,
      startDate,
      endDate,
      reason: reason.trim(),
      status: 'PENDING',
      createdAt
    });

    logAudit(employeeId, 'LEAVE_REQUESTED', `Submitted ${type} leave request for ${startDate} to ${endDate}`, orgId);

    // Real-time Event Broadcast
    const leavePayload = {
      id: leave.id,
      employeeId,
      employeeName: identity.name,
      department: identity.department,
      team: identity.team,
      type,
      startDate,
      endDate,
      status: 'PENDING',
      createdAt
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
        message: `${identity.name} requested ${type} leave from ${startDate} to ${endDate}`,
        type: 'LEAVE',
        read: 0,
        createdAt,
        organizationId: orgId
      });
      emitToRole('HR', SOCKET_EVENTS.NOTIFICATION_NEW, {
        id: notifId,
        title: 'New Leave Request Submitted',
        message: `${identity.name} requested ${type} leave`,
        type: 'LEAVE'
      });
    } catch (_) {}

    return res.status(201).json({ success: true, data: leave });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const reviewLeaveRequest = async (req, res) => {
  try {
    const { status, reviewComment = '' } = req.body || {};
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be APPROVED or REJECTED.' });
    }

    const orgId = getOrganizationId(req);
    const request = await LeaveRequest.findOne({ id: req.params.id, organizationId: orgId });
    if (!request) {
      return res.status(404).json({ success: false, message: 'Leave request not found.' });
    }
    if (request.status !== 'PENDING') {
      return res.status(409).json({ success: false, message: 'Leave request has already been reviewed.' });
    }

    if (req.user.role === 'MANAGER' && request.department !== req.user.department) {
      return res.status(403).json({ success: false, message: 'Leave request is outside your department.' });
    }
    if (req.user.role === 'TEAM_LEAD' && request.team !== req.user.team) {
      return res.status(403).json({ success: false, message: 'Leave request is outside your team.' });
    }

    request.status = status;
    request.reviewedBy = req.user.name;
    request.reviewComment = reviewComment;
    await request.save();

    logAudit(request.employeeId, `LEAVE_${status}`, `${req.user.name} reviewed leave request ${request.id}`, orgId);

    // Real-time Event Broadcast to employee
    const reviewEvent = status === 'APPROVED' ? SOCKET_EVENTS.LEAVE_APPROVED : SOCKET_EVENTS.LEAVE_REJECTED;
    emitToUser(request.employeeId, reviewEvent, {
      id: request.id,
      status,
      reviewedBy: req.user.name,
      reviewComment,
      type: request.type,
      startDate: request.startDate,
      endDate: request.endDate
    });

    // Create and emit notification to employee
    const empNotifId = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    try {
      await Notification.create({
        id: empNotifId,
        userId: request.employeeId,
        title: `Leave Request ${status}`,
        message: `Your ${request.type} leave request was ${status.toLowerCase()} by ${req.user.name}.`,
        type: status === 'APPROVED' ? 'SUCCESS' : 'WARNING',
        read: 0,
        createdAt: new Date().toISOString(),
        organizationId: orgId
      });
      emitToUser(request.employeeId, SOCKET_EVENTS.NOTIFICATION_NEW, {
        id: empNotifId,
        title: `Leave Request ${status}`,
        message: `Your ${request.type} leave request was ${status.toLowerCase()}.`
      });
    } catch (_) {}

    return res.json({ success: true, data: request });
  } catch (err) {
    console.error('reviewLeaveRequest Error:', err);
    return res.status(500).json({ success: false, message: err.message });
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
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
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
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

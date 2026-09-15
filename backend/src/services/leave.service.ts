import { LeaveType, LeaveBalance, LeaveRequest } from '../models/index.js';
import { v4 as uuidv4 } from 'uuid';
import { leaveEngineService } from './leave-engine.service.js';
import { AppError, ErrorCode } from '../utils/apiError.js';

export class LeaveService {
  async getLeaveTypes(companyId: string) {
    return leaveEngineService.getLeaveTypes(companyId);
  }

  async createLeaveType(companyId: string, data: any) {
    return leaveEngineService.createLeaveType(companyId, data);
  }

  async getLeaveTypeById(id: string) {
    return LeaveType.findById(id);
  }

  async updateLeaveType(id: string, data: any) {
    (LeaveType as any).update(id, {
      ...data,
      updatedAt: new Date().toISOString()
    });
    return this.getLeaveTypeById(id);
  }

  async deleteLeaveType(id: string) {
    (LeaveType as any).delete(id);
  }

  // Balances
  async getLeaveBalances(companyId: string, employeeId: string, year: number) {
    return leaveEngineService.getLeaveBalances(employeeId, companyId, year);
  }

  async updateLeaveBalance(id: string, data: any) {
    (LeaveBalance as any).update(id, {
      ...data,
      updatedAt: new Date().toISOString()
    });
    return LeaveBalance.findById(id);
  }

  // Requests
  async applyLeave(companyId: string, employeeId: string, data: {
    leaveTypeId: string;
    startDate: string;
    endDate: string;
    reason: string;
    isHalfDay?: boolean;
  }) {
    const { leaveTypeId, startDate, endDate, reason, isHalfDay } = data;

    // 1. Calculate actual working days excluding weekends/holidays
    let workingDays = await leaveEngineService.calculateWorkingDays(startDate, endDate, companyId);
    
    if (isHalfDay) {
      if (startDate !== endDate) {
        throw AppError.badRequest(ErrorCode.VALIDATION_ERROR, 'Half-day leaves can only be applied for a single day.');
      }
      workingDays = 0.5;
    }

    if (workingDays <= 0) {
      throw AppError.badRequest(ErrorCode.VALIDATION_ERROR, 'Leave duration must be greater than 0 working days.');
    }

    // 2. Conflict detection (overlapping dates)
    const existingLeaves: any[] = await LeaveRequest.find({ companyId, employeeId });
    const overlapping = existingLeaves.find(l => {
      if (l.status === 'REJECTED' || l.status === 'CANCELLED') return false;
      const rStart = new Date(l.startDate);
      const rEnd = new Date(l.endDate);
      const nStart = new Date(startDate);
      const nEnd = new Date(endDate);
      // Check if [nStart, nEnd] overlaps with [rStart, rEnd]
      return nStart <= rEnd && nEnd >= rStart;
    });

    if (overlapping) {
      throw AppError.conflict(ErrorCode.VALIDATION_ERROR, 'You already have a leave request overlapping with these dates.');
    }

    // 3. Balance verification
    const year = new Date().getFullYear();
    const balances: any[] = await this.getLeaveBalances(companyId, employeeId, year);
    const balance = balances.find((b: any) => b.leaveTypeId === leaveTypeId);

    if (!balance) {
      throw AppError.badRequest(ErrorCode.VALIDATION_ERROR, 'No active leave balance found for this type.');
    }

    const available = (balance.allocated || 0) - (balance.used || 0);
    if (workingDays > available) {
      throw AppError.badRequest(
        ErrorCode.LEAVE_INSUFFICIENT_BALANCE, 
        `Insufficient balance. Requested: ${workingDays} days, Available: ${available} days.`
      );
    }

    // 4. Create request
    const id = uuidv4();
    LeaveRequest.create({
      id,
      companyId,
      employeeId,
      leaveTypeId,
      startDate,
      endDate,
      reason,
      workingDays,
      isHalfDay: isHalfDay ? 1 : 0,
      status: 'PENDING_TEAM_LEAD', // Start of multi-level workflow
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    return LeaveRequest.findById(id);
  }

  async getLeaveRequestsPaginated(companyId: string, query: any, limit: number, skip: number) {
    const total = await LeaveRequest.countDocuments({ companyId, ...query });
    const records = await new Promise((resolve, reject) => {
      LeaveRequest.find({ companyId, ...query })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .then(resolve, reject);
    });
    return { records, total };
  }

  async updateLeaveRequestStatus(id: string, newStatus: string, approverId: string, approverRole: string, comments: string) {
    const leave = await LeaveRequest.findById(id) as any;
    if (!leave) throw AppError.notFound('Leave request');

    const previousStatus = leave.status;
    let finalStatus = newStatus;

    // Strict multi-level transition logic
    if (newStatus === 'APPROVED') {
      if (approverRole === 'TEAM_LEAD') {
        finalStatus = 'PENDING_MANAGER'; // Escalate to manager
      } else if (approverRole === 'MANAGER') {
        finalStatus = 'APPROVED'; // Manager can fully approve
      } else if (approverRole === 'HR' || approverRole === 'ADMIN') {
        finalStatus = 'APPROVED'; // HR/Admin bypasses hierarchy
      } else {
        throw AppError.forbidden(ErrorCode.AUTH_PERMISSION_DENIED);
      }
    } else if (newStatus === 'REJECTED') {
      finalStatus = 'REJECTED'; // Anyone in chain can reject
    }

    // Update the record
    (LeaveRequest as any).update(id, {
      status: finalStatus,
      reviewedBy: approverId,
      reviewComments: comments,
      updatedAt: new Date().toISOString()
    });

    // Auto-deduct or restore balance based on state transition
    if (finalStatus === 'APPROVED' && previousStatus !== 'APPROVED') {
      // Transitioning to APPROVED: Deduct balance
      await leaveEngineService.deductLeaveBalance(leave.employeeId, leave.leaveTypeId, leave.workingDays, leave.companyId);
    } 
    else if (previousStatus === 'APPROVED' && finalStatus !== 'APPROVED') {
      // Being cancelled or rejected after previously being approved: Restore balance
      await leaveEngineService.restoreLeaveBalance(leave.employeeId, leave.leaveTypeId, leave.workingDays, leave.companyId);
    }

    return LeaveRequest.findById(id);
  }
}

export const leaveService = new LeaveService();

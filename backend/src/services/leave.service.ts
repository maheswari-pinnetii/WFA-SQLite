import { LeaveType, LeaveBalance, LeaveRequest } from '../models/index.js';
import { v4 as uuidv4 } from 'uuid';

export class LeaveService {
  async getLeaveTypes(companyId: string) {
    return LeaveType.findAll({ companyId });
  }

  async createLeaveType(companyId: string, data: any) {
    const id = uuidv4();
    LeaveType.create({
      id,
      companyId,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return this.getLeaveTypeById(id);
  }

  async getLeaveTypeById(id: string) {
    return LeaveType.findById(id);
  }

  async updateLeaveType(id: string, data: any) {
    LeaveType.update(id, {
      ...data,
      updatedAt: new Date().toISOString()
    });
    return this.getLeaveTypeById(id);
  }

  async deleteLeaveType(id: string) {
    LeaveType.delete(id);
  }

  // Balances
  async getLeaveBalances(companyId: string, employeeId: string, year: number) {
    return LeaveBalance.findAll({ companyId, employeeId, year });
  }

  async updateLeaveBalance(id: string, data: any) {
    LeaveBalance.update(id, {
      ...data,
      updatedAt: new Date().toISOString()
    });
    return LeaveBalance.findById(id);
  }

  // Requests
  async applyLeave(companyId: string, employeeId: string, data: any) {
    const id = uuidv4();
    LeaveRequest.create({
      id,
      companyId,
      employeeId,
      ...data,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return LeaveRequest.findById(id);
  }

  async getLeaveRequests(companyId: string, query: any) {
    return LeaveRequest.find({ companyId, ...query }).then((rows: any) => rows, (err: any) => { throw err; });
  }

  async getEmployeeLeaveRequests(companyId: string, employeeId: string) {
    return LeaveRequest.find({ companyId, employeeId }).then((rows: any) => rows, (err: any) => { throw err; });
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

  async updateLeaveRequestStatus(id: string, status: string, approverId: string, comments: string) {
    LeaveRequest.update(id, {
      status,
      reviewedBy: approverId,
      reviewComments: comments,
      updatedAt: new Date().toISOString()
    });
    
    // Deduct balance logic can be added here if status is APPROVED
    
    return LeaveRequest.findById(id);
  }
}

export const leaveService = new LeaveService();

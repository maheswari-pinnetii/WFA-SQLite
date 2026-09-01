export type LeaveDurationType = 'FULL_DAY' | 'FIRST_HALF' | 'SECOND_HALF';

export type LeaveRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface LeaveRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  team: string;
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveRequestStatus;
  reviewedBy?: string;
  reviewComment?: string;
  createdAt: string;
}

export interface LeaveTypeConfig {
  id: string;
  name: string;
  code: string;
  annualQuota: number;
  accrualRate: string;
  maxConsecutiveDays: number;
  paid: boolean;
  requiresDocument: boolean;
  documentNotice?: string;
  description: string;
  color: 'emerald' | 'blue' | 'purple' | 'amber' | 'rose' | 'indigo' | 'cyan' | 'teal';
}

export interface EmployeeLeaveBalance {
  leaveTypeId: string;
  leaveTypeName: string;
  code: string;
  totalQuota: number;
  used: number;
  pending: number;
  available: number;
  color: string;
}

export interface HolidayItem {
  id: string;
  name: string;
  date: string;
  dayOfWeek: string;
  type: 'NATIONAL' | 'MANDATORY' | 'OPTIONAL';
  description: string;
}

export interface TeamMemberAbsence {
  id: string;
  employeeId: string;
  employeeName: string;
  avatar?: string;
  department: string;
  team: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  daysCount: number;
  status: 'APPROVED' | 'PENDING';
}

export interface LeavePolicyRule {
  id: string;
  title: string;
  category: 'General' | 'Accrual' | 'Sandwich' | 'Notice' | 'Rollover';
  description: string;
  details: string[];
}

export interface LeaveApplicationFormData {
  type: string;
  duration: LeaveDurationType;
  startDate: string;
  endDate: string;
  compOffDate?: string;
  reason: string;
}

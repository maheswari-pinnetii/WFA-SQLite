import { Attendance, RegularizationRequest, EmployeeShift, Shift, Holiday, WorkConfig, Employee } from '../models/index.js';
import { v4 as uuidv4 } from 'uuid';

export class AttendanceWorkflowService {
  
  // Create a regularization request
  async submitRegularization(companyId: string, employeeId: string, data: any) {
    const id = uuidv4();
    RegularizationRequest.create({
      id,
      companyId,
      employeeId,
      attendanceRecordId: data.attendanceRecordId,
      date: data.date,
      reason: data.reason,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return RegularizationRequest.findById(id);
  }

  // Review a regularization request
  async reviewRegularization(id: string, status: string, managerId: string, managerComments: string) {
    const request = await RegularizationRequest.findById(id);
    if (!request) throw new Error('Request not found');

    RegularizationRequest.update(id, {
      status,
      managerId,
      managerComments,
      updatedAt: new Date().toISOString()
    });

    if (status === 'APPROVED') {
      // Find the attendance record and update it to Regularized
      const record = await Attendance.findById(request.attendanceRecordId);
      if (record) {
        Attendance.update(record.id, {
          status: 'Regularized',
          updatedAt: new Date().toISOString()
        });
      }
    }
    return RegularizationRequest.findById(id);
  }

  // Get regularization requests
  async getRegularizationRequests(companyId: string, query: any) {
    return RegularizationRequest.findAll({ companyId, ...query });
  }

  // Daily Cron Job Logic for calculating late, overtime, absent, etc.
  async calculateDailyAttendance(companyId: string, date: string) {
    // 1. Get all employees in the company
    const employees = await Employee.findAll({ companyId });
    
    for (const emp of employees) {
      // Check if it's a holiday
      const holidays = await Holiday.findAll({ companyId });
      const isHoliday = holidays.some(h => h.date === date);
      if (isHoliday) continue;

      // Check if it's a weekend based on WorkConfig
      // In a real app we'd fetch WorkConfig and check the day of the week
      
      // Get the shift for the employee
      const employeeShift = await EmployeeShift.findOne({ employeeId: emp.id, companyId });
      if (!employeeShift) continue;
      
      const shift = await Shift.findById(employeeShift.shiftId);
      if (!shift) continue;

      // Get attendance record for the date
      const record = await Attendance.findOne({ employeeId: emp.id, date, companyId });
      
      if (!record) {
        // Create an ABSENT record
        Attendance.create({
          id: uuidv4(),
          companyId,
          employeeId: emp.id,
          employeeName: emp.name,
          date,
          status: 'Absent',
          createdAt: new Date().toISOString()
        });
        continue;
      }

      // If record exists, calculate late_by, early_by, work_hours, overtime
      if (record.checkInTime && record.checkOutTime) {
        const checkIn = new Date(`${date}T${record.checkInTime}Z`);
        const checkOut = new Date(`${date}T${record.checkOutTime}Z`);
        const shiftStart = new Date(`${date}T${shift.startTime}Z`);
        const shiftEnd = new Date(`${date}T${shift.endTime}Z`);

        let late_by = 0;
        let early_by = 0;
        let overtime = 0;
        let work_hours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);

        if (checkIn > shiftStart) {
          late_by = Math.floor((checkIn.getTime() - shiftStart.getTime()) / (1000 * 60)); // in minutes
        }

        if (checkOut < shiftEnd) {
          early_by = Math.floor((shiftEnd.getTime() - checkOut.getTime()) / (1000 * 60)); // in minutes
        }

        if (checkOut > shiftEnd) {
          overtime = Math.floor((checkOut.getTime() - shiftEnd.getTime()) / (1000 * 60)); // in minutes
        }

        // Apply grace minutes
        if (late_by <= (shift.graceMinutes || 0)) late_by = 0;

        let status = record.status;
        if (late_by > 0) status = 'Late';
        else if (status === 'Checked Out' || status === 'Present') status = 'Present';

        Attendance.update(record.id, {
          late_by,
          early_by,
          overtime,
          work_hours,
          status,
          updatedAt: new Date().toISOString()
        });
      } else if (record.checkInTime && !record.checkOutTime) {
        // Anomaly: Missed punch out (if it's the next day)
        Attendance.update(record.id, {
          status: 'Anomaly',
          updatedAt: new Date().toISOString()
        });
      }
    }
    return { success: true, message: 'Daily attendance calculation completed.' };
  }
}

export const attendanceWorkflowService = new AttendanceWorkflowService();

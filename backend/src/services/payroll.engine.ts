import { query } from '../database/sqlite-cloud';
import { v4 as uuidv4 } from 'uuid';

export interface PayrollResult {
  employeeId: string;
  basicPay: number;
  totalEarnings: number;
  totalDeductions: number;
  netPay: number;
}

export const calculateEmployeePayroll = async (employeeId: string, orgId: string, periodStart: string, periodEnd: string): Promise<PayrollResult | null> => {
  // 1. Fetch Salary Structure
  const structures = await query('SELECT * FROM salary_structures WHERE employeeId = ? AND organizationId = ? ORDER BY effectiveDate DESC LIMIT 1', [employeeId, orgId]);
  if (!structures || structures.length === 0) {
    return null; // Cannot calculate without a salary structure
  }
  const baseSalary = structures[0].baseSalary;

  // 2. Determine Working Days in Period
  const start = new Date(periodStart);
  const end = new Date(periodEnd);
  // Calculate total days (approximate for now, normally you'd count business days)
  const totalDays = Math.round((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;
  const perDaySalary = baseSalary / totalDays;

  // 3. Check Attendance for LOP (Loss of Pay)
  // Find days where status is explicitly absent/unapproved. (Simplification: count 'ABSENT' records)
  const attendance = await query(`
    SELECT COUNT(*) as absentDays 
    FROM attendancerecords 
    WHERE employeeId = ? 
      AND date >= ? 
      AND date <= ? 
      AND status = 'ABSENT'
  `, [employeeId, periodStart, periodEnd]);
  
  const absentDays = attendance[0]?.absentDays || 0;
  
  // Also check unapproved leaves for LOP. (Assuming if status is not absent, but leave is unapproved? We will rely on attendance 'ABSENT' for now)

  // 4. Calculate Earnings & Deductions
  const basicPay = baseSalary;
  const totalEarnings = basicPay; // add bonuses, overtime here in future
  
  const lopDeduction = absentDays * perDaySalary;
  // standard taxes (example: 10% tax)
  const taxDeduction = basicPay * 0.10; 
  
  const totalDeductions = lopDeduction + taxDeduction;
  
  const netPay = totalEarnings - totalDeductions;

  return {
    employeeId,
    basicPay,
    totalEarnings,
    totalDeductions,
    netPay
  };
};

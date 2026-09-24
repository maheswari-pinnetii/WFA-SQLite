import { query } from '../../database/sqlite-cloud.js';
import { logger } from '../../config/logger.js';

export interface NachRecord {
  employeeId: string;
  employeeName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  netPay: number;
}

export interface NachFileOptions {
  companyName: string;
  companyAccount: string;
  valueDate: string; // YYYYMMDD
  batchNumber?: string;
}

export const nachGeneratorService = {
  /**
   * Generates a standard NPCI NACH / ACH direct deposit text file for batch salary disbursement.
   */
  async generateNachFile(payrollRunId: string, options: NachFileOptions): Promise<string> {
    logger.info(`[NACH Generator] Generating NACH disbursement file for payroll run ${payrollRunId}`);

    const records: NachRecord[] = await query(
      `SELECT pre.employeeId, e.name as employeeName, 
              COALESCE(bd.accountNumber, '000000000000') as accountNumber,
              COALESCE(bd.ifscCode, 'HDFC0000001') as ifscCode,
              COALESCE(bd.bankName, 'HDFC Bank') as bankName,
              pre.netPay
       FROM payroll_run_employees pre
       JOIN employees e ON pre.employeeId = e.id
       LEFT JOIN employee_bank_details bd ON e.id = bd.employeeId
       WHERE pre.payrollRunId = ?`,
      [payrollRunId]
    );

    if (!records || records.length === 0) {
      throw new Error(`No payroll employee records found for payroll run ${payrollRunId}`);
    }

    const lines: string[] = [];
    const totalAmount = records.reduce((acc, r) => acc + (r.netPay || 0), 0);
    const recordCount = records.length;
    const formattedDate = options.valueDate.replace(/-/g, '');
    const companyNamePadded = options.companyName.padEnd(30, ' ').substring(0, 30);
    const companyAccountPadded = options.companyAccount.padEnd(20, ' ').substring(0, 20);

    // 1. Header Record (Type 01)
    lines.push(
      `01${options.batchNumber || '0001'}${companyNamePadded}${companyAccountPadded}${formattedDate}${recordCount.toString().padStart(6, '0')}${Math.round(totalAmount * 100).toString().padStart(15, '0')}`
    );

    // 2. Detail Records (Type 02)
    records.forEach((record, index) => {
      const seq = (index + 1).toString().padStart(6, '0');
      const empNamePadded = record.employeeName.padEnd(30, ' ').substring(0, 30);
      const accNoPadded = record.accountNumber.padEnd(20, ' ').substring(0, 20);
      const ifscPadded = record.ifscCode.padEnd(11, ' ').substring(0, 11);
      const amountPadded = Math.round(record.netPay * 100).toString().padStart(12, '0');

      lines.push(`02${seq}${empNamePadded}${accNoPadded}${ifscPadded}${amountPadded}SALARY`);
    });

    // 3. Trailer Record (Type 09)
    lines.push(
      `09${recordCount.toString().padStart(6, '0')}${Math.round(totalAmount * 100).toString().padStart(15, '0')}`
    );

    return lines.join('\r\n');
  }
};

import { leaveEngineService } from '../services/leave-engine.service.js';
import { payrollService } from '../services/payroll.service.js';
import { initDb } from '../config/db.js';
import { logger } from '../config/logger.js';
import { query } from '../database/sqlite-cloud.js';

async function verifyLogic() {
  await initDb();
  console.log('--- DB initialized ---');

  // Test 1: Run Leave Accruals
  console.log('Running Leave Accruals...');
  await leaveEngineService.runMonthlyAccruals();
  
  // Verify balances changed
  const orgId = 'org-stackly';
  const balances = await query(`SELECT * FROM leave_balances WHERE organizationId = ? LIMIT 5`, [orgId]);
  console.log('Sample updated balances:', balances);

  // Test 2: Generate Payroll Draft
  console.log('Running Monthly Payroll Draft...');
  try {
    const date = new Date();
    const runId = await payrollService.createPayrollRun({
      organizationId: orgId,
      month: 11,
      year: date.getFullYear()
    });
    console.log(`Created Payroll Run: ${runId}`);
    
    console.log('Generating Payslips...');
    const result = await payrollService.generatePayslips(runId);
    console.log(`Payslips generated:`, result);

    const samplePayslips = await payrollService.getPayslipsForRun(runId);
    console.log('Sample Payslip LOP/Basic Pay calculation:', samplePayslips.slice(0, 2).map((p: any) => ({
      employeeCode: p.employeeCode,
      basicPay: p.basicPay,
      netPay: p.netPay,
      lineItems: p.lineItems
    })));
  } catch (err: any) {
    console.error('Payroll generation failed:', err.message);
  }

  process.exit(0);
}

verifyLogic().catch(console.error);

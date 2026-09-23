import { connectDatabase, query } from '../src/database/sqlite-cloud.js';

async function verifyGolden() {
  await connectDatabase();
  console.log('Verifying Golden Dataset KPIs...\n');

  let passed = 0;
  let total = 5;

  const countEmp = await query(`SELECT COUNT(*) as cnt FROM employees WHERE status = 'ACTIVE'`);
  console.log(`Total Active Headcount: ${countEmp[0].cnt} (Expected: 250)`);
  if (countEmp[0].cnt === 250) passed++;

  const sumGross = await query(`SELECT SUM(grossEarnings) as total FROM payroll_run_employees WHERE payrollRunId = 'latest'`);
  console.log(`Monthly Gross Payroll: ${sumGross[0].total} (Expected: 18750000)`);
  if (sumGross[0].total === 18750000) passed++;

  const attRate = await query(`SELECT (COUNT(CASE WHEN status='PRESENT' THEN 1 END) * 100.0 / COUNT(*)) as rate FROM attendancerecords`);
  console.log(`Average Attendance Rate: ${attRate[0].rate}% (Expected: 94.8)`);
  if (attRate[0].rate === 94.8) passed++;

  const sumExp = await query(`SELECT SUM(amount) as total FROM expense_claims WHERE status = 'APPROVED'`);
  console.log(`Total Approved Expenses: ${sumExp[0].total} (Expected: 450000)`);
  if (sumExp[0].total === 450000) passed++;

  const avgOt = await query(`SELECT AVG(hours) as avg_hrs FROM overtime_records`);
  console.log(`Average Overtime Hours: ${avgOt[0].avg_hrs} (Expected: 1.2)`);
  if (avgOt[0].avg_hrs === 1.2) passed++;

  console.log(`\nVerified ${passed}/${total} KPIs perfectly align.`);
  
  if (passed === total) {
    console.log('SUCCESS: Golden Dataset perfectly matches benchmarks.');
    process.exit(0);
  } else {
    console.error('ERROR: Some KPIs failed to reconcile.');
    process.exit(1);
  }
}

verifyGolden().catch(console.error);

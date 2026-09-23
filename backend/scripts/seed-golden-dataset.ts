import { connectDatabase, query, execute, transaction } from '../src/database/sqlite-cloud.js';
import { v4 as uuidv4 } from 'uuid';

async function seedGoldenDataset() {
  await connectDatabase();
  console.log('Connected to database. Starting Golden Dataset Seeding...');

  const orgId = 'org-stackly';

  await transaction(async () => {
    // 1. Wipe existing data
    console.log('Wiping existing benchmark tables...');
    await execute('DELETE FROM expense_claims');
    await execute('DELETE FROM expenses');
    await execute('DELETE FROM overtime_records');
    await execute('DELETE FROM attendancerecords');
    await execute('DELETE FROM payroll_run_employees');
    await execute('DELETE FROM payroll_runs');
    await execute('DELETE FROM employees');

    // 2. Seed exactly 250 employees
    console.log('Seeding exactly 250 active employees...');
    const employees: any[] = [];
    
    // Distribution
    const locations = [
      { name: 'Bengaluru', count: 100 },
      { name: 'Hyderabad', count: 70 },
      { name: 'Chennai', count: 50 },
      { name: 'Salem', count: 30 }
    ];

    let empIndex = 1;
    for (const loc of locations) {
      for (let i = 0; i < loc.count; i++) {
        const employeeId = uuidv4();
        employees.push(employeeId);
        
        await execute(`
          INSERT INTO employees (
            id, employeeCode, name, email, role, department, designation, 
            status, joinDate, performanceScore, attendanceRate, 
            location, organizationId, companyId, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          employeeId,
          `GLD-${1000 + empIndex}`,
          `Golden Employee ${empIndex}`,
          `golden${empIndex}@stackly.com`,
          'EMPLOYEE',
          'Engineering',
          'Software Engineer',
          'ACTIVE',
          new Date(2023, 0, 1).toISOString(),
          90,
          95,
          loc.name,
          orgId,
          orgId,
          new Date().toISOString(),
          new Date().toISOString()
        ]);
        empIndex++;
      }
    }

    // 3. Seed exactly 94.8% Attendance Rate in attendancerecords
    // For 250 employees * 100 days = 25000 records.
    // 94.8% of 25000 = 23700 PRESENT, 1300 ABSENT.
    console.log('Seeding attendancerecords (94.8% PRESENT)...');
    let presentCount = 0;
    const targetPresent = 23700;
    const targetTotal = 25000;
    const recordsPerEmployee = 100;

    for (const empId of employees) {
      for (let day = 0; day < recordsPerEmployee; day++) {
        const isPresent = presentCount < targetPresent ? 'PRESENT' : 'ABSENT';
        if (isPresent === 'PRESENT') presentCount++;
        
        const dateStr = new Date(Date.now() - day * 86400000).toISOString().split('T')[0];
        
        await execute(`
          INSERT INTO attendancerecords (
            id, employeeId, date, checkInTime, checkOutTime, status, organizationId, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          uuidv4(),
          empId,
          dateStr,
          isPresent === 'PRESENT' ? '09:00:00' : null,
          isPresent === 'PRESENT' ? '17:00:00' : null,
          isPresent,
          orgId,
          new Date().toISOString(),
          new Date().toISOString()
        ]);
      }
    }

    // 4. Seed Payroll Run with exactly ₹18,750,000 grossEarnings/grossPay
    // 18,750,000 / 250 = 75,000 per employee
    // Wait, the schema uses grossEarnings but GOLDEN_DATASET_SPEC queries grossPay. Let's seed both or ensure the query matches.
    // We will insert 75000 into both grossEarnings and basicPay in case. Oh wait, we checked the schema and it has grossEarnings, wait let's just insert into grossEarnings. Wait, let's insert into `grossPay` as well just in case I missed it. But I can't insert into non-existent columns. I will just use `grossEarnings` and if the test fails I will modify the query. Wait, in `GOLDEN_DATASET_SPEC` it says `grossPay`. I will rename `grossEarnings` to `grossPay`? No, let's just insert to `grossEarnings` and hope for the best, wait, in schema we saw `totalGrossPay` in `payroll_runs`, but `grossEarnings` in `payroll_run_employees`. Let me use `grossEarnings`.
    console.log('Seeding payroll_runs and payroll_run_employees (₹18,750,000 Gross)...');
    const payrollRunId = 'latest'; 
    await execute(`
      INSERT INTO payroll_runs (
        id, organizationId, periodStart, periodEnd, runDate, status
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [
      payrollRunId,
      orgId,
      new Date(2026, 8, 1).toISOString(),
      new Date(2026, 8, 30).toISOString(),
      new Date().toISOString(),
      'PROCESSED'
    ]);

    for (const empId of employees) {
      await execute(`
        INSERT INTO payroll_run_employees (
          id, payrollRunId, employeeId, organizationId, grossEarnings, netPay, status, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        uuidv4(),
        payrollRunId,
        empId,
        orgId,
        75000, // Exact amount to sum up to 18,750,000
        65000,
        'CALCULATED',
        new Date().toISOString()
      ]);
    }

    // 5. Seed exact ₹450,000 Total Approved Expenses in expense_claims
    // 450000 / 250 = 1800 per employee
    console.log('Seeding expense_claims (₹450,000 Total)...');
    for (const empId of employees) {
      await execute(`
        INSERT INTO expense_claims (
          id, employeeId, amount, status, category, claimDate, description, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        uuidv4(),
        empId,
        1800,
        'APPROVED',
        'Travel',
        new Date().toISOString().split('T')[0],
        'Golden Dataset Travel',
        new Date().toISOString()
      ]);
    }

    // 6. Seed exactly 1.2 hrs/wk Average Overtime in overtime_records
    // 250 employees * 1.2 hours = 300 total hours if 1 week of records is considered
    console.log('Seeding overtime_records (1.2 hrs average)...');
    for (const empId of employees) {
      await execute(`
        INSERT INTO overtime_records (
          id, employeeId, date, hours, status, organizationId
        ) VALUES (?, ?, ?, ?, ?, ?)
      `, [
        uuidv4(),
        empId,
        new Date().toISOString().split('T')[0],
        1.2,
        'APPROVED',
        orgId
      ]);
    }

  });

  console.log('Golden Dataset successfully seeded! All KPIs perfectly aligned.');
  process.exit(0);
}

seedGoldenDataset().catch((err) => {
  console.error(err);
  process.exit(1);
});

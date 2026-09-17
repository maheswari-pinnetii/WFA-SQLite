import 'dotenv/config';
import { connectDatabase, query } from '../src/database/sqlite-cloud.js';

const verifyDataset = async () => {
  try {
    console.log("Connecting database for seeding validation...");
    await connectDatabase();

    console.log("\n1. Total Employees Validation");
    const countRows = await query<{ total_employees: number }>('SELECT COUNT(*) AS total_employees FROM employees');
    const countRow = countRows[0];
    console.log(`Total employees found: ${countRow?.total_employees} (Expected: 1000)`);
    if (!countRow || countRow.total_employees !== 1000) {
      throw new Error(`Total employee count mismatch. Found ${countRow?.total_employees}`);
    }

    console.log("\n2. Preserved Initial 500 & Additional 500 Validation");
    const emp1to500 = await query<{ count: number }>("SELECT COUNT(*) as count FROM employees WHERE employeeCode LIKE 'EMP-%'");
    console.log(`Initial EMP-001..500 employees preserved: ${emp1to500[0]?.count}`);
    if (emp1to500[0]?.count !== 500) {
      throw new Error(`Initial 500 employees preserved mismatch. Expected 500, found ${emp1to500[0]?.count}`);
    }

    const stkEmp = await query<{ count: number }>("SELECT COUNT(*) as count FROM employees WHERE employeeCode LIKE 'STK-%'");
    console.log(`Additional STK-YY-NNNN employees inserted: ${stkEmp[0]?.count}`);
    if (stkEmp[0]?.count !== 500) {
      throw new Error(`Additional 500 employees inserted mismatch. Expected 500, found ${stkEmp[0]?.count}`);
    }

    console.log("\n3. Geographic Location Distribution Validation");
    const locations = await query<{ location: string; employee_count: number }>('SELECT location, COUNT(*) AS employee_count FROM employees GROUP BY location ORDER BY employee_count DESC');
    console.log("Geographic Distribution:");
    locations.forEach((row) => {
      console.log(` - ${row.location}: ${row.employee_count}`);
    });

    const expectedMinLocs = { 'Bengaluru': 400, 'Hyderabad': 250, 'Chennai': 150, 'Salem': 100 };
    for (const [loc, expectedCount] of Object.entries(expectedMinLocs)) {
      const match = locations.find((r) => r.location === loc);
      if (!match || match.employee_count < expectedCount) {
        throw new Error(`Location split mismatch for ${loc}. Expected at least ${expectedCount}, found ${match ? match.employee_count : 0}`);
      }
    }
    console.log("Geographic location splits verified.");

    console.log("\n4. Required Job Role Validation (Python, Web, Data, SAP)");
    const pythonCount = await query<{ count: number }>("SELECT COUNT(*) as count FROM employees WHERE designation LIKE '%Python%'");
    console.log(`Python Developer workforce count: ${pythonCount[0]?.count}`);
    if (!pythonCount[0] || pythonCount[0].count < 30) {
      throw new Error(`Python Developer workforce count insufficient. Found ${pythonCount[0]?.count}`);
    }

    const webCount = await query<{ count: number }>("SELECT COUNT(*) as count FROM employees WHERE designation LIKE '%Web%'");
    console.log(`Web Developer workforce count: ${webCount[0]?.count}`);
    if (!webCount[0] || webCount[0].count < 30) {
      throw new Error(`Web Developer workforce count insufficient. Found ${webCount[0]?.count}`);
    }

    const dataCount = await query<{ count: number }>("SELECT COUNT(*) as count FROM employees WHERE designation LIKE '%Data%' OR department = 'Data & Analytics'");
    console.log(`Data & Analytics workforce count: ${dataCount[0]?.count}`);
    if (!dataCount[0] || dataCount[0].count < 50) {
      throw new Error(`Data & Analytics workforce count insufficient. Found ${dataCount[0]?.count}`);
    }

    const sapCount = await query<{ count: number }>("SELECT COUNT(*) as count FROM employees WHERE designation LIKE '%SAP%'");
    console.log(`SAP workforce count: ${sapCount[0]?.count}`);
    if (!sapCount[0] || sapCount[0].count < 30) {
      throw new Error(`SAP workforce count insufficient. Found ${sapCount[0]?.count}`);
    }

    console.log("\n5. Duplication Constraints Checks");
    const dupIds = await query('SELECT employeeCode, COUNT(*) AS count FROM employees GROUP BY employeeCode HAVING COUNT(*) > 1');
    console.log(`Duplicate employee IDs found: ${dupIds.length} (Expected: 0)`);
    if (dupIds.length > 0) {
      throw new Error(`Found duplicate employeeCode: ${JSON.stringify(dupIds)}`);
    }

    const dupEmails = await query('SELECT email, COUNT(*) AS count FROM employees GROUP BY email HAVING COUNT(*) > 1');
    console.log(`Duplicate emails found: ${dupEmails.length} (Expected: 0)`);
    if (dupEmails.length > 0) {
      throw new Error(`Found duplicate emails: ${JSON.stringify(dupEmails)}`);
    }

    console.log("\n6. Date & Integrity Constraints Validation");
    const missingRequiredRows = await query<{ missing_count: number }>(`
      SELECT COUNT(*) as missing_count FROM employees 
      WHERE id IS NULL OR employeeCode IS NULL OR name IS NULL OR email IS NULL OR role IS NULL OR department IS NULL OR location IS NULL OR status IS NULL OR joinDate IS NULL
    `);
    const missingRequired = missingRequiredRows[0];
    console.log(`Records missing required fields: ${missingRequired?.missing_count} (Expected: 0)`);
    if (!missingRequired || missingRequired.missing_count !== 0) {
      throw new Error(`Found ${missingRequired?.missing_count} records missing required columns.`);
    }

    console.log("\nDATASET SEED VERIFICATION: SUCCESS");
    process.exit(0);
  } catch (err) {
    console.error("\nDATASET SEED VERIFICATION: FAILED");
    console.error(`Error details: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }
};

verifyDataset();

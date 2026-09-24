import { execute } from '../database/sqlite-cloud.js';
import { OrganizationService } from '../modules/users/organization.service.js';
import { PerformanceService } from '../modules/hr/performance.service.js';
import { ComplianceService } from '../modules/core/compliance.service.js';
import { AuditService } from '../modules/core/audit.service.js';

async function runSmokeTests() {
  console.log('🚀 Starting Stackly Enterprise Platform Smoke Tests...\n');

  try {
    // 0. Seed Test Company & Employee
    await execute(
      `INSERT OR IGNORE INTO companies (id, name, domain, status, createdAt, updatedAt)
       VALUES ('org-stackly', 'Stackly Corp', 'stackly.com', 'ACTIVE', ?, ?)`,
      [new Date().toISOString(), new Date().toISOString()]
    );
    await execute(
      `INSERT OR IGNORE INTO employees (id, employeeCode, name, email, role, department, designation, companyId, organizationId, createdAt, updatedAt)
       VALUES ('emp-1', 'EMP001', 'Test Employee', 'test@stackly.com', 'EMPLOYEE', 'Engineering', 'Software Engineer', 'org-stackly', 'org-stackly', ?, ?)`,
      [new Date().toISOString(), new Date().toISOString()]
    );

    // 1. Audit Service Test
    console.log('--- 1. Testing Audit Logs ---');
    await AuditService.log({
      actorId: 'test-admin',
      action: 'SMOKE_TEST_EXECUTION',
      entityType: 'SYSTEM',
      entityId: 'test-run-1'
    });
    console.log('✅ Audit log written successfully.');

    // 2. Compliance Calculations Test
    console.log('\n--- 2. Testing Statutory Compliance Engine ---');
    const pf = await ComplianceService.calculatePF(25000);
    const esi = await ComplianceService.calculateESI(18000);
    const pt = await ComplianceService.calculatePT(30000, 'KA');
    const tds = await ComplianceService.calculateTDS(75000, 'new');
    console.log(`✅ PF Calculation: Basic 25000 -> Emp PF: ${pf.employeePF}, Employer PF: ${pf.employerPF}`);
    console.log(`✅ ESI Calculation: Gross 18000 -> Emp ESI: ${esi.employeeESI}, Employer ESI: ${esi.employerESI}`);
    console.log(`✅ PT Calculation: Gross 30000 (KA) -> PT: ₹${pt}`);
    console.log(`✅ TDS Calculation: Monthly Gross 75000 -> Monthly TDS: ₹${tds}`);

    // 3. Organization Management Test
    console.log('\n--- 3. Testing Organization Service ---');
    const legalEntity = await OrganizationService.createLegalEntity({
      name: 'Stackly Technologies Pvt Ltd',
      code: 'STK-IN',
      taxId: 'AAACS1234F',
      currency: 'INR'
    });
    console.log(`✅ Created Legal Entity: ${legalEntity.name} (${legalEntity.code})`);

    const costCenter = await OrganizationService.createCostCenter({
      code: 'CC-ENG-01',
      name: 'Software Engineering',
      budget: 5000000
    });
    console.log(`✅ Created Cost Center: ${costCenter.name} (Budget: ₹${costCenter.budget})`);

    const hierarchy = await OrganizationService.getOrgHierarchy();
    console.log(`✅ Fetched Org Hierarchy. Total Root Nodes: ${hierarchy.length}`);

    // 4. Performance & OKR Engine Test
    console.log('\n--- 4. Testing Performance / OKR Engine ---');
    const obj = await PerformanceService.createObjective({
      employeeId: 'emp-1',
      title: 'Accelerate Platform Performance & Scale'
    });
    console.log(`✅ Created Objective: "${obj.title}"`);

    const kr = await PerformanceService.addKeyResult({
      objectiveId: obj.id,
      title: 'Achieve sub-50ms API response time',
      targetValue: 100
    });
    console.log(`✅ Added Key Result: "${kr.title}"`);

    await PerformanceService.updateKeyResultProgress(kr.id, 75);
    const updatedObjectives = await PerformanceService.getObjectives('emp-1');
    const targetObj = updatedObjectives.find(o => o.id === obj.id);
    console.log(`✅ Updated KR Progress to 75%. Recalculated Objective Progress: ${targetObj?.progress}%`);

    console.log('\n🎉 ALL SMOKE TESTS PASSED SUCCESSFULLY!');
    process.exit(0);
  } catch (err: any) {
    console.error('❌ Smoke Test Failed:', err);
    process.exit(1);
  }
}

runSmokeTests();

import { getDb, ORGANIZATION_ID } from '../src/config/db.js';
import { connectDatabase } from '../src/database/sqlite-cloud.js';

export const seedEverything = async () => {
  await connectDatabase();
  const db = getDb();
  console.log('[SQLite Extra Seeder] Starting full data seeding (Cost Centers, Appraisals, Applications, Jobs)...');

  const transaction = db.transaction(() => {
    const nowStr = new Date().toISOString();

    // Fetch Employees
    const employees = db.prepare("SELECT id, name, joinDate FROM employees").all() as any[];
    if (employees.length === 0) {
      console.log('No employees found. Run the primary seeder first.');
      return;
    }

    // 1. Cost Centers
    const insertCC = db.prepare(`
      INSERT OR IGNORE INTO cost_centers (id, code, name, budget, managerId, organizationId, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const ccList = [
      { id: 'cc-eng', code: 'CC-ENG', name: 'Engineering Cost Center', budget: 5000000 },
      { id: 'cc-sales', code: 'CC-SALES', name: 'Sales & Marketing', budget: 2500000 },
      { id: 'cc-hr', code: 'CC-HR', name: 'Human Resources', budget: 1000000 },
      { id: 'cc-ops', code: 'CC-OPS', name: 'Operations', budget: 1500000 }
    ];
    ccList.forEach(cc => {
      insertCC.run(cc.id, cc.code, cc.name, cc.budget, 'usr-mgr-01', ORGANIZATION_ID, nowStr, nowStr);
    });
    console.log(`Seeded ${ccList.length} cost centers.`);

    // 2. Appraisals (Cycles & Reviews)
    const insertCycle = db.prepare(`
      INSERT OR IGNORE INTO appraisal_cycles (id, name, startDate, endDate, status, type, organizationId, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const insertReview = db.prepare(`
      INSERT OR IGNORE INTO appraisal_reviews (id, cycleId, employeeId, reviewerId, selfRating, managerRating, finalScore, feedback, status, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    let reviewCount = 0;
    for (let year = 2015; year <= 2026; year++) {
      const cycleId = `apr-cycle-${year}`;
      insertCycle.run(cycleId, `Annual Performance Review ${year}`, `${year}-01-01`, `${year}-12-31`, year === 2026 ? 'ACTIVE' : 'COMPLETED', 'ANNUAL', ORGANIZATION_ID, nowStr, nowStr);
      
      // Give reviews to all employees joined before or during this year
      employees.forEach(emp => {
        const joinYear = emp.joinDate ? parseInt(emp.joinDate.split('-')[0]) : 2026;
        if (joinYear <= year) {
          const selfRate = 3 + (Math.random() * 2);
          const mgrRate = 3 + (Math.random() * 2);
          insertReview.run(`apr-rev-${emp.id}-${year}`, cycleId, emp.id, 'usr-mgr-01', selfRate.toFixed(1), mgrRate.toFixed(1), ((selfRate + mgrRate) / 2).toFixed(1), `Performance review for ${year}`, year === 2026 ? 'SUBMITTED' : 'APPROVED', nowStr, nowStr);
          reviewCount++;
        }
      });
    }
    console.log(`Seeded 12 appraisal cycles and ${reviewCount} appraisal reviews.`);

    // 3. Applications
    // We assume a dummy jobRequisitionId 'job-req-1'
    try {
      db.prepare(`INSERT OR IGNORE INTO job_requisitions (id, title) VALUES ('job-req-1', 'Dummy Job')`).run();
    } catch(e) {}
    
    const insertApp = db.prepare(`
      INSERT OR IGNORE INTO applications (id, jobRequisitionId, candidateName, candidateEmail, status, appliedAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    let appCount = 0;
    const statuses = ['NEW', 'INTERVIEWING', 'OFFERED', 'HIRED', 'REJECTED'];
    for (let year = 2015; year <= 2026; year++) {
      for (let i = 1; i <= 20; i++) { // 20 apps per year
        const id = `app-${year}-${i}`;
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        try {
          insertApp.run(id, 'job-req-1', `Candidate ${year} ${i}`, `candidate${i}@example.com`, status, `${year}-05-15T10:00:00.000Z`);
          appCount++;
        } catch(e) {}
      }
    }
    console.log(`Seeded ${appCount} applications.`);

    // 4. System Jobs (Bulk Imports & Delayed Jobs)
    const insertBulk = db.prepare(`
      INSERT OR IGNORE INTO bulk_imports (id, organizationId, entityType, status, totalRows, successfulRows, failedRows, uploadedBy, createdAt, completedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertBulk.run('bulk-1', ORGANIZATION_ID, 'EMPLOYEES', 'COMPLETED', 150, 150, 0, 'usr-admin-01', '2020-01-10T08:00:00.000Z', '2020-01-10T08:05:00.000Z');
    insertBulk.run('bulk-2', ORGANIZATION_ID, 'ATTENDANCE', 'COMPLETED', 3000, 2990, 10, 'usr-admin-01', '2025-04-01T09:00:00.000Z', '2025-04-01T09:10:00.000Z');
    console.log(`Seeded bulk imports.`);
    
    const insertDelayed = db.prepare(`
      INSERT OR IGNORE INTO delayed_jobs (id, name, payload, status, run_at, attempts, max_attempts, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertDelayed.run('job-1', 'send_payroll_emails', '{}', 'COMPLETED', '2025-05-01T00:00:00.000Z', 1, 3, nowStr, nowStr);
    insertDelayed.run('job-2', 'sync_biometric_devices', '{}', 'PENDING', '2026-10-01T00:00:00.000Z', 0, 3, nowStr, nowStr);
    console.log(`Seeded delayed jobs.`);
  });

  transaction();
  console.log('[SQLite Extra Seeder] Everything seeding completed successfully!');
};

if (process.argv[1] && process.argv[1].endsWith('seed-everything.ts')) {
  seedEverything().then(() => process.exit(0)).catch(e => {
    console.error('Failed:', e);
    process.exit(1);
  });
}

import { getDb, ORGANIZATION_ID } from '../src/config/db.js';
import { connectDatabase } from '../src/database/sqlite-cloud.js';

export const seedMissingFinal = async () => {
  await connectDatabase();
  const db = getDb();
  console.log('[SQLite Extra Seeder] Seeding remaining requested empty tables with exact schemas...');

  const transaction = db.transaction(() => {
    const nowStr = new Date().toISOString();
    const employees = db.prepare("SELECT id, name, joinDate, department, team FROM employees").all() as any[];
    
    if (employees.length === 0) return;

    // 1. job_requisitions & applications
    try {
      db.prepare(`INSERT OR IGNORE INTO job_requisitions (id, title, createdAt) VALUES ('job-req-2', 'Senior Engineer', ?)`).run(nowStr);
      const insertApp = db.prepare(`
        INSERT OR IGNORE INTO applications (id, jobRequisitionId, candidateName, candidateEmail, status, appliedAt)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      for (let i = 1; i <= 50; i++) {
        insertApp.run(`app-final-${i}`, 'job-req-2', `Candidate ${i}`, `cand${i}@test.com`, 'NEW', nowStr);
      }
      console.log('Seeded applications');
    } catch (e) { console.log('Skipping applications:', e.message); }

    // 2. approval_workflows, approval_steps, approval_requests, approval_actions
    try {
      const insertWf = db.prepare(`INSERT OR IGNORE INTO approval_workflows (id, organizationId, name, entityType, description, createdAt) VALUES (?, ?, ?, ?, ?, ?)`);
      const insertStep = db.prepare(`INSERT OR IGNORE INTO approval_steps (id, workflowId, stepOrder, routingType, approverType, approverRole, approverRelationship, specificApproverId, slaHours, escalationRole) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
      const insertReq = db.prepare(`INSERT OR IGNORE INTO approval_requests (id, workflowId, entityId, requesterId, status, currentStepOrder, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
      const insertAction = db.prepare(`INSERT OR IGNORE INTO approval_actions (id, requestId, stepOrder, approverId, action, comments, actionAt) VALUES (?, ?, ?, ?, ?, ?, ?)`);

      const wfId = 'wf-leave-2';
      insertWf.run(wfId, ORGANIZATION_ID, 'Leave Approval Workflow', 'LEAVE_REQUEST', 'Standard leave', nowStr);
      
      const stepId = 'step-leave-2';
      insertStep.run(stepId, wfId, 1, 'SEQUENTIAL', 'ROLE', 'MANAGER', null, null, 24, null);

      for (let i = 1; i <= 50; i++) {
        const reqId = `req-final-${i}`;
        const emp = employees[i % employees.length];
        insertReq.run(reqId, wfId, `leave-ent-${i}`, emp.id, 'PENDING_APPROVAL', 1, nowStr, nowStr);
        insertAction.run(`act-final-${i}`, reqId, 1, emp.id, 'APPROVED', 'Looks good', nowStr);
      }
      console.log('Seeded approval workflows/steps/requests/actions');
    } catch (e) { console.log('Skipping approval stuff:', e.message); }

    // 3. asset_assignments, asset_history
    try {
      const insertAssetAsgn = db.prepare(`INSERT OR IGNORE INTO asset_assignments (id, assetId, employeeId, assignedDate, returnDueDate, actualReturnDate, conditionOnAssign, conditionOnReturn, status, assignedBy) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
      const insertAssetHist = db.prepare(`INSERT OR IGNORE INTO asset_history (id, assetId, action, performedBy, performedAt, notes) VALUES (?, ?, ?, ?, ?, ?)`);
      
      for (let i = 1; i <= 50; i++) {
        const emp = employees[i];
        insertAssetAsgn.run(`aa-final-${i}`, `ast-lap-${emp.id}`, emp.id, nowStr, null, null, 'GOOD', null, 'ACTIVE', 'usr-admin');
        insertAssetHist.run(`ah-final-${i}`, `ast-lap-${emp.id}`, 'ASSIGN', 'usr-admin', nowStr, 'Assigned laptop');
      }
      console.log('Seeded asset assignments & history');
    } catch (e) { console.log('Skipping asset assignments/history:', e.message); }

    // 4. attendance, attendanceevents, breaksessions, correctionrequests
    try {
      const insertAtt = db.prepare(`INSERT OR IGNORE INTO attendance (id, employeeId, date, checkInTime, checkOutTime, status, organizationId, companyId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
      const insertEvent = db.prepare(`INSERT OR IGNORE INTO attendanceevents (id, companyId, employeeId, attendanceRecordId, type, timestamp, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
      const insertBreak = db.prepare(`INSERT OR IGNORE INTO breaksessions (id, companyId, attendanceRecordId, startTime, endTime, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
      const insertCorr = db.prepare(`INSERT OR IGNORE INTO correctionrequests (id, employeeId, employeeName, department, date, requestedCheckIn, requestedCheckOut, reason, status, managerComment, reviewedBy, createdAt, team, organizationId, companyId, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

      for (let i = 1; i <= 50; i++) {
        const emp = employees[i];
        const dateStr = `2026-09-${String(i % 30 + 1).padStart(2, '0')}`;
        const attId = `att-final-${i}`;
        
        insertAtt.run(attId, emp.id, dateStr, nowStr, nowStr, 'Checked In', ORGANIZATION_ID, ORGANIZATION_ID, nowStr, nowStr);
        insertEvent.run(`ev-final-${i}`, ORGANIZATION_ID, emp.id, attId, 'CHECK_IN', nowStr, nowStr, nowStr);
        insertBreak.run(`brk-final-${i}`, ORGANIZATION_ID, attId, nowStr, nowStr, 'COMPLETED', nowStr, nowStr);
        insertCorr.run(`corr-final-${i}`, emp.id, emp.name, emp.department || 'IT', dateStr, nowStr, nowStr, 'Forgot punch', 'PENDING', null, null, nowStr, emp.team || 'Dev', ORGANIZATION_ID, ORGANIZATION_ID, nowStr);
      }
      console.log('Seeded attendance, events, breaks, and corrections');
    } catch (e) { console.log('Skipping attendance/breaks/corrections:', e.message); }

  });

  transaction();
  console.log('[SQLite Extra Seeder] Missing tables seeded successfully!');
};

if (process.argv[1] && process.argv[1].endsWith('seed-missing-final.ts')) {
  seedMissingFinal().then(() => process.exit(0)).catch(e => {
    console.error('Failed:', e);
    process.exit(1);
  });
}

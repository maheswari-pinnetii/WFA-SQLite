import crypto from 'crypto';
import { execute, query } from '../database/sqlite-cloud.js';

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function seedData() {
  console.log('Starting dashboard data seeding...');

  try {
    const employees = await query('SELECT id, organizationId, department, role, joinDate, name, team FROM employees');
    if (employees.length === 0) {
      console.log('No employees found to seed data for.');
      return;
    }
    console.log(`Found ${employees.length} employees.`);

    await execute('DELETE FROM tasks');
    await execute('DELETE FROM leaverequests');
    await execute('DELETE FROM attendancerecords');
    await execute('DELETE FROM performancerecords');
    await execute('DELETE FROM skills');
    await execute('DELETE FROM workflow_instances');

    const now = new Date();
    const sixMonthsAgo = new Date(now);
    sixMonthsAgo.setMonth(now.getMonth() - 6);
    
    console.log('Seeding tasks...');
    for (const emp of employees) {
      const numTasks = randomInt(5, 15);
      for (let i = 0; i < numTasks; i++) {
        const status = randomChoice(['TODO', 'IN_PROGRESS', 'DONE', 'DONE', 'DONE', 'BLOCKED']);
        const createdAt = randomDate(sixMonthsAgo, now);
        let completedAt = null;
        if (status === 'DONE') {
          completedAt = new Date(createdAt.getTime() + randomInt(1, 5) * 86400000);
        }
        await execute(
          'INSERT INTO tasks (id, title, assigneeId, assigneeName, department, team, organizationId, priority, status, points, updatedAt, companyId, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [crypto.randomUUID(), `Task ${i+1}`, emp.id, emp.name, emp.department, emp.team || 'Unassigned', emp.organizationId, 'MEDIUM', status, 5, createdAt.toISOString(), emp.organizationId, createdAt.toISOString()]
        );
      }
    }

    console.log('Seeding leave requests...');
    for (const emp of employees) {
      const numLeaves = randomInt(0, 3);
      for (let i = 0; i < numLeaves; i++) {
        const status = randomChoice(['APPROVED', 'APPROVED', 'APPROVED', 'PENDING', 'REJECTED']);
        const type = randomChoice(['SICK', 'VACATION', 'PERSONAL']);
        const startDate = randomDate(sixMonthsAgo, now);
        const endDate = new Date(startDate.getTime() + randomInt(1, 4) * 86400000);
        await execute(
          'INSERT INTO leaverequests (id, employeeId, employeeName, department, team, organizationId, companyId, type, startDate, endDate, reason, status, reviewedBy, reviewComment, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [crypto.randomUUID(), emp.id, emp.name, emp.department, emp.team || 'Unassigned', emp.organizationId, emp.organizationId, type, startDate.toISOString(), endDate.toISOString(), 'Seeded', status, null, null, startDate.toISOString(), startDate.toISOString()]
        );
      }
    }

    console.log('Seeding attendance...');
    for (const emp of employees) {
      for (let d = 14; d >= 0; d--) {
        const date = new Date(now);
        date.setDate(date.getDate() - d);
        if (date.getDay() === 0 || date.getDay() === 6) continue;
        
        const status = Math.random() > 0.1 ? 'PRESENT' : 'ABSENT';
        const workMode = randomChoice(['REMOTE', 'OFFICE', 'HYBRID']);
        
        let checkIn = null;
        let checkOut = null;
        if (status === 'PRESENT') {
          checkIn = new Date(date);
          checkIn.setHours(9, randomInt(0, 30), 0);
          checkOut = new Date(date);
          checkOut.setHours(17, randomInt(0, 59), 0);
        }

        await execute(
          'INSERT INTO attendancerecords (id, employeeId, employeeName, department, date, checkInTime, checkOutTime, breaks, shiftType, workMode, status, latitude, longitude, accuracy, idempotencyKey, team, organizationId, companyId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [crypto.randomUUID(), emp.id, emp.name, emp.department, date.toISOString().split('T')[0], checkIn?.toISOString() || null, checkOut?.toISOString() || null, '[]', 'REGULAR', workMode, status, null, null, null, null, emp.team || 'Unassigned', emp.organizationId, emp.organizationId, date.toISOString(), date.toISOString()]
        );
      }
    }

    console.log('Seeding performance and skills...');
    const skillsList = ['React', 'Node.js', 'Python', 'Management', 'Communication', 'AWS', 'Design'];
    for (const emp of employees) {
      const kpi = randomInt(70, 99);
      const target = randomInt(80, 100);
      const prod = randomInt(75, 95);
      await execute(
        'INSERT INTO performancerecords (id, employeeId, quarter, kpiScore, targetScore, productivityScore, department, team, organizationId, companyId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [crypto.randomUUID(), emp.id, 'Q3 2026', kpi, target, prod, emp.department, emp.team || 'Unassigned', emp.organizationId, emp.organizationId, now.toISOString(), now.toISOString()]
      );

      const empSkills = Array.from({ length: 3 }, () => randomChoice(skillsList));
      const uniqueSkills = [...new Set(empSkills)];
      for (const skill of uniqueSkills) {
        await execute(
          'INSERT INTO skills (id, employeeId, skillName, level, isTopSkill, isMissingSkill, department, team, organizationId, companyId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [crypto.randomUUID(), emp.id, skill, randomInt(1, 5), 0, 0, emp.department, emp.team || 'Unassigned', emp.organizationId, emp.organizationId, now.toISOString(), now.toISOString()]
        );
      }
    }

    console.log('Seeding HR workflows...');
    for (let i = 0; i < 50; i++) {
      const type = randomChoice(['ONBOARDING', 'OFFBOARDING', 'PAYROLL_ISSUE', 'COMPLIANCE', 'BENEFITS']);
      const status = randomChoice(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'RESOLVED']);
      await execute(
        'INSERT INTO workflow_instances (id, organizationId, type, status, createdAt) VALUES (?, ?, ?, ?, ?)',
        [crypto.randomUUID(), 'org-stackly', type, status, randomDate(sixMonthsAgo, now).toISOString()]
      );
    }

    console.log('Successfully seeded all dashboard data!');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
}

seedData();

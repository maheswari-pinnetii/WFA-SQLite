import { connectDatabase, query, execute, transaction } from '../src/database/sqlite-cloud.js';
import { v4 as uuidv4 } from 'uuid';

const DEPARTMENTS = ['Engineering', 'Human Resources', 'Sales', 'Marketing', 'Finance', 'Operations', 'Product Management', 'Customer Support'];
const ROLES = ['EMPLOYEE', 'MANAGER', 'TEAM_LEAD', 'HR', 'ADMIN'];
const STATUSES = ['ACTIVE', 'ON_LEAVE', 'PROBATION', 'TERMINATED', 'NOTICE_PERIOD'];

function randomChoice(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function seed() {
  await connectDatabase();
  console.log('Connected to database. Starting seed...');

  const orgId = 'org-stackly';
  const companyId = 'org-stackly';
  
  await transaction(async () => {
    for (let i = 1; i <= 100; i++) {
      const employeeId = uuidv4();
      const joinDate = randomDate(new Date(2023, 0, 1), new Date()).toISOString();
      const department = randomChoice(DEPARTMENTS);
      let role = 'EMPLOYEE';
      if (Math.random() > 0.8) role = 'MANAGER';
      else if (Math.random() > 0.85) role = 'TEAM_LEAD';
      else if (Math.random() > 0.9) role = 'HR';
      
      let status = 'ACTIVE';
      if (Math.random() > 0.85) status = randomChoice(STATUSES);

      await execute(`
        INSERT INTO employees (
          id, employeeCode, name, email, role, department, designation, 
          status, joinDate, performanceScore, attendanceRate, 
          organizationId, companyId, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        employeeId,
        `EMP-${1000 + i}`,
        `Employee ${i}`,
        `employee${i}@stackly.com`,
        role,
        department,
        `${department} Specialist`,
        status,
        joinDate,
        Math.floor(Math.random() * 20) + 80, // 80-100
        Math.floor(Math.random() * 15) + 85, // 85-100
        orgId,
        companyId,
        new Date().toISOString(),
        new Date().toISOString()
      ]);

      // Insert some attendance records for the last 7 days
      for (let d = 0; d < 7; d++) {
        const date = new Date();
        date.setDate(date.getDate() - d);
        if (date.getDay() !== 0 && date.getDay() !== 6) { // skip weekends
          await execute(`
            INSERT INTO attendancerecords (
              id, employeeId, date, status, checkInTime, checkOutTime, workMode, organizationId, createdAt, updatedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            uuidv4(),
            employeeId,
            date.toISOString().split('T')[0],
            'PRESENT',
            new Date(date.setHours(9, Math.floor(Math.random() * 30), 0)).toISOString(),
            new Date(date.setHours(17 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0)).toISOString(),
            Math.random() > 0.5 ? 'Office' : 'Remote',
            orgId,
            new Date().toISOString(),
            new Date().toISOString()
          ]);
        }
      }

      // Insert some tasks
      for (let t = 0; t < 3; t++) {
        await execute(`
          INSERT INTO tasks (
            id, title, status, assigneeId, organizationId, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          uuidv4(),
          `Task ${t + 1} for ${employeeId}`,
          randomChoice(['TODO', 'IN_PROGRESS', 'DONE', 'BLOCKED']),
          employeeId,
          orgId,
          new Date().toISOString(),
          new Date().toISOString()
        ]);
      }

      // Insert some leave requests
      if (Math.random() > 0.7) {
        await execute(`
          INSERT INTO leaverequests (
            id, employeeId, startDate, endDate, status, type, organizationId, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          uuidv4(),
          employeeId,
          new Date().toISOString(),
          new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(),
          randomChoice(['PENDING', 'APPROVED', 'REJECTED']),
          'Annual Leave',
          orgId,
          new Date().toISOString(),
          new Date().toISOString()
        ]);
      }
    }
  });

  console.log('Seeding completed.');
}

seed().catch(console.error);

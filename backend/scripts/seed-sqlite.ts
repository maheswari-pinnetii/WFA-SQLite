import 'dotenv/config';
import { getDb, ORGANIZATION_ID } from '../src/config/db.js';
import { connectDatabase } from '../src/database/sqlite-cloud.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const seedSqlite = async () => {
  await connectDatabase();
  const db = getDb();
  console.log('[SQLite Seeder] Checking database schema & seeding additive historical data...');
  
  // Ensure schema table definitions exist
  const schemaPath = path.resolve(__dirname, '../database/schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schema = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schema);
  }

  // Ensure columns on existing tables exist
  try { db.exec('ALTER TABLE locations ADD COLUMN latitude REAL;'); } catch (e) {}
  try { db.exec('ALTER TABLE locations ADD COLUMN longitude REAL;'); } catch (e) {}
  try { db.exec('ALTER TABLE locations ADD COLUMN geofenceRadius INTEGER DEFAULT 100;'); } catch (e) {}
  try { db.exec("ALTER TABLE users ADD COLUMN authProvider TEXT DEFAULT 'local';"); } catch (e) {}
  try { db.exec("ALTER TABLE users ADD COLUMN providerSubject TEXT;"); } catch (e) {}
  try { db.exec("ALTER TABLE mfachallenges ADD COLUMN type TEXT DEFAULT 'totp-mfa';"); } catch (e) {}
  try { db.exec("ALTER TABLE failed_logins ADD COLUMN lockedAt TEXT;"); } catch (e) {}
  try { db.exec("ALTER TABLE failed_logins ADD COLUMN lockReason TEXT;"); } catch (e) {}
  try { db.exec("ALTER TABLE employees ADD COLUMN jobFamilyId TEXT;"); } catch (e) {}
  try { db.exec("ALTER TABLE employees ADD COLUMN jobRoleId TEXT;"); } catch (e) {}
  try { db.exec("ALTER TABLE audit_logs ADD COLUMN employeeId TEXT;"); } catch (e) {}
  try { db.exec("ALTER TABLE audit_logs ADD COLUMN timestamp TEXT;"); } catch (e) {}

  console.log('[SQLite Seeder] Starting database seeding transaction...');

  // Start Transaction
  const transaction = db.transaction(() => {
    const nowStr = new Date().toISOString();

    // 1. Seed organization
    const orgCount = db.prepare('SELECT COUNT(*) as count FROM companies').get().count;
    if (orgCount === 0) {
      db.prepare(`
        INSERT INTO companies (id, name, domain, status, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(ORGANIZATION_ID, 'Stackly Enterprise HQ', 'thestackly.com', 'ACTIVE', nowStr, nowStr);
      console.log('Seeded Organization.');
    }

    // Seed Projects for Timesheets
    const projectCount = db.prepare('SELECT COUNT(*) as count FROM projects').get().count;
    if (projectCount === 0) {
      const insertProject = db.prepare(`
        INSERT INTO projects (id, name, description, client, status, organizationId, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const projectsToSeed = [
        ['prj-internal', 'Internal Ops', 'General internal meetings and operations', 'Stackly', 'ACTIVE'],
        ['prj-website', 'Website Redesign', 'Corporate website overhaul', 'Marketing', 'ACTIVE'],
        ['prj-mobile', 'Mobile App V2', 'React Native cross-platform app', 'Tech', 'ACTIVE'],
        ['prj-client-a', 'Acme Corp Integration', 'API integration for Acme Corp', 'Acme Corp', 'ACTIVE'],
        ['prj-holiday', 'Holiday Tracking', 'Company holiday / time-off tracking (internal)', 'HR', 'ACTIVE']
      ];
      
      for (const [id, name, desc, client, status] of projectsToSeed) {
        insertProject.run(id, name, desc, client, status, ORGANIZATION_ID, nowStr, nowStr);
      }
      console.log('Seeded Projects.');
    }

    // 2. Seed departments
    const existingDepts = db.prepare('SELECT name FROM departments').all().map((d: any) => d.name);
    const insertDept = db.prepare(`
      INSERT OR IGNORE INTO departments (id, name, code, managerId, organizationId, companyId, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const deptsToSeed = [
      ['dept-eng', 'Engineering', 'ENG', 'usr-mgr-01'],
      ['dept-prod', 'Product Management', 'PROD', null],
      ['dept-sales', 'Sales & Marketing', 'SALES', null],
      ['dept-hr', 'Human Resources', 'HR', 'usr-hr-01'],
      ['dept-cs', 'Customer Success', 'CS', null],
      ['dept-fin', 'Finance & Operations', 'FIN', null],
      ['dept-data', 'Data & Analytics', 'DATA', null],
      ['dept-qa', 'Quality Assurance', 'QA', null],
      ['dept-devops', 'DevOps & Infrastructure', 'DEVOPS', null],
      ['dept-sec', 'Cybersecurity & IT', 'SEC', null]
    ];
    for (const [id, name, code, managerId] of deptsToSeed) {
      insertDept.run(id, name, code, managerId, ORGANIZATION_ID, ORGANIZATION_ID, nowStr, nowStr);
    }

    // 3. Seed teams
    const insertTeam = db.prepare(`
      INSERT OR IGNORE INTO teams (id, name, departmentId, leadId, organizationId, companyId, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const teamsToSeed = [
      ['team-frontend', 'Frontend Team', 'dept-eng', 'usr-lead-01'],
      ['team-platform', 'Core Platform', 'dept-eng', null],
      ['team-python', 'Python Services Team', 'dept-eng', null],
      ['team-web', 'Web Applications Team', 'dept-eng', null],
      ['team-data-eng', 'Data Engineering', 'dept-data', null],
      ['team-analytics', 'Business Intelligence', 'dept-data', null],
      ['team-sap-hcm', 'SAP HCM & SuccessFactors', 'dept-eng', null],
      ['team-sap-abap', 'SAP ABAP Development', 'dept-eng', null],
      ['team-qa-auto', 'Test Automation Team', 'dept-qa', null],
      ['team-cloud-ops', 'Cloud Operations', 'dept-devops', null],
      ['team-recruit', 'Talent Acquisition', 'dept-hr', null]
    ];
    for (const [id, name, deptId, leadId] of teamsToSeed) {
      insertTeam.run(id, name, deptId, leadId, ORGANIZATION_ID, ORGANIZATION_ID, nowStr, nowStr);
    }

    // 4. Seed shifts
    const insertShift = db.prepare(`
      INSERT OR IGNORE INTO shifts (id, name, startTime, endTime, gracePeriodMinutes, organizationId, companyId, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const shiftsToSeed = [
      ['shift-regular', 'Regular', '09:00', '18:00', 15],
      ['shift-flexible', 'Flexible', '00:00', '23:59', 0],
      ['shift-overnight', 'Overnight', '21:00', '06:00', 15]
    ];
    for (const [id, name, start, end, grace] of shiftsToSeed) {
      insertShift.run(id, name, start, end, grace, ORGANIZATION_ID, ORGANIZATION_ID, nowStr, nowStr);
    }

    // 4.5. Seed locations
    const insertLoc = db.prepare(`
      INSERT OR IGNORE INTO locations (id, name, address, city, country, latitude, longitude, geofenceRadius, organizationId, companyId, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const locsToSeed = [
      ['loc-blr', 'Bengaluru', 'Bengaluru Office', 'Bengaluru', 'India', 12.9716, 77.5946, 100],
      ['loc-hyd', 'Hyderabad', 'Hyderabad Office', 'Hyderabad', 'India', 17.3850, 78.4867, 150],
      ['loc-chennai', 'Chennai', 'Chennai Tech Park', 'Chennai', 'India', 13.0827, 80.2707, 100],
      ['loc-vizag', 'Visakhapatnam', 'Vizag FinTech Valley', 'Visakhapatnam', 'India', 17.6868, 83.2185, 100],
      ['loc-kochi', 'Kochi', 'Kochi Infopark', 'Kochi', 'India', 9.9312, 76.2673, 100],
      ['loc-salem', 'Salem', 'Salem Office', 'Salem', 'India', 11.6643, 78.1460, 100]
    ];
    for (const [id, name, addr, city, country, lat, lng, radius] of locsToSeed) {
      insertLoc.run(id, name, addr, city, country, lat, lng, radius, ORGANIZATION_ID, ORGANIZATION_ID, nowStr, nowStr);
    }

    // 4.8 Seed Job Families & Job Roles Architecture
    const insertJobFamily = db.prepare(`
      INSERT OR IGNORE INTO job_families (id, name, code, description, organizationId, companyId, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const insertJobRole = db.prepare(`
      INSERT OR IGNORE INTO job_roles (id, jobFamilyId, name, code, level, description, organizationId, companyId, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const jobFamilies = [
      ['jf-se', 'Software Engineering', 'SE', 'Software development and engineering roles'],
      ['jf-web', 'Web Development', 'WEB', 'Web frontend, backend, and fullstack roles'],
      ['jf-py', 'Python Development', 'PYTHON', 'Python development, backend, automation, and API roles'],
      ['jf-data', 'Data & Analytics', 'DATA', 'Data analysis, data engineering, data science, and BI roles'],
      ['jf-sap', 'SAP / Enterprise Applications', 'SAP', 'SAP ERP, HCM, SuccessFactors, ABAP, FICO, and SAP architecture'],
      ['jf-qa', 'QA & Testing', 'QA', 'Quality assurance, automation, performance testing, and SDET'],
      ['jf-devops', 'DevOps & Cloud', 'DEVOPS', 'DevOps, cloud infrastructure, SRE, and platform engineering'],
      ['jf-sec', 'Security & IT', 'SEC', 'Cybersecurity, IAM, system administration, and IT operations'],
      ['jf-prod', 'Product & Business', 'PROD', 'Product management, business analysis, and project management'],
      ['jf-hr', 'Human Resources', 'HR', 'HR operations, talent acquisition, people analytics, and HRBP'],
      ['jf-fin', 'Finance & Operations', 'FIN', 'Finance, accounting, payroll, and financial analysis'],
      ['jf-sales', 'Sales & BD', 'SALES', 'Business development, account management, and sales execution'],
      ['jf-mkt', 'Marketing', 'MKT', 'Digital marketing, content, product marketing, and SEO'],
      ['jf-design', 'UI/UX Design', 'DESIGN', 'Product design, UI design, UX research, and visual design']
    ];

    for (const [id, name, code, desc] of jobFamilies) {
      insertJobFamily.run(id, name, code, desc, ORGANIZATION_ID, ORGANIZATION_ID, nowStr, nowStr);
    }

    const jobRoles = [
      // Software Engineering
      ['jr-se-dev', 'jf-se', 'Software Developer', 'SE-DEV', 'L4'],
      ['jr-se-eng', 'jf-se', 'Software Engineer', 'SE-ENG', 'L5'],
      ['jr-se-sr', 'jf-se', 'Senior Software Engineer', 'SE-SR', 'L6'],
      ['jr-se-lead', 'jf-se', 'Lead Software Engineer', 'SE-LEAD', 'L7'],

      // Python Developer Roles (Explicitly Required)
      ['jr-py-jr', 'jf-py', 'Junior Python Developer', 'PY-JR', 'L3'],
      ['jr-py-dev', 'jf-py', 'Python Developer', 'PY-DEV', 'L5'],
      ['jr-py-sr', 'jf-py', 'Senior Python Developer', 'PY-SR', 'L6'],
      ['jr-py-lead', 'jf-py', 'Lead Python Developer', 'PY-LEAD', 'L7'],
      ['jr-py-techlead', 'jf-py', 'Python Technical Lead', 'PY-TLEAD', 'L8'],
      ['jr-py-backend', 'jf-py', 'Python Backend Developer', 'PY-BACKEND', 'L5'],
      ['jr-py-api', 'jf-py', 'Python API Developer', 'PY-API', 'L5'],
      ['jr-py-auto', 'jf-py', 'Python Automation Developer', 'PY-AUTO', 'L5'],

      // Web Developer Roles (Explicitly Required)
      ['jr-web-jr', 'jf-web', 'Junior Web Developer', 'WEB-JR', 'L3'],
      ['jr-web-dev', 'jf-web', 'Web Developer', 'WEB-DEV', 'L5'],
      ['jr-web-sr', 'jf-web', 'Senior Web Developer', 'WEB-SR', 'L6'],
      ['jr-web-lead', 'jf-web', 'Lead Web Developer', 'WEB-LEAD', 'L7'],
      ['jr-web-fe', 'jf-web', 'Frontend Web Developer', 'WEB-FE', 'L5'],
      ['jr-web-be', 'jf-web', 'Backend Web Developer', 'WEB-BE', 'L5'],
      ['jr-web-fs', 'jf-web', 'Full Stack Web Developer', 'WEB-FS', 'L5'],

      // Data & Analytics Roles (Explicitly Required)
      ['jr-data-da', 'jf-data', 'Data Analyst', 'DATA-DA', 'L5'],
      ['jr-data-srda', 'jf-data', 'Senior Data Analyst', 'DATA-SRDA', 'L6'],
      ['jr-data-leadda', 'jf-data', 'Lead Data Analyst', 'DATA-LEADDA', 'L7'],
      ['jr-data-bi', 'jf-data', 'BI Analyst', 'DATA-BI', 'L5'],
      ['jr-data-bidev', 'jf-data', 'BI Developer', 'DATA-BIDEV', 'L5'],
      ['jr-data-de', 'jf-data', 'Data Engineer', 'DATA-DE', 'L5'],
      ['jr-data-srde', 'jf-data', 'Senior Data Engineer', 'DATA-SRDE', 'L6'],
      ['jr-data-ds', 'jf-data', 'Data Scientist', 'DATA-DS', 'L6'],
      ['jr-data-pa', 'jf-data', 'People Analytics Analyst', 'DATA-PA', 'L5'],
      ['jr-data-wa', 'jf-data', 'Workforce Analytics Analyst', 'DATA-WA', 'L5'],

      // SAP Enterprise Roles (Explicitly Required)
      ['jr-sap-cons', 'jf-sap', 'SAP Consultant', 'SAP-CONS', 'L5'],
      ['jr-sap-func', 'jf-sap', 'SAP Functional Consultant', 'SAP-FUNC', 'L5'],
      ['jr-sap-tech', 'jf-sap', 'SAP Technical Consultant', 'SAP-TECH', 'L5'],
      ['jr-sap-abap', 'jf-sap', 'SAP ABAP Developer', 'SAP-ABAP', 'L5'],
      ['jr-sap-hcm', 'jf-sap', 'SAP HCM Consultant', 'SAP-HCM', 'L5'],
      ['jr-sap-sfact', 'jf-sap', 'SAP SuccessFactors Consultant', 'SAP-SFACT', 'L5'],
      ['jr-sap-fico', 'jf-sap', 'SAP FICO Consultant', 'SAP-FICO', 'L5'],
      ['jr-sap-mm', 'jf-sap', 'SAP MM Consultant', 'SAP-MM', 'L5'],
      ['jr-sap-sd', 'jf-sap', 'SAP SD Consultant', 'SAP-SD', 'L5'],
      ['jr-sap-arch', 'jf-sap', 'SAP Solution Architect', 'SAP-ARCH', 'L8'],

      // QA, DevOps, IT & Management
      ['jr-qa-eng', 'jf-qa', 'QA Engineer', 'QA-ENG', 'L5'],
      ['jr-qa-auto', 'jf-qa', 'QA Automation Engineer', 'QA-AUTO', 'L5'],
      ['jr-qa-lead', 'jf-qa', 'Test Lead', 'QA-LEAD', 'L7'],
      ['jr-devops-eng', 'jf-devops', 'DevOps Engineer', 'DEVOPS-ENG', 'L5'],
      ['jr-devops-sr', 'jf-devops', 'Senior DevOps Engineer', 'DEVOPS-SR', 'L6'],
      ['jr-devops-cloud', 'jf-devops', 'Cloud Architect', 'DEVOPS-CLOUD', 'L8'],
      ['jr-sec-eng', 'jf-sec', 'Security Engineer', 'SEC-ENG', 'L5'],
      ['jr-sec-sys', 'jf-sec', 'System Administrator', 'SEC-SYS', 'L4'],
      ['jr-prod-pm', 'jf-prod', 'Product Manager', 'PROD-PM', 'L6'],
      ['jr-prod-ba', 'jf-prod', 'Business Analyst', 'PROD-BA', 'L5'],
      ['jr-hr-general', 'jf-hr', 'HR Generalist', 'HR-GEN', 'L4'],
      ['jr-hr-mgr', 'jf-hr', 'HR Manager', 'HR-MGR', 'L10'],
      ['jr-fin-analyst', 'jf-fin', 'Financial Analyst', 'FIN-ANALYST', 'L5'],
      ['jr-sales-exec', 'jf-sales', 'Account Executive', 'SALES-EXEC', 'L5'],
      ['jr-mkt-spec', 'jf-mkt', 'Digital Marketing Specialist', 'MKT-SPEC', 'L4'],
      ['jr-design-ui', 'jf-design', 'UI/UX Designer', 'DESIGN-UI', 'L5']
    ];

    for (const [id, familyId, name, code, level] of jobRoles) {
      insertJobRole.run(id, familyId, name, code, level, `${name} role`, ORGANIZATION_ID, ORGANIZATION_ID, nowStr, nowStr);
    }

    // 5. Seed Core Admin / HR / Manager users if missing
    const passHash = '$2b$10$RurO1wlDA8rF7QLnqIKkM.PJmHnGiRcduYPxbrULJpiX/JB7UixMG'; // StacklyWFA2026!
    const insertUser = db.prepare(`
      INSERT OR IGNORE INTO users (id, name, email, password_hash, role, department, team, location, title, clearanceLevel, status, permissions, mfa_enabled, organizationId, companyId, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const coreUsers = [
      ['usr-admin-01', 'Sarah Connor', 'admin@thestackly.com', passHash, 'ADMIN', null, null, null, null, 5, 'ACTIVE', JSON.stringify(['USER_CREATE', 'USER_UPDATE', 'USER_DELETE', 'USER_MANAGE', 'ROLE_CREATE', 'ROLE_UPDATE', 'ROLE_DELETE', 'ROLE_MANAGE', 'PERMISSION_ASSIGN', 'EMPLOYEE_VIEW_ALL', 'EMPLOYEE_CREATE', 'EMPLOYEE_UPDATE', 'EMPLOYEE_DELETE', 'REPORT_VIEW_ALL', 'REPORT_EXPORT', 'SYSTEM_SETTINGS_MANAGE', 'SYSTEM_CONFIG', 'AUDIT_LOG_VIEW', 'VIEW_ALL_DATA']), 1, ORGANIZATION_ID, ORGANIZATION_ID, nowStr, nowStr],
      ['usr-hr-01', 'Elena Rostova', 'hr@thestackly.com', passHash, 'HR', null, null, null, null, 4, 'ACTIVE', JSON.stringify(['EMPLOYEE_VIEW', 'EMPLOYEE_CREATE', 'EMPLOYEE_UPDATE', 'EMPLOYEE_PROFILE_MANAGE', 'ATTENDANCE_VIEW_ALL', 'ATTENDANCE_MANAGE', 'LEAVE_APPROVE', 'PERFORMANCE_MANAGE', 'RECRUITMENT_MANAGE', 'REPORT_GENERATE', 'EMPLOYEE_MANAGE', 'REPORT_VIEW', 'TEAM_ANALYTICS_VIEW']), 1, ORGANIZATION_ID, ORGANIZATION_ID, nowStr, nowStr],
      ['usr-mgr-01', 'David Sterling', 'manager@thestackly.com', passHash, 'MANAGER', 'Engineering', null, null, null, 3, 'ACTIVE', JSON.stringify(['TEAM_VIEW', 'TEAM_ANALYTICS_VIEW', 'EMPLOYEE_VIEW_TEAM', 'ATTENDANCE_VIEW_TEAM', 'LEAVE_APPROVE', 'PERFORMANCE_REVIEW', 'TASK_ASSIGN', 'REPORT_VIEW_TEAM']), 1, ORGANIZATION_ID, ORGANIZATION_ID, nowStr, nowStr],
      ['usr-lead-01', 'Marcus Vance', 'lead@thestackly.com', passHash, 'TEAM_LEAD', 'Engineering', 'Frontend Team', null, null, 2, 'ACTIVE', JSON.stringify(['TEAM_MEMBER_VIEW', 'TEAM_VIEW', 'TASK_ASSIGN', 'TASK_TRACK', 'ATTENDANCE_VIEW_TEAM', 'PRODUCTIVITY_VIEW', 'FEEDBACK_CREATE', 'PERFORMANCE_FEEDBACK']), 1, ORGANIZATION_ID, ORGANIZATION_ID, nowStr, nowStr],
      ['usr-lead-02', 'Marcus Vance', 'teamlead@thestackly.com', passHash, 'TEAM_LEAD', 'Engineering', 'Frontend Team', null, null, 2, 'ACTIVE', JSON.stringify(['TEAM_MEMBER_VIEW', 'TEAM_VIEW', 'TASK_ASSIGN', 'TASK_TRACK', 'ATTENDANCE_VIEW_TEAM', 'PRODUCTIVITY_VIEW', 'FEEDBACK_CREATE', 'PERFORMANCE_FEEDBACK']), 1, ORGANIZATION_ID, ORGANIZATION_ID, nowStr, nowStr]
    ];
    for (const u of coreUsers) {
      insertUser.run(...u);
    }

    // 6. Check existing employees
    const currentEmpCount = db.prepare('SELECT COUNT(*) as count FROM employees').get().count;
    console.log(`[SQLite Seeder] Existing employee count: ${currentEmpCount}`);

    const insertEmp = db.prepare(`
      INSERT OR IGNORE INTO employees (id, employeeCode, name, email, role, department, designation, status, avatar, joinDate, performanceScore, attendanceRate, team, location, organizationId, companyId, jobFamilyId, jobRoleId, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const firstNames = [
      'Aarav', 'Vihaan', 'Vivaan', 'Ananya', 'Diya', 'Advik', 'Siddharth', 'Ishaan', 'Aanya', 'Aditi',
      'Kabir', 'Rohan', 'Arjun', 'Rahul', 'Pranav', 'Aditya', 'Sai', 'Krishna', 'Karan', 'Sanjay',
      'Vikram', 'Ramesh', 'Suresh', 'Anil', 'Sunil', 'Vijay', 'Rajesh', 'Harish', 'Manish', 'Amit',
      'Pooja', 'Neha', 'Priya', 'Sneha', 'Anjali', 'Riya', 'Divya', 'Deepika', 'Kiran', 'Jyoti',
      'Akash', 'Abhishek', 'Aman', 'Aniket', 'Ayush', 'Gaurav', 'Nitin', 'Pankaj', 'Sachin', 'Sandeep',
      'Shalini', 'Swati', 'Meera', 'Shruti', 'Preeti', 'Kavita', 'Geeta', 'Lata', 'Sunita', 'Anita',
      'Bhavya', 'Charan', 'Dinesh', 'Eshwar', 'Ganesh', 'Gautam', 'Hari', 'Hemant', 'Jaya', 'Karthik',
      'Lokesh', 'Madhav', 'Naveen', 'Omkar', 'Pavan', 'Rithvik', 'Samarth', 'Tarun', 'Utkarsh', 'Yash'
    ];
    const lastNames = [
      'Sharma', 'Verma', 'Kumar', 'Singh', 'Patel', 'Reddy', 'Rao', 'Nair', 'Pillai', 'Joshi',
      'Iyer', 'Iyengar', 'Gupta', 'Sen', 'Dutta', 'Das', 'Banerjee', 'Chatterjee', 'Mukherjee', 'Bose',
      'Mehta', 'Shah', 'Trivedi', 'Pandey', 'Mishra', 'Choudhury', 'Prasad', 'Sinha', 'Kapoor', 'Khanna',
      'Malhotra', 'Bahl', 'Gill', 'Sandhu', 'Nayar', 'Menon', 'Shetty', 'Gowda', 'Naidu', 'Deshmukh'
    ];

    // Seed initial 500 if database is empty
    if (currentEmpCount === 0) {
      console.log('[SQLite Seeder] Seeding initial 500 employees...');
      const departments = ['Engineering', 'Product Management', 'Sales & Marketing', 'Human Resources', 'Customer Success', 'Finance & Operations'];
      const teamsList = ['Frontend Team', 'Product Strategy', 'Growth Team', 'People Operations', 'Customer Success', 'Finance Operations'];
      const designations = ['Senior Software Engineer', 'Product Manager', 'Account Executive', 'HR Operations Manager', 'Customer Success Director', 'Financial Analyst'];
      const statuses = ['ACTIVE', 'REMOTE', 'ON_LEAVE', 'ACTIVE'];

      for (let i = 1; i <= 500; i++) {
        const id = i === 250 ? 'usr-emp-01' : `emp-${i}`;
        const paddedNum = String(i).padStart(3, '0');
        const code = `EMP-${paddedNum}`;
        const joiningYear = 2020 + (i % 7);

        const firstName = firstNames[(i - 1) % firstNames.length];
        const lastName = lastNames[Math.floor((i - 1) / firstNames.length) % lastNames.length];

        const name = i === 250 ? 'Alex Mercer' : `${firstName} ${lastName}`;
        const email = i === 250 ? 'employee@thestackly.com' : `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${paddedNum}@thestackly.com`;
        const role = 'EMPLOYEE';
        const deptIdx = i % departments.length;
        const dept = i === 250 ? 'Engineering' : departments[deptIdx];
        const design = i === 250 ? 'Full Stack Developer' : designations[deptIdx];
        const status = statuses[i % statuses.length];
        const team = i === 250 ? 'Frontend Team' : teamsList[deptIdx];
        let location = 'Bengaluru';
        if (i > 250 && i <= 400) {
          location = 'Hyderabad';
        } else if (i > 400) {
          location = 'Salem';
        }

        const jobFamilyId = deptIdx === 0 ? 'jf-se' : deptIdx === 1 ? 'jf-prod' : deptIdx === 2 ? 'jf-sales' : deptIdx === 3 ? 'jf-hr' : deptIdx === 4 ? 'jf-prod' : 'jf-fin';
        const jobRoleId = deptIdx === 0 ? 'jr-se-sr' : deptIdx === 1 ? 'jr-prod-pm' : deptIdx === 2 ? 'jr-sales-exec' : deptIdx === 3 ? 'jr-hr-general' : deptIdx === 4 ? 'jr-prod-ba' : 'jr-fin-analyst';

        insertEmp.run(
          id, code, name, email, role, dept, design, status,
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
          `${joiningYear}-${String((i % 12) + 1).padStart(2, '0')}-15`,
          80 + (i % 20), 90 + (i % 10), team, location, ORGANIZATION_ID, ORGANIZATION_ID,
          jobFamilyId, jobRoleId, nowStr, nowStr
        );

        const perms = ['PROFILE_VIEW', 'PROFILE_UPDATE', 'ATTENDANCE_VIEW_SELF', 'LEAVE_REQUEST', 'PERFORMANCE_VIEW_SELF', 'GOAL_UPDATE', 'DOCUMENT_UPLOAD'];
        insertUser.run(
          id, name, email, passHash, role, dept, team, location, design,
          1, 'ACTIVE', JSON.stringify(perms), 1, ORGANIZATION_ID, ORGANIZATION_ID,
          nowStr, nowStr
        );
      }
    }

    // Now seed the additional 500 historical employees (Targeting 1,000 total)
    const empCountAfterBase = db.prepare('SELECT COUNT(*) as count FROM employees').get().count;
    if (empCountAfterBase < 1000) {
      const neededNew = 1000 - empCountAfterBase;
      console.log(`[SQLite Seeder] Inserting ${neededNew} historical employees (2015 - Sept 2026)...`);

      // Joining Date distribution for additional employees:
      // 2015: 35 | 2016: 40 | 2017: 45 | 2018: 50 | 2019: 55 | 2020: 50 | 2021: 55 | 2022: 50 | 2023: 45 | 2024: 35 | 2025: 25 | 2026: 15 = 500
      const yearDist = [
        ...Array(35).fill(2015),
        ...Array(40).fill(2016),
        ...Array(45).fill(2017),
        ...Array(50).fill(2018),
        ...Array(55).fill(2019),
        ...Array(50).fill(2020),
        ...Array(55).fill(2021),
        ...Array(50).fill(2022),
        ...Array(45).fill(2023),
        ...Array(35).fill(2024),
        ...Array(25).fill(2025),
        ...Array(15).fill(2026)
      ];

      // Location target distribution for full 1000:
      // Bengaluru: 400 | Hyderabad: 250 | Chennai: 150 | Visakhapatnam: 100 | Kochi: 50 | Salem: 50
      const newLocationsList: string[] = [
        ...Array(150).fill('Bengaluru'),
        ...Array(100).fill('Hyderabad'),
        ...Array(150).fill('Chennai'),
        ...Array(100).fill('Visakhapatnam'),
        ...Array(50).fill('Kochi'),
        ...Array(0).fill('Salem') // Existing 500 already had 100 in Salem
      ];

      // Specialization Role Configurations:
      // Includes required Python Developer, Web Developer, Data & Analytics, SAP, QA, DevOps, HR, Finance, Sales
      const roleSpecs = [
        // Python Developer Specs (~50 total)
        { dept: 'Engineering', team: 'Python Services Team', jobFamilyId: 'jf-py', jobRoleId: 'jr-py-sr', designation: 'Senior Python Developer' },
        { dept: 'Engineering', team: 'Python Services Team', jobFamilyId: 'jf-py', jobRoleId: 'jr-py-dev', designation: 'Python Developer' },
        { dept: 'Engineering', team: 'Python Services Team', jobFamilyId: 'jf-py', jobRoleId: 'jr-py-lead', designation: 'Lead Python Developer' },
        { dept: 'Engineering', team: 'Python Services Team', jobFamilyId: 'jf-py', jobRoleId: 'jr-py-backend', designation: 'Python Backend Developer' },
        { dept: 'Engineering', team: 'Python Services Team', jobFamilyId: 'jf-py', jobRoleId: 'jr-py-api', designation: 'Python API Developer' },

        // Web Developer Specs (~70 total)
        { dept: 'Engineering', team: 'Web Applications Team', jobFamilyId: 'jf-web', jobRoleId: 'jr-web-sr', designation: 'Senior Web Developer' },
        { dept: 'Engineering', team: 'Web Applications Team', jobFamilyId: 'jf-web', jobRoleId: 'jr-web-dev', designation: 'Web Developer' },
        { dept: 'Engineering', team: 'Web Applications Team', jobFamilyId: 'jf-web', jobRoleId: 'jr-web-fe', designation: 'Frontend Web Developer' },
        { dept: 'Engineering', team: 'Web Applications Team', jobFamilyId: 'jf-web', jobRoleId: 'jr-web-be', designation: 'Backend Web Developer' },
        { dept: 'Engineering', team: 'Web Applications Team', jobFamilyId: 'jf-web', jobRoleId: 'jr-web-fs', designation: 'Full Stack Web Developer' },

        // Data & Analytics Specs (~100 total)
        { dept: 'Data & Analytics', team: 'Business Intelligence', jobFamilyId: 'jf-data', jobRoleId: 'jr-data-da', designation: 'Data Analyst' },
        { dept: 'Data & Analytics', team: 'Business Intelligence', jobFamilyId: 'jf-data', jobRoleId: 'jr-data-srda', designation: 'Senior Data Analyst' },
        { dept: 'Data & Analytics', team: 'Data Engineering', jobFamilyId: 'jf-data', jobRoleId: 'jr-data-de', designation: 'Data Engineer' },
        { dept: 'Data & Analytics', team: 'Data Engineering', jobFamilyId: 'jf-data', jobRoleId: 'jr-data-srde', designation: 'Senior Data Engineer' },
        { dept: 'Data & Analytics', team: 'Business Intelligence', jobFamilyId: 'jf-data', jobRoleId: 'jr-data-ds', designation: 'Data Scientist' },
        { dept: 'Data & Analytics', team: 'Business Intelligence', jobFamilyId: 'jf-data', jobRoleId: 'jr-data-bi', designation: 'BI Analyst' },

        // SAP Enterprise Specs (~80 total)
        { dept: 'Engineering', team: 'SAP HCM & SuccessFactors', jobFamilyId: 'jf-sap', jobRoleId: 'jr-sap-cons', designation: 'SAP Consultant' },
        { dept: 'Engineering', team: 'SAP HCM & SuccessFactors', jobFamilyId: 'jf-sap', jobRoleId: 'jr-sap-hcm', designation: 'SAP HCM Consultant' },
        { dept: 'Engineering', team: 'SAP HCM & SuccessFactors', jobFamilyId: 'jf-sap', jobRoleId: 'jr-sap-sfact', designation: 'SAP SuccessFactors Consultant' },
        { dept: 'Engineering', team: 'SAP ABAP Development', jobFamilyId: 'jf-sap', jobRoleId: 'jr-sap-abap', designation: 'SAP ABAP Developer' },
        { dept: 'Engineering', team: 'SAP ABAP Development', jobFamilyId: 'jf-sap', jobRoleId: 'jr-sap-fico', designation: 'SAP FICO Consultant' },

        // QA, DevOps & Operations
        { dept: 'Quality Assurance', team: 'Test Automation Team', jobFamilyId: 'jf-qa', jobRoleId: 'jr-qa-auto', designation: 'QA Automation Engineer' },
        { dept: 'DevOps & Infrastructure', team: 'Cloud Operations', jobFamilyId: 'jf-devops', jobRoleId: 'jr-devops-sr', designation: 'Senior DevOps Engineer' },
        { dept: 'Human Resources', team: 'Talent Acquisition', jobFamilyId: 'jf-hr', jobRoleId: 'jr-hr-general', designation: 'HR Generalist' },
        { dept: 'Finance & Operations', team: 'Finance Operations', jobFamilyId: 'jf-fin', jobRoleId: 'jr-fin-analyst', designation: 'Financial Analyst' },
        { dept: 'Sales & Marketing', team: 'Growth Team', jobFamilyId: 'jf-sales', jobRoleId: 'jr-sales-exec', designation: 'Account Executive' }
      ];

      for (let idx = 0; idx < neededNew; idx++) {
        const empNumber = 501 + idx;
        const id = `emp-${empNumber}`;
        const year = yearDist[idx % yearDist.length];
        const yyStr = String(year).substring(2);
        const code = `STK-${yyStr}-${String(empNumber).padStart(4, '0')}`;

        const fName = firstNames[idx % firstNames.length];
        const lName = lastNames[Math.floor(idx / firstNames.length) % lastNames.length];
        const name = `${fName} ${lName}`;
        const email = `${fName.toLowerCase()}.${lName.toLowerCase()}.${empNumber}@thestackly.com`;
        
        const spec = roleSpecs[idx % roleSpecs.length];
        const loc = newLocationsList[idx % newLocationsList.length];

        // Realistic employment status: 82% ACTIVE, 8% REMOTE, 5% ON_LEAVE, 5% INACTIVE (exited historical)
        let status = 'ACTIVE';
        if (idx % 20 === 0) status = 'INACTIVE';
        else if (idx % 12 === 0) status = 'ON_LEAVE';
        else if (idx % 8 === 0) status = 'REMOTE';

        const monthNum = (idx % 12) + 1;
        const dayNum = (idx % 28) + 1;
        const joinDate = `${year}-${String(monthNum).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;

        insertEmp.run(
          id, code, name, email, 'EMPLOYEE', spec.dept, spec.designation, status,
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          joinDate, 82 + (idx % 16), 92 + (idx % 8), spec.team, loc,
          ORGANIZATION_ID, ORGANIZATION_ID, spec.jobFamilyId, spec.jobRoleId,
          nowStr, nowStr
        );

        const perms = ['PROFILE_VIEW', 'PROFILE_UPDATE', 'ATTENDANCE_VIEW_SELF', 'LEAVE_REQUEST', 'PERFORMANCE_VIEW_SELF', 'GOAL_UPDATE', 'DOCUMENT_UPLOAD'];
        insertUser.run(
          id, name, email, passHash, 'EMPLOYEE', spec.dept, spec.team, loc, spec.designation,
          1, status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE', JSON.stringify(perms), 1, ORGANIZATION_ID, ORGANIZATION_ID,
          nowStr, nowStr
        );
      }
      console.log(`[SQLite Seeder] Total employees in database after insert: 1,000.`);
    }

    // 7. Seed Skills matrix for all employees
    const skillCount = db.prepare('SELECT COUNT(*) as count FROM skills').get().count;
    if (skillCount === 0) {
      const allEmployees = db.prepare('SELECT * FROM employees').all();
      const insertSkill = db.prepare(`
        INSERT INTO skills (id, employeeId, skillName, level, isTopSkill, isMissingSkill, department, team, organizationId, companyId, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const skillMap: Record<string, string[]> = {
        'jf-py': ['Python', 'FastAPI', 'Django', 'SQL', 'Docker', 'REST APIs', 'Pytest'],
        'jf-web': ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'Responsive UI'],
        'jf-data': ['SQL', 'Python', 'Power BI', 'Tableau', 'Pandas', 'ETL', 'Data Visualization'],
        'jf-sap': ['SAP', 'SAP HCM', 'SAP ABAP', 'SAP FICO', 'Business Process', 'Integration'],
        'jf-qa': ['Testing', 'Playwright', 'Selenium', 'API Testing', 'Automation'],
        'jf-devops': ['Docker', 'Kubernetes', 'CI/CD', 'AWS', 'Linux'],
        'default': ['Communication', 'Problem Solving', 'SQL', 'Project Execution']
      };

      allEmployees.forEach((emp: any, index: number) => {
        const skillsList = skillMap[emp.jobFamilyId] || skillMap['default'];
        skillsList.slice(0, 4).forEach((skillName, skillIndex) => {
          const level = 2 + ((index + skillIndex) % 4);
          insertSkill.run(
            `skill-${emp.id}-${skillIndex}`,
            emp.id,
            skillName,
            level,
            level >= 4 ? 1 : 0,
            level <= 2 ? 1 : 0,
            emp.department,
            emp.team,
            ORGANIZATION_ID,
            ORGANIZATION_ID,
            nowStr,
            nowStr
          );
        });
      });
      console.log('Seeded skills matrix for all employees.');
    }

    // 8. Seed Performance records for all employees
    const perfCount = db.prepare('SELECT COUNT(*) as count FROM performancerecords').get().count;
    if (perfCount === 0) {
      const allEmployees = db.prepare('SELECT * FROM employees').all();
      const quarters = ['2025-Q3', '2025-Q4', '2026-Q1', '2026-Q2', '2026-Q3'];
      const insertPerf = db.prepare(`
        INSERT INTO performancerecords (id, employeeId, quarter, kpiScore, targetScore, productivityScore, department, team, organizationId, companyId, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      allEmployees.forEach((emp: any, index: number) => {
        quarters.forEach((q) => {
          const kpi = 72 + ((index + q.charCodeAt(6)) % 25);
          const target = 85;
          const productivity = 76 + ((index + q.charCodeAt(6) + 3) % 20);
          insertPerf.run(
            `perf-${emp.id}-${q}`,
            emp.id,
            q,
            kpi,
            target,
            productivity,
            emp.department,
            emp.team,
            ORGANIZATION_ID,
            ORGANIZATION_ID,
            nowStr,
            nowStr
          );
        });
      });
      console.log('Seeded performance records for all employees.');
    }

    // 9. Seed Salary Structures & Components for all employees
    const salCount = db.prepare('SELECT COUNT(*) as count FROM salary_structures').get().count;
    if (salCount === 0) {
      const allEmployees = db.prepare('SELECT * FROM employees').all();
      const insertStructure = db.prepare(`
        INSERT INTO salary_structures (id, employeeId, baseSalary, currency, effectiveDate, organizationId)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      const insertComponent = db.prepare(`
        INSERT INTO salary_components (id, salaryStructureId, componentName, type, amount)
        VALUES (?, ?, ?, ?, ?)
      `);

      allEmployees.forEach((emp: any, index: number) => {
        const structId = `sal-struct-${emp.id}`;
        const baseSalary = 45000 + ((index * 13) % 110) * 1000;

        insertStructure.run(structId, emp.id, baseSalary, 'INR', emp.joinDate || '2020-01-01', ORGANIZATION_ID);
        insertComponent.run(`comp-${structId}-1`, structId, 'Basic Pay', 'EARNING', baseSalary * 0.50);
        insertComponent.run(`comp-${structId}-2`, structId, 'House Rent Allowance', 'EARNING', baseSalary * 0.20);
        insertComponent.run(`comp-${structId}-3`, structId, 'Special Allowance', 'EARNING', baseSalary * 0.30);
        insertComponent.run(`comp-${structId}-4`, structId, 'Provident Fund', 'DEDUCTION', (baseSalary * 0.50) * 0.12);
        insertComponent.run(`comp-${structId}-5`, structId, 'Professional Tax', 'DEDUCTION', 200);
      });
      console.log('Seeded salary structures and components.');
    }

    // 10. Seed Leave Balances for all employees
    const leaveBalCount = db.prepare('SELECT COUNT(*) as count FROM leave_balances').get().count;
    if (leaveBalCount === 0) {
      const allEmployees = db.prepare('SELECT * FROM employees').all();
      const insertLeaveType = db.prepare(`
        INSERT OR IGNORE INTO leave_types (id, organizationId, name, description, defaultDays, isPaid)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      const insertLeaveBalance = db.prepare(`
        INSERT INTO leave_balances (id, employeeId, leaveTypeId, year, allocated, used, organizationId)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      insertLeaveType.run('lt-casual', ORGANIZATION_ID, 'Casual Leave', 'For personal matters', 12, 1);
      insertLeaveType.run('lt-sick', ORGANIZATION_ID, 'Sick Leave', 'For medical emergencies', 12, 1);
      insertLeaveType.run('lt-earned', ORGANIZATION_ID, 'Earned Leave', 'Privilege leaves', 15, 1);
      insertLeaveType.run('lt-unpaid', ORGANIZATION_ID, 'Loss of Pay', 'Unpaid leave', 0, 0);

      const currentYear = new Date().getFullYear();
      allEmployees.forEach((emp: any) => {
        insertLeaveBalance.run(`lb-casual-${emp.id}`, emp.id, 'lt-casual', currentYear, 12, (emp.id.charCodeAt(0) % 10), ORGANIZATION_ID);
        insertLeaveBalance.run(`lb-sick-${emp.id}`, emp.id, 'lt-sick', currentYear, 12, (emp.id.charCodeAt(1) % 5), ORGANIZATION_ID);
        insertLeaveBalance.run(`lb-earned-${emp.id}`, emp.id, 'lt-earned', currentYear, 15, 2, ORGANIZATION_ID);
      });
      console.log('Seeded leave balances.');
    }

    // 11. Seed Attendance History for past 60 days
    const attCount = db.prepare('SELECT COUNT(*) as count FROM attendancerecords').get().count;
    if (attCount === 0) {
      const allEmployees = db.prepare('SELECT * FROM employees WHERE status != \'INACTIVE\'').all();
      const insertAttendance = db.prepare(`
        INSERT INTO attendancerecords (
          id, employeeId, employeeName, department, date,
          checkInTime, checkOutTime, breaks, shiftType, workMode,
          status, latitude, longitude, accuracy, idempotencyKey,
          team, organizationId, companyId, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const cityCoords: Record<string, { lat: number; lng: number }> = {
        'Bengaluru': { lat: 12.9716, lng: 77.5946 },
        'Hyderabad': { lat: 17.3850, lng: 78.4867 },
        'Chennai': { lat: 13.0827, lng: 80.2707 },
        'Visakhapatnam': { lat: 17.6868, lng: 83.2185 },
        'Kochi': { lat: 9.9312, lng: 76.2673 },
        'Salem': { lat: 11.6643, lng: 78.1460 }
      };

      const today = new Date('2026-09-17');
      const daysToGenerate = 30;
      let attInserted = 0;

      for (const emp of allEmployees) {
        const joinDate = emp.joinDate ? new Date(emp.joinDate) : new Date('2020-01-01');
        const locCoords = cityCoords[emp.location] || cityCoords['Bengaluru'];

        for (let d = daysToGenerate; d >= 0; d--) {
          const targetDate = new Date(today);
          targetDate.setDate(today.getDate() - d);

          if (targetDate < joinDate) continue;
          const dayOfWeek = targetDate.getDay();
          if (dayOfWeek === 0 || dayOfWeek === 6) continue;

          const dateStr = targetDate.toISOString().substring(0, 10);
          const hash = (emp.id.charCodeAt(emp.id.length - 1) * 31 + targetDate.getDate() * 17) % 100;

          if (hash < 4) {
            insertAttendance.run(
              `att-${emp.id}-${dateStr}`, emp.id, emp.name, emp.department, dateStr,
              null, null, '[]', 'Regular', 'Office', 'On Leave',
              locCoords.lat, locCoords.lng, 10, `idemp-${emp.id}-${dateStr}`,
              emp.team, ORGANIZATION_ID, ORGANIZATION_ID, targetDate.toISOString(), targetDate.toISOString()
            );
            attInserted++;
            continue;
          }

          const checkInTimeObj = new Date(targetDate);
          checkInTimeObj.setHours(8, 45 + (hash % 25), hash % 60, 0);

          const checkOutTimeObj = new Date(targetDate);
          checkOutTimeObj.setHours(17, 30 + (hash % 30), hash % 60, 0);

          insertAttendance.run(
            `att-${emp.id}-${dateStr}`, emp.id, emp.name, emp.department, dateStr,
            checkInTimeObj.toISOString(), checkOutTimeObj.toISOString(),
            JSON.stringify([{ id: `brk-1`, type: 'Lunch', durationMinutes: 45 }]),
            'Regular', emp.status === 'REMOTE' ? 'Remote' : 'Office', 'Checked Out',
            locCoords.lat, locCoords.lng, 10, `idemp-${emp.id}-${dateStr}`,
            emp.team, ORGANIZATION_ID, ORGANIZATION_ID, checkInTimeObj.toISOString(), checkOutTimeObj.toISOString()
          );
          attInserted++;
        }
      }
      console.log(`Seeded ${attInserted} attendance records.`);
    }

  });

  transaction();
  console.log('[SQLite Seeder] Database seeded successfully with 1,000 employee historical dataset!');
};

if (process.argv[1] && process.argv[1].endsWith('seed-sqlite.ts')) {
  try {
    await seedSqlite();
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

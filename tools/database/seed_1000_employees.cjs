/**
 * WFA SQLite - 1000 Employee Comprehensive Seed Script
 * Replaces placeholder "Golden Employee" data with rich, realistic data
 * for all dashboards (Admin, HR, Manager, Team Lead, Employee)
 */
const Database = require('better-sqlite3');
const { randomUUID } = require('crypto');

const db = new Database('./database/sqlite/wfa.sqlite');
db.pragma('foreign_keys = OFF');
db.pragma('journal_mode = WAL');

const orgId = 'org-stackly';
const companyId = 'org-stackly';
const passHash = '$2b$10$RurO1wlDA8rF7QLnqIKkM.PJmHnGiRcduYPxbrULJpiX/JB7UixMG'; // StacklyWFA2026!
const now = new Date().toISOString();

console.log('🌱 Starting 1000 Employee Seed...');

// ─── Step 1: Clear old Golden Employee placeholder data ───────────────────────
console.log('🧹 Clearing old placeholder employees...');
db.prepare(`DELETE FROM attendancerecords WHERE organizationId = ? AND employeeId IN (SELECT id FROM employees WHERE name LIKE 'Golden Employee%')`).run(orgId);
db.prepare(`DELETE FROM employees WHERE name LIKE 'Golden Employee%' AND organizationId = ?`).run(orgId);
db.prepare(`DELETE FROM users WHERE email LIKE 'golden%@stackly.com' AND organizationId = ?`).run(orgId);
db.prepare(`DELETE FROM leaverequests WHERE organizationId = ? AND employeeId NOT IN (SELECT id FROM employees WHERE organizationId = ?)`).run(orgId, orgId);

const currentEmpCount = db.prepare('SELECT COUNT(*) as c FROM employees WHERE organizationId = ?').get(orgId).c;
console.log(`Current employees after cleanup: ${currentEmpCount}`);

// ─── Data pools ───────────────────────────────────────────────────────────────
const firstNames = [
  'Aarav','Vihaan','Vivaan','Ananya','Diya','Advik','Siddharth','Ishaan','Aanya','Aditi',
  'Kabir','Rohan','Arjun','Rahul','Pranav','Aditya','Sai','Krishna','Karan','Sanjay',
  'Vikram','Ramesh','Suresh','Anil','Sunil','Vijay','Rajesh','Harish','Manish','Amit',
  'Pooja','Neha','Priya','Sneha','Anjali','Riya','Divya','Deepika','Kiran','Jyoti',
  'Akash','Abhishek','Aman','Aniket','Ayush','Gaurav','Nitin','Pankaj','Sachin','Sandeep',
  'Shalini','Swati','Meera','Shruti','Preeti','Kavita','Geeta','Lata','Sunita','Anita',
  'Ravi','Vijayalakshmi','Bhaskar','Lakshmi','Nandini','Padma','Sudha','Veena','Usha','Radha',
  'Mohan','Govind','Girish','Mahesh','Subramaniam','Raghavendra','Venkatesh','Shyam','Dhananjay','Hemant',
  'Chandra','Hari','Prakash','Bharat','Dinesh','Ganesh','Murali','Neeraj','Rajiv','Sushil',
  'Vandana','Shanta','Rekha','Urvashi','Sheela','Reena','Meenakshi','Bhavana','Hemlata','Champa'
];
const lastNames = [
  'Sharma','Verma','Kumar','Singh','Patel','Reddy','Rao','Nair','Pillai','Joshi',
  'Iyer','Iyengar','Gupta','Sen','Dutta','Das','Banerjee','Chatterjee','Mukherjee','Bose',
  'Mehta','Shah','Trivedi','Pandey','Mishra','Choudhury','Prasad','Sinha','Kapoor','Khanna',
  'Malhotra','Bahl','Gill','Sandhu','Nayar','Menon','Shetty','Gowda','Naidu','Rajan',
  'Krishnan','Subramaniam','Venkataraman','Raghavan','Balakrishnan','Natarajan','Sundarajan','Murthy','Swamy','Rao',
  'Agarwal','Jain','Khatri','Arora','Bhatia','Chopra','Dhawan','Vij','Sethi','Anand',
  'Saxena','Srivastava','Tripathi','Tiwari','Shukla','Bajpai','Dixit','Lal','Chandra','Dubey'
];

const departments = [
  { name: 'Engineering', headCount: 280 },
  { name: 'Product Management', headCount: 80 },
  { name: 'Sales & Marketing', headCount: 150 },
  { name: 'Human Resources', headCount: 60 },
  { name: 'Customer Success', headCount: 120 },
  { name: 'Finance & Operations', headCount: 80 },
  { name: 'Data Science', headCount: 70 },
  { name: 'Design', headCount: 60 },
  { name: 'Legal & Compliance', headCount: 40 },
  { name: 'IT Infrastructure', headCount: 60 },
];

const deptDesignations = {
  'Engineering': ['Software Engineer', 'Senior Software Engineer', 'Lead Engineer', 'Engineering Manager', 'Principal Engineer', 'Full Stack Developer', 'Backend Developer', 'Frontend Developer', 'DevOps Engineer', 'QA Engineer'],
  'Product Management': ['Product Manager', 'Senior Product Manager', 'Product Analyst', 'Associate PM', 'Group Product Manager', 'Product Lead'],
  'Sales & Marketing': ['Sales Executive', 'Account Executive', 'Marketing Manager', 'Business Development Manager', 'Growth Manager', 'Content Strategist', 'SEO Specialist'],
  'Human Resources': ['HR Executive', 'HR Manager', 'Talent Acquisition Specialist', 'HR Business Partner', 'L&D Specialist', 'Compensation Analyst'],
  'Customer Success': ['Customer Success Manager', 'Support Specialist', 'Technical Support Engineer', 'Account Manager', 'Onboarding Specialist'],
  'Finance & Operations': ['Financial Analyst', 'Accounts Manager', 'Operations Manager', 'Business Analyst', 'Payroll Specialist', 'Compliance Manager'],
  'Data Science': ['Data Scientist', 'ML Engineer', 'Data Analyst', 'BI Developer', 'AI Researcher', 'Analytics Lead'],
  'Design': ['UI/UX Designer', 'Senior Designer', 'Product Designer', 'Brand Designer', 'Motion Designer', 'Design Lead'],
  'Legal & Compliance': ['Legal Counsel', 'Compliance Officer', 'Contract Analyst', 'Legal Manager', 'Risk Analyst'],
  'IT Infrastructure': ['Systems Administrator', 'Network Engineer', 'Cloud Architect', 'Security Engineer', 'IT Manager', 'Infrastructure Lead'],
};

const deptTeams = {
  'Engineering': ['Frontend Team', 'Backend Team', 'Mobile Team', 'Platform Team', 'QA Team', 'DevOps Team'],
  'Product Management': ['Core Product', 'Growth Product', 'Platform Product'],
  'Sales & Marketing': ['Enterprise Sales', 'SMB Sales', 'Digital Marketing', 'Content Team'],
  'Human Resources': ['Talent Acquisition', 'People Operations', 'L&D Team'],
  'Customer Success': ['Enterprise CS', 'SMB CS', 'Technical Support'],
  'Finance & Operations': ['Finance Team', 'Operations Team', 'Payroll Team'],
  'Data Science': ['ML Team', 'Analytics Team', 'Data Engineering'],
  'Design': ['UX Team', 'Brand Team', 'Visual Design'],
  'Legal & Compliance': ['Legal Team', 'Compliance Team'],
  'IT Infrastructure': ['Cloud Team', 'Network Team', 'Security Team'],
};

const locations = ['Bengaluru', 'Hyderabad', 'Mumbai', 'Delhi', 'Chennai', 'Pune'];
const workModes = ['Office', 'Remote', 'Hybrid'];
const statuses = ['ACTIVE', 'ACTIVE', 'ACTIVE', 'ACTIVE', 'ACTIVE', 'ACTIVE', 'ACTIVE', 'ON_LEAVE', 'REMOTE', 'TERMINATED'];
const employmentTypes = ['FULL_TIME', 'FULL_TIME', 'FULL_TIME', 'PART_TIME', 'CONTRACT'];

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getJoinDate(index) {
  // Spread join dates from 2018 to 2026 realistically
  const year = 2018 + Math.floor(index / 125); // ~125 per year
  const month = (index % 12) + 1;
  const day = getRandomInt(1, 28);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// ─── Build employee list ───────────────────────────────────────────────────────
const employeeList = [];
let globalIdx = 0;

for (const dept of departments) {
  const teams = deptTeams[dept.name];
  const designations = deptDesignations[dept.name];
  
  for (let i = 0; i < dept.headCount; i++) {
    globalIdx++;
    const firstName = firstNames[(globalIdx - 1) % firstNames.length];
    const lastName = lastNames[Math.floor((globalIdx - 1) / firstNames.length) % lastNames.length];
    const name = `${firstName} ${lastName}`;
    const paddedNum = String(globalIdx).padStart(4, '0');
    const code = `EMP-${paddedNum}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${paddedNum}@thestackly.com`;
    const designation = designations[globalIdx % designations.length];
    const team = teams[globalIdx % teams.length];
    const location = locations[globalIdx % locations.length];
    const workMode = workModes[globalIdx % workModes.length];
    const status = statuses[globalIdx % statuses.length];
    const empType = employmentTypes[globalIdx % employmentTypes.length];
    const joinDate = getJoinDate(globalIdx);
    const perfScore = getRandomInt(65, 100);
    const attRate = getRandomInt(75, 100);
    
    employeeList.push({
      id: randomUUID(),
      code,
      name,
      email,
      role: 'EMPLOYEE',
      department: dept.name,
      designation,
      team,
      location,
      workMode,
      status,
      empType,
      joinDate,
      perfScore,
      attRate,
    });
  }
}

// Total should be 1000
console.log(`Prepared ${employeeList.length} employee records.`);

// ─── Step 2: Insert employees and users ───────────────────────────────────────
const insertEmp = db.prepare(`
  INSERT OR IGNORE INTO employees 
  (id, employeeCode, name, email, role, department, designation, workMode, employmentType, status, joinDate, performanceScore, attendanceRate, team, location, organizationId, companyId, noticePeriodDays, createdAt, updatedAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 30, ?, ?)
`);

const insertUser = db.prepare(`
  INSERT OR IGNORE INTO users 
  (id, name, email, password_hash, role, department, team, location, title, clearanceLevel, status, permissions, mfa_enabled, organizationId, companyId, createdAt, updatedAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'ACTIVE', ?, 0, ?, ?, ?, ?)
`);

const perms = JSON.stringify(['PROFILE_VIEW', 'PROFILE_UPDATE', 'ATTENDANCE_VIEW_SELF', 'LEAVE_REQUEST', 'PERFORMANCE_VIEW_SELF', 'GOAL_UPDATE', 'DOCUMENT_UPLOAD']);

console.log('📝 Inserting employees and users...');
const insertMany = db.transaction(() => {
  let inserted = 0;
  for (const emp of employeeList) {
    insertEmp.run(
      emp.id, emp.code, emp.name, emp.email, emp.role,
      emp.department, emp.designation, emp.workMode, emp.empType, emp.status,
      emp.joinDate, emp.perfScore, emp.attRate, emp.team, emp.location,
      orgId, companyId, now, now
    );
    insertUser.run(
      emp.id, emp.name, emp.email, passHash, 'EMPLOYEE',
      emp.department, emp.team, emp.location, emp.designation,
      perms, orgId, companyId, now, now
    );
    inserted++;
  }
  return inserted;
});

const inserted = insertMany();
console.log(`✅ Inserted ${inserted} employees + users`);

// ─── Step 3: Verify counts ────────────────────────────────────────────────────
const totalEmp = db.prepare('SELECT COUNT(*) as c FROM employees WHERE organizationId = ?').get(orgId);
console.log(`Total employees in DB: ${totalEmp.c}`);

const deptBreakdown = db.prepare('SELECT department, COUNT(*) as c FROM employees WHERE organizationId = ? GROUP BY department ORDER BY c DESC').all(orgId);
console.log('Dept breakdown:', JSON.stringify(deptBreakdown));

const statusBreakdown = db.prepare("SELECT status, COUNT(*) as c FROM employees WHERE organizationId = ? GROUP BY status").all(orgId);
console.log('Status breakdown:', JSON.stringify(statusBreakdown));

// ─── Step 4: Seed attendance records (last 30 days) ──────────────────────────
console.log('\n📊 Seeding attendance records...');
const existingAtt = db.prepare('SELECT COUNT(*) as c FROM attendancerecords WHERE organizationId = ?').get(orgId);
console.log(`Existing attendance records: ${existingAtt.c}`);

if (existingAtt.c < 5000) {
  const allEmps = db.prepare('SELECT id, department FROM employees WHERE organizationId = ? AND status IN (?, ?, ?)').all(orgId, 'ACTIVE', 'REMOTE', 'ON_LEAVE');
  
  const insertAtt = db.prepare(`
    INSERT OR IGNORE INTO attendancerecords 
    (id, employeeId, date, status, workMode, checkInTime, checkOutTime, organizationId, companyId, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const attStatuses = ['PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'ABSENT', 'LEAVE'];
  const attWorkModes = ['Office', 'Remote', 'Hybrid'];
  
  const seedAtt = db.transaction(() => {
    let count = 0;
    const today = new Date();
    for (let d = 29; d >= 0; d--) {
      const date = new Date(today);
      date.setDate(today.getDate() - d);
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue; // skip weekends
      const dateStr = date.toISOString().split('T')[0];
      
      // Only a sample of employees per day (not all 1000)
      const sampleEmps = allEmps.filter((_, i) => i % 2 === (d % 2)); // ~500 per day
      
      for (const emp of sampleEmps) {
        const attStatus = attStatuses[Math.floor(Math.random() * attStatuses.length)];
        const wm = attWorkModes[Math.floor(Math.random() * attWorkModes.length)];
        const checkIn = `${dateStr}T09:${String(getRandomInt(0,30)).padStart(2,'0')}:00.000Z`;
        const checkOut = `${dateStr}T18:${String(getRandomInt(0,30)).padStart(2,'0')}:00.000Z`;
        
        insertAtt.run(
          randomUUID(), emp.id, dateStr, attStatus, wm,
          attStatus === 'PRESENT' ? checkIn : null,
          attStatus === 'PRESENT' ? checkOut : null,
          orgId, companyId, now, now
        );
        count++;
      }
    }
    return count;
  });
  
  const attInserted = seedAtt();
  console.log(`✅ Inserted ${attInserted} attendance records`);
} else {
  console.log('Attendance records already sufficient, skipping.');
}

// ─── Step 5: Seed leave requests ─────────────────────────────────────────────
console.log('\n📅 Seeding leave requests...');
const existingLeave = db.prepare('SELECT COUNT(*) as c FROM leaverequests WHERE organizationId = ?').get(orgId);

if (existingLeave.c < 200) {
  // Check leave types exist
  let leaveTypes;
  try {
    leaveTypes = db.prepare("SELECT id, name FROM leave_types WHERE organizationId = ? LIMIT 5").all(orgId);
  } catch(e) {
    leaveTypes = [];
  }

  const allEmpIds = db.prepare('SELECT id FROM employees WHERE organizationId = ? LIMIT 300').all(orgId).map(e => e.id);
  
  const insertLeave = db.prepare(`
    INSERT OR IGNORE INTO leaverequests 
    (id, employeeId, type, startDate, endDate, status, reason, organizationId, companyId, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const leaveStatuses = ['APPROVED', 'APPROVED', 'PENDING', 'REJECTED'];
  const leaveTypes2 = ['CASUAL', 'SICK', 'ANNUAL', 'EMERGENCY', 'MATERNITY', 'PATERNITY'];
  
  const seedLeave = db.transaction(() => {
    let count = 0;
    const today = new Date();
    
    for (let i = 0; i < 800; i++) {
      const empId = allEmpIds[i % allEmpIds.length];
      const daysAgo = getRandomInt(1, 180);
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - daysAgo);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + getRandomInt(1, 5));
      
      const startStr = startDate.toISOString().split('T')[0];
      const endStr = endDate.toISOString().split('T')[0];
      const status = leaveStatuses[i % leaveStatuses.length];
      const leaveType = leaveTypes2[i % leaveTypes2.length];
      
      try {
        insertLeave.run(
          randomUUID(), empId, leaveType, startStr, endStr, status,
          'Personal reasons', orgId, companyId, now, now
        );
        count++;
      } catch(e) { /* ignore duplicates */ }
    }
    return count;
  });

  const leaveInserted = seedLeave();
  console.log(`✅ Inserted ${leaveInserted} leave requests`);
} else {
  console.log(`Leave requests already sufficient (${existingLeave.c}), skipping.`);
}

// ─── Step 6: Ensure feature_flags populated ───────────────────────────────────
const ffExisting = db.prepare('SELECT COUNT(*) as c FROM feature_flags').get();
if (ffExisting.c === 0) {
  console.log('\n🚩 Seeding feature flags...');
  const insertFF = db.prepare(`
    INSERT OR IGNORE INTO feature_flags (id, name, enabled, description, organizationId, createdAt, updatedAt)
    VALUES (?, ?, 1, ?, ?, ?, ?)
  `);
  const flags = [
    ['ff-payroll', 'PAYROLL_ENGINE', 'Payroll processing engine'],
    ['ff-attendance', 'ATTENDANCE_TRACKING', 'Real-time attendance tracking'],
    ['ff-analytics', 'ANALYTICS_DASHBOARD', 'Advanced analytics dashboards'],
    ['ff-ai', 'AI_INSIGHTS', 'AI-powered workforce insights'],
    ['ff-recruitment', 'RECRUITMENT_MODULE', 'Recruitment pipeline management'],
  ];
  for (const [id, name, desc] of flags) {
    try { insertFF.run(id, name, desc, orgId, now, now); } catch(e) {}
  }
  console.log('✅ Feature flags seeded');
}

// ─── Final verification ────────────────────────────────────────────────────────
console.log('\n📊 Final verification:');
const finalEmp = db.prepare('SELECT COUNT(*) as c FROM employees WHERE organizationId = ?').get(orgId);
const finalUsers = db.prepare('SELECT COUNT(*) as c FROM users WHERE organizationId = ?').get(orgId);
const finalAtt = db.prepare('SELECT COUNT(*) as c FROM attendancerecords WHERE organizationId = ?').get(orgId);
const finalLeave = db.prepare('SELECT COUNT(*) as c FROM leaverequests WHERE organizationId = ?').get(orgId);
const activeEmp = db.prepare("SELECT COUNT(*) as c FROM employees WHERE organizationId = ? AND status = 'ACTIVE'").get(orgId);

console.log(`Employees: ${finalEmp.c} (Active: ${activeEmp.c})`);
console.log(`Users: ${finalUsers.c}`);
console.log(`Attendance Records: ${finalAtt.c}`);
console.log(`Leave Requests: ${finalLeave.c}`);

db.pragma('foreign_keys = ON');
db.close();
console.log('\n✅ Seed complete!');

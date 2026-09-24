/**
 * WFA SQLite — MASTER COMPREHENSIVE SEED v2
 * Seeds all empty dashboard tables for 1000 employees
 * Tables: appraisal_reviews, approval_requests, attendance_monthly_summary,
 *         designations, employee_bank_details, employee_certifications,
 *         employee_documents, employee_education, employee_emergency_contacts,
 *         employee_experience, employee_history, employee_skills, 
 *         employee_status_history, employee_tax_info, goals,
 *         investment_declarations, job_applications, job_levels,
 *         leave_balances, leave_blackout_periods, leave_policies,
 *         leave_requests, lifecycle_events, okr_objectives, payslips,
 *         performancerecords, pf_esi_records, reviews, salary_components,
 *         salary_structures, shift_assignments, skills, tax_declarations,
 *         timesheet_entries, timesheets, training_enrollments, work_schedules
 */

const Database = require('better-sqlite3');
const { randomUUID } = require('crypto');

const db = new Database('./database/sqlite/wfa.sqlite');
db.pragma('foreign_keys = OFF');
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');

const orgId = 'org-stackly';
const companyId = 'org-stackly';
const now = new Date().toISOString();

// ── Helpers ────────────────────────────────────────────────────────────────────
const rInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const rFloat = (min, max, dp = 2) => parseFloat((Math.random() * (max - min) + min).toFixed(dp));
const rEl = (arr) => arr[Math.floor(Math.random() * arr.length)];
const addDays = (base, n) => { const d = new Date(base); d.setDate(d.getDate() + n); return d.toISOString().split('T')[0]; };
const addMonths = (base, n) => { const d = new Date(base); d.setMonth(d.getMonth() + n); return d.toISOString().split('T')[0]; };
const isoDate = (y, m, d) => `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;

// Load all employees
const allEmps = db.prepare(`SELECT id, name, email, department, designation, team, location, joinDate, status, organizationId FROM employees WHERE organizationId = ? ORDER BY rowid`).all(orgId);
const empCount = allEmps.length;
console.log(`\n🚀 Master Seed starting for ${empCount} employees...\n`);

const adminId = 'usr-admin-01';
const hrId = 'usr-hr-01';
const mgrId = 'usr-mgr-01';

// ─────────────────────────────────────────────────────────────────────────────
// 1. JOB LEVELS
// ─────────────────────────────────────────────────────────────────────────────
const existingLevels = db.prepare('SELECT COUNT(*) as c FROM job_levels').get().c;
if (existingLevels === 0) {
  console.log('📋 Seeding job_levels...');
  const insertJL = db.prepare(`INSERT OR IGNORE INTO job_levels (id,organizationId,name,code,band,minCtc,maxCtc,description,status,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?)`);
  const levels = [
    ['jl-1',orgId,'Junior','L1','IC1',300000,600000,'Entry level individual contributor','ACTIVE',now,now],
    ['jl-2',orgId,'Mid-Level','L2','IC2',600000,1200000,'Mid level professional','ACTIVE',now,now],
    ['jl-3',orgId,'Senior','L3','IC3',1200000,2000000,'Senior individual contributor','ACTIVE',now,now],
    ['jl-4',orgId,'Lead','L4','IC4',2000000,3000000,'Technical lead / team lead','ACTIVE',now,now],
    ['jl-5',orgId,'Principal','L5','IC5',3000000,5000000,'Principal engineer/manager','ACTIVE',now,now],
    ['jl-6',orgId,'Director','L6','M1',5000000,9000000,'Director level management','ACTIVE',now,now],
  ];
  const ins = db.transaction(() => { for (const l of levels) insertJL.run(...l); });
  ins();
  console.log(`  ✅ ${levels.length} job levels`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. DESIGNATIONS
// ─────────────────────────────────────────────────────────────────────────────
const existingDesig = db.prepare('SELECT COUNT(*) as c FROM designations').get().c;
const deptDesigMap = {
  'Engineering':['Software Engineer','Senior Software Engineer','Lead Engineer','Principal Engineer','Engineering Manager'],
  'Product Management':['Associate PM','Product Manager','Senior PM','Group PM'],
  'Sales & Marketing':['Sales Executive','Senior Sales Executive','Account Executive','Sales Manager'],
  'Human Resources':['HR Executive','HR Manager','Talent Acquisition Specialist','HR Business Partner'],
  'Customer Success':['CS Associate','Customer Success Manager','Senior CSM','CS Director'],
  'Finance & Operations':['Financial Analyst','Senior Analyst','Finance Manager','Operations Manager'],
  'Data Science':['Data Analyst','Data Scientist','Senior Data Scientist','ML Engineer'],
  'Design':['UI Designer','UX Designer','Senior Designer','Design Lead'],
  'Legal & Compliance':['Compliance Analyst','Legal Counsel','Senior Legal Counsel','Legal Manager'],
  'IT Infrastructure':['IT Admin','Systems Engineer','Senior Engineer','Infrastructure Lead'],
};
const allDesigIds = {};
if (existingDesig === 0) {
  console.log('📋 Seeding designations...');
  const insertD = db.prepare(`INSERT OR IGNORE INTO designations (id,organizationId,title,code,status,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?)`);
  const ins = db.transaction(() => {
    let idx = 0;
    for (const [dept, desigs] of Object.entries(deptDesigMap)) {
      for (const title of desigs) {
        idx++;
        const id = `desig-${idx}`;
        allDesigIds[title] = id;
        insertD.run(id, orgId, title, `D${String(idx).padStart(3,'0')}`, 'ACTIVE', now, now);
      }
    }
    return idx;
  });
  const n = ins();
  console.log(`  ✅ ${n} designations`);
} else {
  const rows = db.prepare('SELECT id, title FROM designations WHERE organizationId=?').all(orgId);
  rows.forEach(r => allDesigIds[r.title] = r.id);
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. LEAVE POLICIES
// ─────────────────────────────────────────────────────────────────────────────
const existingLP = db.prepare('SELECT COUNT(*) as c FROM leave_policies').get().c;
const leaveTypeRows = db.prepare("SELECT id, name FROM leave_types WHERE organizationId=? OR organizationId IS NULL LIMIT 10").all(orgId);
let leaveTypeMap = {};
leaveTypeRows.forEach(lt => leaveTypeMap[lt.name] = lt.id);

// Create leave types if missing
const ltNames = ['ANNUAL','SICK','CASUAL','MATERNITY','PATERNITY','EMERGENCY','STUDY','BEREAVEMENT'];
const existingLT = db.prepare('SELECT COUNT(*) as c FROM leave_types WHERE organizationId=?').get(orgId).c;
if (existingLT === 0) {
  console.log('📋 Seeding leave_types...');
  const insertLT = db.prepare(`INSERT OR IGNORE INTO leave_types (id,organizationId,name,description,maxDays,isCarryForward,isPaid,requiresApproval,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?)`);
  const types = [
    ['lt-annual',orgId,'ANNUAL','Annual paid leave',21,1,1,1,now,now],
    ['lt-sick',orgId,'SICK','Sick leave with doctor certificate',10,0,1,0,now,now],
    ['lt-casual',orgId,'CASUAL','Casual leave for personal work',12,0,1,1,now,now],
    ['lt-maternity',orgId,'MATERNITY','Maternity leave',180,0,1,1,now,now],
    ['lt-paternity',orgId,'PATERNITY','Paternity leave',15,0,1,1,now,now],
    ['lt-emergency',orgId,'EMERGENCY','Emergency leave',3,0,1,0,now,now],
    ['lt-study',orgId,'STUDY','Study or exam leave',5,0,1,1,now,now],
    ['lt-bereavement',orgId,'BEREAVEMENT','Bereavement leave',5,0,1,0,now,now],
  ];
  const ins = db.transaction(() => { for (const t of types) insertLT.run(...t); });
  ins();
  leaveTypeMap = { ANNUAL:'lt-annual', SICK:'lt-sick', CASUAL:'lt-casual', MATERNITY:'lt-maternity', PATERNITY:'lt-paternity', EMERGENCY:'lt-emergency', STUDY:'lt-study', BEREAVEMENT:'lt-bereavement' };
  console.log(`  ✅ ${types.length} leave types`);
} else {
  leaveTypeMap = { ANNUAL:'lt-annual', SICK:'lt-sick', CASUAL:'lt-casual', MATERNITY:'lt-maternity', PATERNITY:'lt-paternity', EMERGENCY:'lt-emergency', STUDY:'lt-study', BEREAVEMENT:'lt-bereavement' };
}

if (existingLP === 0) {
  console.log('📋 Seeding leave_policies...');
  const insertLP = db.prepare(`INSERT OR IGNORE INTO leave_policies (id,organizationId,name,description,leaveTypeId,accrualRate,accrualFrequency,maxCarryForward,isProRata) VALUES (?,?,?,?,?,?,?,?,?)`);
  const policies = [
    ['lp-1',orgId,'Annual Leave Policy','Standard annual leave accrual','lt-annual',1.75,'MONTHLY',10,1],
    ['lp-2',orgId,'Sick Leave Policy','Sick leave per year','lt-sick',0,'YEARLY',0,0],
    ['lp-3',orgId,'Casual Leave Policy','Casual leave allocation','lt-casual',1,'MONTHLY',0,0],
    ['lp-4',orgId,'Maternity Leave Policy','Maternity protection','lt-maternity',0,'YEARLY',0,0],
    ['lp-5',orgId,'Paternity Leave Policy','Paternity leave','lt-paternity',0,'YEARLY',0,0],
  ];
  const ins = db.transaction(() => { for (const p of policies) insertLP.run(...p); });
  ins();
  console.log(`  ✅ ${policies.length} leave policies`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. LEAVE BLACKOUT PERIODS
// ─────────────────────────────────────────────────────────────────────────────
const existingLBP = db.prepare('SELECT COUNT(*) as c FROM leave_blackout_periods').get().c;
if (existingLBP === 0) {
  console.log('📋 Seeding leave_blackout_periods...');
  const insertLBP = db.prepare(`INSERT OR IGNORE INTO leave_blackout_periods (id,organizationId,name,startDate,endDate,affectedDepartments,reason,createdAt) VALUES (?,?,?,?,?,?,?,?)`);
  const periods = [
    ['lbp-1',orgId,'Year End Freeze','2025-12-20','2025-12-31',JSON.stringify(['Engineering','Finance & Operations']),'Year end financial close',now],
    ['lbp-2',orgId,'Q1 Appraisal Period','2026-01-15','2026-01-25',JSON.stringify(['Human Resources']),'Annual appraisal cycle',now],
    ['lbp-3',orgId,'Product Launch Freeze','2026-03-01','2026-03-07',JSON.stringify(['Engineering','Product Management']),'Major product release',now],
    ['lbp-4',orgId,'Audit Period','2026-04-01','2026-04-15',JSON.stringify(['Finance & Operations','Legal & Compliance']),'Annual audit',now],
    ['lbp-5',orgId,'Sales Quarter End','2026-06-25','2026-06-30',JSON.stringify(['Sales & Marketing']),'Q2 close period',now],
  ];
  const ins = db.transaction(() => { for (const p of periods) insertLBP.run(...p); });
  ins();
  console.log(`  ✅ ${periods.length} blackout periods`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. LEAVE BALANCES (per employee per leave type)
// ─────────────────────────────────────────────────────────────────────────────
const existingLB = db.prepare('SELECT COUNT(*) as c FROM leave_balances').get().c;
if (existingLB === 0) {
  console.log('📋 Seeding leave_balances...');
  const insertLB = db.prepare(`INSERT OR IGNORE INTO leave_balances (id,employeeId,leaveTypeId,year,allocated,used,organizationId) VALUES (?,?,?,?,?,?,?)`);
  const currentYear = 2026;
  const ins = db.transaction(() => {
    let n = 0;
    for (const emp of allEmps) {
      const balances = [
        ['lt-annual', 21, rInt(0, 18)],
        ['lt-sick', 10, rInt(0, 6)],
        ['lt-casual', 12, rInt(0, 8)],
        ['lt-emergency', 3, rInt(0, 2)],
      ];
      for (const [ltId, allocated, used] of balances) {
        insertLB.run(randomUUID(), emp.id, ltId, currentYear, allocated, used, orgId);
        n++;
      }
    }
    return n;
  });
  console.log(`  ✅ ${ins()} leave balances`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. LEAVE REQUESTS (using leave_requests table with leaveTypeId)
// ─────────────────────────────────────────────────────────────────────────────
const existingLR2 = db.prepare('SELECT COUNT(*) as c FROM leave_requests').get().c;
if (existingLR2 === 0) {
  console.log('📋 Seeding leave_requests...');
  const insertLR = db.prepare(`INSERT OR IGNORE INTO leave_requests (id,organizationId,employeeId,leaveTypeId,startDate,endDate,isHalfDay,halfDayPeriod,status,reason,approvedBy,approvedAt,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  const statuses = ['APPROVED','APPROVED','APPROVED','PENDING','REJECTED'];
  const reasons = ['Family emergency','Medical appointment','Personal work','Vacation','Annual holiday','Sick with fever','Attending family function'];
  const ltIds = ['lt-annual','lt-sick','lt-casual','lt-emergency'];
  
  const ins = db.transaction(() => {
    let n = 0;
    const today = new Date('2026-09-24');
    for (let i = 0; i < allEmps.length; i++) {
      const emp = allEmps[i];
      const reqCount = rInt(1, 4);
      for (let j = 0; j < reqCount; j++) {
        const daysAgo = rInt(10, 270);
        const start = new Date(today);
        start.setDate(today.getDate() - daysAgo);
        const end = new Date(start);
        end.setDate(start.getDate() + rInt(1, 5));
        const status = rEl(statuses);
        const ltId = rEl(ltIds);
        const approvedAt = status === 'APPROVED' ? addDays(start.toISOString().split('T')[0], -2) : null;
        insertLR.run(
          randomUUID(), orgId, emp.id, ltId,
          start.toISOString().split('T')[0], end.toISOString().split('T')[0],
          0, null, status, rEl(reasons),
          status === 'APPROVED' ? hrId : null,
          approvedAt, now, now
        );
        n++;
      }
    }
    return n;
  });
  console.log(`  ✅ ${ins()} leave requests`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. APPRAISAL REVIEWS (link to existing appraisal_cycles)
// ─────────────────────────────────────────────────────────────────────────────
const existingAR = db.prepare('SELECT COUNT(*) as c FROM appraisal_reviews').get().c;
const cycleIds = db.prepare('SELECT id FROM appraisal_cycles LIMIT 3').all().map(r => r.id);
if (existingAR === 0 && cycleIds.length > 0) {
  console.log('📋 Seeding appraisal_reviews...');
  const insertAR = db.prepare(`INSERT OR IGNORE INTO appraisal_reviews (id,cycleId,employeeId,reviewerId,selfRating,managerRating,finalScore,feedback,status,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?)`);
  const feedbacks = [
    'Excellent performance, consistently exceeds expectations.',
    'Good contributor, meets all targets. Shows improvement.',
    'Strong technical skills, needs improvement in communication.',
    'Delivered all goals on time. Highly collaborative team player.',
    'Needs to work on time management and delivery.',
    'Outstanding leadership in Q3 product launches.',
    'Met expectations. Growth potential is high.',
    'Key contributor to team productivity improvements.',
  ];
  const statuses = ['COMPLETED','COMPLETED','COMPLETED','IN_PROGRESS','PENDING'];
  const ins = db.transaction(() => {
    let n = 0;
    const cycleId = cycleIds[0];
    for (const emp of allEmps) {
      const selfRating = rFloat(2.5, 5.0, 1);
      const mgrRating = rFloat(2.5, 5.0, 1);
      const finalScore = parseFloat(((selfRating + mgrRating) / 2).toFixed(1));
      insertAR.run(
        randomUUID(), cycleId, emp.id, mgrId,
        selfRating, mgrRating, finalScore,
        rEl(feedbacks), rEl(statuses), now, now
      );
      n++;
    }
    return n;
  });
  console.log(`  ✅ ${ins()} appraisal reviews`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. EMPLOYEE BANK DETAILS
// ─────────────────────────────────────────────────────────────────────────────
const existingBD = db.prepare('SELECT COUNT(*) as c FROM employee_bank_details').get().c;
if (existingBD === 0) {
  console.log('📋 Seeding employee_bank_details...');
  const insertBD = db.prepare(`INSERT OR IGNORE INTO employee_bank_details (id,employeeId,bankName,accountName,accountNumber,routingNumber,swiftCode,branchName,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?)`);
  const banks = ['State Bank of India','HDFC Bank','ICICI Bank','Axis Bank','Kotak Mahindra Bank','Yes Bank','Punjab National Bank','Bank of Baroda'];
  const branches = ['Bengaluru Main','Hyderabad Central','Mumbai Fort','Delhi Connaught','Chennai Anna Nagar','Pune FC Road'];
  const ins = db.transaction(() => {
    let n = 0;
    for (const emp of allEmps) {
      const acctNum = `${rInt(10000000,99999999)}${rInt(1000,9999)}`;
      const ifsc = `${rEl(['SBIN','HDFC','ICIC','UTIB','KKBK'])}0${rInt(100000,999999)}`;
      insertBD.run(randomUUID(), emp.id, rEl(banks), emp.name, acctNum, ifsc, `SWIFT${rInt(1000,9999)}`, rEl(branches), now, now);
      n++;
    }
    return n;
  });
  console.log(`  ✅ ${ins()} bank details`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. EMPLOYEE TAX INFO
// ─────────────────────────────────────────────────────────────────────────────
const existingTI = db.prepare('SELECT COUNT(*) as c FROM employee_tax_info').get().c;
if (existingTI === 0) {
  console.log('📋 Seeding employee_tax_info...');
  const insertTI = db.prepare(`INSERT OR IGNORE INTO employee_tax_info (id,employeeId,panNumber,aadhaarNumber,taxRegime,pfNumber,uanNumber,esiNumber,ptState,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?)`);
  const ptStates = ['Karnataka','Telangana','Maharashtra','Delhi','Tamil Nadu'];
  const regimes = ['new','new','new','old'];
  const ins = db.transaction(() => {
    let n = 0;
    for (const emp of allEmps) {
      const initials = emp.name.split(' ').map(w => w[0]).join('').toUpperCase().substring(0,3).padEnd(3,'A');
      const pan = `${initials}P${rInt(1000,9999)}${rEl(['A','B','C','D','E','F','G','H','J','K'])}`;
      const aadhaar = `${rInt(1000,9999)} ${rInt(1000,9999)} ${rInt(1000,9999)}`;
      const uan = `10${rInt(10000000,99999999)}`;
      insertTI.run(randomUUID(), emp.id, pan, aadhaar, rEl(regimes), `PF${rInt(100000,999999)}`, uan, null, rEl(ptStates), now, now);
      n++;
    }
    return n;
  });
  console.log(`  ✅ ${ins()} tax info records`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. EMERGENCY CONTACTS
// ─────────────────────────────────────────────────────────────────────────────
const existingEC = db.prepare('SELECT COUNT(*) as c FROM employee_emergency_contacts').get().c;
if (existingEC === 0) {
  console.log('📋 Seeding employee_emergency_contacts...');
  const insertEC = db.prepare(`INSERT OR IGNORE INTO employee_emergency_contacts (id,employeeId,name,relationship,phoneNumber,altPhoneNumber,address,isPrimary,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?)`);
  const relationships = ['Spouse','Parent','Sibling','Friend','Parent'];
  const firstNames = ['Ravi','Priya','Anita','Sunita','Mohan','Deepa','Rajesh','Kavitha','Suresh','Neha'];
  const ins = db.transaction(() => {
    let n = 0;
    for (const emp of allEmps) {
      const lastName = emp.name.split(' ').pop() || 'Kumar';
      const contactName = `${rEl(firstNames)} ${lastName}`;
      const phone = `+91 ${rInt(70000,99999)}${rInt(10000,99999)}`;
      insertEC.run(randomUUID(), emp.id, contactName, rEl(relationships), phone, null, `${emp.location || 'Bengaluru'}, India`, 1, now, now);
      n++;
    }
    return n;
  });
  console.log(`  ✅ ${ins()} emergency contacts`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. EMPLOYEE EDUCATION
// ─────────────────────────────────────────────────────────────────────────────
const existingEdu = db.prepare('SELECT COUNT(*) as c FROM employee_education').get().c;
if (existingEdu === 0) {
  console.log('📋 Seeding employee_education...');
  const insertEdu = db.prepare(`INSERT OR IGNORE INTO employee_education (id,employeeId,institution,degree,fieldOfStudy,startDate,endDate,grade,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?)`);
  const institutions = ['IIT Bombay','IIT Delhi','IIT Madras','NIT Warangal','BITS Pilani','VTU Bengaluru','Osmania University','Anna University','Mumbai University','Delhi University','Symbiosis','XLRI'];
  const degrees = ['B.Tech','B.E.','M.Tech','MBA','BCA','MCA','B.Sc','M.Sc'];
  const fields = {
    'Engineering': ['Computer Science','Information Technology','Electronics','Mechanical'],
    'Product Management': ['Computer Science','MBA','Electronics','Management'],
    'Sales & Marketing': ['Business Administration','Marketing','Commerce','Economics'],
    'Human Resources': ['Human Resources','Psychology','Business Administration'],
    'Customer Success': ['Business Administration','Computer Science','Commerce'],
    'Finance & Operations': ['Finance','Accounting','Commerce','Economics'],
    'Data Science': ['Computer Science','Statistics','Mathematics','Data Science'],
    'Design': ['Design','Fine Arts','Computer Science','Visual Communication'],
    'Legal & Compliance': ['Law','LLB','Political Science','Commerce'],
    'IT Infrastructure': ['Computer Science','Information Technology','Electronics'],
  };
  const grades = ['8.5 CGPA','9.1 CGPA','7.8 CGPA','First Class','Distinction','8.2 CGPA','7.5 CGPA'];
  const ins = db.transaction(() => {
    let n = 0;
    for (const emp of allEmps) {
      const fieldList = fields[emp.department] || ['Computer Science'];
      const gradYear = new Date(emp.joinDate || '2020-01-01').getFullYear() - rInt(1, 3);
      insertEdu.run(
        randomUUID(), emp.id, rEl(institutions), rEl(degrees), rEl(fieldList),
        isoDate(gradYear - 4, rInt(6,8), 1), isoDate(gradYear, rInt(4,6), 30),
        rEl(grades), now, now
      );
      n++;
    }
    return n;
  });
  console.log(`  ✅ ${ins()} education records`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 12. EMPLOYEE EXPERIENCE
// ─────────────────────────────────────────────────────────────────────────────
const existingExp = db.prepare('SELECT COUNT(*) as c FROM employee_experience').get().c;
if (existingExp === 0) {
  console.log('📋 Seeding employee_experience...');
  const insertExp = db.prepare(`INSERT OR IGNORE INTO employee_experience (id,employeeId,company,title,location,startDate,endDate,isCurrentRole,description,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?)`);
  const companies = ['Infosys','TCS','Wipro','HCL Technologies','Tech Mahindra','Cognizant','Capgemini','Accenture','IBM India','Mindtree','Zensar','L&T Infotech','Mphasis','Persistent Systems'];
  const jobDescs = ['Worked on enterprise software development','Led cross-functional product team','Managed key client accounts','Built scalable backend microservices','Designed and delivered UX for web apps'];
  const cities = ['Bengaluru','Hyderabad','Mumbai','Pune','Chennai','Delhi'];
  const ins = db.transaction(() => {
    let n = 0;
    for (const emp of allEmps) {
      const joinYear = new Date(emp.joinDate || '2020-01-01').getFullYear();
      const prevCount = rInt(1, 3);
      let endYear = joinYear;
      for (let k = 0; k < prevCount; k++) {
        const duration = rInt(1, 3);
        const startYear = endYear - duration;
        insertExp.run(
          randomUUID(), emp.id, rEl(companies),
          emp.designation || 'Software Engineer',
          rEl(cities), isoDate(startYear, rInt(1,6), 1),
          k === 0 ? null : isoDate(endYear, rInt(7,12), 1),
          k === 0 ? 1 : 0, rEl(jobDescs), now, now
        );
        endYear = startYear;
        n++;
      }
    }
    return n;
  });
  console.log(`  ✅ ${ins()} experience records`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 13. EMPLOYEE CERTIFICATIONS
// ─────────────────────────────────────────────────────────────────────────────
const existingCert = db.prepare('SELECT COUNT(*) as c FROM employee_certifications').get().c;
if (existingCert === 0) {
  console.log('📋 Seeding employee_certifications...');
  const insertCert = db.prepare(`INSERT OR IGNORE INTO employee_certifications (id,employeeId,name,issuingOrganization,issueDate,expirationDate,credentialId,credentialUrl,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?)`);
  const certsByDept = {
    'Engineering': [['AWS Solutions Architect','Amazon'],['Google Cloud Professional','Google'],['Docker Certified Associate','Docker'],['Azure Developer','Microsoft'],['Kubernetes CKAD','CNCF']],
    'Data Science': [['TensorFlow Developer','Google'],['AWS ML Specialty','Amazon'],['Databricks Certified','Databricks'],['Google Data Analytics','Google']],
    'Product Management': [['Certified Scrum Product Owner','Scrum Alliance'],['PMP','PMI'],['Google PM Certificate','Google']],
    'Human Resources': [['SHRM-CP','SHRM'],['PHR Certification','HRCI'],['HRCI Associate','HRCI']],
    'Finance & Operations': [['CFA Level 1','CFA Institute'],['CA Inter','ICAI'],['CPA','AICPA'],['ACCA','ACCA']],
    'Sales & Marketing': [['Google Analytics','Google'],['HubSpot Sales','HubSpot'],['Salesforce Admin','Salesforce']],
    'Design': [['Google UX Design','Google'],['Adobe Certified Expert','Adobe'],['Interaction Design','IDF']],
    'Legal & Compliance': [['CIPP/E','IAPP'],['Certified Compliance Professional','CCEP']],
    'IT Infrastructure': [['CCNA','Cisco'],['CompTIA Security+','CompTIA'],['AWS SysOps','Amazon'],['ITIL Foundation','Axelos']],
    'Customer Success': [['Gainsight Certified','Gainsight'],['HubSpot Service','HubSpot']],
  };
  const defaultCerts = [['ISO 9001 Awareness','Bureau Veritas'],['POSH Training','Government of India']];
  const ins = db.transaction(() => {
    let n = 0;
    for (const emp of allEmps) {
      if (Math.random() < 0.7) { // 70% have at least one cert
        const certList = certsByDept[emp.department] || defaultCerts;
        const count = rInt(1, Math.min(3, certList.length));
        const selected = [...certList].sort(() => Math.random() - 0.5).slice(0, count);
        for (const [certName, issuer] of selected) {
          const issueYear = rInt(2020, 2025);
          const issueMonth = rInt(1, 12);
          insertCert.run(
            randomUUID(), emp.id, certName, issuer,
            isoDate(issueYear, issueMonth, 15),
            isoDate(issueYear + 3, issueMonth, 15),
            `CRED-${rInt(100000,999999)}`, `https://certs.example.com/${rInt(10000,99999)}`,
            now, now
          );
          n++;
        }
      }
    }
    return n;
  });
  console.log(`  ✅ ${ins()} certifications`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 14. EMPLOYEE SKILLS
// ─────────────────────────────────────────────────────────────────────────────
const existingES = db.prepare('SELECT COUNT(*) as c FROM employee_skills').get().c;
if (existingES === 0) {
  console.log('📋 Seeding employee_skills...');
  const insertES = db.prepare(`INSERT OR IGNORE INTO employee_skills (id,employeeId,organizationId,skillName,category,proficiencyLevel,yearsOfExperience,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?)`);
  const skillsByDept = {
    'Engineering': { category: 'Technical', skills: ['JavaScript','TypeScript','React','Node.js','Python','PostgreSQL','Docker','Kubernetes','AWS','Git','REST APIs','GraphQL','Microservices','Redis'] },
    'Data Science': { category: 'Analytics', skills: ['Python','R','Machine Learning','TensorFlow','SQL','Tableau','Power BI','Spark','NLP','Deep Learning','Statistics'] },
    'Product Management': { category: 'Product', skills: ['Product Strategy','Roadmapping','User Research','Agile','Scrum','Jira','Figma','A/B Testing','Analytics','Stakeholder Management'] },
    'Sales & Marketing': { category: 'Sales', skills: ['CRM','Salesforce','HubSpot','Lead Generation','B2B Sales','Digital Marketing','SEO','Content Strategy','Negotiation'] },
    'Human Resources': { category: 'HR', skills: ['Recruitment','Onboarding','HRMS','Performance Management','Labour Law','Payroll','Employee Relations','L&D','Compensation & Benefits'] },
    'Finance & Operations': { category: 'Finance', skills: ['Financial Modeling','Excel','SAP','Tally','GST','Taxation','Budgeting','Cost Analysis','ERP','Internal Audit'] },
    'Design': { category: 'Design', skills: ['Figma','Adobe XD','Sketch','Illustrator','Photoshop','User Research','Prototyping','Design Systems','Wireframing'] },
    'Customer Success': { category: 'Customer Success', skills: ['Account Management','CRM','Product Training','Upselling','Customer Onboarding','NPS','Zendesk','Stakeholder Communication'] },
    'Legal & Compliance': { category: 'Legal', skills: ['Contract Drafting','Corporate Law','GDPR','Risk Assessment','Regulatory Compliance','Due Diligence','IP Law'] },
    'IT Infrastructure': { category: 'Infrastructure', skills: ['Linux','Networking','AWS','Azure','Security','ITIL','VMware','Active Directory','Monitoring','Backup & Recovery'] },
  };
  const proficiencies = ['BEGINNER','INTERMEDIATE','INTERMEDIATE','ADVANCED','EXPERT'];
  const ins = db.transaction(() => {
    let n = 0;
    for (const emp of allEmps) {
      const deptSkills = skillsByDept[emp.department] || skillsByDept['Engineering'];
      const count = rInt(3, 7);
      const selected = [...deptSkills.skills].sort(() => Math.random() - 0.5).slice(0, count);
      for (const skill of selected) {
        insertES.run(randomUUID(), emp.id, orgId, skill, deptSkills.category, rEl(proficiencies), rInt(1, 8), now, now);
        n++;
      }
    }
    return n;
  });
  console.log(`  ✅ ${ins()} employee skills`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 15. SKILLS (org-level skills table)
// ─────────────────────────────────────────────────────────────────────────────
const existingSkills = db.prepare('SELECT COUNT(*) as c FROM skills').get().c;
if (existingSkills === 0) {
  console.log('📋 Seeding skills (org table)...');
  const insertSk = db.prepare(`INSERT OR IGNORE INTO skills (id,employeeId,skillName,level,isTopSkill,isMissingSkill,department,team,organizationId,companyId,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`);
  const ins = db.transaction(() => {
    let n = 0;
    for (const emp of allEmps.slice(0, 300)) { // sample for org skills table
      const skill = rEl(['JavaScript','Python','React','SQL','AWS','Docker','Communication','Leadership','Excel','Figma']);
      const level = rInt(1, 5);
      insertSk.run(randomUUID(), emp.id, skill, level, level >= 4 ? 1 : 0, level <= 2 ? 1 : 0, emp.department, emp.team, orgId, companyId, now, now);
      n++;
    }
    return n;
  });
  console.log(`  ✅ ${ins()} org skills`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 16. EMPLOYEE DOCUMENTS
// ─────────────────────────────────────────────────────────────────────────────
const existingDocs = db.prepare('SELECT COUNT(*) as c FROM employee_documents').get().c;
if (existingDocs === 0) {
  console.log('📋 Seeding employee_documents...');
  const insertDoc = db.prepare(`INSERT OR IGNORE INTO employee_documents (id,employeeId,documentType,documentUrl,metadata,uploadedAt,uploadedBy,organizationId) VALUES (?,?,?,?,?,?,?,?)`);
  const docTypes = ['OFFER_LETTER','APPOINTMENT_LETTER','PAN_CARD','AADHAAR','BANK_PASSBOOK','EDUCATIONAL_CERTIFICATE','EXPERIENCE_LETTER','SALARY_SLIP'];
  const ins = db.transaction(() => {
    let n = 0;
    for (const emp of allEmps) {
      const docs = [...docTypes].sort(() => Math.random() - 0.5).slice(0, rInt(3, 6));
      for (const docType of docs) {
        insertDoc.run(
          randomUUID(), emp.id, docType,
          `https://docs.stackly.com/${emp.id}/${docType.toLowerCase()}.pdf`,
          JSON.stringify({ size: `${rInt(50,500)}KB`, verified: true }),
          now, hrId, orgId
        );
        n++;
      }
    }
    return n;
  });
  console.log(`  ✅ ${ins()} employee documents`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 17. EMPLOYEE STATUS HISTORY
// ─────────────────────────────────────────────────────────────────────────────
const existingSH = db.prepare('SELECT COUNT(*) as c FROM employee_status_history').get().c;
if (existingSH === 0) {
  console.log('📋 Seeding employee_status_history...');
  const insertSH = db.prepare(`INSERT OR IGNORE INTO employee_status_history (id,employeeId,status,effectiveDate,reason,organizationId) VALUES (?,?,?,?,?,?)`);
  const ins = db.transaction(() => {
    let n = 0;
    for (const emp of allEmps) {
      const joinDate = emp.joinDate || '2022-01-01';
      // Initial ACTIVE status on join
      insertSH.run(randomUUID(), emp.id, 'ACTIVE', joinDate, 'Joined organization', orgId);
      n++;
      // Some employees had status changes
      if (Math.random() < 0.15) {
        const changeDate = addDays(joinDate, rInt(180, 730));
        const newStatus = rEl(['ON_LEAVE','REMOTE']);
        insertSH.run(randomUUID(), emp.id, newStatus, changeDate, 'Status update', orgId);
        n++;
      }
    }
    return n;
  });
  console.log(`  ✅ ${ins()} status history records`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 18. EMPLOYEE HISTORY (field change audit)
// ─────────────────────────────────────────────────────────────────────────────
const existingEH = db.prepare('SELECT COUNT(*) as c FROM employee_history').get().c;
if (existingEH === 0) {
  console.log('📋 Seeding employee_history...');
  const insertEH = db.prepare(`INSERT OR IGNORE INTO employee_history (id,employeeId,fieldChanged,oldValue,newValue,changedBy,changedAt,organizationId) VALUES (?,?,?,?,?,?,?,?)`);
  const fields = [['designation','Software Engineer','Senior Software Engineer'],['location','Hyderabad','Bengaluru'],['department','Product Management','Engineering'],['team','Backend Team','Platform Team']];
  const ins = db.transaction(() => {
    let n = 0;
    for (const emp of allEmps) {
      if (Math.random() < 0.3) {
        const [field, oldVal, newVal] = rEl(fields);
        insertEH.run(randomUUID(), emp.id, field, oldVal, newVal, adminId, addDays(emp.joinDate || '2022-01-01', rInt(90, 500)), orgId);
        n++;
      }
    }
    return n;
  });
  console.log(`  ✅ ${ins()} history records`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 19. LIFECYCLE EVENTS
// ─────────────────────────────────────────────────────────────────────────────
const existingLE = db.prepare('SELECT COUNT(*) as c FROM lifecycle_events').get().c;
if (existingLE === 0) {
  console.log('📋 Seeding lifecycle_events...');
  const insertLE = db.prepare(`INSERT OR IGNORE INTO lifecycle_events (id,employeeId,eventType,effectiveDate,details,status,initiatedBy,approvedBy,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?)`);
  const events = ['ONBOARDING','PROMOTION','TRANSFER','CONFIRMATION','OFFBOARDING','ROLE_CHANGE'];
  const ins = db.transaction(() => {
    let n = 0;
    for (const emp of allEmps) {
      // All employees have ONBOARDING
      insertLE.run(randomUUID(), emp.id, 'ONBOARDING', emp.joinDate || '2022-01-01',
        JSON.stringify({ department: emp.department, designation: emp.designation, location: emp.location }),
        'COMPLETED', hrId, adminId, now, now);
      n++;
      // 30% have additional lifecycle events
      if (Math.random() < 0.30) {
        const evt = rEl(events.slice(1));
        const effectiveDate = addDays(emp.joinDate || '2022-01-01', rInt(180, 900));
        insertLE.run(randomUUID(), emp.id, evt, effectiveDate,
          JSON.stringify({ reason: 'Performance-based', approvedBy: 'Manager' }),
          'COMPLETED', hrId, adminId, now, now);
        n++;
      }
    }
    return n;
  });
  console.log(`  ✅ ${ins()} lifecycle events`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 20. SALARY STRUCTURES + COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
const existingSS = db.prepare('SELECT COUNT(*) as c FROM salary_structures').get().c;
if (existingSS === 0) {
  console.log('📋 Seeding salary_structures + salary_components...');
  const insertSS = db.prepare(`INSERT OR IGNORE INTO salary_structures (id,employeeId,baseSalary,currency,effectiveDate,organizationId) VALUES (?,?,?,?,?,?)`);
  const insertSC = db.prepare(`INSERT OR IGNORE INTO salary_components (id,salaryStructureId,componentName,type,amount) VALUES (?,?,?,?,?)`);
  
  const deptSalaryRange = {
    'Engineering': [600000, 2400000],
    'Data Science': [700000, 2200000],
    'Product Management': [800000, 2500000],
    'Design': [500000, 1600000],
    'Sales & Marketing': [400000, 1400000],
    'Human Resources': [400000, 1200000],
    'Customer Success': [400000, 1200000],
    'Finance & Operations': [500000, 1600000],
    'Legal & Compliance': [600000, 2000000],
    'IT Infrastructure': [500000, 1800000],
  };
  
  const ins = db.transaction(() => {
    let ssCount = 0, scCount = 0;
    for (const emp of allEmps) {
      const [minSal, maxSal] = deptSalaryRange[emp.department] || [400000, 1200000];
      const baseSalary = rInt(minSal, maxSal);
      const ssId = randomUUID();
      insertSS.run(ssId, emp.id, baseSalary, 'INR', emp.joinDate || '2022-01-01', orgId);
      ssCount++;
      
      // Salary components
      const basic = Math.round(baseSalary * 0.40);
      const hra = Math.round(baseSalary * 0.20);
      const transport = 19200;
      const medical = 15000;
      const pf = Math.round(basic * 0.12);
      const professional = 2400;
      
      const components = [
        ['Basic Pay', 'EARNING', basic],
        ['House Rent Allowance', 'EARNING', hra],
        ['Transport Allowance', 'EARNING', transport],
        ['Medical Allowance', 'EARNING', medical],
        ['Special Allowance', 'EARNING', baseSalary - basic - hra - transport - medical],
        ['Provident Fund', 'DEDUCTION', pf],
        ['Professional Tax', 'DEDUCTION', professional],
      ];
      for (const [name, type, amount] of components) {
        insertSC.run(randomUUID(), ssId, name, type, amount);
        scCount++;
      }
    }
    return { ssCount, scCount };
  });
  const result = ins();
  console.log(`  ✅ ${result.ssCount} salary structures, ${result.scCount} salary components`);
}

// Also update employee_salary_structures for any missing employees
const existingESS = db.prepare('SELECT COUNT(*) as c FROM employee_salary_structures').get().c;
if (existingESS < 500) {
  console.log('📋 Seeding employee_salary_structures...');
  const existing = new Set(db.prepare('SELECT employeeId FROM employee_salary_structures').all().map(r => r.employeeId));
  const ssMap = {};
  const ssRows = db.prepare('SELECT id, employeeId, baseSalary FROM salary_structures WHERE organizationId=?').all(orgId);
  ssRows.forEach(r => ssMap[r.employeeId] = r);
  
  const insertESS = db.prepare(`INSERT OR IGNORE INTO employee_salary_structures (id,employeeId,organizationId,salaryStructureId,annualCtc,monthlyGross,currency,effectiveFrom,effectiveTo,revisionReason,isActive,createdBy,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  const ins = db.transaction(() => {
    let n = 0;
    for (const emp of allEmps) {
      if (!existing.has(emp.id) && ssMap[emp.id]) {
        const ss = ssMap[emp.id];
        const annualCtc = ss.baseSalary;
        const monthlyGross = Math.round(annualCtc / 12);
        insertESS.run(randomUUID(), emp.id, orgId, ss.id, annualCtc, monthlyGross, 'INR', emp.joinDate || '2022-01-01', null, 'Initial', 1, adminId, now, now);
        n++;
      }
    }
    return n;
  });
  console.log(`  ✅ ${ins()} employee salary structures`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 21. PAYSLIPS (last 3 months)
// ─────────────────────────────────────────────────────────────────────────────
const existingPS = db.prepare('SELECT COUNT(*) as c FROM payslips').get().c;
if (existingPS === 0) {
  console.log('📋 Seeding payroll_runs + payslips + payroll_run_employees...');
  // Ensure payroll_runs exist
  const existingPR = db.prepare('SELECT COUNT(*) as c FROM payroll_runs').get().c;
  const payrollRunIds = [];
  if (existingPR === 0) {
    const insertPR = db.prepare(`INSERT OR IGNORE INTO payroll_runs (id,organizationId,periodStart,periodEnd,runDate,status) VALUES (?,?,?,?,?,?)`);
    const periods = [
      {id:'pr-2026-06', start:'2026-06-01', end:'2026-06-30', run:'2026-07-01'},
      {id:'pr-2026-07', start:'2026-07-01', end:'2026-07-31', run:'2026-08-01'},
      {id:'pr-2026-08', start:'2026-08-01', end:'2026-08-31', run:'2026-09-01'},
    ];
    for (const p of periods) {
      payrollRunIds.push(p.id);
      insertPR.run(p.id, orgId, p.start, p.end, p.run, 'PROCESSED');
    }
  } else {
    const prs = db.prepare('SELECT id FROM payroll_runs ORDER BY rowid DESC LIMIT 3').all();
    prs.forEach(r => payrollRunIds.push(r.id));
  }
  
  const ssMap2 = {};
  db.prepare('SELECT employeeId, baseSalary FROM salary_structures WHERE organizationId=?').all(orgId).forEach(r => ssMap2[r.employeeId] = r.baseSalary);
  
  const insertPS = db.prepare(`INSERT OR IGNORE INTO payslips (id,payrollRunId,employeeId,basicPay,totalEarnings,totalDeductions,netPay,lineItems,status) VALUES (?,?,?,?,?,?,?,?,?)`);
  const insertPRE = db.prepare(`INSERT OR IGNORE INTO payroll_run_employees (id,payrollRunId,employeeId,organizationId,annualCtc,basicPay,hra,specialAllowance,grossEarnings,employeePf,employerPf,professionalTax,tdsDeduction,totalDeductions,netPay,status,createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  
  const ins = db.transaction(() => {
    let psCount = 0, preCount = 0;
    for (const prId of payrollRunIds) {
      for (const emp of allEmps) {
        const annualCtc = ssMap2[emp.id] || rInt(480000, 2400000);
        const monthly = Math.round(annualCtc / 12);
        const basic = Math.round(monthly * 0.40);
        const hra = Math.round(monthly * 0.20);
        const special = monthly - basic - hra - Math.round(monthly * 0.065);
        const pf = Math.round(basic * 0.12);
        const pt = 200;
        const tds = Math.round(monthly * 0.05);
        const totalEarnings = basic + hra + special;
        const totalDeductions = pf + pt + tds;
        const netPay = totalEarnings - totalDeductions;
        const lineItems = JSON.stringify({ earnings: { basic, hra, special }, deductions: { pf, pt, tds } });
        insertPS.run(randomUUID(), prId, emp.id, basic, totalEarnings, totalDeductions, netPay, lineItems, 'PROCESSED');
        psCount++;
        insertPRE.run(randomUUID(), prId, emp.id, orgId, annualCtc, basic, hra, special, totalEarnings, pf, pf, pt, tds, totalDeductions, netPay, 'PROCESSED', now);
        preCount++;
      }
    }
    return { psCount, preCount };
  });
  const r = ins();
  console.log(`  ✅ ${r.psCount} payslips, ${r.preCount} payroll run employees`);
}


// ─────────────────────────────────────────────────────────────────────────────
// 22. PF/ESI RECORDS
// ─────────────────────────────────────────────────────────────────────────────
const existingPF = db.prepare('SELECT COUNT(*) as c FROM pf_esi_records').get().c;
if (existingPF === 0) {
  console.log('📋 Seeding pf_esi_records...');
  const payrollRunIds2 = db.prepare('SELECT id FROM payroll_runs ORDER BY rowid DESC LIMIT 3').all().map(r => r.id);
  const ssMap3 = {};
  db.prepare('SELECT employeeId, baseSalary FROM salary_structures WHERE organizationId=?').all(orgId).forEach(r => ssMap3[r.employeeId] = r.baseSalary);
  
  if (payrollRunIds2.length > 0) {
    const insertPF = db.prepare(`INSERT OR IGNORE INTO pf_esi_records (id,payrollRunId,employeeId,pfWage,pfEmployeeContribution,pfEmployerContribution,pfEpsContribution,esiWage,esiEmployeeContribution,esiEmployerContribution,ptDeduction,tdsDeduction) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`);
    const ins = db.transaction(() => {
      let n = 0;
      for (const prId of payrollRunIds2) {
        for (const emp of allEmps) {
          const annualCtc = ssMap3[emp.id] || 600000;
          const basic = Math.round(annualCtc / 12 * 0.40);
          const pfWage = Math.min(basic, 15000);
          const esiWage = Math.min(annualCtc / 12, 21000);
          insertPF.run(randomUUID(), prId, emp.id,
            pfWage, Math.round(pfWage * 0.12), Math.round(pfWage * 0.12), Math.round(pfWage * 0.0833),
            esiWage > 21000 ? 0 : esiWage, Math.round(esiWage * 0.0075), Math.round(esiWage * 0.0325),
            200, Math.round(annualCtc / 12 * 0.05)
          );
          n++;
        }
      }
      return n;
    });
    console.log(`  ✅ ${ins()} PF/ESI records`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 23. PERFORMANCE RECORDS
// ─────────────────────────────────────────────────────────────────────────────
const existingPR2 = db.prepare('SELECT COUNT(*) as c FROM performancerecords').get().c;
if (existingPR2 === 0) {
  console.log('📋 Seeding performancerecords...');
  const insertPerfR = db.prepare(`INSERT OR IGNORE INTO performancerecords (id,employeeId,quarter,kpiScore,targetScore,productivityScore,department,team,organizationId,companyId,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`);
  const quarters = ['Q1-2025','Q2-2025','Q3-2025','Q4-2025','Q1-2026'];
  const ins = db.transaction(() => {
    let n = 0;
    for (const emp of allEmps) {
      for (const q of quarters) {
        insertPerfR.run(
          randomUUID(), emp.id, q,
          rFloat(70, 100, 1), 100, rFloat(75, 100, 1),
          emp.department, emp.team, orgId, companyId, now, now
        );
        n++;
      }
    }
    return n;
  });
  console.log(`  ✅ ${ins()} performance records`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 24. REVIEWS
// ─────────────────────────────────────────────────────────────────────────────
const existingRev = db.prepare('SELECT COUNT(*) as c FROM reviews').get().c;
if (existingRev === 0) {
  console.log('📋 Seeding reviews...');
  const cycleId2 = cycleIds[0] || null;
  if (cycleId2) {
    const insertRev = db.prepare(`INSERT OR IGNORE INTO reviews (id,employeeId,reviewerId,performanceCycleId,rating,feedback,status,submittedAt) VALUES (?,?,?,?,?,?,?,?)`);
    const feedbacks = [
      'Excellent team player. Consistently delivers on time.','Shows strong leadership and ownership.','Good technical skills, continues to improve.','Exceeds expectations in most areas.','Meets requirements but can push further.','Outstanding dedication to quality.'
    ];
    const statuses = ['SUBMITTED','SUBMITTED','SUBMITTED','DRAFT','APPROVED'];
    const ins = db.transaction(() => {
      let n = 0;
      for (const emp of allEmps) {
        insertRev.run(randomUUID(), emp.id, mgrId, cycleId2, rFloat(2.5,5.0,1), rEl(feedbacks), rEl(statuses), now);
        n++;
      }
      return n;
    });
    console.log(`  ✅ ${ins()} reviews`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 25. GOALS
// ─────────────────────────────────────────────────────────────────────────────
const existingGoals = db.prepare('SELECT COUNT(*) as c FROM goals').get().c;
if (existingGoals === 0) {
  console.log('📋 Seeding goals...');
  const cycleId3 = cycleIds[0] || null;
  const insertGoal = db.prepare(`INSERT OR IGNORE INTO goals (id,employeeId,performanceCycleId,title,description,progress,status) VALUES (?,?,?,?,?,?,?)`);
  const goalTitles = {
    'Engineering': ['Complete Q3 feature delivery','Reduce production bug count by 30%','Achieve 95% test coverage','Complete system refactoring'],
    'Sales & Marketing': ['Achieve ₹2Cr Q3 ARR target','Onboard 10 new enterprise clients','Reduce sales cycle by 15%','Launch 3 marketing campaigns'],
    'Human Resources': ['Reduce time-to-hire by 20%','Improve eNPS score to 65+','Complete 1000 employee profiles','Launch L&D platform'],
    'Data Science': ['Ship 2 ML models to production','Reduce data pipeline latency 40%','Complete ETL migration','Launch BI dashboard'],
  };
  const defaultGoals = ['Complete Q3 KPIs','Improve team collaboration','Complete training program','Submit quarterly self-assessment'];
  const statuses = ['ON_TRACK','ON_TRACK','COMPLETED','AT_RISK','NOT_STARTED'];
  const ins = db.transaction(() => {
    let n = 0;
    for (const emp of allEmps) {
      const titles = goalTitles[emp.department] || defaultGoals;
      const count = rInt(2, 4);
      const selected = [...titles].sort(() => Math.random() - 0.5).slice(0, count);
      for (const title of selected) {
        const status = rEl(statuses);
        const progress = status === 'COMPLETED' ? 100 : status === 'NOT_STARTED' ? 0 : rInt(10, 90);
        insertGoal.run(randomUUID(), emp.id, cycleId3, title, `Goal for ${emp.name} in ${emp.department}`, progress, status);
        n++;
      }
    }
    return n;
  });
  console.log(`  ✅ ${ins()} goals`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 26. OKR OBJECTIVES + KEY RESULTS
// ─────────────────────────────────────────────────────────────────────────────
const existingOKR = db.prepare('SELECT COUNT(*) as c FROM okr_objectives').get().c;
if (existingOKR === 0) {
  console.log('📋 Seeding okr_objectives + okr_key_results...');
  const insertOKR = db.prepare(`INSERT OR IGNORE INTO okr_objectives (id,employeeId,title,description,category,quarter,year,progress,status,organizationId,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`);
  const insertKR = db.prepare(`INSERT OR IGNORE INTO okr_key_results (id,objectiveId,title,targetValue,currentValue,unit,weight,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?)`);
  const okrTitles = ['Improve Product Quality','Drive Revenue Growth','Enhance Customer Experience','Build Team Capabilities','Optimize Operations','Scale Infrastructure','Strengthen Security'];
  const krTemplates = [
    { title: 'Reduce bug count', targetValue: 50, unit: '%', currentValue: null },
    { title: 'Increase revenue', targetValue: 100, unit: '%', currentValue: null },
    { title: 'Improve NPS score', targetValue: 70, unit: 'points', currentValue: null },
    { title: 'Complete training modules', targetValue: 5, unit: 'modules', currentValue: null },
    { title: 'Reduce cost per hire', targetValue: 25, unit: '%', currentValue: null },
  ];
  const categories = ['TEAM','INDIVIDUAL','COMPANY','CROSS_FUNCTIONAL'];
  const quarters = ['Q3-2026','Q4-2026'];
  const statuses = ['ON_TRACK','AT_RISK','COMPLETED','NOT_STARTED'];
  const ins = db.transaction(() => {
    let objCount = 0, krCount = 0;
    for (const emp of allEmps.slice(0, 500)) { // 500 employees have OKRs
      const objId = randomUUID();
      const progress = rInt(0, 100);
      const status = progress === 100 ? 'COMPLETED' : progress < 20 ? 'NOT_STARTED' : rEl(statuses);
      insertOKR.run(objId, emp.id, rEl(okrTitles), `Drive key results for ${emp.department}`, rEl(categories), rEl(quarters), 2026, progress, status, orgId, now, now);
      objCount++;
      const krCount2 = rInt(2, 4);
      for (let k = 0; k < krCount2; k++) {
        const kr = rEl(krTemplates);
        const currentValue = Math.round(kr.targetValue * (progress / 100));
        insertKR.run(randomUUID(), objId, kr.title, kr.targetValue, currentValue, kr.unit, rFloat(0.25, 0.50, 2), now, now);
        krCount++;
      }
    }
    return { objCount, krCount };
  });
  const r = ins();
  console.log(`  ✅ ${r.objCount} objectives, ${r.krCount} key results`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 27. TAX DECLARATIONS + INVESTMENT DECLARATIONS
// ─────────────────────────────────────────────────────────────────────────────
const existingTD = db.prepare('SELECT COUNT(*) as c FROM tax_declarations').get().c;
if (existingTD === 0) {
  console.log('📋 Seeding tax_declarations...');
  const insertTD = db.prepare(`INSERT OR IGNORE INTO tax_declarations (id,employeeId,financialYear,regime,section80C,section80D,hraExemption,status,updatedAt) VALUES (?,?,?,?,?,?,?,?,?)`);
  const ins = db.transaction(() => {
    let n = 0;
    for (const emp of allEmps) {
      const regime = Math.random() < 0.65 ? 'new' : 'old';
      const s80c = regime === 'old' ? rInt(50000, 150000) : 0;
      const s80d = regime === 'old' ? rInt(10000, 25000) : 0;
      insertTD.run(randomUUID(), emp.id, '2025-26', regime, s80c, s80d, rInt(60000, 240000), 'SUBMITTED', now);
      n++;
    }
    return n;
  });
  console.log(`  ✅ ${ins()} tax declarations`);
}

const existingID = db.prepare('SELECT COUNT(*) as c FROM investment_declarations').get().c;
if (existingID === 0) {
  console.log('📋 Seeding investment_declarations...');
  const insertID = db.prepare(`INSERT OR IGNORE INTO investment_declarations (id,employeeId,financialYear,section,declaredAmount,actualAmount,proofDocumentId,status,createdAt) VALUES (?,?,?,?,?,?,?,?,?)`);
  const sections = ['80C','80D','HRA','LTA','NPS'];
  const ins = db.transaction(() => {
    let n = 0;
    for (const emp of allEmps) {
      const decCount = rInt(1, 4);
      for (let k = 0; k < decCount; k++) {
        const declared = rInt(10000, 150000);
        insertID.run(randomUUID(), emp.id, '2025-26', rEl(sections), declared, Math.round(declared * rFloat(0.8, 1.0)), null, rEl(['APPROVED','PENDING','SUBMITTED']), now);
        n++;
      }
    }
    return n;
  });
  console.log(`  ✅ ${ins()} investment declarations`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 28. SHIFT ASSIGNMENTS
// ─────────────────────────────────────────────────────────────────────────────
const existingSA = db.prepare('SELECT COUNT(*) as c FROM shift_assignments').get().c;
const shiftIds = db.prepare("SELECT id FROM shifts WHERE organizationId=?").all(orgId).map(r => r.id);
if (existingSA === 0 && shiftIds.length > 0) {
  console.log('📋 Seeding shift_assignments...');
  const insertSA = db.prepare(`INSERT OR IGNORE INTO shift_assignments (id,employeeId,shiftId,startDate,endDate,organizationId) VALUES (?,?,?,?,?,?)`);
  const ins = db.transaction(() => {
    let n = 0;
    for (const emp of allEmps) {
      const shiftId = rEl(shiftIds);
      insertSA.run(randomUUID(), emp.id, shiftId, emp.joinDate || '2022-01-01', null, orgId);
      n++;
    }
    return n;
  });
  console.log(`  ✅ ${ins()} shift assignments`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 29. WORK SCHEDULES
// ─────────────────────────────────────────────────────────────────────────────
const existingWS = db.prepare('SELECT COUNT(*) as c FROM work_schedules').get().c;
if (existingWS === 0) {
  console.log('📋 Seeding work_schedules...');
  const insertWS = db.prepare(`INSERT OR IGNORE INTO work_schedules (id,employeeId,dayOfWeek,startTime,endTime,organizationId) VALUES (?,?,?,?,?,?)`);
  // Mon-Fri = 1-5 in SQLite's strftime
  const workDays = [1, 2, 3, 4, 5];
  const ins = db.transaction(() => {
    let n = 0;
    for (const emp of allEmps.slice(0, 500)) { // 500 employees have explicit schedules
      for (const day of workDays) {
        insertWS.run(randomUUID(), emp.id, day, '09:00', '18:00', orgId);
        n++;
      }
    }
    return n;
  });
  console.log(`  ✅ ${ins()} work schedules`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 30. ATTENDANCE MONTHLY SUMMARY
// ─────────────────────────────────────────────────────────────────────────────
const existingAMS = db.prepare('SELECT COUNT(*) as c FROM attendance_monthly_summary').get().c;
if (existingAMS === 0) {
  console.log('📋 Seeding attendance_monthly_summary...');
  const insertAMS = db.prepare(`INSERT OR IGNORE INTO attendance_monthly_summary (id,organizationId,employeeId,month,presentDays,absentDays,lateDays,halfDays,lopDays,totalHours,overtimeHours,workingDays,status,computedAt,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  const months = ['2026-06','2026-07','2026-08','2026-09'];
  const ins = db.transaction(() => {
    let n = 0;
    for (const emp of allEmps) {
      for (const month of months) {
        const workingDays = 22;
        const presentDays = rInt(16, 22);
        const absentDays = rInt(0, 2);
        const lateDays = rInt(0, 3);
        const halfDays = rInt(0, 2);
        const lopDays = Math.max(0, workingDays - presentDays - absentDays - halfDays);
        const totalHours = presentDays * 8 + halfDays * 4 + rInt(0, 16);
        const overtimeHours = rInt(0, 12);
        insertAMS.run(randomUUID(), orgId, emp.id, month, presentDays, absentDays, lateDays, halfDays, lopDays, totalHours, overtimeHours, workingDays, 'COMPUTED', now, now, now);
        n++;
      }
    }
    return n;
  });
  console.log(`  ✅ ${ins()} attendance monthly summaries`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 31. TIMESHEETS + TIMESHEET ENTRIES
// ─────────────────────────────────────────────────────────────────────────────
const existingTS = db.prepare('SELECT COUNT(*) as c FROM timesheets').get().c;
if (existingTS === 0) {
  console.log('📋 Seeding timesheets + timesheet_entries...');
  const insertTS = db.prepare(`INSERT OR IGNORE INTO timesheets (id,employeeId,startDate,endDate,status,totalHours,organizationId,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?)`);
  const insertTE = db.prepare(`INSERT OR IGNORE INTO timesheet_entries (id,timesheetId,projectId,taskId,date,hours,description) VALUES (?,?,?,?,?,?,?)`);
  const projectIds = db.prepare('SELECT id FROM projects LIMIT 10').all().map(r => r.id);
  const fallbackProj = ['proj-web','proj-mobile','proj-backend','proj-infra','proj-data'];
  const projList = projectIds.length > 0 ? projectIds : fallbackProj;
  const tsStatuses = ['APPROVED','APPROVED','SUBMITTED','DRAFT'];
  const descriptions = ['Feature development','Bug fixes','Code review','Documentation','Testing','Deployment','Design review','Sprint planning','Retrospective'];
  
  const ins = db.transaction(() => {
    let tsCount = 0, teCount = 0;
    const months = [
      { start: '2026-07-01', end: '2026-07-31' },
      { start: '2026-08-01', end: '2026-08-31' },
      { start: '2026-09-01', end: '2026-09-23' },
    ];
    for (const emp of allEmps.slice(0, 600)) { // 600 employees have timesheets
      for (const { start, end } of months) {
        const totalHours = rInt(160, 200);
        const tsId = randomUUID();
        const status = rEl(tsStatuses);
        insertTS.run(tsId, emp.id, start, end, status, totalHours, orgId, now, now);
        tsCount++;
        // 5 timesheet entries per timesheet (weekly breakdown)
        const days = ['2026-07-07','2026-07-14','2026-07-21','2026-07-28','2026-08-04'];
        const weeks = start.startsWith('2026-07') ? ['2026-07-07','2026-07-14','2026-07-21','2026-07-28'] : start.startsWith('2026-08') ? ['2026-08-04','2026-08-11','2026-08-18','2026-08-25'] : ['2026-09-01','2026-09-08','2026-09-15','2026-09-22'];
        for (const d of weeks) {
          insertTE.run(randomUUID(), tsId, rEl(projList), null, d, rInt(35, 45), rEl(descriptions));
          teCount++;
        }
      }
    }
    return { tsCount, teCount };
  });
  const r = ins();
  console.log(`  ✅ ${r.tsCount} timesheets, ${r.teCount} timesheet entries`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 32. TRAINING ENROLLMENTS
// ─────────────────────────────────────────────────────────────────────────────
const existingTE2 = db.prepare('SELECT COUNT(*) as c FROM training_enrollments').get().c;
const courseIds = db.prepare('SELECT id, isMandatory FROM training_courses WHERE organizationId=? OR organizationId IS NULL').all(orgId);
if (existingTE2 === 0 && courseIds.length > 0) {
  console.log('📋 Seeding training_enrollments...');
  const insertTE2 = db.prepare(`INSERT OR IGNORE INTO training_enrollments (id,courseId,employeeId,enrolledBy,status,enrolledAt,completedAt,score,certUrl,expiresAt) VALUES (?,?,?,?,?,?,?,?,?,?)`);
  const enrollStatuses = ['COMPLETED','COMPLETED','COMPLETED','IN_PROGRESS','ENROLLED'];
  const ins = db.transaction(() => {
    let n = 0;
    for (const emp of allEmps) {
      // Mandatory courses - everyone enrolled
      for (const course of courseIds.filter(c => c.isMandatory)) {
        const status = rEl(enrollStatuses);
        const completedAt = status === 'COMPLETED' ? addDays(emp.joinDate || '2022-01-01', rInt(30, 120)) : null;
        const score = status === 'COMPLETED' ? rInt(70, 100) : null;
        insertTE2.run(randomUUID(), course.id, emp.id, hrId, status, now, completedAt, score, completedAt ? `https://certs.stackly.com/${emp.id}/${course.id}` : null, addDays(now, 365));
        n++;
      }
      // Optional courses - 60% enrolled in 1-2 more
      if (Math.random() < 0.60) {
        const optionals = courseIds.filter(c => !c.isMandatory);
        const count = rInt(1, Math.min(2, optionals.length));
        const selected = [...optionals].sort(() => Math.random() - 0.5).slice(0, count);
        for (const course of selected) {
          const status = rEl(enrollStatuses);
          const completedAt = status === 'COMPLETED' ? addDays(now, -rInt(30, 180)) : null;
          insertTE2.run(randomUUID(), course.id, emp.id, hrId, status, now, completedAt, status === 'COMPLETED' ? rInt(70, 100) : null, null, addDays(now, 365));
          n++;
        }
      }
    }
    return n;
  });
  console.log(`  ✅ ${ins()} training enrollments`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 33. JOB APPLICATIONS
// ─────────────────────────────────────────────────────────────────────────────
const existingJA = db.prepare('SELECT COUNT(*) as c FROM job_applications').get().c;
if (existingJA === 0) {
  console.log('📋 Seeding job_applications...');
  const insertJA = db.prepare(`INSERT OR IGNORE INTO job_applications (id,organizationId,applicantName,applicantEmail,positionId,status,resumeUrl,appliedAt,createdAt) VALUES (?,?,?,?,?,?,?,?,?)`);
  const positions = db.prepare('SELECT id, title FROM job_requisitions WHERE organizationId=? LIMIT 20').all(orgId);
  const appStatuses = ['APPLIED','SCREENING','INTERVIEW','OFFER','REJECTED','HIRED'];
  const firstNames = ['Aryan','Meera','Kiran','Rahul','Priya','Sanjay','Divya','Vikram','Sneha','Ankit','Shreya','Rohit'];
  const lastNames = ['Sharma','Gupta','Kumar','Singh','Patel','Reddy','Nair','Mehta','Shah','Joshi'];
  
  if (positions.length > 0) {
    const ins = db.transaction(() => {
      let n = 0;
      for (const pos of positions) {
        const appCount = rInt(5, 25);
        for (let i = 0; i < appCount; i++) {
          const fn = rEl(firstNames), ln = rEl(lastNames);
          const name = `${fn} ${ln}`;
          const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${rInt(1,99)}@gmail.com`;
          insertJA.run(randomUUID(), orgId, name, email, pos.id, rEl(appStatuses), `https://resumes.stackly.com/${rInt(10000,99999)}.pdf`, addDays(now, -rInt(1, 90)), now);
          n++;
        }
      }
      return n;
    });
    console.log(`  ✅ ${ins()} job applications`);
  } else {
    // No positions — seed some standalone applications
    const ins = db.transaction(() => {
      let n = 0;
      for (let i = 0; i < 150; i++) {
        const fn = rEl(firstNames), ln = rEl(lastNames);
        const name = `${fn} ${ln}`;
        const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${rInt(1,99)}@gmail.com`;
        insertJA.run(randomUUID(), orgId, name, email, null, rEl(appStatuses), `https://resumes.stackly.com/${rInt(10000,99999)}.pdf`, addDays(now, -rInt(1, 90)), now);
        n++;
      }
      return n;
    });
    console.log(`  ✅ ${ins()} job applications (standalone)`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 34. APPROVAL REQUESTS
// ─────────────────────────────────────────────────────────────────────────────
const existingAPR = db.prepare('SELECT COUNT(*) as c FROM approval_requests').get().c;
if (existingAPR === 0) {
  console.log('📋 Seeding approval_requests...');
  const workflows = db.prepare('SELECT id FROM workflows LIMIT 5').all().map(r => r.id);
  if (workflows.length > 0) {
    const insertAPR = db.prepare(`INSERT OR IGNORE INTO approval_requests (id,workflowId,entityId,requesterId,status,currentStepOrder,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?)`);
    const aprStatuses = ['APPROVED','APPROVED','PENDING','REJECTED'];
    const ins = db.transaction(() => {
      let n = 0;
      for (const emp of allEmps.slice(0, 300)) {
        if (Math.random() < 0.4) {
          insertAPR.run(randomUUID(), rEl(workflows), randomUUID(), emp.id, rEl(aprStatuses), 1, now, now);
          n++;
        }
      }
      return n;
    });
    console.log(`  ✅ ${ins()} approval requests`);
  } else {
    console.log('  ⚠️  No workflows found — skipping approval_requests');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// FINAL VERIFICATION
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n\n📊 Final verification:');
const verifyTables = [
  'appraisal_reviews','approval_requests','attendance_monthly_summary',
  'designations','employee_bank_details','employee_certifications',
  'employee_documents','employee_education','employee_emergency_contacts',
  'employee_experience','employee_history','employee_skills',
  'employee_status_history','employee_tax_info','goals',
  'investment_declarations','job_applications','job_levels',
  'leave_balances','leave_blackout_periods','leave_policies',
  'leave_requests','lifecycle_events','okr_objectives','okr_key_results',
  'payslips','performancerecords','pf_esi_records','reviews',
  'salary_components','salary_structures','employee_salary_structures',
  'shift_assignments','skills','tax_declarations',
  'timesheet_entries','timesheets','training_enrollments','work_schedules'
];
for (const t of verifyTables) {
  try {
    const c = db.prepare(`SELECT COUNT(*) as c FROM ${t}`).get().c;
    const icon = c > 0 ? '✅' : '⚠️ ';
    console.log(`  ${icon} ${t}: ${c} rows`);
  } catch(e) { console.log(`  ❌ ${t}: ${e.message}`); }
}

db.pragma('foreign_keys = ON');
db.close();
console.log('\n✅ Master Seed Complete!');

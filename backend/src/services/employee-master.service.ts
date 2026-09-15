import { query, execute } from '../database/sqlite-cloud.js';
import { v4 as uuidv4 } from 'uuid';

const now = () => new Date().toISOString();

// ─── Bank Details ─────────────────────────────────────────────────────────────

export const getBankDetails = async (employeeId: string, orgId: string) => {
  const rows = await query(
    `SELECT * FROM employee_bank_details WHERE employeeId=? AND organizationId=?`,
    [employeeId, orgId]
  );
  return rows[0] || null;
};

export const upsertBankDetails = async (employeeId: string, orgId: string, data: any) => {
  const existing = await getBankDetails(employeeId, orgId);
  const ts = now();
  if (existing) {
    await execute(
      `UPDATE employee_bank_details SET accountHolderName=?,accountNumber=?,ifscCode=?,bankName=?,branchName=?,accountType=?,updatedAt=? WHERE employeeId=? AND organizationId=?`,
      [data.accountHolderName, data.accountNumber, data.ifscCode, data.bankName,
       data.branchName||null, data.accountType||'SAVINGS', ts, employeeId, orgId]
    );
  } else {
    const id = uuidv4();
    await execute(
      `INSERT INTO employee_bank_details (id,employeeId,organizationId,accountHolderName,accountNumber,ifscCode,bankName,branchName,accountType,isPrimary,isVerified,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,1,0,?,?)`,
      [id, employeeId, orgId, data.accountHolderName, data.accountNumber, data.ifscCode,
       data.bankName, data.branchName||null, data.accountType||'SAVINGS', ts, ts]
    );
  }
  return getBankDetails(employeeId, orgId);
};

// ─── Tax Info ─────────────────────────────────────────────────────────────────

export const getTaxInfo = async (employeeId: string, orgId: string) => {
  const rows = await query(
    `SELECT * FROM employee_tax_info WHERE employeeId=? AND organizationId=?`,
    [employeeId, orgId]
  );
  return rows[0] || null;
};

export const upsertTaxInfo = async (employeeId: string, orgId: string, data: any) => {
  const existing = await getTaxInfo(employeeId, orgId);
  const ts = now();
  if (existing) {
    await execute(
      `UPDATE employee_tax_info SET panNumber=?,aadhaarReference=?,taxRegime=?,pfAccountNumber=?,esiNumber=?,ptExempt=?,ptExemptReason=?,financialYear=?,updatedAt=? WHERE employeeId=? AND organizationId=?`,
      [data.panNumber||null, data.aadhaarReference||null, data.taxRegime||'new',
       data.pfAccountNumber||null, data.esiNumber||null, data.ptExempt?1:0,
       data.ptExemptReason||null, data.financialYear||null, ts, employeeId, orgId]
    );
  } else {
    const id = uuidv4();
    await execute(
      `INSERT INTO employee_tax_info (id,employeeId,organizationId,panNumber,aadhaarReference,taxRegime,pfAccountNumber,esiNumber,ptExempt,ptExemptReason,financialYear,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [id, employeeId, orgId, data.panNumber||null, data.aadhaarReference||null,
       data.taxRegime||'new', data.pfAccountNumber||null, data.esiNumber||null,
       data.ptExempt?1:0, data.ptExemptReason||null, data.financialYear||null, ts, ts]
    );
  }
  return getTaxInfo(employeeId, orgId);
};

// ─── Emergency Contacts ───────────────────────────────────────────────────────

export const getEmergencyContacts = async (employeeId: string, orgId: string) =>
  query(`SELECT * FROM employee_emergency_contacts WHERE employeeId=? AND organizationId=? ORDER BY isPrimary DESC, name ASC`, [employeeId, orgId]);

export const addEmergencyContact = async (employeeId: string, orgId: string, data: any) => {
  const id = uuidv4(); const ts = now();
  await execute(
    `INSERT INTO employee_emergency_contacts (id,employeeId,organizationId,name,relationship,phone,alternatePhone,address,isPrimary,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    [id, employeeId, orgId, data.name, data.relationship, data.phone,
     data.alternatePhone||null, data.address||null, data.isPrimary?1:0, ts, ts]
  );
  const rows = await query(`SELECT * FROM employee_emergency_contacts WHERE id=?`, [id]);
  return rows[0];
};

export const updateEmergencyContact = async (id: string, orgId: string, data: any) => {
  await execute(
    `UPDATE employee_emergency_contacts SET name=?,relationship=?,phone=?,alternatePhone=?,address=?,isPrimary=?,updatedAt=? WHERE id=? AND organizationId=?`,
    [data.name, data.relationship, data.phone, data.alternatePhone||null,
     data.address||null, data.isPrimary?1:0, now(), id, orgId]
  );
  const rows = await query(`SELECT * FROM employee_emergency_contacts WHERE id=?`, [id]);
  return rows[0];
};

export const deleteEmergencyContact = async (id: string, orgId: string) =>
  execute(`DELETE FROM employee_emergency_contacts WHERE id=? AND organizationId=?`, [id, orgId]);

// ─── Skills ───────────────────────────────────────────────────────────────────

export const getSkills = async (employeeId: string, orgId: string) =>
  query(`SELECT * FROM employee_skills WHERE employeeId=? AND organizationId=? ORDER BY skillName ASC`, [employeeId, orgId]);

export const addSkill = async (employeeId: string, orgId: string, data: any) => {
  const id = uuidv4(); const ts = now();
  await execute(
    `INSERT INTO employee_skills (id,employeeId,organizationId,skillName,category,proficiencyLevel,yearsOfExperience,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?)`,
    [id, employeeId, orgId, data.skillName, data.category||null,
     data.proficiencyLevel||'INTERMEDIATE', data.yearsOfExperience||null, ts, ts]
  );
  const rows = await query(`SELECT * FROM employee_skills WHERE id=?`, [id]);
  return rows[0];
};

export const updateSkill = async (id: string, orgId: string, data: any) => {
  await execute(
    `UPDATE employee_skills SET skillName=?,category=?,proficiencyLevel=?,yearsOfExperience=?,updatedAt=? WHERE id=? AND organizationId=?`,
    [data.skillName, data.category||null, data.proficiencyLevel||'INTERMEDIATE', data.yearsOfExperience||null, now(), id, orgId]
  );
  const rows = await query(`SELECT * FROM employee_skills WHERE id=?`, [id]);
  return rows[0];
};

export const deleteSkill = async (id: string, orgId: string) =>
  execute(`DELETE FROM employee_skills WHERE id=? AND organizationId=?`, [id, orgId]);

// ─── Education ────────────────────────────────────────────────────────────────

export const getEducation = async (employeeId: string, orgId: string) =>
  query(`SELECT * FROM employee_education WHERE employeeId=? AND organizationId=? ORDER BY endYear DESC`, [employeeId, orgId]);

export const addEducation = async (employeeId: string, orgId: string, data: any) => {
  const id = uuidv4(); const ts = now();
  await execute(
    `INSERT INTO employee_education (id,employeeId,organizationId,degree,fieldOfStudy,institutionName,boardOrUniversity,startYear,endYear,grade,percentage,isPrimary,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [id, employeeId, orgId, data.degree, data.fieldOfStudy||null, data.institutionName,
     data.boardOrUniversity||null, data.startYear||null, data.endYear||null,
     data.grade||null, data.percentage||null, data.isPrimary?1:0, ts, ts]
  );
  const rows = await query(`SELECT * FROM employee_education WHERE id=?`, [id]);
  return rows[0];
};

export const updateEducation = async (id: string, orgId: string, data: any) => {
  await execute(
    `UPDATE employee_education SET degree=?,fieldOfStudy=?,institutionName=?,boardOrUniversity=?,startYear=?,endYear=?,grade=?,percentage=?,isPrimary=?,updatedAt=? WHERE id=? AND organizationId=?`,
    [data.degree, data.fieldOfStudy||null, data.institutionName, data.boardOrUniversity||null,
     data.startYear||null, data.endYear||null, data.grade||null, data.percentage||null,
     data.isPrimary?1:0, now(), id, orgId]
  );
  const rows = await query(`SELECT * FROM employee_education WHERE id=?`, [id]);
  return rows[0];
};

export const deleteEducation = async (id: string, orgId: string) =>
  execute(`DELETE FROM employee_education WHERE id=? AND organizationId=?`, [id, orgId]);

// ─── Experience ───────────────────────────────────────────────────────────────

export const getExperience = async (employeeId: string, orgId: string) =>
  query(`SELECT * FROM employee_experience WHERE employeeId=? AND organizationId=? ORDER BY startDate DESC`, [employeeId, orgId]);

export const addExperience = async (employeeId: string, orgId: string, data: any) => {
  const id = uuidv4(); const ts = now();
  await execute(
    `INSERT INTO employee_experience (id,employeeId,organizationId,companyName,designation,department,startDate,endDate,isCurrent,location,responsibilities,reasonForLeaving,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [id, employeeId, orgId, data.companyName, data.designation||null, data.department||null,
     data.startDate, data.endDate||null, data.isCurrent?1:0, data.location||null,
     data.responsibilities||null, data.reasonForLeaving||null, ts, ts]
  );
  const rows = await query(`SELECT * FROM employee_experience WHERE id=?`, [id]);
  return rows[0];
};

export const updateExperience = async (id: string, orgId: string, data: any) => {
  await execute(
    `UPDATE employee_experience SET companyName=?,designation=?,department=?,startDate=?,endDate=?,isCurrent=?,location=?,responsibilities=?,reasonForLeaving=?,updatedAt=? WHERE id=? AND organizationId=?`,
    [data.companyName, data.designation||null, data.department||null, data.startDate,
     data.endDate||null, data.isCurrent?1:0, data.location||null, data.responsibilities||null,
     data.reasonForLeaving||null, now(), id, orgId]
  );
  const rows = await query(`SELECT * FROM employee_experience WHERE id=?`, [id]);
  return rows[0];
};

export const deleteExperience = async (id: string, orgId: string) =>
  execute(`DELETE FROM employee_experience WHERE id=? AND organizationId=?`, [id, orgId]);

// ─── Full Employee Profile (aggregated) ───────────────────────────────────────

export const getFullEmployeeProfile = async (employeeId: string, orgId: string) => {
  const empRows = await query(
    `SELECT e.*,
       d.title as designationTitle, jl.name as jobLevelName,
       cc.name as costCenterName, l.name as locationName,
       mgr.name as managerName, tl.name as teamLeadName
     FROM employees e
     LEFT JOIN designations d ON e.designationId = d.id
     LEFT JOIN job_levels jl ON e.jobLevelId = jl.id
     LEFT JOIN cost_centers cc ON e.costCenterId = cc.id
     LEFT JOIN org_locations l ON e.locationId = l.id
     LEFT JOIN employees mgr ON e.manager = mgr.id
     LEFT JOIN employees tl ON e.teamLead = tl.id
     WHERE e.id=? AND e.organizationId=?`,
    [employeeId, orgId]
  );
  if (!empRows[0]) return null;

  const [bankDetails, taxInfo, emergencyContacts, skills, education, experience, documents, history] =
    await Promise.all([
      getBankDetails(employeeId, orgId),
      getTaxInfo(employeeId, orgId),
      getEmergencyContacts(employeeId, orgId),
      getSkills(employeeId, orgId),
      getEducation(employeeId, orgId),
      getExperience(employeeId, orgId),
      query(`SELECT * FROM employee_documents WHERE employeeId=? AND organizationId=? ORDER BY uploadedAt DESC`, [employeeId, orgId]),
      query(`SELECT * FROM employee_status_history WHERE employeeId=? AND organizationId=? ORDER BY effectiveDate DESC`, [employeeId, orgId]),
    ]);

  return {
    ...empRows[0],
    bankDetails,
    taxInfo,
    emergencyContacts,
    skills,
    education,
    experience,
    documents,
    statusHistory: history,
  };
};

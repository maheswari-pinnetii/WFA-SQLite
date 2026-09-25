import { query } from '../../database/sqlite-cloud.js';
import { logAudit } from '../../config/db.js';
import { handleControllerError } from '../../utils/errorHandler.js';

const getOrganizationId = (req: any): string => req.user?.organizationId || req.user?.companyId || 'org-stackly';

/**
 * Helper to convert an array of objects to CSV string
 */
function convertToCSV(data: Record<string, any>[]): string {
  if (!data || data.length === 0) return '';
  const headers = Object.keys(data[0]);
  const headerLine = headers.map(h => `"${h.replace(/"/g, '""')}"`).join(',');

  const lines = data.map(row => {
    return headers.map(header => {
      const val = row[header];
      if (val === null || val === undefined) return '""';
      const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
      return `"${str.replace(/"/g, '""')}"`;
    }).join(',');
  });

  return [headerLine, ...lines].join('\r\n');
}

/**
 * GET /api/v1/reports/attendance/export
 * Export attendance records for compliance and payroll in CSV or JSON format
 */
export const exportAttendanceReport = async (req: any, res: any) => {
  try {
    const orgId = getOrganizationId(req);
    const { role } = req.user;
    let userDept = req.user.department;
    let userTeam = req.user.team;

    if ((!userDept || !userTeam) && ['MANAGER', 'TEAM_LEAD'].includes(role)) {
      const [emp] = await query('SELECT department, team FROM employees WHERE id = ?', [req.user.id]) || [];
      if (emp) {
        userDept = userDept || emp.department;
        userTeam = userTeam || emp.team;
      }
    }

    const { startDate, endDate, department, team, status, format = 'csv' } = req.query;

    let sql = `
      SELECT 
        a.id as recordId,
        a.date,
        a.employeeId,
        COALESCE(a.employeeName, e.name, 'Unknown') as employeeName,
        COALESCE(a.department, e.department, 'General') as department,
        COALESCE(a.team, e.team, 'General') as team,
        a.status,
        COALESCE(a.workMode, 'OFFICE') as workMode,
        COALESCE(a.shiftType, 'REGULAR') as shiftType,
        a.checkInTime,
        a.checkOutTime,
        a.breaks
      FROM attendancerecords a
      LEFT JOIN employees e ON a.employeeId = e.id
      WHERE (a.organizationId = ? OR a.companyId = ?)
    `;
    const params: any[] = [orgId, orgId];

    // RBAC & Scoping constraints
    if (role === 'TEAM_LEAD') {
      sql += ` AND (a.department = ? OR e.department = ?) AND (a.team = ? OR e.team = ?)`;
      params.push(userDept, userDept, userTeam, userTeam);
    } else if (role === 'MANAGER') {
      sql += ` AND (a.department = ? OR e.department = ?)`;
      params.push(userDept, userDept);
    } else if (role === 'EMPLOYEE') {
      return res.status(403).json({ success: false, message: 'Forbidden: Employees cannot export administrative reports.' });
    }

    // Filter by date range
    if (startDate) {
      sql += ` AND a.date >= ?`;
      params.push(startDate);
    }
    if (endDate) {
      sql += ` AND a.date <= ?`;
      params.push(endDate);
    }

    // Additional optional filters for Admin/HR
    if (department && department !== 'ALL' && ['ADMIN', 'HR'].includes(role)) {
      sql += ` AND (a.department = ? OR e.department = ?)`;
      params.push(department, department);
    }
    if (team && team !== 'ALL' && ['ADMIN', 'HR', 'MANAGER'].includes(role)) {
      sql += ` AND (a.team = ? OR e.team = ?)`;
      params.push(team, team);
    }
    if (status && status !== 'ALL') {
      sql += ` AND a.status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY a.date DESC, a.checkInTime DESC LIMIT 5000`;

    const rawRecords = await query(sql, params) || [];

    // Format records for clean export
    const formattedRecords = rawRecords.map((r: any) => {
      let durationHours = '0.00';
      if (r.checkInTime && r.checkOutTime) {
        const start = new Date(r.checkInTime).getTime();
        const end = new Date(r.checkOutTime).getTime();
        if (!isNaN(start) && !isNaN(end) && end > start) {
          durationHours = ((end - start) / (1000 * 60 * 60)).toFixed(2);
        }
      }

      let breaksCount = 0;
      let breakMinutes = 0;
      if (r.breaks) {
        try {
          const parsed = typeof r.breaks === 'string' ? JSON.parse(r.breaks) : r.breaks;
          if (Array.isArray(parsed)) {
            breaksCount = parsed.length;
            parsed.forEach((b: any) => {
              if (b.startTime && b.endTime) {
                const s = new Date(b.startTime).getTime();
                const e = new Date(b.endTime).getTime();
                if (!isNaN(s) && !isNaN(e) && e > s) {
                  breakMinutes += Math.round((e - s) / (1000 * 60));
                }
              }
            });
          }
        } catch {
          // ignore break parse errors
        }
      }

      return {
        'Record ID': r.recordId,
        'Date': r.date,
        'Employee ID': r.employeeId,
        'Employee Name': r.employeeName,
        'Department': r.department,
        'Team': r.team,
        'Status': r.status,
        'Work Mode': r.workMode,
        'Shift': r.shiftType,
        'Check-In Time': r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString() : 'N/A',
        'Check-Out Time': r.checkOutTime ? new Date(r.checkOutTime).toLocaleTimeString() : 'N/A',
        'Total Hours': durationHours,
        'Breaks Count': breaksCount,
        'Total Break Minutes': breakMinutes
      };
    });

    logAudit(req.user.id, 'REPORT_EXPORTED', `Exported attendance report (${formattedRecords.length} records, format: ${format})`, orgId);

    const filenameDate = new Date().toISOString().slice(0, 10);
    if (String(format).toLowerCase() === 'json') {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="attendance_report_' + filenameDate + '.json"');
      return res.json({
        success: true,
        meta: {
          exportedAt: new Date().toISOString(),
          recordCount: formattedRecords.length,
          organizationId: orgId,
          generatedBy: req.user.id
        },
        data: formattedRecords
      });
    }

    // Default: CSV format
    const csvContent = convertToCSV(formattedRecords);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="attendance_report_' + filenameDate + '.csv"');
    return res.status(200).send(csvContent);
  } catch (err: any) {
    return handleControllerError(err, req, res, 'report.exportAttendanceReport', 500, 'Failed to export attendance report.');
  }
};

/**
 * GET /api/v1/reports/workforce/export
 * Export workforce directory and headcount roster in CSV or JSON format
 */
export const exportWorkforceReport = async (req: any, res: any) => {
  try {
    const orgId = getOrganizationId(req);
    const { role, department: userDept, team: userTeam } = req.user;
    const { department, team, status, format = 'csv' } = req.query;

    let sql = `
      SELECT 
        id,
        employeeCode,
        name,
        email,
        department,
        team,
        designation,
        status,
        location,
        joinDate
      FROM employees
      WHERE (organizationId = ? OR companyId = ?)
    `;
    const params: any[] = [orgId, orgId];

    // Scoping constraints
    if (role === 'TEAM_LEAD') {
      sql += ` AND department = ? AND team = ?`;
      params.push(userDept, userTeam);
    } else if (role === 'MANAGER') {
      sql += ` AND department = ?`;
      params.push(userDept);
    } else if (role === 'EMPLOYEE') {
      return res.status(403).json({ success: false, message: 'Forbidden: Employees cannot export workforce directory.' });
    }

    if (department && department !== 'ALL' && ['ADMIN', 'HR'].includes(role)) {
      sql += ` AND department = ?`;
      params.push(department);
    }
    if (team && team !== 'ALL' && ['ADMIN', 'HR', 'MANAGER'].includes(role)) {
      sql += ` AND team = ?`;
      params.push(team);
    }
    if (status && status !== 'ALL') {
      sql += ` AND status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY department ASC, name ASC LIMIT 5000`;

    const employees = await query(sql, params) || [];

    const formattedEmployees = employees.map((e: any) => ({
      'Employee ID': e.id,
      'Employee Code': e.employeeCode || e.id,
      'Full Name': e.name,
      'Email': e.email,
      'Department': e.department || 'General',
      'Team': e.team || 'General',
      'Designation': e.designation || 'Specialist',
      'Status': e.status || 'Active',
      'Office Location': e.location || 'HQ',
      'Joining Date': e.joinDate || 'N/A'
    }));

    logAudit(req.user.id, 'REPORT_EXPORTED', `Exported workforce directory report (${formattedEmployees.length} employees, format: ${format})`, orgId);

    const filenameDate = new Date().toISOString().slice(0, 10);
    if (String(format).toLowerCase() === 'json') {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="workforce_roster_' + filenameDate + '.json"');
      return res.json({
        success: true,
        meta: {
          exportedAt: new Date().toISOString(),
          recordCount: formattedEmployees.length,
          organizationId: orgId,
          generatedBy: req.user.id
        },
        data: formattedEmployees
      });
    }

    const csvContent = convertToCSV(formattedEmployees);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="workforce_roster_' + filenameDate + '.csv"');
    return res.status(200).send(csvContent);
  } catch (err: any) {
    return handleControllerError(err, req, res, 'report.exportWorkforceReport', 500, 'Failed to export workforce report.');
  }
};

/**
 * GET /api/v1/reports/leave/export
 * Export leave applications and compliance history in CSV or JSON format
 */
export const exportLeaveReport = async (req: any, res: any) => {
  try {
    const orgId = getOrganizationId(req);
    const { role, department: userDept, team: userTeam } = req.user;
    const { startDate, endDate, status, type, format = 'csv' } = req.query;

    let sql = `
      SELECT 
        l.id,
        l.employeeId,
        COALESCE(l.employeeName, e.name, 'Unknown') as employeeName,
        COALESCE(l.department, e.department, 'General') as department,
        COALESCE(l.team, e.team, 'General') as team,
        l.type as leaveType,
        l.startDate,
        l.endDate,
        l.status,
        l.reason,
        l.createdAt
      FROM leaverequests l
      LEFT JOIN employees e ON l.employeeId = e.id
      WHERE (l.organizationId = ? OR l.companyId = ?)
    `;
    const params: any[] = [orgId, orgId];

    if (role === 'TEAM_LEAD') {
      sql += ` AND (l.department = ? OR e.department = ?) AND (l.team = ? OR e.team = ?)`;
      params.push(userDept, userDept, userTeam, userTeam);
    } else if (role === 'MANAGER') {
      sql += ` AND (l.department = ? OR e.department = ?)`;
      params.push(userDept, userDept);
    } else if (role === 'EMPLOYEE') {
      return res.status(403).json({ success: false, message: 'Forbidden: Employees cannot export administrative leave reports.' });
    }

    if (startDate) {
      sql += ` AND l.startDate >= ?`;
      params.push(startDate);
    }
    if (endDate) {
      sql += ` AND l.endDate <= ?`;
      params.push(endDate);
    }
    if (status && status !== 'ALL') {
      sql += ` AND l.status = ?`;
      params.push(status);
    }
    if (type && type !== 'ALL') {
      sql += ` AND l.type = ?`;
      params.push(type);
    }

    sql += ` ORDER BY l.createdAt DESC LIMIT 5000`;

    const rawLeaves = await query(sql, params) || [];

    const formattedLeaves = rawLeaves.map((l: any) => {
      let durationDays = 1;
      if (l.startDate && l.endDate) {
        const start = new Date(l.startDate).getTime();
        const end = new Date(l.endDate).getTime();
        if (!isNaN(start) && !isNaN(end) && end >= start) {
          durationDays = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1);
        }
      }

      return {
        'Leave ID': l.id,
        'Employee ID': l.employeeId,
        'Employee Name': l.employeeName,
        'Department': l.department,
        'Team': l.team,
        'Leave Type': l.leaveType,
        'Start Date': l.startDate,
        'End Date': l.endDate,
        'Duration (Days)': durationDays,
        'Status': l.status,
        'Reason': l.reason || 'N/A',
        'Applied Date': l.createdAt ? l.createdAt.slice(0, 10) : 'N/A'
      };
    });

    logAudit(req.user.id, 'REPORT_EXPORTED', `Exported leave requests report (${formattedLeaves.length} records, format: ${format})`, orgId);

    const filenameDate = new Date().toISOString().slice(0, 10);
    if (String(format).toLowerCase() === 'json') {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="leave_report_' + filenameDate + '.json"');
      return res.json({
        success: true,
        meta: {
          exportedAt: new Date().toISOString(),
          recordCount: formattedLeaves.length,
          organizationId: orgId,
          generatedBy: req.user.id
        },
        data: formattedLeaves
      });
    }

    const csvContent = convertToCSV(formattedLeaves);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="leave_report_' + filenameDate + '.csv"');
    return res.status(200).send(csvContent);
  } catch (err: any) {
    console.error('EXPORT LEAVE ERROR:', err);
    return handleControllerError(err, req, res, 'report.exportLeaveReport', 500, 'Failed to export leave report.');
  }
};

/**
 * GET /api/v1/reports/payroll/export
 * Export payroll register in CSV or JSON format
 */
export const exportPayrollReport = async (req: any, res: any) => {
  try {
    const orgId = getOrganizationId(req);
    const { format = 'csv', month } = req.query;

    let sql = `
      SELECT 
        p.id,
        p.employeeId,
        e.employeeCode,
        e.name as employeeName,
        e.department,
        p.month,
        p.basicPay,
        p.hra,
        p.specialAllowance,
        p.grossEarnings,
        p.pfDeduction,
        p.esiDeduction,
        p.ptDeduction,
        p.tdsDeduction,
        p.totalDeductions,
        p.netPay,
        p.status
      FROM payslips p
      LEFT JOIN employees e ON p.employeeId = e.id
      WHERE (p.organizationId = ? OR p.companyId = ?)
    `;
    const params: any[] = [orgId, orgId];

    if (month) {
      sql += ` AND p.month = ?`;
      params.push(month);
    }

    sql += ` ORDER BY p.month DESC, e.name ASC LIMIT 5000`;

    const rawRecords = await query(sql, params) || [];

    const formattedRecords = rawRecords.map((r: any) => ({
      'Payslip ID': r.id,
      'Employee ID': r.employeeCode || r.employeeId,
      'Employee Name': r.employeeName || 'Unknown',
      'Department': r.department || 'General',
      'Month': r.month,
      'Basic Pay': r.basicPay || 0,
      'HRA': r.hra || 0,
      'Special Allowance': r.specialAllowance || 0,
      'Gross Earnings': r.grossEarnings || 0,
      'PF Deduction': r.pfDeduction || 0,
      'ESI Deduction': r.esiDeduction || 0,
      'PT Deduction': r.ptDeduction || 0,
      'TDS Deduction': r.tdsDeduction || 0,
      'Total Deductions': r.totalDeductions || 0,
      'Net Pay': r.netPay || 0,
      'Status': r.status || 'DRAFT'
    }));

    logAudit(req.user.id, 'REPORT_EXPORTED', `Exported payroll report (${formattedRecords.length} records, format: ${format})`, orgId);

    const filenameDate = new Date().toISOString().slice(0, 10);
    if (String(format).toLowerCase() === 'json') {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="payroll_report_' + filenameDate + '.json"');
      return res.json({
        success: true,
        meta: {
          exportedAt: new Date().toISOString(),
          recordCount: formattedRecords.length,
          organizationId: orgId,
          generatedBy: req.user.id
        },
        data: formattedRecords
      });
    }

    const csvContent = convertToCSV(formattedRecords);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="payroll_report_' + filenameDate + '.csv"');
    return res.status(200).send(csvContent);
  } catch (err: any) {
    return handleControllerError(err, req, res, 'report.exportPayrollReport', 500, 'Failed to export payroll report.');
  }
};

/**
 * GET /api/v1/reports/statutory/export
 * Export statutory compliance report in CSV or JSON format
 */
export const exportStatutoryReport = async (req: any, res: any) => {
  try {
    const orgId = getOrganizationId(req);
    const { format = 'csv', month } = req.query;

    let sql = `
      SELECT 
        p.employeeId,
        e.employeeCode,
        e.name as employeeName,
        e.pf_number as pfNumber,
        e.esi_number as esiNumber,
        e.pan_reference as panReference,
        p.month,
        p.basicPay,
        p.grossEarnings,
        p.pfDeduction as employeePF,
        p.pfDeduction as employerPF,
        p.esiDeduction as employeeESI,
        (p.esiDeduction * 3.25 / 0.75) as employerESI,
        p.ptDeduction,
        p.tdsDeduction
      FROM payslips p
      LEFT JOIN employees e ON p.employeeId = e.id
      WHERE (p.organizationId = ? OR p.companyId = ?)
    `;
    const params: any[] = [orgId, orgId];

    if (month) {
      sql += ` AND p.month = ?`;
      params.push(month);
    }

    sql += ` ORDER BY p.month DESC, e.name ASC LIMIT 5000`;

    const rawRecords = await query(sql, params) || [];

    const formattedRecords = rawRecords.map((r: any) => ({
      'Employee Code': r.employeeCode || r.employeeId,
      'Employee Name': r.employeeName || 'Unknown',
      'PAN': r.panReference || 'N/A',
      'PF Number': r.pfNumber || 'N/A',
      'ESI Number': r.esiNumber || 'N/A',
      'Month': r.month,
      'Gross Wage': r.grossEarnings || 0,
      'PF Wage': r.basicPay || 0,
      'Employee PF (12%)': r.employeePF || 0,
      'Employer PF (12%)': r.employerPF || 0,
      'Employee ESI (0.75%)': r.employeeESI ? Math.round(r.employeeESI) : 0,
      'Employer ESI (3.25%)': r.employerESI ? Math.round(r.employerESI) : 0,
      'Professional Tax': r.ptDeduction || 0,
      'TDS Deducted': r.tdsDeduction || 0
    }));

    logAudit(req.user.id, 'REPORT_EXPORTED', `Exported statutory report (${formattedRecords.length} records, format: ${format})`, orgId);

    const filenameDate = new Date().toISOString().slice(0, 10);
    if (String(format).toLowerCase() === 'json') {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="statutory_report_' + filenameDate + '.json"');
      return res.json({
        success: true,
        meta: {
          exportedAt: new Date().toISOString(),
          recordCount: formattedRecords.length,
          organizationId: orgId,
          generatedBy: req.user.id
        },
        data: formattedRecords
      });
    }

    const csvContent = convertToCSV(formattedRecords);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="statutory_report_' + filenameDate + '.csv"');
    return res.status(200).send(csvContent);
  } catch (err: any) {
    return handleControllerError(err, req, res, 'report.exportStatutoryReport', 500, 'Failed to export statutory report.');
  }
};

/**
 * GET /api/v1/reports/metrics
 * Report catalog and live count statistics
 */
export const getReportMetrics = async (req: any, res: any) => {
  try {
    const orgId = getOrganizationId(req);
    const [attCount] = await query('SELECT COUNT(*) as count FROM attendancerecords WHERE organizationId = ? OR companyId = ?', [orgId, orgId]) || [{ count: 0 }];
    const [empCount] = await query('SELECT COUNT(*) as count FROM employees WHERE organizationId = ? OR companyId = ?', [orgId, orgId]) || [{ count: 0 }];
    const [leaveCount] = await query('SELECT COUNT(*) as count FROM leaverequests WHERE organizationId = ? OR companyId = ?', [orgId, orgId]) || [{ count: 0 }];

    return res.json({
      success: true,
      data: {
        availableReports: [
          { id: 'attendance', name: 'Attendance & Work Hours Audit', totalRecords: attCount?.count || 0, formats: ['csv', 'json'] },
          { id: 'workforce', name: 'Workforce Roster & Headcount Directory', totalRecords: empCount?.count || 0, formats: ['csv', 'json'] },
          { id: 'leave', name: 'Leave Applications & Absences', totalRecords: leaveCount?.count || 0, formats: ['csv', 'json'] }
        ],
        lastGeneratedAt: new Date().toISOString()
      }
    });
  } catch (err: any) {
    return handleControllerError(err, req, res, 'report.getReportMetrics', 500, 'Failed to retrieve report metrics.');
  }
};

/**
 * GET /api/v1/reports/placement/export
 */
export const exportPlacementReport = async (req: any, res: any) => {
  try {
    const orgId = getOrganizationId(req);
    const { format = 'csv' } = req.query;

    const sql = `SELECT * FROM placements WHERE organizationId = ?`;
    const records = await query(sql, [orgId]) || [];

    const formattedRecords = records.map((r: any) => ({
      id: r.id,
      employeeId: r.employeeId,
      employerId: r.employerId,
      role: r.role,
      status: r.status,
      startDate: r.startDate,
      endDate: r.endDate,
      feedbackScore: r.feedbackScore,
      skillsMatched: r.skillsMatched,
      contractValue: r.contractValue
    }));

    await logAudit(
      req.user.id,
      'EXPORT_PLACEMENT',
      `Exported ${formattedRecords.length} placement records as ${format}`,
      orgId
    );

    if (format === 'json') {
      return res.json({ success: true, data: formattedRecords });
    }

    const csvContent = convertToCSV(formattedRecords);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="placement_report.csv"');
    return res.status(200).send(csvContent);
  } catch (err: any) {
    return handleControllerError(err, req, res, 'report.exportPlacementReport', 500, 'Failed to export placement report.');
  }
};

/**
 * GET /api/v1/reports/recruitment/export
 */
export const exportRecruitmentReport = async (req: any, res: any) => {
  try {
    const orgId = getOrganizationId(req);
    const { format = 'csv' } = req.query;

    const sql = `SELECT * FROM job_applications WHERE organizationId = ?`;
    const records = await query(sql, [orgId]) || [];

    const formattedRecords = records.map((r: any) => ({
      id: r.id,
      positionId: r.positionId,
      applicantId: r.applicantId,
      status: r.status,
      score: r.score,
      createdAt: r.createdAt
    }));

    await logAudit(
      req.user.id,
      'EXPORT_RECRUITMENT',
      `Exported ${formattedRecords.length} recruitment records as ${format}`,
      orgId
    );

    if (format === 'json') {
      return res.json({ success: true, data: formattedRecords });
    }

    const csvContent = convertToCSV(formattedRecords);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="recruitment_report.csv"');
    return res.status(200).send(csvContent);
  } catch (err: any) {
    return handleControllerError(err, req, res, 'report.exportRecruitmentReport', 500, 'Failed to export recruitment report.');
  }
};

/**
 * GET /api/v1/reports/learning/export
 */
export const exportLearningReport = async (req: any, res: any) => {
  try {
    const orgId = getOrganizationId(req);
    const { format = 'csv' } = req.query;

    const sql = `SELECT * FROM training_enrollments WHERE organizationId = ?`;
    const records = await query(sql, [orgId]) || [];

    const formattedRecords = records.map((r: any) => ({
      id: r.id,
      employeeId: r.employeeId,
      courseId: r.courseId,
      courseName: r.courseName,
      status: r.status,
      score: r.score,
      enrolledAt: r.enrolledAt,
      completedAt: r.completedAt,
      trainingHours: r.trainingHours
    }));

    await logAudit(
      req.user.id,
      'EXPORT_LEARNING',
      `Exported ${formattedRecords.length} learning records as ${format}`,
      orgId
    );

    if (format === 'json') {
      return res.json({ success: true, data: formattedRecords });
    }

    const csvContent = convertToCSV(formattedRecords);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="learning_report.csv"');
    return res.status(200).send(csvContent);
  } catch (err: any) {
    return handleControllerError(err, req, res, 'report.exportLearningReport', 500, 'Failed to export learning report.');
  }
};

/**
 * GET /api/v1/reports/performance/export
 */
export const exportPerformanceReport = async (req: any, res: any) => {
  try {
    const orgId = getOrganizationId(req);
    const { format = 'csv' } = req.query;
    
    // We export a summary for now
    const sql = `SELECT * FROM employees WHERE organizationId = ?`;
    const records = await query(sql, [orgId]) || [];
    
    const formattedRecords = records.map((r: any) => ({
      id: r.id,
      name: r.name,
      department: r.department,
      role: r.role,
      performanceScore: r.performanceScore || 0,
      potential: (r.performanceScore || 0) >= 85 ? 'High' : ((r.performanceScore || 0) >= 70 ? 'Core' : 'Low')
    }));

    await logAudit(
      req.user.id,
      'EXPORT_PERFORMANCE',
      `Exported ${formattedRecords.length} performance records as ${format}`,
      orgId
    );

    if (format === 'json') return res.json({ success: true, data: formattedRecords });
    
    const csvContent = convertToCSV(formattedRecords);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="performance_report.csv"');
    return res.status(200).send(csvContent);
  } catch (err: any) {
    return handleControllerError(err, req, res, 'report.exportPerformance', 500, 'Failed to export performance report.');
  }
};

/**
 * GET /api/v1/reports/attrition-risk/export
 */
export const exportAttritionRiskReport = async (req: any, res: any) => {
  try {
    const orgId = getOrganizationId(req);
    const { format = 'csv' } = req.query;
    
    const records = await query(`SELECT * FROM employees WHERE organizationId = ? AND status = 'ACTIVE'`, [orgId]) || [];
    const formattedRecords = records.map((r: any) => ({
      id: r.id,
      name: r.name,
      department: r.department,
      role: r.role,
      performanceScore: r.performanceScore,
      attendanceRate: r.attendanceRate
    }));

    await logAudit(
      req.user.id,
      'EXPORT_ATTRITION_RISK',
      `Exported ${formattedRecords.length} attrition risk records as ${format}`,
      orgId
    );

    if (format === 'json') return res.json({ success: true, data: formattedRecords });
    
    const csvContent = convertToCSV(formattedRecords);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="attrition_risk_report.csv"');
    return res.status(200).send(csvContent);
  } catch (err: any) {
    return handleControllerError(err, req, res, 'report.exportAttrition', 500, 'Failed to export attrition report.');
  }
};

/**
 * GET /api/v1/reports/demand-forecast/export
 */
export const exportDemandForecastReport = async (req: any, res: any) => {
  try {
    const orgId = getOrganizationId(req);
    const { format = 'csv' } = req.query;
    
    const records = await query(`SELECT department, COUNT(*) as headcount FROM employees WHERE organizationId = ? AND status = 'ACTIVE' GROUP BY department`, [orgId]) || [];
    const formattedRecords = records.map((r: any) => ({
      department: r.department,
      currentHeadcount: r.headcount,
      projectedGrowth: Math.round(r.headcount * 0.15),
      targetHeadcount: Math.round(r.headcount * 1.15)
    }));

    await logAudit(
      req.user.id,
      'EXPORT_DEMAND_FORECAST',
      `Exported demand forecast records as ${format}`,
      orgId
    );

    if (format === 'json') return res.json({ success: true, data: formattedRecords });
    
    const csvContent = convertToCSV(formattedRecords);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="demand_forecast_report.csv"');
    return res.status(200).send(csvContent);
  } catch (err: any) {
    return handleControllerError(err, req, res, 'report.exportDemand', 500, 'Failed to export demand report.');
  }
};

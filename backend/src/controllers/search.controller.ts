import { Request, Response } from 'express';
import { query } from '../database/sqlite-cloud.js';
import { logger } from '../config/logger.js';

export const globalSearch = async (req: Request, res: Response) => {
  try {
    const searchQuery = (req.query.q as string) || '';
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!searchQuery || searchQuery.trim().length < 2) {
      return res.status(200).json({ success: true, data: [] });
    }

    const term = `%${searchQuery.trim()}%`;
    const results: any[] = [];

    // 1. Search Employees (Directory)
    // Admins see everyone, Managers see their team (plus maybe a public directory), Employees see a limited public directory
    let employeeSql = `
      SELECT id, name, email, designation, department, location 
      FROM employees 
      WHERE (name LIKE ? OR email LIKE ? OR designation LIKE ? OR department LIKE ?)
    `;
    const employeeParams: any[] = [term, term, term, term];

    if (userRole === 'Employee') {
      employeeSql += ` AND status = 'Active'`;
    }

    const employees = await query(employeeSql, employeeParams);
    
    employees.forEach(emp => {
      results.push({
        id: `emp_${emp.id}`,
        type: 'EMPLOYEE',
        title: emp.name,
        subtitle: `${emp.designation} • ${emp.department}`,
        link: `/employee-details/${emp.id}`,
        metadata: { email: emp.email, location: emp.location }
      });
    });

    // 2. Search Navigation Pages (Static mapping)
    const pages = [
      { title: 'Dashboard', link: '/dashboard', keywords: ['home', 'dashboard', 'start'] },
      { title: 'Employee Directory', link: '/employees/all', keywords: ['directory', 'employees', 'people', 'team'] },
      { title: 'Payroll', link: '/payroll', keywords: ['salary', 'payroll', 'payslips', 'compensation'] },
      { title: 'Leave Management', link: '/leave', keywords: ['leave', 'time off', 'vacation', 'holiday'] },
      { title: 'Attendance', link: '/attendance', keywords: ['time', 'attendance', 'clock', 'shifts'] },
      { title: 'Approvals Desk', link: '/approvals', keywords: ['approve', 'workflow', 'pending', 'requests'] },
      { title: 'My Expenses', link: '/my-expenses', keywords: ['expense', 'reimbursement', 'claims'] },
    ];

    pages.forEach(p => {
      const match = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    p.keywords.some(k => k.includes(searchQuery.toLowerCase()));
      if (match) {
        results.push({
          id: `page_${p.link}`,
          type: 'PAGE',
          title: p.title,
          subtitle: 'Navigation',
          link: p.link
        });
      }
    });

    // 3. Search Pending Workflows (If Manager/Admin)
    if (userRole !== 'Employee') {
      const workflows = await query(
        `SELECT r.id, w.entityType, e.name as requesterName
         FROM approval_requests r
         JOIN approval_workflows w ON r.workflowId = w.id
         JOIN employees e ON r.requesterId = e.id
         WHERE r.status = 'PENDING_APPROVAL' 
         AND (w.entityType LIKE ? OR e.name LIKE ?)
         LIMIT 5`,
        [term, term]
      );

      workflows.forEach(w => {
        results.push({
          id: `wf_${w.id}`,
          type: 'WORKFLOW',
          title: `Pending ${w.entityType} Request`,
          subtitle: `From ${w.requesterName}`,
          link: `/approvals`
        });
      });
    }

    return res.status(200).json({
      success: true,
      data: results
    });

  } catch (error: any) {
    logger.error(`[Search] Error in global search: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Failed to perform search' });
  }
};

import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

/**
 * Validates if the user has the required roles for exporting sensitive analytics.
 */
export function authorizeExport(req: any) {
  const allowedRoles = ['ADMIN', 'HR_MANAGER', 'EXECUTIVE'];
  // Allow DEPARTMENT_MANAGER or TEAM_LEAD if the data is strictly scoped,
  // but for raw dumps, typically higher privileges are checked.
  // We'll allow them here but the controller MUST apply scopeQuery.
  const allValidRoles = ['ADMIN', 'HR_MANAGER', 'EXECUTIVE', 'MANAGER', 'DEPARTMENT_MANAGER', 'TEAM_LEAD'];
  if (!allValidRoles.includes(req.user?.role)) {
    throw new Error('Unauthorized: Insufficient permissions to export analytics reports.');
  }
}

/**
 * Returns a scope query and parameters based on the user's role.
 */
export function getExportScope(reqUser: any, employeeIdCol = 'employeeId'): { query: string, params: any[] } {
  const role = reqUser?.role;
  if (role === 'TEAM_LEAD') {
    return { query: 'AND team = ?', params: [reqUser?.team] };
  } else if (role === 'MANAGER' || role === 'DEPARTMENT_MANAGER') {
    return { query: 'AND department = ?', params: [reqUser?.department] };
  } else if (role === 'EMPLOYEE') {
    return { query: `AND ${employeeIdCol} = ?`, params: [reqUser?.id] };
  }
  return { query: '', params: [] };
}

/**
 * Converts an array of objects to a CSV string.
 */
export function convertToCSV(data: Record<string, any>[]): string {
  if (!data || data.length === 0) return '';
  const headers = Object.keys(data[0]);
  const csvRows = [];
  csvRows.push(headers.join(','));

  for (const row of data) {
    const values = headers.map(header => {
      const val = row[header];
      if (val === null || val === undefined) return '""';
      const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
      return `"${str.replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  }
  return csvRows.join('\n');
}

/**
 * Handles formatting and sending the report in the requested format (json, csv, xlsx, pdf).
 */
export async function sendExport(res: any, format: string, filenameBase: string, data: Record<string, any>[]) {
  const fmt = String(format).toLowerCase();
  
  if (fmt === 'json') {
    return res.json({ success: true, recordCount: data.length, data });
  }

  if (fmt === 'xlsx') {
    if (!data || data.length === 0) {
      return res.status(404).send('No data available to export.');
    }
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(filenameBase);
    const headers = Object.keys(data[0]).map(key => ({ header: key, key, width: 20 }));
    sheet.columns = headers;
    sheet.addRows(data);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filenameBase}.xlsx"`);
    await workbook.xlsx.write(res);
    return res.end();
  }

  if (fmt === 'pdf') {
    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filenameBase}.pdf"`);
    doc.pipe(res);

    doc.fontSize(20).text(`${filenameBase} Report`, { align: 'center' });
    doc.moveDown();
    
    data.forEach((record: any, index: number) => {
      doc.fontSize(12).text(`Record ${index + 1}:`, { underline: true });
      Object.entries(record).forEach(([key, value]) => {
        const valStr = typeof value === 'object' ? JSON.stringify(value) : String(value);
        doc.fontSize(10).text(`${key}: ${valStr}`);
      });
      doc.moveDown();
    });
    
    doc.end();
    return;
  }

  // Default to CSV
  const csvContent = convertToCSV(data);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filenameBase}.csv"`);
  return res.status(200).send(csvContent);
}

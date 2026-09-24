const fs = require('fs');
const code = `
export const exportTallyVouchers = async (req: Request, res: Response) => {
  try {
    const runId = req.params.runId;
    const xml = await payrollService.generateTallyXML(runId);
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Content-Disposition', \`attachment; filename="payroll_vouchers_\${runId}.xml"\`);
    return res.send(xml);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
`;
fs.appendFileSync('backend/src/controllers/payroll.controller.ts', code);

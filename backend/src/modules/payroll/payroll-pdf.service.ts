import { query } from '../../database/sqlite-cloud.js';
import { TaxCalculationService } from './tax-calculation.service.js';

export class PayrollPdfService {
  /**
   * Generates formatted HTML string for Payslip PDF rendering / printing
   */
  static async generatePayslipHtml(payslipId: string): Promise<string> {
    const payslip = await query(
      `SELECT p.*, r.periodStart, r.periodEnd, r.month, r.year, e.name as employeeName, e.employeeCode, e.department, e.designation, e.panReference, e.pfAccountNumber, e.bankAccountNumber, e.ifscCode
       FROM payslips p
       JOIN payroll_runs r ON p.payrollRunId = r.id
       JOIN employees e ON p.employeeId = e.id
       WHERE p.id = ?`,
      [payslipId]
    ).then(res => res[0]);

    if (!payslip) throw new Error('Payslip not found');

    let lineItems: any[] = [];
    try {
      lineItems = JSON.parse(payslip.lineItems || '[]');
    } catch (e) {}

    const earnings = lineItems.filter(i => i.category === 'EARNING' || i.type === 'EARNING');
    const deductions = lineItems.filter(i => i.category === 'DEDUCTION' || i.category === 'STATUTORY_EMPLOYEE' || i.category === 'TAX' || i.type === 'DEDUCTION');
    const reimbursements = lineItems.filter(i => i.category === 'REIMBURSEMENT');

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const monthLabel = payslip.month ? monthNames[payslip.month - 1] : '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Payslip - ${payslip.employeeName} - ${monthLabel} ${payslip.year}</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; margin: 0; padding: 30px; background: #ffffff; }
          .payslip-container { border: 2px solid #e2e8f0; border-radius: 12px; padding: 30px; max-width: 800px; margin: 0 auto; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f766e; padding-bottom: 15px; margin-bottom: 25px; }
          .logo { font-size: 24px; font-weight: 800; color: #0f766e; letter-spacing: -0.5px; }
          .company-info { text-align: right; font-size: 12px; color: #64748b; }
          .payslip-title { text-align: center; font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 1px; }
          .emp-details { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 25px; font-size: 13px; }
          .emp-details div span { color: #64748b; font-weight: 500; display: inline-block; width: 140px; }
          .emp-details div strong { color: #0f172a; }
          .table-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; }
          th { background: #f1f5f9; text-align: left; padding: 10px; font-weight: 600; color: #334155; border-bottom: 2px solid #cbd5e1; uppercase; font-size: 11px; }
          td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
          .amount { text-align: right; font-family: monospace; font-weight: 600; }
          .net-pay-box { background: #ecfdf5; border: 2px dashed #059669; padding: 20px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center; margin-top: 20px; }
          .net-pay-title { font-size: 16px; font-weight: 700; color: #065f46; }
          .net-pay-amount { font-size: 24px; font-weight: 800; color: #047857; font-family: monospace; }
          .footer { text-align: center; font-size: 11px; color: #94a3b8; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 15px; }
        </style>
      </head>
      <body>
        <div class="payslip-container">
          <div class="header">
            <div>
              <div class="logo">STACKLY ENTERPRISE</div>
              <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Human Capital Management</div>
            </div>
            <div class="company-info">
              <strong>Stackly Pvt Ltd</strong><br>
              Tech Park, Whitefield, Bengaluru<br>
              Karnataka - 560066, India
            </div>
          </div>

          <div class="payslip-title">Payslip for ${monthLabel} ${payslip.year}</div>

          <div class="emp-details">
            <div><span>Employee Name:</span> <strong>${payslip.employeeName}</strong></div>
            <div><span>Employee ID:</span> <strong>${payslip.employeeCode || payslip.employeeId}</strong></div>
            <div><span>Department:</span> <strong>${payslip.department || 'General'}</strong></div>
            <div><span>Designation:</span> <strong>${payslip.designation || 'Specialist'}</strong></div>
            <div><span>PAN Number:</span> <strong>${payslip.panReference || 'N/A'}</strong></div>
            <div><span>PF Account:</span> <strong>${payslip.pfAccountNumber || 'N/A'}</strong></div>
            <div><span>Bank Account:</span> <strong>${payslip.bankAccountNumber ? '•••• ' + payslip.bankAccountNumber.slice(-4) : 'Direct Deposit'}</strong></div>
            <div><span>Pay Period:</span> <strong>${payslip.periodStart} to ${payslip.periodEnd}</strong></div>
          </div>

          <div class="table-grid">
            <div>
              <table>
                <thead>
                  <tr><th>Earnings</th><th class="amount">Amount (₹)</th></tr>
                </thead>
                <tbody>
                  ${earnings.map((e: any) => `<tr><td>${e.name}</td><td class="amount">${e.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td></tr>`).join('')}
                  ${reimbursements.map((r: any) => `<tr><td>${r.name} (Non-Taxable)</td><td class="amount">${r.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td></tr>`).join('')}
                </tbody>
              </table>
            </div>
            <div>
              <table>
                <thead>
                  <tr><th>Deductions</th><th class="amount">Amount (₹)</th></tr>
                </thead>
                <tbody>
                  ${deductions.map((d: any) => `<tr><td>${d.name}</td><td class="amount">${d.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td></tr>`).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <div class="net-pay-box">
            <div>
              <div class="net-pay-title">TOTAL NET SALARY DISBURSED</div>
              <div style="font-size: 12px; color: #047857; margin-top: 4px;">Gross Earnings: ₹${payslip.totalEarnings.toLocaleString('en-IN')} | Total Deductions: ₹${payslip.totalDeductions.toLocaleString('en-IN')}</div>
            </div>
            <div class="net-pay-amount">₹${payslip.netPay.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          </div>

          <div class="footer">
            This is a system-generated computer slip requiring no physical signature. Confidential & Proprietary Stackly Payroll.
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generates formatted HTML for Form 16 / Tax Summary Document
   */
  static async generateForm16Html(employeeId: string, financialYear: string = '2024-25'): Promise<string> {
    const data = await TaxCalculationService.getForm16Statement(employeeId, financialYear);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Form 16 Tax Statement - ${data.employee.name} (${financialYear})</title>
        <style>
          body { font-family: Arial, sans-serif; color: #1e293b; margin: 0; padding: 25px; line-height: 1.5; }
          .container { border: 2px solid #0284c7; border-radius: 8px; padding: 25px; max-width: 850px; margin: 0 auto; }
          .title-head { text-align: center; border-bottom: 2px solid #0284c7; padding-bottom: 10px; margin-bottom: 20px; }
          .title-head h2 { margin: 0; color: #0369a1; font-size: 20px; text-transform: uppercase; }
          .title-head p { margin: 4px 0 0; font-size: 13px; color: #64748b; }
          .info-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; }
          .info-table td { border: 1px solid #cbd5e1; padding: 8px; }
          .info-header { background: #f0f9ff; font-weight: bold; color: #0369a1; }
          .tax-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
          .tax-table th, .tax-table td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; }
          .tax-table th { background: #f8fafc; font-weight: bold; color: #334155; }
          .num { text-align: right; font-family: monospace; font-weight: bold; }
          .highlight-row { background: #f0fdf4; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="title-head">
            <h2>FORM NO. 16 (PART B - ESTIMATED SUMMARY)</h2>
            <p>Certificate under section 203 of the Income-tax Act, 1961 for Tax Deducted at Source</p>
            <p><strong>Financial Year: ${data.financialYear} | Assessment Year: ${data.assessmentYear}</strong></p>
          </div>

          <table class="info-table">
            <tr>
              <td class="info-header" width="50%">Employer Details</td>
              <td class="info-header" width="50%">Employee Details</td>
            </tr>
            <tr>
              <td>
                <strong>Name:</strong> ${data.employer.name}<br>
                <strong>TAN:</strong> ${data.employer.tan} | <strong>PAN:</strong> ${data.employer.pan}<br>
                <strong>Address:</strong> ${data.employer.address}
              </td>
              <td>
                <strong>Name:</strong> ${data.employee.name}<br>
                <strong>Employee ID:</strong> ${data.employee.code} | <strong>PAN:</strong> ${data.employee.pan}<br>
                <strong>Designation:</strong> ${data.employee.designation} (${data.employee.department})
              </td>
            </tr>
          </table>

          <table class="tax-table">
            <thead>
              <tr>
                <th>Particulars</th>
                <th class="num">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1. Gross Salary Income (Finalized YTD)</td>
                <td class="num">${data.taxCalculation.grossAnnualIncome.toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td>2. Less: Standard Deduction u/s 16(ia)</td>
                <td class="num">${data.taxCalculation.standardDeduction.toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td>3. Less: Eligible Exemptions (Regime: ${data.taxCalculation.regime.toUpperCase()})</td>
                <td class="num">${data.taxCalculation.exemptions.totalExemptions.toLocaleString('en-IN')}</td>
              </tr>
              <tr class="highlight-row">
                <td>4. Net Chargeable Taxable Income (1 - 2 - 3)</td>
                <td class="num">${data.taxCalculation.taxableIncome.toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td>5. Calculated Income Tax on Taxable Income</td>
                <td class="num">${data.taxCalculation.baseTax.toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td>6. Add: Health & Education Cess (4%)</td>
                <td class="num">${data.taxCalculation.cess.toLocaleString('en-IN')}</td>
              </tr>
              <tr class="highlight-row">
                <td>7. Total Annual Income Tax Payable</td>
                <td class="num">${data.taxCalculation.totalAnnualTax.toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td>8. Total TDS Deducted via Payroll YTD</td>
                <td class="num" style="color: #047857;">${data.totalTdsDeducted.toLocaleString('en-IN')}</td>
              </tr>
              <tr style="background: #fff1f2; font-weight: bold;">
                <td>9. Balance Tax Payable / (Refundable)</td>
                <td class="num" style="color: #be123c;">${data.balanceTaxDue.toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>

          <div style="font-size: 11px; color: #64748b; text-align: center; margin-top: 20px; border-top: 1px solid #e2e8f0; padding-top: 10px;">
            Generated on ${new Date().toLocaleDateString()} by Stackly Payroll Tax Engine. For internal verification prior to official Income Tax e-filing.
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

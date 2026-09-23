import { query } from '../database/sqlite-cloud.js';
import { ComplianceService } from './compliance.service.js';

export interface CtcCalculationInput {
  annualCtc: number;
  basicPercentage?: number; // Default 50%
  hraPercentage?: number;   // Default 40% (or 50% for metro)
  specialAllowance?: number;
  conveyanceAllowance?: number;
  medicalAllowance?: number;
  foodAllowance?: number;
  bonus?: number;
  includeEmployerPf?: boolean;
  includeEmployerEsi?: boolean;
}

export interface CtcBreakdown {
  annualCtc: number;
  monthlyCtc: number;
  annualGross: number;
  monthlyGross: number;
  basicAnnual: number;
  basicMonthly: number;
  hraAnnual: number;
  hraMonthly: number;
  specialAllowanceAnnual: number;
  specialAllowanceMonthly: number;
  conveyanceAnnual: number;
  conveyanceMonthly: number;
  medicalAnnual: number;
  medicalMonthly: number;
  foodAnnual: number;
  foodMonthly: number;
  bonusAnnual: number;
  employerPfAnnual: number;
  employerPfMonthly: number;
  employerEsiAnnual: number;
  employerEsiMonthly: number;
  employeePfAnnual: number;
  employeePfMonthly: number;
  employeeEsiAnnual: number;
  employeeEsiMonthly: number;
  ptAnnual: number;
  ptMonthly: number;
  estimatedTdsAnnual: number;
  estimatedTdsMonthly: number;
  annualNetSalary: number;
  monthlyNetSalary: number;
}

export interface TaxCalculationResult {
  financialYear: string;
  regime: 'old' | 'new';
  grossAnnualIncome: number;
  standardDeduction: number;
  exemptions: {
    hra: number;
    section80C: number;
    section80D: number;
    section24B: number;
    otherExemptions: number;
    totalExemptions: number;
  };
  taxableIncome: number;
  taxSlabBreakdown: Array<{ slab: string; rate: string; taxAmount: number }>;
  baseTax: number;
  cess: number;
  totalAnnualTax: number;
  monthlyTds: number;
}

export class TaxCalculationService {
  /**
   * Calculates dynamic CTC breakdown and monthly net salary estimate
   */
  static async calculateCtcBreakdown(input: CtcCalculationInput): Promise<CtcBreakdown> {
    const annualCtc = Math.max(0, input.annualCtc);
    const monthlyCtc = annualCtc / 12;

    const basicPct = (input.basicPercentage ?? 50) / 100;
    const hraPct = (input.hraPercentage ?? 40) / 100;

    const basicAnnual = Math.round(annualCtc * basicPct);
    const basicMonthly = Math.round(basicAnnual / 12);

    const hraAnnual = Math.round(basicAnnual * hraPct);
    const hraMonthly = Math.round(hraAnnual / 12);

    const conveyanceMonthly = input.conveyanceAllowance || 1600;
    const conveyanceAnnual = conveyanceMonthly * 12;

    const medicalMonthly = input.medicalAllowance || 1250;
    const medicalAnnual = medicalMonthly * 12;

    const foodMonthly = input.foodAllowance || 2200;
    const foodAnnual = foodMonthly * 12;

    const bonusAnnual = input.bonus || 0;

    // EPF Calculations (12% of basic capped at 15000/mo)
    const pfBasisMonthly = Math.min(basicMonthly, 15000);
    const employeePfMonthly = Math.round(pfBasisMonthly * 0.12);
    const employerPfMonthly = input.includeEmployerPf !== false ? Math.round(pfBasisMonthly * 0.12) : 0;
    const employeePfAnnual = employeePfMonthly * 12;
    const employerPfAnnual = employerPfMonthly * 12;

    // ESI Calculations (Only if monthly gross <= 21000)
    const approxMonthlyGross = basicMonthly + hraMonthly + conveyanceMonthly + medicalMonthly + foodMonthly;
    let employeeEsiMonthly = 0;
    let employerEsiMonthly = 0;
    if (approxMonthlyGross <= 21000) {
      employeeEsiMonthly = Math.ceil(approxMonthlyGross * 0.0075);
      employerEsiMonthly = input.includeEmployerEsi !== false ? Math.ceil(approxMonthlyGross * 0.0325) : 0;
    }
    const employeeEsiAnnual = employeeEsiMonthly * 12;
    const employerEsiAnnual = employerEsiMonthly * 12;

    // Special Allowance acts as the balancing component
    const fixedComponentsAnnual = basicAnnual + hraAnnual + conveyanceAnnual + medicalAnnual + foodAnnual + bonusAnnual + employerPfAnnual + employerEsiAnnual;
    const specialAllowanceAnnual = Math.max(0, annualCtc - fixedComponentsAnnual);
    const specialAllowanceMonthly = Math.round(specialAllowanceAnnual / 12);

    const annualGross = basicAnnual + hraAnnual + specialAllowanceAnnual + conveyanceAnnual + medicalAnnual + foodAnnual + bonusAnnual;
    const monthlyGross = Math.round(annualGross / 12);

    // PT Calculation (Standard state slab e.g. KA 200/mo)
    const ptMonthly = await ComplianceService.calculatePT(monthlyGross);
    const ptAnnual = ptMonthly * 12;

    // Estimated TDS Calculation
    const taxRes = await this.calculateTaxForEmployee(monthlyGross * 12, 'new', []);
    const estimatedTdsAnnual = taxRes.totalAnnualTax;
    const estimatedTdsMonthly = taxRes.monthlyTds;

    const totalMonthlyDeductions = employeePfMonthly + employeeEsiMonthly + ptMonthly + estimatedTdsMonthly;
    const monthlyNetSalary = monthlyGross - totalMonthlyDeductions;
    const annualNetSalary = monthlyNetSalary * 12;

    return {
      annualCtc,
      monthlyCtc,
      annualGross,
      monthlyGross,
      basicAnnual,
      basicMonthly,
      hraAnnual,
      hraMonthly,
      specialAllowanceAnnual,
      specialAllowanceMonthly,
      conveyanceAnnual,
      conveyanceMonthly,
      medicalAnnual,
      medicalMonthly,
      foodAnnual,
      foodMonthly,
      bonusAnnual,
      employerPfAnnual,
      employerPfMonthly,
      employerEsiAnnual,
      employerEsiMonthly,
      employeePfAnnual,
      employeePfMonthly,
      employeeEsiAnnual,
      employeeEsiMonthly,
      ptAnnual,
      ptMonthly,
      estimatedTdsAnnual,
      estimatedTdsMonthly,
      annualNetSalary,
      monthlyNetSalary
    };
  }

  /**
   * Complete Tax Computation for Employee given Income & Tax Declarations
   */
  static async calculateTaxForEmployee(
    grossAnnualIncome: number,
    regime: 'old' | 'new' = 'new',
    declarations: Array<{ sectionCode: string; verifiedAmount?: number; declaredAmount: number }> = [],
    financialYear: string = '2024-25'
  ): Promise<TaxCalculationResult> {
    const standardDeduction = regime === 'new' ? 75000 : 50000;

    let hraExemption = 0;
    let sec80C = 0;
    let sec80D = 0;
    let sec24B = 0;
    let otherExemptions = 0;

    if (regime === 'old') {
      declarations.forEach(d => {
        const amt = d.verifiedAmount ?? d.declaredAmount ?? 0;
        if (d.sectionCode === 'HRA') hraExemption += amt;
        else if (d.sectionCode === '80C') sec80C += Math.min(amt, 150000);
        else if (d.sectionCode === '80D') sec80D += Math.min(amt, 50000);
        else if (d.sectionCode === '24B') sec24B += Math.min(amt, 200000);
        else otherExemptions += amt;
      });
    }

    const totalExemptions = regime === 'old'
      ? (hraExemption + sec80C + sec80D + sec24B + otherExemptions)
      : 0;

    const netTaxableIncome = Math.max(0, grossAnnualIncome - standardDeduction - totalExemptions);

    let baseTax = 0;
    const slabBreakdown: Array<{ slab: string; rate: string; taxAmount: number }> = [];

    if (regime === 'new') {
      // FY 2024-25 New Regime Slabs
      // Up to 3,00,000: Nil
      // 3,00,001 - 7,00,000: 5%
      // 7,00,001 - 10,00,000: 10%
      // 10,00,001 - 12,00,000: 15%
      // 12,00,001 - 15,00,000: 20%
      // Above 15,00,000: 30%
      if (netTaxableIncome <= 700000) {
        // Section 87A rebate applies for taxable income <= 7L
        baseTax = 0;
        slabBreakdown.push({ slab: 'Up to ₹7,00,000', rate: '0% (Rebate 87A)', taxAmount: 0 });
      } else {
        if (netTaxableIncome > 300000) {
          const taxableInSlab = Math.min(netTaxableIncome - 300000, 400000);
          const tax = taxableInSlab * 0.05;
          baseTax += tax;
          slabBreakdown.push({ slab: '₹3,00,001 - ₹7,00,000', rate: '5%', taxAmount: tax });
        }
        if (netTaxableIncome > 700000) {
          const taxableInSlab = Math.min(netTaxableIncome - 700000, 300000);
          const tax = taxableInSlab * 0.10;
          baseTax += tax;
          slabBreakdown.push({ slab: '₹7,00,001 - ₹10,00,000', rate: '10%', taxAmount: tax });
        }
        if (netTaxableIncome > 1000000) {
          const taxableInSlab = Math.min(netTaxableIncome - 1000000, 200000);
          const tax = taxableInSlab * 0.15;
          baseTax += tax;
          slabBreakdown.push({ slab: '₹10,00,001 - ₹12,00,000', rate: '15%', taxAmount: tax });
        }
        if (netTaxableIncome > 1200000) {
          const taxableInSlab = Math.min(netTaxableIncome - 1200000, 300000);
          const tax = taxableInSlab * 0.20;
          baseTax += tax;
          slabBreakdown.push({ slab: '₹12,00,001 - ₹15,00,000', rate: '20%', taxAmount: tax });
        }
        if (netTaxableIncome > 1500000) {
          const taxableInSlab = netTaxableIncome - 1500000;
          const tax = taxableInSlab * 0.30;
          baseTax += tax;
          slabBreakdown.push({ slab: 'Above ₹15,00,000', rate: '30%', taxAmount: tax });
        }
      }
    } else {
      // Old Tax Regime Slabs
      // Up to 2.5L: Nil
      // 2.5L - 5L: 5%
      // 5L - 10L: 20%
      // Above 10L: 30%
      if (netTaxableIncome <= 500000) {
        // Section 87A rebate for income <= 5L in old regime
        baseTax = 0;
        slabBreakdown.push({ slab: 'Up to ₹5,00,000', rate: '0% (Rebate 87A)', taxAmount: 0 });
      } else {
        if (netTaxableIncome > 250000) {
          const taxableInSlab = Math.min(netTaxableIncome - 250000, 250000);
          const tax = taxableInSlab * 0.05;
          baseTax += tax;
          slabBreakdown.push({ slab: '₹2,50,001 - ₹5,00,000', rate: '5%', taxAmount: tax });
        }
        if (netTaxableIncome > 500000) {
          const taxableInSlab = Math.min(netTaxableIncome - 500000, 500000);
          const tax = taxableInSlab * 0.20;
          baseTax += tax;
          slabBreakdown.push({ slab: '₹5,00,001 - ₹10,00,000', rate: '20%', taxAmount: tax });
        }
        if (netTaxableIncome > 1000000) {
          const taxableInSlab = netTaxableIncome - 1000000;
          const tax = taxableInSlab * 0.30;
          baseTax += tax;
          slabBreakdown.push({ slab: 'Above ₹10,00,000', rate: '30%', taxAmount: tax });
        }
      }
    }

    const cess = Math.round(baseTax * 0.04);
    const totalAnnualTax = Math.round(baseTax + cess);
    const monthlyTds = Math.round(totalAnnualTax / 12);

    return {
      financialYear,
      regime,
      grossAnnualIncome,
      standardDeduction,
      exemptions: {
        hra: hraExemption,
        section80C: sec80C,
        section80D: sec80D,
        section24B: sec24B,
        otherExemptions,
        totalExemptions
      },
      taxableIncome: netTaxableIncome,
      taxSlabBreakdown: slabBreakdown,
      baseTax,
      cess,
      totalAnnualTax,
      monthlyTds
    };
  }

  /**
   * Form 16 / Tax summary document dataset generation
   */
  static async getForm16Statement(employeeId: string, financialYear: string = '2024-25') {
    const emp = await query(`SELECT * FROM employees WHERE id = ?`, [employeeId]).then(res => res[0]);
    if (!emp) throw new Error('Employee not found');

    const taxProfile = await query(
      `SELECT * FROM employee_tax_profiles WHERE employeeId = ? AND financialYear = ?`,
      [employeeId, financialYear]
    ).then(res => res[0]);

    const regime = taxProfile?.regime || emp.taxRegime || 'new';

    const declarations = await query(
      `SELECT * FROM tax_declarations WHERE employeeId = ? AND financialYear = ?`,
      [employeeId, financialYear]
    );

    // Fetch YTD summary or aggregate finalized payroll runs
    const ytd = await query(
      `SELECT * FROM payroll_ytd WHERE employeeId = ? AND financialYear = ?`,
      [employeeId, financialYear]
    ).then(res => res[0]);

    const grossAnnual = ytd?.ytdGross || 0;
    const tdsDeducted = ytd?.ytdTds || 0;

    const taxCalculation = await this.calculateTaxForEmployee(grossAnnual, regime, declarations, financialYear);

    return {
      employee: {
        id: emp.id,
        code: emp.employeeCode,
        name: emp.name,
        email: emp.email,
        pan: emp.panReference || 'ABCDE1234F',
        designation: emp.designation,
        department: emp.department
      },
      employer: {
        name: 'Stackly Enterprise Systems Pvt Ltd',
        tan: 'BLRS12345E',
        pan: 'AAACS9876K',
        address: 'Tech Park, Whitefield, Bengaluru, KA - 560066'
      },
      financialYear,
      assessmentYear: '2025-26',
      taxProfile,
      declarations,
      ytd,
      taxCalculation,
      totalTdsDeducted: tdsDeducted,
      balanceTaxDue: Math.max(0, taxCalculation.totalAnnualTax - tdsDeducted),
      status: 'GENERATED',
      generatedAt: new Date().toISOString()
    };
  }
}

import { query, execute } from '../../database/sqlite-cloud.js';
import { v4 as uuidv4 } from 'uuid';

export interface StatutoryConfig {
  id: string;
  configKey: string;
  financialYear: string;
  stateCode?: string;
  value: number;
  effectiveFrom: string;
}

export interface TaxSlab {
  id: string;
  financialYear: string;
  regime: 'old' | 'new';
  incomeFrom: number;
  incomeTo: number;
  rate: number;
  surchargeRate: number;
}

export class ComplianceService {
  /**
   * Initialize default statutory configurations if they don't exist.
   */
  static async initializeDefaults() {
    // Check if PF config exists
    const pfConfig = await query(`SELECT id FROM statutory_config WHERE configKey = 'pf_employee_rate' LIMIT 1`);
    if (!pfConfig || pfConfig.length === 0) {
      await execute(`INSERT INTO statutory_config (id, configKey, financialYear, value, effectiveFrom) VALUES 
        (?, 'pf_employee_rate', '2024-25', 0.12, '2024-04-01'),
        (?, 'pf_employer_rate', '2024-25', 0.12, '2024-04-01'),
        (?, 'pf_wage_limit', '2024-25', 15000, '2024-04-01'),
        (?, 'esi_employee_rate', '2024-25', 0.0075, '2024-04-01'),
        (?, 'esi_employer_rate', '2024-25', 0.0325, '2024-04-01'),
        (?, 'esi_wage_limit', '2024-25', 21000, '2024-04-01')
      `, [uuidv4(), uuidv4(), uuidv4(), uuidv4(), uuidv4(), uuidv4()]);
    }
  }

  static async getConfigurations(financialYear: string = '2024-25'): Promise<StatutoryConfig[]> {
    const result = await query(`SELECT * FROM statutory_config WHERE financialYear = ?`, [financialYear]);
    return result as StatutoryConfig[];
  }

  static async setConfiguration(data: Omit<StatutoryConfig, 'id'>) {
    const id = uuidv4();
    await execute(`
      INSERT INTO statutory_config (id, configKey, financialYear, stateCode, value, effectiveFrom)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [id, data.configKey, data.financialYear, data.stateCode, data.value, data.effectiveFrom]);
    return { id, ...data };
  }

  /**
   * Compute EPF based on basic pay.
   */
  static async calculatePF(basicPay: number, financialYear: string = '2024-25'): Promise<{ employeePF: number, employerPF: number }> {
    const configs = await this.getConfigurations(financialYear);
    const empRate = configs.find(c => c.configKey === 'pf_employee_rate')?.value || 0.12;
    const emplyrRate = configs.find(c => c.configKey === 'pf_employer_rate')?.value || 0.12;
    const limit = configs.find(c => c.configKey === 'pf_wage_limit')?.value || 15000;

    // EPF is usually calculated on Basic Pay, capped at the wage limit
    const pfBasis = Math.min(basicPay, limit);

    return {
      employeePF: Math.round(pfBasis * empRate),
      employerPF: Math.round(pfBasis * emplyrRate)
    };
  }

  /**
   * Compute ESI based on gross pay.
   */
  static async calculateESI(grossPay: number, financialYear: string = '2024-25'): Promise<{ employeeESI: number, employerESI: number }> {
    const configs = await this.getConfigurations(financialYear);
    const limit = configs.find(c => c.configKey === 'esi_wage_limit')?.value || 21000;

    // ESI is only applicable if gross pay is within the wage limit
    if (grossPay > limit) {
      return { employeeESI: 0, employerESI: 0 };
    }

    const empRate = configs.find(c => c.configKey === 'esi_employee_rate')?.value || 0.0075;
    const emplyrRate = configs.find(c => c.configKey === 'esi_employer_rate')?.value || 0.0325;

    // ESI values are rounded up to the nearest integer
    return {
      employeeESI: Math.ceil(grossPay * empRate),
      employerESI: Math.ceil(grossPay * emplyrRate)
    };
  }

  /**
   * Professional Tax is state-specific. (Placeholder simple logic)
   */
  static async calculatePT(grossPay: number, stateCode: string = 'KA'): Promise<number> {
    // Example for Karnataka: 200 per month if gross > 25000 (Simplified)
    if (stateCode === 'KA' && grossPay >= 25000) {
      return 200;
    }
    return 0;
  }

  /**
   * Simple TDS calculation for now. Real implementations require full annualized projection.
   */
  static async calculateTDS(monthlyGross: number, regime: 'old' | 'new' = 'new'): Promise<number> {
    const projectedAnnual = monthlyGross * 12;
    
    // Very simplified standard deduction
    const standardDeduction = 50000;
    const taxableIncome = Math.max(0, projectedAnnual - standardDeduction);

    let annualTax = 0;
    if (regime === 'new') {
      if (taxableIncome <= 700000) return 0; // Rebate under 87A

      if (taxableIncome > 300000 && taxableIncome <= 600000) annualTax += (taxableIncome - 300000) * 0.05;
      else if (taxableIncome > 600000) annualTax += (600000 - 300000) * 0.05;

      if (taxableIncome > 600000 && taxableIncome <= 900000) annualTax += (taxableIncome - 600000) * 0.10;
      else if (taxableIncome > 900000) annualTax += (900000 - 600000) * 0.10;

      if (taxableIncome > 900000 && taxableIncome <= 1200000) annualTax += (taxableIncome - 900000) * 0.15;
      else if (taxableIncome > 1200000) annualTax += (1200000 - 900000) * 0.15;

      if (taxableIncome > 1200000 && taxableIncome <= 1500000) annualTax += (taxableIncome - 1200000) * 0.20;
      else if (taxableIncome > 1500000) annualTax += (1500000 - 1200000) * 0.20;

      if (taxableIncome > 1500000) annualTax += (taxableIncome - 1500000) * 0.30;
    }
    
    // Add 4% Health & Education Cess
    annualTax += annualTax * 0.04;

    return Math.round(annualTax / 12);
  }
}

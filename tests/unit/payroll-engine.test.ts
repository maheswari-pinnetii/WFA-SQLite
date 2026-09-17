import { TaxCalculationService } from '../../backend/src/services/tax-calculation.service';
import { ComplianceService } from '../../backend/src/services/compliance.service';

describe('Payroll Engine Unit Tests', () => {
  describe('CTC Breakdown Calculator', () => {
    it('should correctly calculate annual and monthly gross breakdown for ₹12,00,000 CTC', async () => {
      const breakdown = await TaxCalculationService.calculateCtcBreakdown({
        annualCtc: 1200000,
        basicPercentage: 50,
        hraPercentage: 40
      });

      expect(breakdown.annualCtc).toBe(1200000);
      expect(breakdown.basicAnnual).toBe(600000);
      expect(breakdown.basicMonthly).toBe(50000);
      expect(breakdown.hraAnnual).toBe(240000);
      expect(breakdown.hraMonthly).toBe(20000);
      expect(breakdown.employeePfMonthly).toBe(1800); // 12% of 15000 cap
      expect(breakdown.monthlyNetSalary).toBeGreaterThan(0);
    });

    it('should calculate zero ESI when gross pay exceeds 21,000 limit', async () => {
      const esiRes = await ComplianceService.calculateESI(50000);
      expect(esiRes.employeeESI).toBe(0);
      expect(esiRes.employerESI).toBe(0);
    });

    it('should calculate ESI when gross pay is under 21,000 limit', async () => {
      const esiRes = await ComplianceService.calculateESI(18000);
      expect(esiRes.employeeESI).toBe(Math.ceil(18000 * 0.0075));
      expect(esiRes.employerESI).toBe(Math.ceil(18000 * 0.0325));
    });
  });

  describe('Tax Calculation Engine (Old vs New Regime)', () => {
    it('should compute tax rebate under Section 87A for income <= ₹7L under New Regime', async () => {
      const res = await TaxCalculationService.calculateTaxForEmployee(650000, 'new');
      expect(res.totalAnnualTax).toBe(0);
      expect(res.monthlyTds).toBe(0);
    });

    it('should compute tax slabs correctly for ₹15,00,000 income under New Regime', async () => {
      const res = await TaxCalculationService.calculateTaxForEmployee(1500000, 'new');
      expect(res.regime).toBe('new');
      expect(res.totalAnnualTax).toBeGreaterThan(0);
      expect(res.monthlyTds).toBe(Math.round(res.totalAnnualTax / 12));
    });

    it('should apply Section 80C and 80D exemptions under Old Regime', async () => {
      const declarations = [
        { sectionCode: '80C', declaredAmount: 150000 },
        { sectionCode: '80D', declaredAmount: 25000 }
      ];
      const res = await TaxCalculationService.calculateTaxForEmployee(1200000, 'old', declarations);
      expect(res.regime).toBe('old');
      expect(res.exemptions.section80C).toBe(150000);
      expect(res.exemptions.section80D).toBe(25000);
      expect(res.taxableIncome).toBe(1200000 - 50000 - 175000);
    });
  });
});

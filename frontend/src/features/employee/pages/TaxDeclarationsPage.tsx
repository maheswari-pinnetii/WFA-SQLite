import React, { useState, useEffect } from 'react';
import { payrollApi } from '../../../api/endpoints/payroll.api';
import { FileText, Save, CheckCircle2, ShieldCheck, Download, AlertCircle } from 'lucide-react';

export const TaxDeclarationsPage: React.FC = () => {
  const [employeeId, setEmployeeId] = useState<string>('emp-001'); // In real integration, current user employeeId
  const [regime, setRegime] = useState<'old' | 'new'>('new');
  const [sec80C, setSec80C] = useState<number>(150000);
  const [sec80D, setSec80D] = useState<number>(25000);
  const [sec24B, setSec24B] = useState<number>(0);
  const [annualRentPaid, setAnnualRentPaid] = useState<number>(180000);

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    loadTaxProfile();
  }, [employeeId]);

  const loadTaxProfile = async () => {
    try {
      const res = await payrollApi.getTaxProfile(employeeId);
      if (res && res.profile) {
        setRegime(res.profile.regime || 'new');
      }
      if (res && res.declarations) {
        res.declarations.forEach((d: any) => {
          if (d.sectionCode === '80C') setSec80C(d.declaredAmount);
          if (d.sectionCode === '80D') setSec80D(d.declaredAmount);
          if (d.sectionCode === '24B') setSec24B(d.declaredAmount);
          if (d.sectionCode === 'HRA') setAnnualRentPaid(d.declaredAmount);
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSuccessMsg('');
      await payrollApi.updateTaxProfile(employeeId, {
        regime,
        declarations: [
          { sectionCode: '80C', componentName: 'Life Insurance / ELSS / EPF / PPF', declaredAmount: sec80C },
          { sectionCode: '80D', componentName: 'Health Insurance Premium', declaredAmount: sec80D },
          { sectionCode: '24B', componentName: 'Housing Loan Interest', declaredAmount: sec24B },
          { sectionCode: 'HRA', componentName: 'Annual Rent Paid', declaredAmount: annualRentPaid }
        ]
      });
      setSuccessMsg('Tax declarations and regime selection saved successfully!');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto font-sans text-slate-100">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <FileText size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Income Tax Declarations & Regime Selection
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Select your preferred Income Tax Regime (Old vs New) and submit tax-saving investment declarations for FY 2024-25.
            </p>
          </div>
        </div>

        <a
          href={`http://localhost:5000/api/payroll/tax/${employeeId}/form16`}
          target="_blank"
          rel="noreferrer"
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 border border-slate-700 transition-colors"
        >
          <Download size={14} /> View Form 16 Statement
        </a>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 size={16} /> {successMsg}
        </div>
      )}

      {/* Regime Toggle Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-2">
          <ShieldCheck size={16} className="text-emerald-400" /> Choose Tax Regime
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col gap-2 ${
            regime === 'new' 
              ? 'bg-emerald-950/30 border-emerald-500 text-white' 
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm">New Tax Regime (Default)</span>
              <input type="radio" name="regime" checked={regime === 'new'} onChange={() => setRegime('new')} className="accent-emerald-500" />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Lower tax rates with standard deduction of ₹75,000. No tax on income up to ₹7,00,000 (Section 87A rebate). Deductions like 80C/80D are not applicable.
            </p>
          </label>

          <label className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col gap-2 ${
            regime === 'old' 
              ? 'bg-emerald-950/30 border-emerald-500 text-white' 
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm">Old Tax Regime</span>
              <input type="radio" name="regime" checked={regime === 'old'} onChange={() => setRegime('old')} className="accent-emerald-500" />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Allows tax exemption claims for HRA, Section 80C (up to ₹1.5L), Section 80D (Health Insurance), and Housing Loan Interest (Section 24B).
            </p>
          </label>
        </div>
      </div>

      {/* Tax Investment Declarations Form */}
      <div className={`bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-lg ${regime === 'new' ? 'opacity-60 pointer-events-none' : ''}`}>
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            Section 80 Investment Declarations {regime === 'new' && '(Disallowed under New Regime)'}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs text-slate-300 font-semibold block mb-1">
              Section 80C (Max ₹1,50,000)
            </label>
            <span className="text-[11px] text-slate-500 block mb-2">EPF, PPF, ELSS Mutual Funds, Life Insurance, Tuition Fees</span>
            <input
              type="number"
              value={sec80C}
              onChange={(e) => setSec80C(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm font-mono text-emerald-400 font-bold focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-slate-300 font-semibold block mb-1">
              Section 80D (Health Insurance - Max ₹50,000)
            </label>
            <span className="text-[11px] text-slate-500 block mb-2">Mediclaim premiums for self, family, and parents</span>
            <input
              type="number"
              value={sec80D}
              onChange={(e) => setSec80D(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm font-mono text-emerald-400 font-bold focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-slate-300 font-semibold block mb-1">
              Section 24(B) (Housing Loan Interest - Max ₹2,00,000)
            </label>
            <span className="text-[11px] text-slate-500 block mb-2">Interest on loan taken for self-occupied residential house</span>
            <input
              type="number"
              value={sec24B}
              onChange={(e) => setSec24B(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm font-mono text-emerald-400 font-bold focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-slate-300 font-semibold block mb-1">
              Annual Rent Paid for HRA Exemption (₹)
            </label>
            <span className="text-[11px] text-slate-500 block mb-2">Declared annual house rent paid to landlord</span>
            <input
              type="number"
              value={annualRentPaid}
              onChange={(e) => setAnnualRentPaid(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm font-mono text-emerald-400 font-bold focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Save Action */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-lg"
        >
          <Save size={14} /> {saving ? 'Saving...' : 'Save Tax Declarations'}
        </button>
      </div>
    </div>
  );
};

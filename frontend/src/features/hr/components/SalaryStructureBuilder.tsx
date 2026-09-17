import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { payrollApi, SalaryComponent, SalaryStructure } from '../../../api/endpoints/payroll.api';
import { Calculator, Save, Plus, Trash2, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface SalaryStructureBuilderProps {
  employeeId: string;
  initialStructure?: SalaryStructure;
  onClose: () => void;
}

export const SalaryStructureBuilder: React.FC<SalaryStructureBuilderProps> = ({ employeeId, initialStructure, onClose }) => {
  const queryClient = useQueryClient();
  const [annualCtc, setAnnualCtc] = useState<number>(initialStructure?.annualCtc || (initialStructure?.baseSalary ? initialStructure.baseSalary * 12 : 600000));
  const [baseSalary, setBaseSalary] = useState<number>(initialStructure?.baseSalary || Math.round(annualCtc / 12));
  const [effectiveDate, setEffectiveDate] = useState<string>(initialStructure?.effectiveFrom || initialStructure?.effectiveDate || new Date().toISOString().split('T')[0]);
  const [currency, setCurrency] = useState<string>(initialStructure?.currency || 'INR');
  const [revisionReason, setRevisionReason] = useState<string>('Annual Salary Revision');
  
  const [components, setComponents] = useState<SalaryComponent[]>(
    initialStructure?.components?.length
      ? initialStructure.components
      : [
          { name: 'Basic Pay', type: 'EARNING', amount: Math.round((annualCtc * 0.5) / 12), taxable: true, pfApplicable: true, esiApplicable: true },
          { name: 'House Rent Allowance (HRA)', type: 'EARNING', amount: Math.round((annualCtc * 0.2) / 12), taxable: true, pfApplicable: false, esiApplicable: true },
          { name: 'Special Allowance', type: 'EARNING', amount: Math.round((annualCtc * 0.3) / 12), taxable: true, pfApplicable: false, esiApplicable: true }
        ]
  );
  
  const [newComponentName, setNewComponentName] = useState('');
  const [newComponentType, setNewComponentType] = useState<'EARNING' | 'DEDUCTION'>('EARNING');
  const [newComponentAmount, setNewComponentAmount] = useState<string>('');
  const [newIsTaxable, setNewIsTaxable] = useState(true);
  const [newPfApplicable, setNewPfApplicable] = useState(true);
  const [newEsiApplicable, setNewEsiApplicable] = useState(true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleCtcChange = (newCtc: number) => {
    setAnnualCtc(newCtc);
    const mBase = Math.round((newCtc * 0.5) / 12);
    setBaseSalary(mBase);
    
    // Auto rebalance components proportionally
    const basic = mBase;
    const hra = Math.round((newCtc * 0.2) / 12);
    const special = Math.round((newCtc / 12) - basic - hra);

    setComponents([
      { name: 'Basic Pay', type: 'EARNING', amount: basic, taxable: true, pfApplicable: true, esiApplicable: true },
      { name: 'House Rent Allowance (HRA)', type: 'EARNING', amount: hra, taxable: true, pfApplicable: false, esiApplicable: true },
      { name: 'Special Allowance', type: 'EARNING', amount: Math.max(0, special), taxable: true, pfApplicable: false, esiApplicable: true }
    ]);
  };

  const addComponent = () => {
    if (!newComponentName || !newComponentAmount) return;
    setComponents([
      ...components,
      {
        name: newComponentName,
        componentName: newComponentName,
        type: newComponentType,
        amount: Number(newComponentAmount),
        taxable: newIsTaxable,
        pfApplicable: newPfApplicable,
        esiApplicable: newEsiApplicable
      }
    ]);
    setNewComponentName('');
    setNewComponentAmount('');
  };

  const removeComponent = (index: number) => {
    setComponents(components.filter((_, i) => i !== index));
  };

  const totalEarnings = components.filter(c => c.type === 'EARNING').reduce((acc, c) => acc + c.amount, 0);
  const totalDeductions = components.filter(c => c.type === 'DEDUCTION').reduce((acc, c) => acc + c.amount, 0);
  const monthlyGross = totalEarnings;
  const estimatedNet = monthlyGross - totalDeductions;

  const saveMutation = useMutation({
    mutationFn: () => payrollApi.setSalaryStructure(employeeId, {
      baseSalary: monthlyGross,
      annualCtc,
      currency,
      effectiveDate,
      effectiveFrom: effectiveDate,
      revisionReason,
      components: components.map(c => ({
        name: c.name || c.componentName || 'Component',
        type: c.type,
        amount: c.amount,
        taxable: c.taxable !== false,
        pfApplicable: c.pfApplicable !== false,
        esiApplicable: c.esiApplicable !== false
      }))
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-salary', employeeId] });
      queryClient.invalidateQueries({ queryKey: ['salary-revisions', employeeId] });
      onClose();
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to save effective salary structure');
    }
  });

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await saveMutation.mutateAsync();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 text-slate-100 font-sans">
      {error && <div className="p-3 bg-rose-500/20 text-rose-400 rounded-lg text-xs border border-rose-500/30">{error}</div>}
      
      {/* Core Setup */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-400 font-medium">Annual CTC (₹)</span>
          <input type="number" value={annualCtc} onChange={(e) => handleCtcChange(Number(e.target.value))}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono text-emerald-400 focus:outline-none focus:border-emerald-500" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-400 font-medium">Monthly Gross (₹)</span>
          <input type="number" value={monthlyGross} readOnly
            className="bg-slate-950/60 border border-slate-800/80 rounded-lg px-3 py-2 text-sm font-mono text-slate-300" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-400 font-medium">Effective Date</span>
          <input type="date" value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-400 font-medium">Revision Reason</span>
          <input type="text" value={revisionReason} onChange={(e) => setRevisionReason(e.target.value)} placeholder="e.g. Annual Appraisal"
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none" />
        </label>
      </div>

      {/* Component Config Table */}
      <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/40">
        <div className="p-3 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck size={14} className="text-emerald-400" /> Salary Breakdown Components
          </h4>
          <span className="text-xs text-slate-400">{components.length} components configured</span>
        </div>
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase text-[10px] tracking-wider">
            <tr>
              <th className="py-2.5 px-3">Component Name</th>
              <th className="py-2.5 px-3">Type</th>
              <th className="py-2.5 px-3 text-center">Taxable</th>
              <th className="py-2.5 px-3 text-center">PF Applicable</th>
              <th className="py-2.5 px-3 text-center">ESI Applicable</th>
              <th className="py-2.5 px-3 text-right">Monthly Amount (₹)</th>
              <th className="py-2.5 px-3 w-8"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {components.map((c, i) => (
              <tr key={i} className="hover:bg-slate-800/30">
                <td className="py-2.5 px-3 text-slate-200 font-semibold">{c.name || c.componentName}</td>
                <td className="py-2.5 px-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.type === 'EARNING' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                    {c.type}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-center">{c.taxable !== false ? '✅' : '❌'}</td>
                <td className="py-2.5 px-3 text-center">{c.pfApplicable !== false ? '✅' : '❌'}</td>
                <td className="py-2.5 px-3 text-center">{c.esiApplicable !== false ? '✅' : '❌'}</td>
                <td className="py-2.5 px-3 text-right font-mono text-slate-100">₹{c.amount.toLocaleString('en-IN')}</td>
                <td className="py-2.5 px-3 text-center">
                  <button onClick={() => removeComponent(i)} className="text-slate-500 hover:text-rose-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}

            {/* Add New Component Form Row */}
            <tr className="bg-slate-950/80 border-t border-slate-800">
              <td className="py-2 px-3">
                <input placeholder="Component name" value={newComponentName} onChange={e => setNewComponentName(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs w-full text-slate-200 focus:outline-none" />
              </td>
              <td className="py-2 px-3">
                <select value={newComponentType} onChange={e => setNewComponentType(e.target.value as any)}
                  className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200">
                  <option value="EARNING">EARNING</option>
                  <option value="DEDUCTION">DEDUCTION</option>
                </select>
              </td>
              <td className="py-2 px-3 text-center">
                <input type="checkbox" checked={newIsTaxable} onChange={e => setNewIsTaxable(e.target.checked)} className="rounded" />
              </td>
              <td className="py-2 px-3 text-center">
                <input type="checkbox" checked={newPfApplicable} onChange={e => setNewPfApplicable(e.target.checked)} className="rounded" />
              </td>
              <td className="py-2 px-3 text-center">
                <input type="checkbox" checked={newEsiApplicable} onChange={e => setNewEsiApplicable(e.target.checked)} className="rounded" />
              </td>
              <td className="py-2 px-3 text-right">
                <input type="number" placeholder="Amount" value={newComponentAmount} onChange={e => setNewComponentAmount(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs w-full max-w-[100px] text-right font-mono text-slate-200 focus:outline-none" />
              </td>
              <td className="py-2 px-3 text-center">
                <button onClick={addComponent} disabled={!newComponentName || !newComponentAmount}
                  className="p-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40">
                  <Plus size={14} />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Dynamic Summary Card */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="grid grid-cols-3 gap-6 w-full md:w-auto">
          <div>
            <span className="text-[11px] text-slate-400 block uppercase tracking-wider">Monthly Gross</span>
            <span className="text-base font-bold font-mono text-slate-100">₹{monthlyGross.toLocaleString('en-IN')}</span>
          </div>
          <div>
            <span className="text-[11px] text-rose-400 block uppercase tracking-wider">Deductions</span>
            <span className="text-base font-bold font-mono text-rose-400">- ₹{totalDeductions.toLocaleString('en-IN')}</span>
          </div>
          <div>
            <span className="text-[11px] text-emerald-400 block uppercase tracking-wider font-bold">Estimated Take-Home</span>
            <span className="text-lg font-bold font-mono text-emerald-400">₹{estimatedNet.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="flex gap-3 shrink-0">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors">
            <Save size={14} /> {saving ? 'Saving...' : 'Save Salary Structure'}
          </button>
        </div>
      </div>
    </div>
  );
};

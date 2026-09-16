import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { payrollApi, SalaryComponent, SalaryStructure } from '../../../api/endpoints/payroll.api';

interface SalaryStructureBuilderProps {
  employeeId: string;
  initialStructure?: SalaryStructure;
  onClose: () => void;
}

export const SalaryStructureBuilder: React.FC<SalaryStructureBuilderProps> = ({ employeeId, initialStructure, onClose }) => {
  const queryClient = useQueryClient();
  const [baseSalary, setBaseSalary] = useState<number>(initialStructure?.baseSalary || 0);
  const [effectiveDate, setEffectiveDate] = useState<string>(initialStructure?.effectiveDate || new Date().toISOString().split('T')[0]);
  const [currency, setCurrency] = useState<string>(initialStructure?.currency || 'USD');
  const [components, setComponents] = useState<SalaryComponent[]>(initialStructure?.components || []);
  
  const [newComponentName, setNewComponentName] = useState('');
  const [newComponentType, setNewComponentType] = useState<'EARNING' | 'DEDUCTION'>('EARNING');
  const [newComponentAmount, setNewComponentAmount] = useState<string>('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const addComponent = () => {
    if (!newComponentName || !newComponentAmount) return;
    setComponents([
      ...components,
      {
        componentName: newComponentName,
        type: newComponentType,
        amount: Number(newComponentAmount)
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
  const monthlyBase = baseSalary / 12;
  const monthlyGross = monthlyBase + totalEarnings;
  const monthlyNet = monthlyGross - totalDeductions;
  
  // Assuming components are monthly amounts, annual CTC = baseSalary + (totalEarnings * 12)
  const annualCtc = baseSalary + (totalEarnings * 12);

  const saveMutation = useMutation({
    mutationFn: () => payrollApi.setSalaryStructure(employeeId, {
      baseSalary,
      currency,
      effectiveDate,
      components
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-salary', employeeId] });
      onClose();
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to save salary structure');
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
    <div className="flex flex-col gap-6">
      {error && <div className="p-3 bg-rose-500/20 text-rose-400 rounded-lg text-sm border border-rose-500/30">{error}</div>}
      
      {/* ── Core Details ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Annual Base Salary</span>
          <input type="number" value={baseSalary} onChange={(e) => setBaseSalary(Number(e.target.value))}
            className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg px-3 py-1.5 text-sm text-[var(--text-primary)] focus:outline-none" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Currency</span>
          <select value={currency} onChange={(e) => setCurrency(e.target.value)}
            className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg px-3 py-1.5 text-sm text-[var(--text-primary)]">
            <option value="USD">USD</option>
            <option value="INR">INR</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Effective Date</span>
          <input type="date" value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)}
            className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg px-3 py-1.5 text-sm text-[var(--text-primary)] focus:outline-none" />
        </label>
      </div>

      {/* ── Components list ── */}
      <div className="border border-[var(--border-color)] rounded-lg overflow-hidden">
        <table className="w-full text-left text-sm text-[var(--text-secondary)]">
          <thead className="bg-[var(--bg-tertiary)] text-[var(--text-muted)] border-b border-[var(--border-color)]">
            <tr>
              <th className="py-2 px-3 font-medium text-xs uppercase tracking-wider">Component Name</th>
              <th className="py-2 px-3 font-medium text-xs uppercase tracking-wider">Type</th>
              <th className="py-2 px-3 font-medium text-xs uppercase tracking-wider text-right">Amount (Monthly)</th>
              <th className="py-2 px-3 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-color)]">
            {components.map((c, i) => (
              <tr key={i} className="hover:bg-[var(--bg-hover)]">
                <td className="py-2 px-3 text-[var(--text-primary)] font-medium">{c.componentName}</td>
                <td className="py-2 px-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.type === 'EARNING' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                    {c.type}
                  </span>
                </td>
                <td className="py-2 px-3 text-right font-mono">${c.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                <td className="py-2 px-3 text-center">
                  <button onClick={() => removeComponent(i)} className="text-[var(--text-muted)] hover:text-rose-400 transition-colors">✕</button>
                </td>
              </tr>
            ))}
            
            {/* Add new component row */}
            <tr className="bg-[var(--bg-tertiary)]/50">
              <td className="py-2 px-3">
                <input placeholder="e.g. HRA, Special Allowance" value={newComponentName} onChange={e => setNewComponentName(e.target.value)}
                  className="bg-transparent border border-[var(--border-color)] rounded px-2 py-1 text-sm w-full focus:outline-none" />
              </td>
              <td className="py-2 px-3">
                <select value={newComponentType} onChange={e => setNewComponentType(e.target.value as any)}
                  className="bg-transparent border border-[var(--border-color)] rounded px-2 py-1 text-sm focus:outline-none">
                  <option value="EARNING">Earning</option>
                  <option value="DEDUCTION">Deduction</option>
                </select>
              </td>
              <td className="py-2 px-3 text-right">
                <input type="number" placeholder="Amount" value={newComponentAmount} onChange={e => setNewComponentAmount(e.target.value)}
                  className="bg-transparent border border-[var(--border-color)] rounded px-2 py-1 text-sm w-full max-w-[120px] text-right focus:outline-none" />
              </td>
              <td className="py-2 px-3 text-center">
                <button onClick={addComponent} disabled={!newComponentName || !newComponentAmount}
                  className="btn btn-sm btn-primary text-xs px-2 py-1 disabled:opacity-50">Add</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── CTC Calculator Widget ── */}
      <div className="bg-[var(--bg-tertiary)] p-4 rounded-lg border border-[var(--border-color)]">
        <h4 className="text-xs font-bold text-[var(--role-primary)] uppercase tracking-wider mb-4 flex items-center gap-2">
          <span className="text-lg">🧮</span> CTC Calculator (Preview)
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-[var(--text-muted)]">Monthly Base</span>
            <span className="text-sm font-mono">${monthlyBase.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-emerald-400">Total Earnings</span>
            <span className="text-sm font-mono">+ ${totalEarnings.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-rose-400">Total Deductions</span>
            <span className="text-sm font-mono">- ${totalDeductions.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex flex-col gap-1 pt-2 md:pt-0 md:border-l border-[var(--border-color)] md:pl-4">
            <span className="text-xs font-bold text-[var(--text-primary)]">Monthly Net Pay</span>
            <span className="text-lg font-bold font-mono text-emerald-400">${monthlyNet.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-[var(--border-color)] flex justify-between items-center">
          <div>
            <span className="text-xs text-[var(--text-muted)] block">Calculated Annual CTC</span>
            <span className="text-lg font-bold font-mono">${annualCtc.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="btn btn-sm text-xs">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn btn-sm btn-primary text-xs px-6">
              {saving ? 'Saving...' : '💾 Save Structure'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  Building2, 
  Layers, 
  Plus, 
  Search, 
  ShieldCheck, 
  CheckCircle2, 
  Edit3, 
  Trash2, 
  Percent,
  Calculator
} from 'lucide-react';

interface ComponentDefinition {
  id: string;
  name: string;
  code: string;
  type: 'EARNING' | 'DEDUCTION';
  calculationType: 'FLAT' | 'PERCENTAGE' | 'FORMULA';
  taxable: boolean;
  statutory: boolean;
  active: boolean;
}

const DEFAULT_COMPONENTS: ComponentDefinition[] = [
  {
    id: 'comp-basic',
    name: 'Basic Salary',
    code: 'BASIC',
    type: 'EARNING',
    calculationType: 'PERCENTAGE',
    taxable: true,
    statutory: true,
    active: true
  },
  {
    id: 'comp-hra',
    name: 'House Rent Allowance',
    code: 'HRA',
    type: 'EARNING',
    calculationType: 'PERCENTAGE',
    taxable: true,
    statutory: false,
    active: true
  },
  {
    id: 'comp-special',
    name: 'Special Allowance',
    code: 'SPL_ALW',
    type: 'EARNING',
    calculationType: 'FORMULA',
    taxable: true,
    statutory: false,
    active: true
  },
  {
    id: 'comp-pf',
    name: 'Provident Fund (Employee)',
    code: 'PF_EMP',
    type: 'DEDUCTION',
    calculationType: 'PERCENTAGE',
    taxable: false,
    statutory: true,
    active: true
  },
  {
    id: 'comp-pt',
    name: 'Professional Tax',
    code: 'PT',
    type: 'DEDUCTION',
    calculationType: 'FLAT',
    taxable: false,
    statutory: true,
    active: true
  }
];

export const SalaryComponentsPage: React.FC = () => {
  const [components] = useState<ComponentDefinition[]>(DEFAULT_COMPONENTS);
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = components.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-emerald-500 font-medium text-xs tracking-wider uppercase mb-1">
            <Calculator size={16} />
            <span>Payroll Configuration</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Salary Components Master</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            Define earnings and deductions used in salary structures across the organization.
          </p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium text-sm transition-all shadow-lg shadow-emerald-900/20 self-start md:self-auto">
          <Plus size={18} />
          <span>Create Component</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-color)]">
          <div className="flex justify-between items-center text-[var(--text-muted)] text-sm font-medium">
            <span>Total Components</span>
            <Layers size={18} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-[var(--text-primary)] mt-2">
            {components.length}
          </div>
        </div>
        
        <div className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-color)]">
          <div className="flex justify-between items-center text-[var(--text-muted)] text-sm font-medium">
            <span>Earnings Components</span>
            <CheckCircle2 size={18} className="text-cyan-500" />
          </div>
          <div className="text-2xl font-bold text-[var(--text-primary)] mt-2">
            {components.filter(c => c.type === 'EARNING').length}
          </div>
        </div>

        <div className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-color)]">
          <div className="flex justify-between items-center text-[var(--text-muted)] text-sm font-medium">
            <span>Deductions Components</span>
            <ShieldCheck size={18} className="text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-[var(--text-primary)] mt-2">
            {components.filter(c => c.type === 'DEDUCTION').length}
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center justify-between bg-[var(--bg-card)] p-4 rounded-xl border border-[var(--border-color)]">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
          <input
            type="text"
            placeholder="Search component by name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Component Table */}
      <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--bg-primary)] text-[var(--text-muted)] text-xs uppercase font-semibold border-b border-[var(--border-color)]">
              <tr>
                <th className="px-6 py-4">Component Details</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Calculation Base</th>
                <th className="px-6 py-4">Taxability</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)] text-[var(--text-primary)]">
              {filtered.map((comp) => (
                <tr key={comp.id} className="hover:bg-[var(--bg-primary)]/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-[var(--text-primary)]">{comp.name}</div>
                    <div className="text-xs text-[var(--text-muted)] font-mono">{comp.code}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${comp.type === 'EARNING' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                      {comp.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[var(--text-primary)] font-mono text-xs">{comp.calculationType}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 text-xs">
                      {comp.taxable ? <span className="text-amber-500 font-medium">Taxable</span> : <span className="text-emerald-500 font-medium">Non-Taxable</span>}
                      {comp.statutory && <span className="text-cyan-500 font-medium">Statutory</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium">
                    <span className="flex items-center gap-1.5 text-emerald-500 text-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                        <Edit3 size={16} />
                      </button>
                      <button className="p-1.5 text-[var(--text-muted)] hover:text-rose-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

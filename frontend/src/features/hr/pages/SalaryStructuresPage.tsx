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
  ArrowUpRight,
  TrendingUp,
  Percent
} from 'lucide-react';

interface SalaryStructure {
  id: string;
  name: string;
  code: string;
  description: string;
  basicPercentage: number;
  hraPercentage: number;
  specialAllowancePercentage: number;
  pfApplicable: boolean;
  esiApplicable: boolean;
  ptApplicable: boolean;
  activeEmployees: number;
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
}

const DEFAULT_STRUCTURES: SalaryStructure[] = [
  {
    id: 'struct-001',
    name: 'Executive Tech Band (Standard)',
    code: 'EXEC-TECH-A',
    description: 'Standard salary structure for Software Engineers and Tech Leads',
    basicPercentage: 50,
    hraPercentage: 20,
    specialAllowancePercentage: 30,
    pfApplicable: true,
    esiApplicable: true,
    ptApplicable: true,
    activeEmployees: 142,
    status: 'ACTIVE'
  },
  {
    id: 'struct-002',
    name: 'Senior Leadership (No ESI)',
    code: 'EXEC-LEAD-SR',
    description: 'Executive structure for Directors and VPs above ESI ceiling',
    basicPercentage: 55,
    hraPercentage: 25,
    specialAllowancePercentage: 20,
    pfApplicable: true,
    esiApplicable: false,
    ptApplicable: true,
    activeEmployees: 18,
    status: 'ACTIVE'
  },
  {
    id: 'struct-003',
    name: 'Contractual / Consultant Band',
    code: 'CONSULT-CONS',
    description: 'Fixed monthly fee structure for contractual consultants',
    basicPercentage: 100,
    hraPercentage: 0,
    specialAllowancePercentage: 0,
    pfApplicable: false,
    esiApplicable: false,
    ptApplicable: false,
    activeEmployees: 12,
    status: 'ACTIVE'
  }
];

export const SalaryStructuresPage: React.FC = () => {
  const [structures] = useState<SalaryStructure[]>(DEFAULT_STRUCTURES);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStructures = structures.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-emerald-500 font-medium text-xs tracking-wider uppercase mb-1">
            <Layers size={16} />
            <span>Payroll Configuration</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Salary Structures Master</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            Configure salary components, CTC breakup formulas, and statutory compliance applicability.
          </p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium text-sm transition-all shadow-lg shadow-emerald-900/20 self-start md:self-auto">
          <Plus size={18} />
          <span>Create Structure</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-color)]">
          <div className="flex justify-between items-center text-[var(--text-muted)] text-sm font-medium">
            <span>Total Active Structures</span>
            <Layers size={18} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-[var(--text-primary)] mt-2">
            {structures.length}
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-1">Covering 172 active employees</p>
        </div>

        <div className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-color)]">
          <div className="flex justify-between items-center text-[var(--text-muted)] text-sm font-medium">
            <span>Default Basic Wage Split</span>
            <Percent size={18} className="text-cyan-500" />
          </div>
          <div className="text-2xl font-bold text-[var(--text-primary)] mt-2">
            50% of CTC
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-1">Compliant with Code on Wages 2020</p>
        </div>

        <div className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-color)]">
          <div className="flex justify-between items-center text-[var(--text-muted)] text-sm font-medium">
            <span>Statutory Linkages</span>
            <ShieldCheck size={18} className="text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-[var(--text-primary)] mt-2">
            EPF, ESI & PT
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-1">Auto-mapped to monthly payroll engine</p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center justify-between bg-[var(--bg-card)] p-4 rounded-xl border border-[var(--border-color)]">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
          <input
            type="text"
            placeholder="Search structure by name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Structure Table */}
      <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--bg-primary)] text-[var(--text-muted)] text-xs uppercase font-semibold border-b border-[var(--border-color)]">
              <tr>
                <th className="px-6 py-4">Structure Name / Code</th>
                <th className="px-6 py-4">Basic / HRA / Special Split</th>
                <th className="px-6 py-4">Statutory Applicability</th>
                <th className="px-6 py-4">Mapped Employees</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)] text-[var(--text-primary)]">
              {filteredStructures.map((struct) => (
                <tr key={struct.id} className="hover:bg-[var(--bg-primary)]/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-[var(--text-primary)]">{struct.name}</div>
                    <div className="text-xs text-[var(--text-muted)] font-mono">{struct.code}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-xs">
                        Basic {struct.basicPercentage}%
                      </span>
                      <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-mono text-xs">
                        HRA {struct.hraPercentage}%
                      </span>
                      <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 font-mono text-xs">
                        Special {struct.specialAllowancePercentage}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs">
                      {struct.pfApplicable && <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-medium">PF</span>}
                      {struct.esiApplicable && <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-medium">ESI</span>}
                      {struct.ptApplicable && <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-medium">PT</span>}
                      {!struct.pfApplicable && !struct.esiApplicable && !struct.ptApplicable && (
                        <span className="text-[var(--text-muted)] font-italic">None</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium">
                    {struct.activeEmployees} employees
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium">
                      <CheckCircle2 size={12} />
                      {struct.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 text-[var(--text-muted)]">
                      <button className="p-1.5 hover:text-emerald-400 transition-colors">
                        <Edit3 size={16} />
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

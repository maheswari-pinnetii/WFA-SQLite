import React, { useState } from 'react';
import { 
  ShieldCheck, 
  FileCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Download, 
  Search, 
  Filter,
  FileSpreadsheet
} from 'lucide-react';

interface ComplianceModule {
  id: string;
  name: string;
  category: 'EPF' | 'ESI' | 'PT' | 'TDS';
  authority: string;
  dueDate: string;
  eligibleEmployees: number;
  compliantEmployees: number;
  pendingExceptions: number;
  status: 'COMPLIANT' | 'WARNING' | 'ACTION_REQUIRED';
}

const DEFAULT_MODULES: ComplianceModule[] = [
  {
    id: 'comp-001',
    name: 'Employees Provident Fund (EPF / EPS)',
    category: 'EPF',
    authority: 'EPFO India',
    dueDate: '15th of every month',
    eligibleEmployees: 156,
    compliantEmployees: 156,
    pendingExceptions: 0,
    status: 'COMPLIANT'
  },
  {
    id: 'comp-002',
    name: 'Employees State Insurance (ESIC)',
    category: 'ESI',
    authority: 'ESIC India',
    dueDate: '15th of every month',
    eligibleEmployees: 42,
    compliantEmployees: 42,
    pendingExceptions: 0,
    status: 'COMPLIANT'
  },
  {
    id: 'comp-003',
    name: 'Professional Tax (PT - State Slabs)',
    category: 'PT',
    authority: 'State Commercial Tax Dept',
    dueDate: 'Last day of month',
    eligibleEmployees: 172,
    compliantEmployees: 172,
    pendingExceptions: 0,
    status: 'COMPLIANT'
  },
  {
    id: 'comp-004',
    name: 'Tax Deducted at Source (TDS - Form 24Q)',
    category: 'TDS',
    authority: 'Income Tax Dept India',
    dueDate: 'Quarterly Filing',
    eligibleEmployees: 172,
    compliantEmployees: 168,
    pendingExceptions: 4,
    status: 'WARNING'
  }
];

export const StatutoryCompliancePage: React.FC = () => {
  const [modules] = useState<ComplianceModule[]>(DEFAULT_MODULES);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-emerald-500 font-medium text-xs tracking-wider uppercase mb-1">
            <ShieldCheck size={16} />
            <span>Indian Payroll Compliance</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Statutory Compliance Dashboard</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            Monitor Provident Fund (EPF), ESI, Professional Tax (PT), and TDS withholding statutory obligations.
          </p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium text-sm transition-all shadow-lg shadow-emerald-900/20 self-start md:self-auto">
          <Download size={18} />
          <span>Export Compliance Return</span>
        </button>
      </div>

      {/* Compliance Overview Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-color)]">
          <div className="text-[var(--text-muted)] text-sm font-medium">EPF Compliance Score</div>
          <div className="text-2xl font-bold text-emerald-400 mt-2">100%</div>
          <p className="text-xs text-[var(--text-muted)] mt-1">156 / 156 UAN verified</p>
        </div>

        <div className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-color)]">
          <div className="text-[var(--text-muted)] text-sm font-medium">ESIC Compliance Score</div>
          <div className="text-2xl font-bold text-emerald-400 mt-2">100%</div>
          <p className="text-xs text-[var(--text-muted)] mt-1">42 eligible employees mapped</p>
        </div>

        <div className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-color)]">
          <div className="text-[var(--text-muted)] text-sm font-medium">Professional Tax (PT)</div>
          <div className="text-2xl font-bold text-emerald-400 mt-2">100%</div>
          <p className="text-xs text-[var(--text-muted)] mt-1">State slab lookup active</p>
        </div>

        <div className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-color)]">
          <div className="text-[var(--text-muted)] text-sm font-medium">TDS Declarations Verified</div>
          <div className="text-2xl font-bold text-amber-400 mt-2">97.6%</div>
          <p className="text-xs text-amber-400 mt-1">4 pending proof approvals</p>
        </div>
      </div>

      {/* Compliance Modules Table */}
      <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] overflow-hidden">
        <div className="p-4 border-b border-[var(--border-color)] font-semibold text-[var(--text-primary)]">
          Statutory Returns & Filings Checklist
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--bg-primary)] text-[var(--text-muted)] text-xs uppercase font-semibold border-b border-[var(--border-color)]">
              <tr>
                <th className="px-6 py-4">Statutory Head</th>
                <th className="px-6 py-4">Governing Authority</th>
                <th className="px-6 py-4">Filing Frequency / Due Date</th>
                <th className="px-6 py-4">Eligible Employees</th>
                <th className="px-6 py-4">Pending Exceptions</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)] text-[var(--text-primary)]">
              {modules.map((m) => (
                <tr key={m.id} className="hover:bg-[var(--bg-primary)]/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-[var(--text-primary)]">{m.name}</div>
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">
                      {m.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[var(--text-muted)]">{m.authority}</td>
                  <td className="px-6 py-4 text-[var(--text-muted)]">{m.dueDate}</td>
                  <td className="px-6 py-4 font-medium">{m.eligibleEmployees}</td>
                  <td className="px-6 py-4">
                    {m.pendingExceptions > 0 ? (
                      <span className="text-amber-400 font-semibold">{m.pendingExceptions} missing declarations</span>
                    ) : (
                      <span className="text-emerald-400 font-medium">0 exceptions</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {m.status === 'COMPLIANT' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium">
                        <CheckCircle2 size={12} />
                        Compliant
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-medium">
                        <AlertTriangle size={12} />
                        Action Needed
                      </span>
                    )}
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

import React, { useState } from 'react';
import { ShieldAlert, CheckCircle, AlertTriangle, UserCheck } from 'lucide-react';
import { Button } from '../../../components/ui/button';

export const ProbationPage: React.FC = () => {
  const [employees] = useState([
    { id: 'emp-2001', name: 'Alice Walker', role: 'Frontend Developer', probationEnd: '2026-12-15', status: 'On Track' },
    { id: 'emp-2002', name: 'Bob Smith', role: 'QA Engineer', probationEnd: '2026-10-30', status: 'Needs Review' }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-[var(--text-primary)]">
            <ShieldAlert className="text-amber-500" />
            Probation Tracking
          </h1>
          <p className="text-slate-400 mt-1">Monitor probation periods, reviews, and initiate confirmations.</p>
        </div>
        <Button className="flex items-center gap-2" variant="outline">
          <AlertTriangle size={16} /> Approaching Deadlines
        </Button>
      </div>

      <div className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-800/50">
            <tr>
              <th className="p-4 font-semibold text-sm text-slate-300">Employee</th>
              <th className="p-4 font-semibold text-sm text-slate-300">Role</th>
              <th className="p-4 font-semibold text-sm text-slate-300">Probation End Date</th>
              <th className="p-4 font-semibold text-sm text-slate-300">Status</th>
              <th className="p-4 font-semibold text-sm text-slate-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-color)]">
            {employees.map(emp => (
              <tr key={emp.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="p-4">
                  <div className="font-medium text-[var(--text-primary)]">{emp.name}</div>
                  <div className="text-xs text-slate-400">{emp.id}</div>
                </td>
                <td className="p-4 text-sm text-slate-300">{emp.role}</td>
                <td className="p-4 text-sm text-slate-300">{emp.probationEnd}</td>
                <td className="p-4">
                  {emp.status === 'Needs Review' ? (
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1.5 w-max">
                      <AlertTriangle size={12} /> {emp.status}
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 w-max">
                      <CheckCircle size={12} /> {emp.status}
                    </span>
                  )}
                </td>
                <td className="p-4">
                  <Button size="sm" className="text-xs h-8 flex items-center gap-1">
                    <UserCheck size={14} /> Initiate Confirmation
                  </Button>
                </td>
              </tr>
            ))}
            {employees.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-400">
                  No employees currently on probation.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

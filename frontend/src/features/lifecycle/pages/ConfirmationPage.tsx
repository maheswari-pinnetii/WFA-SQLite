import React, { useState } from 'react';
import { UserCheck, FileCheck, CheckCircle2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';

export const ConfirmationPage: React.FC = () => {
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');

  const employeesToConfirm = [
    { id: 'emp-2001', name: 'Alice Walker', role: 'Frontend Developer', department: 'Engineering' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-[var(--text-primary)]">
            <UserCheck className="text-blue-500" />
            Employee Confirmation
          </h1>
          <p className="text-slate-400 mt-1">Formally confirm employees after successful probation periods.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-xl p-4">
          <h2 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <FileCheck size={18} className="text-slate-400" /> Pending Confirmations
          </h2>
          <div className="space-y-2">
            {employeesToConfirm.map(emp => (
              <button
                key={emp.id}
                onClick={() => setSelectedEmployee(emp.id)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${selectedEmployee === emp.id ? 'bg-blue-500/10 border-blue-500/30' : 'bg-slate-800/20 border-transparent hover:bg-slate-800/50'}`}
              >
                <div className="font-medium text-slate-200">{emp.name}</div>
                <div className="text-xs text-slate-400">{emp.role} • {emp.department}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="md:col-span-2 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-xl p-6">
          {selectedEmployee ? (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-lg font-semibold text-slate-200">Confirmation Details</h3>
                <p className="text-sm text-slate-400">Please review and finalize the confirmation status.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Effective Date</label>
                  <input type="date" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">New Employment Type</label>
                  <select className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none">
                    <option>Permanent Full-Time</option>
                    <option>Contract</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Manager Comments (Optional)</label>
                <textarea rows={4} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 focus:border-blue-500 focus:outline-none" placeholder="Add any feedback for the employee file..." />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <Button variant="outline">Cancel</Button>
                <Button className="flex items-center gap-2">
                  <CheckCircle2 size={16} /> Confirm Employee
                </Button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12">
              <UserCheck size={48} className="mb-4 text-slate-600" />
              <p>Select an employee from the list to initiate confirmation.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

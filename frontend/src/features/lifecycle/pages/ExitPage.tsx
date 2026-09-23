import React, { useState } from 'react';
import { LogOut, CheckCircle, Clock, FileText, Calculator } from 'lucide-react';
import { Button } from '../../../components/ui/button';

export const ExitPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');

  const pendingExits = [
    { id: 'emp-3001', name: 'Chris Evans', role: 'Backend Dev', exitDate: '2026-11-01', status: 'Notice Period', fnfStatus: 'Pending Calculation' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-[var(--text-primary)]">
            <LogOut className="text-red-500" />
            Employee Exit & Offboarding
          </h1>
          <p className="text-slate-400 mt-1">Manage resignations, notice periods, exit interviews, and Full & Final (F&F) Settlements.</p>
        </div>
        <Button className="flex items-center gap-2" variant="outline">
          <FileText size={16} /> View Exit Reports
        </Button>
      </div>

      <div className="flex gap-4 mb-4">
        <button
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'pending' ? 'bg-red-500/10 text-red-400 border border-red-500/30' : 'text-slate-400 hover:text-slate-200'}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Exits
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'completed' ? 'bg-red-500/10 text-red-400 border border-red-500/30' : 'text-slate-400 hover:text-slate-200'}`}
          onClick={() => setActiveTab('completed')}
        >
          Completed F&F
        </button>
      </div>

      <div className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-800/50">
            <tr>
              <th className="p-4 font-semibold text-sm text-slate-300">Employee</th>
              <th className="p-4 font-semibold text-sm text-slate-300">Role</th>
              <th className="p-4 font-semibold text-sm text-slate-300">Exit Date</th>
              <th className="p-4 font-semibold text-sm text-slate-300">Status</th>
              <th className="p-4 font-semibold text-sm text-slate-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-color)]">
            {activeTab === 'pending' ? (
              pendingExits.map(emp => (
                <tr key={emp.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-4">
                    <div className="font-medium text-[var(--text-primary)]">{emp.name}</div>
                    <div className="text-xs text-slate-400">{emp.id}</div>
                  </td>
                  <td className="p-4 text-sm text-slate-300">{emp.role}</td>
                  <td className="p-4 text-sm text-slate-300">{emp.exitDate}</td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1.5 w-max">
                        <Clock size={10} /> {emp.status}
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1.5 w-max">
                        <Calculator size={10} /> {emp.fnfStatus}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 space-x-2">
                    <Button size="sm" variant="outline" className="text-xs h-8">Calculate F&F</Button>
                    <Button size="sm" className="text-xs h-8 bg-red-600 hover:bg-red-700 text-white border-transparent">Offboard</Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-400">
                  <CheckCircle size={32} className="mx-auto mb-2 text-emerald-500/50" />
                  <p>No recent completed offboardings.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

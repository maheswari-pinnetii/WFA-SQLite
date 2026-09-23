import React, { useState } from 'react';
import { Users, FileText, CheckCircle, Clock } from 'lucide-react';
import { Button } from '../../../components/ui/button';

export const OnboardingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');

  const pendingOnboarding = [
    { id: 'emp-1001', name: 'John Doe', role: 'Software Engineer', joinDate: '2026-10-01', status: 'Documents Pending' },
    { id: 'emp-1002', name: 'Jane Smith', role: 'Product Manager', joinDate: '2026-10-05', status: 'Orientation Scheduled' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-[var(--text-primary)]">
            <Users className="text-emerald-500" />
            Employee Onboarding
          </h1>
          <p className="text-slate-400 mt-1">Manage new hires, document collection, and orientation schedules.</p>
        </div>
        <Button className="flex items-center gap-2">
          <FileText size={16} /> Generate Onboarding Report
        </Button>
      </div>

      <div className="flex gap-4 mb-4">
        <button
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'pending' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Onboarding
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'}`}
          onClick={() => setActiveTab('completed')}
        >
          Completed
        </button>
      </div>

      <div className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-800/50">
            <tr>
              <th className="p-4 font-semibold text-sm text-slate-300">Employee</th>
              <th className="p-4 font-semibold text-sm text-slate-300">Role</th>
              <th className="p-4 font-semibold text-sm text-slate-300">Join Date</th>
              <th className="p-4 font-semibold text-sm text-slate-300">Status</th>
              <th className="p-4 font-semibold text-sm text-slate-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-color)]">
            {activeTab === 'pending' ? (
              pendingOnboarding.map(emp => (
                <tr key={emp.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-4">
                    <div className="font-medium text-[var(--text-primary)]">{emp.name}</div>
                    <div className="text-xs text-slate-400">{emp.id}</div>
                  </td>
                  <td className="p-4 text-sm text-slate-300">{emp.role}</td>
                  <td className="p-4 text-sm text-slate-300">{emp.joinDate}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1.5 w-max">
                      <Clock size={12} /> {emp.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <Button size="sm" variant="outline" className="text-xs h-8">View Checklist</Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-400">
                  <CheckCircle size={32} className="mx-auto mb-2 text-emerald-500/50" />
                  <p>No recent completed onboardings.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

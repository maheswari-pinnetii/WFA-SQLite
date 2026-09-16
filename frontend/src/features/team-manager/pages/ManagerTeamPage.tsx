import React, { useState } from 'react';
import { EmployeeTable } from '../../../components/tables/EmployeeTable';
import { EmployeeQuickView, EmployeeQuickViewData } from '../../../components/employee/EmployeeQuickView';
import { Users, Filter, UserCheck, ShieldCheck } from 'lucide-react';

export const ManagerTeamPage: React.FC = () => {
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeQuickViewData | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  return (
    <div className="space-y-6 animate-fadeIn font-sans pb-10">
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800 flex items-center justify-center shrink-0">
            <Users size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                Authorized Department Team Roster
              </h1>
              <span className="badge badge-primary">Department Manager Scope</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Complete direct reports and sub-team staff roster, live attendance states, and sprint performance.
            </p>
          </div>
        </div>
      </div>

      <EmployeeTable deptFilter="Engineering" />

      <EmployeeQuickView
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        employee={selectedEmployee}
      />
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { RoleGuard } from '../../../security/guards/RoleGuard';
import { Role } from '../../../security/roles/roles';
import { Building2, Plus, Edit3, Trash2, Loader2 } from 'lucide-react';
import { Button } from '../../../shared/components/Button';

export const DepartmentsManagement: React.FC = () => {
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/departments', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setDepartments(data.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch departments:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-emerald-500" size={32} /></div>;

  return (
    <RoleGuard allowedRoles={[Role.ADMIN]}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
              <Building2 className="text-emerald-400" size={24} />
              Enterprise Department Management
            </h2>
            <p className="text-sm text-slate-400">
              Manage organizational hierarchy, cost center budgets, and department head assignments.
            </p>
          </div>
          <Button variant="primary" className="flex items-center gap-2">
            <Plus size={16} /> Add New Department
          </Button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-panel p-5 border-l-4 border-emerald-500">
            <div className="text-xs font-semibold text-slate-400">Total Active Departments</div>
            <div className="text-2xl font-black mt-1">{departments.length} Business Units</div>
          </div>
          <div className="glass-panel p-5 border-l-4 border-emerald-500">
            <div className="text-xs font-semibold text-slate-400">Total Assigned Headcount</div>
            <div className="text-2xl font-black mt-1">Pending Sync</div>
          </div>
          <div className="glass-panel p-5 border-l-4 border-emerald-500">
            <div className="text-xs font-semibold text-slate-400">Annual Budget Allocation</div>
            <div className="text-2xl font-black mt-1">Pending Sync</div>
          </div>
        </div>

        {/* Department List */}
        <div className="glass-panel p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-800/40 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Department Name</th>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Department Head</th>
                  <th className="py-3 px-4">Headcount</th>
                  <th className="py-3 px-4">Annual Budget</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {departments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-slate-800/20">
                    <td className="py-3 px-4 font-bold text-slate-100 flex items-center gap-2">
                      <Building2 size={16} className="text-emerald-400" />
                      {dept.name}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-emerald-400">{dept.id || dept.code}</td>
                    <td className="py-3 px-4 font-medium text-slate-300">{dept.head || 'Unassigned'}</td>
                    <td className="py-3 px-4 font-semibold text-slate-200">{dept.headcount || 0} Staff</td>
                    <td className="py-3 px-4 font-mono text-emerald-400 font-bold">{dept.budget || '$0'}</td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <Button variant="ghost" size="sm"><Edit3 size={14} /></Button>
                      <Button variant="ghost" size="sm" className="text-rose-400"><Trash2 size={14} /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
};

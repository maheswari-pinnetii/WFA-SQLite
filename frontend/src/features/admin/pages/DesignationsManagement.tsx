import React, { useState, useEffect } from 'react';
import { RoleGuard } from '../../../security/guards/RoleGuard';
import { Role } from '../../../security/roles/roles';
import { Briefcase, Plus, Edit3, Trash2, Loader2, Target } from 'lucide-react';
import { Button } from '../../../shared/components/Button';

export const DesignationsManagement: React.FC = () => {
  const [designations, setDesignations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/designations', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setDesignations(data.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch designations:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-emerald-500" size={32} /></div>;

  return (
    <RoleGuard allowedRoles={[Role.ADMIN, Role.HR]}>
      <div className="space-y-6 animate-fadeIn pb-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight flex items-center gap-2 text-[var(--text-primary)]">
              <Briefcase className="text-emerald-400" size={24} />
              Corporate Designations
            </h2>
            <p className="text-sm text-slate-400">
              Manage job titles, hierarchies, and default permissions.
            </p>
          </div>
          <Button variant="primary" className="flex items-center gap-2">
            <Plus size={16} /> Create Designation
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-panel p-5 border-l-4 border-emerald-500">
            <div className="text-xs font-semibold text-slate-400">Active Job Titles</div>
            <div className="text-2xl font-black mt-1 text-[var(--text-primary)]">{designations.length} Roles</div>
          </div>
          <div className="glass-panel p-5 border-l-4 border-emerald-500">
            <div className="text-xs font-semibold text-slate-400">Highest Level</div>
            <div className="text-2xl font-black mt-1 text-[var(--text-primary)]">CxO</div>
          </div>
        </div>

        {/* Designations Table */}
        <div className="glass-panel p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--bg-tertiary)] text-[var(--text-muted)] border-b border-[var(--border-color)]">
                <tr>
                  <th className="py-3 px-4">Job Title</th>
                  <th className="py-3 px-4">Level</th>
                  <th className="py-3 px-4">Base Department</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {designations.map((desig) => (
                  <tr key={desig.id} className="hover:bg-[var(--bg-tertiary)] transition-colors">
                    <td className="py-3 px-4 font-bold text-[var(--text-primary)] flex items-center gap-2">
                      <Target size={16} className="text-emerald-400" />
                      {desig.title}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-emerald-400">Level {desig.level || 1}</td>
                    <td className="py-3 px-4 font-medium text-[var(--text-muted)]">{desig.department || 'Global'}</td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <Button variant="ghost" size="sm"><Edit3 size={14} /></Button>
                      <Button variant="ghost" size="sm" className="text-rose-400"><Trash2 size={14} /></Button>
                    </td>
                  </tr>
                ))}
                {designations.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-[var(--text-muted)]">No designations found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
};

import React from 'react';
import { RoleGuard } from '../../../security/guards/RoleGuard';
import { Role } from '../../../security/roles/roles';
import { ExportReport } from '../../reports/components/ExportReport';

export const TeamReports: React.FC = () => {
  return (
    <RoleGuard allowedRoles={[Role.ADMIN, Role.HR, Role.MANAGER, Role.TEAM_LEAD]}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">Team Reports & Exports</h2>
          <p className="text-sm text-slate-400">Generate and export engineering squad attendance, capacity, and workforce datasets</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ExportReport 
            title="Team Attendance & Hours Audit" 
            subtitle="Department punch records, break durations, and work hours"
            reportType="attendance" 
          />
          <ExportReport 
            title="Squad Roster & Directory" 
            subtitle="Active team members, designations, and locations"
            reportType="workforce" 
          />
        </div>
      </div>
    </RoleGuard>
  );
};

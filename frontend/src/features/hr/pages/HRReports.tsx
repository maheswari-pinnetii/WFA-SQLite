import React, { useState } from 'react';
import { RoleGuard } from '../../../security/guards/RoleGuard';
import { Role } from '../../../security/roles/roles';
import { Permission } from '../../../security/permissions/permissions';
import { ExportReport } from '../../reports/components/ExportReport';
import { reportApi, ReportType } from '../../../api/endpoints/report.api';
import { FileText, Download, Users, Clock, CalendarDays, Loader2 } from 'lucide-react';

export const HRReports: React.FC = () => {
  const [downloadingArchived, setDownloadingArchived] = useState<string | null>(null);

  const reportsList: { name: string; date: string; type: ReportType; desc: string }[] = [
    { name: 'Monthly Payroll & Work Hours Audit', date: 'Current Month', type: 'attendance', desc: 'Raw attendance timestamps, hours worked, and break minutes' },
    { name: 'Equal Opportunity & Headcount Directory', date: 'Current Quarter', type: 'workforce', desc: 'Active headcount, departments, teams, and locations' },
    { name: 'Leave Applications & Absences Ledger', date: 'Year to Date', type: 'leave', desc: 'Approved, pending, and rejected employee leave records' },
  ];

  const handleDownloadArchived = async (type: ReportType, name: string) => {
    try {
      setDownloadingArchived(name);
      await reportApi.exportReport(type, 'csv');
    } catch (err) {
      console.error('Failed to download archived report:', err);
    } finally {
      setDownloadingArchived(null);
    }
  };

  return (
    <RoleGuard allowedRoles={[Role.ADMIN, Role.HR]} requiredPermission={Permission.REPORT_VIEW}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">HR Intelligence & Compliance Reports</h2>
          <p className="text-sm text-slate-400">Export verified workforce data, compliance audit trails, and payroll datasets from SQLite</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ExportReport 
            title="Attendance & Hours Report" 
            subtitle="Punches, shifts, breaks, and durations"
            reportType="attendance" 
          />
          <ExportReport 
            title="Workforce Roster Export" 
            subtitle="Active directory, departments, and roles"
            reportType="workforce" 
          />
          <ExportReport 
            title="Leave & Absence Ledger" 
            subtitle="Approved and pending leave requests"
            reportType="leave" 
          />
        </div>

        <div className="glass-panel p-6">
          <h3 className="text-base font-bold mb-4">Standard Regulatory & Compliance Exports</h3>
          <div className="space-y-3">
            {reportsList.map((r, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:border-indigo-500/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                    {r.type === 'attendance' && <Clock size={20} />}
                    {r.type === 'workforce' && <Users size={20} />}
                    {r.type === 'leave' && <CalendarDays size={20} />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">{r.name}</h4>
                    <p className="text-xs text-slate-400">{r.desc} • Period: {r.date}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleDownloadArchived(r.type, r.name)}
                  disabled={downloadingArchived === r.name}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors text-slate-200 disabled:opacity-50"
                >
                  {downloadingArchived === r.name ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download size={14} />
                      Download CSV
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </RoleGuard>
  );
};

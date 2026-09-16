import React, { useState } from 'react';
import { X, Layers, Filter, Search, Download, CheckCircle2, User, Clock, AlertTriangle } from 'lucide-react';
import { EmployeeStatus } from '../employee/EmployeeStatus';

export interface DrillDownFilterContext {
  title: string;
  metricValue: string | number;
  subtitle?: string;
  category?: string;
  filterType?: 'present' | 'late' | 'leave' | 'absent' | 'approvals' | 'dept' | 'general';
  records?: Array<{
    id: string;
    name: string;
    role?: string;
    department?: string;
    team?: string;
    metric?: string;
    status?: string;
    checkInTime?: string;
    checkOutTime?: string;
  }>;
}

interface DrillDownDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  context: DrillDownFilterContext | null;
}

export const DrillDownDrawer: React.FC<DrillDownDrawerProps> = ({ isOpen, onClose, context }) => {
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');

  if (!isOpen || !context) return null;

  const records = context.records || [
    { id: 'STK-001', name: 'Rahul Sharma', role: 'Frontend Dev', department: 'Engineering', team: 'Frontend Squad', metric: '98.5% On-Time', status: 'Present', checkInTime: '09:02 AM' },
    { id: 'STK-002', name: 'Priya Mehta', role: 'Backend Lead', department: 'Engineering', team: 'Backend Squad', metric: '94.2% Attendance', status: 'Late', checkInTime: '09:25 AM' },
    { id: 'STK-003', name: 'Amit Kumar', role: 'QA Specialist', department: 'Engineering', team: 'QA Squad', metric: 'Casual Leave', status: 'On Leave', checkInTime: '—' },
    { id: 'STK-004', name: 'Neha Verma', role: 'UI/UX Designer', department: 'Product Operations', team: 'Design Squad', metric: '99.0% Attendance', status: 'Present', checkInTime: '08:58 AM' },
    { id: 'STK-005', name: 'Siddharth Nair', role: 'DevOps Engineer', department: 'Engineering', team: 'Infra Squad', metric: '96.4% On-Time', status: 'Present', checkInTime: '09:05 AM' },
  ];

  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      (r.department && r.department.toLowerCase().includes(search.toLowerCase())) ||
      (r.role && r.role.toLowerCase().includes(search.toLowerCase()));

    const matchesDept = departmentFilter === 'ALL' || r.department === departmentFilter;

    return matchesSearch && matchesDept;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between overflow-y-auto">
          {/* Header */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <Layers size={20} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-0.5">
                  {context.category || 'Workforce Metric Drill-Down'}
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{context.title}</h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5 flex-1 text-xs">
            {/* Metric Summary Card */}
            <div className="p-5 rounded-xl bg-gradient-to-r from-emerald-500/10 via-slate-50 dark:via-slate-950 to-blue-500/10 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Aggregated Value
                </span>
                <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">{context.metricValue}</span>
                {context.subtitle && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{context.subtitle}</p>
                )}
              </div>
              <button
                onClick={() => alert(`Exported ${filteredRecords.length} records to CSV.`)}
                className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <Download size={14} /> Export List
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter by name, ID, department..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter size={13} className="text-slate-400 shrink-0" />
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer font-medium"
                >
                  <option value="ALL">All Departments</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Product Operations">Product Operations</option>
                  <option value="Sales & Marketing">Sales & Marketing</option>
                </select>
              </div>
            </div>

            {/* Records List Table */}
            <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <table className="w-full text-left text-xs min-w-[500px]">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 uppercase font-semibold text-[10px] tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Employee</th>
                    <th className="py-2.5 px-3">Department & Team</th>
                    <th className="py-2.5 px-3">Check-In</th>
                    <th className="py-2.5 px-3">Metric / Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400">
                        No matching records for drill-down criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900 dark:text-slate-100">{row.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{row.id} &bull; {row.role || 'Staff'}</div>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-medium text-slate-700 dark:text-slate-300">{row.department || 'Engineering'}</div>
                          <div className="text-[10px] text-slate-400">{row.team || 'Core Squad'}</div>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-400 font-semibold">
                          {row.checkInTime || '09:00 AM'}
                        </td>
                        <td className="py-2.5 px-3">
                          <EmployeeStatus status={row.status} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-between text-xs text-slate-500">
            <span>Showing {filteredRecords.length} authorized items</span>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold cursor-pointer"
            >
              Close Drawer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

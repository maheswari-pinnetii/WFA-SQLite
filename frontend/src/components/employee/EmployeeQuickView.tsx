import React from 'react';
import { X, User, Building2, MapPin, Calendar, Clock, Briefcase, CheckCircle2, Award, Zap, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface EmployeeQuickViewData {
  id: string;
  name: string;
  employeeCode?: string;
  role?: string;
  department?: string;
  team?: string;
  designation?: string;
  location?: string;
  status?: string;
  attendanceStatus?: string;
  checkInTime?: string;
  checkOutTime?: string;
  workingHours?: string;
  attendanceRate?: string | number;
  currentSprint?: string;
  activeTasksCount?: number;
  completedTasksCount?: number;
  performanceScore?: number;
  joinDate?: string;
}

interface EmployeeQuickViewProps {
  isOpen: boolean;
  onClose: () => void;
  employee: EmployeeQuickViewData | null;
}

export const EmployeeQuickView: React.FC<EmployeeQuickViewProps> = ({ isOpen, onClose, employee }) => {
  if (!isOpen || !employee) return null;

  const initials = employee.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between overflow-y-auto">
          {/* Header */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold text-lg flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800">
                {initials}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{employee.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  {employee.employeeCode || employee.id} &bull; {employee.designation || employee.role || 'Staff Member'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body Sections */}
          <div className="p-6 space-y-6 flex-1 text-xs">
            {/* Profile Overview */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <User size={14} className="text-emerald-500" /> Employee Profile
              </h4>
              <div className="grid grid-cols-2 gap-2.5 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 font-medium block">Department</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{employee.department || 'Engineering'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-medium block">Team Squad</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{employee.team || 'Frontend'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-medium block">Location</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{employee.location || 'Bengaluru Hub'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-medium block">Joining Date</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{employee.joinDate || 'Jan 15, 2024'}</span>
                </div>
              </div>
            </div>

            {/* Today's Attendance & Shift Details */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Clock size={14} className="text-emerald-500" /> Today's Attendance & Shift
              </h4>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase">{employee.attendanceStatus || 'Present / On-Time'}</span>
                </div>
                <div className="flex items-center justify-between font-mono">
                  <span className="text-slate-500">Check-In:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{employee.checkInTime || '09:02 AM'}</span>
                </div>
                <div className="flex items-center justify-between font-mono">
                  <span className="text-slate-500">Check-Out:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{employee.checkOutTime || 'Active Shift'}</span>
                </div>
                <div className="flex items-center justify-between font-mono pt-1 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500">Working Duration:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{employee.workingHours || '7h 45m'}</span>
                </div>
              </div>
            </div>

            {/* Active Sprint & Workload */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Briefcase size={14} className="text-emerald-500" /> Sprint & Task Progress
              </h4>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Active Sprint:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{employee.currentSprint || 'Sprint 24B Core UI'}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center pt-1">
                  <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-medium">Active Tasks</span>
                    <span className="text-base font-bold text-amber-500">{employee.activeTasksCount ?? 4}</span>
                  </div>
                  <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-medium">Completed Tasks</span>
                    <span className="text-base font-bold text-emerald-500">{employee.completedTasksCount ?? 12}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Score */}
            <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award size={18} className="text-emerald-500" />
                <span className="font-semibold text-slate-800 dark:text-slate-200">Performance Index</span>
              </div>
              <span className="font-mono text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                {employee.performanceScore ?? 96.5}%
              </span>
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-between">
            <Link
              to={`/hr/employees/${employee.id}`}
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <span>Full Employee Profile</span>
              <ExternalLink size={13} />
            </Link>
            <button
              onClick={onClose}
              className="px-3 py-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xs font-semibold cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { RoleGuard } from '../../../security/guards/RoleGuard';
import { Role } from '../../../security/roles/roles';
import { MinimalKpiCard } from '../../../components/ui/MinimalKpiCard';
import { Clock, ShieldCheck, Activity, Users, Plus, Edit2, CheckCircle2, UserCheck, AlertCircle, Save } from 'lucide-react';
import { useAuth } from '../../../auth/hooks/useAuth';
import { Button } from '../../../components/ui/button';

import { ShiftDefinition, DEFAULT_SHIFTS } from '../../../shared/types/shifts.types';

export const ShiftsPage: React.FC = () => {
  const { role, user } = useAuth();
  const [shifts, setShifts] = useState<ShiftDefinition[]>(() => {
    const saved = localStorage.getItem('wfa_corporate_shifts');
    return saved ? JSON.parse(saved) : DEFAULT_SHIFTS;
  });

  const [selectedShift, setSelectedShift] = useState<string>(() => {
    return localStorage.getItem('wfa_active_shift_id') || 'SH-01';
  });

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignSuccessMsg, setAssignSuccessMsg] = useState('');

  const isManagerOrAdmin = role === Role.ADMIN || role === Role.HR || role === Role.MANAGER;

  useEffect(() => {
    localStorage.setItem('wfa_corporate_shifts', JSON.stringify(shifts));
  }, [shifts]);

  const handleSetActiveShift = (shiftId: string) => {
    setSelectedShift(shiftId);
    localStorage.setItem('wfa_active_shift_id', shiftId);
    const chosen = shifts.find(s => s.id === shiftId);
    if (chosen) {
      localStorage.setItem('wfa_employee_assigned_shift', JSON.stringify(chosen));
    }
    setAssignSuccessMsg(`Shift successfully updated and assigned! Employee dashboards will now reflect ${chosen?.name}.`);
    setTimeout(() => setAssignSuccessMsg(''), 4000);
  };

  const activeShift = shifts.find(s => s.id === selectedShift) || shifts[0];

  return (
    <RoleGuard allowedRoles={[Role.ADMIN, Role.HR, Role.MANAGER, Role.TEAM_LEAD, Role.EMPLOYEE]}>
      <div className="space-y-6 animate-fadeIn pb-10 font-sans">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[var(--border-color)] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="badge badge-manager mb-1 uppercase tracking-wider text-[10px] font-black">
                Workforce Scheduling Hub
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Active: {activeShift.name} ({activeShift.code})
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
              Shift Timings & Work Schedules
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Standard 9.0 Hours Shift Policy (8.0 Hours Work + 1.0 Hour Break) across all corporate departments.
            </p>
          </div>
          {isManagerOrAdmin && (
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={() => setShowAssignModal(true)} className="text-xs">
                <UserCheck size={14} className="mr-1.5" /> Assign Shift to Team
              </Button>
            </div>
          )}
        </div>

        {assignSuccessMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 size={16} />
            {assignSuccessMsg}
          </div>
        )}

        {/* Top KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <MinimalKpiCard title="Active Shift" value={activeShift.name} icon={<Clock size={26} />} iconBgColor="blue" trend={`${activeShift.startTime} – ${activeShift.endTime}`} trendType="positive" />
          <MinimalKpiCard title="Standard Policy" value="9h = 8h Work + 1h Break" icon={<Activity size={26} />} iconBgColor="emerald" trend="Mandatory 60m Break" trendType="positive" />
          <MinimalKpiCard title="Roster Adherence" value={activeShift.compliance} icon={<ShieldCheck size={26} />} iconBgColor="purple" trend="On-time shift arrival" trendType="positive" />
          <MinimalKpiCard title="Allocated Staff" value={`${activeShift.allocatedCount} Employees`} icon={<Users size={26} />} iconBgColor="amber" trend="Covering all depts" trendType="positive" />
        </div>

        {/* Active Shift Highlight Card */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/30 shadow-2xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-wider">
                CURRENTLY ASSIGNED TO WORK
              </span>
              <h2 className="text-xl font-black text-white flex items-center gap-2 mt-0.5">
                {activeShift.name} ({activeShift.code})
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                Scheduled for: <strong className="text-white">{user?.name || 'All Active Employees'}</strong> &bull; Department: <strong className="text-emerald-400">{user?.department || 'Engineering & Technology'}</strong>
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Scheduled Time Window</span>
              <p className="font-mono text-base font-black text-emerald-400">{activeShift.startTime} – {activeShift.endTime}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-0.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Total Shift Span</span>
              <p className="font-mono text-sm font-black text-white">{activeShift.totalHours}.0 Hours</p>
              <p className="text-[10px] text-slate-400">Total duration at work</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-0.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Net Work Required</span>
              <p className="font-mono text-sm font-black text-emerald-400">{activeShift.workHours}.0 Hours Work</p>
              <p className="text-[10px] text-slate-400">40.0 Hours / Week</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-0.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Break Allowance</span>
              <p className="font-mono text-sm font-black text-amber-400">{activeShift.breakHours}.0 Hour (60m)</p>
              <p className="text-[10px] text-slate-400">Lunch + Tea breaks</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-0.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Grace Window</span>
              <p className="font-mono text-sm font-black text-cyan-400">{activeShift.graceMinutes} Minutes</p>
              <p className="text-[10px] text-slate-400">Late mark starts at 09:15 AM</p>
            </div>
          </div>
        </div>

        {/* Corporate Shift Roster Registry */}
        <div className="glass-panel p-6 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-color)]">
            <div>
              <h3 className="text-base font-extrabold text-[var(--text-primary)]">Corporate Shift Roster Registry</h3>
              <p className="text-xs text-slate-400 mt-0.5">Available organizational shift options configured by HR & Operations.</p>
            </div>
            <span className="text-xs text-slate-400 font-bold bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
              3 Configured Shifts
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)]/20">
            <table className="w-full text-left text-xs min-w-[750px]">
              <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Shift Name</th>
                  <th className="py-3 px-4">Timings</th>
                  <th className="py-3 px-4">Work / Break Breakdown</th>
                  <th className="py-3 px-4">Working Days</th>
                  <th className="py-3 px-4">Departments</th>
                  <th className="py-3 px-4 text-center">Assigned Status</th>
                  {isManagerOrAdmin && <th className="py-3 px-4 text-right">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {shifts.map((shift) => {
                  const isAssigned = shift.id === selectedShift;
                  return (
                    <tr key={shift.id} className={`hover:bg-slate-800/30 transition-colors ${isAssigned ? 'bg-emerald-500/5' : ''}`}>
                      <td className="py-3.5 px-4 font-bold text-white">
                        <div className="flex items-center gap-2">
                          <span>{shift.name}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 border border-slate-800 text-slate-300">
                            {shift.code}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                        {shift.startTime} – {shift.endTime}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        <span className="font-bold text-white">{shift.totalHours}h Total</span> = {shift.workHours}h Work + {shift.breakHours}h Break
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 font-medium">
                        {shift.days}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 max-w-xs truncate">
                        {shift.assignedDepartment}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {isAssigned ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 uppercase">
                            ✓ Currently Active
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400">
                            Available
                          </span>
                        )}
                      </td>
                      {isManagerOrAdmin && (
                        <td className="py-3.5 px-4 text-right">
                          <Button
                            variant={isAssigned ? 'outline' : 'default'}
                            size="sm"
                            onClick={() => handleSetActiveShift(shift.id)}
                            className="text-xs h-7"
                          >
                            {isAssigned ? 'Re-Apply' : 'Set as Active Shift'}
                          </Button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal for Assigning Shift */}
        {showAssignModal && (
          <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl max-w-md w-full space-y-4 animate-scaleUp">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <UserCheck className="text-emerald-400" size={20} /> Assign Shift to Workforce
                </h3>
                <button onClick={() => setShowAssignModal(false)} className="text-slate-400 hover:text-white">&times;</button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Select which shift the employees and departments should be assigned to work. This will automatically synchronize across all Employee Dashboards.
              </p>

              <div className="space-y-3">
                {shifts.map((s) => (
                  <label key={s.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition-colors">
                    <div>
                      <span className="text-xs font-bold text-white">{s.name} ({s.code})</span>
                      <p className="text-[11px] text-emerald-400 font-mono font-semibold">{s.startTime} – {s.endTime}</p>
                      <p className="text-[10px] text-slate-400">9h Shift = 8h Work + 1h Break</p>
                    </div>
                    <input
                      type="radio"
                      name="selectedShiftRadio"
                      checked={selectedShift === s.id}
                      onChange={() => setSelectedShift(s.id)}
                      className="accent-emerald-500 w-4 h-4 cursor-pointer"
                    />
                  </label>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <Button variant="outline" size="sm" onClick={() => setShowAssignModal(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={() => {
                  handleSetActiveShift(selectedShift);
                  setShowAssignModal(false);
                }}>
                  Confirm & Apply Schedule
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </RoleGuard>
  );
};

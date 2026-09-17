import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../app/store';
import axios from 'axios';

interface DayRecord {
  date: string;
  status: string;
  checkInTime?: string;
  checkOutTime?: string;
}

interface MonthlySummary {
  presentDays: number;
  absentDays: number;
  lateDays: number;
  halfDays: number;
  lopDays: number;
  totalHours: number;
  overtimeHours: number;
  workingDays: number;
}

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  Present:       { bg: 'bg-emerald-500',  text: 'text-white', label: 'P' },
  PRESENT:       { bg: 'bg-emerald-500',  text: 'text-white', label: 'P' },
  Remote:        { bg: 'bg-cyan-500',     text: 'text-white', label: 'R' },
  REMOTE:        { bg: 'bg-cyan-500',     text: 'text-white', label: 'R' },
  Late:          { bg: 'bg-amber-500',    text: 'text-white', label: 'L' },
  LATE:          { bg: 'bg-amber-500',    text: 'text-white', label: 'L' },
  Break:         { bg: 'bg-violet-500',   text: 'text-white', label: 'B' },
  ON_BREAK:      { bg: 'bg-violet-500',   text: 'text-white', label: 'B' },
  'Checked Out': { bg: 'bg-slate-500',    text: 'text-white', label: 'C' },
  CHECKED_OUT:   { bg: 'bg-slate-500',    text: 'text-white', label: 'C' },
  Absent:        { bg: 'bg-rose-500',     text: 'text-white', label: 'A' },
  ABSENT:        { bg: 'bg-rose-500',     text: 'text-white', label: 'A' },
  Weekend:       { bg: 'bg-[var(--bg-tertiary)]', text: 'text-[var(--text-muted)]', label: '—' },
};

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = [];
  const d = new Date(year, month - 1, 1);
  while (d.getMonth() === month - 1) {
    days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return days;
}

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

const SummaryChip: React.FC<{ label: string; value: string | number; color: string }> = ({ label, value, color }) => (
  <div className="card p-3 flex flex-col gap-1 min-w-[90px] text-center">
    <span className="text-2xl font-extrabold" style={{ color }}>{value}</span>
    <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wide">{label}</span>
  </div>
);

export const MonthlyAttendancePage: React.FC = () => {
  const user = useSelector((s: RootState) => s.auth.user);
  const employeeId = user?.id || '';

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);

  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [records, setRecords] = useState<DayRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<DayRecord | null>(null);

  const monthStr = `${year}-${String(month).padStart(2, '0')}`;
  const monthLabel = new Date(year, month - 1, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/attendance/monthly-summary/${employeeId}`, {
        params: { month: monthStr, detail: 'true' }
      });
      const detail = res.data.data;
      setSummary(detail.summary || null);
      setRecords(detail.records || []);
    } catch { setSummary(null); setRecords([]); }
    finally { setLoading(false); }
  }, [employeeId, monthStr]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const recordMap: Record<string, DayRecord> = {};
  records.forEach(r => { recordMap[r.date] = r; });

  const days = getDaysInMonth(year, month);
  const firstDay = new Date(year, month - 1, 1);
  // Monday-based offset: Monday=0, Sunday=6
  const startOffset = (firstDay.getDay() + 6) % 7;

  const navMonth = (dir: -1 | 1) => {
    let m = month + dir;
    let y = year;
    if (m < 1) { m = 12; y--; }
    if (m > 12) { m = 1; y++; }
    setMonth(m);
    setYear(y);
    setSelected(null);
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">My Attendance</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => navMonth(-1)} className="card px-3 py-2 text-sm hover:bg-[var(--bg-hover)] transition-colors">‹</button>
          <span className="text-sm font-semibold text-[var(--text-primary)] min-w-[140px] text-center">{monthLabel}</span>
          <button onClick={() => navMonth(1)} className="card px-3 py-2 text-sm hover:bg-[var(--bg-hover)] transition-colors">›</button>
        </div>
      </div>

      {/* Summary Chips */}
      <div className="flex flex-wrap gap-3">
        <SummaryChip label="Present" value={summary?.presentDays ?? '—'} color="#10b981" />
        <SummaryChip label="Absent" value={summary?.absentDays ?? '—'} color="#ef4444" />
        <SummaryChip label="Late" value={summary?.lateDays ?? '—'} color="#f59e0b" />
        <SummaryChip label="Half Day" value={summary?.halfDays ?? '—'} color="#8b5cf6" />
        <SummaryChip label="LOP Days" value={summary?.lopDays ?? '—'} color="#ef4444" />
        <SummaryChip label="Total Hrs" value={summary ? `${summary.totalHours}h` : '—'} color="#06b6d4" />
        <SummaryChip label="Overtime" value={summary ? `${summary.overtimeHours}h` : '—'} color="#10b981" />
        <SummaryChip label="Working Days" value={summary?.workingDays ?? '—'} color="var(--text-secondary)" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 rounded-full border-2 border-[var(--role-primary)] border-t-transparent animate-spin" />
        </div>
      ) : (
        <div className="card p-4">
          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAY_NAMES.map(d => (
              <div key={d} className="text-center text-[11px] font-semibold text-[var(--text-muted)] uppercase py-1">{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Offset empty cells */}
            {Array.from({ length: startOffset }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {days.map(d => {
              const iso = isoDate(d);
              const rec = recordMap[iso];
              const dayOfWeek = d.getDay(); // 0=Sun, 6=Sat
              const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
              const isFuture = d > today;
              const isToday = iso === isoDate(today);

              let status = 'Absent';
              if (isWeekend) status = 'Weekend';
              else if (isFuture) status = 'Future';
              else if (rec) status = rec.status;

              const style = STATUS_STYLE[status] || STATUS_STYLE['Absent'];
              const isSelected = selected?.date === iso;

              return (
                <div key={iso}
                  className={`relative flex flex-col items-center justify-center rounded-lg cursor-pointer transition-all
                    h-12 text-xs font-bold
                    ${isWeekend || isFuture ? 'opacity-40 cursor-default' : 'hover:scale-105'}
                    ${isToday ? 'ring-2 ring-[var(--role-primary)]' : ''}
                    ${isSelected ? 'ring-2 ring-white/60' : ''}
                    ${isFuture ? 'bg-[var(--bg-secondary)]' : style.bg} ${style.text}`}
                  onClick={() => !isWeekend && !isFuture && rec && setSelected(rec)}>
                  <span className="text-[11px] opacity-70">{d.getDate()}</span>
                  <span className="text-[10px] font-extrabold">
                    {isWeekend ? '—' : isFuture ? '' : rec ? style.label : 'A'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-[var(--border-color)]">
            {[
              { label: 'Present', bg: 'bg-emerald-500' },
              { label: 'Remote', bg: 'bg-cyan-500' },
              { label: 'Late', bg: 'bg-amber-500' },
              { label: 'On Break', bg: 'bg-violet-500' },
              { label: 'Absent', bg: 'bg-rose-500' },
              { label: 'Checked Out', bg: 'bg-slate-500' },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <span className={`w-3 h-3 rounded-sm ${l.bg}`} />
                <span className="text-xs text-[var(--text-muted)]">{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Day detail panel */}
      {selected && (
        <div className="card p-5 flex flex-col gap-3 animate-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              {new Date(selected.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </h3>
            <button onClick={() => setSelected(null)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xl">✕</button>
          </div>
          <div className="flex gap-4 flex-wrap">
            <div className="flex flex-col">
              <span className="text-xs text-[var(--text-muted)]">Status</span>
              <span className="text-sm font-semibold text-[var(--text-primary)]">{STATUS_STYLE[selected.status]?.label || selected.status}</span>
            </div>
            {selected.checkInTime && (
              <div className="flex flex-col">
                <span className="text-xs text-[var(--text-muted)]">Check In</span>
                <span className="text-sm font-semibold text-emerald-400">{selected.checkInTime}</span>
              </div>
            )}
            {selected.checkOutTime && (
              <div className="flex flex-col">
                <span className="text-xs text-[var(--text-muted)]">Check Out</span>
                <span className="text-sm font-semibold text-rose-400">{selected.checkOutTime}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyAttendancePage;

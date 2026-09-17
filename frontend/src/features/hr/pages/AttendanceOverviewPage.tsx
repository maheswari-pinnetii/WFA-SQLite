import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface LiveStatus {
  date: string;
  total: number;
  present: number;
  onBreak: number;
  checkedOut: number;
  late: number;
  absent: number;
  attendanceRate: number;
  records: any[];
}

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  Present:       { label: 'Present',      color: '#10b981', bg: 'bg-emerald-500/10', dot: 'bg-emerald-400' },
  PRESENT:       { label: 'Present',      color: '#10b981', bg: 'bg-emerald-500/10', dot: 'bg-emerald-400' },
  Remote:        { label: 'Remote',       color: '#06b6d4', bg: 'bg-cyan-500/10',    dot: 'bg-cyan-400' },
  REMOTE:        { label: 'Remote',       color: '#06b6d4', bg: 'bg-cyan-500/10',    dot: 'bg-cyan-400' },
  Late:          { label: 'Late',         color: '#f59e0b', bg: 'bg-amber-500/10',   dot: 'bg-amber-400' },
  LATE:          { label: 'Late',         color: '#f59e0b', bg: 'bg-amber-500/10',   dot: 'bg-amber-400' },
  Break:         { label: 'On Break',     color: '#8b5cf6', bg: 'bg-violet-500/10',  dot: 'bg-violet-400' },
  ON_BREAK:      { label: 'On Break',     color: '#8b5cf6', bg: 'bg-violet-500/10',  dot: 'bg-violet-400' },
  'Checked Out': { label: 'Checked Out',  color: '#6b7280', bg: 'bg-slate-500/10',   dot: 'bg-slate-400' },
  CHECKED_OUT:   { label: 'Checked Out',  color: '#6b7280', bg: 'bg-slate-500/10',   dot: 'bg-slate-400' },
};

const FILTER_TABS = ['ALL', 'Present', 'Remote', 'Late', 'Break', 'Checked Out'];

const KPICard: React.FC<{ label: string; value: number | string; color: string; sublabel?: string }> = ({ label, value, color, sublabel }) => (
  <div className="card p-4 flex flex-col gap-1">
    <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">{label}</p>
    <p className="text-3xl font-extrabold" style={{ color }}>{value}</p>
    {sublabel && <p className="text-xs text-[var(--text-muted)]">{sublabel}</p>}
  </div>
);

export const AttendanceOverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<LiveStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchStatus = useCallback(async () => {
    try {
      const res = await axios.get('/api/attendance/live-status');
      setData(res.data.data);
      setLastRefresh(new Date());
    } catch { /* silently handle */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 60000); // refresh every 60s
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const records = data?.records || [];
  const filtered = records.filter(r => {
    const matchFilter = filter === 'ALL' || 
      (STATUS_MAP[r.status]?.label === filter) ||
      r.status === filter;
    const matchSearch = !search || 
      r.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.department?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 border-[var(--role-primary)] border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Live Attendance</h1>
          <p className="text-sm text-[var(--text-muted)]">
            {data?.date} · Refreshed {lastRefresh.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <button onClick={fetchStatus} className="btn btn-sm btn-primary text-xs flex items-center gap-1">
          🔄 Refresh
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        <KPICard label="Total" value={data?.total ?? 0} color="var(--text-primary)" />
        <KPICard label="Present" value={data?.present ?? 0} color="#10b981" />
        <KPICard label="Remote" value={(data?.records || []).filter(r => ['Remote','REMOTE'].includes(r.status)).length} color="#06b6d4" />
        <KPICard label="On Break" value={data?.onBreak ?? 0} color="#8b5cf6" />
        <KPICard label="Late" value={data?.late ?? 0} color="#f59e0b" />
        <KPICard label="Checked Out" value={data?.checkedOut ?? 0} color="#6b7280" />
        <KPICard label="Absent" value={data?.absent ?? 0} color="#ef4444" sublabel="Not checked in" />
      </div>

      {/* Attendance Rate Bar */}
      <div className="card p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-[var(--text-primary)]">Overall Attendance Rate</p>
          <span className="text-2xl font-extrabold" style={{ color: (data?.attendanceRate ?? 0) >= 90 ? '#10b981' : (data?.attendanceRate ?? 0) >= 75 ? '#f59e0b' : '#ef4444' }}>
            {data?.attendanceRate ?? 0}%
          </span>
        </div>
        <div className="w-full h-3 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${data?.attendanceRate ?? 0}%`,
              background: (data?.attendanceRate ?? 0) >= 90 ? '#10b981' : (data?.attendanceRate ?? 0) >= 75 ? '#f59e0b' : '#ef4444'
            }}
          />
        </div>
        {/* Department breakdown mini bars */}
        {data && records.length > 0 && (() => {
          const deptMap: Record<string, { present: number; total: number }> = {};
          records.forEach((r: any) => {
            if (!deptMap[r.department]) deptMap[r.department] = { present: 0, total: 0 };
            deptMap[r.department].total++;
            if (['Present','Remote','PRESENT','REMOTE','Late','LATE'].includes(r.status)) deptMap[r.department].present++;
          });
          return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
              {Object.entries(deptMap).slice(0, 8).map(([dept, d]) => {
                const pct = Math.round((d.present / d.total) * 100);
                return (
                  <div key={dept} className="flex flex-col gap-1">
                    <div className="flex justify-between">
                      <span className="text-xs text-[var(--text-muted)] truncate">{dept}</span>
                      <span className="text-xs font-bold text-[var(--text-secondary)]">{pct}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[var(--bg-tertiary)]">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct >= 90 ? '#10b981' : pct >= 75 ? '#f59e0b' : '#ef4444' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="card p-1 flex gap-1 flex-wrap">
          {FILTER_TABS.map(t => (
            <button key={t} onClick={() => setFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === t ? 'bg-[var(--role-primary)] text-white' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
              }`}>
              {t} {t === 'ALL' ? `(${records.length})` : `(${records.filter(r => STATUS_MAP[r.status]?.label === t || r.status === t).length})`}
            </button>
          ))}
        </div>
        <input
          placeholder="Search by name or department…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="card px-4 py-2 text-sm text-[var(--text-primary)] bg-transparent flex-1 min-w-[200px]"
        />
      </div>

      {/* Employee Grid */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center text-[var(--text-muted)]">
          <p className="text-4xl mb-3">📋</p>
          <p>No attendance records match your filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map((r: any) => {
            const s = STATUS_MAP[r.status] || { label: r.status, color: '#6b7280', bg: 'bg-slate-500/10', dot: 'bg-slate-400' };
            return (
              <div key={r.employeeId}
                className={`card p-4 flex gap-3 items-start cursor-pointer hover:scale-[1.02] transition-transform ${s.bg}`}
                onClick={() => navigate(`/hr/employees/${r.employeeId}`)}>
                <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-base font-bold text-white"
                     style={{ background: s.color }}>
                  {r.name?.charAt(0) || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{r.name || 'Unknown'}</p>
                  <p className="text-xs text-[var(--text-muted)] truncate">{r.department} {r.designation ? `· ${r.designation}` : ''}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`w-2 h-2 rounded-full ${s.dot} animate-pulse`} />
                    <span className="text-xs font-medium" style={{ color: s.color }}>{s.label}</span>
                    {r.checkInTime && <span className="text-xs text-[var(--text-muted)]">· In {r.checkInTime}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AttendanceOverviewPage;

import React, { useEffect, useState } from "react";
import { Briefcase, MapPin, Users, TrendingUp, RefreshCw, AlertCircle, Building2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ["#10b981","#06b6d4","#8b5cf6","#f59e0b","#ef4444","#3b82f6"];
const getAuthToken = () => localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token") || "";

export const PlacementAnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = { Authorization: "Bearer " + getAuthToken() };
      const res = await fetch("/api/v1/analytics/placement", { headers });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const json = await res.json();
      const a = json.data || {};

      const byDept = (a.placementByDept || []).map((d: any) => ({
        dept: d.department,
        placements: d.placements,
        avgSalary: a.kpis?.avgSalary || 0, // Fallback if per-department isn't available
      }));

      const byStatus = [
        { name: "Placed", value: a.kpis?.totalPlacements || 0 },
        { name: "Pending", value: a.kpis?.pendingPlacements || 0 },
      ];

      const bySkill = (a.topSkills || []).map((s: any) => ({
        skill: s.name,
        placements: s.count,
        avgSalary: a.kpis?.avgSalary || 0, // Fallback
      }));

      const employers = a.topEmployers || [];

      setData({ kpis: a.kpis || {}, byDept, byStatus, bySkill, employers, placementTrend: a.placementTrend || [] });
    } catch (err: any) {
      setError(err.message || "Failed to load placement data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return (
    <div className="flex h-64 flex-col items-center justify-center gap-3 text-[var(--text-muted)]">
      <RefreshCw size={28} className="animate-spin text-emerald-500" />
      <span>Loading placement analytics&hellip;</span>
    </div>
  );

  if (error) return (
    <div className="flex h-64 flex-col items-center justify-center gap-3">
      <AlertCircle size={32} className="text-rose-500" />
      <p className="text-[var(--text-muted)]">{error}</p>
      <button onClick={fetchData} className="px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 text-sm">Retry</button>
    </div>
  );

  if (!data) return null;
  const { kpis, byDept, byStatus, bySkill, employers } = data;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm">
        <div className="flex items-center gap-2 text-emerald-500 font-medium text-xs tracking-wider uppercase mb-1">
          <Briefcase size={16} /> Sprint 2 &mdash; Placement Analytics
        </div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Placement Analytics Dashboard</h1>
        <p className="text-sm text-[var(--text-muted)] mt-0.5">Track placements by department, skill, location, employer, salary benchmarks, and placement velocity.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Total Placements", value: kpis.totalPlacements, color: "text-emerald-400" },
          { label: "Avg Salary", value: "₹" + (kpis.avgSalary/1000).toFixed(0) + "K", color: "text-blue-400" },
          { label: "Avg Time to Place", value: kpis.avgTimeToPlace + " days", color: "text-amber-400" },
          { label: "Placement Rate", value: kpis.placementRate + "%", color: "text-cyan-400" },
          { label: "Active Employers", value: kpis.activeEmployers, color: "text-purple-400" },
          { label: "Retention Rate", value: kpis.retentionRate + "%", color: "text-rose-400" },
        ].map((card, i) => (
          <div key={i} className="bg-[var(--bg-card)] p-4 rounded-xl border border-[var(--border-color)]">
            <div className="text-xs font-medium text-[var(--text-muted)] mb-1">{card.label}</div>
            <div className={"text-xl font-bold " + card.color}>{card.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--bg-card)] p-6 rounded-xl border border-[var(--border-color)]">
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">Placement Status Distribution</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={byStatus} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                {byStatus.map((_: any, idx: number) => <Cell key={idx} fill={COLORS[idx]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[var(--bg-card)] p-6 rounded-xl border border-[var(--border-color)]">
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">Placements by Department</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={byDept} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="dept" tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
              <YAxis tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
              <Tooltip />
              <Bar dataKey="placements" name="Placements" fill="#10b981" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-[var(--bg-card)] p-6 rounded-xl border border-[var(--border-color)]">
        <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">Top Employers by Placements</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-color)]">
                {["Employer","Placements","Avg Salary"].map(h => (
                  <th key={h} className="pb-3 text-left text-[var(--text-muted)] font-medium pr-6">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employers.map((e: any, i: number) => (
                <tr key={i} className="border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--bg-secondary)] transition-colors">
                  <td className="py-3 font-medium text-[var(--text-primary)] pr-6">
                    <div className="flex items-center gap-2"><Building2 size={14} className="text-[var(--text-muted)]" />{e.name}</div>
                  </td>
                  <td className="py-3 text-[var(--text-muted)] pr-6">{e.placements}</td>
                  <td className="py-3 text-emerald-400 pr-6">₹{(e.avgSalary/1000).toFixed(0)}K</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PlacementAnalyticsDashboard;

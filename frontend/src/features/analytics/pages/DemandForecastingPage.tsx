import React, { useEffect, useState } from "react";
import { TrendingUp, Users, Briefcase, AlertTriangle, RefreshCw, AlertCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";

const getAuthToken = () => localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token") || "";

export const DemandForecastingPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/analytics/demand-forecast", {
        headers: { Authorization: "Bearer " + getAuthToken() },
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const json = await res.json();
      setData(json.data);
    } catch (err: any) {
      setError(err.message || "Failed to load demand forecast");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return (
    <div className="flex h-64 flex-col items-center justify-center gap-3 text-[var(--text-muted)]">
      <RefreshCw size={28} className="animate-spin text-blue-500" />
      <span>Generating demand forecasts&hellip;</span>
    </div>
  );

  if (error) return (
    <div className="flex h-64 flex-col items-center justify-center gap-3">
      <AlertCircle size={32} className="text-rose-500" />
      <p className="text-[var(--text-muted)]">{error}</p>
      <button onClick={fetchData} className="px-4 py-2 rounded-lg bg-blue-500/10 text-blue-400 text-sm">Retry</button>
    </div>
  );

  if (!data) return null;
  const { hiringByQuarter, hiringByDept, requiredSkills, expectedShortages, totalProjectedHiring } = data;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm">
        <div className="flex items-center gap-2 text-blue-500 font-medium text-xs tracking-wider uppercase mb-1">
          <TrendingUp size={16} /> Sprint 3 &mdash; Predictive Workforce Planning
        </div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Demand Forecasting</h1>
        <p className="text-sm text-[var(--text-muted)] mt-0.5">AI-projected hiring demand by role, department, skill, and quarter. Based on current headcount, growth trajectory, and historical attrition.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-color)]">
          <div className="flex items-center gap-2 text-blue-400 text-sm font-medium"><TrendingUp size={16}/> Total Projected Hiring</div>
          <div className="text-3xl font-bold text-blue-400 mt-2">{totalProjectedHiring}</div>
          <p className="text-xs text-[var(--text-muted)] mt-1">Next 4 quarters</p>
        </div>
        <div className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-color)]">
          <div className="flex items-center gap-2 text-amber-400 text-sm font-medium"><AlertTriangle size={16}/> Dept Shortages Identified</div>
          <div className="text-3xl font-bold text-amber-400 mt-2">{expectedShortages?.length || 0}</div>
          <p className="text-xs text-[var(--text-muted)] mt-1">Departments needing 5+ hires</p>
        </div>
        <div className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-color)]">
          <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium"><Briefcase size={16}/> Growth Rate</div>
          <div className="text-3xl font-bold text-emerald-400 mt-2">15%</div>
          <p className="text-xs text-[var(--text-muted)] mt-1">Assumed annual growth</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--bg-card)] p-6 rounded-xl border border-[var(--border-color)]">
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">Quarterly Hiring Forecast</h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={hiringByQuarter} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="quarter" tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
              <YAxis tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="projected" name="Projected" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6" }} />
              <Line type="monotone" dataKey="confirmed" name="Confirmed" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[var(--bg-card)] p-6 rounded-xl border border-[var(--border-color)]">
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">Hiring Need by Department</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={hiringByDept.slice(0, 8)} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="department" tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
              <YAxis tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="current" name="Current" fill="#6b7280" radius={[4,4,0,0]} />
              <Bar dataKey="projected" name="Projected" fill="#3b82f6" radius={[4,4,0,0]} />
              <Bar dataKey="needed" name="To Hire" fill="#f59e0b" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-[var(--bg-card)] p-6 rounded-xl border border-[var(--border-color)]">
        <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">Skill Demand vs Current Coverage</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={requiredSkills.slice(0, 8)} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
            <XAxis dataKey="skill" tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
            <YAxis tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="currentCoverage" name="Current Coverage" fill="#10b981" radius={[4,4,0,0]} />
            <Bar dataKey="projectedDemand" name="Projected Demand" fill="#3b82f6" radius={[4,4,0,0]} />
            <Bar dataKey="gap" name="Gap" fill="#ef4444" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {expectedShortages?.length > 0 && (
        <div className="bg-[var(--bg-card)] p-6 rounded-xl border border-amber-500/20">
          <h2 className="text-base font-semibold text-amber-400 mb-4 flex items-center gap-2">
            <AlertTriangle size={16} /> Expected Workforce Shortages
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {expectedShortages.map((s: any, i: number) => (
              <div key={i} className={"p-4 rounded-lg border " + (s.severity === "High" ? "bg-red-500/10 border-red-500/20" : "bg-amber-500/10 border-amber-500/20")}>
                <div className="font-medium text-[var(--text-primary)]">{s.department}</div>
                <div className={"text-xl font-bold mt-1 " + (s.severity === "High" ? "text-red-400" : "text-amber-400")}>
                  {s.shortage} positions needed
                </div>
                <div className={"text-xs mt-1 " + (s.severity === "High" ? "text-red-400/70" : "text-amber-400/70")}>
                  Severity: {s.severity}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DemandForecastingPage;

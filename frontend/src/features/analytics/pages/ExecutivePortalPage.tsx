import React, { useState, useEffect } from "react";
import { Download, Building, Users, Activity, Target, Shield, AlertTriangle, Briefcase, RefreshCw, AlertCircle, FileText } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

const getAuthToken = () => localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token") || "";

export const ExecutivePortalPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/analytics/performance-overview", { headers: { Authorization: "Bearer " + getAuthToken() } });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const json = await res.json();
      setData(json.data);
    } catch (err: any) {
      setError(err.message || "Failed to load executive data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const downloadReport = async (type: string) => {
    try {
      const res = await fetch(`/api/v1/reports/${type}/export?format=csv`, {
        headers: { Authorization: "Bearer " + getAuthToken() }
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}_report.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert("Failed to export: " + err.message);
    }
  };

  if (loading) return (
    <div className="flex h-64 flex-col items-center justify-center gap-3 text-[var(--text-muted)]">
      <RefreshCw size={28} className="animate-spin text-purple-500" />
      <span>Loading Executive Portal...</span>
    </div>
  );

  if (error) return (
    <div className="flex h-64 flex-col items-center justify-center gap-3">
      <AlertCircle size={32} className="text-rose-500" />
      <p className="text-[var(--text-muted)]">{error}</p>
      <button onClick={fetchData} className="px-4 py-2 rounded-lg bg-purple-500/10 text-purple-400 text-sm">Retry</button>
    </div>
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-purple-500 font-medium text-xs tracking-wider uppercase mb-1">
            <Building size={16} /> Sprint 3 &mdash; Executive Reporting Portal
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Corporate Strategy Hub</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">High-level view of performance, attrition risk, and organizational exports.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Performance Overview", type: "performance", icon: <Activity size={16} />, color: "text-blue-400" },
          { label: "Attrition Risk", type: "attrition-risk", icon: <AlertTriangle size={16} />, color: "text-rose-400" },
          { label: "Demand Forecast", type: "demand-forecast", icon: <TrendingUp size={16} />, color: "text-emerald-400" },
          { label: "Compliance & Audit", type: "statutory", icon: <Shield size={16} />, color: "text-amber-400" },
        ].map((btn, i) => (
          <div key={i} className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-color)] flex flex-col gap-3">
            <div className={`flex items-center gap-2 text-sm font-medium ${btn.color}`}>
              {btn.icon} {btn.label}
            </div>
            <button
              onClick={() => downloadReport(btn.type)}
              className="flex items-center justify-center gap-2 w-full py-2 bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors rounded-lg text-sm text-[var(--text-primary)]"
            >
              <Download size={16} /> Export CSV
            </button>
          </div>
        ))}
      </div>
      
      {/* Visual placeholder for the rest of the executive dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--bg-card)] p-6 rounded-xl border border-[var(--border-color)]">
           <h3 className="font-bold text-[var(--text-primary)] mb-4">Talent Density</h3>
           <p className="text-sm text-[var(--text-muted)]">Corporate Average: {data?.corporateAverage}/10</p>
        </div>
        <div className="bg-[var(--bg-card)] p-6 rounded-xl border border-[var(--border-color)]">
           <h3 className="font-bold text-[var(--text-primary)] mb-4">Succession Pipeline</h3>
           <p className="text-sm text-[var(--text-muted)]">High Potential Leaders: {data?.talentGrid?.highPotential}</p>
        </div>
      </div>
    </div>
  );
};

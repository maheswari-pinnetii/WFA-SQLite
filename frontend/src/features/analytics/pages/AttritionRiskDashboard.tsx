import React, { useEffect, useState } from "react";
import { AlertTriangle, Users, TrendingDown, Shield, Brain, RefreshCw } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";

const RISK_COLORS: Record<string, string> = {
  "High Risk": "#ef4444",
  "High": "#ef4444",
  "Medium Risk": "#f59e0b",
  "Medium": "#f59e0b",
  "Low Risk": "#10b981",
  "Low": "#10b981",
};

const RISK_BG: Record<string, string> = {
  High: "bg-red-500/10 text-red-400 border-red-500/20",
  Medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Low: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

const getAuthToken = () =>
  localStorage.getItem("auth_token") ||
  sessionStorage.getItem("auth_token") ||
  "";

export const AttritionRiskDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/analytics/attrition-risk", {
        headers: { Authorization: "Bearer " + getAuthToken() },
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const json = await res.json();
      setData(json.data);
    } catch (err: any) {
      setError(err.message || "Failed to load attrition data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 text-[var(--text-muted)]">
        <RefreshCw size={28} className="animate-spin text-rose-500" />
        <span>Analysing attrition risk across the workforce&hellip;</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <AlertTriangle size={32} className="text-rose-500" />
        <p className="text-[var(--text-muted)]">Failed to load: {error}</p>
        <button onClick={fetchData} className="px-4 py-2 rounded-lg bg-rose-500/10 text-rose-400 text-sm hover:bg-rose-500/20 transition-colors">Retry</button>
      </div>
    );
  }

  if (!data) {
    return <div className="flex h-64 items-center justify-center text-[var(--text-muted)]">No attrition data available.</div>;
  }

  const { riskDistribution, departmentRisk, highRiskEmployees, topContributingFactors, modelMetrics, summary } = data;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-rose-500 font-medium text-xs tracking-wider uppercase mb-1">
            <Brain size={16} />
            <span>AI-Powered Risk Prediction &mdash; {modelMetrics?.modelVersion}</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Attrition Risk Dashboard</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">Statistical model scoring each employee on performance, attendance, tenure, and engagement signals.</p>
        </div>
        <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-muted)] text-sm hover:bg-[var(--bg-tertiary)] transition-colors">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Analysed", value: summary?.totalAnalyzed ?? 0, sub: "Active employees scored", color: "text-[var(--text-primary)]", icon: <Users size={16}/> },
          { label: "High Risk", value: summary?.highRiskCount ?? 0, sub: "Immediate action needed", color: "text-red-400", icon: <AlertTriangle size={16}/> },
          { label: "Medium Risk", value: summary?.mediumRiskCount ?? 0, sub: "Monitor closely", color: "text-amber-400", icon: <TrendingDown size={16}/> },
          { label: "Low Risk", value: summary?.lowRiskCount ?? 0, sub: "Stable & engaged", color: "text-emerald-400", icon: <Shield size={16}/> },
        ].map((card, i) => (
          <div key={i} className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-color)]">
            <div className={"flex items-center gap-2 text-sm font-medium " + card.color}>{card.icon} {card.label}</div>
            <div className={"text-3xl font-bold mt-2 " + card.color}>{card.value}</div>
            <p className="text-xs text-[var(--text-muted)] mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--bg-card)] p-6 rounded-xl border border-[var(--border-color)]">
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">Risk Distribution</h2>
          {riskDistribution?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={riskDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                  {riskDistribution.map((entry: any, idx: number) => (
                    <Cell key={idx} fill={RISK_COLORS[entry.name] || "#6b7280"} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => [val + " employees", "Count"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="flex h-48 items-center justify-center text-[var(--text-muted)]">No risk data</div>}
        </div>

        <div className="bg-[var(--bg-card)] p-6 rounded-xl border border-[var(--border-color)]">
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">Department Risk Comparison</h2>
          {departmentRisk?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={departmentRisk.slice(0, 8)} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="dept" tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
                <YAxis tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="high" name="High" fill="#ef4444" stackId="a" />
                <Bar dataKey="medium" name="Medium" fill="#f59e0b" stackId="a" />
                <Bar dataKey="low" name="Low" fill="#10b981" stackId="a" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="flex h-48 items-center justify-center text-[var(--text-muted)]">No dept data</div>}
        </div>
      </div>

      {topContributingFactors?.length > 0 && (
        <div className="bg-[var(--bg-card)] p-6 rounded-xl border border-[var(--border-color)]">
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">Top Contributing Factors</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {topContributingFactors.map((f: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                <span className="text-sm text-[var(--text-primary)]">{f.factor}</span>
                <span className="text-sm font-bold text-rose-400">{f.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {highRiskEmployees?.length > 0 && (
        <div className="bg-[var(--bg-card)] p-6 rounded-xl border border-[var(--border-color)]">
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-400" /> High-Risk Employee List
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-color)]">
                  {["Employee","Department","Risk Score","Category","Confidence","Recommended Action"].map(h => (
                    <th key={h} className="pb-3 text-left text-[var(--text-muted)] font-medium pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {highRiskEmployees.map((emp: any, i: number) => (
                  <tr key={i} className="border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--bg-secondary)] transition-colors">
                    <td className="py-3 font-medium text-[var(--text-primary)] pr-4">{emp.name}</td>
                    <td className="py-3 text-[var(--text-muted)] pr-4">{emp.department}</td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                          <div className="h-full bg-red-500 rounded-full" style={{ width: emp.riskScore + "%" }} />
                        </div>
                        <span className="text-red-400 font-medium">{emp.riskScore}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={"px-2 py-0.5 rounded-full text-xs font-medium border " + (RISK_BG[emp.riskCategory] || "")}>
                        {emp.riskCategory}
                      </span>
                    </td>
                    <td className="py-3 text-[var(--text-muted)] pr-4">{emp.confidence}%</td>
                    <td className="py-3 text-[var(--text-muted)] text-xs max-w-xs">{emp.recommendedAction}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modelMetrics && (
        <div className="bg-[var(--bg-card)] p-6 rounded-xl border border-[var(--border-color)]">
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <Brain size={16} className="text-purple-400" /> Model Explainability &amp; Metrics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: "Accuracy", value: (modelMetrics.accuracy * 100).toFixed(0) + "%", color: "text-emerald-400" },
              { label: "Precision", value: (modelMetrics.precision * 100).toFixed(0) + "%", color: "text-blue-400" },
              { label: "Recall", value: (modelMetrics.recall * 100).toFixed(0) + "%", color: "text-cyan-400" },
              { label: "F1 Score", value: (modelMetrics.f1Score * 100).toFixed(0) + "%", color: "text-purple-400" },
              { label: "False Positive Rate", value: (modelMetrics.falsePositiveRate * 100).toFixed(0) + "%", color: "text-amber-400" },
            ].map((m, i) => (
              <div key={i} className="p-3 rounded-lg bg-[var(--bg-secondary)] text-center">
                <div className={"text-2xl font-bold " + m.color}>{m.value}</div>
                <div className="text-xs text-[var(--text-muted)] mt-1">{m.label}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-3">Model: {modelMetrics.modelVersion} &middot; Last trained: {modelMetrics.lastTrained}</p>
        </div>
      )}
    </div>
  );
};

export default AttritionRiskDashboard;

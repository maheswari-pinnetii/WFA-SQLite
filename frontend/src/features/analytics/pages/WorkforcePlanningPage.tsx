import React, { useState, useEffect } from "react";
import { Settings, TrendingUp, Users, DollarSign, RefreshCw, Play, AlertCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const getAuthToken = () => localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token") || "";

const SCENARIOS = [
  { id: "BUSINESS_GROWTH", label: "Business Growth (15%)", icon: "📈", description: "Planned 15% headcount growth over next 4 quarters" },
  { id: "HIGH_ATTRITION", label: "High Attrition (25%)", icon: "⚠️", description: "Simulates 25% voluntary attrition across all departments" },
  { id: "DEPT_EXPANSION", label: "Department Expansion", icon: "🏗️", description: "Expanding Engineering and Data teams by 50%" },
  { id: "NEW_PROJECT", label: "New Project Launch", icon: "🚀", description: "New strategic initiative requiring 40 additional hires" },
  { id: "HIRING_FREEZE", label: "Hiring Freeze", icon: "🛑", description: "0 new hires for 2 quarters; manage with internal mobility" },
  { id: "SKILL_SHORTAGE", label: "Skill Shortage", icon: "🧠", description: "Critical skill gaps in AI/ML, Cloud, and Cybersecurity" },
  { id: "BUDGET_REDUCTION", label: "Budget Reduction (20%)", icon: "💰", description: "20% HR budget cut — optimize existing workforce" },
];

function computeScenario(scenarioId: string, baseData: any) {
  const base = baseData?.metrics || {};
  const headcount = base.totalEmployees || 200;
  const depts = baseData?.departmentDistribution || [];

  const multipliers: Record<string, number> = {
    BUSINESS_GROWTH: 1.15, HIGH_ATTRITION: 0.75, DEPT_EXPANSION: 1.3,
    NEW_PROJECT: 1.2, HIRING_FREEZE: 1.0, SKILL_SHORTAGE: 1.05, BUDGET_REDUCTION: 0.92,
  };
  const m = multipliers[scenarioId] || 1.0;
  const projected = Math.round(headcount * m);
  const gap = projected - headcount;
  const hiringNeed = Math.max(0, gap + Math.round(headcount * 0.08));
  const trainingNeed = Math.round(headcount * (scenarioId === "SKILL_SHORTAGE" ? 0.4 : 0.15));
  const costImpact = hiringNeed * 45000 + trainingNeed * 8000;

  const deptImpact = depts.slice(0, 6).map((d: any) => ({
    dept: d.name,
    current: d.value,
    projected: Math.round(d.value * m),
    gap: Math.round(d.value * (m - 1)),
  }));

  return {
    headcount,
    projected,
    gap,
    hiringNeed,
    trainingNeed,
    costImpact,
    internalMobility: Math.round(hiringNeed * 0.3),
    deptImpact,
    riskLevel: Math.abs(gap) > headcount * 0.2 ? "High" : Math.abs(gap) > headcount * 0.1 ? "Medium" : "Low",
    recommendations: buildRecommendations(scenarioId, hiringNeed, trainingNeed),
  };
}

function buildRecommendations(scenarioId: string, hiring: number, training: number) {
  const recs: Record<string, string[]> = {
    BUSINESS_GROWTH: ["Activate talent pipeline for top roles", "Increase campus recruitment budget", "Launch employee referral program"],
    HIGH_ATTRITION: ["Implement retention bonuses for high performers", "Conduct stay interviews in high-risk departments", "Review compensation benchmarks"],
    DEPT_EXPANSION: ["Partner with specialized staffing agencies", "Accelerate internal L&D for skill transfers", "Hire senior leads first to build teams"],
    NEW_PROJECT: ["Define project skill matrix immediately", "Identify internal candidates for redeployment", "Set up dedicated onboarding stream"],
    HIRING_FREEZE: ["Map current skills to future needs", "Launch redeployment and reskilling programs", "Use contractor bench for critical gaps"],
    SKILL_SHORTAGE: ["Launch targeted upskilling bootcamps", "Explore strategic hiring for critical roles", "Build partnerships with training providers"],
    BUDGET_REDUCTION: ["Prioritize critical roles only", "Expand internal mobility programs", "Reduce agency spend; strengthen employer brand"],
  };
  return recs[scenarioId] || [];
}

export const WorkforcePlanningPage: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState("BUSINESS_GROWTH");
  const [baseData, setBaseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/analytics", { headers: { Authorization: "Bearer " + getAuthToken() } });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const json = await res.json();
      setBaseData(json.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return (
    <div className="flex h-64 flex-col items-center justify-center gap-3 text-[var(--text-muted)]">
      <RefreshCw size={28} className="animate-spin text-violet-500" />
      <span>Loading workforce data&hellip;</span>
    </div>
  );

  if (error) return (
    <div className="flex h-64 flex-col items-center justify-center gap-3">
      <AlertCircle size={32} className="text-rose-500" />
      <p className="text-[var(--text-muted)]">{error}</p>
      <button onClick={fetchData} className="px-4 py-2 rounded-lg bg-violet-500/10 text-violet-400 text-sm">Retry</button>
    </div>
  );

  const scenario = SCENARIOS.find(s => s.id === selectedScenario);
  const result = baseData ? computeScenario(selectedScenario, baseData) : null;

  const riskColors: Record<string, string> = { High: "text-red-400", Medium: "text-amber-400", Low: "text-emerald-400" };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm">
        <div className="flex items-center gap-2 text-violet-500 font-medium text-xs tracking-wider uppercase mb-1">
          <Settings size={16} /> Sprint 3 &mdash; Workforce Planning
        </div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Workforce Planning Scenarios</h1>
        <p className="text-sm text-[var(--text-muted)] mt-0.5">Model 7 strategic scenarios to project headcount gaps, hiring needs, training requirements, and cost impact.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {SCENARIOS.map(s => (
          <button key={s.id} onClick={() => setSelectedScenario(s.id)}
            className={"p-3 rounded-xl border text-left transition-all " + (selectedScenario === s.id
              ? "border-violet-500/50 bg-violet-500/10 shadow-lg shadow-violet-500/10"
              : "border-[var(--border-color)] bg-[var(--bg-card)] hover:border-violet-500/30")}>
            <div className="text-xl mb-1">{s.icon}</div>
            <div className={"text-xs font-medium " + (selectedScenario === s.id ? "text-violet-400" : "text-[var(--text-primary)]")}>{s.label}</div>
          </button>
        ))}
      </div>

      {scenario && (
        <div className="bg-[var(--bg-card)] p-4 rounded-xl border border-violet-500/20 flex items-start gap-3">
          <span className="text-2xl">{scenario.icon}</span>
          <div>
            <div className="font-semibold text-[var(--text-primary)]">{scenario.label}</div>
            <div className="text-sm text-[var(--text-muted)] mt-0.5">{scenario.description}</div>
          </div>
        </div>
      )}

      {result && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Current Headcount", value: result.headcount, color: "text-[var(--text-primary)]", icon: <Users size={16}/> },
              { label: "Projected Headcount", value: result.projected, color: "text-blue-400", icon: <TrendingUp size={16}/> },
              { label: "Net Gap", value: (result.gap >= 0 ? "+" : "") + result.gap, color: result.gap >= 0 ? "text-emerald-400" : "text-red-400", icon: <Users size={16}/> },
              { label: "Cost Impact", value: "₹" + (result.costImpact/100000).toFixed(1) + "L", color: "text-amber-400", icon: <DollarSign size={16}/> },
            ].map((card, i) => (
              <div key={i} className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-color)]">
                <div className={"flex items-center gap-2 text-sm font-medium text-[var(--text-muted)]"}>{card.icon} {card.label}</div>
                <div className={"text-3xl font-bold mt-2 " + card.color}>{card.value}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "External Hiring Need", value: result.hiringNeed, sub: "New hires required", color: "text-blue-400" },
              { label: "Internal Mobility", value: result.internalMobility, sub: "Redeployment candidates", color: "text-purple-400" },
              { label: "Training Programs", value: result.trainingNeed, sub: "Employees to upskill", color: "text-cyan-400" },
            ].map((card, i) => (
              <div key={i} className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-color)]">
                <div className="text-sm font-medium text-[var(--text-muted)]">{card.label}</div>
                <div className={"text-3xl font-bold mt-2 " + card.color}>{card.value}</div>
                <div className="text-xs text-[var(--text-muted)] mt-1">{card.sub}</div>
              </div>
            ))}
          </div>

          <div className="bg-[var(--bg-card)] p-6 rounded-xl border border-[var(--border-color)]">
            <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">Department Impact Analysis</h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={result.deptImpact} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="dept" tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
                <YAxis tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="current" name="Current" fill="#6b7280" radius={[4,4,0,0]} />
                <Bar dataKey="projected" name="Projected" fill="#8b5cf6" radius={[4,4,0,0]} />
                <Bar dataKey="gap" name="Gap" fill="#f59e0b" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[var(--bg-card)] p-6 rounded-xl border border-[var(--border-color)]">
              <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">Risk Assessment</h2>
              <div className="flex items-center gap-4">
                <div className={"text-5xl font-bold " + (riskColors[result.riskLevel] || "text-[var(--text-primary)]")}>{result.riskLevel}</div>
                <div className="text-sm text-[var(--text-muted)]">execution risk for this scenario based on headcount gap and cost exposure</div>
              </div>
            </div>
            <div className="bg-[var(--bg-card)] p-6 rounded-xl border border-[var(--border-color)]">
              <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">AI Recommendations</h2>
              <ul className="space-y-2">
                {result.recommendations.map((r: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-muted)]">
                    <span className="text-violet-400 mt-0.5">▸</span> {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WorkforcePlanningPage;

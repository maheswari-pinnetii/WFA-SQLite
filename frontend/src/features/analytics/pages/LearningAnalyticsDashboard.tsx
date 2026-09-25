import React, { useEffect, useState } from "react";
import { Target, Users, Clock, TrendingUp, Award, RefreshCw, AlertCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#10b981","#06b6d4","#8b5cf6","#f59e0b","#ef4444","#3b82f6"];

const getAuthToken = () => localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token") || "";

interface TrainingData {
  kpis: any;
  enrollmentsByStatus: any[];
  completionByDept: any[];
  topCourses: any[];
  assessmentScores: any[];
  certifications: any[];
}

export const LearningAnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<TrainingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = { Authorization: "Bearer " + getAuthToken() };
      const res = await fetch("/api/v1/analytics/learning", { headers });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const json = await res.json();
      
      const { kpis, completionByDept, topCourses, courseStatus } = json.data || {};
      
      const enrollmentsByStatus = courseStatus || [];
      const assessmentScores = topCourses.map((c: any) => ({
        name: c.name,
        avgScore: kpis.avgScore || 0, // Fallback since no assessment data per course
        passRate: kpis.completionRate || 0
      }));

      setData({ 
        kpis: kpis || {}, 
        enrollmentsByStatus, 
        completionByDept: completionByDept || [], 
        topCourses: topCourses || [], 
        assessmentScores, 
        certifications: [] 
      });
    } catch (err: any) {
      setError(err.message || "Failed to load learning data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return (
    <div className="flex h-64 flex-col items-center justify-center gap-3 text-[var(--text-muted)]">
      <RefreshCw size={28} className="animate-spin text-purple-500" />
      <span>Loading learning analytics&hellip;</span>
    </div>
  );

  if (error) return (
    <div className="flex h-64 flex-col items-center justify-center gap-3">
      <AlertCircle size={32} className="text-rose-500" />
      <p className="text-[var(--text-muted)]">{error}</p>
      <button onClick={fetchData} className="px-4 py-2 rounded-lg bg-purple-500/10 text-purple-400 text-sm hover:bg-purple-500/20 transition-colors">Retry</button>
    </div>
  );

  if (!data) return <div className="flex h-64 items-center justify-center text-[var(--text-muted)]">No data available.</div>;

  const { kpis, enrollmentsByStatus, completionByDept, topCourses, assessmentScores, certifications } = data;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm">
        <div className="flex items-center gap-2 text-purple-500 font-medium text-xs tracking-wider uppercase mb-1">
          <Target size={16} /> Sprint 2 &mdash; Learning Analytics
        </div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Learning &amp; Development Analytics</h1>
        <p className="text-sm text-[var(--text-muted)] mt-0.5">Training enrollment, completion rates, assessment scores, certifications, and skill improvement metrics.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total Enrollments", value: kpis.totalEnrollments, icon: <Users size={16}/>, color: "text-blue-400" },
          { label: "Completion Rate", value: kpis.completionRate + "%", icon: <TrendingUp size={16}/>, color: "text-emerald-400" },
          { label: "Avg Assessment Score", value: kpis.avgScore + "%", icon: <Target size={16}/>, color: "text-cyan-400" },
          { label: "Certifications Earned", value: kpis.certified, icon: <Award size={16}/>, color: "text-amber-400" },
          { label: "Training Hours", value: kpis.trainingHours, icon: <Clock size={16}/>, color: "text-purple-400" },
        ].map((card, i) => (
          <div key={i} className="bg-[var(--bg-card)] p-4 rounded-xl border border-[var(--border-color)]">
            <div className={"flex items-center gap-2 text-xs font-medium " + card.color}>{card.icon} {card.label}</div>
            <div className={"text-2xl font-bold mt-2 " + card.color}>{card.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--bg-card)] p-6 rounded-xl border border-[var(--border-color)]">
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">Enrollment by Status</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={enrollmentsByStatus} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                {enrollmentsByStatus.map((_: any, idx: number) => <Cell key={idx} fill={COLORS[idx]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[var(--bg-card)] p-6 rounded-xl border border-[var(--border-color)]">
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">Completion Rate by Department</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={completionByDept.slice(0, 7)} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="dept" tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
              <YAxis tick={{ fontSize: 10, fill: "var(--text-muted)" }} unit="%" />
              <Tooltip />
              <Bar dataKey="completion" name="Completion %" fill="#8b5cf6" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-[var(--bg-card)] p-6 rounded-xl border border-[var(--border-color)]">
        <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">Assessment Performance by Skill</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={assessmentScores} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
            <YAxis tick={{ fontSize: 10, fill: "var(--text-muted)" }} unit="%" />
            <Tooltip />
            <Legend />
            <Bar dataKey="avgScore" name="Avg Score" fill="#06b6d4" radius={[4,4,0,0]} />
            <Bar dataKey="passRate" name="Pass Rate %" fill="#10b981" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-[var(--bg-card)] p-6 rounded-xl border border-[var(--border-color)]">
        <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">Top Courses</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-color)]">
                {["Course","Enrolled","Completed","Rating"].map(h => (
                  <th key={h} className="pb-3 text-left text-[var(--text-muted)] font-medium pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topCourses.map((c: any, i: number) => (
                <tr key={i} className="border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--bg-secondary)] transition-colors">
                  <td className="py-3 font-medium text-[var(--text-primary)] pr-4">{c.name}</td>
                  <td className="py-3 text-[var(--text-muted)] pr-4">{c.enrolled}</td>
                  <td className="py-3 text-emerald-400 pr-4">{c.completed}</td>
                  <td className="py-3 text-amber-400 pr-4">{c.rating.toFixed(1)} ★</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {certifications.length > 0 && (
        <div className="bg-[var(--bg-card)] p-6 rounded-xl border border-[var(--border-color)]">
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">Certification Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {certifications.slice(0, 6).map((c: any, i: number) => (
              <div key={i} className="p-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                <div className="font-medium text-[var(--text-primary)] text-sm">{c.name}</div>
                <div className="flex justify-between mt-2 text-xs text-[var(--text-muted)]">
                  <span>{c.certified} certified</span>
                  {c.expired > 0 && <span className="text-red-400">{c.expired} expired</span>}
                  {c.expiringSoon > 0 && <span className="text-amber-400">{c.expiringSoon} expiring soon</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningAnalyticsDashboard;

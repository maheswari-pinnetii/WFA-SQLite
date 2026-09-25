import React, { useEffect, useState } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie, Cell
} from 'recharts';
import { apiClient } from '../../../api/client';

export const ExecutiveDashboard: React.FC = () => {
  const [attritionData, setAttritionData] = useState<any>(null);
  const [planningData, setPlanningData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [attritionRes, planningRes] = await Promise.all([
          apiClient.get('/analytics/attrition-risk'),
          apiClient.get('/analytics/workforce-planning/scenarios')
        ]);
        setAttritionData(attritionRes.data.data);
        setPlanningData(planningRes.data.data || []);
      } catch (err) {
        console.error('Error fetching executive dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading Executive Dashboard...</div>;
  }

  // 1. Overall Attrition Risk (Gauge / Pie)
  const riskPieData = attritionData?.overview ? [
    { name: 'High Risk', value: attritionData.overview.highRiskCount, color: '#ef4444' },
    { name: 'Medium Risk', value: attritionData.overview.mediumRiskCount, color: '#f59e0b' },
    { name: 'Low Risk', value: attritionData.overview.lowRiskCount, color: '#10b981' }
  ] : [];

  // 2. Headcount Growth vs Target (Line chart - mapped from scenarios)
  // Just visualizing the 3 scenarios over a hypothetical 12-month period for demo
  const months = ['M1', 'M2', 'M3', 'M4', 'M5', 'M6'];
  const growthChartData = months.map((m, idx) => {
    const dataPoint: any = { name: m };
    planningData.forEach(scenario => {
      // simulate progression
      const start = scenario.currentHeadcount;
      const end = scenario.finalHeadcount;
      dataPoint[scenario.scenario] = start + ((end - start) / 5) * idx;
    });
    return dataPoint;
  });

  // 3. Department Health Score (Radar)
  // Mocking health scores based on riskByDepartment
  const radarData = (attritionData?.riskByDepartment || []).slice(0, 5).map((dept: any) => {
    return {
      subject: dept.department || 'Unassigned',
      A: 100 - (dept.high * 5 + dept.medium * 2), // Health Score
      fullMark: 100,
    };
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-100">Executive Dashboard</h1>
      <p className="text-slate-400">Strategic workforce planning and predictive analytics</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Attrition Risk Gauge/Pie */}
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg">
          <h2 className="text-lg font-semibold text-slate-200 mb-4">Overall Attrition Risk</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskPieData}
                  cx="50%" cy="50%"
                  innerRadius={60} outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {riskPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Headcount Growth Scenarios */}
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg md:col-span-2">
          <h2 className="text-lg font-semibold text-slate-200 mb-4">Headcount Planning Scenarios</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                <Legend />
                {planningData.map((scenario, idx) => (
                  <Line 
                    key={idx} 
                    type="monotone" 
                    dataKey={scenario.scenario} 
                    stroke={['#10b981', '#3b82f6', '#ef4444'][idx % 3]} 
                    strokeWidth={2} 
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Health Radar */}
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg md:col-span-3">
          <h2 className="text-lg font-semibold text-slate-200 mb-4">Department Health Score</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" />
                <PolarRadiusAxis stroke="#334155" />
                <Radar name="Health Score" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

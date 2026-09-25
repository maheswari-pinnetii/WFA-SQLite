import React, { useEffect, useState } from 'react';
import { Users, TrendingUp, UserPlus, UserMinus, Building2, MapPin, Briefcase } from 'lucide-react';
import { analyticsApi } from '../../../api/analyticsApi';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export const HeadcountAnalyticsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fullAnalytics = await analyticsApi.getAnalytics();
        setData(fullAnalytics);
      } catch (err) {
        console.error('Failed to fetch headcount analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-[var(--text-muted)]">
        Loading analytics...
      </div>
    );
  }

  if (!data?.metrics) {
    return (
      <div className="flex h-64 items-center justify-center text-[var(--text-muted)]">
        No analytics data available
      </div>
    );
  }

  const { metrics: summary, departmentDistribution: headcount, workforceDistribution: workforce, locationDistribution, experienceDistribution } = data;

  const COLORS = ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444', '#3b82f6'];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-emerald-500 font-medium text-xs tracking-wider uppercase mb-1">
            <Users size={16} />
            <span>Workforce Demographics</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Headcount & Growth Analytics</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            Real-time workforce distribution across departments, locations, employment types, and tenure bands.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-color)]">
          <div className="text-[var(--text-muted)] text-sm font-medium flex items-center gap-2">
            <Users size={16} /> Total Headcount
          </div>
          <div className="text-2xl font-bold text-[var(--text-primary)] mt-2">{summary.totalEmployees}</div>
          <p className={`text-xs mt-1 ${summary.employeeGrowthRate >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {summary.employeeGrowthRate >= 0 ? '↑' : '↓'} {Math.abs(summary.employeeGrowthRate || 0)}% growth
          </p>
        </div>

        <div className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-color)]">
          <div className="text-[var(--text-muted)] text-sm font-medium flex items-center gap-2">
            <TrendingUp size={16} /> Active Employees
          </div>
          <div className="text-2xl font-bold text-[var(--text-primary)] mt-2">{summary.activeEmployees}</div>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {summary.totalEmployees ? Math.round((summary.activeEmployees / summary.totalEmployees) * 100) : 0}% of total
          </p>
        </div>

        <div className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-color)]">
          <div className="text-[var(--text-muted)] text-sm font-medium flex items-center gap-2">
            <UserPlus size={16} /> New Joiners (30d)
          </div>
          <div className="text-2xl font-bold text-[var(--text-primary)] mt-2">{summary.newEmployees}</div>
          <p className="text-xs text-[var(--text-muted)] mt-1">Recently onboarded</p>
        </div>

        <div className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-color)]">
          <div className="text-[var(--text-muted)] text-sm font-medium flex items-center gap-2">
            <UserMinus size={16} /> Attrition Rate
          </div>
          <div className="text-2xl font-bold text-red-400 mt-2">{summary.attritionRate}%</div>
          <p className="text-xs text-[var(--text-muted)] mt-1">{summary.employeeExits} exits recorded</p>
        </div>
        
        <div className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-color)]">
          <div className="text-[var(--text-muted)] text-sm font-medium flex items-center gap-2">
            <Building2 size={16} /> Departments
          </div>
          <div className="text-2xl font-bold text-[var(--text-primary)] mt-2">{summary.departmentCount}</div>
        </div>
        
        <div className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-color)]">
          <div className="text-[var(--text-muted)] text-sm font-medium flex items-center gap-2">
            <MapPin size={16} /> Locations
          </div>
          <div className="text-2xl font-bold text-[var(--text-primary)] mt-2">{summary.locationCount}</div>
        </div>
        
        <div className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-color)]">
          <div className="text-[var(--text-muted)] text-sm font-medium flex items-center gap-2">
            <Briefcase size={16} /> Open Positions
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-2">{summary.openPositions}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--bg-card)] p-6 rounded-xl border border-[var(--border-color)]">
          <h3 className="font-semibold text-[var(--text-primary)] mb-4">Department Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={headcount || []} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={false} />
                <XAxis type="number" stroke="var(--text-muted)" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="var(--text-muted)" fontSize={12} width={100} />
                <Tooltip cursor={{ fill: 'var(--bg-primary)' }} contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[var(--bg-card)] p-6 rounded-xl border border-[var(--border-color)]">
          <h3 className="font-semibold text-[var(--text-primary)] mb-4">Location Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={locationDistribution || []} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} />
                <Tooltip cursor={{ fill: 'var(--bg-primary)' }} contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                <Bar dataKey="value" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[var(--bg-card)] p-6 rounded-xl border border-[var(--border-color)]">
          <h3 className="font-semibold text-[var(--text-primary)] mb-4">Experience Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={experienceDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(experienceDistribution || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4 flex-wrap">
              {(experienceDistribution || []).map((entry: any, index: number) => (
                <div key={entry.name} className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[(index + 2) % COLORS.length] }}></span>
                  {entry.name}: {entry.value}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-[var(--bg-card)] p-6 rounded-xl border border-[var(--border-color)]">
          <h3 className="font-semibold text-[var(--text-primary)] mb-4">Work Mode Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={workforce || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(workforce || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4 flex-wrap">
              {(workforce || []).map((entry: any, index: number) => (
                <div key={entry.name} className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                  {entry.name}: {entry.value}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


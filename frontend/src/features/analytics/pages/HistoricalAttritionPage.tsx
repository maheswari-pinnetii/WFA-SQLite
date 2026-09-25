import React, { useEffect, useState } from 'react';
import { Users, UserMinus, Building2, MapPin, TrendingUp, AlertTriangle } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';
import { apiClient } from '../../../api/client';

export const HistoricalAttritionPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiClient.get('/v1/analytics/attrition');
        setData(response.data?.data);
      } catch (err: any) {
        setError(err.message || 'Failed to load historical attrition data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-[var(--text-muted)]">
        Loading historical attrition analytics...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <AlertTriangle size={32} className="text-rose-500" />
        <p className="text-[var(--text-muted)]">Failed to load: {error}</p>
      </div>
    );
  }

  if (!data?.summary) {
    return (
      <div className="flex h-64 items-center justify-center text-[var(--text-muted)]">
        No attrition data available
      </div>
    );
  }

  const { summary, departmentAttrition, locationAttrition, attritionTrend } = data;
  const COLORS = ['#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#10b981'];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-rose-500 font-medium text-xs tracking-wider uppercase mb-1">
            <UserMinus size={16} />
            <span>Historical Data</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Historical Attrition Analytics</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            Analyze past employee turnover trends across departments and locations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-color)]">
          <div className="text-[var(--text-muted)] text-sm font-medium flex items-center gap-2">
            <UserMinus size={16} /> Total Employee Exits
          </div>
          <div className="text-3xl font-bold text-[var(--text-primary)] mt-2">{summary.employeeExits}</div>
        </div>

        <div className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-color)]">
          <div className="text-[var(--text-muted)] text-sm font-medium flex items-center gap-2">
            <TrendingUp size={16} /> Overall Attrition Rate
          </div>
          <div className="text-3xl font-bold text-rose-500 mt-2">{summary.attritionRate}%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm">
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <Building2 size={18} className="text-[var(--text-muted)]" />
            Department Attrition Rate
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentAttrition} layout="vertical" margin={{ top: 5, right: 30, left: 50, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={false} />
                <XAxis type="number" stroke="var(--text-muted)" fontSize={12} unit="%" />
                <YAxis dataKey="department" type="category" stroke="var(--text-muted)" fontSize={12} />
                <Tooltip cursor={{ fill: 'var(--bg-primary)' }} contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                <Bar dataKey="rate" fill="#f59e0b" radius={[0, 4, 4, 0]} name="Attrition Rate" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm">
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <MapPin size={18} className="text-[var(--text-muted)]" />
            Location Attrition Rate
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={locationAttrition} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="location" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} unit="%" />
                <Tooltip cursor={{ fill: 'var(--bg-primary)' }} contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                <Bar dataKey="rate" fill="#ef4444" radius={[4, 4, 0, 0]} name="Attrition Rate" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm lg:col-span-2">
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-[var(--text-muted)]" />
            Attrition Trend (Last 12 Months)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attritionTrend} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} />
                <Tooltip cursor={{ fill: 'var(--bg-primary)' }} contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                <Line type="monotone" dataKey="exits" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#ef4444' }} name="Exits" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoricalAttritionPage;

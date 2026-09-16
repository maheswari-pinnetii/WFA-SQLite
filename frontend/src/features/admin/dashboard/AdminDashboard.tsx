import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../auth/hooks/useAuth';
import { RoleGuard } from '../../../security/guards/RoleGuard';
import { Role } from '../../../security/roles/roles';
import { MinimalKpiCard } from '../../../components/cards/MinimalKpiCard';
import { AnalyticsBarChart, AnalyticsDonutChart, AnalyticsLineChart } from '../../../components/charts/AnalyticsCharts';
import { analyticsApi } from '../../../api/endpoints/analytics.api';
import { Users, UserPlus, Clock, FileSpreadsheet, Briefcase, Layers, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      const res = await analyticsApi.getDashboard('admin');
      if (res) setData(res);
      setLoading(false);
    };
    fetchDashboard();
  }, []);

  const firstName = user?.name ? user.name.split(' ')[0] : 'Admin';

  if (loading) return <div className="p-8 text-center text-slate-500">Loading Admin Dashboard...</div>;
  if (!data) return <div className="p-8 text-center text-rose-500">Failed to load dashboard</div>;

  return (
    <RoleGuard allowedRoles={[Role.ADMIN]}>
      <div className="admin-dashboard space-y-6 animate-fadeIn font-sans pb-10">
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-sm">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Welcome, {firstName}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">System Administration & Enterprise Overview</p>
          </div>
        </div>

        <div className="dashboard-kpi-grid">
          <MinimalKpiCard title="Total Headcount" value={data.kpis.totalHeadcount} icon={<Users size={26} />} iconBgColor="emerald" />
          <MinimalKpiCard title="Active Headcount" value={data.kpis.activeHeadcount} icon={<Users size={26} />} iconBgColor="blue" />
          <MinimalKpiCard title="On Leave" value={data.kpis.onLeaveHeadcount} icon={<Clock size={26} />} iconBgColor="amber" />
          <MinimalKpiCard title="Payroll Cost" value={`$${data.kpis.payrollCost.toLocaleString()}`} icon={<DollarSign size={26} />} iconBgColor="purple" />
        </div>

        <div className="dashboard-chart-grid">
          <AnalyticsLineChart 
            title="Headcount Trend" 
            data={data.charts.headcountTrend} 
            xKey="month" 
            series={[{ key: 'headcount', name: 'Headcount', color: '#3b82f6' }]} 
          />
          <AnalyticsBarChart 
            title="Employees By Department" 
            data={data.charts.employeesByDept} 
            xKey="name" 
            series={[{ key: 'headcount', name: 'Headcount', color: '#10b981' }]} 
          />
          <AnalyticsDonutChart 
            title="Role Distribution" 
            data={data.charts.roleDistribution} 
          />
        </div>

        <div className="p-5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm">
          <h3 className="text-base font-semibold mb-4">Recent Joiners</h3>
          <div className="overflow-x-auto rounded-md border border-[var(--border-color)] bg-[var(--bg-tertiary)]/20">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-b border-[var(--border-color)]">
                <tr>
                  <th className="py-2.5 px-4">Name</th>
                  <th className="py-2.5 px-4">Role</th>
                  <th className="py-2.5 px-4">Department</th>
                  <th className="py-2.5 px-4">Join Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]/80 text-[var(--text-primary)]">
                {data.tables.recentJoiners.map((emp: any, i: number) => (
                  <tr key={i}>
                    <td className="py-2.5 px-4">{emp.name}</td>
                    <td className="py-2.5 px-4">{emp.role}</td>
                    <td className="py-2.5 px-4">{emp.department}</td>
                    <td className="py-2.5 px-4">{new Date(emp.joinDate).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
};

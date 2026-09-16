import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../auth/hooks/useAuth';
import { RoleGuard } from '../../../security/guards/RoleGuard';
import { Role } from '../../../security/roles/roles';
import { MinimalKpiCard } from '../../../components/cards/MinimalKpiCard';
import { AnalyticsBarChart, AnalyticsDonutChart, AnalyticsLineChart } from '../../../components/charts/AnalyticsCharts';
import { analyticsApi } from '../../../api/endpoints/analytics.api';
import { Users, UserPlus, Clock, Briefcase, Layers } from 'lucide-react';

export const HrDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      const res = await analyticsApi.getDashboard('hr');
      if (res) setData(res);
      setLoading(false);
    };
    fetchDashboard();
  }, []);

  const firstName = user?.name ? user.name.split(' ')[0] : 'HR';

  if (loading) return <div className="p-8 text-center text-slate-500">Loading HR Dashboard...</div>;
  if (!data) return <div className="p-8 text-center text-rose-500">Failed to load dashboard</div>;

  return (
    <RoleGuard allowedRoles={[Role.HR, Role.ADMIN]}>
      <div className="hr-dashboard space-y-6 animate-fadeIn font-sans pb-10">
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-sm">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Welcome, {firstName}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Human Resources & Recruitment Overview</p>
          </div>
        </div>

        <div className="dashboard-kpi-grid">
          <MinimalKpiCard title="Total Headcount" value={data.kpis.totalHeadcount} icon={<Users size={26} />} iconBgColor="emerald" />
          <MinimalKpiCard title="Active Headcount" value={data.kpis.activeHeadcount} icon={<Users size={26} />} iconBgColor="blue" />
          <MinimalKpiCard title="Open Requisitions" value={data.kpis.openRequisitions} icon={<Briefcase size={26} />} iconBgColor="amber" />
          <MinimalKpiCard title="Pending Leaves" value={data.kpis.pendingLeaves} icon={<Clock size={26} />} iconBgColor="rose" />
        </div>

        <div className="dashboard-chart-grid">
          <AnalyticsBarChart 
            title="Hiring Funnel" 
            data={data.charts.hiringFunnel} 
            xKey="stage" 
            series={[{ key: 'count', name: 'Candidates', color: '#3b82f6' }]} 
          />
          <AnalyticsDonutChart 
            title="Leave Utilization" 
            data={data.charts.leaveUtilization} 
          />
          <AnalyticsBarChart 
            title="Tenure Distribution" 
            data={data.charts.tenureDistribution} 
            xKey="category"
            series={[{ key: 'count', name: 'Employees', color: '#10b981' }]} 
          />
        </div>

        <div className="p-5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm">
          <h3 className="text-base font-semibold mb-4">Pending Actions</h3>
          <div className="overflow-x-auto rounded-md border border-[var(--border-color)] bg-[var(--bg-tertiary)]/20">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-b border-[var(--border-color)]">
                <tr>
                  <th className="py-2.5 px-4">Action</th>
                  <th className="py-2.5 px-4">User</th>
                  <th className="py-2.5 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]/80 text-[var(--text-primary)]">
                {data.tables.pendingActions.map((action: any, i: number) => (
                  <tr key={i}>
                    <td className="py-2.5 px-4">{action.action}</td>
                    <td className="py-2.5 px-4">{action.user}</td>
                    <td className="py-2.5 px-4">{new Date(action.date).toLocaleDateString()}</td>
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

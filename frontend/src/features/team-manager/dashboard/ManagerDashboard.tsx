import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../auth/hooks/useAuth';
import { RoleGuard } from '../../../security/guards/RoleGuard';
import { Role } from '../../../security/roles/roles';
import { MinimalKpiCard } from '../../../components/cards/MinimalKpiCard';
import { AnalyticsBarChart, AnalyticsLineChart } from '../../../components/charts/AnalyticsCharts';
import { analyticsApi } from '../../../api/endpoints/analytics.api';
import { Users, Clock, Briefcase, Layers } from 'lucide-react';

export const ManagerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      const res = await analyticsApi.getDashboard('manager');
      if (res) setData(res);
      setLoading(false);
    };
    fetchDashboard();
  }, []);

  const firstName = user?.name ? user.name.split(' ')[0] : 'Manager';

  if (loading) return <div className="p-8 text-center text-slate-500">Loading Manager Dashboard...</div>;
  if (!data) return <div className="p-8 text-center text-rose-500">Failed to load dashboard</div>;

  return (
    <RoleGuard allowedRoles={[Role.MANAGER, Role.ADMIN]}>
      <div className="manager-dashboard space-y-6 animate-fadeIn font-sans pb-10">
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-sm">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Welcome, {firstName}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Department Overview & Capacity</p>
          </div>
        </div>

        <div className="dashboard-kpi-grid">
          <MinimalKpiCard title="Team Size" value={data.kpis.teamSize} icon={<Users size={26} />} iconBgColor="emerald" />
          <MinimalKpiCard title="Open Tasks" value={data.kpis.openTasks} icon={<Layers size={26} />} iconBgColor="blue" />
          <MinimalKpiCard title="Avg Productivity" value={data.kpis.avgProductivity} icon={<Briefcase size={26} />} iconBgColor="amber" />
          <MinimalKpiCard title="Pending Approvals" value={data.kpis.pendingApprovals} icon={<Clock size={26} />} iconBgColor="rose" />
        </div>

        <div className="dashboard-chart-grid">
          <AnalyticsBarChart 
            title="Team Workload" 
            data={data.charts.teamWorkload} 
            xKey="name" 
            series={[
              { key: 'tasks', name: 'Tasks', color: '#3b82f6' },
              { key: 'hoursLogged', name: 'Hours', color: '#10b981' }
            ]} 
          />
          <AnalyticsLineChart 
            title="Capacity vs Utilization" 
            data={data.charts.capacityVsUtilization} 
            xKey="week"
            series={[
              { key: 'capacity', name: 'Capacity', color: '#94a3b8' },
              { key: 'utilization', name: 'Utilization', color: '#8b5cf6' }
            ]} 
          />
        </div>

        <div className="p-5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm">
          <h3 className="text-base font-semibold mb-4">Team Overview</h3>
          <div className="overflow-x-auto rounded-md border border-[var(--border-color)] bg-[var(--bg-tertiary)]/20">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-b border-[var(--border-color)]">
                <tr>
                  <th className="py-2.5 px-4">Name</th>
                  <th className="py-2.5 px-4">Role</th>
                  <th className="py-2.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]/80 text-[var(--text-primary)]">
                {data.tables.teamOverview.map((emp: any, i: number) => (
                  <tr key={i}>
                    <td className="py-2.5 px-4">{emp.name || `User ${emp.id}`}</td>
                    <td className="py-2.5 px-4">{emp.role}</td>
                    <td className="py-2.5 px-4">{emp.status}</td>
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

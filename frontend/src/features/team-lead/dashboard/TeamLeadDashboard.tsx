import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../auth/hooks/useAuth';
import { RoleGuard } from '../../../security/guards/RoleGuard';
import { Role } from '../../../security/roles/roles';
import { MinimalKpiCard } from '../../../components/cards/MinimalKpiCard';
import { AnalyticsBarChart, AnalyticsLineChart } from '../../../components/charts/AnalyticsCharts';
import { analyticsApi } from '../../../api/endpoints/analytics.api';
import { Users, Layers, AlertCircle, FileCode } from 'lucide-react';

export const TeamLeadDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      const res = await analyticsApi.getDashboard('team-lead');
      if (res) setData(res);
      setLoading(false);
    };
    fetchDashboard();
  }, []);

  const firstName = user?.name ? user.name.split(' ')[0] : 'Team Lead';

  if (loading) return <div className="p-8 text-center text-slate-500">Loading Team Lead Dashboard...</div>;
  if (!data) return <div className="p-8 text-center text-rose-500">Failed to load dashboard</div>;

  return (
    <RoleGuard allowedRoles={[Role.TEAM_LEAD, Role.ADMIN]}>
      <div className="team-lead-dashboard space-y-6 animate-fadeIn font-sans pb-10">
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-sm">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Welcome, {firstName}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Sprint Progress & Team Execution</p>
          </div>
        </div>

        <div className="dashboard-kpi-grid">
          <MinimalKpiCard title="Team Size" value={data.kpis.teamSize} icon={<Users size={26} />} iconBgColor="emerald" />
          <MinimalKpiCard title="Sprint Velocity" value={data.kpis.sprintVelocity} icon={<Layers size={26} />} iconBgColor="blue" />
          <MinimalKpiCard title="Blocked Tasks" value={data.kpis.blockedTasks} icon={<AlertCircle size={26} />} iconBgColor="amber" />
          <MinimalKpiCard title="Code Reviews" value={data.kpis.codeReviews} icon={<FileCode size={26} />} iconBgColor="purple" />
        </div>

        <div className="dashboard-chart-grid">
          <AnalyticsBarChart 
            title="Sprint Progress" 
            data={data.charts.sprintProgress} 
            xKey="status" 
            series={[
              { key: 'count', name: 'Tasks', color: '#10b981' }
            ]} 
          />
          <AnalyticsLineChart 
            title="Sprint Burndown" 
            data={data.charts.sprintBurndown} 
            xKey="day"
            series={[
              { key: 'remaining', name: 'Remaining Tasks', color: '#f43f5e' }
            ]} 
          />
        </div>

        <div className="p-5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm">
          <h3 className="text-base font-semibold mb-4">Sprint Tasks</h3>
          <div className="overflow-x-auto rounded-md border border-[var(--border-color)] bg-[var(--bg-tertiary)]/20">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-b border-[var(--border-color)]">
                <tr>
                  <th className="py-2.5 px-4">ID</th>
                  <th className="py-2.5 px-4">Title</th>
                  <th className="py-2.5 px-4">Assignee</th>
                  <th className="py-2.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]/80 text-[var(--text-primary)]">
                {data.tables.sprintTasks.map((task: any, i: number) => (
                  <tr key={i}>
                    <td className="py-2.5 px-4 font-mono">{task.id}</td>
                    <td className="py-2.5 px-4">{task.title}</td>
                    <td className="py-2.5 px-4">{task.assignee}</td>
                    <td className="py-2.5 px-4">{task.status}</td>
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

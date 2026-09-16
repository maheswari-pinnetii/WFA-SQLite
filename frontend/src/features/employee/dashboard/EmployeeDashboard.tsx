import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../auth/hooks/useAuth';
import { RoleGuard } from '../../../security/guards/RoleGuard';
import { MinimalKpiCard } from '../../../components/cards/MinimalKpiCard';
import { AnalyticsBarChart, AnalyticsDonutChart, AnalyticsLineChart } from '../../../components/charts/AnalyticsCharts';
import { analyticsApi } from '../../../api/endpoints/analytics.api';
import { Clock, Calendar, DollarSign, Award } from 'lucide-react';

export const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      const res = await analyticsApi.getDashboard('employee');
      if (res) setData(res);
      setLoading(false);
    };
    fetchDashboard();
  }, []);

  const firstName = user?.name ? user.name.split(' ')[0] : 'Employee';

  if (loading) return <div className="p-8 text-center text-slate-500">Loading Employee Dashboard...</div>;
  if (!data) return <div className="p-8 text-center text-rose-500">Failed to load dashboard</div>;

  return (
    <RoleGuard allowedRoles={[]}>
      <div className="employee-dashboard space-y-6 animate-fadeIn font-sans pb-10">
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-sm">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Welcome, {firstName}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">My Attendance & Payroll</p>
          </div>
        </div>

        <div className="dashboard-kpi-grid">
          <MinimalKpiCard title="Attendance Rate" value={data.kpis.attendanceRate} icon={<Clock size={26} />} iconBgColor="emerald" />
          <MinimalKpiCard title="Leaves Taken" value={data.kpis.leavesTaken} icon={<Calendar size={26} />} iconBgColor="amber" />
          <MinimalKpiCard title="Upcoming Holidays" value={data.kpis.upcomingHolidays} icon={<Calendar size={26} />} iconBgColor="blue" />
          <MinimalKpiCard title="Performance Score" value={data.kpis.performanceScore} icon={<Award size={26} />} iconBgColor="purple" />
        </div>

        <div className="dashboard-chart-grid">
          <AnalyticsBarChart 
            title="Attendance Trend" 
            data={data.charts.attendanceTrend} 
            xKey="day" 
            series={[
              { key: 'hours', name: 'Hours Worked', color: '#10b981' }
            ]} 
          />
          <AnalyticsDonutChart 
            title="Salary Components" 
            data={data.charts.salaryComponents} 
          />
        </div>

        <div className="p-5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm">
          <h3 className="text-base font-semibold mb-4">Recent Payslips</h3>
          <div className="overflow-x-auto rounded-md border border-[var(--border-color)] bg-[var(--bg-tertiary)]/20">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-b border-[var(--border-color)]">
                <tr>
                  <th className="py-2.5 px-4">Month</th>
                  <th className="py-2.5 px-4">Amount</th>
                  <th className="py-2.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]/80 text-[var(--text-primary)]">
                {data.tables.recentPayslips.map((slip: any, i: number) => (
                  <tr key={i}>
                    <td className="py-2.5 px-4 font-medium">{slip.month}</td>
                    <td className="py-2.5 px-4">{slip.amount}</td>
                    <td className="py-2.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                        {slip.status}
                      </span>
                    </td>
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

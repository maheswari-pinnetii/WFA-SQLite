import React, { useState } from 'react';
import { MinimalKpiCard } from '../../../components/cards/MinimalKpiCard';
import { AnalyticsBarChart, AnalyticsLineChart } from '../../../components/charts/AnalyticsCharts';
import { Award, Compass, Target, Map } from 'lucide-react';
import { useSkillDistribution, useSkillGaps, useSkillCoverage, useCertificationStatus, useTrainingRecommendations } from '../../../hooks/useAnalytics';

export const SkillsAnalyticsPage: React.FC = () => {
  const [deptFilter, setDeptFilter] = useState('');
  
  const { data: distData, isLoading: distLoading } = useSkillDistribution(deptFilter ? { department: deptFilter } : {});
  const { data: gapsData, isLoading: gapsLoading } = useSkillGaps(deptFilter ? { department: deptFilter } : {});
  const { data: coverageData, isLoading: coverageLoading } = useSkillCoverage(deptFilter ? { department: deptFilter } : {});
  const { data: certData } = useCertificationStatus(deptFilter ? { department: deptFilter } : {});
  const { data: trainingData } = useTrainingRecommendations(deptFilter ? { department: deptFilter } : {});

  if (distLoading || gapsLoading || coverageLoading) {
    return <div className="text-sm text-[var(--text-muted)] p-6">Loading skills metrics...</div>;
  }

  const topSkillsCount = distData?.length || 0;
  const missingSkillsCount = gapsData?.reduce((sum: number, item: any) => sum + item.missingCount, 0) || 0;
  const totalEmployeesWithSkills = coverageData?.reduce((sum: number, item: any) => sum + item.totalEmployeesWithSkills, 0) || 0;
  const avgLevel = distData?.length ? (distData.reduce((sum: number, item: any) => sum + item.averageLevel, 0) / distData.length).toFixed(1) : 0;

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[var(--border-color)] pb-4">
        <div>
          <span className="badge badge-info mb-1">Human Capital IQ</span>
          <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
            Skills Analytics & Competency Desk
          </h1>
          <p className="text-xs text-slate-400">
            Overview of technical competence, team expertise mapping, and skill inventory metrics.
          </p>
        </div>
        <div>
           <select 
              value={deptFilter} 
              onChange={(e) => setDeptFilter(e.target.value)}
              className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm rounded-md px-3 py-1.5 focus:outline-none focus:border-emerald-500"
            >
              <option value="">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Sales">Sales</option>
              <option value="HR">HR</option>
           </select>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MinimalKpiCard title="Distinct Skills Tracked" value={`${topSkillsCount} Competencies`} icon={<Award size={26} />} iconBgColor="emerald" trend="Mapped in system" trendType="positive" />
        <MinimalKpiCard title="Avg Competency Level" value={`${avgLevel} / 5.0`} icon={<Compass size={26} />} iconBgColor="blue" trend="Based on assessments" trendType="positive" />
        <MinimalKpiCard title="Reported Skill Gaps" value={`${missingSkillsCount} Occurrences`} icon={<Target size={26} />} iconBgColor="rose" trend="Requires training" trendType="negative" />
        <MinimalKpiCard title="Workforce Coverage" value={`${totalEmployeesWithSkills} Employees`} icon={<Map size={26} />} iconBgColor="amber" trend="With logged skills" trendType="positive" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsBarChart
          title="Skill Distribution & Proficiency"
          subtitle="Top skills across the organization and average proficiency level"
          data={distData?.slice(0, 10) || []}
          xKey="skillName"
          series={[
            { key: 'employeeCount', name: 'Employees', color: '#10b981' }
          ]}
        />
        
        <AnalyticsBarChart
          title="Critical Skill Gaps"
          subtitle="Missing skills reported by managers or required by open roles"
          data={gapsData?.slice(0, 10) || []}
          xKey="skillName"
          series={[
            { key: 'missingCount', name: 'Missing Count', color: '#f43f5e' }
          ]}
          layout="vertical"
        />

        <AnalyticsLineChart
          title="Department Skill Coverage"
          subtitle="Employees with mapped skills vs Total skills logged per department"
          data={coverageData || []}
          xKey="department"
          series={[
            { key: 'totalEmployeesWithSkills', name: 'Employees Mapped', color: '#3b82f6' },
            { key: 'totalSkillsLogged', name: 'Total Skills Logged', color: '#8b5cf6' }
          ]}
        />
      </div>

      {/* Data Table */}
      <div className="glass-panel p-6 rounded-2xl border-[var(--border-color)] space-y-4">
        <h3 className="text-base font-bold text-[var(--text-primary)]">Skill Distribution Details</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-color)] text-slate-400 font-bold">
                <th className="p-3">Skill Name</th>
                <th className="p-3">Employees Possessing</th>
                <th className="p-3">Average Proficiency (1-5)</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {(distData || []).map((item: any, idx: number) => (
                <tr key={idx} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-tertiary)] transition-colors">
                  <td className="p-3 font-semibold text-[var(--text-primary)]">{item.skillName}</td>
                  <td className="p-3 text-slate-300">{item.employeeCount}</td>
                  <td className="p-3 text-slate-400">{item.averageLevel}</td>
                  <td className="p-3 font-bold">
                     <span className={`px-2 py-1 rounded text-[10px] ${item.employeeCount > 5 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                        {item.employeeCount > 5 ? 'HEALTHY' : 'NEEDS ATTENTION'}
                     </span>
                  </td>
                </tr>
              ))}
              {(!distData || distData.length === 0) && (
                <tr>
                   <td colSpan={4} className="p-6 text-center text-[var(--text-muted)]">No skill data available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Certification and Training Recommendations section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl border-[var(--border-color)] space-y-4">
          <h3 className="text-base font-bold text-[var(--text-primary)]">Certification Status</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-slate-400 font-bold">
                  <th className="p-3">Certification</th>
                  <th className="p-3">Certified Employees</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {(certData || []).map((item: any, idx: number) => (
                  <tr key={idx} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-tertiary)] transition-colors">
                    <td className="p-3 font-semibold text-[var(--text-primary)]">{item.certificationName}</td>
                    <td className="p-3 text-slate-300">{item.certifiedCount}</td>
                    <td className="p-3 font-bold">
                       <span className="px-2 py-1 rounded text-[10px] bg-emerald-500/20 text-emerald-400">
                          ACTIVE
                       </span>
                    </td>
                  </tr>
                ))}
                {(!certData || certData.length === 0) && (
                  <tr>
                     <td colSpan={3} className="p-6 text-center text-[var(--text-muted)]">No certification data available.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border-[var(--border-color)] space-y-4">
          <h3 className="text-base font-bold text-[var(--text-primary)]">Top Training Recommendations</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-slate-400 font-bold">
                  <th className="p-3">Skill Gap</th>
                  <th className="p-3">Missing Count</th>
                  <th className="p-3">Recommendation</th>
                </tr>
              </thead>
              <tbody>
                {(trainingData || []).map((item: any, idx: number) => (
                  <tr key={idx} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-tertiary)] transition-colors">
                    <td className="p-3 font-semibold text-[var(--text-primary)]">{item.skillName}</td>
                    <td className="p-3 text-slate-300">{item.gapCount}</td>
                    <td className="p-3 text-slate-400">{item.recommendation}</td>
                  </tr>
                ))}
                {(!trainingData || trainingData.length === 0) && (
                  <tr>
                     <td colSpan={3} className="p-6 text-center text-[var(--text-muted)]">No training recommendations currently.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

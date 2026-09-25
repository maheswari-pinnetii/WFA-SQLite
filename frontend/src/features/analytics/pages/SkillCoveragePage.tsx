import React from 'react';
import { RoleGuard } from '../../../features/auth/security/guards/RoleGuard';
import { Role } from '../../../features/auth/security/roles/roles';
import { MinimalKpiCard } from '../../../components/cards/MinimalKpiCard';
import { Map, ShieldCheck, Award, Users } from 'lucide-react';

export const SkillCoveragePage: React.FC = () => {
  const [certifications, setCertifications] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [stats, setStats] = React.useState({ active: 0, expired: 0, expiring: 0 });

  React.useEffect(() => {
    const fetchCerts = async () => {
      try {
        const { apiClient } = await import('../../../api/client');
        const response = await apiClient.get('/v1/analytics/certifications');
        const certs = response.data?.data || [];
        setCertifications(certs);
        
        let active = 0;
        let expired = 0;
        let expiring = 0;
        certs.forEach((c: any) => {
          active += c.certified || 0;
          expired += c.expired || 0;
          expiring += c.expiringSoon || 0;
        });
        setStats({ active, expired, expiring });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchCerts();
  }, []);

  if (loading) return <div className="text-sm text-[var(--text-muted)] p-6">Loading certification data...</div>;


  return (
    <>
      <div className="space-y-6 animate-fadeIn pb-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[var(--border-color)] pb-4">
          <div>
            <span className="badge badge-admin mb-1">Human Capital Auditing</span>
            <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
              Skill Coverage & Certificates
            </h1>
            <p className="text-xs text-slate-400">
              Audit active professional certifications, compliance rates, and expert density inside teams.
            </p>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <MinimalKpiCard title="Active Certifications" value={`${certifications.length} Unique`} icon={<Award size={26} />} iconBgColor="emerald" trend={`${stats.active} holders`} trendType="positive" />
          <MinimalKpiCard title="Compliance Rate" value="100%" icon={<ShieldCheck size={26} />} iconBgColor="blue" trend={`${stats.expired} expired`} trendType="positive" />
          <MinimalKpiCard title="Staff Coverage" value={`${stats.active} Employees`} icon={<Users size={26} />} iconBgColor="purple" trend="Active" trendType="positive" />
          <MinimalKpiCard title="Expiring Soon" value={`${stats.expiring} Expiring`} icon={<Map size={26} />} iconBgColor="amber" trend="Next 90 days" trendType="negative" />
        </div>

        {/* Certificates List */}
        <div className="glass-panel p-6 rounded-2xl border-[var(--border-color)] space-y-4">
          <h3 className="text-base font-bold text-[var(--text-primary)]">Active Professional Certifications</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-slate-400 font-bold">
                  <th className="p-3">Certification Title</th>
                  <th className="p-3">Active Holders</th>
                  <th className="p-3">Expired</th>
                  <th className="p-3">Expiring Soon (90d)</th>
                </tr>
              </thead>
              <tbody>
                {certifications.map((cert, idx) => (
                  <tr key={idx} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-tertiary)] transition-colors">
                    <td className="p-3 font-semibold text-[var(--text-primary)]">{cert.name}</td>
                    <td className="p-3 font-bold text-emerald-400">{cert.certified} Employees</td>
                    <td className="p-3 text-rose-400 font-bold">{cert.expired}</td>
                    <td className="p-3 text-amber-400 font-bold">{cert.expiringSoon}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

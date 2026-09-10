import React, { useState, useEffect } from 'react';
import { RoleGuard } from '../../../security/guards/RoleGuard';
import { Role } from '../../../security/roles/roles';
import { MapPin, Plus, Globe, Clock, Users, Loader2 } from 'lucide-react';
import { Button } from '../../../shared/components/Button';

export const LocationsManagement: React.FC = () => {
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/locations', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setLocations(data.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch locations:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-emerald-500" size={32} /></div>;

  return (
    <RoleGuard allowedRoles={[Role.ADMIN]}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
              <MapPin className="text-amber-400" size={24} />
              Global Office Locations & Compliance Scopes
            </h2>
            <p className="text-sm text-slate-400">
              Manage international work hubs, regional timezone compliance, and site headcounts.
            </p>
          </div>
          <Button variant="primary" className="flex items-center gap-2">
            <Plus size={16} /> Add Location
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {locations.map((loc) => (
            <div key={loc.id} className="glass-panel p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-base text-slate-100 flex items-center gap-2">
                  <Globe size={18} className="text-emerald-400" />
                  {loc.city}
                </span>
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                    loc.status === 'OPERATIONAL'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {loc.status}
                </span>
              </div>
              <div className="text-xs text-slate-400">{loc.country} • <span className="font-mono text-emerald-400">{loc.code}</span></div>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-medium text-slate-300">
                <span className="flex items-center gap-1"><Clock size={13} className="text-slate-400" /> {loc.timezone}</span>
                <span className="flex items-center gap-1 font-bold text-slate-200"><Users size={13} className="text-cyan-400" /> {loc.headcount} Staff</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </RoleGuard>
  );
};

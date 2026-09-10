import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import api from '../../../../api/axiosInstance';

interface NotificationPreference {
  id: string;
  type: string;
  inApp: boolean | number;
  email: boolean | number;
}

export const NotificationPreferences: React.FC = () => {
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    setLoading(true);
    try {
      const response = await api.get('/notifications/preferences');
      setPreferences(response.data.data);
    } catch (err) {
      console.error('Failed to fetch preferences', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (type: string, channel: 'inApp' | 'email') => {
    const updatedPrefs = preferences.map(p => {
      if (p.type === type) {
        return { ...p, [channel]: !p[channel] };
      }
      return p;
    });
    setPreferences(updatedPrefs);

    const targetPref = updatedPrefs.find(p => p.type === type);
    if (!targetPref) return;

    setSaving(true);
    try {
      await api.put('/notifications/preferences', {
        preferences: [
          {
            type,
            inApp: targetPref.inApp,
            email: targetPref.email
          }
        ]
      });
    } catch (err) {
      console.error('Failed to save preferences', err);
      fetchPreferences(); // Revert on failure
    } finally {
      setSaving(false);
    }
  };

  const prefTypes = [
    { type: 'LEAVE', label: 'Leave Requests', desc: 'Updates on leave approvals and rejections' },
    { type: 'ATTENDANCE', label: 'Attendance', desc: 'Alerts for late check-ins and absences' },
    { type: 'APPROVAL', label: 'Workflows', desc: 'Notifications for pending workflow approvals' },
    { type: 'PAYROLL', label: 'Payroll', desc: 'Alerts when new payslips are generated' },
    { type: 'SYSTEM', label: 'System Alerts', desc: 'Important system announcements' },
  ];

  if (loading) {
    return <div className="text-sm text-slate-500 animate-pulse">Loading preferences...</div>;
  }

  return (
    <div className="space-y-6 text-[var(--text-primary)] animate-fadeIn">
      <div>
        <h4 className="text-sm font-extrabold border-b border-[var(--border-color)] pb-2 flex items-center gap-1.5">
          <Bell size={16} className="text-emerald-500" /> Notification Preferences
        </h4>
        <p className="text-[10px] text-slate-400 mt-2">Manage how you receive alerts and updates from the system.</p>
      </div>

      <div className="space-y-4">
        {prefTypes.map(pt => {
          const pref = preferences.find(p => p.type === pt.type) || { inApp: true, email: true };
          return (
            <div key={pt.type} className="p-4 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] flex items-center justify-between">
              <div>
                <p className="font-bold text-xs">{pt.label}</p>
                <p className="text-[10px] text-slate-400">{pt.desc}</p>
              </div>
              
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!pref.inApp}
                    onChange={() => handleToggle(pt.type, 'inApp')}
                    disabled={saving}
                    className="accent-emerald-500 w-4 h-4 cursor-pointer"
                  />
                  <span className="text-[10px] font-medium text-slate-500">In-App</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!pref.email}
                    onChange={() => handleToggle(pt.type, 'email')}
                    disabled={saving}
                    className="accent-emerald-500 w-4 h-4 cursor-pointer"
                  />
                  <span className="text-[10px] font-medium text-slate-500">Email</span>
                </label>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

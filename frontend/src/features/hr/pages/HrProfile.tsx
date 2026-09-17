import React, { useState } from 'react';
import { Users, Settings, Bell, Briefcase } from 'lucide-react';
import { ProfileHeader } from '../../profile/components/ProfileHeader';
import { SecurityTab } from '../../profile/components/SecurityTab';
import { NotificationPreferences } from '../../employee/pages/NotificationPreferences';

export const HrProfile: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'hr' | 'security' | 'notifications'>('hr');

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn pb-24">
      <ProfileHeader title="HR Profile" subtitle="Manage your credentials, HR access, and notifications" />

      <div className="glass-panel p-6 md:p-8 space-y-6">
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-4 border-b border-[var(--border-color)]">
          {[
            { id: 'hr', label: 'HR Access', icon: <Briefcase size={16} /> },
            { id: 'security', label: 'Security', icon: <Settings size={16} /> },
            { id: 'notifications', label: 'Notifications', icon: <Bell size={16} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 flex items-center gap-1.5 border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-emerald-500 text-emerald-500 font-extrabold'
                  : 'border-transparent text-slate-400 hover:text-[var(--text-primary)]'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'hr' && (
          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
            <Users size={32} className="mx-auto text-emerald-500 mb-2" />
            <h3 className="font-bold text-lg text-emerald-500">Human Resources Privileges</h3>
            <p className="text-xs text-slate-400 mt-1">You have access to organizational workforce analytics and employee lifecycle management.</p>
          </div>
        )}

        {activeTab === 'security' && <SecurityTab />}
        
        {activeTab === 'notifications' && <NotificationPreferences />}
      </div>
    </div>
  );
};

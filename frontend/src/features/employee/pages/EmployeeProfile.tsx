import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, FileText, Settings, Bell } from 'lucide-react';
import { useAuth } from '../../../auth/hooks/useAuth';
import { ProfileHeader } from '../../profile/components/ProfileHeader';
import { SecurityTab } from '../../profile/components/SecurityTab';
import { DocumentsTab } from '../../profile/components/DocumentsTab';
import { NotificationPreferences } from './NotificationPreferences';

export const EmployeeProfile: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'attendance' | 'performance' | 'documents' | 'security' | 'notifications'>('attendance');

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn pb-24">
      <ProfileHeader title="Employee Profile" subtitle="Manage your attendance, performance, and credentials" />

      <div className="glass-panel p-6 md:p-8 space-y-6">
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-4 border-b border-[var(--border-color)]">
          {[
            { id: 'attendance', label: 'Attendance', icon: <Calendar size={16} /> },
            { id: 'performance', label: 'Performance', icon: <TrendingUp size={16} /> },
            { id: 'documents', label: 'Documents', icon: <FileText size={16} /> },
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
        {activeTab === 'attendance' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Stats Overview */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-[10px] text-emerald-400 font-bold">Present Days</p>
                <p className="text-lg font-black text-emerald-500">22 Days</p>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-[10px] text-emerald-400 font-bold">Remote WFH</p>
                <p className="text-lg font-black text-emerald-500">4 Days</p>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-[10px] text-emerald-400 font-bold">Leaves</p>
                <p className="text-lg font-black text-emerald-500">1 Day</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-emerald-400">Quarterly KPI Score</p>
                <p className="text-2xl font-black text-emerald-500">96 / 100</p>
              </div>
              <span className="badge badge-success">Top 5% Performer</span>
            </div>
          </div>
        )}

        {activeTab === 'documents' && <DocumentsTab />}
        {activeTab === 'security' && <SecurityTab />}
        {activeTab === 'notifications' && <NotificationPreferences />}
      </div>
    </div>
  );
};

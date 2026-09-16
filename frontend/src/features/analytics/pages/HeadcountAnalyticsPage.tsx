import React from 'react';
import { Users, TrendingUp, UserPlus, UserMinus, Building2, MapPin } from 'lucide-react';

export const HeadcountAnalyticsPage: React.FC = () => {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-emerald-500 font-medium text-xs tracking-wider uppercase mb-1">
            <Users size={16} />
            <span>Workforce Demographics</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Headcount & Growth Analytics</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            Real-time workforce distribution across departments, locations, employment types, and tenure bands.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-color)]">
          <div className="text-[var(--text-muted)] text-sm font-medium">Total Headcount</div>
          <div className="text-2xl font-bold text-[var(--text-primary)] mt-2">172</div>
          <p className="text-xs text-emerald-400 mt-1">↑ 4.2% MoM growth</p>
        </div>

        <div className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-color)]">
          <div className="text-[var(--text-muted)] text-sm font-medium">Full-Time Employees</div>
          <div className="text-2xl font-bold text-[var(--text-primary)] mt-2">156</div>
          <p className="text-xs text-[var(--text-muted)] mt-1">90.6% of total workforce</p>
        </div>

        <div className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-color)]">
          <div className="text-[var(--text-muted)] text-sm font-medium">Contractors & Interns</div>
          <div className="text-2xl font-bold text-[var(--text-primary)] mt-2">16</div>
          <p className="text-xs text-[var(--text-muted)] mt-1">9.4% contingent staff</p>
        </div>

        <div className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-color)]">
          <div className="text-[var(--text-muted)] text-sm font-medium">Average Tenure</div>
          <div className="text-2xl font-bold text-emerald-400 mt-2">2.4 Years</div>
          <p className="text-xs text-[var(--text-muted)] mt-1">Strong retention in tech leads</p>
        </div>
      </div>

      <div className="bg-[var(--bg-card)] p-6 rounded-xl border border-[var(--border-color)] space-y-4">
        <h3 className="font-semibold text-[var(--text-primary)]">Department Distribution</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-4 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-color)]">
            <div className="text-xs text-[var(--text-muted)]">Engineering & Tech</div>
            <div className="text-xl font-bold text-[var(--text-primary)] mt-1">84 Employees</div>
            <div className="w-full bg-[var(--border-color)] h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-emerald-500 h-full w-[48%]" />
            </div>
          </div>
          <div className="p-4 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-color)]">
            <div className="text-xs text-[var(--text-muted)]">Product & Design</div>
            <div className="text-xl font-bold text-[var(--text-primary)] mt-1">32 Employees</div>
            <div className="w-full bg-[var(--border-color)] h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-cyan-500 h-full w-[18%]" />
            </div>
          </div>
          <div className="p-4 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-color)]">
            <div className="text-xs text-[var(--text-muted)]">Sales & Marketing</div>
            <div className="text-xl font-bold text-[var(--text-primary)] mt-1">28 Employees</div>
            <div className="w-full bg-[var(--border-color)] h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-purple-500 h-full w-[16%]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

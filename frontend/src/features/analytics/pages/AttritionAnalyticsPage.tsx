import React from 'react';
import { UserMinus, TrendingDown, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const AttritionAnalyticsPage: React.FC = () => {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-rose-500 font-medium text-xs tracking-wider uppercase mb-1">
            <UserMinus size={16} />
            <span>Retention & Separation Risk</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Attrition & Churn Analytics</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            Track voluntary vs involuntary turnover, exit reasons, flight risks, and retention metrics.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-color)]">
          <div className="text-[var(--text-muted)] text-sm font-medium">Annualized Attrition Rate</div>
          <div className="text-2xl font-bold text-emerald-400 mt-2">6.8%</div>
          <p className="text-xs text-emerald-400 mt-1">Well below industry benchmark (12%)</p>
        </div>

        <div className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-color)]">
          <div className="text-[var(--text-muted)] text-sm font-medium">Voluntary Resignations</div>
          <div className="text-2xl font-bold text-[var(--text-primary)] mt-2">8 Employees</div>
          <p className="text-xs text-[var(--text-muted)] mt-1">Past 12 months</p>
        </div>

        <div className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-color)]">
          <div className="text-[var(--text-muted)] text-sm font-medium">Involuntary Separations</div>
          <div className="text-2xl font-bold text-[var(--text-primary)] mt-2">2 Employees</div>
          <p className="text-xs text-[var(--text-muted)] mt-1">Performance / probation end</p>
        </div>

        <div className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-color)]">
          <div className="text-[var(--text-muted)] text-sm font-medium">Flight Risk Signals</div>
          <div className="text-2xl font-bold text-amber-400 mt-2">3 Employees</div>
          <p className="text-xs text-amber-400 mt-1">High absence & low engagement</p>
        </div>
      </div>
    </div>
  );
};

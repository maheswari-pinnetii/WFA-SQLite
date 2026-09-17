import React from 'react';

interface KpiIconProps {
  icon: any;
  color: 'emerald' | 'cyan' | 'purple' | 'amber' | 'blue' | 'rose' | 'indigo' | 'teal';
}

const COLOR_MAPS: Record<string, { bg: string; text: string; border: string }> = {
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  rose: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
  indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20' },
  teal: { bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-500/20' },
};

export const KpiIcon: React.FC<KpiIconProps> = ({ icon: Icon, color }) => {
  const styles = COLOR_MAPS[color] || COLOR_MAPS.emerald;

  return (
    <div className={`p-2.5 rounded-xl border ${styles.bg} ${styles.text} ${styles.border} transition-transform duration-300 group-hover:scale-105 shrink-0`}>
      <Icon size={20} strokeWidth={2} />
    </div>
  );
};

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

export function AnimatedTabs({
  tabs,
  activeTab,
  onChange,
  className,
}: {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-1.5 p-1 rounded-2xl bg-slate-950/80 border border-slate-800/80 backdrop-blur-md overflow-x-auto no-scrollbar',
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-colors duration-200 z-10 select-none whitespace-nowrap cursor-pointer',
              isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
            )}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={cn(
                  'px-1.5 py-0.2 rounded-full text-[10px] font-black',
                  isActive ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400'
                )}
              >
                {tab.badge}
              </span>
            )}
            {isActive && (
              <motion.div
                layoutId="active-pill-tab"
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                className="absolute inset-0 bg-blue-600 rounded-xl -z-10 shadow-md shadow-blue-500/25"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

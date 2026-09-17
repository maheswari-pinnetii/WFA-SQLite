import React from 'react';
import { Radio } from 'lucide-react';
import { socket } from '../../../websocket/socket';

interface ChartHeaderProps {
  title: string;
  subtitle?: string;
  realtime?: boolean;
  actionSlot?: React.ReactNode;
}

export const ChartHeader: React.FC<ChartHeaderProps> = ({ title, subtitle, realtime = false, actionSlot }) => {
  const isConnected = socket.connected;

  return (
    <div className="flex items-start justify-between pb-3 border-b border-[var(--border-color)]/60 mb-4 gap-3">
      <div>
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold text-[var(--text-primary)] tracking-tight">
            {title}
          </h3>
          {realtime && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              <Radio size={12} />
              {isConnected ? 'Live' : 'Offline'}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            {subtitle}
          </p>
        )}
      </div>

      {actionSlot && <div className="shrink-0">{actionSlot}</div>}
    </div>
  );
};

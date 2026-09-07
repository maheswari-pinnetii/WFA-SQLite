import React from 'react';
import { Radio, RefreshCw, WifiOff } from 'lucide-react';
import clsx from 'clsx';

interface ConnectionStatusProps {
  status: 'connected' | 'reconnecting' | 'disconnected';
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ status }) => {
  if (status === 'connected') {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100">
        <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
        <span className="text-[12px] font-medium text-emerald-700">Live</span>
      </div>
    );
  }

  if (status === 'reconnecting') {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-100">
        <RefreshCw className="w-3.5 h-3.5 text-amber-600 animate-spin" />
        <span className="text-[12px] font-medium text-amber-700">Reconnecting...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-100">
      <WifiOff className="w-3.5 h-3.5 text-red-600" />
      <span className="text-[12px] font-medium text-red-700">Offline</span>
    </div>
  );
};

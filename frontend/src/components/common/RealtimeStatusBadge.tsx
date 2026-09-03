import React, { useState, useEffect } from 'react';
import { subscribeConnectionStatus, ConnectionStatus, connectSocket } from '../../websocket/socket';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

export const RealtimeStatusBadge: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');

  useEffect(() => {
    const unsubscribe = subscribeConnectionStatus((newStatus) => {
      setStatus(newStatus);
    });
    return () => unsubscribe();
  }, []);

  const handleManualReconnect = () => {
    connectSocket();
  };

  if (status === 'connected') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold shadow-sm backdrop-blur-md ${className}`}
        title="Real-Time SQLite & WebSocket Engine Connected"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <Wifi size={12} className="shrink-0" />
        <span className="hidden sm:inline">Live</span>
      </div>
    );
  }

  if (status === 'connecting') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold shadow-sm backdrop-blur-md ${className}`}
        title="Reconnecting to Real-Time Server..."
      >
        <RefreshCw size={12} className="animate-spin shrink-0" />
        <span className="hidden sm:inline">Reconnecting...</span>
      </div>
    );
  }

  return (
    <button
      onClick={handleManualReconnect}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 text-xs font-semibold shadow-sm backdrop-blur-md transition-all cursor-pointer ${className}`}
      title="Disconnected. Click to reconnect to real-time server"
    >
      <WifiOff size={12} className="shrink-0" />
      <span className="hidden sm:inline">Offline</span>
    </button>
  );
};

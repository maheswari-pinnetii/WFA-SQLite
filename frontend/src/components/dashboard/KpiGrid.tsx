import React, { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Role } from '../../security/roles/roles';
import { ROLE_KPI_CONFIGS, KpiItemConfig } from './kpi-config';
import { KpiCard } from './KpiCard';
import { KpiSkeleton } from './KpiSkeleton';
import { socket } from '../../websocket/socket';
import { Radio } from 'lucide-react';

interface KpiGridProps {
  role: Role;
  data?: Record<string, any>;
  loading?: boolean;
}

export const KpiGrid: React.FC<KpiGridProps> = ({ role, data = {}, loading = false }) => {
  const configs: KpiItemConfig[] = ROLE_KPI_CONFIGS[role] || ROLE_KPI_CONFIGS[Role.EMPLOYEE];
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState<boolean>(socket.connected);

  useEffect(() => {
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    // Socket.IO event listener for real-time invalidation
    const handleRealtimeUpdate = (eventPayload: any) => {
      // Invalidate dashboard queries dynamically on socket update
      queryClient.invalidateQueries();
    };

    // Subscribe to standard real-time update channels
    socket.on('attendance-update', handleRealtimeUpdate);
    socket.on('leave-update', handleRealtimeUpdate);
    socket.on('employee-update', handleRealtimeUpdate);
    socket.on('approval-update', handleRealtimeUpdate);
    socket.on('payroll-update', handleRealtimeUpdate);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('attendance-update', handleRealtimeUpdate);
      socket.off('leave-update', handleRealtimeUpdate);
      socket.off('employee-update', handleRealtimeUpdate);
      socket.off('approval-update', handleRealtimeUpdate);
      socket.off('payroll-update', handleRealtimeUpdate);
    };
  }, [queryClient]);

  return (
    <div className="space-y-4">
      {/* Live Socket.IO Header Status */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">
          Key Performance Indicators
        </h2>
        
        <div className="flex items-center gap-2 text-xs font-medium px-2.5 py-1 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)]">
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
          <Radio size={14} className={isConnected ? 'text-emerald-400' : 'text-slate-500'} />
          <span className={isConnected ? 'text-emerald-400' : 'text-[var(--text-muted)]'}>
            {isConnected ? 'Real-Time Sync Active' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Responsive Grid: 4 col desktop, 2 col tablet, 1 col mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <KpiSkeleton key={i} />)
          : configs.map((config) => (
              <KpiCard
                key={config.key}
                config={config}
                value={data[config.dataKey]}
                trend={data[config.trendKey || '']}
                sparklineData={data[config.sparklineKey || '']}
                loading={loading}
              />
            ))}
      </div>
    </div>
  );
};

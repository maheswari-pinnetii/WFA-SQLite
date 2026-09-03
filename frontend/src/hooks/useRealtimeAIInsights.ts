import { useState, useEffect, useCallback } from 'react';
import { socket, SOCKET_EVENTS } from '../websocket/socket';
import { apiClient } from '../services/api';

export interface AIInsightItem {
  id: string;
  type: string;
  title: string;
  description: string;
  severity: 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence: number;
  source: string;
  department?: string;
  createdAt: string;
  status: string;
}

export const useRealtimeAIInsights = () => {
  const [insights, setInsights] = useState<AIInsightItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/v1/ai/insights');
      if (res.data?.success && Array.isArray(res.data.data)) {
        setInsights(res.data.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load AI insights.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshInsights = async () => {
    try {
      setIsRefreshing(true);
      const res = await apiClient.post('/v1/ai/insights/refresh', {});
      if (res.data?.success && Array.isArray(res.data.data)) {
        setInsights(res.data.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to refresh AI analysis.');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    void fetchInsights();

    const handleNewInsight = (insight: AIInsightItem) => {
      setInsights((prev) => {
        // Avoid duplicates
        if (prev.some((item) => item.id === insight.id)) return prev;
        return [insight, ...prev].slice(0, 15);
      });
    };

    socket.on(SOCKET_EVENTS.AI_INSIGHT_GENERATED, handleNewInsight);
    socket.on(SOCKET_EVENTS.AI_ALERT_GENERATED, handleNewInsight);

    return () => {
      socket.off(SOCKET_EVENTS.AI_INSIGHT_GENERATED, handleNewInsight);
      socket.off(SOCKET_EVENTS.AI_ALERT_GENERATED, handleNewInsight);
    };
  }, [fetchInsights]);

  return {
    insights,
    isLoading,
    isRefreshing,
    error,
    refreshInsights,
    reload: fetchInsights
  };
};

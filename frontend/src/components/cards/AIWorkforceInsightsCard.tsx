import React from 'react';
import { useRealtimeAIInsights, AIInsightItem } from '../../hooks/useRealtimeAIInsights';
import { Sparkles, AlertTriangle, TrendingUp, Clock, RefreshCw, ShieldAlert, Cpu } from 'lucide-react';

export const AIWorkforceInsightsCard: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { insights, isLoading, isRefreshing, refreshInsights } = useRealtimeAIInsights();

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <ShieldAlert size={10} /> {severity}
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <AlertTriangle size={10} /> {severity}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <TrendingUp size={10} /> INSIGHT
          </span>
        );
    }
  };

  return (
    <div
      className={`p-6 rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-indigo-950/40 border border-indigo-500/30 shadow-xl backdrop-blur-md relative overflow-hidden ${className}`}
    >
      {/* Subtle background ambient glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 flex items-center justify-center shrink-0 shadow-inner">
            <Cpu size={20} className="text-indigo-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
                AI Workforce Intelligence
                <Sparkles size={14} className="text-amber-400" />
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 uppercase">
                Real-Time
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Statistical anomaly detection, shift capacity predictions & trend forecasting.
            </p>
          </div>
        </div>

        <button
          onClick={refreshInsights}
          disabled={isRefreshing}
          className="btn btn-secondary btn-xs flex items-center gap-1.5 text-xs text-slate-300 hover:text-white border-slate-700/80 shrink-0 cursor-pointer disabled:opacity-50"
          title="Run immediate workforce anomaly recalculation"
        >
          <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
          <span>{isRefreshing ? 'Analyzing...' : 'Recalculate'}</span>
        </button>
      </div>

      {/* Insights Content List */}
      <div className="space-y-3 relative z-10">
        {isLoading && insights.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
            <RefreshCw size={14} className="animate-spin text-indigo-400" />
            Analyzing SQLite workforce attendance data...
          </div>
        ) : insights.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 text-center">
            <p className="text-xs text-slate-400 font-medium">
              ✅ All workforce metrics are operating within normal statistical baselines. No anomalies detected.
            </p>
          </div>
        ) : (
          insights.slice(0, 4).map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/90 hover:border-indigo-500/40 transition-all shadow-sm"
            >
              <div className="flex items-start justify-between gap-3 mb-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  {getSeverityBadge(item.severity)}
                  <h4 className="text-xs font-bold text-slate-200">{item.title}</h4>
                </div>
                <div className="text-[10px] text-slate-500 shrink-0 flex items-center gap-1 font-mono">
                  <Clock size={10} />
                  <span>Just now</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed pl-1 mb-2">
                {item.description}
              </p>

              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1.5 border-t border-slate-800/60">
                <span className="font-mono text-indigo-400/90">
                  Confidence: {Math.round(item.confidence * 100)}%
                </span>
                <span className="text-slate-500 text-[9px] uppercase tracking-wider">
                  Source: {item.source}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cookie, Settings, Check, X } from 'lucide-react';

export const CookieBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true,
    analytics: true,
    functional: true
  });

  useEffect(() => {
    const consent = localStorage.getItem('wfa_cookie_consent');
    if (!consent) {
      // Delay showing slightly for smooth entrance
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem(
      'wfa_cookie_consent',
      JSON.stringify({ essential: true, analytics: true, functional: true, timestamp: new Date().toISOString() })
    );
    setVisible(false);
  };

  const handleAcceptEssential = () => {
    localStorage.setItem(
      'wfa_cookie_consent',
      JSON.stringify({ essential: true, analytics: false, functional: false, timestamp: new Date().toISOString() })
    );
    setVisible(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem(
      'wfa_cookie_consent',
      JSON.stringify({ ...preferences, essential: true, timestamp: new Date().toISOString() })
    );
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent banner"
      className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md z-[9990] animate-fadeIn"
    >
      <div className="glass-panel p-5 rounded-2xl bg-[var(--bg-secondary)]/95 border border-[var(--border-color)] shadow-2xl backdrop-blur-xl space-y-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
            <Cookie size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              Privacy & Cookie Preferences
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
              We use strictly necessary cookies to ensure our workforce management platform functions securely, plus optional analytics to optimize performance.
            </p>
          </div>
          <button
            onClick={handleAcceptEssential}
            className="p-1 text-slate-400 hover:text-slate-200 rounded-lg transition-colors"
            aria-label="Close and accept essential only"
          >
            <X size={16} />
          </button>
        </div>

        {showPreferences && (
          <div className="p-3.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-[var(--text-primary)]">Strictly Essential</span>
                <p className="text-[11px] text-[var(--text-secondary)]">Required for session security & MFA validation</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-500/20 text-blue-400">Always Active</span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-[var(--border-color)]">
              <div>
                <span className="font-bold text-[var(--text-primary)]">Performance & Analytics</span>
                <p className="text-[11px] text-[var(--text-secondary)]">Helps improve dashboard query speeds</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.analytics}
                onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                className="rounded accent-blue-600 cursor-pointer w-4 h-4"
              />
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-[var(--border-color)]">
              <div>
                <span className="font-bold text-[var(--text-primary)]">UI Functional State</span>
                <p className="text-[11px] text-[var(--text-secondary)]">Saves sidebar layout & theme preferences</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.functional}
                onChange={(e) => setPreferences({ ...preferences, functional: e.target.checked })}
                className="rounded accent-blue-600 cursor-pointer w-4 h-4"
              />
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 pt-1">
          {showPreferences ? (
            <button
              onClick={handleSavePreferences}
              className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-1.5"
            >
              <Check size={14} /> Save Choices
            </button>
          ) : (
            <>
              <button
                onClick={handleAcceptAll}
                className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all"
              >
                Accept All
              </button>
              <button
                onClick={handleAcceptEssential}
                className="py-2 px-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] text-xs font-semibold text-[var(--text-primary)] transition-all"
              >
                Essential Only
              </button>
              <button
                onClick={() => setShowPreferences(!showPreferences)}
                className="p-2 rounded-xl border border-[var(--border-color)] text-slate-400 hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-all"
                aria-label="Customize cookie settings"
                title="Customize preferences"
              >
                <Settings size={15} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

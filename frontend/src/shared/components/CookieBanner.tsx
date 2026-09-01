import React, { useState, useEffect } from 'react';
import { Cookie, Settings, Check, X, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/ui/button';

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
      const timer = setTimeout(() => setVisible(true), 1000);
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
      className="fixed bottom-16 md:bottom-6 right-4 md:right-6 max-w-sm sm:max-w-md w-full z-[9990] animate-fadeIn"
    >
      <div className="p-5 rounded-2xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-xl space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
              <Cookie size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Privacy & Cookies
              </h3>
              <p className="text-[11px] text-slate-400">Enterprise Data Compliance</p>
            </div>
          </div>
          <button
            onClick={handleAcceptEssential}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          We use strictly necessary cookies to ensure secure session authentication, role-based access, and system telemetry.
        </p>

        {showPreferences && (
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-200">Strictly Necessary</span>
                <p className="text-[10px] text-slate-400">Session auth & zero-trust tokens</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-500/20 text-blue-400">Always On</span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <div>
                <span className="font-bold text-slate-200">Analytics & Telemetry</span>
                <p className="text-[10px] text-slate-400">Helps optimize live shift queries</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.analytics}
                onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                className="rounded accent-blue-600 cursor-pointer w-4 h-4"
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 pt-1">
          {showPreferences ? (
            <Button
              variant="default"
              size="sm"
              onClick={handleSavePreferences}
              className="flex-1"
            >
              <Check size={14} className="mr-1" /> Save Preferences
            </Button>
          ) : (
            <>
              <Button
                variant="default"
                size="sm"
                onClick={handleAcceptAll}
                className="flex-1 font-bold text-xs"
              >
                Accept All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAcceptEssential}
                className="font-bold text-xs"
              >
                Essential Only
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreferences(!showPreferences)}
                className="px-2 text-slate-400 hover:text-white"
                title="Customize preferences"
              >
                <Settings size={16} />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

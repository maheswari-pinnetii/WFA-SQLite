import React, { useState, useEffect } from 'react';

export const CookieConsentBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasConsented = localStorage.getItem('cookie_consent_accepted');
    if (!hasConsented) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent_accepted', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-bottom-full duration-500">
      <div className="flex-1 max-w-4xl">
        <h3 className="text-sm font-semibold text-white mb-1">Internal Systems Policy</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          WFA-SQLite uses strictly necessary <code className="text-emerald-400 bg-emerald-400/10 px-1 py-0.5 rounded">HttpOnly</code> cookies to securely maintain your internal employee session. 
          By continuing to use this enterprise application, you acknowledge our <a href="#" className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2">Privacy Policy</a> and <a href="#" className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2">Terms of Use</a>.
        </p>
      </div>
      <div className="flex-shrink-0">
        <button
          onClick={handleAccept}
          className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-indigo-500/20"
        >
          Acknowledge
        </button>
      </div>
    </div>
  );
};

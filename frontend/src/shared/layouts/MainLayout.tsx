import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { EnterpriseHeader } from './components/EnterpriseHeader';
import { Sidebar } from './components/Sidebar';
import { SupportModal } from '../components/SupportModal';
import { ShortcutsModal } from '../components/ShortcutsModal';
import { CookieBanner } from '../components/CookieBanner';
import { OnboardingTourModal } from '../components/OnboardingTourModal';
import { NetworkStatusBanner } from '../components/NetworkStatusBanner';
import { BetaFeedbackModal } from '../components/BetaFeedbackModal';
import { PrivacySettingsModal } from '../components/PrivacySettingsModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useTheme } from '../../design-system/theme/theme';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { role, user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [betaFeedbackOpen, setBetaFeedbackOpen] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem('has_completed_onboarding');
    if (!completed) {
      setOnboardingOpen(true);
    }
  }, []);

  // Initialize collapsed state from localStorage (default to false / expanded on desktop)
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    const saved = localStorage.getItem('sidebar_collapsed');
    return saved !== null ? JSON.parse(saved) : false;
  });

  // Save collapsed state changes to localStorage
  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', JSON.stringify(collapsed));
  }, [collapsed]);

  // Set the default theme mode based on role recommendations ONLY when the role changes
  useEffect(() => {
    const lastInitializedRole = sessionStorage.getItem('wfa_initialized_role');
    if (lastInitializedRole !== role) {
      if (role === 'HR' || role === 'EMPLOYEE' || role === 'MANAGER') {
        setTheme('light');
      } else if (role === 'ADMIN' || role === 'TEAM_LEAD') {
        setTheme('dark');
      }
      sessionStorage.setItem('wfa_initialized_role', role);
    }
  }, [role, setTheme]);

  const toggleSidebar = () => {
    if (window.innerWidth < 768) {
      setMobileOpen((prev) => !prev);
    } else {
      setCollapsed((prev) => !prev);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const focusSearch = () => {
    const searchInput = document.querySelector('input[type="search"], input[placeholder*="Search"]') as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
    }
  };

  // Keyboard Shortcuts Hook
  useKeyboardShortcuts({
    onToggleShortcutsModal: () => setShortcutsModalOpen((prev) => !prev),
    onToggleSidebar: toggleSidebar,
    onToggleTheme: toggleTheme,
    onFocusSearch: focusSearch,
    onEscape: () => {
      setSupportModalOpen(false);
      setShortcutsModalOpen(false);
      setMobileOpen(false);
    }
  });

  const getThemeClass = (userRole: string) => {
    switch (userRole) {
      case 'HR': return 'earth-theme';
      case 'EMPLOYEE': return 'arctic-theme';
      case 'TEAM_LEAD': return 'midnight-theme';
      case 'MANAGER': return 'indigo-theme';
      case 'ADMIN': return 'sunset-theme';
      default: return 'emerald-theme';
    }
  };

  const themeClass = getThemeClass(role);

  return (
    <div data-role={role} className={`app-shell ${themeClass} h-screen min-h-screen flex flex-col overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300`}>
      {/* Accessibility Skip-to-content Link */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Fixed Sticky Enterprise Header at root level spanning full width */}
      <EnterpriseHeader
        onToggleSidebar={toggleSidebar}
        onOpenHelp={() => setSupportModalOpen(true)}
      />

      {/* Main Body Wrapper (Below Header) */}
      <div className="main-body flex-1 flex overflow-hidden w-full relative">
        {/* Sleek Dynamic Modular Sidebar Navigation & Mobile Menu */}
        <Sidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
          onOpenSupport={() => setSupportModalOpen(true)}
        />

        {/* Main Content Area */}
        <main
          id="main-content"
          tabIndex={-1}
          className="app-main flex-1 overflow-y-auto p-4 md:p-8 space-y-6 focus:outline-none"
        >
          {children}
        </main>
      </div>

      {/* Small footprint dashboard footer spanning full width */}
      <footer className="app-footer shrink-0 border-t border-[var(--border-color)] bg-[var(--bg-secondary)] px-6 py-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <span>&copy; {new Date().getFullYear()} Workforce Analytics. All rights reserved.</span>
        <div className="flex items-center gap-4 flex-wrap">
          <button
            onClick={() => setOnboardingOpen(true)}
            className="cursor-pointer hover:text-blue-400 transition-colors"
          >
            Product Tour
          </button>
          <button
            onClick={() => setBetaFeedbackOpen(true)}
            className="cursor-pointer hover:text-purple-400 transition-colors flex items-center gap-1 font-semibold"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" /> Beta Feedback
          </button>
          <button
            onClick={() => setPrivacyModalOpen(true)}
            className="cursor-pointer hover:text-white transition-colors"
          >
            Privacy Settings
          </button>
          <button
            onClick={() => setShortcutsModalOpen(true)}
            className="cursor-pointer hover:text-white transition-colors flex items-center gap-1.5"
            title="Press ? for keyboard shortcuts"
          >
            <span>Shortcuts</span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-slate-800 border border-slate-700 text-slate-300">?</kbd>
          </button>
          <span className="cursor-pointer hover:text-white transition-colors" onClick={() => setSupportModalOpen(true)}>Support & FAQs</span>
          <span className="text-slate-500 font-mono">v1.0.0</span>
        </div>
      </footer>

      {/* Responsive Mobile Bottom Navigation Bar */}
      <MobileBottomNav onOpenMobileMenu={() => setMobileOpen(true)} />

      {/* Real-time Network Connectivity Status */}
      <NetworkStatusBanner />

      {/* Cookie Consent Banner */}
      <CookieBanner />

      {/* Onboarding Interactive Product Tour */}
      <OnboardingTourModal
        isOpen={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
        userName={user?.name}
        userRole={role}
      />

      {/* Beta Feedback & Issue Reporter */}
      <BetaFeedbackModal
        isOpen={betaFeedbackOpen}
        onClose={() => setBetaFeedbackOpen(false)}
      />

      {/* Privacy & Data Governance Modal */}
      <PrivacySettingsModal
        isOpen={privacyModalOpen}
        onClose={() => setPrivacyModalOpen(false)}
      />

      {/* Support & IT Helpdesk Modal */}
      <SupportModal
        isOpen={supportModalOpen}
        onClose={() => setSupportModalOpen(false)}
      />

      {/* Keyboard Shortcuts Modal */}
      <ShortcutsModal
        isOpen={shortcutsModalOpen}
        onClose={() => setShortcutsModalOpen(false)}
      />
    </div>
  );
};


import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../../auth/hooks/useAuth';
import { useTheme } from '../../../design-system/theme/theme';
import { ROLE_LABELS } from '../../../security/roles/roles';
import { getRoleBadgeClass } from '../../utils/helpers';
import { StacklyLogo } from '../../../components/common/StacklyLogo';
import { LogoutModal } from '../../../auth/components/LogoutModal';
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  User,
  Settings,
  Shield,
  LogOut,
  ChevronDown,
  ChevronRight,
  X,
  MessageSquare,
  HelpCircle,
  Home,
  Layers,
} from 'lucide-react';
import { RealtimeStatusBadge } from '../../../components/common/RealtimeStatusBadge';
import { useRealtimeNotifications } from '../../../hooks/useRealtimeNotifications';
import { connectSocket } from '../../../websocket/socket';
import { NotificationCenter } from '../../../components/common/NotificationCenter';

interface EnterpriseHeaderProps {
  onToggleSidebar: () => void;
  onOpenHelp?: () => void;
}

export const EnterpriseHeader: React.FC<EnterpriseHeaderProps> = ({ onToggleSidebar, onOpenHelp }) => {
  const { user, role, logout, permissions } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchCategory, setSearchCategory] = useState<'all' | 'employees' | 'departments' | 'reports' | 'security'>('all');

  // Dropdowns State
  const [activeDropdown, setActiveDropdown] = useState<'profile' | 'role' | 'messages' | null>(null);

  // Scope & Modal States
  const [showPermissionsPreview, setShowPermissionsPreview] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Connect Real-Time WebSocket Engine on authentication
  React.useEffect(() => {
    if (user?.id) {
      connectSocket(undefined, user.id, (user as any).organizationId || 'org-stackly');
    }
  }, [user]);

  const searchResultsMap = [
    { title: 'Global Headcount & Department Analytics', category: 'reports', path: '/admin/analytics' },
    { title: 'User Management & Security Scopes', category: 'security', path: '/admin/users' },
    { title: 'System Security Audit Stream', category: 'security', path: '/admin/audit-logs' },
    { title: 'Workforce Attendance Roster', category: 'employees', path: '/hr/attendance' },
    { title: 'Performance Review Matrix', category: 'employees', path: '/hr/performance' },
    { title: 'Engineering & Product Teams', category: 'departments', path: '/admin/departments' },
  ];



  const toggleDropdown = (name: 'profile' | 'role' | 'messages') => {
    setActiveDropdown((prev) => (prev === name ? null : name));
  };

  const handleSearchSubmit = (path: string) => {
    setSearchFocused(false);
    setSearchQuery('');
    navigate(path);
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    setActiveDropdown(null);
    navigate('/logout');
  };

  // Compute Breadcrumb Trail
  const getBreadcrumbs = () => {
    const segments = location.pathname.split('/').filter(Boolean);
    if (segments.length === 0) return [{ label: 'Dashboard', path: '/' }];
    
    return segments.map((seg, idx) => {
      const url = `/${segments.slice(0, idx + 1).join('/')}`;
      const formatted = seg.charAt(0).toUpperCase() + seg.slice(1).replace('-', ' ');
      return { label: formatted, path: url };
    });
  };

  const breadcrumbs = getBreadcrumbs();

  const filteredSearchResults = searchResultsMap.filter((item) => {
    const matchesCategory = searchCategory === 'all' || item.category === searchCategory;
    const matchesQuery = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const isDark = theme === 'dark';

  return (
    <header className={`app-header h-16 px-4 flex items-center justify-between sticky top-0 z-40 w-full shrink-0 transition-colors border-b overflow-visible ${
      isDark ? 'bg-[#0B1120] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
    }`}>
      {/* LEFT SECTION: Logo & Breadcrumb Navigation */}
      <div className="header-brand flex items-center gap-3 md:gap-4 shrink-0 min-w-0">

        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation"
          className="header-menu-button p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer transition-colors"
        >
          <Menu size={18} />
        </button>

        {/* STACKLY Brand Logo */}
        <Link to="/" className="shrink-0 flex items-center hover:opacity-90 transition-opacity">
          <StacklyLogo size={32} />
        </Link>

        {/* Dynamic Breadcrumbs */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs min-w-0 pl-2 border-l border-slate-200 dark:border-slate-800">
          <Link to="/" className="text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1">
            <Home size={14} />
          </Link>
          {breadcrumbs.map((b, idx) => (
            <React.Fragment key={b.path}>
              <ChevronRight className="text-slate-400 dark:text-slate-600" size={13} />
              <span className={`truncate max-w-[130px] ${
                idx === breadcrumbs.length - 1 ? 'font-medium text-slate-900 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}>
                {b.label}
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* CENTER SECTION: Global Command Search Surface */}
      <div className="flex-1 max-w-md mx-4 hidden md:block relative">
        <div className="relative flex items-center">
          <Search className="absolute left-3 text-slate-400 pointer-events-none" size={15} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            placeholder="Search employees, departments, reports..."
            style={{ paddingLeft: '2.25rem' }}
            className={`w-full rounded-lg pr-4 py-1.5 text-xs transition-all outline-none border ${
              isDark
                ? 'bg-slate-900 border-slate-800 text-slate-100 placeholder-slate-500 focus:border-emerald-500'
                : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-600 focus:bg-white'
            }`}
          />
        </div>

        {/* Global Search Results Overlay */}
        {searchFocused && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 shadow-lg z-50 rounded-lg space-y-2 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Search className="text-emerald-500" size={13} /> Command Palette Search
              </span>
              <button onClick={() => setSearchFocused(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                <X size={14} />
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {(['all', 'employees', 'departments', 'reports', 'security'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSearchCategory(cat)}
                  className={`px-2.5 py-1 text-xs rounded-md font-medium capitalize transition-all cursor-pointer ${
                    searchCategory === cat
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 max-h-64 overflow-y-auto space-y-1">
              {filteredSearchResults.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-slate-400 py-3 text-center">No matching results found</p>
              ) : (
                filteredSearchResults.map((res, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSearchSubmit(res.path)}
                    className="w-full text-left p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <p className="text-xs font-medium text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">{res.title}</p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 capitalize">{res.category}</p>
                    </div>
                    <ChevronRight className="text-slate-400 group-hover:text-emerald-500" size={14} />
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* RIGHT SECTION: Quick Actions, Theme, Notifications & User Profile Menu */}
      <div className="header-actions flex items-center gap-2 sm:gap-3 shrink-0">
        
        {/* Real-Time Engine Status Badge */}
        <RealtimeStatusBadge />

        {/* Language Flag Selector */}
        <button
          type="button"
          aria-label="Select Language"
          className={`p-2 rounded-lg border transition-all cursor-pointer text-sm flex items-center justify-center ${
            isDark
              ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
              : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
          }`}
          title="Language: English (UK)"
        >
          🇬🇧
        </button>

        {/* 1. Notifications Center */}
        <NotificationCenter />

        {/* 2. Messages Icon */}
        <button
          onClick={() => toggleDropdown('messages')}
          aria-label="View Messages"
          className={`p-2 rounded-lg border transition-all hidden sm:block cursor-pointer ${
            isDark
              ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
              : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200'
          }`}
          title="Team Messages"
        >
          <MessageSquare size={18} />
        </button>

        {/* 3. Theme Toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle Light or Dark Theme"
          className={`p-2 rounded-lg border transition-all cursor-pointer ${
            isDark
              ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
              : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200'
          }`}
          title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
        >
          {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-slate-600" />}
        </button>

        {/* 4. Help Icon */}
        <button
          onClick={onOpenHelp}
          aria-label="Help & IT Desk Support"
          className={`p-2 rounded-lg border transition-all hidden md:block cursor-pointer ${
            isDark
              ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
              : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200'
          }`}
          title="24/7 Enterprise Help Desk"
        >
          <HelpCircle size={18} />
        </button>

        {/* 5. User Profile Menu Container */}
        {user && (
          <div className="header-profile relative border-l border-slate-200 dark:border-slate-800 pl-2.5 ml-1 shrink-0">
            <button
              onClick={() => toggleDropdown('profile')}
              aria-label="User Profile Menu"
              className="flex items-center gap-2 focus:outline-none group cursor-pointer p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
              title={`${user.name} (${ROLE_LABELS[role]})`}
            >
              <div className="relative shrink-0">
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border border-slate-300 dark:border-slate-700 shadow-sm"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-950" />
              </div>
              <ChevronDown size={14} className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors shrink-0" />
            </button>

            {/* STRICTLY CONSTRAINED USER PROFILE DROPDOWN MENU */}
            {activeDropdown === 'profile' && (
              <div className="header-popover absolute right-0 top-full mt-2 w-80 max-w-[320px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 shadow-lg z-50 rounded-lg text-xs text-slate-900 dark:text-slate-100 space-y-3 font-sans overflow-hidden">
                {/* Profile Header */}
                <div className="px-2 py-1 border-b border-slate-200 dark:border-slate-800 space-y-1">
                  <p className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">{user.name}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">{user.email}</p>
                  <div className="mt-2 flex items-center justify-between pt-1">
                    <span className={`badge ${getRoleBadgeClass(role)}`}>{ROLE_LABELS[role]}</span>
                    <button
                      onClick={() => setShowPermissionsPreview(!showPermissionsPreview)}
                      className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Layers size={13} /> {showPermissionsPreview ? 'Hide' : 'Permissions'}
                    </button>
                  </div>
                </div>

                {/* Permissions Expandable Box */}
                {showPermissionsPreview && (
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-md border border-slate-200 dark:border-slate-800 text-[10px] space-y-1 max-h-32 overflow-y-auto max-w-full">
                    <p className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Permissions ({permissions.length})</p>
                    <div className="flex flex-wrap gap-1">
                      {permissions.map((p, idx) => (
                        <span key={idx} className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 px-1.5 py-0.5 rounded font-mono text-[9px] truncate max-w-full">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Profile Actions List */}
                <div className="py-1 space-y-1 font-medium">
                  <button
                    onClick={() => { navigate('/employee/profile'); setActiveDropdown(null); }}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                  >
                    <User size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0" /> View Profile
                  </button>
                  <button
                    onClick={() => { navigate('/admin/settings'); setActiveDropdown(null); }}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                  >
                    <Settings size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0" /> Account Settings
                  </button>
                  <button
                    onClick={() => { navigate('/admin/users'); setActiveDropdown(null); }}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                  >
                    <Shield size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0" /> Access Control Matrix
                  </button>
                </div>

                {/* Log Out Action */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                  <button
                    onClick={handleConfirmLogout}
                    className="w-full text-left px-3 py-2 rounded-md bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 flex items-center gap-2.5 font-medium transition-colors cursor-pointer"
                  >
                    <LogOut size={15} className="shrink-0 text-rose-600 dark:text-rose-400" /> Log Out
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirmLogout={handleConfirmLogout}
      />
    </header>
  );
};

import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../../auth/hooks/useAuth';
import { useTheme } from '../../../design-system/theme/theme';
import { ROLE_LABELS, Role } from '../../../security/roles/roles';
import { PanelLeftClose, Sun, Moon, Search, X } from 'lucide-react';
import { 
  MAIN_NAVIGATION, 
  NavigationItem, 
  getNavigationForRole, 
  filterNavigationByQuery 
} from './SidebarConfig';
import { SidebarNavItem, hasActiveDescendant, isRouteActive } from './SidebarNavItem';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (value: boolean | ((prev: boolean) => boolean)) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  onOpenSupport: () => void;
}

const ROLE_ACCENTS: Record<Role, { className: string; shortLabel: string }> = {
  [Role.ADMIN]: { className: '', shortLabel: 'Admin workspace' },
  [Role.HR]: { className: '', shortLabel: 'People operations' },
  [Role.MANAGER]: { className: '', shortLabel: 'Department workspace' },
  [Role.TEAM_LEAD]: { className: '', shortLabel: 'Team workspace' },
  [Role.EMPLOYEE]: { className: '', shortLabel: 'Employee workspace' },
};

// Helper to get all ancestor IDs for a given path
const getActiveAncestorIds = (items: NavigationItem[], pathname: string): string[] => {
  let activeIds: string[] = [];
  
  for (const item of items) {
    if (isRouteActive(item, pathname) || hasActiveDescendant(item, pathname)) {
      activeIds.push(item.id);
      if (item.children) {
        activeIds = [...activeIds, ...getActiveAncestorIds(item.children, pathname)];
      }
    }
  }
  
  return activeIds;
};

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
  onOpenSupport,
}) => {
  const { role } = useAuth();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  
  const activeRole = role as Role;
  const roleAccent = ROLE_ACCENTS[activeRole] || ROLE_ACCENTS[Role.EMPLOYEE];
  const isDark = theme === 'dark';

  const [menuSearchQuery, setMenuSearchQuery] = useState('');

  // Load expanded items from localStorage
  const [expandedItems, setExpandedItems] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('stackly.sidebar.expanded');
      if (saved) {
        return new Set(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to parse sidebar expanded state', e);
    }
    return new Set();
  });

  // Get navigation tree filtered by role and search query
  const roleNavigation = useMemo(() => {
    return getNavigationForRole(activeRole);
  }, [activeRole]);

  const displayNavigation = useMemo(() => {
    return filterNavigationByQuery(roleNavigation, menuSearchQuery);
  }, [roleNavigation, menuSearchQuery]);

  // Save expanded items to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('stackly.sidebar.expanded', JSON.stringify(Array.from(expandedItems)));
  }, [expandedItems]);

  // Auto-expand ancestors of active route on mount/location change
  useEffect(() => {
    const activeAncestors = getActiveAncestorIds(roleNavigation, location.pathname);
    if (activeAncestors.length > 0) {
      setExpandedItems(prev => {
        const next = new Set(prev);
        let changed = false;
        activeAncestors.forEach(id => {
          if (!next.has(id)) {
            next.add(id);
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }
  }, [location.pathname, roleNavigation]);

  const toggleItem = (id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const hasAccess = (item: NavigationItem): boolean => {
    if (!item.roles || item.roles.includes(activeRole)) return true;
    return false;
  };

  return (
    <>
      {/* Mobile Off-Canvas Drawer Overlay Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          aria-label="Close Off-Canvas Drawer"
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-30 md:hidden transition-opacity"
        />
      )}

      {/* Role-aware workspace navigation */}
      <aside
        aria-label="Primary navigation"
        className={`app-sidebar ${roleAccent.className} border-r flex flex-col shrink-0 fixed md:sticky left-0 z-30 transition-all duration-300 ease-in-out font-sans ${
          collapsed ? 'sidebar-is-collapsed w-[76px]' : 'sidebar-is-expanded w-[280px]'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Quick Search Filter when Expanded */}
        {!collapsed && (
          <div className="px-3 pt-3 pb-1 border-b border-slate-100 dark:border-slate-800/60">
            <div className="relative flex items-center">
              <Search className="absolute left-2.5 text-slate-400 pointer-events-none" size={14} />
              <input
                type="text"
                value={menuSearchQuery}
                onChange={(e) => setMenuSearchQuery(e.target.value)}
                placeholder="Filter menu..."
                className={`w-full text-xs pl-8 pr-7 py-1.5 rounded-md outline-none transition-colors border ${
                  isDark
                    ? 'bg-slate-900 border-slate-800 text-slate-200 placeholder-slate-500 focus:border-emerald-500'
                    : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-emerald-600 focus:bg-white'
                }`}
              />
              {menuSearchQuery && (
                <button
                  type="button"
                  onClick={() => setMenuSearchQuery('')}
                  className="absolute right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Sidebar Navigation Items List */}
        <nav className="sidebar-nav sidebar-nav-scroll flex-1 overflow-y-auto w-full scrollbar-thin pt-2 flex flex-col gap-1">
          {displayNavigation.map(item => (
            <SidebarNavItem
              key={item.id}
              item={item}
              depth={0}
              collapsed={collapsed}
              expandedItems={expandedItems}
              toggleItem={toggleItem}
              setMobileOpen={setMobileOpen}
              pathname={location.pathname}
              isDark={isDark}
              hasAccess={hasAccess}
            />
          ))}
          {displayNavigation.length === 0 && !collapsed && (
            <div className="px-4 py-6 text-center text-xs text-slate-400 dark:text-slate-500">
              No menu items match "{menuSearchQuery}"
            </div>
          )}
        </nav>

        <div className={`sidebar-footer ${collapsed ? 'is-collapsed' : ''}`}>
          <div className="sidebar-footer-actions">
            <button
              type="button"
              className="sidebar-footer-button"
              onClick={toggleTheme}
              title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
              {!collapsed && <span>{isDark ? 'Light theme' : 'Dark theme'}</span>}
            </button>
            {!collapsed && (
              <button
                type="button"
                className="sidebar-footer-button sidebar-footer-collapse"
                onClick={() => setCollapsed(true)}
              >
                <PanelLeftClose size={16} />
                <span>Collapse menu</span>
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../../auth/hooks/useAuth';
import { useTheme } from '../../../design-system/theme/theme';
import { ROLE_LABELS, Role } from '../../../security/roles/roles';
import { PanelLeftClose, Sun, Moon } from 'lucide-react';
import { MAIN_NAVIGATION, NavigationItem } from './SidebarConfig';
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

  // Save expanded items to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('stackly.sidebar.expanded', JSON.stringify(Array.from(expandedItems)));
  }, [expandedItems]);

  // Auto-expand ancestors of active route on mount/location change
  useEffect(() => {
    const activeAncestors = getActiveAncestorIds(MAIN_NAVIGATION, location.pathname);
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
  }, [location.pathname]);

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
        className={`app-sidebar ${roleAccent.className} border-r flex flex-col shrink-0 fixed md:relative left-0 top-0 md:top-auto h-[100dvh] md:h-full z-30 transition-all duration-300 ease-in-out font-sans ${
          collapsed ? 'sidebar-is-collapsed w-[76px]' : 'sidebar-is-expanded w-[280px]'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Sidebar Navigation Items List */}
        <nav className="sidebar-nav sidebar-nav-scroll flex-1 overflow-y-auto w-full scrollbar-thin pt-4 flex flex-col gap-1">
          {MAIN_NAVIGATION.map(item => (
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

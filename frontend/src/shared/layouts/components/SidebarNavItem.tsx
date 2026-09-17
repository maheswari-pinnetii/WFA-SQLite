import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { NavigationItem } from './SidebarConfig';

interface SidebarNavItemProps {
  item: NavigationItem;
  depth: number;
  collapsed: boolean;
  expandedItems: Set<string>;
  toggleItem: (id: string) => void;
  setMobileOpen: (open: boolean) => void;
  pathname: string;
  isDark: boolean;
  hasAccess: (item: NavigationItem) => boolean;
}

export const isRouteActive = (item: NavigationItem, pathname: string): boolean => {
  if (!item.path) return false;
  if (item.path === '/dashboard' && pathname === '/dashboard') return true;
  if (item.path === pathname) return true;
  if (item.path !== '/' && pathname.startsWith(item.path + '/')) return true;
  return false;
};

export const hasActiveDescendant = (item: NavigationItem, pathname: string): boolean => {
  if (!item.children) return false;
  return item.children.some(child => 
    isRouteActive(child, pathname) || hasActiveDescendant(child, pathname)
  );
};

export const SidebarNavItem: React.FC<SidebarNavItemProps> = ({
  item,
  depth,
  collapsed,
  expandedItems,
  toggleItem,
  setMobileOpen,
  pathname,
  isDark,
  hasAccess
}) => {
  if (!hasAccess(item)) return null;

  const isExpanded = expandedItems.has(item.id);
  const isActive = isRouteActive(item, pathname);
  const isDescendantActive = hasActiveDescendant(item, pathname);

  const getBadgeStyle = (variant: string) => {
    return isDark 
      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
      : 'bg-emerald-50 text-emerald-600 border-emerald-200';
  };

  const handleToggle = (e: React.MouseEvent) => {
    if (item.children && item.children.length > 0) {
      e.preventDefault();
      toggleItem(item.id);
    } else {
      setMobileOpen(false);
    }
  };

  const accessibleChildren = item.children ? item.children.filter(child => hasAccess(child)) : [];
  const hasChildren = accessibleChildren.length > 0;
  const paddingLeft = collapsed ? 'justify-center' : (depth > 0 ? `${depth * 1.5 + 1}rem` : '1rem');

  // If this item has no path, and no accessible children, we should hide it unless it's a leaf that just doesn't have a path
  if (!item.path && !hasChildren) return null;

  return (
    <>
      <Link
        to={item.path || '#'}
        onClick={handleToggle}
        title={collapsed ? item.label : undefined}
        aria-current={isActive ? 'page' : undefined}
        aria-expanded={hasChildren ? isExpanded : undefined}
        className={`sidebar-nav-link flex items-center gap-3 transition-all duration-200 group relative no-underline text-inherit py-2
          ${(isActive || isDescendantActive) ? 'is-active' : ''} 
          ${collapsed ? 'is-collapsed justify-center' : ''}`}
        style={{ paddingLeft: collapsed ? undefined : paddingLeft }}
      >
        {item.icon && (
          <span className="sidebar-icon-shell shrink-0">
            {item.icon}
          </span>
        )}

        {/* If depth > 0 and no icon, add a small dot or space */}
        {!item.icon && !collapsed && (
          <span className="w-4 flex justify-center shrink-0">
            <span className={`w-1.5 h-1.5 rounded-full ${(isActive || isDescendantActive) ? 'bg-current' : 'bg-slate-400 dark:bg-slate-600 group-hover:bg-current transition-colors'}`} />
          </span>
        )}

        {!collapsed && (
          <>
            <span className={`sidebar-link-label text-[13px] truncate flex-1 min-w-0 ${isActive ? 'font-semibold' : 'font-medium'}`}>
              {item.label}
            </span>
            {hasChildren && (
              isExpanded ? (
                <ChevronDown size={14} className="sidebar-link-arrow shrink-0 transition-transform" />
              ) : (
                <ChevronRight size={14} className="sidebar-link-arrow shrink-0 transition-transform" />
              )
            )}
          </>
        )}

        {!collapsed && item.badge && !hasChildren && (
          <span className={`sidebar-badge px-1.5 py-0.5 text-xs font-medium rounded border ml-auto shrink-0 ${getBadgeStyle(item.badge.variant)}`}>
            {item.badge.text}
          </span>
        )}

        {collapsed && (
          <span className="sidebar-tooltip">
            {item.label}
            {item.badge && (
              <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${getBadgeStyle(item.badge.variant)}`}>
                {item.badge.text}
              </span>
            )}
          </span>
        )}
      </Link>

      {hasChildren && isExpanded && !collapsed && (
        <div className="flex flex-col">
          {accessibleChildren.map(child => (
            <SidebarNavItem
              key={child.id}
              item={child}
              depth={depth + 1}
              collapsed={collapsed}
              expandedItems={expandedItems}
              toggleItem={toggleItem}
              setMobileOpen={setMobileOpen}
              pathname={pathname}
              isDark={isDark}
              hasAccess={hasAccess}
            />
          ))}
        </div>
      )}
    </>
  );
};

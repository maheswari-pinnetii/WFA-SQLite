import { Role } from '../../features/auth/security/roles/roles';
import { Permission } from '../../features/auth/security/permissions/permissions';

export interface MenuItemConfig {
  id: string;
  title: string;
  icon: string;
  path?: string;
  roles?: Role[];
  permissions?: Permission[];
  departmentScope?: string[];
  badge?: {
    text: string;
    variant: 'emerald' | 'purple' | 'amber' | 'emerald' | 'rose';
  };
  children?: MenuItemConfig[];
}

export interface MenuGroupConfig {
  groupTitle: string;
  items: MenuItemConfig[];
}

export interface SidebarState {
  collapsed: boolean;
  mobileOpen: boolean;
  filterQuery: string;
  activeMenuId: string | null;
}

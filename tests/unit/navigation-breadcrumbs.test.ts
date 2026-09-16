import { describe, it, expect } from 'vitest';
import { 
  getNavigationForRole, 
  filterNavigationByQuery, 
  hasRoleAccess,
  MAIN_NAVIGATION 
} from '../../frontend/src/shared/layouts/components/SidebarConfig';
import { Role } from '../../frontend/src/security/roles/roles';

describe('Sidebar Navigation Config & Role Filtering', () => {
  it('returns all items for ADMIN role', () => {
    const nav = getNavigationForRole(Role.ADMIN);
    expect(nav.length).toBeGreaterThan(0);
    const adminOnly = nav.find(item => item.id === 'administration');
    expect(adminOnly).toBeDefined();
  });

  it('filters out ADMIN-only navigation items for EMPLOYEE role', () => {
    const nav = getNavigationForRole(Role.EMPLOYEE);
    const adminOnly = nav.find(item => item.id === 'administration');
    expect(adminOnly).toBeUndefined();
  });

  it('filters navigation items by search query', () => {
    const nav = getNavigationForRole(Role.ADMIN);
    const filtered = filterNavigationByQuery(nav, 'Attendance');
    expect(filtered.length).toBeGreaterThan(0);
    const matches = filtered.some(item => 
      item.label.toLowerCase().includes('attendance') ||
      (item.children && item.children.some(c => c.label.toLowerCase().includes('attendance')))
    );
    expect(matches).toBe(true);
  });

  it('correctly handles empty search query', () => {
    const nav = getNavigationForRole(Role.ADMIN);
    const filtered = filterNavigationByQuery(nav, '   ');
    expect(filtered.length).toBe(nav.length);
  });
});

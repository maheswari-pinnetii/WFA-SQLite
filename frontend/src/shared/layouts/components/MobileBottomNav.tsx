import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Clock, Calendar, BarChart3, Menu } from 'lucide-react';
import { useAuth } from '../../../auth/hooks/useAuth';
import { ROLE_HOME_PATHS } from '../../../security/roles/roles';

export const MobileBottomNav: React.FC<{ onOpenMobileMenu: () => void }> = ({ onOpenMobileMenu }) => {
  const { role } = useAuth();
  const location = useLocation();
  const homePath = ROLE_HOME_PATHS[role as Role] || '/employee/dashboard';

  const getAttendancePath = () => {
    switch (role as Role) {
      case Role.ADMIN: return '/admin/attendance-overview';
      case Role.HR: return '/hr/attendance';
      case Role.MANAGER: return '/manager/attendance';
      case Role.TEAM_LEAD: return '/team-lead/attendance';
      default: return '/employee/attendance';
    }
  };

  const getLeavesPath = () => {
    switch (role as Role) {
      case Role.ADMIN: return '/admin/leaves';
      case Role.HR: return '/hr/leaves';
      case Role.MANAGER: return '/manager/leaves';
      case Role.TEAM_LEAD: return '/leave/team';
      default: return '/employee/leave/overview';
    }
  };

  const getAnalyticsPath = () => {
    switch (role as Role) {
      case Role.ADMIN: return '/admin/productivity';
      case Role.HR: return '/hr/productivity';
      case Role.MANAGER: return '/manager/productivity';
      case Role.TEAM_LEAD: return '/team-lead/productivity';
      default: return '/employee/performance';
    }
  };

  const navItems = [
    { label: 'Dashboard', path: homePath, icon: <LayoutDashboard size={20} /> },
    { label: 'Attendance', path: getAttendancePath(), icon: <Clock size={20} /> },
    { label: 'Leaves', path: getLeavesPath(), icon: <Calendar size={20} /> },
    { label: 'Analytics', path: getAnalyticsPath(), icon: <BarChart3 size={20} /> },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-950/95 border-t border-slate-800 backdrop-blur-xl px-2 py-1.5 flex items-center justify-around text-[10px] font-bold shadow-2xl safe-area-bottom"
    >
      {navItems.map((item) => {
        const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
              isActive
                ? 'text-emerald-400 bg-emerald-500/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        );
      })}

      <button
        onClick={onOpenMobileMenu}
        className="flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
      >
        <Menu size={20} />
        <span>Menu</span>
      </button>
    </nav>
  );
};

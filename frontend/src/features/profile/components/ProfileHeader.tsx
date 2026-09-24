import React from 'react';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import { getRoleBadgeClass } from '../../../shared/utils/helpers';
import { LogOut as LogOutIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProfileHeaderProps {
  title?: string;
  subtitle?: string;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ 
  title = "User Profile", 
  subtitle = "Manage your credentials, settings, and documents" 
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/logout');
  };

  return (
    <>
      {/* Header Banner */}
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">{title}</h2>
        <p className="text-xs text-slate-400">{subtitle}</p>
      </div>

      {/* Profile Info Header */}
      <div className="flex flex-col sm:flex-row items-center gap-6 border-b border-[var(--border-color)] pb-6">
        <img
          src={user?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'}
          alt={user?.name}
          className="w-24 h-24 rounded-full object-cover border-4 border-emerald-500 shadow-xl shrink-0"
        />
        <div className="text-center sm:text-left space-y-1 flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h3 className="text-xl font-extrabold text-[var(--text-primary)]">{user?.name || 'User'}</h3>
            <span className={`badge ${getRoleBadgeClass(user?.role as any)} self-center sm:self-auto`}>
              {user?.role}
            </span>
          </div>
          <p className="text-xs font-semibold text-emerald-500">{user?.title || 'Team Member'}</p>
          <p className="text-xs text-slate-400 font-medium">{user?.department || 'Organization'}</p>
        </div>

        <div className="text-center sm:text-right flex flex-col items-center sm:items-end gap-2 shrink-0">
          <span className="text-[11px] font-mono font-bold px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
            ID: {user?.id || 'ID-UNKNOWN'}
          </span>
          <button
            onClick={handleLogout}
            className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOutIcon size={13} /> Log Out
          </button>
        </div>
      </div>
    </>
  );
};

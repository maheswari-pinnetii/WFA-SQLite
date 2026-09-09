import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import { ROLE_HOME_PATHS, Role } from '../roles/roles';

interface GuestGuardProps {
  children: React.ReactNode;
}

export const GuestGuard: React.FC<GuestGuardProps> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] text-[var(--text-muted)] text-sm">Loading...</div>;
  }

  // If the user is already authenticated, redirect them away from guest-only pages
  if (isAuthenticated && user?.role) {
    // If they were trying to go somewhere, location.state?.from could have it, 
    // but typically guest pages don't have this. We redirect to their role's dashboard.
    const target = ROLE_HOME_PATHS[user.role as Role] || '/employee/dashboard';
    return <Navigate to={target} replace />;
  }

  // Allow them to see the guest page (like Login, Signup)
  return <>{children}</>;
};

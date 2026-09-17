import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import { ROLE_HOME_PATHS, Role } from '../roles/roles';

interface GuestGuardProps {
  children: React.ReactNode;
}

const loadingStyle: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'var(--bg-primary, #0F172A)',
  color: 'var(--text-muted, #94A3B8)',
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: '14px',
};

export const GuestGuard: React.FC<GuestGuardProps> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  // location is not used here but kept for future use
  const _location = useLocation();

  if (isLoading) {
    return <div style={loadingStyle}>Loading…</div>;
  }

  // If the user is already authenticated, redirect them away from guest-only pages
  if (isAuthenticated && user?.role) {
    const target = ROLE_HOME_PATHS[user.role as Role] || '/employee/dashboard';
    return <Navigate to={target} replace />;
  }

  // Allow them to see the guest page (like Login, Signup)
  return <>{children}</>;
};

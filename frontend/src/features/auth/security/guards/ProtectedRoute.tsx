import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const loadingStyle: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '12px',
  backgroundColor: 'var(--bg-primary, #0F172A)',
  color: 'var(--text-muted, #94A3B8)',
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: '14px',
};

const spinnerStyle: React.CSSProperties = {
  width: '32px',
  height: '32px',
  border: '4px solid rgba(16, 185, 129, 0.2)',
  borderTopColor: '#10B981',
  borderRadius: '50%',
  animation: 'spin 0.8s linear infinite',
};

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={loadingStyle}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={spinnerStyle} />
        <span>Restoring secure session…</span>
      </div>
    );
  }

  if (!isAuthenticated || !user || !user.role) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

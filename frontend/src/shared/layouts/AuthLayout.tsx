import React from 'react';

export const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="auth-layout-root min-h-screen w-full flex items-center justify-center bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
      {children}
    </div>
  );
};

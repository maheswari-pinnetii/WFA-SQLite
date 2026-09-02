import React from 'react';
import './Auth.css';

interface AuthLayoutProps {
  children: React.ReactNode;
  selectedRole?: any;
  isWide?: boolean;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, isWide = false }) => {
  return (
    <div className="auth-page min-h-screen bg-[#0d0e12] py-8 px-4 flex flex-col items-center justify-center">
      <div className={`w-full ${isWide ? 'max-w-5xl' : 'max-w-md'}`}>
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;

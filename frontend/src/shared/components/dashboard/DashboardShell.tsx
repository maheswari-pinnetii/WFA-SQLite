import React from 'react';

interface DashboardShellProps {
  children: React.ReactNode;
}

export const DashboardShell: React.FC<DashboardShellProps> = ({ children }) => {
  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-5 lg:px-6 py-6 pb-12 font-sans animate-fadeIn">
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
};

import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({ children, className = '' }) => {
  return (
    <div className={`w-full max-w-7xl mx-auto p-4 sm:p-5 md:p-6 space-y-6 min-h-[calc(100vh-4rem)] text-slate-900 dark:text-slate-100 ${className}`}>
      {children}
    </div>
  );
};

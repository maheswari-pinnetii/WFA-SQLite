import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({ children, className = '' }) => {
  return (
    <div className={`w-full max-w-[1440px] mx-auto px-4 py-4 sm:px-5 sm:py-5 md:px-8 md:py-8 space-y-6 min-h-[calc(100vh-4rem)] text-slate-900 dark:text-slate-100 ${className}`}>
      {children}
    </div>
  );
};

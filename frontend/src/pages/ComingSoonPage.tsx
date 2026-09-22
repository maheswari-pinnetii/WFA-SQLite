import React from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { PageHeader } from '../components/layout/PageHeader';
import { Construction } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export const ComingSoonPage: React.FC = () => {
  const location = useLocation();
  const pathName = location.pathname.split('/').pop()?.replace(/-/g, ' ') || 'This page';
  const formattedTitle = pathName.charAt(0).toUpperCase() + pathName.slice(1);

  return (
    <PageContainer>
      <PageHeader
        title={formattedTitle}
        description="This module is currently under development."
      />
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-full mb-6">
          <Construction size={48} className="text-slate-400 dark:text-slate-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
          Coming Soon
        </h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-md">
          We're working hard to bring you the <b>{formattedTitle}</b> features. 
          Please check back later!
        </p>
      </div>
    </PageContainer>
  );
};

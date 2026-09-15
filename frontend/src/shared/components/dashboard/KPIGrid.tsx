import React from 'react';

interface KPIGridProps {
  children: React.ReactNode;
}

export const KPIGrid: React.FC<KPIGridProps> = ({ children }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 min-w-0">
      {children}
    </div>
  );
};

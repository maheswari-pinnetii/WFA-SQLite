import React, { useState } from 'react';
import { Info, X } from 'lucide-react';

export const InformationBar: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-emerald-600 text-white px-4 py-2 flex items-center justify-between text-sm font-medium shadow-sm">
      <div className="flex items-center gap-2">
        <Info size={16} className="shrink-0" />
        <span>Welcome to the Stackly Workforce Analytics Platform. Ensure all tasks and sprints are up-to-date.</span>
      </div>
      <button 
        onClick={() => setIsVisible(false)} 
        className="text-emerald-100 hover:text-white transition-colors"
        aria-label="Dismiss information bar"
      >
        <X size={16} />
      </button>
    </div>
  );
};

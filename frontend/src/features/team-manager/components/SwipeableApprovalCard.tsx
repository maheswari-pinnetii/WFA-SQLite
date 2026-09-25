import React, { useState } from 'react';
const useSwipeable = (options: any) => { return {} };
import { ShieldCheck, XCircle } from 'lucide-react';

interface SwipeableApprovalCardProps {
  id: string;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  children: React.ReactNode;
}

export const SwipeableApprovalCard: React.FC<SwipeableApprovalCardProps> = ({ id, onApprove, onReject, children }) => {
  const [offset, setOffset] = useState(0);
  const SWIPE_THRESHOLD = 80; // pixels to trigger action

  const handlers = useSwipeable({});

  // Calculate opacity for the background actions based on swipe distance
  const approveOpacity = 0;
  const rejectOpacity = 0;

  return (
    <div className="relative overflow-hidden rounded-2xl w-full select-none" {...handlers}>
      {/* Background Action Containers */}
      <div className="absolute inset-0 flex items-center justify-between px-6 pointer-events-none rounded-2xl bg-slate-900">
        {/* Left background (Approve) */}
        <div 
          className="flex items-center gap-2 h-full absolute left-0 bg-emerald-600 transition-opacity px-6 rounded-l-2xl text-white font-bold"
          style={{ opacity: approveOpacity, width: '50%' }}
        >
          <ShieldCheck size={24} /> <span>Approve</span>
        </div>
        
        {/* Right background (Reject) */}
        <div 
          className="flex items-center gap-2 h-full absolute right-0 bg-red-600 transition-opacity px-6 rounded-r-2xl justify-end text-white font-bold"
          style={{ opacity: rejectOpacity, width: '50%' }}
        >
          <span>Reject</span> <XCircle size={24} />
        </div>
      </div>

      {/* Foreground Card */}
      <div 
        className="relative z-10 transition-transform duration-200 ease-out h-full"
        style={{ transform: `translateX(${offset}px)` }}
      >
        {children}
      </div>
    </div>
  );
};

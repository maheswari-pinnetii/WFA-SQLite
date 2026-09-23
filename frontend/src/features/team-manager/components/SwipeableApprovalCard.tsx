import React, { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
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

  const handlers = useSwipeable({
    onSwiping: (eventData) => {
      // Limit offset to max 120px in either direction
      const newOffset = eventData.deltaX * -1;
      if (Math.abs(newOffset) <= 120) {
        setOffset(newOffset);
      }
    },
    onSwiped: (eventData) => {
      const finalOffset = eventData.deltaX * -1;
      setOffset(0); // Snap back visually

      if (finalOffset > SWIPE_THRESHOLD) {
        // Swiped Right -> Approve
        if (navigator.vibrate) navigator.vibrate(50);
        onApprove(id);
      } else if (finalOffset < -SWIPE_THRESHOLD) {
        // Swiped Left -> Reject
        if (navigator.vibrate) navigator.vibrate([30, 50, 30]);
        onReject(id);
      }
    },
    trackMouse: true // Allow mouse dragging for desktop testing
  });

  // Calculate opacity for the background actions based on swipe distance
  const approveOpacity = Math.min(1, Math.max(0, offset / SWIPE_THRESHOLD));
  const rejectOpacity = Math.min(1, Math.max(0, -offset / SWIPE_THRESHOLD));

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

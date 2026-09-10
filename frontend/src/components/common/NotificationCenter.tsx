import React, { useEffect, useState, useRef } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../app/store';
import { fetchNotifications, markAsRead, markAllAsRead, addNotification } from '../../store/notificationSlice';
import { useRealtimeNotifications } from '../../hooks/useRealtimeNotifications';
import { useNavigate } from 'react-router-dom';

export const NotificationCenter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewPulse, setHasNewPulse] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { notifications, unreadCount, status } = useSelector((state: RootState) => state.notifications);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchNotifications());
    }
  }, [status, dispatch]);

  useRealtimeNotifications((newNotif: any) => {
    dispatch(addNotification({
      id: newNotif.id || `notif-${Date.now()}`,
      title: newNotif.title || 'Notification',
      message: newNotif.message || '',
      type: newNotif.type || 'SYSTEM',
      read: false,
      createdAt: new Date().toISOString()
    }));
    setHasNewPulse(true);
  });

  useEffect(() => {
    if (isOpen) {
      setHasNewPulse(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (id: string, type: string) => {
    dispatch(markAsRead(id));
    setIsOpen(false);
    
    // Navigate based on type
    switch (type) {
      case 'LEAVE':
      case 'ATTENDANCE':
        navigate('/employee/absence');
        break;
      case 'APPROVAL':
        navigate('/employee/approvals');
        break;
      case 'PAYROLL':
        navigate('/employee/payroll');
        break;
      default:
        break;
    }
  };

  const timeAgo = (dateStr: string) => {
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    const daysDifference = Math.round((new Date(dateStr).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (daysDifference === 0) {
      const hrs = Math.round((new Date(dateStr).getTime() - new Date().getTime()) / (1000 * 60 * 60));
      if (hrs === 0) {
        const mins = Math.round((new Date(dateStr).getTime() - new Date().getTime()) / (1000 * 60));
        return rtf.format(mins, 'minute');
      }
      return rtf.format(hrs, 'hour');
    }
    return rtf.format(daysDifference, 'day');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`View Notifications (${unreadCount} unread)`}
        className={`p-2 rounded-lg border transition-all relative cursor-pointer
          bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200
          dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800
          ${hasNewPulse ? 'ring-2 ring-rose-500/40 text-rose-500' : ''}`}
        title={hasNewPulse ? "New notification received!" : "Notifications & System Alerts"}
      >
        <Bell size={18} className={hasNewPulse ? "text-rose-500" : ""} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[15px] h-[15px] px-[3px] bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center shadow-sm">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-0 shadow-xl z-50 rounded-lg text-sm text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
          <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            <span className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Notifications
              {unreadCount > 0 && (
                <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 py-0.5 px-2 rounded-full text-[10px]">
                  {unreadCount} new
                </span>
              )}
            </span>
            {unreadCount > 0 && (
              <button
                onClick={() => dispatch(markAllAsRead())}
                className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-medium cursor-pointer flex items-center gap-1"
              >
                <Check size={12} /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto p-2 space-y-1">
            {notifications.length === 0 ? (
              <div className="py-6 text-center text-slate-500 dark:text-slate-400 text-xs">
                No notifications to display.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n.id, n.type)}
                  className={`p-3 rounded-md border transition-all cursor-pointer flex flex-col gap-1 ${
                    n.read
                      ? 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-800'
                      : 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/30 text-slate-900 dark:text-slate-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-xs ${!n.read ? 'font-semibold text-slate-900 dark:text-white' : 'font-medium text-slate-700 dark:text-slate-200'}`}>
                      {n.title}
                    </p>
                    {!n.read && <span className="w-2 h-2 bg-emerald-500 rounded-full shrink-0 mt-1" />}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {n.message}
                  </p>
                  <span className="text-[10px] font-medium text-slate-400 mt-1">
                    {timeAgo(n.createdAt)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

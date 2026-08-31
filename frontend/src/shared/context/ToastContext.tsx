import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
  id?: string;
  title?: string;
  message: string;
  type?: ToastType;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextValue {
  showToast: (options: ToastOptions | string) => string;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastOptions[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((options: ToastOptions | string): string => {
    const toastObj: ToastOptions = typeof options === 'string'
      ? { id: `toast-${Date.now()}-${Math.random()}`, message: options, type: 'info' }
      : {
          id: options.id || `toast-${Date.now()}-${Math.random()}`,
          type: options.type || 'info',
          duration: options.duration ?? 4500,
          ...options
        };

    setToasts((prev) => [...prev, toastObj]);

    if (toastObj.duration && toastObj.duration > 0) {
      setTimeout(() => {
        dismissToast(toastObj.id!);
      }, toastObj.duration);
    }

    return toastObj.id!;
  }, [dismissToast]);

  const getIcon = (type?: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-sky-400 shrink-0" />;
    }
  };

  const getBorderColor = (type?: ToastType) => {
    switch (type) {
      case 'success':
        return 'border-emerald-500/30 bg-emerald-950/80 text-emerald-100';
      case 'error':
        return 'border-rose-500/30 bg-rose-950/80 text-rose-100';
      case 'warning':
        return 'border-amber-500/30 bg-amber-950/80 text-amber-100';
      case 'info':
      default:
        return 'border-sky-500/30 bg-sky-950/80 text-sky-100';
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      {/* Toast Notification Container */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl shadow-2xl transition-all duration-300 transform translate-y-0 opacity-100 ${getBorderColor(toast.type)}`}
          >
            {getIcon(toast.type)}
            <div className="flex-1 min-w-0">
              {toast.title && (
                <h4 className="text-xs font-bold leading-tight mb-0.5">{toast.title}</h4>
              )}
              <p className="text-xs font-medium opacity-90 leading-relaxed break-words">
                {toast.message}
              </p>
              {toast.action && (
                <button
                  onClick={() => {
                    toast.action?.onClick();
                    dismissToast(toast.id!);
                  }}
                  className="mt-2 text-xs font-bold underline hover:opacity-80 transition-opacity"
                >
                  {toast.action.label}
                </button>
              )}
            </div>
            <button
              onClick={() => dismissToast(toast.id!)}
              className="p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

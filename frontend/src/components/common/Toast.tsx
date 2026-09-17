import React from 'react';
import { X, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';
import { ToastMessage } from './ToastContext';

interface ToastProps {
  toast: ToastMessage;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  const getIcon = () => {
    switch (toast.type) {
      case 'success': return <CheckCircle className="text-emerald-500" size={20} />;
      case 'error': return <XCircle className="text-rose-500" size={20} />;
      case 'warning': return <AlertTriangle className="text-amber-500" size={20} />;
      case 'info': return <Info className="text-blue-500" size={20} />;
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case 'success': return 'border-emerald-500/20';
      case 'error': return 'border-rose-500/20';
      case 'warning': return 'border-amber-500/20';
      case 'info': return 'border-blue-500/20';
    }
  };

  return (
    <div className={`pointer-events-auto flex items-start gap-3 p-4 bg-[#1a1d27] border ${getBorderColor()} rounded-xl shadow-lg shadow-black/50 animate-slideUp`}>
      <div className="shrink-0 mt-0.5">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-white">{toast.title}</h4>
        {toast.message && <p className="text-xs text-slate-400 mt-1">{toast.message}</p>}
      </div>
      <button 
        onClick={onClose}
        className="shrink-0 text-slate-500 hover:text-slate-300 transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
};

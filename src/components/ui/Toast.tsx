
import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  id?: string;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose, id }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: 'bg-emerald-900 border-emerald-700 text-emerald-100 shadow-emerald-950/20',
    error: 'bg-rose-950 border-rose-800 text-rose-100 shadow-rose-950/20',
    info: 'bg-brand-blue-deep border-brand-blue-medium text-brand-blue-light shadow-brand-blue-deep/20'
  };

  const icons = {
    success: <CheckCircle2 className="text-emerald-400 shrink-0" size={18} />,
    error: <AlertCircle className="text-rose-400 shrink-0" size={18} />,
    info: <Info className="text-brand-blue-light shrink-0" size={18} />
  };

  return (
    <div
      id={id}
      className={`flex items-center gap-3 px-5 py-3 rounded-xl border shadow-lg max-w-sm w-full transition-all duration-300 animate-slide-in pointer-events-auto shrink-0 ${styles[type]}`}
    >
      {icons[type]}
      <p className="font-sans font-medium text-xs flex-1 leading-snug">{message}</p>
      <button
        onClick={onClose}
        className="opacity-70 hover:opacity-100 transition-opacity p-0.5 rounded cursor-pointer"
      >
        <X size={14} />
      </button>
    </div>
  );
};

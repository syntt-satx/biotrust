import React from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let bgClass = 'bg-[#2C5E3B] text-white';
        let Icon = CheckCircle2;

        if (toast.type === 'warning') {
          bgClass = 'bg-[#E65F2B] text-white';
          Icon = AlertTriangle;
        } else if (toast.type === 'error') {
          bgClass = 'bg-[#1C1B18] text-white';
          Icon = AlertTriangle;
        } else if (toast.type === 'info') {
          bgClass = 'bg-[#F9F6F0] text-[#1C1B18]';
          Icon = Info;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 border-2 border-[#1C1B18] shadow-[4px_4px_0px_#1C1B18] ${bgClass} transition-all duration-200 animate-in fade-in slide-in-from-bottom-3`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold font-mono text-xs uppercase tracking-wider">{toast.title}</h5>
                  <p className="text-xs mt-0.5 leading-snug">{toast.message}</p>
                </div>
              </div>
              <button
                onClick={() => onDismiss(toast.id)}
                className="opacity-70 hover:opacity-100 p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

import React from 'react';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';
import { audio } from '../../services/audioService';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message?: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  const typeConfig = {
    success: {
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
      border: 'border-emerald-500/40 bg-emerald-950/80 shadow-emerald-950/50',
      titleColor: 'text-emerald-300'
    },
    warning: {
      icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
      border: 'border-amber-500/40 bg-amber-950/80 shadow-amber-950/50',
      titleColor: 'text-amber-300'
    },
    error: {
      icon: <XCircle className="w-5 h-5 text-rose-400" />,
      border: 'border-rose-500/40 bg-rose-950/80 shadow-rose-950/50',
      titleColor: 'text-rose-300'
    },
    info: {
      icon: <Info className="w-5 h-5 text-sc-cyan" />,
      border: 'border-sc-cyan/40 bg-slate-900/90 shadow-cyan-950/50',
      titleColor: 'text-sc-cyan'
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => {
        const config = typeConfig[toast.type];

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl border backdrop-blur-xl shadow-2xl flex items-start gap-3 transition-all duration-300 animate-in slide-in-from-right-8 fade-in ${config.border}`}
          >
            <div className="shrink-0 mt-0.5">{config.icon}</div>
            <div className="flex-1 min-w-0">
              <h5 className={`text-sm font-bold font-sans tracking-wide ${config.titleColor}`}>
                {toast.title}
              </h5>
              {toast.message && (
                <p className="text-xs text-slate-300 mt-0.5 font-sans leading-relaxed">
                  {toast.message}
                </p>
              )}
            </div>
            <button
              onClick={() => {
                audio.playClick();
                onDismiss(toast.id);
              }}
              className="text-slate-400 hover:text-slate-100 p-1 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

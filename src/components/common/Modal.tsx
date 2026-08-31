import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { audio } from '../../services/audioService';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  maxWidth = '2xl'
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        audio.playClick();
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={() => {
          audio.playClick();
          onClose();
        }}
      />

      {/* Modal Dialog Window */}
      <div
        className={`relative w-full ${maxWidthClasses[maxWidth]} bg-sc-panel border border-sc-border rounded-xl shadow-2xl shadow-cyan-950/40 text-slate-100 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200 my-8`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Futuristic Top Glowing Accent Line */}
        <div className="h-1 w-full bg-gradient-to-r from-sc-cyan via-sc-gold to-sc-cyan/40" />

        {/* Header */}
        <div className="px-6 py-4 border-b border-sc-border/80 flex items-center justify-between bg-sc-card/50">
          <div className="flex items-center gap-3">
            {icon && <div className="p-2 rounded-lg bg-sc-cyan/10 border border-sc-cyan/30 text-sc-cyan">{icon}</div>}
            <div>
              <h3 className="text-lg font-bold font-sans tracking-wide text-slate-100 uppercase flex items-center gap-2">
                {title}
              </h3>
              {subtitle && <p className="text-xs font-mono text-slate-400 mt-0.5">{subtitle}</p>}
            </div>
          </div>

          <button
            onClick={() => {
              audio.playClick();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-700"
            title="Fermer (Échap)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-5 max-h-[calc(85vh-120px)] overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

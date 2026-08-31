import React from 'react';
import { Modal } from './Modal';
import { AlertTriangle } from 'lucide-react';
import { audio } from '../../services/audioService';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  variant = 'danger'
}) => {
  const confirmBtnStyles = {
    danger: 'bg-rose-600 hover:bg-rose-500 text-white border-rose-500 shadow-neon-red',
    warning: 'bg-amber-600 hover:bg-amber-500 text-white border-amber-500 shadow-neon-gold',
    primary: 'bg-sc-cyan hover:bg-cyan-400 text-slate-950 font-bold border-sc-cyan shadow-neon-cyan'
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="md"
      icon={<AlertTriangle className="w-5 h-5 text-rose-400" />}
    >
      <div className="space-y-4">
        <p className="text-sm text-slate-300 font-sans leading-relaxed">
          {message}
        </p>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={() => {
              audio.playClick();
              onClose();
            }}
            className="px-4 py-2 rounded-lg border border-slate-700 bg-slate-800/80 text-slate-300 hover:text-slate-100 hover:bg-slate-700 text-xs font-mono uppercase tracking-wider transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              audio.playSelect();
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 rounded-lg border text-xs font-mono uppercase tracking-wider transition-all duration-200 ${confirmBtnStyles[variant]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

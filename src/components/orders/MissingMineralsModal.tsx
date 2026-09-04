import React from 'react';
import { Modal } from '../common/Modal';
import { CustomerOrder, RefinedStockItem } from '../../types';
import { MissingMineralsListView } from '../common/MissingMineralsListView';
import { AlertTriangle } from 'lucide-react';
import { audio } from '../../services/audioService';

interface MissingMineralsModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: CustomerOrder[];
  stock: RefinedStockItem[];
  onQuickAddStock?: (mineralId: string, mineralName: string) => void;
  onSelectOrder?: (orderId: string) => void;
  onNavigateToTab?: (tab: string) => void;
}

export const MissingMineralsModal: React.FC<MissingMineralsModalProps> = ({
  isOpen,
  onClose,
  orders,
  stock,
  onQuickAddStock,
  onSelectOrder,
  onNavigateToTab
}) => {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Minerais Manquants des Commandes en Cours"
      subtitle="Bilan direct basé sur votre stock personnel face aux besoins des commandes actives"
      icon={<AlertTriangle className="w-5 h-5 text-rose-400" />}
      maxWidth="4xl"
    >
      <div className="space-y-4 py-1">
        <MissingMineralsListView
          orders={orders}
          stock={stock}
          onQuickAddStock={onQuickAddStock}
          onSelectOrder={(orderId) => {
            onClose();
            if (onSelectOrder) onSelectOrder(orderId);
          }}
          onNavigateToTab={(tab) => {
            onClose();
            if (onNavigateToTab) onNavigateToTab(tab);
          }}
        />

        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={() => {
              audio.playClick();
              onClose();
            }}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono uppercase tracking-wider transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </Modal>
  );
};

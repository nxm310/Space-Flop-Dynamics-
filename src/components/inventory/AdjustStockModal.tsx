import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { AutocompleteSelect, AutocompleteOption } from '../common/AutocompleteSelect';
import { RefinedStockItem } from '../../types';
import { STAR_CITIZEN_MINERALS } from '../../data/mineralsData';
import { Package, PlusCircle, MinusCircle } from 'lucide-react';
import { audio } from '../../services/audioService';

interface AdjustStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdjustStock: (item: Omit<RefinedStockItem, 'id' | 'lastUpdated'>, mode: 'add' | 'set' | 'deduct') => void;
  defaultMineralId?: string;
  defaultOwnerType?: 'personal' | 'client';
}

export const AdjustStockModal: React.FC<AdjustStockModalProps> = ({
  isOpen,
  onClose,
  onAdjustStock,
  defaultMineralId = 'quantainium',
  defaultOwnerType = 'personal'
}) => {
  const [mineralId, setMineralId] = useState(defaultMineralId);
  const [quantitySCU, setQuantitySCU] = useState<number>(10);
  const [mode, setMode] = useState<'add' | 'set' | 'deduct'>('add');
  const [ownerType, setOwnerType] = useState<'personal' | 'client'>(defaultOwnerType);
  const [clientName, setClientName] = useState('');
  const [notes, setNotes] = useState('');

  const mineralOptions: AutocompleteOption[] = STAR_CITIZEN_MINERALS.map(m => ({
    id: m.id,
    label: m.displayName,
    subLabel: `${m.group} • ~${m.basePriceAUEC} aUEC/cSCU (${m.basePriceAUEC * 100} aUEC/SCU)`,
    category: m.group,
    badge: m.isFpsMineable ? 'Gemme FPS' : m.group
  }));

  const selectedMineral = STAR_CITIZEN_MINERALS.find(m => m.id === mineralId) || STAR_CITIZEN_MINERALS[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantitySCU <= 0 && mode !== 'set') return;

    audio.playSuccess();
    onAdjustStock({
      mineralId: selectedMineral.id,
      mineralName: selectedMineral.name,
      quantitySCU: Number(quantitySCU),
      ownerType,
      clientName: ownerType === 'client' ? (clientName.trim() || 'Client Inconnu') : undefined,
      notes: notes.trim() || undefined
    }, mode);

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ajuster le Stock de Minerais Raffinés"
      subtitle="Ajoutez, déduisez ou définissez manuellement vos réserves de minerais"
      icon={<Package className="w-5 h-5 text-sc-cyan" />}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 font-sans">
        {/* Mineral Selector */}
        <AutocompleteSelect
          label="Minerai raffiné"
          required
          options={mineralOptions}
          value={mineralId}
          onChange={(val) => setMineralId(val)}
        />

        {/* Operation Mode */}
        <div>
          <label className="block text-xs font-mono tracking-wider uppercase text-slate-400 mb-1.5">
            Type d'opération
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                audio.playClick();
                setMode('add');
              }}
              className={`py-2 px-3 rounded-lg border text-xs font-mono uppercase flex items-center justify-center gap-1.5 transition-colors ${
                mode === 'add'
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                  : 'border-slate-800 bg-sc-panel text-slate-400 hover:text-slate-200'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Ajouter (+)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                audio.playClick();
                setMode('deduct');
              }}
              className={`py-2 px-3 rounded-lg border text-xs font-mono uppercase flex items-center justify-center gap-1.5 transition-colors ${
                mode === 'deduct'
                  ? 'bg-rose-500/20 border-rose-500 text-rose-300 font-bold'
                  : 'border-slate-800 bg-sc-panel text-slate-400 hover:text-slate-200'
              }`}
            >
              <MinusCircle className="w-3.5 h-3.5" />
              <span>Retirer (-)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                audio.playClick();
                setMode('set');
              }}
              className={`py-2 px-3 rounded-lg border text-xs font-mono uppercase flex items-center justify-center gap-1.5 transition-colors ${
                mode === 'set'
                  ? 'bg-sc-cyan/20 border-sc-cyan text-sc-cyan font-bold'
                  : 'border-slate-800 bg-sc-panel text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Définir (=)</span>
            </button>
          </div>
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-xs font-mono tracking-wider uppercase text-slate-400 mb-1.5">
            Quantité (SCU) *
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={quantitySCU}
              onChange={(e) => setQuantitySCU(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-sc-panel border border-sc-border focus:border-sc-cyan rounded-lg text-slate-100 font-mono text-sm focus:outline-none"
            />
            <span className="absolute right-3 top-2.5 text-xs font-mono text-slate-500">
              SCU ({Math.round(quantitySCU * 100)} cSCU)
            </span>
          </div>
        </div>

        {/* Owner Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono tracking-wider uppercase text-slate-400 mb-1.5">
              Propriétaire du stock
            </label>
            <div className="flex rounded-lg border border-sc-border p-1 bg-sc-panel">
              <button
                type="button"
                onClick={() => {
                  audio.playClick();
                  setOwnerType('personal');
                }}
                className={`flex-1 py-1.5 text-xs font-mono uppercase rounded-md transition-colors ${
                  ownerType === 'personal'
                    ? 'bg-sc-cyan text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Mon Stock Perso
              </button>
              <button
                type="button"
                onClick={() => {
                  audio.playClick();
                  setOwnerType('client');
                }}
                className={`flex-1 py-1.5 text-xs font-mono uppercase rounded-md transition-colors ${
                  ownerType === 'client'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Dépôt Client
              </button>
            </div>
          </div>

          {ownerType === 'client' && (
            <div>
              <label className="block text-xs font-mono tracking-wider uppercase text-slate-400 mb-1.5">
                Nom du client *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Capitaine Jax..."
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-3 py-2 bg-sc-panel border border-amber-500/50 focus:border-amber-400 rounded-lg text-slate-100 font-sans text-xs focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-mono tracking-wider uppercase text-slate-400 mb-1.5">
            Motif / Commentaire (Optionnel)
          </label>
          <input
            type="text"
            placeholder="Ex: Achat au terminal TDD de Lorville..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 bg-sc-panel border border-sc-border focus:border-sc-cyan rounded-lg text-slate-100 font-sans text-xs focus:outline-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-sc-border">
          <button
            type="button"
            onClick={() => {
              audio.playClick();
              onClose();
            }}
            className="px-4 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-slate-100 text-xs font-mono uppercase tracking-wider transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-lg bg-sc-cyan hover:bg-cyan-400 text-slate-950 font-bold border border-sc-cyan shadow-neon-cyan text-xs font-mono uppercase tracking-wider transition-all duration-200"
          >
            Appliquer la modification
          </button>
        </div>
      </form>
    </Modal>
  );
};

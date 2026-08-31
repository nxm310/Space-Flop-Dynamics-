import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { AutocompleteSelect, AutocompleteOption } from '../common/AutocompleteSelect';
import { RawCargoItem } from '../../types';
import { STAR_CITIZEN_MINERALS, POPULAR_LOCATIONS, MINING_SHIPS } from '../../data/mineralsData';
import { Pickaxe, Ship, MapPin, Gauge } from 'lucide-react';
import { audio } from '../../services/audioService';

interface AddRawCargoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCargo: (item: Omit<RawCargoItem, 'id' | 'extractedAt'>) => void;
}

export const AddRawCargoModal: React.FC<AddRawCargoModalProps> = ({
  isOpen,
  onClose,
  onAddCargo
}) => {
  const [mineralId, setMineralId] = useState('quantainium');
  const [quantitySCU, setQuantitySCU] = useState<number>(32);
  const [purityPercentage, setPurityPercentage] = useState<number>(50);
  const [location, setLocation] = useState(POPULAR_LOCATIONS[0]);
  const [ship, setShip] = useState(MINING_SHIPS[0]);
  const [notes, setNotes] = useState('');

  const mineralOptions: AutocompleteOption[] = STAR_CITIZEN_MINERALS.filter(m => m.isMineable).map(m => ({
    id: m.id,
    label: m.displayName,
    subLabel: `${m.group} • Densité: ${m.density} g/cm³ • ~${m.basePriceAUEC} aUEC/cSCU`,
    category: m.group,
    badge: m.rarity || 'Commun',
    badgeColor: m.rarity === 'Exotic' ? 'purple' : m.rarity === 'Very Rare' ? 'gold' : m.rarity === 'Rare' ? 'cyan' : 'slate'
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedMineral = STAR_CITIZEN_MINERALS.find(m => m.id === mineralId);
    if (!selectedMineral || quantitySCU <= 0) return;

    audio.playSuccess();
    onAddCargo({
      mineralId: selectedMineral.id,
      mineralName: selectedMineral.name,
      quantitySCU: Number(quantitySCU),
      purityPercentage: Number(purityPercentage),
      location,
      ship,
      notes: notes.trim() || undefined
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Enregistrer une Extraction Minière"
      subtitle="Ajoutez une cargaison de minerais bruts minés en vaisseau ou à pied"
      icon={<Pickaxe className="w-5 h-5" />}
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 font-sans">
        {/* Mineral Selection Autocomplete */}
        <AutocompleteSelect
          label="Minerai extrait"
          required
          options={mineralOptions}
          value={mineralId}
          onChange={(val) => setMineralId(val)}
          placeholder="Tapez le nom du minerai (ex: Quantainium, Bexalite...)"
        />

        {/* Quantities & Purity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono tracking-wider uppercase text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-sc-cyan" />
              Quantité totale brute (SCU) *
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={quantitySCU}
                onChange={(e) => setQuantitySCU(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-sc-panel border border-sc-border focus:border-sc-cyan rounded-lg text-slate-100 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-sc-cyan"
              />
              <span className="absolute right-3 top-2.5 text-xs font-mono text-slate-500">
                SCU ({Math.round(quantitySCU * 100)} cSCU)
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono tracking-wider uppercase text-slate-400 mb-1.5 flex items-center justify-between">
              <span>Pureté du minerai (%)</span>
              <span className="text-sc-cyan font-mono">{purityPercentage}%</span>
            </label>
            <input
              type="range"
              min="1"
              max="100"
              value={purityPercentage}
              onChange={(e) => setPurityPercentage(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sc-cyan"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
              <span>1% (Faible)</span>
              <span>50% (Moyen)</span>
              <span>100% (Pur)</span>
            </div>
          </div>
        </div>

        {/* Estimated Pure Mineral calculation */}
        <div className="p-3 rounded-lg bg-sc-dark/80 border border-sc-border flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">Minerais purs exploitables estimés :</span>
          <span className="text-sc-cyan font-bold text-sm">
            {((quantitySCU * purityPercentage) / 100).toFixed(2)} SCU
          </span>
        </div>

        {/* Ship & Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono tracking-wider uppercase text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Ship className="w-3.5 h-3.5 text-sc-cyan" />
              Vaisseau / Véhicule
            </label>
            <select
              value={ship}
              onChange={(e) => setShip(e.target.value)}
              className="w-full px-3 py-2 bg-sc-panel border border-sc-border focus:border-sc-cyan rounded-lg text-slate-100 font-sans text-xs focus:outline-none focus:ring-1 focus:ring-sc-cyan"
            >
              {MINING_SHIPS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono tracking-wider uppercase text-slate-400 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-sc-cyan" />
              Lieu d'extraction
            </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 bg-sc-panel border border-sc-border focus:border-sc-cyan rounded-lg text-slate-100 font-sans text-xs focus:outline-none focus:ring-1 focus:ring-sc-cyan"
            >
              {POPULAR_LOCATIONS.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-mono tracking-wider uppercase text-slate-400 mb-1.5">
            Notes & Détails (Optionnel)
          </label>
          <input
            type="text"
            placeholder="Ex: Filon 100% instable, balise déposée..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 bg-sc-panel border border-sc-border focus:border-sc-cyan rounded-lg text-slate-100 font-sans text-xs focus:outline-none focus:ring-1 focus:ring-sc-cyan"
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
            className="px-4 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-slate-100 hover:bg-slate-700 text-xs font-mono uppercase tracking-wider transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-lg bg-sc-cyan hover:bg-cyan-400 text-slate-950 font-bold border border-sc-cyan shadow-neon-cyan text-xs font-mono uppercase tracking-wider transition-all duration-200"
          >
            Enregistrer la cargaison
          </button>
        </div>
      </form>
    </Modal>
  );
};

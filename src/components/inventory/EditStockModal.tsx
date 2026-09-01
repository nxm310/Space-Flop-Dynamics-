import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { AutocompleteSelect, AutocompleteOption } from '../common/AutocompleteSelect';
import { RefinedStockItem } from '../../types';
import { STAR_CITIZEN_MINERALS } from '../../data/mineralsData';
import { Pencil, Save, Coins, ShieldCheck, User } from 'lucide-react';
import { audio } from '../../services/audioService';

interface EditStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: RefinedStockItem | null;
  onSave: (updatedItem: RefinedStockItem) => void;
}

export const EditStockModal: React.FC<EditStockModalProps> = ({
  isOpen,
  onClose,
  item,
  onSave
}) => {
  const [mineralId, setMineralId] = useState('quantainium');
  const [quantitySCU, setQuantitySCU] = useState<number>(1);
  const [unitMode, setUnitMode] = useState<'scu' | 'micro_scu' | 'cscu'>('scu');
  const [rawUnitInput, setRawUnitInput] = useState<string>('1');
  const [quality, setQuality] = useState<number>(0);
  const [extractionType, setExtractionType] = useState<string>('ship');
  const [ownerType, setOwnerType] = useState<'personal' | 'client'>('personal');
  const [clientName, setClientName] = useState('');
  const [customNotes, setCustomNotes] = useState('');

  // Extract initial values when item changes
  useEffect(() => {
    if (item) {
      setMineralId(item.mineralId);
      setQuantitySCU(item.quantitySCU);
      setRawUnitInput(String(item.quantitySCU));
      setUnitMode('scu');
      setOwnerType(item.ownerType);
      setClientName(item.clientName || '');

      // Parse quality from notes
      const qualMatch = item.notes?.match(/Qualit[eé]:?\s*(\d+)/i);
      setQuality(qualMatch ? parseInt(qualMatch[1], 10) : 0);

      // Parse extraction type
      if (item.notes?.includes('Minable Geo')) {
        setExtractionType('geo');
      } else if (item.notes?.includes('Minable Vaisseaux')) {
        setExtractionType('ship');
      } else {
        const min = STAR_CITIZEN_MINERALS.find(m => m.id === item.mineralId);
        setExtractionType(min?.isFpsMineable ? 'geo' : 'ship');
      }

      // Clean notes without metadata
      let clean = item.notes || '';
      clean = clean.replace(/Qualit[eé]:?\s*\d+/gi, '').replace(/Minable (Geo|Vaisseaux)/gi, '').replace(/\(\d+[\s\d]*\s*µSCU\)/gi, '').replace(/•/g, ' ').replace(/\s+/g, ' ').trim();
      setCustomNotes(clean);
    }
  }, [item]);

  const mineralOptions: AutocompleteOption[] = STAR_CITIZEN_MINERALS.map(m => ({
    id: m.id,
    label: m.displayName,
    subLabel: `${m.group} • ~${m.basePriceAUEC} aUEC/cSCU (${m.basePriceAUEC * 100} aUEC/SCU)`,
    category: m.group,
    badge: m.isFpsMineable ? 'Gemme FPS' : m.group
  }));

  const selectedMineral = STAR_CITIZEN_MINERALS.find(m => m.id === mineralId) || STAR_CITIZEN_MINERALS[0];

  // Handle unit input change
  const handleQuantityInputChange = (val: string, mode = unitMode) => {
    setRawUnitInput(val);
    const num = parseFloat(val.replace(',', '.'));
    if (isNaN(num) || num < 0) return;

    if (mode === 'micro_scu') {
      setQuantitySCU(Number((num / 1_000_000).toFixed(6)));
    } else if (mode === 'cscu') {
      setQuantitySCU(Number((num / 100).toFixed(4)));
    } else {
      setQuantitySCU(Number(num.toFixed(4)));
    }
  };

  const handleUnitModeChange = (newMode: 'scu' | 'micro_scu' | 'cscu') => {
    audio.playClick();
    setUnitMode(newMode);
    if (newMode === 'micro_scu') {
      setRawUnitInput(String(Math.round(quantitySCU * 1_000_000)));
    } else if (newMode === 'cscu') {
      setRawUnitInput(String(Number((quantitySCU * 100).toFixed(2))));
    } else {
      setRawUnitInput(String(quantitySCU));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!item || quantitySCU <= 0) return;

    audio.playSuccess();

    // Construct clean notes with quality and extraction type
    const notesParts = [
      customNotes.trim(),
      quality > 0 ? `Qualité: ${quality}` : '',
      extractionType === 'geo' ? 'Minable Geo' : extractionType === 'ship' ? 'Minable Vaisseaux' : ''
    ].filter(Boolean);

    const updatedItem: RefinedStockItem = {
      ...item,
      mineralId: selectedMineral.id,
      mineralName: selectedMineral.name,
      quantitySCU: Number(quantitySCU.toFixed(6)),
      ownerType,
      clientName: ownerType === 'client' ? (clientName.trim() || 'Client Inconnu') : undefined,
      notes: notesParts.length > 0 ? notesParts.join(' • ') : undefined,
      lastUpdated: new Date().toISOString()
    };

    onSave(updatedItem);
    onClose();
  };

  const estimatedValue = Math.round(quantitySCU * 100 * selectedMineral.basePriceAUEC);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Modifier la Ligne de Minerai"
      subtitle="Modifiez les informations, la quantité, la qualité ou le propriétaire de ce lot"
      icon={<Pencil className="w-5 h-5 text-sc-cyan" />}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
        {/* Mineral Selector */}
        <AutocompleteSelect
          label="Minerai / Matériau"
          required
          options={mineralOptions}
          value={mineralId}
          onChange={(val) => setMineralId(val)}
        />

        {/* Quantity & Unit Mode */}
        <div className="space-y-1.5 font-mono">
          <div className="flex items-center justify-between">
            <label className="text-xs tracking-wider uppercase text-slate-400 font-bold">
              Quantité du lot :
            </label>
            <div className="flex items-center gap-1 bg-[#090e18] p-0.5 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => handleUnitModeChange('scu')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors ${
                  unitMode === 'scu' ? 'bg-sc-cyan text-slate-950 shadow-neon-cyan' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                SCU
              </button>
              <button
                type="button"
                onClick={() => handleUnitModeChange('micro_scu')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors ${
                  unitMode === 'micro_scu' ? 'bg-sc-cyan text-slate-950 shadow-neon-cyan' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                µSCU (micro)
              </button>
              <button
                type="button"
                onClick={() => handleUnitModeChange('cscu')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors ${
                  unitMode === 'cscu' ? 'bg-sc-cyan text-slate-950 shadow-neon-cyan' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                cSCU
              </button>
            </div>
          </div>

          <div className="relative">
            <input
              type="text"
              required
              value={rawUnitInput}
              onChange={(e) => handleQuantityInputChange(e.target.value)}
              className="w-full px-3 py-2 bg-[#090e18] border border-sc-border focus:border-sc-cyan rounded-lg text-sm font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none"
              placeholder={unitMode === 'micro_scu' ? 'Ex: 809000' : 'Ex: 0.809'}
            />
            <span className="absolute right-3 top-2.5 text-xs text-sc-cyan font-bold font-mono uppercase">
              {unitMode === 'micro_scu' ? 'µSCU' : unitMode === 'cscu' ? 'cSCU' : 'SCU'}
            </span>
          </div>

          {/* Conversion live indicator */}
          <div className="p-2 rounded-lg bg-sc-card/60 border border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Volume effectif en jeu :</span>
            <strong className="text-sc-cyan font-bold">
              {quantitySCU.toLocaleString('fr-FR', { maximumFractionDigits: 6 })} SCU
              <span className="text-slate-500 ml-1">({Math.round(quantitySCU * 1_000_000).toLocaleString('fr-FR')} µSCU)</span>
            </strong>
          </div>
        </div>

        {/* Quality Score & Extraction Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Quality */}
          <div>
            <label className="block text-xs font-mono tracking-wider uppercase text-slate-400 mb-1">
              Score de Qualité (0 - 1000)
            </label>
            <input
              type="number"
              min="0"
              max="1000"
              value={quality || ''}
              onChange={(e) => setQuality(parseInt(e.target.value, 10) || 0)}
              placeholder="Ex: 850"
              className="w-full px-3 py-2 bg-[#090e18] border border-sc-border focus:border-sc-cyan rounded-lg text-xs font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none"
            />
          </div>

          {/* Extraction Type */}
          <div>
            <label className="block text-xs font-mono tracking-wider uppercase text-slate-400 mb-1">
              Type d'extraction
            </label>
            <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px]">
              <button
                type="button"
                onClick={() => {
                  audio.playClick();
                  setExtractionType('ship');
                }}
                className={`py-2 px-2 rounded-lg border text-center transition-colors ${
                  extractionType === 'ship'
                    ? 'bg-cyan-500/20 border-sc-cyan text-sc-cyan font-bold'
                    : 'bg-sc-panel border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                🚀 Vaisseaux
              </button>
              <button
                type="button"
                onClick={() => {
                  audio.playClick();
                  setExtractionType('geo');
                }}
                className={`py-2 px-2 rounded-lg border text-center transition-colors ${
                  extractionType === 'geo'
                    ? 'bg-purple-500/20 border-purple-500 text-purple-300 font-bold'
                    : 'bg-sc-panel border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                ⛏️ Geo / FPS
              </button>
            </div>
          </div>
        </div>

        {/* Owner Type */}
        <div>
          <label className="block text-xs font-mono tracking-wider uppercase text-slate-400 mb-1.5">
            Propriétaire du minerai
          </label>
          <div className="grid grid-cols-2 gap-2 font-mono text-xs">
            <button
              type="button"
              onClick={() => {
                audio.playClick();
                setOwnerType('personal');
              }}
              className={`p-2.5 rounded-lg border flex items-center justify-center gap-2 transition-colors ${
                ownerType === 'personal'
                  ? 'bg-sc-cyan/20 border-sc-cyan text-sc-cyan font-bold'
                  : 'bg-sc-panel border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Stock Personnel</span>
            </button>

            <button
              type="button"
              onClick={() => {
                audio.playClick();
                setOwnerType('client');
              }}
              className={`p-2.5 rounded-lg border flex items-center justify-center gap-2 transition-colors ${
                ownerType === 'client'
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                  : 'bg-sc-panel border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Dépôt Client</span>
            </button>
          </div>
        </div>

        {/* Client Name (if client) */}
        {ownerType === 'client' && (
          <div className="animate-in fade-in duration-150">
            <label className="block text-xs font-mono tracking-wider uppercase text-amber-300 mb-1">
              Nom du client / organisation
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Capitaine Jax, Org Vulture Corps..."
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full px-3 py-2 bg-[#090e18] border border-amber-500/50 focus:border-amber-400 rounded-lg text-xs font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none"
            />
          </div>
        )}

        {/* Notes / Context */}
        <div>
          <label className="block text-xs font-mono tracking-wider uppercase text-slate-400 mb-1">
            Notes / Emplacement / Contexte
          </label>
          <input
            type="text"
            placeholder="Ex: QV Breaker • Cale Prospector • Station ARC-L1..."
            value={customNotes}
            onChange={(e) => setCustomNotes(e.target.value)}
            className="w-full px-3 py-2 bg-[#090e18] border border-sc-border focus:border-sc-cyan rounded-lg text-xs font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
        </div>

        {/* Live Estimated Value Banner */}
        <div className="p-3 rounded-xl bg-sc-panel border border-slate-800 flex items-center justify-between font-mono text-xs">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-emerald-400" />
            <span>Valeur estimée au cours actuel :</span>
          </span>
          <span className="text-emerald-400 font-bold text-sm">
            ~{estimatedValue.toLocaleString('fr-FR')} aUEC
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-700 bg-sc-card hover:bg-slate-800 text-slate-300 font-mono text-xs uppercase transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-lg bg-sc-cyan hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-neon-cyan transition-all"
          >
            <Save className="w-4 h-4" />
            Enregistrer les Modifications
          </button>
        </div>
      </form>
    </Modal>
  );
};

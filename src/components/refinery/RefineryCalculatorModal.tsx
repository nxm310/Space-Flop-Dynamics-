import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { AutocompleteSelect, AutocompleteOption } from '../common/AutocompleteSelect';
import { RefineryJob, RawCargoItem } from '../../types';
import { STAR_CITIZEN_MINERALS } from '../../data/mineralsData';
import { REFINERY_STATIONS, REFINING_METHODS } from '../../data/refineryData';
import { Flame, Calculator, Sparkles } from 'lucide-react';
import { audio } from '../../services/audioService';

interface RefineryCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartJob: (job: Omit<RefineryJob, 'id' | 'startedAt' | 'completesAt' | 'status'>) => void;
  prefillCargo?: RawCargoItem | null;
}

export const RefineryCalculatorModal: React.FC<RefineryCalculatorModalProps> = ({
  isOpen,
  onClose,
  onStartJob,
  prefillCargo
}) => {
  const [mineralId, setMineralId] = useState('quantainium');
  const [inputRawSCU, setInputRawSCU] = useState<number>(32);
  const [purityPercentage, setPurityPercentage] = useState<number>(50);
  const [stationId, setStationId] = useState(REFINERY_STATIONS[0].id);
  const [methodId, setMethodId] = useState(REFINING_METHODS[0].id);
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [targetStockType, setTargetStockType] = useState<'personal' | 'client'>('personal');
  const [clientName, setClientName] = useState('');
  const [notes, setNotes] = useState('');

  // Prefill when modal opens from a raw cargo click
  useEffect(() => {
    if (prefillCargo) {
      setMineralId(prefillCargo.mineralId);
      setInputRawSCU(prefillCargo.quantitySCU);
      setPurityPercentage(prefillCargo.purityPercentage);
      if (prefillCargo.notes) setNotes(prefillCargo.notes);
    }
  }, [prefillCargo]);

  const mineralOptions: AutocompleteOption[] = STAR_CITIZEN_MINERALS.filter(m => m.isMineable && m.isShipMineable).map(m => ({
    id: m.id,
    label: m.displayName,
    subLabel: `${m.group} • Base raffinée: ~${m.basePriceAUEC} aUEC/cSCU`,
    category: m.group,
    badge: m.rarity || 'Commun'
  }));

  const selectedMineral = STAR_CITIZEN_MINERALS.find(m => m.id === mineralId) || STAR_CITIZEN_MINERALS[0];
  const selectedStation = REFINERY_STATIONS.find(s => s.id === stationId) || REFINERY_STATIONS[0];
  const selectedMethod = REFINING_METHODS.find(m => m.id === methodId) || REFINING_METHODS[0];

  // Yield & Cost Calculations
  const stationBonus = selectedStation.yieldBonuses[mineralId] || 0;
  const costModifier = selectedStation.costModifiers[mineralId] || 1.0;

  // Effective Yield = Method Yield + Station Bonus (clamped)
  const effectiveYield = Math.min(0.99, Math.max(0.4, selectedMethod.yieldMultiplier + stationBonus));

  // Pure SCU present in cargo
  const pureContentSCU = (inputRawSCU * purityPercentage) / 100;

  // Output Refined SCU
  const outputEstimatedSCU = Number((pureContentSCU * effectiveYield).toFixed(3));

  // Base Cost = SCU * purity * base refining rate * multipliers
  const baseRate = 120; // aUEC per pure SCU base
  const calculatedCostAUEC = Math.round(inputRawSCU * (purityPercentage / 100) * baseRate * selectedMethod.costMultiplier * costModifier);

  // Time calculation in minutes
  const baseTimeMinutes = Math.max(10, Math.round((inputRawSCU * 1.5) / selectedMethod.speedMultiplier));

  useEffect(() => {
    setDurationMinutes(baseTimeMinutes);
  }, [baseTimeMinutes]);

  // Market Value of Output
  const outputValueAUEC = Math.round(outputEstimatedSCU * 100 * selectedMineral.basePriceAUEC);
  const netEstimatedProfitAUEC = outputValueAUEC - calculatedCostAUEC;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (outputEstimatedSCU <= 0) return;

    audio.playSuccess();
    onStartJob({
      mineralId: selectedMineral.id,
      mineralName: selectedMineral.name,
      inputRawSCU: Number(inputRawSCU),
      purityPercentage: Number(purityPercentage),
      outputEstimatedSCU,
      refineryStationId: selectedStation.id,
      refineryStationName: selectedStation.name,
      methodId: selectedMethod.id,
      methodName: selectedMethod.name,
      costAUEC: calculatedCostAUEC,
      durationMinutes: Number(durationMinutes),
      targetStockType,
      clientName: targetStockType === 'client' ? (clientName.trim() || 'Client sans nom') : undefined,
      notes: notes.trim() || undefined
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Calculateur & Ordre de Raffinage"
      subtitle="Simulez le rendement, les coûts et lancez un ordre de traitement"
      icon={<Flame className="w-5 h-5 text-amber-400" />}
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5 font-sans">
        {/* Mineral & Input Quantities */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-1">
            <AutocompleteSelect
              label="Minerai à raffiner"
              required
              options={mineralOptions}
              value={mineralId}
              onChange={(val) => setMineralId(val)}
            />
          </div>

          <div>
            <label className="block text-xs font-mono tracking-wider uppercase text-slate-400 mb-1.5">
              Volume Brut (SCU) *
            </label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              required
              value={inputRawSCU}
              onChange={(e) => setInputRawSCU(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-sc-panel border border-sc-border focus:border-sc-cyan rounded-lg text-slate-100 font-mono text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono tracking-wider uppercase text-slate-400 mb-1.5 flex justify-between">
              <span>Pureté</span>
              <span className="text-sc-cyan font-mono">{purityPercentage}%</span>
            </label>
            <input
              type="number"
              min="1"
              max="100"
              required
              value={purityPercentage}
              onChange={(e) => setPurityPercentage(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
              className="w-full px-3 py-2 bg-sc-panel border border-sc-border focus:border-sc-cyan rounded-lg text-slate-100 font-mono text-sm focus:outline-none"
            />
          </div>
        </div>

        {/* Station & Method Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono tracking-wider uppercase text-slate-400 mb-1.5">
              Station de Raffinage
            </label>
            <select
              value={stationId}
              onChange={(e) => setStationId(e.target.value)}
              className="w-full px-3 py-2 bg-sc-panel border border-sc-border focus:border-sc-cyan rounded-lg text-slate-100 font-sans text-xs focus:outline-none"
            >
              {REFINERY_STATIONS.map(st => {
                const bonus = st.yieldBonuses[mineralId];
                return (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.system}) {bonus ? `[${bonus > 0 ? '+' : ''}${(bonus * 100).toFixed(0)}% rendement]` : ''}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono tracking-wider uppercase text-slate-400 mb-1.5">
              Méthode de Raffinage
            </label>
            <select
              value={methodId}
              onChange={(e) => setMethodId(e.target.value)}
              className="w-full px-3 py-2 bg-sc-panel border border-sc-border focus:border-sc-cyan rounded-lg text-slate-100 font-sans text-xs focus:outline-none"
            >
              {REFINING_METHODS.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} ({(m.yieldMultiplier * 100).toFixed(0)}% base)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Method Description Callout */}
        <div className="p-3 bg-sc-card/80 border border-sc-border rounded-lg text-xs text-slate-300 font-mono">
          <span className="text-amber-400 font-bold">ℹ {selectedMethod.name} : </span>
          {selectedMethod.description}
        </div>

        {/* Real-time Calculation HUD Box */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-sc-card via-sc-panel to-slate-900 border border-sc-cyan/40 shadow-lg shadow-cyan-950/20">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
            <h4 className="text-xs font-mono tracking-wider uppercase text-sc-cyan font-bold flex items-center gap-1.5">
              <Calculator className="w-4 h-4" />
              Projections de Rendement & Rentabilité
            </h4>
            <span className="text-[10px] font-mono text-emerald-400">
              Rendement total: {(effectiveYield * 100).toFixed(1)}%
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="bg-sc-dark/80 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Raffiné Obtenu</span>
              <span className="text-base font-bold text-sc-cyan block mt-0.5">{outputEstimatedSCU} SCU</span>
              <span className="text-[10px] text-slate-500">({Math.round(outputEstimatedSCU * 100)} cSCU)</span>
            </div>

            <div className="bg-sc-dark/80 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Frais Raffinerie</span>
              <span className="text-base font-bold text-amber-400 block mt-0.5">{calculatedCostAUEC.toLocaleString('fr-FR')} aUEC</span>
              <span className="text-[10px] text-slate-500">Frais de traitement</span>
            </div>

            <div className="bg-sc-dark/80 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Durée Estimée</span>
              <span className="text-base font-bold text-slate-200 block mt-0.5">{durationMinutes} min</span>
              <span className="text-[10px] text-slate-500">~{(durationMinutes / 60).toFixed(1)} heure(s)</span>
            </div>

            <div className="bg-sc-dark/80 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Bénéfice Net Estimé</span>
              <span className="text-base font-bold text-emerald-400 block mt-0.5">+{netEstimatedProfitAUEC.toLocaleString('fr-FR')} aUEC</span>
              <span className="text-[10px] text-slate-500">Valeur marchande</span>
            </div>
          </div>
        </div>

        {/* Destination Stock (Personal vs Client) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-mono tracking-wider uppercase text-slate-400 mb-1.5">
              Destination après raffinage
            </label>
            <div className="flex rounded-lg border border-sc-border p-1 bg-sc-panel">
              <button
                type="button"
                onClick={() => {
                  audio.playClick();
                  setTargetStockType('personal');
                }}
                className={`flex-1 py-1.5 text-xs font-mono uppercase tracking-wider rounded-md transition-colors ${
                  targetStockType === 'personal'
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
                  setTargetStockType('client');
                }}
                className={`flex-1 py-1.5 text-xs font-mono uppercase tracking-wider rounded-md transition-colors ${
                  targetStockType === 'client'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Dépôt Client
              </button>
            </div>
          </div>

          {targetStockType === 'client' && (
            <div>
              <label className="block text-xs font-mono tracking-wider uppercase text-slate-400 mb-1.5">
                Nom du client propriétaire *
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
            Notes & Référence (Optionnel)
          </label>
          <input
            type="text"
            placeholder="Ex: Traitement pour commande de canons lasers..."
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
            className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold border border-amber-400 shadow-neon-gold text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-all duration-200"
          >
            <Sparkles className="w-4 h-4" />
            Lancer le Raffinage
          </button>
        </div>
      </form>
    </Modal>
  );
};

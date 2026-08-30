import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AutocompleteSearch } from './AutocompleteSearch';
import { Flame, X, CheckCircle2 } from 'lucide-react';

interface CreateResourceRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateResourceRequestModal: React.FC<CreateResourceRequestModalProps> = ({ isOpen, onClose }) => {
  const { createResourceRequest } = useApp();

  const [resourceName, setResourceName] = useState<string>('Quantainium Raffiné');
  const [targetQuantity, setTargetQuantity] = useState<number>(100);
  const [unit, setUnit] = useState<string>('SCU');
  const [rewardOrPriceUEC, setRewardOrPriceUEC] = useState<number>(90000);
  const [urgency, setUrgency] = useState<'Normal' | 'Urgent' | 'Critique'>('Urgent');
  const [dropoffLocation, setDropoffLocation] = useState<string>('HUR-L1 Green Glade Station');
  const [notes, setNotes] = useState<string>('Requis pour lancer les séries de fabrication de la semaine.');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resourceName.trim()) return;

    const success = await createResourceRequest({
      resourceName,
      targetQuantity,
      unit,
      rewardOrPriceUEC,
      urgency,
      dropoffLocation,
      notes
    });

    if (success) {
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="scifi-card max-w-md w-full rounded-xl p-6 border-amber-500/50 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-amber-950/80 rounded-lg border border-amber-500/40">
            <Flame className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h3 className="font-orbitron font-bold text-lg text-white">
              Demander des Minerais / Matériaux
            </h3>
            <p className="text-xs font-mono text-amber-400">
              Tapez 3 lettres pour chercher parmi tous les minerais Star Citizen
            </p>
          </div>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="font-orbitron font-bold text-lg text-emerald-300">
              Demande publiée avec succès !
            </h4>
            <p className="text-xs text-slate-300">
              Les membres peuvent dès à présent consulter la demande et déclarer leurs livraisons.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
            <AutocompleteSearch
              label="Ressource demandée (Base Star Citizen) :"
              value={resourceName}
              onChange={(val) => setResourceName(val)}
              onSelect={(item) => {
                setResourceName(item.name);
                setUnit(item.defaultUnit || 'SCU');
                if (item.unitValueUEC) {
                  setRewardOrPriceUEC(item.unitValueUEC);
                }
              }}
              placeholder="Tapez 3 lettres (ex: Quan, Bex, RMC, Lara, Gold)..."
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 mb-1">Quantité cible :</label>
                <input
                  type="number"
                  min="1"
                  value={targetQuantity}
                  onChange={(e) => setTargetQuantity(parseInt(e.target.value) || 1)}
                  className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Unité :</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-amber-500"
                >
                  <option value="SCU">SCU (Standard Cargo Unit)</option>
                  <option value="cSCU">cSCU</option>
                  <option value="µSCU">µSCU</option>
                  <option value="Unités">Unités</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 mb-1">Rémunération / Unité (aUEC) :</label>
                <input
                  type="number"
                  value={rewardOrPriceUEC}
                  onChange={(e) => setRewardOrPriceUEC(parseInt(e.target.value) || 0)}
                  className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Priorité / Urgence :</label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value as any)}
                  className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-amber-500"
                >
                  <option value="Normal">Normal</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Critique">Critique</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Station de dépôt recommandée :</label>
              <input
                type="text"
                value={dropoffLocation}
                onChange={(e) => setDropoffLocation(e.target.value)}
                className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Message pour les joueurs :</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-black font-rajdhani font-bold text-sm shadow-lg shadow-amber-950 flex items-center justify-center space-x-2"
            >
              <Flame className="w-4 h-4 text-black" />
              <span>Publier la Demande de Minerais</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

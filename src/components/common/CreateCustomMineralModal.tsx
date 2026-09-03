import React, { useState } from 'react';
import { Modal } from './Modal';
import { MineralInfo, MineralGroup } from '../../types';
import { StorageService } from '../../services/storageService';
import { Sparkles, Plus, Scale, Coins, Rocket, Pickaxe } from 'lucide-react';
import { audio } from '../../services/audioService';

interface CreateCustomMineralModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMineralCreated: (mineral: MineralInfo) => void;
  initialName?: string;
}

export const CreateCustomMineralModal: React.FC<CreateCustomMineralModalProps> = ({
  isOpen,
  onClose,
  onMineralCreated,
  initialName = ''
}) => {
  const [name, setName] = useState(initialName);
  const [displayName, setDisplayName] = useState(initialName);
  const [group, setGroup] = useState<MineralGroup>('Mineral');
  const [density, setDensity] = useState('2.5');
  const [basePriceAUEC, setBasePriceAUEC] = useState('45');
  const [rawPriceAUEC, setRawPriceAUEC] = useState('22');
  const [rarity, setRarity] = useState<'Common' | 'Uncommon' | 'Rare' | 'Very Rare' | 'Exotic'>('Rare');
  const [isShipMineable, setIsShipMineable] = useState(true);
  const [isFpsMineable, setIsFpsMineable] = useState(false);
  const [description, setDescription] = useState('');

  // Reset form when opened with initialName
  React.useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setDisplayName(initialName);
      setGroup('Mineral');
      setDensity('2.5');
      setBasePriceAUEC('45');
      setRawPriceAUEC('22');
      setRarity('Rare');
      setIsShipMineable(true);
      setIsFpsMineable(false);
      setDescription('');
    }
  }, [isOpen, initialName]);

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    if (!displayName || displayName === name) {
      setDisplayName(val);
    }
  };

  const handleGroupChange = (newGroup: MineralGroup) => {
    setGroup(newGroup);
    if (newGroup === 'Gem') {
      setIsFpsMineable(true);
      setIsShipMineable(false);
      setDensity('3.2');
      setBasePriceAUEC('275');
      setRawPriceAUEC('135');
    } else if (newGroup === 'Salvage' || newGroup === 'Composite') {
      setIsFpsMineable(false);
      setIsShipMineable(false);
      setDensity('2.0');
      setBasePriceAUEC('18');
      setRawPriceAUEC('9');
    } else {
      setIsFpsMineable(false);
      setIsShipMineable(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;

    audio.playSuccess();

    // Sane ID generation
    const generatedId = trimmedName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '') || `min_${Date.now()}`;

    const parsedDensity = parseFloat(density.replace(',', '.').trim()) || 2.5;
    const parsedBasePrice = parseFloat(basePriceAUEC.replace(',', '.').trim()) || 40;
    const parsedRawPrice = parseFloat(rawPriceAUEC.replace(',', '.').trim()) || Math.round(parsedBasePrice / 2);

    const newMineral: MineralInfo = {
      id: generatedId,
      name: trimmedName,
      displayName: displayName.trim() || trimmedName,
      group,
      density: parsedDensity,
      basePriceAUEC: parsedBasePrice,
      rawPriceAUEC: parsedRawPrice,
      isMineable: isShipMineable || isFpsMineable,
      isShipMineable,
      isFpsMineable: isFpsMineable || group === 'Gem',
      rarity,
      description: description.trim() || undefined
    };

    // Save permanently in shared database
    StorageService.saveOrUpdateCustomMineral(newMineral);

    onMineralCreated(newMineral);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Créer un Nouveau Minerai / Matière"
      subtitle="Ajoutez une nouvelle ressource dans la base commune avec le même format que les minerais officiels"
      icon={<Sparkles className="w-5 h-5 text-sc-cyan" />}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
        {/* Names & ID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-mono tracking-wider uppercase text-slate-400 mb-1">
              Nom du minerai *
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="Ex: Bexalite Pure, Alliage Titan-X..."
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-3 py-2 bg-[#090e18] border border-sc-border focus:border-sc-cyan rounded-lg text-slate-100 font-sans text-xs focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-mono tracking-wider uppercase text-slate-400 mb-1">
              Nom d'affichage (Display Name)
            </label>
            <input
              type="text"
              placeholder="Ex: Bexalite Pure (Grade Militaire)"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3 py-2 bg-[#090e18] border border-sc-border focus:border-sc-cyan rounded-lg text-slate-100 font-sans text-xs focus:outline-none"
            />
          </div>
        </div>

        {/* Group & Rarity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-mono tracking-wider uppercase text-slate-400 mb-1">
              Catégorie / Groupe *
            </label>
            <select
              value={group}
              onChange={(e) => handleGroupChange(e.target.value as MineralGroup)}
              className="w-full px-3 py-2 bg-[#090e18] border border-sc-border focus:border-sc-cyan rounded-lg text-slate-100 font-sans text-xs focus:outline-none cursor-pointer"
            >
              <option value="Mineral">⛏️ Minerai (Minage Vaisseau)</option>
              <option value="Gem">💎 Gemme (Minage FPS / Roc / Unités)</option>
              <option value="Metal">⚙️ Métal / Alliage</option>
              <option value="Salvage">♻️ Récupération (Salvage)</option>
              <option value="Composite">🧪 Composite & Polymère</option>
              <option value="Gas">💨 Gaz / Fluide</option>
            </select>
          </div>

          <div>
            <label className="block font-mono tracking-wider uppercase text-slate-400 mb-1">
              Rareté galactique
            </label>
            <select
              value={rarity}
              onChange={(e) => setRarity(e.target.value as any)}
              className="w-full px-3 py-2 bg-[#090e18] border border-sc-border focus:border-sc-cyan rounded-lg text-slate-100 font-sans text-xs focus:outline-none cursor-pointer"
            >
              <option value="Common">Commun</option>
              <option value="Uncommon">Peu Commun</option>
              <option value="Rare">Rare</option>
              <option value="Very Rare">Très Rare</option>
              <option value="Exotic">Exotique</option>
            </select>
          </div>
        </div>

        {/* Densité & Prix aUEC */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-sc-panel rounded-xl border border-slate-800">
          <div>
            <label className="block font-mono tracking-wider uppercase text-slate-400 mb-1 flex items-center gap-1">
              <Scale className="w-3 h-3 text-cyan-400" />
              <span>Densité (g/cm³)</span>
            </label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="2.5"
              value={density}
              onChange={(e) => setDensity(e.target.value)}
              className="w-full px-3 py-1.5 bg-[#090e18] border border-sc-border focus:border-sc-cyan rounded-lg text-slate-100 font-mono text-xs focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>

          <div>
            <label className="block font-mono tracking-wider uppercase text-slate-400 mb-1 flex items-center gap-1">
              <Coins className="w-3 h-3 text-amber-400" />
              <span>Prix Raffiné (aUEC)</span>
            </label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="45"
              value={basePriceAUEC}
              onChange={(e) => setBasePriceAUEC(e.target.value)}
              className="w-full px-3 py-1.5 bg-[#090e18] border border-sc-border focus:border-sc-cyan rounded-lg text-slate-100 font-mono text-xs focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
              {group === 'Gem' ? 'par unité' : 'par cSCU (1/100 SCU)'}
            </span>
          </div>

          <div>
            <label className="block font-mono tracking-wider uppercase text-slate-400 mb-1 flex items-center gap-1">
              <Coins className="w-3 h-3 text-slate-400" />
              <span>Prix Brut (aUEC)</span>
            </label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="22"
              value={rawPriceAUEC}
              onChange={(e) => setRawPriceAUEC(e.target.value)}
              className="w-full px-3 py-1.5 bg-[#090e18] border border-sc-border focus:border-sc-cyan rounded-lg text-slate-100 font-mono text-xs focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
              {group === 'Gem' ? 'par unité brute' : 'par cSCU brut'}
            </span>
          </div>
        </div>

        {/* Extraction Type checkboxes */}
        <div className="flex flex-wrap items-center gap-4 pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300 hover:text-slate-100 font-mono text-xs">
            <input
              type="checkbox"
              checked={isShipMineable}
              onChange={(e) => setIsShipMineable(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-sc-cyan focus:ring-sc-cyan"
            />
            <Rocket className="w-3.5 h-3.5 text-cyan-400" />
            <span>Minable en vaisseau (Prospector / MOLE)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300 hover:text-slate-100 font-mono text-xs">
            <input
              type="checkbox"
              checked={isFpsMineable}
              onChange={(e) => setIsFpsMineable(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-sc-cyan focus:ring-sc-cyan"
            />
            <Pickaxe className="w-3.5 h-3.5 text-purple-400" />
            <span>Minable au sol / FPS (MultiTool / ROC / Gemmes)</span>
          </label>
        </div>

        {/* Description */}
        <div>
          <label className="block font-mono tracking-wider uppercase text-slate-400 mb-1">
            Description / Propriétés galactiques
          </label>
          <textarea
            rows={2}
            placeholder="Ex: Minéral synthétique haute densité conçu pour les composants avancés..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 bg-[#090e18] border border-sc-border focus:border-sc-cyan rounded-lg text-slate-100 font-sans text-xs focus:outline-none resize-none"
          />
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-sc-border">
          <button
            type="button"
            onClick={() => {
              audio.playClick();
              onClose();
            }}
            className="px-4 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-slate-100 font-mono text-xs uppercase tracking-wider transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-lg bg-sc-cyan hover:bg-cyan-400 text-slate-950 font-bold border border-sc-cyan shadow-neon-cyan font-mono text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Enregistrer dans la Base Commune</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

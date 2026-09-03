import React, { useState, useMemo } from 'react';
import { Modal } from './Modal';
import { MineralInfo } from '../../types';
import { STAR_CITIZEN_MINERALS } from '../../data/mineralsData';
import {
  Search,
  Sparkles,
  Boxes,
  Pickaxe,
  Rocket,
  ShieldAlert,
  Coins,
  Scale,
  Check,
  ChevronRight,
  Layers,
  Filter,
  Tag
} from 'lucide-react';
import { audio } from '../../services/audioService';

interface SelectMineralModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMineral: (mineral: MineralInfo) => void;
  currentSelectedId?: string;
  title?: string;
  subtitle?: string;
}

export const SelectMineralModal: React.FC<SelectMineralModalProps> = ({
  isOpen,
  onClose,
  onSelectMineral,
  currentSelectedId,
  title = "Selectionner un Ingredient / Minerai",
  subtitle = "Explorez la base galactique des matieres premieres, métaux, gemmes et composites avec cours et densités"
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [selectedExtraction, setSelectedExtraction] = useState<'all' | 'ship' | 'fps' | 'salvage'>('all');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');

  // Groups definition
  const groups: { id: string; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'Toutes les matieres', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'Gem', label: '💎 Gemmes', icon: <Sparkles className="w-3.5 h-3.5 text-purple-400" /> },
    { id: 'Mineral', label: '⛏️ Minerais', icon: <Boxes className="w-3.5 h-3.5 text-cyan-400" /> },
    { id: 'Metal', label: '⚙️ Métaux', icon: <Pickaxe className="w-3.5 h-3.5 text-amber-400" /> },
    { id: 'Salvage', label: '♻️ Recuperation & Composites', icon: <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" /> }
  ];

  // Filter minerals
  const filteredMinerals = useMemo(() => {
    return STAR_CITIZEN_MINERALS.filter(m => {
      // 1. Group filter
      if (selectedGroup !== 'all') {
        if (selectedGroup === 'Gem' && (m.group === 'Gem' || m.isFpsMineable)) {
          // match gem
        } else if (selectedGroup === 'Salvage' && (m.group === 'Salvage' || m.group === 'Composite')) {
          // match salvage
        } else if (m.group !== selectedGroup) {
          return false;
        }
      }

      // 2. Extraction type filter
      if (selectedExtraction === 'ship' && !m.isShipMineable) return false;
      if (selectedExtraction === 'fps' && !m.isFpsMineable && m.group !== 'Gem') return false;
      if (selectedExtraction === 'salvage' && m.group !== 'Salvage' && m.group !== 'Composite') return false;

      // 3. Rarity filter
      if (selectedRarity !== 'all' && m.rarity !== selectedRarity) return false;

      // 4. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = m.name.toLowerCase().includes(q);
        const matchesDisplayName = m.displayName.toLowerCase().includes(q);
        const matchesDesc = m.description ? m.description.toLowerCase().includes(q) : false;
        const matchesGroup = m.group.toLowerCase().includes(q);
        const matchesRarity = m.rarity ? m.rarity.toLowerCase().includes(q) : false;

        if (!matchesName && !matchesDisplayName && !matchesDesc && !matchesGroup && !matchesRarity) {
          return false;
        }
      }

      return true;
    });
  }, [searchQuery, selectedGroup, selectedExtraction, selectedRarity]);

  if (!isOpen) return null;

  const handleSelect = (mineral: MineralInfo) => {
    audio.playSuccess();
    onSelectMineral(mineral);
    onClose();
  };

  const getRarityBadge = (rarity?: string) => {
    switch (rarity) {
      case 'Exotic':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/50">Exotique</span>;
      case 'Very Rare':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/50">Très Rare</span>;
      case 'Rare':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/50">Rare</span>;
      case 'Uncommon':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/50">Peu Commun</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700">Commun</span>;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      maxWidth="4xl"
    >
      <div className="space-y-4">
        {/* Search Bar & Stats */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              autoFocus
              placeholder="Rechercher par nom (ex: Titane, Quantainium, Hadanite), groupe, densité ou cours aUEC..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-[#090e18] border border-sc-border focus:border-sc-cyan rounded-xl text-xs font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-xs text-slate-500 hover:text-slate-300"
              >
                ✕
              </button>
            )}
          </div>

          <div className="text-xs font-mono text-slate-400 shrink-0 self-center">
            <span>{filteredMinerals.length} / {STAR_CITIZEN_MINERALS.length} matieres repertoriees</span>
          </div>
        </div>

        {/* Group / Family Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-slate-800/80">
          {groups.map((grp) => {
            const count = STAR_CITIZEN_MINERALS.filter(m => {
              if (grp.id === 'all') return true;
              if (grp.id === 'Gem') return m.group === 'Gem' || m.isFpsMineable;
              if (grp.id === 'Salvage') return m.group === 'Salvage' || m.group === 'Composite';
              return m.group === grp.id;
            }).length;

            return (
              <button
                key={grp.id}
                type="button"
                onClick={() => {
                  audio.playClick();
                  setSelectedGroup(grp.id);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                  selectedGroup === grp.id
                    ? 'bg-sc-cyan/20 border border-sc-cyan text-sc-cyan font-bold shadow-neon-cyan/20'
                    : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {grp.icon}
                <span>{grp.label}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Secondary Filter Tags (Extraction & Rarity) */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-[#090e18]/60 p-2.5 rounded-xl border border-slate-800/60 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-500 text-[11px] uppercase flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3" />
              <span>Methode :</span>
            </span>

            {[
              { id: 'all', label: 'Toutes' },
              { id: 'ship', label: '🚀 Vaisseau' },
              { id: 'fps', label: '💎 Gemmes / Sol' },
              { id: 'salvage', label: '♻️ Recyclage' }
            ].map(ext => (
              <button
                key={ext.id}
                type="button"
                onClick={() => {
                  audio.playClick();
                  setSelectedExtraction(ext.id as any);
                }}
                className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                  selectedExtraction === ext.id
                    ? 'bg-sc-cyan text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-800/60'
                }`}
              >
                {ext.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-500 text-[11px] uppercase flex items-center gap-1 mr-1">
              <Tag className="w-3 h-3" />
              <span>Rarete :</span>
            </span>

            {[
              { id: 'all', label: 'Toutes' },
              { id: 'Exotic', label: 'Exotique' },
              { id: 'Very Rare', label: 'Tres Rare' },
              { id: 'Rare', label: 'Rare' },
              { id: 'Common', label: 'Commun' }
            ].map(rar => (
              <button
                key={rar.id}
                type="button"
                onClick={() => {
                  audio.playClick();
                  setSelectedRarity(rar.id);
                }}
                className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                  selectedRarity === rar.id
                    ? 'bg-sc-cyan text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-800/60'
                }`}
              >
                {rar.label}
              </button>
            ))}
          </div>
        </div>

        {/* Minerals Detailed Cards Grid */}
        <div className="max-h-[52vh] overflow-y-auto pr-1 custom-scrollbar">
          {filteredMinerals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredMinerals.map((min) => {
                const isSelected = currentSelectedId === min.id;
                const isGem = min.group === 'Gem' || min.isFpsMineable;
                const isSalvage = min.group === 'Salvage' || min.group === 'Composite';

                return (
                  <div
                    key={min.id}
                    onClick={() => handleSelect(min)}
                    className={`p-3.5 rounded-xl border transition-all duration-150 cursor-pointer flex flex-col justify-between gap-3 group select-none ${
                      isSelected
                        ? 'bg-sc-cyan/15 border-sc-cyan shadow-neon-cyan/20'
                        : isGem
                        ? 'bg-sc-card hover:bg-purple-950/30 border-sc-border hover:border-purple-500/60 hover:shadow-lg'
                        : 'bg-sc-card hover:bg-slate-800/60 border-sc-border hover:border-sc-cyan/50 hover:shadow-lg'
                    }`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            isGem
                              ? 'bg-purple-950 text-purple-300 border border-purple-800'
                              : isSalvage
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                          }`}>
                            {isGem ? '💎 Gemme' : min.group}
                          </span>
                          {getRarityBadge(min.rarity)}
                        </div>

                        {isSelected && (
                          <span className="w-4 h-4 rounded-full bg-sc-cyan text-slate-950 flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        )}
                      </div>

                      {/* Mineral Name */}
                      <div className="mt-2">
                        <h4 className="text-base font-bold font-sans text-slate-100 group-hover:text-sc-cyan transition-colors">
                          {min.displayName || min.name}
                        </h4>
                        <span className="text-[10px] font-mono text-slate-400">
                          Identifiant : {min.name}
                        </span>
                      </div>

                      {/* Description */}
                      {min.description && (
                        <p className="text-[11px] font-mono text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
                          {min.description}
                        </p>
                      )}

                      {/* Metrics Block */}
                      <div className="mt-3 p-2 rounded-lg bg-[#090e18] border border-slate-800/80 grid grid-cols-2 gap-2 text-xs font-mono">
                        <div>
                          <span className="text-[10px] text-slate-500 block uppercase flex items-center gap-1">
                            <Coins className="w-3 h-3 text-amber-400" />
                            <span>Cours moyen :</span>
                          </span>
                          <span className="text-amber-300 font-bold">
                            ~{min.basePriceAUEC} <span className="text-[9px] text-slate-400">aUEC/cSCU</span>
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-500 block uppercase flex items-center gap-1">
                            <Scale className="w-3 h-3 text-cyan-400" />
                            <span>Densité :</span>
                          </span>
                          <span className="text-cyan-300 font-bold">
                            {min.density} <span className="text-[9px] text-slate-400">g/cm³</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer / Select Button */}
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        {min.isShipMineable && <Rocket className="w-3 h-3 text-cyan-400" />}
                        {min.isFpsMineable && <Pickaxe className="w-3 h-3 text-purple-400" />}
                        <span>{min.isShipMineable ? 'Vaisseau' : min.isFpsMineable ? 'Sol / FPS' : 'Recyclage'}</span>
                      </span>

                      <span className="text-sc-cyan font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform text-[11px]">
                        <span>Choisir</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-sc-card/40 rounded-xl border border-dashed border-slate-800 space-y-2">
              <Boxes className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs font-mono text-slate-400">
                Aucune matiere premiere correspondant a vos filtres.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedGroup('all');
                  setSelectedExtraction('all');
                  setSelectedRarity('all');
                }}
                className="px-3 py-1 rounded bg-slate-800 text-xs font-mono text-sc-cyan hover:bg-slate-700"
              >
                Reinitialiser les filtres
              </button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

import React, { useState, useMemo } from 'react';
import { Modal } from '../common/Modal';
import { Blueprint } from '../../types';
import {
  Search,
  Sparkles,
  Shield,
  Crosshair,
  Wrench,
  Cpu,
  Layers,
  Check,
  Star,
  Users,
  ChevronRight,
  Tag
} from 'lucide-react';
import { audio } from '../../services/audioService';

interface SelectBlueprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBlueprint: (blueprint: Blueprint) => void;
  availableBlueprints: Blueprint[];
  unlockedPersonalIds: Set<string>;
  unlockedClientIds: Set<string>;
  currentSelectedId?: string;
}

export const SelectBlueprintModal: React.FC<SelectBlueprintModalProps> = ({
  isOpen,
  onClose,
  onSelectBlueprint,
  availableBlueprints,
  unlockedPersonalIds,
  unlockedClientIds,
  currentSelectedId
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<'all' | 'personal' | 'client'>('all');
  const [selectedSubGenre, setSelectedSubGenre] = useState<string>('all');

  // Categories definition with icons and labels
  const categories: { id: string; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'Tous les genres', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'armes_fps', label: 'Armes FPS', icon: <Crosshair className="w-3.5 h-3.5 text-rose-400" /> },
    { id: 'armures', label: 'Armures & Combinaisons', icon: <Shield className="w-3.5 h-3.5 text-amber-400" /> },
    { id: 'armes_vaisseau', label: 'Armes Vaisseau', icon: <Crosshair className="w-3.5 h-3.5 text-cyan-400" /> },
    { id: 'vaisseau', label: 'Composants Vaisseau', icon: <Cpu className="w-3.5 h-3.5 text-blue-400" /> },
    { id: 'outils', label: 'Outils & Medical', icon: <Wrench className="w-3.5 h-3.5 text-emerald-400" /> },
    { id: 'composants_industriels', label: 'Industriel & Divers', icon: <Sparkles className="w-3.5 h-3.5 text-purple-400" /> }
  ];

  // Dynamic sub-genres based on selected category or all
  const availableSubGenres = useMemo(() => {
    const genresSet = new Set<string>();
    availableBlueprints.forEach(bp => {
      if (selectedCategory !== 'all' && bp.category !== selectedCategory) return;
      if (bp.typeLabel && bp.typeLabel.trim()) {
        genresSet.add(bp.typeLabel.trim());
      }
    });
    return Array.from(genresSet).sort();
  }, [availableBlueprints, selectedCategory]);

  // Filter blueprints based on Search, Category, Source, and Sub-Genre
  const filteredBlueprints = useMemo(() => {
    return availableBlueprints.filter(bp => {
      // 1. Source filter
      const isPersonal = unlockedPersonalIds.has(bp.id);
      const isClient = unlockedClientIds.has(bp.id);

      if (selectedSource === 'personal' && !isPersonal) return false;
      if (selectedSource === 'client' && !isClient) return false;

      // 2. Category filter
      if (selectedCategory !== 'all' && bp.category !== selectedCategory) {
        return false;
      }

      // 3. Sub-Genre filter
      if (selectedSubGenre !== 'all' && bp.typeLabel !== selectedSubGenre) {
        return false;
      }

      // 4. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = bp.name.toLowerCase().includes(q);
        const matchesType = bp.typeLabel.toLowerCase().includes(q);
        const matchesDesc = bp.description ? bp.description.toLowerCase().includes(q) : false;
        const matchesIngredients = bp.ingredients.some(i => i.resourceName.toLowerCase().includes(q));

        if (!matchesName && !matchesType && !matchesDesc && !matchesIngredients) {
          return false;
        }
      }

      return true;
    });
  }, [availableBlueprints, selectedCategory, selectedSource, selectedSubGenre, searchQuery, unlockedPersonalIds, unlockedClientIds]);

  if (!isOpen) return null;

  const handleSelect = (bp: Blueprint) => {
    audio.playSuccess();
    onSelectBlueprint(bp);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Sélectionner un Blueprint pour la Commande"
      maxWidth="4xl"
    >
      <div className="space-y-4">
        {/* Top Search & Source Tabs Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              autoFocus
              placeholder="Rechercher par nom d'arme, composant, minerai requis (ex: FS-9, Demeco, Titane)..."
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

          {/* Source Filter Switcher (Mon Atelier vs Client) */}
          <div className="flex items-center p-1 bg-[#090e18] rounded-xl border border-slate-800 shrink-0">
            <button
              type="button"
              onClick={() => {
                audio.playClick();
                setSelectedSource('all');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${
                selectedSource === 'all'
                  ? 'bg-sc-cyan text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Tous ({availableBlueprints.length})
            </button>

            <button
              type="button"
              onClick={() => {
                audio.playClick();
                setSelectedSource('personal');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider flex items-center gap-1 transition-all ${
                selectedSource === 'personal'
                  ? 'bg-sc-cyan text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Star className="w-3 h-3 text-amber-400" />
              <span>Atelier ({availableBlueprints.filter(b => unlockedPersonalIds.has(b.id)).length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                audio.playClick();
                setSelectedSource('client');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider flex items-center gap-1 transition-all ${
                selectedSource === 'client'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3 h-3 text-amber-300" />
              <span>Clients ({availableBlueprints.filter(b => unlockedClientIds.has(b.id)).length})</span>
            </button>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-slate-800/80">
          {categories.map((cat) => {
            const count = availableBlueprints.filter(b => {
              if (cat.id === 'all') return true;
              return b.category === cat.id;
            }).length;

            if (count === 0 && cat.id !== 'all') return null;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  audio.playClick();
                  setSelectedCategory(cat.id);
                  setSelectedSubGenre('all');
                }}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-sc-cyan/20 border border-sc-cyan text-sc-cyan font-bold shadow-neon-cyan/20'
                    : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Sub-Genres / Types Filter Tags */}
        {availableSubGenres.length > 1 && (
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono bg-[#090e18]/60 p-2 rounded-xl border border-slate-800/60">
            <span className="text-slate-500 text-[11px] uppercase flex items-center gap-1 mr-1">
              <Tag className="w-3 h-3" />
              <span>Sous-type :</span>
            </span>

            <button
              type="button"
              onClick={() => {
                audio.playClick();
                setSelectedSubGenre('all');
              }}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                selectedSubGenre === 'all'
                  ? 'bg-sc-cyan text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-800/60'
              }`}
            >
              Tous ({filteredBlueprints.length})
            </button>

            {availableSubGenres.map((genre) => (
              <button
                key={genre}
                type="button"
                onClick={() => {
                  audio.playClick();
                  setSelectedSubGenre(genre);
                }}
                className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                  selectedSubGenre === genre
                    ? 'bg-sc-cyan text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-800/60'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        )}

        {/* Blueprints Cards Grid */}
        <div className="max-h-[52vh] overflow-y-auto pr-1 custom-scrollbar">
          {filteredBlueprints.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredBlueprints.map((bp) => {
                const isPersonal = unlockedPersonalIds.has(bp.id);
                const isClient = unlockedClientIds.has(bp.id);
                const isSelected = currentSelectedId === bp.id;

                return (
                  <div
                    key={bp.id}
                    onClick={() => handleSelect(bp)}
                    className={`p-3.5 rounded-xl border transition-all duration-150 cursor-pointer flex flex-col justify-between gap-3 group select-none ${
                      isSelected
                        ? 'bg-sc-cyan/15 border-sc-cyan shadow-neon-cyan/20'
                        : 'bg-sc-card hover:bg-slate-800/60 border-sc-border hover:border-sc-cyan/50 hover:shadow-lg'
                    }`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] font-mono text-sc-cyan tracking-wider uppercase">
                          {bp.typeLabel}
                        </span>

                        <div className="flex items-center gap-1">
                          {isPersonal && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                              Atelier
                            </span>
                          )}
                          {isClient && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800">
                              Client
                            </span>
                          )}
                          {isSelected && (
                            <span className="w-4 h-4 rounded-full bg-sc-cyan text-slate-950 flex items-center justify-center">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Blueprint Name */}
                      <h4 className="text-sm font-bold font-sans text-slate-100 group-hover:text-sc-cyan transition-colors mt-1">
                        {bp.name}
                      </h4>

                      {/* Ingredients list preview */}
                      <div className="mt-2.5 space-y-1">
                        <span className="text-[10px] font-mono text-slate-400 block uppercase">
                          Matieres requises :
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {bp.ingredients.map((ing, iIdx) => (
                            <span
                              key={iIdx}
                              className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#090e18] text-slate-300 border border-slate-800"
                            >
                              {ing.quantitySCU} SCU {ing.resourceName}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Footer / Select Prompt */}
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                      <span className="text-[10px] text-slate-500">
                        {bp.craftTimeSeconds ? `~${Math.round(bp.craftTimeSeconds / 60)} min` : 'Fabrication standard'}
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
              <Crosshair className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs font-mono text-slate-400">
                Aucun blueprint correspondant a vos criteres de recherche.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedSubGenre('all');
                  setSelectedSource('all');
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

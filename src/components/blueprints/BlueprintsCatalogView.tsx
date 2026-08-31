import React, { useState } from 'react';
import { Blueprint, BlueprintCategory, RefinedStockItem } from '../../types';
import { BLUEPRINT_CATEGORIES } from '../../data/blueprintsData';
import { BlueprintDetailsModal } from './BlueprintDetailsModal';
import { CustomBlueprintModal } from './CustomBlueprintModal';
import { BlueprintsSourcesModal } from './BlueprintsSourcesModal';
import { StarCitizenApiService } from '../../services/starCitizenApi';
import {
  Scroll,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Clock,
  Coins,
  CheckCircle2,
  AlertTriangle,
  Rocket,
  Crosshair,
  Sword,
  Shield,
  Wrench,
  Box,
  BookOpen
} from 'lucide-react';
import { audio } from '../../services/audioService';

interface BlueprintsCatalogViewProps {
  blueprints: Blueprint[];
  stock: RefinedStockItem[];
  onAddCustomBlueprint: (bp: Blueprint) => void;
  onCraftNow: (bp: Blueprint, quantity: number) => void;
  onCreateOrderFromBlueprint: (bp: Blueprint) => void;
  onSyncApiBlueprints: (newBps: Blueprint[]) => void;
}

export const BlueprintsCatalogView: React.FC<BlueprintsCatalogViewProps> = ({
  blueprints,
  stock,
  onAddCustomBlueprint,
  onCraftNow,
  onCreateOrderFromBlueprint,
  onSyncApiBlueprints
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [feasibilityFilter, setFeasibilityFilter] = useState<'all' | 'craftable' | 'missing'>('all');
  const [selectedBlueprint, setSelectedBlueprint] = useState<Blueprint | null>(null);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [isSourcesModalOpen, setIsSourcesModalOpen] = useState(false);
  const [isSyncingApi, setIsSyncingApi] = useState(false);

  const handleBatchImport = (importedList: Blueprint[]) => {
    importedList.forEach(bp => onAddCustomBlueprint(bp));
  };

  // Helper to check feasibility of a blueprint
  const checkFeasibility = (bp: Blueprint) => {
    return bp.ingredients.every(ing => {
      const stockItems = stock.filter(s => s.mineralId === ing.resourceId || s.mineralName.toLowerCase() === ing.resourceName.toLowerCase());
      const totalAvailable = stockItems.reduce((acc, s) => acc + s.quantitySCU, 0);
      return totalAvailable >= ing.quantitySCU;
    });
  };

  // Filter blueprints
  const filteredBlueprints = blueprints.filter(bp => {
    // Category filter
    if (selectedCategory !== 'all' && bp.category !== selectedCategory) {
      return false;
    }

    // Search query (name, typeLabel, ingredients, notes)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchesName = bp.name.toLowerCase().includes(q);
      const matchesType = bp.typeLabel.toLowerCase().includes(q);
      const matchesSubtype = bp.subtype && bp.subtype.toLowerCase().includes(q);
      const matchesIngredient = bp.ingredients.some(i => i.resourceName.toLowerCase().includes(q));

      if (!matchesName && !matchesType && !matchesSubtype && !matchesIngredient) {
        return false;
      }
    }

    // Feasibility filter
    if (feasibilityFilter !== 'all') {
      const isCraftable = checkFeasibility(bp);
      if (feasibilityFilter === 'craftable' && !isCraftable) return false;
      if (feasibilityFilter === 'missing' && isCraftable) return false;
    }

    return true;
  });

  const craftableCount = blueprints.filter(checkFeasibility).length;

  const handleSyncApi = async () => {
    audio.playClick();
    setIsSyncingApi(true);
    try {
      const result = await StarCitizenApiService.fetchBlueprints(50, 1);
      if (result && result.blueprints.length > 0) {
        audio.playSuccess();
        onSyncApiBlueprints(result.blueprints);
      }
    } catch {
      audio.playAlert();
    } finally {
      setIsSyncingApi(false);
    }
  };

  const getCategoryIcon = (cat: BlueprintCategory) => {
    switch (cat) {
      case 'vaisseau': return <Rocket className="w-4 h-4" />;
      case 'armes_vaisseau': return <Crosshair className="w-4 h-4" />;
      case 'armes_fps': return <Sword className="w-4 h-4" />;
      case 'armures': return <Shield className="w-4 h-4" />;
      case 'outils': return <Wrench className="w-4 h-4" />;
      case 'composants_industriels': return <Box className="w-4 h-4" />;
      default: return <Scroll className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-sans tracking-wide text-slate-100 uppercase flex items-center gap-2.5">
            <Scroll className="w-6 h-6 text-sc-cyan" />
            Atelier de Fabrication & Blueprints
          </h2>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Consultez les recettes de fabrication officielles Star Citizen, vérifiez vos stocks et fabriquez vos items
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              audio.playClick();
              setIsSourcesModalOpen(true);
            }}
            className="px-3 py-2 rounded-lg border border-purple-500/40 bg-purple-950/20 hover:bg-purple-950/40 text-purple-300 text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-colors"
            title="Consulter les sites communautaires et importer des JSON de blueprints"
          >
            <BookOpen className="w-4 h-4 text-purple-400" />
            <span className="hidden sm:inline">Sources & Datamining</span>
          </button>

          <button
            onClick={handleSyncApi}
            disabled={isSyncingApi}
            className="px-3 py-2 rounded-lg border border-slate-700 bg-sc-card hover:bg-slate-800 text-slate-200 text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-colors disabled:opacity-40"
            title="Synchroniser avec l'API Star Citizen Wiki en direct"
          >
            <RefreshCw className={`w-4 h-4 text-sc-cyan ${isSyncingApi ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sync API Wiki</span>
          </button>

          <button
            onClick={() => {
              audio.playClick();
              setIsCustomModalOpen(true);
            }}
            className="px-4 py-2 rounded-lg bg-sc-cyan hover:bg-cyan-400 text-slate-950 font-bold border border-sc-cyan shadow-neon-cyan text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            Nouveau Blueprint
          </button>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
        <button
          onClick={() => {
            audio.playClick();
            setSelectedCategory('all');
          }}
          className={`px-3.5 py-2 rounded-xl text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-all shrink-0 ${
            selectedCategory === 'all'
              ? 'bg-sc-cyan text-slate-950 font-bold shadow-neon-cyan'
              : 'bg-sc-card/80 border border-sc-border text-slate-400 hover:text-slate-200 hover:border-sc-cyan/40'
          }`}
        >
          <Scroll className="w-4 h-4" />
          <span>Toutes ({blueprints.length})</span>
        </button>

        {BLUEPRINT_CATEGORIES.map(cat => {
          const count = blueprints.filter(b => b.category === cat.key).length;
          const isSelected = selectedCategory === cat.key;

          return (
            <button
              key={cat.key}
              onClick={() => {
                audio.playClick();
                setSelectedCategory(cat.key);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-all shrink-0 ${
                isSelected
                  ? 'bg-sc-cyan text-slate-950 font-bold shadow-neon-cyan'
                  : 'bg-sc-card/80 border border-sc-border text-slate-400 hover:text-slate-200 hover:border-sc-cyan/40'
              }`}
            >
              {getCategoryIcon(cat.key)}
              <span>{cat.label} ({count})</span>
            </button>
          );
        })}
      </div>

      {/* Search & Feasibility Filter Bar */}
      <div className="bg-sc-card/60 border border-sc-border rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Instant Typeahead Search Input */}
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-sc-cyan absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Tapez le nom d'un item, composant, minerai (ex: Omnisky, P4-AR, Bouclier)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-sc-panel border border-sc-border focus:border-sc-cyan rounded-lg text-xs font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
        </div>

        {/* Feasibility Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <div className="flex rounded-lg border border-slate-800 p-0.5 bg-sc-panel">
            <button
              onClick={() => {
                audio.playClick();
                setFeasibilityFilter('all');
              }}
              className={`px-2.5 py-1 text-[11px] font-mono uppercase rounded transition-colors ${
                feasibilityFilter === 'all'
                  ? 'bg-slate-700 text-slate-100 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Tous ({blueprints.length})
            </button>
            <button
              onClick={() => {
                audio.playClick();
                setFeasibilityFilter('craftable');
              }}
              className={`px-2.5 py-1 text-[11px] font-mono uppercase rounded transition-colors flex items-center gap-1 ${
                feasibilityFilter === 'craftable'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-emerald-400 hover:text-emerald-300'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              Fabricables ({craftableCount})
            </button>
            <button
              onClick={() => {
                audio.playClick();
                setFeasibilityFilter('missing');
              }}
              className={`px-2.5 py-1 text-[11px] font-mono uppercase rounded transition-colors flex items-center gap-1 ${
                feasibilityFilter === 'missing'
                  ? 'bg-rose-500 text-slate-950 font-bold'
                  : 'text-rose-400 hover:text-rose-300'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              Incomplets
            </button>
          </div>
        </div>
      </div>

      {/* Blueprints Grid */}
      {filteredBlueprints.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBlueprints.map((bp) => {
            const isCraftable = checkFeasibility(bp);

            return (
              <div
                key={bp.id}
                onClick={() => {
                  audio.playClick();
                  setSelectedBlueprint(bp);
                }}
                className={`bg-sc-card border rounded-xl p-4 flex flex-col justify-between gap-3 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.01] group ${
                  isCraftable
                    ? 'border-emerald-500/40 hover:border-emerald-400 shadow-emerald-950/20'
                    : 'border-sc-border hover:border-sc-cyan/50'
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-mono text-sc-cyan tracking-wider uppercase">
                          {bp.typeLabel}
                        </span>
                        {bp.size !== undefined && (
                          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            S{bp.size}
                          </span>
                        )}
                        {bp.grade && (
                          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-950/60 text-amber-300 border border-amber-800">
                            G{bp.grade}
                          </span>
                        )}
                      </div>
                      <h4 className="text-base font-bold font-sans text-slate-100 group-hover:text-sc-cyan transition-colors truncate mt-0.5">
                        {bp.name}
                      </h4>
                    </div>

                    <div className="shrink-0">
                      {isCraftable ? (
                        <span className="p-1 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center" title="100% Fabricable avec vos stocks">
                          <CheckCircle2 className="w-4 h-4" />
                        </span>
                      ) : (
                        <span className="p-1 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center" title="Minerais manquants">
                          <AlertTriangle className="w-4 h-4 text-amber-500/70" />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Subtype and timing */}
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400 mt-2">
                    <span className="truncate">{bp.subtype || 'Standard'}</span>
                    <span className="flex items-center gap-1 shrink-0 text-[11px]">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {Math.round(bp.craftTimeSeconds / 60)} min
                    </span>
                  </div>

                  {/* Ingredients Preview */}
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80">
                    <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1.5">
                      Ingrédients ({bp.ingredients.length}) :
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {bp.ingredients.map((ing, idx) => {
                        const stockItems = stock.filter(s => s.mineralId === ing.resourceId || s.mineralName.toLowerCase() === ing.resourceName.toLowerCase());
                        const totalAvail = stockItems.reduce((acc, s) => acc + s.quantitySCU, 0);
                        const hasEnough = totalAvail >= ing.quantitySCU;

                        return (
                          <span
                            key={idx}
                            className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors ${
                              hasEnough
                                ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                                : 'bg-slate-900 border-slate-800 text-slate-400'
                            }`}
                          >
                            {ing.quantitySCU} SCU {ing.resourceName}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Bottom Bar */}
                <div className="flex items-center justify-between pt-2.5 border-t border-sc-border/60 text-xs font-mono">
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5" />
                    {bp.marketEstimatedAUEC ? `${bp.marketEstimatedAUEC.toLocaleString('fr-FR')} aUEC` : 'N/A'}
                  </span>

                  <span className="text-sc-cyan group-hover:underline text-[11px] uppercase tracking-wider">
                    Détails & Craft →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-sc-card/40 border border-sc-border/60 rounded-xl p-12 text-center">
          <Scroll className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-300 font-sans uppercase">
            Aucun blueprint trouvé
          </h4>
          <p className="text-xs text-slate-500 font-mono mt-1 max-w-md mx-auto">
            {searchQuery
              ? `Aucun blueprint ne correspond à "${searchQuery}".`
              : 'Aucun blueprint dans cette catégorie.'}
          </p>
        </div>
      )}

      {/* Blueprint Details & Craft Modal */}
      <BlueprintDetailsModal
        isOpen={selectedBlueprint !== null}
        onClose={() => setSelectedBlueprint(null)}
        blueprint={selectedBlueprint}
        stock={stock}
        onCraftNow={onCraftNow}
        onCreateOrder={onCreateOrderFromBlueprint}
      />

      {/* Custom Blueprint Modal */}
      <CustomBlueprintModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onAddBlueprint={onAddCustomBlueprint}
      />

      {/* Sources & Datamining Guide Modal */}
      <BlueprintsSourcesModal
        isOpen={isSourcesModalOpen}
        onClose={() => setIsSourcesModalOpen(false)}
        onImportBlueprints={handleBatchImport}
      />
    </div>
  );
};

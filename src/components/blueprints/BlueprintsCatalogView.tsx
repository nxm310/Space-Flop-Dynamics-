import React, { useState } from 'react';
import { Blueprint, BlueprintCategory, RefinedStockItem } from '../../types';
import { BLUEPRINT_CATEGORIES, BLUEPRINT_SUBCATEGORIES } from '../../data/blueprintsData';
import { BlueprintDetailsModal } from './BlueprintDetailsModal';
import { CustomBlueprintModal } from './CustomBlueprintModal';
import { BlueprintsSourcesModal } from './BlueprintsSourcesModal';
import { StarCitizenApiService } from '../../services/starCitizenApi';
import { StorageService } from '../../services/storageService';
import {
  Scroll,
  Plus,
  Search,
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
  BookOpen,
  Bookmark,
  CheckSquare,
  Square,
  LayoutGrid,
  Table as TableIcon,
  ChevronRight,
  Layers,
  Terminal
} from 'lucide-react';
import { audio } from '../../services/audioService';

interface BlueprintsCatalogViewProps {
  blueprints: Blueprint[];
  stock: RefinedStockItem[];
  onAddCustomBlueprint: (bp: Blueprint) => void;
  onCraftNow: (bp: Blueprint, quantity: number) => void;
  onCreateOrderFromBlueprint: (bp: Blueprint) => void;
  onSyncApiBlueprints: (newBps: Blueprint[]) => void;
  onNavigateToTab?: (tab: string) => void;
}

export const BlueprintsCatalogView: React.FC<BlueprintsCatalogViewProps> = ({
  blueprints,
  stock,
  onAddCustomBlueprint,
  onCraftNow,
  onCreateOrderFromBlueprint,
  onSyncApiBlueprints,
  onNavigateToTab
}) => {
  // Sub-Tab: 'my_workshop' (Mes Blueprints Débloqués) vs 'all_catalog' (Tous les Blueprints)
  const [subTab, setSubTab] = useState<'my_workshop' | 'all_catalog'>('my_workshop');
  const [viewLayout, setViewLayout] = useState<'grid' | 'table'>('grid');

  // Unlocked / Selected Blueprint IDs by the user
  const [unlockedIds, setUnlockedIds] = useState<string[]>(() => {
    return StorageService.getUnlockedBlueprintIds();
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [feasibilityFilter, setFeasibilityFilter] = useState<'all' | 'craftable' | 'missing'>('all');
  const [selectedBlueprint, setSelectedBlueprint] = useState<Blueprint | null>(null);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [isSourcesModalOpen, setIsSourcesModalOpen] = useState(false);
  const [isSyncingApi, setIsSyncingApi] = useState(false);

  // Synchronize unlocked IDs with StorageService
  const updateUnlockedIds = (newIds: string[]) => {
    setUnlockedIds(newIds);
    StorageService.saveUnlockedBlueprintIds(newIds);
  };

  const toggleUnlockBlueprint = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    audio.playClick();
    if (unlockedIds.includes(id)) {
      updateUnlockedIds(unlockedIds.filter(i => i !== id));
    } else {
      updateUnlockedIds([...unlockedIds, id]);
    }
  };

  const handleDropdownSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    if (!selectedId) return;
    audio.playSuccess();
    if (!unlockedIds.includes(selectedId)) {
      updateUnlockedIds([...unlockedIds, selectedId]);
    }
    // Switch to my_workshop to view it immediately
    setSubTab('my_workshop');
    e.target.value = '';
  };

  const handleSelectAllCurrent = () => {
    audio.playClick();
    const currentIds = filteredBlueprints.map(b => b.id);
    const merged = Array.from(new Set([...unlockedIds, ...currentIds]));
    updateUnlockedIds(merged);
  };

  const handleDeselectAllCurrent = () => {
    audio.playClick();
    const currentIdsSet = new Set(filteredBlueprints.map(b => b.id));
    updateUnlockedIds(unlockedIds.filter(id => !currentIdsSet.has(id)));
  };

  const handleBatchImport = (importedList: Blueprint[]) => {
    importedList.forEach(bp => {
      onAddCustomBlueprint(bp);
      if (!unlockedIds.includes(bp.id)) {
        unlockedIds.push(bp.id);
      }
    });
    updateUnlockedIds([...unlockedIds]);
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
    // SubTab Filter: 'my_workshop' only shows checked/unlocked blueprints
    if (subTab === 'my_workshop' && !unlockedIds.includes(bp.id)) {
      return false;
    }

    // Category filter
    if (selectedCategory !== 'all' && bp.category !== selectedCategory) {
      return false;
    }

    // Sub-category filter
    if (selectedCategory !== 'all' && selectedSubCategory !== 'all') {
      const subCatList = BLUEPRINT_SUBCATEGORIES[selectedCategory];
      const activeSubCat = subCatList?.find(s => s.key === selectedSubCategory);
      if (activeSubCat && !activeSubCat.match(bp)) {
        return false;
      }
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

  const craftableCount = filteredBlueprints.filter(checkFeasibility).length;
  const myBlueprintsTotalCount = blueprints.filter(b => unlockedIds.includes(b.id)).length;

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
            Gérez votre atelier personnel, sélectionnez vos blueprints débloqués et fabriquez vos items
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {onNavigateToTab && (
            <button
              onClick={() => {
                audio.playClick();
                onNavigateToTab('importExport');
              }}
              className="px-3 py-2 rounded-lg border border-sc-cyan/40 bg-sc-cyan/15 hover:bg-sc-cyan/25 text-sc-cyan text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 shadow-neon-cyan/20 transition-all"
              title="Importer et analyser votre Game.log pour détecter vos blueprints débloqués"
            >
              <Terminal className="w-4 h-4 text-sc-cyan" />
              <span className="hidden sm:inline">Importer Game.log</span>
            </button>
          )}

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

      {/* Primary Sub-Tabs & Dropdown Quick Selector Bar */}
      <div className="bg-sc-card/90 border border-sc-border rounded-xl p-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-md">
        {/* Main SubTab Toggle (Mes Blueprints vs Catalogue Global) */}
        <div className="flex rounded-lg border border-slate-800 p-1 bg-[#090e18]">
          <button
            onClick={() => {
              audio.playClick();
              setSubTab('my_workshop');
            }}
            className={`px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-md transition-all flex items-center gap-2 ${
              subTab === 'my_workshop'
                ? 'bg-sc-cyan text-slate-950 font-bold shadow-neon-cyan'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Mes Blueprints ({myBlueprintsTotalCount})</span>
          </button>

          <button
            onClick={() => {
              audio.playClick();
              setSubTab('all_catalog');
            }}
            className={`px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-md transition-all flex items-center gap-2 ${
              subTab === 'all_catalog'
                ? 'bg-slate-700 text-slate-100 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Scroll className="w-4 h-4" />
            <span>Catalogue Global ({blueprints.length})</span>
          </button>
        </div>

        {/* Dropdown Quick Selector for adding to My Blueprints */}
        <div className="flex items-center gap-2.5 flex-1 max-w-md">
          <div className="relative w-full">
            <select
              onChange={handleDropdownSelect}
              defaultValue=""
              className="w-full px-3 py-2 bg-[#090e18] border border-sc-border hover:border-sc-cyan/50 focus:border-sc-cyan rounded-lg text-xs font-mono text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="" disabled>
                ➕ Ajouter un blueprint à ma sélection (liste déroulante)...
              </option>
              {BLUEPRINT_CATEGORIES.map(cat => {
                const catBps = blueprints.filter(b => b.category === cat.key);
                if (catBps.length === 0) return null;

                return (
                  <optgroup key={cat.key} label={`── ${cat.label.toUpperCase()} ──`} className="bg-slate-900 text-sc-cyan font-bold">
                    {catBps.map(bp => {
                      const isAlreadyIn = unlockedIds.includes(bp.id);
                      return (
                        <option
                          key={bp.id}
                          value={bp.id}
                          disabled={isAlreadyIn}
                          className="bg-sc-panel text-slate-200 font-normal"
                        >
                          {isAlreadyIn ? `✓ ${bp.name} (Déjà dans l'atelier)` : `+ ${bp.name} (${bp.typeLabel})`}
                        </option>
                      );
                    })}
                  </optgroup>
                );
              })}
            </select>
          </div>

          {/* Grid / Table Layout Toggle */}
          <div className="flex items-center border border-slate-800 rounded-lg p-0.5 bg-[#090e18] shrink-0">
            <button
              onClick={() => setViewLayout('grid')}
              className={`p-1.5 rounded ${viewLayout === 'grid' ? 'bg-sc-cyan/20 text-sc-cyan' : 'text-slate-500 hover:text-slate-300'}`}
              title="Vue Cartes"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewLayout('table')}
              className={`p-1.5 rounded ${viewLayout === 'table' ? 'bg-sc-cyan/20 text-sc-cyan' : 'text-slate-500 hover:text-slate-300'}`}
              title="Vue Tableau"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
        <button
          onClick={() => {
            audio.playClick();
            setSelectedCategory('all');
            setSelectedSubCategory('all');
          }}
          className={`px-3.5 py-2 rounded-xl text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-all shrink-0 ${
            selectedCategory === 'all'
              ? 'bg-sc-cyan text-slate-950 font-bold shadow-neon-cyan'
              : 'bg-sc-card/80 border border-sc-border text-slate-400 hover:text-slate-200 hover:border-sc-cyan/40'
          }`}
        >
          <Scroll className="w-4 h-4" />
          <span>Toutes ({subTab === 'my_workshop' ? myBlueprintsTotalCount : blueprints.length})</span>
        </button>

        {BLUEPRINT_CATEGORIES.map(cat => {
          const pool = subTab === 'my_workshop' ? blueprints.filter(b => unlockedIds.includes(b.id)) : blueprints;
          const count = pool.filter(b => b.category === cat.key).length;
          const isSelected = selectedCategory === cat.key;

          return (
            <button
              key={cat.key}
              onClick={() => {
                audio.playClick();
                setSelectedCategory(cat.key);
                setSelectedSubCategory('all');
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

      {/* Sub-Category Pills Bar (When a specific category is selected) */}
      {selectedCategory !== 'all' && BLUEPRINT_SUBCATEGORIES[selectedCategory] && (
        <div className="p-2.5 rounded-xl bg-[#090e18]/90 border border-sc-border/80 flex items-center gap-1.5 overflow-x-auto custom-scrollbar animate-in fade-in duration-150">
          <div className="flex items-center gap-1 text-[10px] font-mono text-sc-cyan uppercase font-bold tracking-wider px-2 shrink-0">
            <Layers className="w-3.5 h-3.5" />
            <span>Sous-composants :</span>
          </div>

          {BLUEPRINT_SUBCATEGORIES[selectedCategory].map(sub => {
            const pool = subTab === 'my_workshop' ? blueprints.filter(b => unlockedIds.includes(b.id)) : blueprints;
            const catPool = pool.filter(b => b.category === selectedCategory);
            const count = catPool.filter(sub.match).length;
            const isSubSelected = selectedSubCategory === sub.key;

            return (
              <button
                key={sub.key}
                onClick={() => {
                  audio.playClick();
                  setSelectedSubCategory(sub.key);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all shrink-0 flex items-center gap-1.5 ${
                  isSubSelected
                    ? 'bg-sc-cyan text-slate-950 font-bold shadow-neon-cyan'
                    : 'bg-sc-card/90 border border-slate-800 text-slate-300 hover:text-white hover:border-sc-cyan/40'
                }`}
              >
                <span>{sub.shortLabel}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isSubSelected ? 'bg-slate-950/40 text-slate-950' : 'bg-slate-800 text-sc-cyan'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Search, Feasibility Filter & Selection Controls Bar */}
      <div className="bg-sc-card/60 border border-sc-border rounded-xl p-3.5 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Instant Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-sc-cyan absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Rechercher (ex: Omnisky, P4-AR, Atlas, FR-66, Hadanite)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#090e18] border border-sc-border focus:border-sc-cyan rounded-lg text-xs font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
        </div>

        {/* Selection Batch Controls & Feasibility Filter */}
        <div className="flex flex-wrap items-center justify-between lg:justify-end gap-2 text-xs font-mono">
          {/* Quick Check/Uncheck All in current view */}
          <div className="flex items-center gap-1.5 border-r border-slate-800 pr-3">
            <button
              onClick={handleSelectAllCurrent}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] flex items-center gap-1 transition-colors"
              title="Ajouter tous les blueprints affichés à mes blueprints"
            >
              <CheckSquare className="w-3.5 h-3.5 text-sc-cyan" />
              <span>Tout Cocher</span>
            </button>
            <button
              onClick={handleDeselectAllCurrent}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-300 text-[11px] flex items-center gap-1 transition-colors"
              title="Retirer les blueprints affichés de mes blueprints"
            >
              <Square className="w-3.5 h-3.5" />
              <span>Décocher</span>
            </button>
          </div>

          {/* Feasibility Filter */}
          <div className="flex rounded-lg border border-slate-800 p-0.5 bg-[#090e18]">
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
              Tous ({filteredBlueprints.length})
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

      {/* Main Content Area: Grid View or Table View */}
      {filteredBlueprints.length > 0 ? (
        viewLayout === 'grid' ? (
          /* GRID CARDS VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBlueprints.map((bp) => {
              const isCraftable = checkFeasibility(bp);
              const isUnlocked = unlockedIds.includes(bp.id);

              return (
                <div
                  key={bp.id}
                  onClick={() => {
                    audio.playClick();
                    setSelectedBlueprint(bp);
                  }}
                  className={`bg-sc-card border rounded-xl p-4 flex flex-col justify-between gap-3 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.01] group relative ${
                    isUnlocked ? 'ring-1 ring-sc-cyan/50' : ''
                  } ${
                    isCraftable
                      ? 'border-emerald-500/40 hover:border-emerald-400 shadow-emerald-950/20'
                      : 'border-sc-border hover:border-sc-cyan/50'
                  }`}
                >
                  <div>
                    {/* Card Top Row with Checkbox & Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          {/* Checkbox to add/remove from My Blueprints */}
                          <button
                            type="button"
                            onClick={(e) => toggleUnlockBlueprint(bp.id, e)}
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold flex items-center gap-1.5 transition-all ${
                              isUnlocked
                                ? 'bg-sc-cyan text-slate-950 shadow-neon-cyan'
                                : 'bg-slate-800/90 text-slate-400 hover:text-slate-200 hover:bg-slate-700 border border-slate-700'
                            }`}
                            title={isUnlocked ? 'Dans mon atelier (Cliquer pour retirer)' : 'Ajouter à mes blueprints débloqués'}
                          >
                            {isUnlocked ? <CheckSquare className="w-3 h-3" /> : <Square className="w-3 h-3" />}
                            <span>{isUnlocked ? 'Mon Atelier' : '+ Ajouter'}</span>
                          </button>

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

                        <h4 className="text-base font-bold font-sans text-slate-100 group-hover:text-sc-cyan transition-colors truncate">
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

                    <span className="text-sc-cyan group-hover:underline text-[11px] uppercase tracking-wider flex items-center gap-1">
                      <span>Détails & Craft</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* TABLE VIEW FOR BLUEPRINTS */
          <div className="overflow-x-auto rounded-xl border border-sc-border bg-sc-card/90 shadow-xl">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-sc-border bg-[#090e18] text-slate-400 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 font-semibold text-center w-28">Mon Atelier</th>
                  <th className="py-3 px-4 font-semibold">Nom du Blueprint</th>
                  <th className="py-3 px-4 font-semibold">Catégorie</th>
                  <th className="py-3 px-4 font-semibold">Type & Taille</th>
                  <th className="py-3 px-4 font-semibold">Ingrédients Requis</th>
                  <th className="py-3 px-4 font-semibold text-center">Faisabilité</th>
                  <th className="py-3 px-4 font-semibold text-right">Valeur Estimée</th>
                  <th className="py-3 px-4 font-semibold text-center w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredBlueprints.map((bp) => {
                  const isCraftable = checkFeasibility(bp);
                  const isUnlocked = unlockedIds.includes(bp.id);

                  return (
                    <tr
                      key={bp.id}
                      onClick={() => {
                        audio.playClick();
                        setSelectedBlueprint(bp);
                      }}
                      className={`hover:bg-slate-800/40 transition-colors cursor-pointer group ${
                        isUnlocked ? 'bg-sc-cyan/5' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => toggleUnlockBlueprint(bp.id)}
                          className={`p-1.5 rounded-lg border transition-all inline-flex items-center gap-1 text-[10px] font-bold ${
                            isUnlocked
                              ? 'bg-sc-cyan text-slate-950 border-sc-cyan shadow-neon-cyan'
                              : 'bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-700'
                          }`}
                          title={isUnlocked ? 'Dans mon atelier (Cliquer pour retirer)' : 'Ajouter à mon atelier'}
                        >
                          {isUnlocked ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                          <span className="hidden sm:inline">{isUnlocked ? 'Actif' : '+'}</span>
                        </button>
                      </td>

                      {/* Name */}
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-100 group-hover:text-sc-cyan transition-colors text-sm font-sans block">
                          {bp.name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {bp.subtype || 'Standard'} • {Math.round(bp.craftTimeSeconds / 60)} min
                        </span>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 text-[10px] uppercase">
                          {getCategoryIcon(bp.category)}
                          <span>{bp.category.replace('_', ' ')}</span>
                        </span>
                      </td>

                      {/* Type & Size */}
                      <td className="py-3 px-4">
                        <span className="text-sc-cyan font-bold">{bp.typeLabel}</span>
                        {bp.size !== undefined && (
                          <span className="ml-1.5 px-1 py-0.2 rounded bg-slate-800 text-slate-300 text-[10px]">
                            S{bp.size}
                          </span>
                        )}
                      </td>

                      {/* Ingredients */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="flex flex-wrap gap-1">
                          {bp.ingredients.map((ing, i) => (
                            <span key={i} className="text-[10px] px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-300">
                              {ing.quantitySCU} {ing.resourceName}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Feasibility */}
                      <td className="py-3 px-4 text-center">
                        {isCraftable ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-[10px] font-bold uppercase">
                            <CheckCircle2 className="w-3 h-3" />
                            Prêt
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] uppercase">
                            Incomplet
                          </span>
                        )}
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4 text-right font-bold text-emerald-400">
                        {bp.marketEstimatedAUEC ? `${bp.marketEstimatedAUEC.toLocaleString('fr-FR')} aUEC` : '—'}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => {
                            audio.playClick();
                            setSelectedBlueprint(bp);
                          }}
                          className="px-2.5 py-1 rounded bg-sc-cyan/15 hover:bg-sc-cyan text-sc-cyan hover:text-slate-950 border border-sc-cyan/40 text-[11px] font-bold uppercase transition-all"
                        >
                          Ouvrir
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      ) : (
        /* Empty State */
        <div className="bg-sc-card/40 border border-sc-border/60 rounded-xl p-12 text-center space-y-3">
          <Scroll className="w-12 h-12 text-slate-600 mx-auto" />
          <h4 className="text-base font-bold text-slate-300 font-sans uppercase">
            {subTab === 'my_workshop' ? 'Aucun blueprint dans votre atelier' : 'Aucun blueprint trouvé'}
          </h4>
          <p className="text-xs text-slate-500 font-mono max-w-md mx-auto">
            {subTab === 'my_workshop'
              ? 'Sélectionnez des blueprints à l\'aide des cases à cocher ou de la liste déroulante ci-dessus pour composer votre atelier personnel.'
              : 'Aucun blueprint ne correspond aux critères de recherche.'}
          </p>

          {subTab === 'my_workshop' && (
            <button
              onClick={() => {
                audio.playClick();
                setSubTab('all_catalog');
              }}
              className="px-4 py-2 rounded-lg bg-sc-cyan hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs uppercase tracking-wider inline-flex items-center gap-2 shadow-neon-cyan transition-all"
            >
              <Scroll className="w-4 h-4" />
              <span>Explorer le Catalogue Global</span>
            </button>
          )}
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

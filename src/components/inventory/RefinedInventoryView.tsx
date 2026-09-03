import React, { useState, useMemo } from 'react';
import { RefinedStockItem } from '../../types';
import { STAR_CITIZEN_MINERALS } from '../../data/mineralsData';
import { AdjustStockModal } from './AdjustStockModal';
import { EditStockModal } from './EditStockModal';
import { MineralsChartsView } from './MineralsChartsView';
import { StatCard } from '../common/StatCard';
import { Badge } from '../common/Badge';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { ImportExportService } from '../../services/importExportService';
import {
  Boxes,
  Plus,
  Search,
  Filter,
  FileSpreadsheet,
  Trash2,
  Pencil,
  User,
  ShieldCheck,
  Table,
  BarChart3,
  Layers,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { audio } from '../../services/audioService';

interface RefinedInventoryViewProps {
  stock: RefinedStockItem[];
  onAdjustStock: (item: Omit<RefinedStockItem, 'id' | 'lastUpdated'>, mode: 'add' | 'set' | 'deduct') => void;
  onUpdateStockItem?: (item: RefinedStockItem) => void;
  onDeleteStockItem: (id: string) => void;
  onNavigateToTab?: (tab: string) => void;
}

export const RefinedInventoryView: React.FC<RefinedInventoryViewProps> = ({
  stock,
  onAdjustStock,
  onUpdateStockItem,
  onDeleteStockItem,
  onNavigateToTab
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'personal' | 'client'>('personal');
  const [viewMode, setViewMode] = useState<'table' | 'consolidated' | 'charts'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [selectedExtractionType, setSelectedExtractionType] = useState('all');
  const [sortBy, setSortBy] = useState<
    | 'name_asc'
    | 'name_desc'
    | 'type_asc'
    | 'type_desc'
    | 'quality_desc'
    | 'quality_asc'
    | 'qty_desc'
    | 'qty_asc'
    | 'notes_asc'
    | 'notes_desc'
  >('qty_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(50);

  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [editingStockItem, setEditingStockItem] = useState<RefinedStockItem | null>(null);
  const [selectedMineralForModal, setSelectedMineralForModal] = useState('quantainium');
  const [stockToDelete, setStockToDelete] = useState<string | null>(null);

  // Helper to extract quality number from item
  const getItemQuality = (item: RefinedStockItem): number => {
    if (!item.notes) return 0;
    const match = item.notes.match(/Qualit[eé]:?\s*(\d+)/i);
    return match ? parseInt(match[1], 10) : 0;
  };

  // Helper to extract extraction type from item
  const getItemExtractionType = (item: RefinedStockItem): string => {
    if (item.notes?.includes('Gemme') || item.notes?.includes('Gemmes') || item.notes?.includes('Minable Geo') || item.notes?.includes('Minage Géo') || item.notes?.includes('Minage Geo')) return 'Gemme';
    if (item.notes?.includes('Minable Vaisseaux') || item.notes?.includes('Minage Vaisseau')) return 'Minable Vaisseaux';
    const mineral = STAR_CITIZEN_MINERALS.find(m => m.id === item.mineralId);
    if (mineral?.group === 'Gem' || mineral?.isFpsMineable) return 'Gemme';
    if (mineral?.isShipMineable) return 'Minable Vaisseaux';
    return 'Autre';
  };

  // Helper to toggle column sort
  const handleColumnSort = (column: 'name' | 'type' | 'quality' | 'qty' | 'notes') => {
    audio.playClick();
    if (column === 'name') {
      setSortBy(prev => prev === 'name_asc' ? 'name_desc' : 'name_asc');
    } else if (column === 'type') {
      setSortBy(prev => prev === 'type_asc' ? 'type_desc' : 'type_asc');
    } else if (column === 'quality') {
      setSortBy(prev => prev === 'quality_desc' ? 'quality_asc' : 'quality_desc');
    } else if (column === 'qty') {
      setSortBy(prev => prev === 'qty_desc' ? 'qty_asc' : 'qty_desc');
    } else if (column === 'notes') {
      setSortBy(prev => prev === 'notes_asc' ? 'notes_desc' : 'notes_asc');
    }
  };

  const getSortIcon = (column: 'name' | 'type' | 'quality' | 'qty' | 'notes') => {
    const isCurrent = sortBy.startsWith(column);
    if (!isCurrent) {
      return <ArrowUpDown className="w-3 h-3 text-slate-600 opacity-40 group-hover:opacity-100 transition-opacity ml-1.5 inline" />;
    }
    const isAsc = sortBy.endsWith('_asc');
    return isAsc
      ? <ArrowUp className="w-3.5 h-3.5 text-sc-cyan ml-1.5 inline" />
      : <ArrowDown className="w-3.5 h-3.5 text-sc-cyan ml-1.5 inline" />;
  };

  // Filtered stock items
  const filteredStock = useMemo(() => {
    return stock.filter(item => {
      // Owner filter
      if (activeTab === 'personal' && item.ownerType !== 'personal') return false;
      if (activeTab === 'client' && item.ownerType !== 'client') return false;

      // Group filter
      const mineral = STAR_CITIZEN_MINERALS.find(m => m.id === item.mineralId);
      if (selectedGroup !== 'all' && mineral?.group !== selectedGroup) return false;

      // Extraction Type filter
      if (selectedExtractionType !== 'all') {
        const extType = getItemExtractionType(item);
        if (selectedExtractionType === 'geo' && extType !== 'Gemme') return false;
        if (selectedExtractionType === 'ship' && extType !== 'Minable Vaisseaux') return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.mineralName.toLowerCase().includes(q);
        const matchesClient = item.clientName ? item.clientName.toLowerCase().includes(q) : false;
        const matchesNotes = item.notes ? item.notes.toLowerCase().includes(q) : false;
        const qualityNum = getItemQuality(item);
        const matchesQuality = qualityNum > 0 && String(qualityNum).includes(q);

        if (!matchesName && !matchesClient && !matchesNotes && !matchesQuality) {
          return false;
        }
      }

      return true;
    });
  }, [stock, activeTab, selectedGroup, selectedExtractionType, searchQuery]);

  // Sorted items
  const sortedStock = useMemo(() => {
    const list = [...filteredStock];
    list.sort((a, b) => {
      const qualA = getItemQuality(a);
      const qualB = getItemQuality(b);
      const typeA = getItemExtractionType(a);
      const typeB = getItemExtractionType(b);

      switch (sortBy) {
        case 'name_asc':
          return a.mineralName.localeCompare(b.mineralName);
        case 'name_desc':
          return b.mineralName.localeCompare(a.mineralName);
        case 'type_asc':
          return typeA.localeCompare(typeB);
        case 'type_desc':
          return typeB.localeCompare(typeA);
        case 'quality_desc':
          return qualB - qualA;
        case 'quality_asc':
          return qualA - qualB;
        case 'qty_desc':
          return b.quantitySCU - a.quantitySCU;
        case 'qty_asc':
          return a.quantitySCU - b.quantitySCU;
        case 'notes_asc':
          return (a.notes || '').localeCompare(b.notes || '');
        case 'notes_desc':
          return (b.notes || '').localeCompare(a.notes || '');
        default:
          return 0;
      }
    });
    return list;
  }, [filteredStock, sortBy]);

  // Consolidated summary by mineral
  const consolidatedMinerals = useMemo(() => {
    const map = new Map<string, {
      mineralId: string;
      mineralName: string;
      group: string;
      rarity: string;
      totalSCU: number;
      lotCount: number;
      avgQuality: number;
      maxQuality: number;
      isGeo: boolean;
      items: RefinedStockItem[];
    }>();

    filteredStock.forEach(item => {
      const min = STAR_CITIZEN_MINERALS.find(m => m.id === item.mineralId);
      const qual = getItemQuality(item);

      if (!map.has(item.mineralId)) {
        map.set(item.mineralId, {
          mineralId: item.mineralId,
          mineralName: item.mineralName,
          group: min?.group || 'Mineral',
          rarity: min?.rarity || 'Common',
          totalSCU: 0,
          lotCount: 0,
          avgQuality: 0,
          maxQuality: 0,
          isGeo: min?.group === 'Gem' || min?.isFpsMineable || item.notes?.includes('Gemme') || item.notes?.includes('Minable Geo') || false,
          items: []
        });
      }

      const entry = map.get(item.mineralId)!;
      entry.totalSCU += item.quantitySCU;
      entry.lotCount += 1;
      if (qual > 0) {
        entry.avgQuality = Math.round((entry.avgQuality * (entry.lotCount - 1) + qual) / entry.lotCount);
        if (qual > entry.maxQuality) {
          entry.maxQuality = qual;
        }
      }
      entry.items.push(item);
    });

    const arr = Array.from(map.values());
    arr.sort((a, b) => b.totalSCU - a.totalSCU);
    return arr;
  }, [filteredStock]);

  // Pagination for table view
  const totalPages = pageSize === -1 ? 1 : Math.ceil(sortedStock.length / pageSize);
  const paginatedItems = useMemo(() => {
    if (pageSize === -1) return sortedStock;
    const start = (currentPage - 1) * pageSize;
    return sortedStock.slice(start, start + pageSize);
  }, [sortedStock, currentPage, pageSize]);

  // KPI Calculations
  const totalPersonalSCU = stock.filter(s => s.ownerType === 'personal').reduce((acc, s) => acc + s.quantitySCU, 0);
  const totalClientSCU = stock.filter(s => s.ownerType === 'client').reduce((acc, s) => acc + s.quantitySCU, 0);
  const totalLotsCount = stock.length;

  const handleQuickAdjust = (item: RefinedStockItem, delta: number) => {
    audio.playClick();
    onAdjustStock({
      mineralId: item.mineralId,
      mineralName: item.mineralName,
      quantitySCU: Math.abs(delta),
      ownerType: item.ownerType,
      clientName: item.clientName,
      notes: `Ajustement ${delta > 0 ? '+' : '-'}${Math.abs(delta)} SCU`
    }, delta > 0 ? 'add' : 'deduct');
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-sc-cyan tracking-wider uppercase mb-1">
            <Boxes className="w-4 h-4" />
            <span>Inventaire & Registre Minier</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-sans tracking-wide text-slate-100 uppercase">
            Stock de Minerais & Cargaisons ({stock.length} lots)
          </h2>
          <p className="text-xs font-mono text-slate-400 mt-0.5">
            Retranscription intégrale de vos matières premières brutes et raffinées avec qualités et traçabilité
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Toggle Switch */}
          <div className="flex items-center rounded-xl border border-slate-800 p-1 bg-[#090e18]">
            <button
              onClick={() => {
                audio.playClick();
                setViewMode('table');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                viewMode === 'table'
                  ? 'bg-sc-cyan text-slate-950 font-bold shadow-neon-cyan/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Affichage tableau détaillé de toutes les lignes"
            >
              <Table className="w-3.5 h-3.5" />
              <span>Tableau ({filteredStock.length})</span>
            </button>

            <button
              onClick={() => {
                audio.playClick();
                setViewMode('consolidated');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                viewMode === 'consolidated'
                  ? 'bg-sc-cyan text-slate-950 font-bold shadow-neon-cyan/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Affichage synthétique regroupé par type de minerai"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Synthèse ({consolidatedMinerals.length})</span>
            </button>

            <button
              onClick={() => {
                audio.playClick();
                setViewMode('charts');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                viewMode === 'charts'
                  ? 'bg-sc-cyan text-slate-950 font-bold shadow-neon-cyan/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Affichage des graphiques et histogrammes de stock"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Graphiques</span>
            </button>
          </div>

          <button
            onClick={() => {
              audio.playClick();
              ImportExportService.exportMineralsToExcel(stock);
            }}
            disabled={stock.length === 0}
            className="px-3 py-2 rounded-lg border border-slate-700 bg-sc-card hover:bg-slate-800 text-slate-200 text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors disabled:opacity-40"
            title="Télécharger l'inventaire en format Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Export Excel</span>
          </button>

          <button
            onClick={() => {
              audio.playClick();
              setSelectedMineralForModal('quantainium');
              setIsAdjustModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-lg bg-sc-cyan hover:bg-cyan-400 text-slate-950 font-bold border border-sc-cyan shadow-neon-cyan text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter</span>
          </button>
        </div>
      </div>

      {/* KPI Stats HUD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Lots Référencés"
          value={`${totalLotsCount} Lots`}
          subValue={`${new Set(stock.map(s => s.mineralId)).size} minerais différents`}
          icon={<Boxes className="w-5 h-5" />}
          accent="cyan"
        />
        <StatCard
          title="Mon Stock Personnel"
          value={`${totalPersonalSCU.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} SCU`}
          subValue={`${Math.round(totalPersonalSCU * 100).toLocaleString('fr-FR')} cSCU en réserve`}
          icon={<ShieldCheck className="w-5 h-5" />}
          accent="cyan"
        />
        <StatCard
          title="Dépôts Clients"
          value={`${totalClientSCU.toFixed(1)} SCU`}
          subValue="Fournis pour fabrications"
          icon={<User className="w-5 h-5" />}
          accent="gold"
        />
        <StatCard
          title="Volume Global Stock"
          value={`${(totalPersonalSCU + totalClientSCU).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} SCU`}
          subValue="Réserve cumulée totale"
          icon={<Boxes className="w-5 h-5" />}
          accent="green"
        />
      </div>

      {/* Filters Bar */}
      <div className="bg-sc-card/80 border border-sc-border rounded-xl p-4 space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          
          {/* Owner Tabs */}
          <div className="flex rounded-lg border border-slate-800 p-1 bg-[#090e18]">
            <button
              onClick={() => {
                audio.playClick();
                setActiveTab('personal');
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider rounded-md transition-colors ${
                activeTab === 'personal'
                  ? 'bg-sc-cyan text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Stock Perso ({stock.filter(s => s.ownerType === 'personal').length})
            </button>

            <button
              onClick={() => {
                audio.playClick();
                setActiveTab('client');
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider rounded-md transition-colors ${
                activeTab === 'client'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Dépôts Clients ({stock.filter(s => s.ownerType === 'client').length})
            </button>

            <button
              onClick={() => {
                audio.playClick();
                setActiveTab('all');
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider rounded-md transition-colors ${
                activeTab === 'all'
                  ? 'bg-slate-700 text-slate-100 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Tout ({stock.length})
            </button>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Rechercher minerai, qualité (ex: 523), lot, note..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 bg-[#090e18] border border-sc-border focus:border-sc-cyan rounded-lg text-xs font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none"
            />
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => {
                audio.playClick();
                setSortBy(e.target.value as any);
              }}
              className="px-2.5 py-1.5 bg-[#090e18] border border-sc-border focus:border-sc-cyan rounded-lg text-xs font-mono text-slate-200 focus:outline-none"
            >
              <option value="qty_desc">Quantité (Plus grand ➔ Plus petit)</option>
              <option value="qty_asc">Quantité (Plus petit ➔ Plus grand)</option>
              <option value="name_asc">Nom alphabétique (A ➔ Z)</option>
              <option value="name_desc">Nom alphabétique (Z ➔ A)</option>
              <option value="quality_desc">Qualité (Plus haute ➔ Plus basse)</option>
              <option value="quality_asc">Qualité (Plus basse ➔ Plus haute)</option>
              <option value="type_asc">Type d'extraction (Geo / Vaisseau)</option>
              <option value="notes_asc">Notes & Contexte (A ➔ Z)</option>
            </select>
          </div>
        </div>

        {/* Category & Extraction Filter Tags */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-[11px] font-mono">
          <div className="flex flex-wrap items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-500 mr-1" />
            <span className="text-slate-500 uppercase">Extraction :</span>
            {[
              { id: 'all', label: 'Tous' },
              { id: 'ship', label: '🚀 Minable Vaisseaux' },
              { id: 'geo', label: '💎 Gemmes' }
            ].map(type => (
              <button
                key={type.id}
                onClick={() => {
                  audio.playClick();
                  setSelectedExtractionType(type.id);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-0.5 rounded transition-colors ${
                  selectedExtractionType === type.id
                    ? 'bg-sc-cyan/20 border border-sc-cyan/40 text-sc-cyan font-bold'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-900/60 border border-slate-800'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-500 uppercase">Famille :</span>
            {['all', 'Mineral', 'Metal', 'Gem', 'Salvage'].map(grp => (
              <button
                key={grp}
                onClick={() => {
                  audio.playClick();
                  setSelectedGroup(grp);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-0.5 rounded transition-colors ${
                  selectedGroup === grp
                    ? 'bg-sc-cyan/20 border border-sc-cyan/40 text-sc-cyan font-bold'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-900/60 border border-slate-800'
                }`}
              >
                {grp === 'all' ? 'Toutes' : grp}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* MODE 1: EXHAUSTIVE TABLE VIEW (257 LOTS) */}
      {/* ================================================================= */}
      {viewMode === 'table' && (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-sc-border bg-sc-card/90 shadow-xl">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-sc-border bg-[#090e18] text-slate-400 uppercase tracking-wider text-[11px] select-none">
                  <th className="py-3 px-4 font-semibold w-12">#</th>

                  {/* Mineral Column Header */}
                  <th
                    onClick={() => handleColumnSort('name')}
                    className="py-3 px-4 font-semibold cursor-pointer hover:text-sc-cyan hover:bg-slate-800/40 transition-colors group"
                    title="Cliquer pour trier alphabétiquement par nom"
                  >
                    <div className="flex items-center">
                      <span>Matériau / Minerai</span>
                      {getSortIcon('name')}
                    </div>
                  </th>

                  {/* Extraction Type Column Header */}
                  <th
                    onClick={() => handleColumnSort('type')}
                    className="py-3 px-4 font-semibold cursor-pointer hover:text-sc-cyan hover:bg-slate-800/40 transition-colors group"
                    title="Cliquer pour trier par type d'extraction"
                  >
                    <div className="flex items-center">
                      <span>Type d'Extraction</span>
                      {getSortIcon('type')}
                    </div>
                  </th>

                  {/* Quality Column Header */}
                  <th
                    onClick={() => handleColumnSort('quality')}
                    className="py-3 px-4 font-semibold text-center cursor-pointer hover:text-sc-cyan hover:bg-slate-800/40 transition-colors group"
                    title="Cliquer pour trier par score de qualité"
                  >
                    <div className="flex items-center justify-center">
                      <span>Qualité</span>
                      {getSortIcon('quality')}
                    </div>
                  </th>

                  {/* Quantity Column Header */}
                  <th
                    onClick={() => handleColumnSort('qty')}
                    className="py-3 px-4 font-semibold text-right cursor-pointer hover:text-sc-cyan hover:bg-slate-800/40 transition-colors group"
                    title="Cliquer pour trier par quantité"
                  >
                    <div className="flex items-center justify-end">
                      <span>Quantité</span>
                      {getSortIcon('qty')}
                    </div>
                  </th>

                  {/* Notes Column Header */}
                  <th
                    onClick={() => handleColumnSort('notes')}
                    className="py-3 px-4 font-semibold cursor-pointer hover:text-sc-cyan hover:bg-slate-800/40 transition-colors group"
                    title="Cliquer pour trier par notes et contexte"
                  >
                    <div className="flex items-center">
                      <span>Notes / Contexte</span>
                      {getSortIcon('notes')}
                    </div>
                  </th>

                  <th className="py-3 px-4 font-semibold text-center w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {paginatedItems.length > 0 ? (
                  paginatedItems.map((item, index) => {
                    const mineral = STAR_CITIZEN_MINERALS.find(m => m.id === item.mineralId);
                    const quality = getItemQuality(item);
                    const extType = getItemExtractionType(item);
                    const itemGlobalIndex = pageSize === -1 ? index + 1 : (currentPage - 1) * pageSize + index + 1;

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-800/40 transition-colors group"
                      >
                        {/* Index */}
                        <td className="py-3 px-4 text-slate-500">
                          {itemGlobalIndex}
                        </td>

                        {/* Mineral Name & Rarity */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-sc-cyan shadow-neon-cyan shrink-0" />
                            <div>
                              <span className="font-bold text-slate-100 group-hover:text-sc-cyan transition-colors text-sm font-sans block">
                                {item.mineralName}
                              </span>
                              <span className="text-[10px] text-slate-400 uppercase">
                                {mineral?.group || 'Mineral'} {mineral?.rarity ? `• ${mineral.rarity}` : ''}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Extraction Type */}
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            extType === 'Gemme'
                              ? 'bg-purple-950/60 text-purple-300 border border-purple-800/60'
                              : 'bg-cyan-950/60 text-cyan-300 border border-cyan-800/60'
                          }`}>
                            {extType === 'Gemme' ? '💎 Gemme' : extType}
                          </span>
                        </td>

                        {/* Quality Score */}
                        <td className="py-3 px-4 text-center">
                          {quality > 0 ? (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                              quality >= 800
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : quality >= 600
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : 'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}>
                              Q: {quality}
                            </span>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>

                        {/* Quantity */}
                        <td className="py-3 px-4 text-right">
                          <span className="font-bold text-sc-cyan text-sm">
                            {item.quantitySCU.toLocaleString('fr-FR', { maximumFractionDigits: 3 })}
                          </span>
                          <span className="text-slate-400 ml-1 text-xs">
                            {extType === 'Gemme' || mineral?.group === 'Gem' ? 'unités' : 'SCU'}
                          </span>
                        </td>

                        {/* Notes / Date */}
                        <td className="py-3 px-4">
                          <span className="text-slate-300 text-xs block max-w-xs truncate" title={item.notes}>
                            {item.notes || '—'}
                          </span>
                        </td>

                        {/* Quick Actions */}
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => {
                                audio.playClick();
                                setEditingStockItem(item);
                              }}
                              className="p-1 rounded bg-slate-800 hover:bg-sc-cyan/20 border border-slate-700 hover:border-sc-cyan/50 text-slate-300 hover:text-sc-cyan transition-colors"
                              title="Modifier ce lot de minerai (quantité, qualité, nom, propriétaire, notes)"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleQuickAdjust(item, 1)}
                              className="px-1.5 py-0.5 rounded bg-emerald-950/50 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 text-[10px] font-bold"
                              title="Ajouter 1"
                            >
                              +1
                            </button>
                            <button
                              onClick={() => handleQuickAdjust(item, -1)}
                              className="px-1.5 py-0.5 rounded bg-rose-950/50 hover:bg-rose-900 border border-rose-800 text-rose-300 text-[10px] font-bold"
                              title="Retirer 1"
                            >
                              -1
                            </button>
                            <button
                              onClick={() => setStockToDelete(item.id)}
                              className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                              title="Supprimer ce lot"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-500 font-mono">
                      Aucun lot de minerai ne correspond aux critères sélectionnés.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-slate-400 bg-sc-card border border-sc-border rounded-xl px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span>Afficher :</span>
              {[25, 50, 100, -1].map((size) => (
                <button
                  key={size}
                  onClick={() => {
                    audio.playClick();
                    setPageSize(size);
                    setCurrentPage(1);
                  }}
                  className={`px-2 py-0.5 rounded text-xs ${
                    pageSize === size
                      ? 'bg-sc-cyan text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {size === -1 ? 'Tout' : size}
                </button>
              ))}
              <span className="text-slate-500 ml-2">
                (Total : {sortedStock.length} lignes)
              </span>
            </div>

            {pageSize !== -1 && totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => {
                    audio.playClick();
                    setCurrentPage(prev => Math.max(prev - 1, 1));
                  }}
                  className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span>Page <strong>{currentPage}</strong> sur <strong>{totalPages}</strong></span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => {
                    audio.playClick();
                    setCurrentPage(prev => Math.min(prev + 1, totalPages));
                  }}
                  className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODE 2: CONSOLIDATED SUMMARY BY MINERAL (24 MINERALS) */}
      {/* ================================================================= */}
      {viewMode === 'consolidated' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {consolidatedMinerals.map(m => (
            <div
              key={m.mineralId}
              className="bg-sc-card border border-sc-border hover:border-sc-cyan/50 rounded-xl p-4 flex flex-col justify-between gap-3 transition-all duration-200 hover:shadow-lg"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono text-sc-cyan tracking-wider uppercase">
                      {m.group} • {m.rarity}
                    </span>
                    <h4 className="text-lg font-bold font-sans text-slate-100 mt-0.5">
                      {m.mineralName}
                    </h4>
                  </div>
                  <Badge variant={m.isGeo ? 'purple' : 'cyan'} size="sm">
                    {m.lotCount} {m.lotCount > 1 ? 'lots' : 'lot'}
                  </Badge>
                </div>

                {/* Quantities & Averages */}
                <div className="mt-3 p-3 rounded-lg bg-[#090e18] border border-slate-800/80 flex items-center justify-between font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Volume Global</span>
                    <span className="text-2xl font-bold text-sc-cyan">
                      {m.totalSCU.toLocaleString('fr-FR', { maximumFractionDigits: 3 })}
                    </span>
                    <span className="text-xs text-slate-400 ml-1">
                      {m.isGeo ? 'unités' : 'SCU'}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase">Répartition</span>
                    <span className="text-xs font-bold text-slate-300 block">
                      {m.lotCount} lot{m.lotCount > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Qualité Max & Qualité Moyenne */}
                {(m.maxQuality > 0 || m.avgQuality > 0) && (
                  <div className="mt-2 p-2 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between text-[11px] font-mono">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">Qualité Max :</span>
                      <span className={`px-1.5 py-0.2 rounded font-bold ${
                        m.maxQuality >= 800
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : m.maxQuality >= 600
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-slate-800 text-slate-200'
                      }`}>
                        Q: {m.maxQuality}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">Moyenne :</span>
                      <span className="text-slate-300 font-semibold">
                        Q: {m.avgQuality}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    audio.playClick();
                    setSearchQuery(m.mineralName);
                    setViewMode('table');
                  }}
                  className="text-xs font-mono text-slate-400 hover:text-sc-cyan transition-colors"
                >
                  Voir les {m.lotCount} lots ➔
                </button>

                <button
                  onClick={() => {
                    audio.playClick();
                    if (onNavigateToTab) onNavigateToTab('blueprints');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-sc-card hover:bg-slate-800 border border-slate-700 hover:border-sc-cyan/50 text-slate-200 hover:text-sc-cyan text-xs font-mono uppercase tracking-wider transition-colors"
                >
                  Fabriquer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================================================================= */}
      {/* MODE 3: CHARTS VIEW (GRAPHIQUES MINERAIS ET GEMMES) */}
      {/* ================================================================= */}
      {viewMode === 'charts' && (
        <MineralsChartsView
          stock={filteredStock}
          onSelectMineral={(mineralName) => {
            setSearchQuery(mineralName);
            setViewMode('table');
          }}
        />
      )}

      {/* Adjust Modal */}
      <AdjustStockModal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        onAdjustStock={onAdjustStock}
        defaultMineralId={selectedMineralForModal}
        defaultOwnerType={activeTab === 'client' ? 'client' : 'personal'}
      />

      {/* Edit Mineral Stock Modal */}
      <EditStockModal
        isOpen={editingStockItem !== null}
        onClose={() => setEditingStockItem(null)}
        item={editingStockItem}
        onSave={(updatedItem) => {
          if (onUpdateStockItem) {
            onUpdateStockItem(updatedItem);
          }
        }}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={stockToDelete !== null}
        onClose={() => setStockToDelete(null)}
        onConfirm={() => {
          if (stockToDelete) {
            onDeleteStockItem(stockToDelete);
            setStockToDelete(null);
          }
        }}
        title="Supprimer la réserve de minerai ?"
        message="Êtes-vous sûr de vouloir supprimer cette ligne d'inventaire ?"
      />
    </div>
  );
};


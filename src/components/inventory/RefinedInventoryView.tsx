import React, { useState } from 'react';
import { RefinedStockItem } from '../../types';
import { STAR_CITIZEN_MINERALS } from '../../data/mineralsData';
import { AdjustStockModal } from './AdjustStockModal';
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
  Coins,
  User,
  ShieldCheck
} from 'lucide-react';
import { audio } from '../../services/audioService';

interface RefinedInventoryViewProps {
  stock: RefinedStockItem[];
  onAdjustStock: (item: Omit<RefinedStockItem, 'id' | 'lastUpdated'>, mode: 'add' | 'set' | 'deduct') => void;
  onDeleteStockItem: (id: string) => void;
  onNavigateToTab?: (tab: string) => void;
}

export const RefinedInventoryView: React.FC<RefinedInventoryViewProps> = ({
  stock,
  onAdjustStock,
  onDeleteStockItem,
  onNavigateToTab
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'personal' | 'client'>('personal');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedMineralForModal, setSelectedMineralForModal] = useState('quantainium');
  const [stockToDelete, setStockToDelete] = useState<string | null>(null);

  // Filter stock
  const filteredStock = stock.filter(item => {
    // Owner filter
    if (activeTab === 'personal' && item.ownerType !== 'personal') return false;
    if (activeTab === 'client' && item.ownerType !== 'client') return false;

    // Search filter
    const mineral = STAR_CITIZEN_MINERALS.find(m => m.id === item.mineralId);
    const matchesSearch =
      item.mineralName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.clientName && item.clientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    // Group filter
    if (selectedGroup !== 'all' && mineral?.group !== selectedGroup) return false;

    return true;
  });

  // Calculate totals
  const totalPersonalSCU = stock.filter(s => s.ownerType === 'personal').reduce((acc, s) => acc + s.quantitySCU, 0);
  const totalClientSCU = stock.filter(s => s.ownerType === 'client').reduce((acc, s) => acc + s.quantitySCU, 0);

  const totalValueAUEC = stock.reduce((acc, s) => {
    const mineral = STAR_CITIZEN_MINERALS.find(m => m.id === s.mineralId);
    const rate = mineral?.basePriceAUEC || 10;
    return acc + Math.round(s.quantitySCU * 100 * rate);
  }, 0);

  const handleQuickAdjust = (item: RefinedStockItem, delta: number) => {
    audio.playClick();
    onAdjustStock({
      mineralId: item.mineralId,
      mineralName: item.mineralName,
      quantitySCU: Math.abs(delta),
      ownerType: item.ownerType,
      clientName: item.clientName,
      notes: `Ajustement rapide ${delta > 0 ? '+' : '-'}${Math.abs(delta)} SCU`
    }, delta > 0 ? 'add' : 'deduct');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-sans tracking-wide text-slate-100 uppercase flex items-center gap-2.5">
            <Boxes className="w-6 h-6 text-sc-cyan" />
            Stock de Minerais Raffinés & Dépôts
          </h2>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Visualisez et gérez vos réserves de matières premières prêtes pour la vente ou la fabrication
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              audio.playClick();
              ImportExportService.exportMineralsToExcel(stock);
            }}
            disabled={stock.length === 0}
            className="px-3 py-2 rounded-lg border border-slate-700 bg-sc-card hover:bg-slate-800 text-slate-200 text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-colors disabled:opacity-40"
            title="Exporter l'inventaire complet en Excel"
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
            className="px-4 py-2 rounded-lg bg-sc-cyan hover:bg-cyan-400 text-slate-950 font-bold border border-sc-cyan shadow-neon-cyan text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            Ajuster le Stock
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Mon Stock Personnel"
          value={`${totalPersonalSCU.toFixed(1)} SCU`}
          subValue={`${Math.round(totalPersonalSCU * 100).toLocaleString('fr-FR')} cSCU disponibles`}
          icon={<ShieldCheck className="w-5 h-5" />}
          accent="cyan"
        />
        <StatCard
          title="Dépôts Clients"
          value={`${totalClientSCU.toFixed(1)} SCU`}
          subValue="Fournis pour commandes"
          icon={<User className="w-5 h-5" />}
          accent="gold"
        />
        <StatCard
          title="Valeur Totale Marché"
          value={`${totalValueAUEC.toLocaleString('fr-FR')} aUEC`}
          subValue="Estimation globale du stock"
          icon={<Coins className="w-5 h-5" />}
          accent="green"
        />
        <StatCard
          title="Références de Minerais"
          value={new Set(stock.map(s => s.mineralId)).size}
          subValue="Types de ressources actives"
          icon={<Boxes className="w-5 h-5" />}
          accent="purple"
        />
      </div>

      {/* Filter and Tab Bar */}
      <div className="bg-sc-card/60 border border-sc-border rounded-xl p-3.5 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Owner Tabs */}
          <div className="flex rounded-lg border border-slate-800 p-1 bg-sc-panel w-full sm:w-auto">
            <button
              onClick={() => {
                audio.playClick();
                setActiveTab('personal');
              }}
              className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-mono uppercase tracking-wider rounded-md transition-colors ${
                activeTab === 'personal'
                  ? 'bg-sc-cyan text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Mon Stock Perso ({stock.filter(s => s.ownerType === 'personal').length})
            </button>
            <button
              onClick={() => {
                audio.playClick();
                setActiveTab('client');
              }}
              className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-mono uppercase tracking-wider rounded-md transition-colors ${
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
              }}
              className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-mono uppercase tracking-wider rounded-md transition-colors ${
                activeTab === 'all'
                  ? 'bg-slate-700 text-slate-100 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Vue Consolidée
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filtrer par minerai ou client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-sc-panel border border-sc-border focus:border-sc-cyan rounded-lg text-xs font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Mineral Category Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 border-t border-slate-800/80">
          <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-1" />
          <span className="text-[11px] font-mono text-slate-500 uppercase shrink-0">Catégorie :</span>
          {['all', 'Mineral', 'Metal', 'Gem', 'Salvage'].map(grp => (
            <button
              key={grp}
              onClick={() => {
                audio.playClick();
                setSelectedGroup(grp);
              }}
              className={`px-2.5 py-0.5 rounded text-[11px] font-mono uppercase transition-colors shrink-0 ${
                selectedGroup === grp
                  ? 'bg-sc-cyan/20 border border-sc-cyan/40 text-sc-cyan font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {grp === 'all' ? 'Tous' : grp}
            </button>
          ))}
        </div>
      </div>

      {/* Stock Cards Grid */}
      {filteredStock.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStock.map((item) => {
            const mineral = STAR_CITIZEN_MINERALS.find(m => m.id === item.mineralId);
            const unitPrice = mineral?.basePriceAUEC || 15;
            const approxTotalAUEC = Math.round(item.quantitySCU * 100 * unitPrice);

            return (
              <div
                key={item.id}
                className={`bg-sc-card border rounded-xl p-4 flex flex-col justify-between gap-4 transition-all duration-200 hover:shadow-lg ${
                  item.ownerType === 'client'
                    ? 'border-amber-500/40 hover:border-amber-400'
                    : 'border-sc-border hover:border-sc-cyan/50'
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-sc-cyan tracking-wider uppercase">
                          {mineral?.group || 'Minerai'}
                        </span>
                        {mineral?.rarity && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                            {mineral.rarity}
                          </span>
                        )}
                      </div>
                      <h4 className="text-lg font-bold font-sans text-slate-100 mt-0.5">
                        {item.mineralName}
                      </h4>
                    </div>

                    <div>
                      {item.ownerType === 'client' ? (
                        <Badge variant="gold" size="sm">Client : {item.clientName}</Badge>
                      ) : (
                        <Badge variant="cyan" size="sm">Stock Perso</Badge>
                      )}
                    </div>
                  </div>

                  {/* Quantity Highlight Box */}
                  <div className="mt-3.5 p-3 rounded-lg bg-sc-panel/80 border border-sc-border/60 flex items-center justify-between font-mono">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Quantité Disponible</span>
                      <span className="text-2xl font-bold text-sc-cyan">{item.quantitySCU.toFixed(2)}</span>
                      <span className="text-xs text-slate-400 ml-1">SCU</span>
                      <span className="text-[11px] text-slate-500 block">({Math.round(item.quantitySCU * 100)} cSCU)</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase">Valeur Estimée</span>
                      <span className="text-base font-bold text-emerald-400">~{approxTotalAUEC.toLocaleString('fr-FR')}</span>
                      <span className="text-[10px] text-slate-400 block">aUEC ({unitPrice}/cSCU)</span>
                    </div>
                  </div>

                  {/* Quick Adjust Buttons */}
                  <div className="mt-3 flex items-center justify-between gap-1 text-xs font-mono">
                    <span className="text-[10px] text-slate-500 uppercase">Ajustement rapide :</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleQuickAdjust(item, -1)}
                        className="px-2 py-0.5 rounded bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800 text-rose-300 text-xs font-bold transition-colors"
                        title="Retirer 1 SCU"
                      >
                        -1
                      </button>
                      <button
                        onClick={() => handleQuickAdjust(item, 1)}
                        className="px-2 py-0.5 rounded bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800 text-emerald-300 text-xs font-bold transition-colors"
                        title="Ajouter 1 SCU"
                      >
                        +1
                      </button>
                      <button
                        onClick={() => handleQuickAdjust(item, 5)}
                        className="px-2 py-0.5 rounded bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800 text-emerald-300 text-xs font-bold transition-colors"
                        title="Ajouter 5 SCU"
                      >
                        +5
                      </button>
                    </div>
                  </div>

                  {item.notes && (
                    <div className="mt-2.5 text-[11px] text-slate-400 font-mono italic bg-slate-900/40 p-1.5 rounded">
                      &ldquo;{item.notes}&rdquo;
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-sc-border/60">
                  <button
                    onClick={() => setStockToDelete(item.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded transition-colors"
                    title="Supprimer ce stock"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      audio.playClick();
                      if (onNavigateToTab) onNavigateToTab('blueprints');
                    }}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-sc-card hover:bg-slate-800 border border-slate-700 hover:border-sc-cyan/50 text-slate-300 hover:text-sc-cyan text-xs font-mono tracking-wider uppercase text-center transition-colors"
                  >
                    Utiliser en Fabrication
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-sc-card/40 border border-sc-border/60 rounded-xl p-12 text-center">
          <Boxes className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-300 font-sans uppercase">
            Aucun minerai trouvé dans ce stock
          </h4>
          <p className="text-xs text-slate-500 font-mono mt-1 max-w-md mx-auto">
            {searchQuery
              ? 'Aucune ressource ne correspond à votre filtre.'
              : 'Vous pouvez ajouter manuellement des minerais ou les collecter depuis la raffinerie.'}
          </p>
          <button
            onClick={() => {
              audio.playClick();
              setIsAdjustModalOpen(true);
            }}
            className="mt-4 px-4 py-2 rounded-lg bg-sc-cyan text-slate-950 font-bold font-mono text-xs uppercase"
          >
            Ajouter du minerai
          </button>
        </div>
      )}

      {/* Adjust Modal */}
      <AdjustStockModal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        onAdjustStock={onAdjustStock}
        defaultMineralId={selectedMineralForModal}
        defaultOwnerType={activeTab === 'client' ? 'client' : 'personal'}
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

import React, { useState } from 'react';
import { RawCargoItem } from '../../types';
import { STAR_CITIZEN_MINERALS } from '../../data/mineralsData';
import { AddRawCargoModal } from './AddRawCargoModal';
import { StatCard } from '../common/StatCard';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { ImportExportService } from '../../services/importExportService';
import {
  Pickaxe,
  Plus,
  ArrowRight,
  Trash2,
  Search,
  Filter,
  FileSpreadsheet,
  Gauge,
  MapPin,
  Ship,
  Clock
} from 'lucide-react';
import { audio } from '../../services/audioService';

interface MiningCargoViewProps {
  rawCargo: RawCargoItem[];
  onAddCargo: (item: Omit<RawCargoItem, 'id' | 'extractedAt'>) => void;
  onDeleteCargo: (id: string) => void;
  onSendToRefinery: (item: RawCargoItem) => void;
}

export const MiningCargoView: React.FC<MiningCargoViewProps> = ({
  rawCargo,
  onAddCargo,
  onDeleteCargo,
  onSendToRefinery
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [cargoToDelete, setCargoToDelete] = useState<string | null>(null);

  // Calculations
  const totalRawSCU = rawCargo.reduce((acc, c) => acc + c.quantitySCU, 0);
  const totalEstimatedPureSCU = rawCargo.reduce((acc, c) => acc + (c.quantitySCU * c.purityPercentage) / 100, 0);

  const totalEstimatedValueAUEC = rawCargo.reduce((acc, c) => {
    const mineral = STAR_CITIZEN_MINERALS.find(m => m.id === c.mineralId);
    const pricePerCscu = mineral?.basePriceAUEC || 15;
    const pureSCU = (c.quantitySCU * c.purityPercentage) / 100;
    return acc + Math.round(pureSCU * 100 * pricePerCscu);
  }, 0);

  // Filtered Cargo
  const filteredCargo = rawCargo.filter(c => {
    const matchesSearch =
      c.mineralName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.ship.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.notes && c.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (selectedFilter === 'all') return true;
    return c.ship.toLowerCase().includes(selectedFilter.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Header with Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-sans tracking-wide text-slate-100 uppercase flex items-center gap-2.5">
            <Pickaxe className="w-6 h-6 text-sc-cyan" />
            Minage Brut & Cargaisons Extraites
          </h2>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Gérez vos stocks de minerais bruts fraîchement forés et préparez vos sessions de raffinage
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              audio.playClick();
              ImportExportService.exportRawCargoToExcel(rawCargo);
            }}
            disabled={rawCargo.length === 0}
            className="px-3 py-2 rounded-lg border border-slate-700 bg-sc-card hover:bg-slate-800 text-slate-200 text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-colors disabled:opacity-40"
            title="Exporter l'historique brut en Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Export Excel</span>
          </button>

          <button
            onClick={() => {
              audio.playClick();
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2 rounded-lg bg-sc-cyan hover:bg-cyan-400 text-slate-950 font-bold border border-sc-cyan shadow-neon-cyan text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            Nouvelle Extraction
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Volume Brut Total"
          value={`${totalRawSCU.toFixed(1)} SCU`}
          subValue={`${Math.round(totalRawSCU * 100).toLocaleString('fr-FR')} cSCU`}
          icon={<Gauge className="w-5 h-5" />}
          accent="cyan"
        />
        <StatCard
          title="Minerais Purs Estimés"
          value={`${totalEstimatedPureSCU.toFixed(2)} SCU`}
          subValue="Après raffinage 100%"
          icon={<Pickaxe className="w-5 h-5" />}
          accent="green"
        />
        <StatCard
          title="Valeur Brute Estimée"
          value={`${totalEstimatedValueAUEC.toLocaleString('fr-FR')} aUEC`}
          subValue="Prix de marché moyen"
          icon={<Gauge className="w-5 h-5" />}
          accent="gold"
        />
        <StatCard
          title="Cargaisons en Attente"
          value={rawCargo.length}
          subValue={rawCargo.length > 0 ? "Prêtes pour la raffinerie" : "Aucune soute pleine"}
          icon={<Ship className="w-5 h-5" />}
          accent="purple"
        />
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-sc-card/60 border border-sc-border rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Rechercher par minerai, vaisseau, lieu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-sc-panel border border-sc-border focus:border-sc-cyan rounded-lg text-xs font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="px-3 py-1.5 bg-sc-panel border border-sc-border focus:border-sc-cyan rounded-lg text-xs font-mono text-slate-200 focus:outline-none"
          >
            <option value="all">Tous les véhicules & vaisseaux</option>
            <option value="Prospector">Prospector</option>
            <option value="MOLE">ARGO MOLE</option>
            <option value="ROC">Greycat ROC</option>
            <option value="FPS">Minage FPS</option>
          </select>
        </div>
      </div>

      {/* Cargo Items Grid */}
      {filteredCargo.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCargo.map((item) => {
            const mineral = STAR_CITIZEN_MINERALS.find(m => m.id === item.mineralId);
            const pureSCU = (item.quantitySCU * item.purityPercentage) / 100;
            const approxValue = Math.round(pureSCU * 100 * (mineral?.basePriceAUEC || 15));

            return (
              <div
                key={item.id}
                className="bg-sc-card border border-sc-border hover:border-sc-cyan/50 rounded-xl p-4 flex flex-col justify-between gap-4 transition-all duration-200 hover:shadow-lg hover:shadow-cyan-950/20 group"
              >
                <div>
                  {/* Top line with Mineral and Purity */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono text-sc-cyan tracking-wider uppercase">
                        {mineral?.group || 'Minerai'}
                      </span>
                      <h4 className="text-lg font-bold font-sans text-slate-100 group-hover:text-sc-cyan transition-colors">
                        {item.mineralName}
                      </h4>
                    </div>

                    <div className="text-right">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
                        {item.purityPercentage}% pureté
                      </span>
                    </div>
                  </div>

                  {/* Cargo Quantities */}
                  <div className="mt-3 grid grid-cols-2 gap-2 bg-sc-panel/70 p-2.5 rounded-lg border border-sc-border/50 text-xs font-mono">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Volume Brut :</span>
                      <span className="text-slate-200 font-bold">{item.quantitySCU} SCU</span>
                      <span className="text-[10px] text-slate-500 block">({Math.round(item.quantitySCU * 100)} cSCU)</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Pur Estimé :</span>
                      <span className="text-emerald-400 font-bold">{pureSCU.toFixed(2)} SCU</span>
                      <span className="text-[10px] text-slate-500 block">~{approxValue.toLocaleString('fr-FR')} aUEC</span>
                    </div>
                  </div>

                  {/* Details metadata */}
                  <div className="mt-3 space-y-1.5 text-xs text-slate-400 font-mono">
                    <div className="flex items-center gap-1.5 truncate">
                      <Ship className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{item.ship}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>{new Date(item.extractedAt).toLocaleString('fr-FR')}</span>
                    </div>
                  </div>

                  {item.notes && (
                    <div className="mt-2.5 text-[11px] text-slate-400 bg-slate-900/50 p-2 rounded border border-slate-800 italic">
                      &ldquo;{item.notes}&rdquo;
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-sc-border/60">
                  <button
                    onClick={() => setCargoToDelete(item.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded transition-colors"
                    title="Supprimer la cargaison"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      audio.playClick();
                      onSendToRefinery(item);
                    }}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-sc-cyan/15 hover:bg-sc-cyan text-sc-cyan hover:text-slate-950 border border-sc-cyan/40 hover:border-sc-cyan text-xs font-mono font-semibold tracking-wider uppercase flex items-center justify-center gap-1.5 transition-all duration-200"
                  >
                    <span>Envoyer en Raffinerie</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-sc-card/40 border border-sc-border/60 rounded-xl p-12 text-center">
          <Pickaxe className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-300 font-sans uppercase">
            Aucune cargaison brute enregistrée
          </h4>
          <p className="text-xs text-slate-500 font-mono mt-1 max-w-md mx-auto">
            {searchQuery
              ? 'Aucun minerai ne correspond à votre recherche.'
              : 'Cliquez sur "Nouvelle Extraction" pour enregistrer votre dernière session de minage.'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => {
                audio.playClick();
                setIsAddModalOpen(true);
              }}
              className="mt-4 px-4 py-2 rounded-lg bg-sc-cyan text-slate-950 font-bold font-mono text-xs uppercase"
            >
              Enregistrer une extraction
            </button>
          )}
        </div>
      )}

      {/* Add Modal */}
      <AddRawCargoModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddCargo={onAddCargo}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={cargoToDelete !== null}
        onClose={() => setCargoToDelete(null)}
        onConfirm={() => {
          if (cargoToDelete) {
            onDeleteCargo(cargoToDelete);
            setCargoToDelete(null);
          }
        }}
        title="Supprimer la cargaison ?"
        message="Êtes-vous sûr de vouloir supprimer cette cargaison de minerai brut ? Cette action est irréversible."
      />
    </div>
  );
};

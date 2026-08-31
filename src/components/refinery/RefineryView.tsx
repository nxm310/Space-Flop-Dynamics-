import React, { useState, useEffect } from 'react';
import { RefineryJob, RawCargoItem } from '../../types';
import { RefineryCalculatorModal } from './RefineryCalculatorModal';
import { StatCard } from '../common/StatCard';
import { Badge } from '../common/Badge';
import { ConfirmDialog } from '../common/ConfirmDialog';
import {
  Flame,
  Plus,
  Clock,
  CheckCircle2,
  PackageCheck,
  Building2,
  Trash2,
  FastForward,
  Filter
} from 'lucide-react';
import { audio } from '../../services/audioService';

interface RefineryViewProps {
  jobs: RefineryJob[];
  onStartJob: (job: Omit<RefineryJob, 'id' | 'startedAt' | 'completesAt' | 'status'>) => void;
  onCollectJob: (jobId: string) => void;
  onFastForwardJob: (jobId: string) => void;
  onDeleteJob: (jobId: string) => void;
  prefillCargo?: RawCargoItem | null;
  onClearPrefillCargo?: () => void;
}

export const RefineryView: React.FC<RefineryViewProps> = ({
  jobs,
  onStartJob,
  onCollectJob,
  onFastForwardJob,
  onDeleteJob,
  prefillCargo,
  onClearPrefillCargo
}) => {
  const [isCalcModalOpen, setIsCalcModalOpen] = useState(false);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'in_progress' | 'completed' | 'collected'>('all');
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);
  const [nowTime, setNowTime] = useState<number>(Date.now());

  // Auto open modal if prefillCargo is provided
  useEffect(() => {
    if (prefillCargo) {
      setIsCalcModalOpen(true);
    }
  }, [prefillCargo]);

  // Tick every 10 seconds for real-time progress update
  useEffect(() => {
    const timer = setInterval(() => {
      setNowTime(Date.now());
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Filter jobs
  const filteredJobs = jobs.filter(job => {
    if (selectedStatusFilter === 'all') return true;
    return job.status === selectedStatusFilter;
  });

  const activeJobs = jobs.filter(j => j.status === 'in_progress');
  const completedUncollectedJobs = jobs.filter(j => {
    if (j.status === 'completed') return true;
    if (j.status === 'in_progress') {
      return new Date(j.completesAt).getTime() <= nowTime;
    }
    return false;
  });

  const totalCostAUEC = jobs.reduce((acc, j) => acc + j.costAUEC, 0);
  const totalRefinedSCU = jobs.filter(j => j.status === 'completed' || j.status === 'collected').reduce((acc, j) => acc + j.outputEstimatedSCU, 0);

  const formatRemainingTime = (completesAtISO: string) => {
    const remainingMs = new Date(completesAtISO).getTime() - nowTime;
    if (remainingMs <= 0) return 'Prêt à collecter';

    const totalSeconds = Math.floor(remainingMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m ${seconds}s`;
  };

  const getJobProgressPercentage = (startedAtISO: string, completesAtISO: string) => {
    const start = new Date(startedAtISO).getTime();
    const end = new Date(completesAtISO).getTime();
    const total = end - start;
    if (total <= 0) return 100;
    const elapsed = nowTime - start;
    return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-sans tracking-wide text-slate-100 uppercase flex items-center gap-2.5">
            <Flame className="w-6 h-6 text-amber-400" />
            Centre de Raffinage & Traitement des Minerais
          </h2>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Gérez vos commandes de raffinage en temps réel, optimisez vos rendements et transférez au stock
          </p>
        </div>

        <button
          onClick={() => {
            audio.playClick();
            setIsCalcModalOpen(true);
          }}
          className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold border border-amber-400 shadow-neon-gold text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          Nouveau Raffinage
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Raffinages en Cours"
          value={activeJobs.length}
          subValue={activeJobs.length > 0 ? "Minuteurs actifs" : "Aucun traitement actif"}
          icon={<Clock className="w-5 h-5" />}
          accent="gold"
        />
        <StatCard
          title="Prêts à Collecter"
          value={completedUncollectedJobs.length}
          subValue="En attente de transfert"
          icon={<PackageCheck className="w-5 h-5" />}
          accent="green"
        />
        <StatCard
          title="SCU Total Raffiné"
          value={`${totalRefinedSCU.toFixed(1)} SCU`}
          subValue={`${Math.round(totalRefinedSCU * 100).toLocaleString('fr-FR')} cSCU`}
          icon={<Flame className="w-5 h-5" />}
          accent="cyan"
        />
        <StatCard
          title="Coûts de Raffinage"
          value={`${totalCostAUEC.toLocaleString('fr-FR')} aUEC`}
          subValue="Frais totaux investis"
          icon={<Building2 className="w-5 h-5" />}
          accent="purple"
        />
      </div>

      {/* Filter Tabs */}
      <div className="bg-sc-card/60 border border-sc-border rounded-xl p-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
          <button
            onClick={() => {
              audio.playClick();
              setSelectedStatusFilter('all');
            }}
            className={`px-3 py-1 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors ${
              selectedStatusFilter === 'all'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tous ({jobs.length})
          </button>
          <button
            onClick={() => {
              audio.playClick();
              setSelectedStatusFilter('in_progress');
            }}
            className={`px-3 py-1 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors ${
              selectedStatusFilter === 'in_progress'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            En cours ({activeJobs.length})
          </button>
          <button
            onClick={() => {
              audio.playClick();
              setSelectedStatusFilter('completed');
            }}
            className={`px-3 py-1 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors ${
              selectedStatusFilter === 'completed'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Terminés / Prêts ({completedUncollectedJobs.length})
          </button>
          <button
            onClick={() => {
              audio.playClick();
              setSelectedStatusFilter('collected');
            }}
            className={`px-3 py-1 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors ${
              selectedStatusFilter === 'collected'
                ? 'bg-slate-700 text-slate-200 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Collectés en stock
          </button>
        </div>
      </div>

      {/* Jobs Grid */}
      {filteredJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredJobs.map((job) => {
            const isFinished = job.status === 'completed' || new Date(job.completesAt).getTime() <= nowTime;
            const progress = job.status === 'collected' ? 100 : getJobProgressPercentage(job.startedAt, job.completesAt);
            const remaining = formatRemainingTime(job.completesAt);

            return (
              <div
                key={job.id}
                className={`bg-sc-card border rounded-xl p-4 flex flex-col justify-between gap-4 transition-all duration-200 hover:shadow-lg ${
                  isFinished && job.status !== 'collected'
                    ? 'border-emerald-500/60 shadow-emerald-950/30 ring-1 ring-emerald-500/30'
                    : job.status === 'collected'
                    ? 'border-sc-border opacity-75'
                    : 'border-amber-500/40 hover:border-amber-400'
                }`}
              >
                <div>
                  {/* Top Bar with Mineral Name & Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-bold font-sans text-slate-100">
                          {job.mineralName}
                        </h4>
                        {job.targetStockType === 'client' ? (
                          <Badge variant="gold" size="sm">Client: {job.clientName}</Badge>
                        ) : (
                          <Badge variant="cyan" size="sm">Stock Perso</Badge>
                        )}
                      </div>
                      <p className="text-xs font-mono text-slate-400 mt-0.5">
                        {job.methodName} @ {job.refineryStationName}
                      </p>
                    </div>

                    <div>
                      {job.status === 'collected' ? (
                        <Badge variant="slate" size="sm">Collecté</Badge>
                      ) : isFinished ? (
                        <Badge variant="green" size="sm">Terminé</Badge>
                      ) : (
                        <Badge variant="gold" size="sm">En cours</Badge>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar & Countdown */}
                  <div className="mt-3.5 space-y-1.5 font-mono">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        {isFinished ? 'Traitement terminé' : 'Temps restant :'}
                      </span>
                      <span className={`font-bold ${isFinished ? 'text-emerald-400' : 'text-amber-300'}`}>
                        {remaining}
                      </span>
                    </div>

                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isFinished ? 'bg-emerald-400' : 'bg-gradient-to-r from-amber-500 to-sc-cyan'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Metrics Table */}
                  <div className="mt-3.5 grid grid-cols-2 gap-2 bg-sc-panel/70 p-2.5 rounded-lg border border-sc-border/50 text-xs font-mono">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Brut Introduit :</span>
                      <span className="text-slate-200 font-bold">{job.inputRawSCU} SCU ({job.purityPercentage}%)</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Raffiné Obtenu :</span>
                      <span className="text-emerald-400 font-bold text-sm">+{job.outputEstimatedSCU} SCU</span>
                    </div>
                    <div className="col-span-2 flex justify-between border-t border-slate-800/80 pt-1.5 mt-0.5 text-[11px]">
                      <span className="text-slate-400">Frais de raffinage :</span>
                      <span className="text-amber-400 font-bold">{job.costAUEC.toLocaleString('fr-FR')} aUEC</span>
                    </div>
                  </div>

                  {job.notes && (
                    <div className="mt-2 text-[11px] text-slate-400 font-mono italic">
                      &ldquo;{job.notes}&rdquo;
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-sc-border/60">
                  <button
                    onClick={() => setJobToDelete(job.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded transition-colors"
                    title="Supprimer la commande"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {job.status === 'in_progress' && !isFinished && (
                    <button
                      onClick={() => {
                        audio.playClick();
                        onFastForwardJob(job.id);
                      }}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800/90 hover:bg-slate-700 text-slate-300 text-[11px] font-mono flex items-center gap-1 transition-colors"
                      title="Terminer immédiatement le traitement"
                    >
                      <FastForward className="w-3.5 h-3.5 text-amber-400" />
                      <span>Terminer</span>
                    </button>
                  )}

                  {isFinished && job.status !== 'collected' ? (
                    <button
                      onClick={() => {
                        audio.playSuccess();
                        onCollectJob(job.id);
                      }}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold border border-emerald-400 shadow-neon-green text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all duration-200"
                    >
                      <PackageCheck className="w-4 h-4" />
                      <span>Collecter au Stock</span>
                    </button>
                  ) : job.status === 'collected' ? (
                    <span className="text-xs font-mono text-slate-500 flex items-center gap-1 py-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      Transféré au stock
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-sc-card/40 border border-sc-border/60 rounded-xl p-12 text-center">
          <Flame className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-300 font-sans uppercase">
            Aucun ordre de raffinage trouvé
          </h4>
          <p className="text-xs text-slate-500 font-mono mt-1 max-w-md mx-auto">
            Lancez un nouveau raffinage pour traiter vos cargaisons de minerais bruts.
          </p>
          <button
            onClick={() => {
              audio.playClick();
              setIsCalcModalOpen(true);
            }}
            className="mt-4 px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold font-mono text-xs uppercase"
          >
            Lancer un ordre de raffinage
          </button>
        </div>
      )}

      {/* Calculator Modal */}
      <RefineryCalculatorModal
        isOpen={isCalcModalOpen}
        onClose={() => {
          setIsCalcModalOpen(false);
          if (onClearPrefillCargo) onClearPrefillCargo();
        }}
        onStartJob={onStartJob}
        prefillCargo={prefillCargo}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={jobToDelete !== null}
        onClose={() => setJobToDelete(null)}
        onConfirm={() => {
          if (jobToDelete) {
            onDeleteJob(jobToDelete);
            setJobToDelete(null);
          }
        }}
        title="Supprimer l'ordre de raffinage ?"
        message="Êtes-vous sûr de vouloir supprimer cet ordre de raffinage ? Les minerais raffinés non collectés seront perdus."
      />
    </div>
  );
};

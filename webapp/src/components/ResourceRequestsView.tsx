import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { ResourceRequest } from '../types';
import { 
  Flame, 
  Plus, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Coins, 
  Users, 
  TrendingUp, 
  PackagePlus,
  AlertCircle,
  X,
  Sparkles
} from 'lucide-react';

interface ResourceRequestsViewProps {
  onOpenCreateModal?: () => void;
}

export const ResourceRequestsView: React.FC<ResourceRequestsViewProps> = ({ onOpenCreateModal }) => {
  const { resourceRequests, contributeToRequest } = useApp();
  const { currentUser, isHost } = useAuth();

  const [selectedRequest, setSelectedRequest] = useState<ResourceRequest | null>(null);
  const [contributionQuantity, setContributionQuantity] = useState<number>(10);
  const [successMsg, setSuccessMsg] = useState<boolean>(false);

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || !currentUser) return;

    const success = await contributeToRequest(selectedRequest.id, contributionQuantity);
    if (success) {
      setSuccessMsg(true);
      setTimeout(() => {
        setSelectedRequest(null);
        setSuccessMsg(false);
      }, 1400);
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'Critique':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-red-950/80 text-red-400 border border-red-500/40 animate-pulse">CRITIQUE</span>;
      case 'Urgent':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950/80 text-amber-400 border border-amber-500/40">URGENT</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950/80 text-cyan-400 border border-cyan-500/40">NORMAL</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="scifi-card rounded-xl p-6 relative overflow-hidden border-amber-500/30">
        <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-amber-400 font-mono text-xs uppercase tracking-widest">
              <Flame className="w-4 h-4" />
              <span>Quêtes d'Approvisionnement de la Guilde</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-orbitron font-bold text-white mt-1">
              Demandes de Ressources de l'Hôte
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl mt-1 font-rajdhani text-base">
              L'artisan sollicite les membres pour acheminer des minerais ou matériaux de récupération (RMC, Quantainium, Bexalite).
              Contribuez aux stocks pour débloquer les crafts et toucher vos primes en aUEC.
            </p>
          </div>

          {isHost && onOpenCreateModal && (
            <button
              onClick={onOpenCreateModal}
              className="px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-rajdhani font-bold text-sm flex items-center space-x-2 shadow-lg shadow-amber-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Publier une Demande de Minerais</span>
            </button>
          )}
        </div>
      </div>

      {/* Requests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {resourceRequests.map((req) => {
          const percent = Math.min(100, Math.round((req.collectedQuantity / req.targetQuantity) * 100));
          const isFulfilled = req.status === 'fulfilled' || percent >= 100;

          return (
            <div
              key={req.id}
              className={`scifi-card rounded-xl p-5 relative flex flex-col justify-between transition-all ${
                isFulfilled ? 'border-emerald-500/40 bg-emerald-950/20' : 'hover:border-amber-400/50'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="p-2 rounded-lg bg-slate-900 border border-slate-700">
                      <Flame className={`w-5 h-5 ${isFulfilled ? 'text-emerald-400' : 'text-amber-400'}`} />
                    </span>
                    <div>
                      <h3 className="font-orbitron font-bold text-base text-white">
                        {req.resourceName}
                      </h3>
                      <span className="text-[11px] font-mono text-slate-400">
                        Publié le {req.createdAt}
                      </span>
                    </div>
                  </div>

                  <div>{getUrgencyBadge(req.urgency)}</div>
                </div>

                {/* Progress Bar */}
                <div className="my-4 p-3 bg-slate-950/70 rounded-lg border border-slate-800">
                  <div className="flex justify-between items-center text-xs font-mono mb-1.5">
                    <span className="text-slate-300">Progression collecte :</span>
                    <span className="font-bold text-cyan-300">
                      {req.collectedQuantity} / {req.targetQuantity} {req.unit} ({percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${
                        isFulfilled
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                          : 'bg-gradient-to-r from-amber-500 to-yellow-400'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {/* Info Badges */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-4">
                  <div className="p-2 bg-slate-900/60 rounded border border-slate-800 flex items-center space-x-2 text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="truncate">{req.dropoffLocation}</span>
                  </div>
                  <div className="p-2 bg-slate-900/60 rounded border border-slate-800 flex items-center space-x-2 text-amber-400 justify-end">
                    <Coins className="w-3.5 h-3.5" />
                    <span className="font-bold">{req.rewardOrPriceUEC.toLocaleString()} aUEC / {req.unit}</span>
                  </div>
                </div>

                {/* Notes */}
                {req.notes && (
                  <p className="text-xs text-slate-300 bg-slate-900/40 p-2.5 rounded border border-slate-800/80 mb-4 italic">
                    « {req.notes} »
                  </p>
                )}

                {/* Contributors List */}
                {req.contributors && req.contributors.length > 0 && (
                  <div className="space-y-1 mb-4">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block flex items-center space-x-1">
                      <Users className="w-3 h-3 text-cyan-400" />
                      <span>Dernières contributions des joueurs :</span>
                    </span>
                    <div className="max-h-24 overflow-y-auto space-y-1">
                      {req.contributors.map((c, i) => (
                        <div
                          key={i}
                          className="flex justify-between text-[11px] font-mono py-1 px-2 rounded bg-slate-900/80 border border-slate-800/60 text-slate-300"
                        >
                          <span className="text-cyan-300 font-semibold">{c.userName}</span>
                          <span>+{c.quantity} {req.unit} ({c.timestamp})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-slate-800">
                {isFulfilled ? (
                  <div className="py-2 text-center text-xs font-mono text-emerald-400 font-bold flex items-center justify-center space-x-1 bg-emerald-950/40 rounded-lg border border-emerald-500/30">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>OBJECTIF DE RESSOURCES ATTEINT !</span>
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedRequest(req)}
                    className="w-full py-2.5 px-4 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-200 font-rajdhani font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-md shadow-amber-950"
                  >
                    <PackagePlus className="w-4 h-4 text-amber-400" />
                    <span>J'apporte du Stock ({req.resourceName})</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Contribution Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="scifi-card max-w-md w-full rounded-xl p-6 border-amber-500/50 shadow-2xl relative">
            <button
              onClick={() => setSelectedRequest(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-amber-950/80 rounded-lg border border-amber-500/40">
                <Flame className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h3 className="font-orbitron font-bold text-base text-white">
                  Déclarer un apport de ressources
                </h3>
                <span className="text-xs font-mono text-amber-400">
                  {selectedRequest.resourceName} ({selectedRequest.unit})
                </span>
              </div>
            </div>

            {successMsg ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="font-orbitron font-bold text-lg text-emerald-300">
                  Apport enregistré !
                </h4>
                <p className="text-xs text-slate-300">
                  L'Hôte a été notifié de votre livraison au point de rendez-vous ({selectedRequest.dropoffLocation}).
                </p>
              </div>
            ) : (
              <form onSubmit={handleContribute} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    Quantité acheminée ({selectedRequest.unit}) :
                  </label>
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => setContributionQuantity(Math.max(1, contributionQuantity - 5))}
                      className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-700 text-white font-bold hover:border-amber-500"
                    >
                      -5
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={contributionQuantity}
                      onChange={(e) => setContributionQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full text-center py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono font-bold text-base focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => setContributionQuantity(contributionQuantity + 5)}
                      className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-700 text-white font-bold hover:border-amber-500"
                    >
                      +5
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1 text-xs font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Lieu de dépôt :</span>
                    <span className="text-slate-200">{selectedRequest.dropoffLocation}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Rémunération estimée :</span>
                    <span className="text-amber-400 font-bold">
                      {(contributionQuantity * selectedRequest.rewardOrPriceUEC).toLocaleString()} aUEC
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-rajdhani font-bold text-sm shadow-lg shadow-amber-950 flex items-center justify-center space-x-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-black" />
                  <span>Valider mon Apport de Stock</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

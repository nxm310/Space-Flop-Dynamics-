import React from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { OrderStatus } from '../types';
import { 
  Package, 
  Clock, 
  MapPin, 
  Coins, 
  CheckCircle2, 
  Hourglass, 
  Hammer, 
  Truck, 
  XCircle,
  Tag,
  Gift
} from 'lucide-react';

export const PlayerOrdersView: React.FC = () => {
  const { orders } = useApp();
  const { currentUser, isHost } = useAuth();

  // If host, show all orders, otherwise show only current user's orders
  const displayedOrders = isHost
    ? orders
    : orders.filter(o => o.clientId === currentUser?.uid || o.clientName === currentUser?.displayName);

  const getStatusInfo = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return {
          label: 'En attente de validation',
          color: 'bg-amber-950/80 text-amber-400 border-amber-500/40',
          icon: <Hourglass className="w-4 h-4 text-amber-400" />
        };
      case 'accepted':
        return {
          label: 'Acceptée par l\'Artisan',
          color: 'bg-sky-950/80 text-sky-400 border-sky-500/40',
          icon: <CheckCircle2 className="w-4 h-4 text-sky-400" />
        };
      case 'crafting':
        return {
          label: 'En cours de fabrication',
          color: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50 animate-pulse',
          icon: <Hammer className="w-4 h-4 text-cyan-400" />
        };
      case 'ready':
        return {
          label: 'Prêt pour remise en station',
          color: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50',
          icon: <Truck className="w-4 h-4 text-emerald-400" />
        };
      case 'delivered':
        return {
          label: 'Livré & Clôturé',
          color: 'bg-slate-800 text-slate-400 border-slate-700',
          icon: <CheckCircle2 className="w-4 h-4 text-slate-400" />
        };
      case 'cancelled':
        return {
          label: 'Annulée',
          color: 'bg-rose-950/80 text-rose-400 border-rose-500/40',
          icon: <XCircle className="w-4 h-4 text-rose-400" />
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="scifi-card rounded-xl p-6 relative overflow-hidden border-sky-500/30">
        <div className="flex items-center space-x-2 text-sky-400 font-mono text-xs uppercase tracking-widest">
          <Package className="w-4 h-4" />
          <span>Suivi Logistique & Ordres de Fabrication</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-orbitron font-bold text-white mt-1">
          {isHost ? 'Toutes les Commandes de la Guilde' : 'Mes Commandes de Craft'}
        </h1>
        <p className="text-sm text-slate-300 mt-1 font-rajdhani text-base">
          Suivez l'état d'avancement de la fabrication et le détail des tarifs avec remises accordées.
        </p>
      </div>

      {/* Orders List */}
      {displayedOrders.length === 0 ? (
        <div className="scifi-card rounded-xl p-12 text-center space-y-3">
          <Package className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="font-orbitron font-semibold text-lg text-slate-300">
            Aucune commande enregistrée
          </h3>
          <p className="text-xs text-slate-400 font-mono">
            Rendez-vous dans l'onglet « Plans de l'Hôte » pour sélectionner un objet et passer commande.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedOrders.map((ord) => {
            const statusInfo = getStatusInfo(ord.status);
            const basePrice = ord.baseFeeUEC || ord.totalFeeUEC;
            const hasDiscount = ord.totalFeeUEC < basePrice;

            return (
              <div
                key={ord.id}
                className="scifi-card rounded-xl p-5 border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left side details */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-orbitron font-bold text-base text-white">
                      {ord.quantity}x {ord.blueprintName}
                    </span>
                    <span
                      className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono border ${statusInfo.color}`}
                    >
                      {statusInfo.icon}
                      <span>{statusInfo.label}</span>
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Commandé le : {ord.createdAt}</span>
                    </span>
                    <span className="flex items-center space-x-1 text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      <span>Lieu : {ord.deliveryLocation}</span>
                    </span>

                    {/* Mineral Quality Badge */}
                    <span className={`px-2 py-0.2 rounded border text-[10px] font-bold ${
                      ord.mineralQuality === 'maximum_purity'
                        ? 'bg-purple-950/80 text-purple-300 border-purple-500/40'
                        : ord.mineralQuality === 'high_grade'
                        ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      💎 {ord.mineralQuality === 'maximum_purity' ? 'Pureté Maximale (x1.5)' : ord.mineralQuality === 'high_grade' ? 'Haute Qualité (x1.25)' : 'Qualité Standard'}
                    </span>

                    {ord.userProvidesMaterials && (
                      <span className="px-2 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 text-[10px]">
                        Minerais fournis par le client
                      </span>
                    )}
                  </div>

                  {ord.notes && (
                    <div className="text-xs text-slate-300 bg-slate-900/60 p-2 rounded border border-slate-800/80 italic">
                      Note : « {ord.notes} »
                    </div>
                  )}

                  {isHost && (
                    <div className="text-[11px] font-mono text-cyan-400">
                      Client : <span className="font-bold text-white">{ord.clientName}</span> ({ord.clientEmail || 'Discord'})
                    </div>
                  )}
                </div>

                {/* Right side pricing & discount display */}
                <div className="flex flex-col md:items-end justify-between border-t md:border-t-0 pt-3 md:pt-0 border-slate-800 space-y-1">
                  {hasDiscount && (
                    <div className="flex items-center space-x-2 text-xs font-mono">
                      <span className="text-slate-500 line-through">
                        {basePrice.toLocaleString()} aUEC
                      </span>
                      <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                        {ord.discountReason || (ord.totalFeeUEC === 0 ? 'OFFERT (100%)' : 'REMISE')}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center space-x-1 text-base font-orbitron font-bold text-amber-400">
                    <Coins className="w-4 h-4" />
                    <span>
                      {ord.totalFeeUEC === 0 ? '0 aUEC (OFFERT)' : `${ord.totalFeeUEC.toLocaleString()} aUEC`}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-slate-500">
                    ID : #{ord.id}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

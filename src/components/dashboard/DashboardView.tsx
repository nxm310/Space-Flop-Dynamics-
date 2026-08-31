import React from 'react';
import {
  RawCargoItem,
  RefinedStockItem,
  RefineryJob,
  CustomerOrder,
  Blueprint
} from '../../types';
import { STAR_CITIZEN_MINERALS } from '../../data/mineralsData';
import { StatCard } from '../common/StatCard';
import { OrderStatusBadge, Badge } from '../common/Badge';
import {
  Pickaxe,
  Flame,
  Boxes,
  ClipboardList,
  Scroll,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { audio } from '../../services/audioService';

interface DashboardViewProps {
  rawCargo: RawCargoItem[];
  refinedStock: RefinedStockItem[];
  refineryJobs: RefineryJob[];
  orders: CustomerOrder[];
  blueprints: Blueprint[];
  onNavigateTab: (tabId: string) => void;
  onOpenRawModal: () => void;
  onOpenRefineryModal: () => void;
  onOpenOrderModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  rawCargo,
  refinedStock,
  refineryJobs,
  orders,
  blueprints,
  onNavigateTab,
  onOpenRawModal,
  onOpenRefineryModal,
  onOpenOrderModal
}) => {
  // Calculations
  const totalRawSCU = rawCargo.reduce((acc, c) => acc + c.quantitySCU, 0);
  const totalRefinedSCU = refinedStock.reduce((acc, s) => acc + s.quantitySCU, 0);
  const personalStockSCU = refinedStock.filter(s => s.ownerType === 'personal').reduce((acc, s) => acc + s.quantitySCU, 0);
  const clientStockSCU = refinedStock.filter(s => s.ownerType === 'client').reduce((acc, s) => acc + s.quantitySCU, 0);

  const totalStockValueAUEC = refinedStock.reduce((acc, s) => {
    const min = STAR_CITIZEN_MINERALS.find(m => m.id === s.mineralId);
    return acc + Math.round(s.quantitySCU * 100 * (min?.basePriceAUEC || 15));
  }, 0);

  const activeRefiningJobs = refineryJobs.filter(j => j.status === 'in_progress');
  const readyToCollectJobs = refineryJobs.filter(j => j.status === 'completed' || (j.status === 'in_progress' && new Date(j.completesAt).getTime() <= Date.now()));

  const activeOrders = orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled');
  const readyOrders = orders.filter(o => o.status === 'ready');

  // Consolidated top minerals
  const topConsolidatedMinerals = React.useMemo(() => {
    const map = new Map<string, { mineralName: string; totalQty: number; lotCount: number }>();
    refinedStock.forEach(item => {
      if (!map.has(item.mineralName)) {
        map.set(item.mineralName, { mineralName: item.mineralName, totalQty: 0, lotCount: 0 });
      }
      const e = map.get(item.mineralName)!;
      e.totalQty += item.quantitySCU;
      e.lotCount += 1;
    });
    return Array.from(map.values()).sort((a, b) => b.totalQty - a.totalQty).slice(0, 6);
  }, [refinedStock]);

  const maxStockQuantity = topConsolidatedMinerals.length > 0 ? topConsolidatedMinerals[0].totalQty : 1;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-sc-panel via-sc-card to-slate-900 border border-sc-cyan/30 p-6 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-sc-cyan tracking-wider uppercase mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Système Opérationnel • Star Citizen 4.0 Ready</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-sans text-slate-100 tracking-wide uppercase">
              Tableau de Bord Minier & Fabrication
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-sans mt-1 max-w-2xl">
              Supervisez l'ensemble de votre chaîne de production : de l'extraction des filons au raffinage et à la livraison des commandes d'armement et composants.
            </p>
          </div>

          {/* Quick Action Pills */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                audio.playClick();
                onOpenRawModal();
              }}
              className="px-3.5 py-2 rounded-xl bg-sc-cyan/15 hover:bg-sc-cyan text-sc-cyan hover:text-slate-950 border border-sc-cyan/40 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all duration-200"
            >
              <Pickaxe className="w-4 h-4" />
              <span>Minage Brut</span>
            </button>

            <button
              onClick={() => {
                audio.playClick();
                onOpenRefineryModal();
              }}
              className="px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/40 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all duration-200"
            >
              <Flame className="w-4 h-4" />
              <span>Raffinerie</span>
            </button>

            <button
              onClick={() => {
                audio.playClick();
                onOpenOrderModal();
              }}
              className="px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 border border-emerald-500/40 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all duration-200"
            >
              <ClipboardList className="w-4 h-4" />
              <span>Nouvelle Commande</span>
            </button>
          </div>
        </div>

        {/* Ambient Glowing HUD Line */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-sc-cyan via-sc-gold to-emerald-400 opacity-60" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Minerais Bruts en Soute"
          value={`${totalRawSCU.toFixed(1)} SCU`}
          subValue={`${rawCargo.length} cargaison(s) en attente`}
          icon={<Pickaxe className="w-5 h-5" />}
          accent="cyan"
          onClick={() => onNavigateTab('mining')}
        />

        <StatCard
          title="Raffinages en Cours"
          value={activeRefiningJobs.length}
          subValue={readyToCollectJobs.length > 0 ? `${readyToCollectJobs.length} prêt(s) à collecter` : 'Minuteurs en cours'}
          icon={<Flame className="w-5 h-5" />}
          accent="gold"
          onClick={() => onNavigateTab('refinery')}
        />

        <StatCard
          title="Stock Raffiné Disponible"
          value={`${totalRefinedSCU.toFixed(1)} SCU`}
          subValue={`Valeur ~${totalStockValueAUEC.toLocaleString('fr-FR')} aUEC`}
          icon={<Boxes className="w-5 h-5" />}
          accent="green"
          onClick={() => onNavigateTab('inventory')}
        />

        <StatCard
          title="Commandes Clients Actives"
          value={activeOrders.length}
          subValue={readyOrders.length > 0 ? `${readyOrders.length} prête(s) à livrer` : 'En fabrication'}
          icon={<ClipboardList className="w-5 h-5" />}
          accent="purple"
          onClick={() => onNavigateTab('orders')}
        />
      </div>

      {/* Two Column Layout: Alerts / Jobs & Stock Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT 2 COLS: Active Refining & Pending Orders */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Refining Alerts */}
          <div className="bg-sc-card border border-sc-border rounded-xl p-5 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold font-sans text-slate-100 uppercase">
                  Sessions de Raffinage en Cours
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('refinery')}
                className="text-xs font-mono text-sc-cyan hover:underline flex items-center gap-1 uppercase"
              >
                <span>Voir tout</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {refineryJobs.length > 0 ? (
              <div className="space-y-2.5">
                {refineryJobs.slice(0, 3).map(job => {
                  const isDone = job.status === 'completed' || (job.status === 'in_progress' && new Date(job.completesAt).getTime() <= Date.now());

                  return (
                    <div
                      key={job.id}
                      onClick={() => onNavigateTab('refinery')}
                      className="p-3 bg-sc-panel/80 hover:bg-sc-panel rounded-xl border border-sc-border hover:border-amber-500/50 cursor-pointer flex items-center justify-between gap-3 text-xs font-mono transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isDone ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                          <Flame className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-100">{job.mineralName}</span>
                            <span className="text-[10px] text-slate-500">({job.refineryStationName})</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Rendement : +{job.outputEstimatedSCU} SCU • Méthode : {job.methodName}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        {job.status === 'collected' ? (
                          <Badge variant="slate" size="sm">Collecté</Badge>
                        ) : isDone ? (
                          <Badge variant="green" size="sm">Prêt</Badge>
                        ) : (
                          <Badge variant="gold" size="sm">En cours</Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs font-mono text-slate-500 py-4 text-center">
                Aucun raffinage en cours actuellement.
              </p>
            )}
          </div>

          {/* Pending Orders Section */}
          <div className="bg-sc-card border border-sc-border rounded-xl p-5 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-sc-cyan" />
                <h3 className="text-base font-bold font-sans text-slate-100 uppercase">
                  Commandes en Cours de Traitement
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('orders')}
                className="text-xs font-mono text-sc-cyan hover:underline flex items-center gap-1 uppercase"
              >
                <span>Voir le carnet</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {orders.length > 0 ? (
              <div className="space-y-2.5">
                {orders.slice(0, 3).map(order => (
                  <div
                    key={order.id}
                    onClick={() => onNavigateTab('orders')}
                    className="p-3 bg-sc-panel/80 hover:bg-sc-panel rounded-xl border border-sc-border hover:border-sc-cyan/50 cursor-pointer flex items-center justify-between gap-3 text-xs font-mono transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500">{order.orderNumber}</span>
                        <span className="font-bold text-slate-100">{order.clientName}</span>
                        {order.clientOrg && <span className="text-slate-400">({order.clientOrg})</span>}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                        {order.items.map(i => `${i.quantity}x ${i.blueprintName}`).join(', ')}
                      </p>
                    </div>

                    <div className="text-right flex flex-col items-end gap-1">
                      <OrderStatusBadge status={order.status} />
                      <span className="text-emerald-400 font-bold">{order.totalPriceAUEC.toLocaleString('fr-FR')} aUEC</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs font-mono text-slate-500 py-4 text-center">
                Aucune commande enregistrée.
              </p>
            )}
          </div>
        </div>

        {/* RIGHT 1 COL: Stock Distribution & Blueprints Quick Access */}
        <div className="space-y-6">
          {/* Stock Distribution Chart */}
          <div className="bg-sc-card border border-sc-border rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Boxes className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold font-sans text-slate-100 uppercase">
                  Top Réserves Minérales
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('inventory')}
                className="text-xs font-mono text-sc-cyan hover:underline flex items-center gap-1 uppercase"
              >
                <span>Stock</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {topConsolidatedMinerals.length > 0 ? (
              <div className="space-y-3 font-mono">
                {topConsolidatedMinerals.map(item => {
                  const pct = Math.min(100, Math.max(8, (item.totalQty / maxStockQuantity) * 100));

                  return (
                    <div key={item.mineralName} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-200 font-semibold flex items-center gap-1.5">
                          <span>{item.mineralName}</span>
                          <span className="text-[10px] text-slate-500 font-normal">({item.lotCount} lots)</span>
                        </span>
                        <span className="text-sc-cyan font-bold">{item.totalQty.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} SCU</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="h-full bg-gradient-to-r from-sc-cyan to-emerald-400 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs font-mono text-slate-500 py-4 text-center">
                Stock vide.
              </p>
            )}

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Stock Perso : <strong className="text-sc-cyan">{personalStockSCU.toFixed(1)} SCU</strong></span>
              <span className="text-slate-400">Dépôts : <strong className="text-amber-400">{clientStockSCU.toFixed(1)} SCU</strong></span>
            </div>
          </div>

          {/* Blueprints Quick Access Card */}
          <div className="bg-sc-card border border-sc-border rounded-xl p-5 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Scroll className="w-5 h-5 text-sc-cyan" />
                <h3 className="text-base font-bold font-sans text-slate-100 uppercase">
                  Atelier & Recettes
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400">{blueprints.length} plans</span>
            </div>

            <p className="text-xs text-slate-300 font-sans">
              Recherchez parmi les plans officiels pour fabriquer des armes lasers, snipers FPS, boucliers militaires et propulseurs de saut.
            </p>

            <button
              onClick={() => onNavigateTab('blueprints')}
              className="w-full py-2.5 rounded-lg bg-sc-panel hover:bg-slate-800 border border-sc-cyan/40 hover:border-sc-cyan text-sc-cyan font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200"
            >
              <Scroll className="w-4 h-4" />
              <span>Ouvrir le Catalogue de Plans</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

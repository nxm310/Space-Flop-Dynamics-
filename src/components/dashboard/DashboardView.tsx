import React from 'react';
import {
  RefinedStockItem,
  CustomerOrder,
  Blueprint
} from '../../types';
import { STAR_CITIZEN_MINERALS } from '../../data/mineralsData';
import { StatCard } from '../common/StatCard';
import { OrderStatusBadge } from '../common/Badge';
import {
  Boxes,
  ClipboardList,
  Scroll,
  ArrowRight,
  Sparkles,
  Coins,
  Users,
  Plus,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { audio } from '../../services/audioService';

interface DashboardViewProps {
  refinedStock: RefinedStockItem[];
  orders: CustomerOrder[];
  blueprints: Blueprint[];
  onNavigateTab: (tabId: string) => void;
  onOpenOrderModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  refinedStock,
  orders,
  blueprints,
  onNavigateTab,
  onOpenOrderModal
}) => {
  // Calculations
  const totalRefinedSCU = refinedStock.reduce((acc, s) => acc + s.quantitySCU, 0);
  const personalStockSCU = refinedStock.filter(s => s.ownerType === 'personal').reduce((acc, s) => acc + s.quantitySCU, 0);
  const clientStockSCU = refinedStock.filter(s => s.ownerType === 'client').reduce((acc, s) => acc + s.quantitySCU, 0);

  const totalStockValueAUEC = refinedStock.reduce((acc, s) => {
    const min = STAR_CITIZEN_MINERALS.find(m => m.id === s.mineralId || m.name.toLowerCase() === s.mineralName.toLowerCase());
    return acc + Math.round(s.quantitySCU * 100 * (min?.basePriceAUEC || 15));
  }, 0);

  const activeOrders = orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled');
  const readyOrders = orders.filter(o => o.status === 'ready');
  const completedOrders = orders.filter(o => o.status === 'completed');
  const totalCompletedAUEC = completedOrders.reduce((acc, o) => acc + o.totalPriceAUEC, 0);

  // Consolidated top minerals
  const topConsolidatedMinerals = React.useMemo(() => {
    const map = new Map<string, { mineralName: string; totalQty: number; lotCount: number; valueAUEC: number }>();
    refinedStock.forEach(item => {
      const min = STAR_CITIZEN_MINERALS.find(m => m.id === item.mineralId || m.name.toLowerCase() === item.mineralName.toLowerCase());
      const itemVal = Math.round(item.quantitySCU * 100 * (min?.basePriceAUEC || 15));

      if (!map.has(item.mineralName)) {
        map.set(item.mineralName, { mineralName: item.mineralName, totalQty: 0, lotCount: 0, valueAUEC: 0 });
      }
      const e = map.get(item.mineralName)!;
      e.totalQty += item.quantitySCU;
      e.lotCount += 1;
      e.valueAUEC += itemVal;
    });
    return Array.from(map.values()).sort((a, b) => b.totalQty - a.totalQty).slice(0, 6);
  }, [refinedStock]);

  const maxStockQuantity = topConsolidatedMinerals.length > 0 ? topConsolidatedMinerals[0].totalQty : 1;

  return (
    <div className="space-y-6 font-sans">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-sc-panel via-sc-card to-slate-900 border border-sc-cyan/30 p-6 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-sc-cyan tracking-wider uppercase mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Système Opérationnel • Star Citizen 4.10+ LIVE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-sans text-slate-100 tracking-wide uppercase">
              Tableau de Bord Minerais & Fabrication
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-sans mt-1 max-w-2xl">
              Gérez votre stock de minerais raffinés, consultez vos blueprints et pilotez vos commandes clients avec calcul de rentabilité en aUEC.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                audio.playClick();
                onNavigateTab('inventory');
              }}
              className="px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 border border-emerald-500/40 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all duration-200"
            >
              <Boxes className="w-4 h-4" />
              <span>Gérer le Stock</span>
            </button>

            <button
              onClick={() => {
                audio.playClick();
                onNavigateTab('blueprints');
              }}
              className="px-3.5 py-2 rounded-xl bg-sc-cyan/15 hover:bg-sc-cyan text-sc-cyan hover:text-slate-950 border border-sc-cyan/40 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all duration-200"
            >
              <Scroll className="w-4 h-4" />
              <span>Atelier Blueprints</span>
            </button>

            <button
              onClick={() => {
                audio.playClick();
                onOpenOrderModal();
              }}
              className="px-3.5 py-2 rounded-xl bg-sc-cyan text-slate-950 font-bold border border-sc-cyan shadow-neon-cyan text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 hover:bg-cyan-400 transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              <span>Nouvelle Commande</span>
            </button>
          </div>
        </div>

        {/* Ambient Glowing HUD Line */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-sc-cyan via-sc-gold to-emerald-400 opacity-60" />
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Stock Raffiné Total"
          value={`${totalRefinedSCU.toFixed(1)} SCU`}
          subValue={`Valeur ~${totalStockValueAUEC.toLocaleString('fr-FR')} aUEC`}
          icon={<Boxes className="w-5 h-5" />}
          accent="green"
          onClick={() => onNavigateTab('inventory')}
        />

        <StatCard
          title="Stock Personnel (Craft)"
          value={`${personalStockSCU.toFixed(1)} SCU`}
          subValue="Disponible pour fabrication"
          icon={<ShieldCheck className="w-5 h-5" />}
          accent="cyan"
          onClick={() => onNavigateTab('inventory')}
        />

        <StatCard
          title="Dépôts Minerais Clients"
          value={`${clientStockSCU.toFixed(1)} SCU`}
          subValue="Apportés par vos clients"
          icon={<TrendingUp className="w-5 h-5" />}
          accent="gold"
          onClick={() => onNavigateTab('inventory')}
        />

        <StatCard
          title="Commandes Clients Actives"
          value={activeOrders.length}
          subValue={readyOrders.length > 0 ? `${readyOrders.length} prête(s) à livrer` : `${completedOrders.length} livrée(s)`}
          icon={<ClipboardList className="w-5 h-5" />}
          accent="purple"
          onClick={() => onNavigateTab('orders')}
        />
      </div>

      {/* Two Column Layout: Top Minerals & Active Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT 2 COLS: Top Minerals & Active Orders */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Top Minerals Distribution Card */}
          <div className="bg-sc-card border border-sc-border rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Boxes className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold font-sans text-slate-100 uppercase">
                  Réserves Minérales & Valorisation
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('inventory')}
                className="text-xs font-mono text-sc-cyan hover:underline flex items-center gap-1 uppercase"
              >
                <span>Voir le Stock Complet</span>
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
                          <span className="text-[10px] text-slate-500 font-normal">({item.lotCount} lot{item.lotCount > 1 ? 's' : ''})</span>
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-400 text-[11px]">~{item.valueAUEC.toLocaleString('fr-FR')} aUEC</span>
                          <span className="text-sc-cyan font-bold">{item.totalQty.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} SCU</span>
                        </div>
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
              <div className="py-6 text-center text-slate-500 font-mono space-y-1">
                <p>Aucun minerai raffiné en stock pour le moment.</p>
                <p className="text-[11px] text-slate-600">Importez ou ajoutez des lots dans l'onglet Stock Minerais.</p>
              </div>
            )}

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Stock Perso : <strong className="text-sc-cyan">{personalStockSCU.toFixed(1)} SCU</strong></span>
              <span className="text-slate-400">Dépôts Clients : <strong className="text-amber-400">{clientStockSCU.toFixed(1)} SCU</strong></span>
            </div>
          </div>

          {/* Pending Orders Section */}
          <div className="bg-sc-card border border-sc-border rounded-xl p-5 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-sc-cyan" />
                <h3 className="text-base font-bold font-sans text-slate-100 uppercase">
                  Commandes Clients Récentes
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
                {orders.slice(0, 4).map(order => (
                  <div
                    key={order.id}
                    onClick={() => onNavigateTab('orders')}
                    className="p-3 bg-sc-panel/80 hover:bg-sc-panel rounded-xl border border-sc-border hover:border-sc-cyan/50 cursor-pointer flex items-center justify-between gap-3 text-xs font-mono transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 font-bold">{order.orderNumber}</span>
                        <span className="font-bold text-slate-100">{order.clientName}</span>
                        {order.clientOrg && <span className="text-cyan-400 text-[11px]">({order.clientOrg})</span>}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                        {order.items.map(i => `${i.quantity}x ${i.blueprintName}`).join(', ')}
                      </p>
                    </div>

                    <div className="text-right flex flex-col items-end gap-1 shrink-0">
                      <OrderStatusBadge status={order.status} />
                      <span className="text-emerald-400 font-bold">{order.totalPriceAUEC.toLocaleString('fr-FR')} aUEC</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs font-mono text-slate-500 py-4 text-center">
                Aucune commande enregistrée. Cliquez sur "Nouvelle Commande" pour commencer.
              </p>
            )}
          </div>
        </div>

        {/* RIGHT 1 COL: Blueprints & Quick Summary */}
        <div className="space-y-6">
          {/* Blueprints Quick Access Card */}
          <div className="bg-sc-card border border-sc-border rounded-xl p-5 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Scroll className="w-5 h-5 text-sc-cyan" />
                <h3 className="text-base font-bold font-sans text-slate-100 uppercase">
                  Atelier & Blueprints
                </h3>
              </div>
              <span className="text-xs font-mono text-sc-cyan font-bold">{blueprints.length} plans</span>
            </div>

            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              Consultez le catalogue avec filtrage par sous-composants (Quantum Drives, Boucliers, Génératrices, Gatlings AD4B/AD5B, Armures, Outils) et fabriquez vos items à partir de votre stock.
            </p>

            <button
              onClick={() => onNavigateTab('blueprints')}
              className="w-full py-2.5 rounded-lg bg-sc-panel hover:bg-slate-800 border border-sc-cyan/40 hover:border-sc-cyan text-sc-cyan font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200"
            >
              <Scroll className="w-4 h-4" />
              <span>Ouvrir l'Atelier de Plans</span>
            </button>
          </div>

          {/* Quick Commerce Card */}
          <div className="bg-sc-card border border-sc-border rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Coins className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold font-sans text-slate-100 uppercase">
                Bilan Commercial
              </h3>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between p-2 rounded-lg bg-sc-panel border border-slate-800/80">
                <span className="text-slate-400">Valeur totale stock :</span>
                <span className="text-emerald-400 font-bold">~{totalStockValueAUEC.toLocaleString('fr-FR')} aUEC</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-sc-panel border border-slate-800/80">
                <span className="text-slate-400">Total commandes livrées :</span>
                <span className="text-sc-cyan font-bold">{totalCompletedAUEC.toLocaleString('fr-FR')} aUEC</span>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('orders')}
              className="w-full py-2 rounded-lg bg-sc-panel hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
            >
              <Users className="w-4 h-4 text-purple-400" />
              <span>Consulter le Répertoire Clients</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

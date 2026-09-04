import React, { useState, useMemo } from 'react';
import { CustomerOrder, RefinedStockItem } from '../../types';
import { calculateMissingMinerals } from '../../services/missingMineralsService';
import {
  AlertTriangle,
  CheckCircle2,
  Search,
  Plus,
  Boxes
} from 'lucide-react';
import { audio } from '../../services/audioService';

interface MissingMineralsListViewProps {
  orders: CustomerOrder[];
  stock: RefinedStockItem[];
  onQuickAddStock?: (mineralId: string, mineralName: string) => void;
  onSelectOrder?: (orderId: string) => void;
  onNavigateToTab?: (tab: string) => void;
}

export const MissingMineralsListView: React.FC<MissingMineralsListViewProps> = ({
  orders,
  stock,
  onQuickAddStock,
  onSelectOrder,
  onNavigateToTab
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Calculate missing minerals from personal stock
  const report = useMemo(() => {
    return calculateMissingMinerals(orders, stock);
  }, [orders, stock]);

  // 2. Filter list based on search query
  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return report.missingMinerals;
    const q = searchQuery.toLowerCase().trim();
    return report.missingMinerals.filter(m =>
      m.mineralName.toLowerCase().includes(q) ||
      m.group.toLowerCase().includes(q) ||
      m.affectedOrders.some(o => o.orderNumber.toLowerCase().includes(q) || o.clientName.toLowerCase().includes(q))
    );
  }, [report.missingMinerals, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Top Header / Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-sc-card/90 border border-sc-border rounded-xl p-3.5">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
            report.totalMissingTypesCount > 0
              ? 'bg-rose-500/15 border border-rose-500/40 text-rose-400'
              : 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-400'
          }`}>
            {report.totalMissingTypesCount > 0 ? (
              <AlertTriangle className="w-4 h-4" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm sm:text-base text-slate-100 uppercase tracking-wide">
                Bilan des Minerais Manquants
              </h3>
              <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                report.totalMissingTypesCount > 0
                  ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                  : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
              }`}>
                {report.totalMissingTypesCount > 0
                  ? `${report.totalMissingTypesCount} minerai(s) en déficit`
                  : 'Stock complet (0 manque)'}
              </span>
            </div>
            <p className="text-xs font-mono text-slate-400">
              Source : Comparaison de votre <strong>stock personnel</strong> face aux {report.activeOrdersCount} commande(s) active(s).
            </p>
          </div>
        </div>

        {/* Search bar if multiple items */}
        {report.missingMinerals.length > 3 && (
          <div className="relative min-w-[200px] max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Filtrer minerai, commande..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 bg-[#090e18] border border-sc-border focus:border-sc-cyan rounded-lg text-xs font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* Main List Table */}
      {report.missingMinerals.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-sc-border bg-sc-card shadow-xl">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-sc-border bg-[#090e18] text-slate-400 uppercase tracking-wider text-[11px] select-none">
                <th className="py-2.5 px-3 font-semibold w-10 text-center">#</th>
                <th className="py-2.5 px-3 font-semibold">Minerai Requis</th>
                <th className="py-2.5 px-3 font-semibold text-right text-rose-400">Manquant (Déficit)</th>
                <th className="py-2.5 px-3 font-semibold text-right text-emerald-400">En Stock Perso</th>
                <th className="py-2.5 px-3 font-semibold text-right">Besoin Total Net</th>
                <th className="py-2.5 px-3 font-semibold">Commandes Impactées</th>
                {onQuickAddStock && (
                  <th className="py-2.5 px-3 font-semibold text-center w-28">Action</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredList.map((m, idx) => (
                <tr
                  key={m.mineralId}
                  className="hover:bg-slate-800/40 transition-colors group"
                >
                  {/* # */}
                  <td className="py-3 px-3 text-center text-slate-500 font-bold">
                    {idx + 1}
                  </td>

                  {/* Mineral Name & Group */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                        <Boxes className="w-3.5 h-3.5 text-sc-cyan" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-100 group-hover:text-sc-cyan transition-colors block">
                          {m.mineralName}
                        </span>
                        <span className="text-[10px] text-slate-500 uppercase">
                          {m.group}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Missing Deficit */}
                  <td className="py-3 px-3 text-right font-bold text-rose-400">
                    <span className="text-sm">-{m.missingSCU} SCU</span>
                    <span className="text-[10px] text-rose-500/80 block font-normal">
                      ({Math.round(m.missingSCU * 100).toLocaleString('fr-FR')} cSCU)
                    </span>
                  </td>

                  {/* Personal Stock */}
                  <td className="py-3 px-3 text-right text-emerald-400 font-semibold">
                    <span>{m.personalStockSCU} SCU</span>
                  </td>

                  {/* Net Needed */}
                  <td className="py-3 px-3 text-right text-slate-300">
                    <span>{m.personalNeededSCU} SCU</span>
                    {m.totalClientSuppliedSCU > 0 && (
                      <span className="text-[10px] text-amber-400 block" title="Dépôt client déduit">
                        (+{m.totalClientSuppliedSCU} client)
                      </span>
                    )}
                  </td>

                  {/* Affected Orders */}
                  <td className="py-3 px-3">
                    <div className="flex flex-wrap items-center gap-1.5 max-w-md">
                      {m.affectedOrders.map((ord) => (
                        <button
                          key={ord.orderId}
                          type="button"
                          onClick={() => {
                            audio.playClick();
                            if (onSelectOrder) {
                              onSelectOrder(ord.orderId);
                            } else if (onNavigateToTab) {
                              onNavigateToTab('orders');
                            }
                          }}
                          className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 hover:border-sc-cyan/60 text-[11px] text-slate-300 hover:text-sc-cyan flex items-center gap-1 transition-colors"
                          title={`Commande ${ord.orderNumber} (${ord.clientName}) : besoin de ${ord.personalNeededSCU} SCU`}
                        >
                          <span className="font-bold">{ord.orderNumber}</span>
                          <span className="text-rose-400 text-[10px]">({ord.personalNeededSCU} SCU)</span>
                        </button>
                      ))}
                    </div>
                  </td>

                  {/* Quick Action */}
                  {onQuickAddStock && (
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          audio.playClick();
                          onQuickAddStock(m.mineralId, m.mineralName);
                        }}
                        className="px-2.5 py-1 rounded bg-sc-cyan hover:bg-cyan-400 text-slate-950 font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1 shadow-neon-cyan/20 transition-all mx-auto"
                        title="Ajouter du stock pour ce minerai"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Ajouter</span>
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Table Footer Summary */}
          <div className="p-3 bg-[#090e18] border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-400">
            <span>
              Total manquant cumulé : <strong className="text-rose-400 font-bold">-{report.totalMissingSCU} SCU</strong> ({Math.round(report.totalMissingSCU * 100).toLocaleString('fr-FR')} cSCU)
            </span>
            <span>
              Impacte <strong className="text-slate-200">{report.totalAffectedOrdersCount}</strong> commande(s) client
            </span>
          </div>
        </div>
      ) : (
        /* Empty state: 100% available */
        <div className="bg-sc-card/60 border border-emerald-500/40 rounded-xl p-8 text-center space-y-3 shadow-neon-green/10">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400 shadow-neon-green">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h4 className="text-lg font-bold font-sans text-emerald-300 uppercase tracking-wide">
            Aucun minerai manquant !
          </h4>
          <p className="text-xs font-mono text-slate-300 max-w-lg mx-auto leading-relaxed">
            Votre stock personnel et les dépôts clients couvrent <strong className="text-emerald-400">100% des matières premières</strong> nécessaires pour la totalité des <strong className="text-slate-100">{report.activeOrdersCount} commande(s) en cours</strong>.
          </p>
        </div>
      )}
    </div>
  );
};

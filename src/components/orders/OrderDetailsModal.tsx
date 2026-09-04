import React from 'react';
import { Modal } from '../common/Modal';
import { Badge, OrderStatusBadge } from '../common/Badge';
import { CustomerOrder, RefinedStockItem, OrderStatus } from '../../types';
import confetti from 'canvas-confetti';
import {
  ClipboardList,
  User,
  Building,
  Mail,
  Calendar,
  Hammer,
  CheckCircle2,
  AlertCircle,
  PackageCheck,
  Layers,
  Edit
} from 'lucide-react';
import { audio } from '../../services/audioService';

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: CustomerOrder | null;
  stock: RefinedStockItem[];
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onExecuteFabrication: (order: CustomerOrder) => void;
  onTogglePaid: (orderId: string) => void;
  onEditOrder?: (order: CustomerOrder) => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  isOpen,
  onClose,
  order,
  stock,
  onUpdateStatus,
  onExecuteFabrication,
  onTogglePaid,
  onEditOrder
}) => {
  if (!order) return null;

  // Calculate mineral breakdown
  const requirementsSummary: Record<string, { name: string; required: number; clientSupplied: number; personalNeeded: number; personalAvailable: number; hasEnough: boolean }> = {};

  order.items.forEach(item => {
    item.requiredIngredients.forEach(ing => {
      const key = ing.resourceId;
      const totalReq = ing.quantitySCU * item.quantity;
      if (!requirementsSummary[key]) {
        requirementsSummary[key] = {
          name: ing.resourceName,
          required: totalReq,
          clientSupplied: 0,
          personalNeeded: 0,
          personalAvailable: 0,
          hasEnough: false
        };
      } else {
        requirementsSummary[key].required += totalReq;
      }
    });
  });

  // Client supplied minerals
  order.clientSuppliedMinerals.forEach(dep => {
    if (requirementsSummary[dep.mineralId]) {
      requirementsSummary[dep.mineralId].clientSupplied += dep.quantitySCU;
    } else {
      requirementsSummary[dep.mineralId] = {
        name: dep.mineralName,
        required: 0,
        clientSupplied: dep.quantitySCU,
        personalNeeded: 0,
        personalAvailable: 0,
        hasEnough: true
      };
    }
  });

  // Check personal stock availability for the remainder
  let allResourcesAvailable = true;
  Object.keys(requirementsSummary).forEach(key => {
    const item = requirementsSummary[key];
    item.personalNeeded = Math.max(0, item.required - item.clientSupplied);

    const personalStockTotal = stock
      .filter(s => s.ownerType === 'personal' && (
        s.mineralId.toLowerCase().trim() === key.toLowerCase().trim() ||
        s.mineralName.toLowerCase().trim() === item.name.toLowerCase().trim()
      ))
      .reduce((sum, s) => sum + s.quantitySCU, 0);
    item.personalAvailable = personalStockTotal;
    item.hasEnough = item.personalAvailable >= item.personalNeeded;

    if (!item.hasEnough) {
      allResourcesAvailable = false;
    }
  });

  const handleDeliverAndComplete = () => {
    audio.playSuccess();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    onUpdateStatus(order.id, 'completed');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Commande ${order.orderNumber}`}
      subtitle={`Client: ${order.clientName} ${order.clientOrg ? `(${order.clientOrg})` : ''}`}
      icon={<ClipboardList className="w-5 h-5 text-sc-cyan" />}
      maxWidth="3xl"
    >
      <div className="space-y-5 font-sans">
        {/* Top Info Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-sc-card/70 border border-sc-border rounded-xl">
          <div className="flex items-center gap-3">
            <OrderStatusBadge status={order.status} />
            <Badge variant={order.isPaid ? 'green' : 'gold'}>
              {order.isPaid ? 'Payé' : 'En attente de paiement'}
            </Badge>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-slate-400">Total :</span>
            <span className="text-base font-bold text-emerald-400">
              {order.totalPriceAUEC.toLocaleString('fr-FR')} aUEC
            </span>
          </div>
        </div>

        {/* Client & Metadata Card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-sc-panel rounded-lg border border-slate-800 text-xs font-mono">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-sc-cyan shrink-0" />
            <div>
              <span className="text-[10px] text-slate-500 block uppercase">Client</span>
              <span className="text-slate-200 font-bold">{order.clientName}</span>
            </div>
          </div>

          {order.clientOrg && (
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-sc-cyan shrink-0" />
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Organisation</span>
                <span className="text-slate-200">{order.clientOrg}</span>
              </div>
            </div>
          )}

          {order.clientContact && (
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-sc-cyan shrink-0" />
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Contact</span>
                <span className="text-slate-200 truncate">{order.clientContact}</span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-500 block uppercase">Création</span>
              <span className="text-slate-300">{new Date(order.createdAt).toLocaleDateString('fr-FR')}</span>
            </div>
          </div>

          {order.dueDate && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-500 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Échéance</span>
                <span className="text-amber-300 font-bold">{new Date(order.dueDate).toLocaleDateString('fr-FR')}</span>
              </div>
            </div>
          )}
        </div>

        {/* Ordered Items Table */}
        <div className="space-y-2">
          <h4 className="text-xs font-mono tracking-wider uppercase text-sc-cyan font-bold">
            Articles de la commande ({order.items.length})
          </h4>
          <div className="divide-y divide-slate-800 bg-sc-panel rounded-xl border border-sc-border overflow-hidden">
            {order.items.map((item, idx) => (
              <div key={idx} className="p-3 flex items-center justify-between gap-3 text-xs font-mono">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-100">{item.quantity}x {item.blueprintName}</span>
                    <Badge variant="slate" size="sm">{item.category}</Badge>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 flex flex-wrap gap-1">
                    <span>Requis :</span>
                    {item.requiredIngredients.map((ing, i) => (
                      <span key={i} className="text-slate-300">
                        {(ing.quantitySCU * item.quantity).toFixed(2)} SCU {ing.resourceName}
                        {i < item.requiredIngredients.length - 1 ? ',' : ''}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-emerald-400 font-bold">{item.totalLaborCostAUEC.toLocaleString('fr-FR')} aUEC</span>
                  <span className="text-[10px] text-slate-500 block">({item.unitLaborCostAUEC} / u)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resource Balance (Required vs Client Supplied vs Personal Stock) */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-mono tracking-wider uppercase text-sc-cyan font-bold flex items-center gap-1.5">
              <Layers className="w-4 h-4" />
              Bilan des Ressources & Déductions
            </h4>
            <span className={`text-xs font-mono font-bold flex items-center gap-1 ${
              allResourcesAvailable ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {allResourcesAvailable ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Ressources prêtes pour fabrication
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4" />
                  Manque de minerais dans votre stock
                </>
              )}
            </span>
          </div>

          <div className="space-y-2">
            {Object.keys(requirementsSummary).map((key, idx) => {
              const res = requirementsSummary[key];
              return (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono ${
                    res.hasEnough ? 'bg-sc-panel border-sc-border' : 'bg-rose-950/20 border-rose-500/40'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-100">{res.name}</span>
                      <span className="text-slate-400">Total requis : {res.required.toFixed(2)} SCU</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-3">
                      <span>Fourni par client : <strong className="text-amber-400">{res.clientSupplied.toFixed(2)} SCU</strong></span>
                      <span>À prélever sur stock perso : <strong className="text-sc-cyan">{res.personalNeeded.toFixed(2)} SCU</strong></span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase">Stock Perso Disponible</span>
                    <span className={`font-bold ${res.hasEnough ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {res.personalAvailable.toFixed(2)} SCU
                    </span>
                    {!res.hasEnough && (
                      <span className="text-[10px] text-rose-400 block">
                        Manque {(res.personalNeeded - res.personalAvailable).toFixed(2)} SCU
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Change Status & Quick Actions */}
        <div className="p-3 bg-sc-panel rounded-xl border border-sc-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-slate-400 uppercase text-[10px]">Changer le statut :</span>
            <select
              value={order.status}
              onChange={(e) => {
                audio.playSelect();
                onUpdateStatus(order.id, e.target.value as OrderStatus);
              }}
              className="px-3 py-1.5 bg-sc-card border border-sc-border focus:border-sc-cyan rounded-lg text-slate-200 text-xs font-sans focus:outline-none"
            >
              <option value="draft">Brouillon</option>
              <option value="pending_resources">En attente de ressources</option>
              <option value="refining">En raffinage</option>
              <option value="in_production">En fabrication</option>
              <option value="ready">Prêt à livrer</option>
              <option value="completed">Livré & Terminé</option>
              <option value="cancelled">Annulé</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => {
              audio.playClick();
              onTogglePaid(order.id);
            }}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono uppercase tracking-wider transition-colors ${
              order.isPaid
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                : 'bg-amber-500/20 border-amber-500/40 text-amber-300'
            }`}
          >
            {order.isPaid ? '✓ Marqué comme Payé' : 'Encaisser (Marquer Payé)'}
          </button>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-sc-border">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                audio.playClick();
                onClose();
              }}
              className="px-4 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-slate-100 text-xs font-mono uppercase tracking-wider transition-colors"
            >
              Fermer
            </button>

            {onEditOrder && (
              <button
                type="button"
                onClick={() => {
                  audio.playClick();
                  onClose();
                  onEditOrder(order);
                }}
                className="px-3.5 py-2 rounded-lg border border-sc-cyan/50 bg-sc-cyan/15 hover:bg-sc-cyan/25 text-sc-cyan text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-neon-cyan/20 transition-all"
                title="Modifier les articles, minerais ou détails de cette commande"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Modifier la commande</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {order.status !== 'ready' && order.status !== 'completed' && (
              <button
                type="button"
                disabled={!allResourcesAvailable}
                onClick={() => {
                  audio.playSuccess();
                  onExecuteFabrication(order);
                }}
                className={`px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-all duration-200 ${
                  allResourcesAvailable
                    ? 'bg-sc-cyan hover:bg-cyan-400 text-slate-950 font-bold border border-sc-cyan shadow-neon-cyan'
                    : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                }`}
                title="Déduire les minerais requis et passer la commande en fabrication"
              >
                <Hammer className="w-4 h-4" />
                Lancer la Fabrication (Déduire stocks)
              </button>
            )}

            {order.status === 'ready' && (
              <button
                type="button"
                onClick={handleDeliverAndComplete}
                className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold border border-emerald-400 shadow-neon-green text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-all duration-200"
              >
                <PackageCheck className="w-4 h-4" />
                Livrer & Clôturer la Commande
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

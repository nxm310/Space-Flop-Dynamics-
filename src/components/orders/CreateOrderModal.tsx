import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { AutocompleteSelect, AutocompleteOption } from '../common/AutocompleteSelect';
import { CustomerOrder, OrderItem, ClientMineralDeposit, Blueprint, OrderStatus } from '../../types';
import { STAR_CITIZEN_MINERALS } from '../../data/mineralsData';
import { ClipboardList, Plus, Trash2, User, Coins, Sparkles, Layers } from 'lucide-react';
import { audio } from '../../services/audioService';

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateOrder: (order: Omit<CustomerOrder, 'id' | 'orderNumber' | 'createdAt'>) => void;
  allBlueprints: Blueprint[];
  prefillBlueprint?: Blueprint | null;
}

export const CreateOrderModal: React.FC<CreateOrderModalProps> = ({
  isOpen,
  onClose,
  onCreateOrder,
  allBlueprints,
  prefillBlueprint
}) => {
  const [clientName, setClientName] = useState('');
  const [clientOrg, setClientOrg] = useState('');
  const [clientContact, setClientContact] = useState('');
  const [status, setStatus] = useState<OrderStatus>('pending_resources');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [additionalCostsAUEC, setAdditionalCostsAUEC] = useState<number>(0);
  const [isPaid, setIsPaid] = useState(false);

  // Selected Order Items
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  // Client Supplied Minerals
  const [clientMinerals, setClientMinerals] = useState<ClientMineralDeposit[]>([]);

  // Autocomplete options for blueprints
  const blueprintOptions: AutocompleteOption[] = allBlueprints.map(bp => ({
    id: bp.id,
    label: bp.name,
    subLabel: `${bp.typeLabel} • ${bp.ingredients.map(i => `${i.quantitySCU} SCU ${i.resourceName}`).join(', ')}`,
    category: bp.category,
    badge: bp.typeLabel
  }));

  // Autocomplete options for minerals
  const mineralOptions: AutocompleteOption[] = STAR_CITIZEN_MINERALS.map(m => ({
    id: m.id,
    label: m.displayName,
    subLabel: `${m.group} • ~${m.basePriceAUEC} aUEC/cSCU`,
    category: m.group
  }));

  // Handle prefill
  useEffect(() => {
    if (prefillBlueprint) {
      const unitLabor = prefillBlueprint.marketEstimatedAUEC ? Math.round(prefillBlueprint.marketEstimatedAUEC * 0.2) : 2500;
      setOrderItems([
        {
          blueprintId: prefillBlueprint.id,
          blueprintName: prefillBlueprint.name,
          category: prefillBlueprint.category,
          quantity: 1,
          unitLaborCostAUEC: unitLabor,
          totalLaborCostAUEC: unitLabor,
          requiredIngredients: prefillBlueprint.ingredients
        }
      ]);
    } else if (orderItems.length === 0 && allBlueprints.length > 0) {
      const firstBp = allBlueprints[0];
      const unitLabor = firstBp.marketEstimatedAUEC ? Math.round(firstBp.marketEstimatedAUEC * 0.2) : 2500;
      setOrderItems([
        {
          blueprintId: firstBp.id,
          blueprintName: firstBp.name,
          category: firstBp.category,
          quantity: 1,
          unitLaborCostAUEC: unitLabor,
          totalLaborCostAUEC: unitLabor,
          requiredIngredients: firstBp.ingredients
        }
      ]);
    }
  }, [prefillBlueprint, allBlueprints]);

  // Add Item to Order
  const handleAddItem = () => {
    audio.playClick();
    const defaultBp = allBlueprints[0];
    const unitLabor = defaultBp.marketEstimatedAUEC ? Math.round(defaultBp.marketEstimatedAUEC * 0.2) : 2500;
    setOrderItems([
      ...orderItems,
      {
        blueprintId: defaultBp.id,
        blueprintName: defaultBp.name,
        category: defaultBp.category,
        quantity: 1,
        unitLaborCostAUEC: unitLabor,
        totalLaborCostAUEC: unitLabor,
        requiredIngredients: defaultBp.ingredients
      }
    ]);
  };

  const handleItemChange = (index: number, bpId: string) => {
    const bp = allBlueprints.find(b => b.id === bpId);
    if (!bp) return;
    const updated = [...orderItems];
    const unitLabor = bp.marketEstimatedAUEC ? Math.round(bp.marketEstimatedAUEC * 0.2) : 2500;
    updated[index] = {
      ...updated[index],
      blueprintId: bp.id,
      blueprintName: bp.name,
      category: bp.category,
      unitLaborCostAUEC: unitLabor,
      totalLaborCostAUEC: unitLabor * updated[index].quantity,
      requiredIngredients: bp.ingredients
    };
    setOrderItems(updated);
  };

  const handleQuantityChange = (index: number, qty: number) => {
    const updated = [...orderItems];
    const q = Math.max(1, qty);
    updated[index].quantity = q;
    updated[index].totalLaborCostAUEC = updated[index].unitLaborCostAUEC * q;
    setOrderItems(updated);
  };

  const handleLaborCostChange = (index: number, cost: number) => {
    const updated = [...orderItems];
    updated[index].unitLaborCostAUEC = cost;
    updated[index].totalLaborCostAUEC = cost * updated[index].quantity;
    setOrderItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    audio.playClick();
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  // Add Client Mineral Deposit
  const handleAddClientMineral = () => {
    audio.playClick();
    setClientMinerals([
      ...clientMinerals,
      { mineralId: 'quantainium', mineralName: 'Quantainium', quantitySCU: 1.0 }
    ]);
  };

  const handleClientMineralChange = (index: number, field: 'mineralId' | 'quantitySCU', val: string | number) => {
    const updated = [...clientMinerals];
    if (field === 'mineralId') {
      const m = STAR_CITIZEN_MINERALS.find(min => min.id === val);
      updated[index].mineralId = String(val);
      updated[index].mineralName = m ? m.name : String(val);
    } else {
      updated[index].quantitySCU = Number(val);
    }
    setClientMinerals(updated);
  };

  const handleRemoveClientMineral = (index: number) => {
    audio.playClick();
    setClientMinerals(clientMinerals.filter((_, i) => i !== index));
  };

  // Fast auto-fill client minerals to match all requirements
  const handleClientProvidesAll = () => {
    audio.playSuccess();
    const requirementsMap: Record<string, { mineralId: string; mineralName: string; quantitySCU: number }> = {};
    orderItems.forEach(item => {
      item.requiredIngredients.forEach(ing => {
        const key = ing.resourceId;
        const totalReq = ing.quantitySCU * item.quantity;
        if (!requirementsMap[key]) {
          requirementsMap[key] = {
            mineralId: ing.resourceId,
            mineralName: ing.resourceName,
            quantitySCU: totalReq
          };
        } else {
          requirementsMap[key].quantitySCU += totalReq;
        }
      });
    });

    const newClientDeposits: ClientMineralDeposit[] = Object.values(requirementsMap).map(req => ({
      mineralId: req.mineralId,
      mineralName: req.mineralName,
      quantitySCU: Number(req.quantitySCU.toFixed(2))
    }));

    setClientMinerals(newClientDeposits);
  };

  // Total price calculation
  const totalLaborCost = orderItems.reduce((acc, i) => acc + i.totalLaborCostAUEC, 0);
  const finalPriceAUEC = totalLaborCost + Number(additionalCostsAUEC || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || orderItems.length === 0) return;

    audio.playSuccess();
    onCreateOrder({
      clientName: clientName.trim(),
      clientOrg: clientOrg.trim() || undefined,
      clientContact: clientContact.trim() || undefined,
      status,
      items: orderItems,
      clientSuppliedMinerals: clientMinerals,
      additionalCostsAUEC: Number(additionalCostsAUEC || 0),
      totalPriceAUEC: Math.max(0, finalPriceAUEC),
      dueDate: dueDate || undefined,
      notes: notes.trim() || undefined,
      isPaid
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Créer une Commande Client"
      subtitle="Enregistrez une demande de fabrication, les minerais fournis et les coûts"
      icon={<ClipboardList className="w-5 h-5 text-sc-cyan" />}
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5 font-sans">
        {/* Client Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-sc-card/50 rounded-xl border border-sc-border">
          <div>
            <label className="block text-xs font-mono tracking-wider uppercase text-slate-400 mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-sc-cyan" />
              Nom du Client *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Capitaine Travis..."
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full px-3 py-1.5 bg-sc-panel border border-sc-border focus:border-sc-cyan rounded-lg text-slate-100 font-sans text-xs focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono tracking-wider uppercase text-slate-400 mb-1">
              Organisation / Faction
            </label>
            <input
              type="text"
              placeholder="Ex: Stanton Mining Corp..."
              value={clientOrg}
              onChange={(e) => setClientOrg(e.target.value)}
              className="w-full px-3 py-1.5 bg-sc-panel border border-sc-border focus:border-sc-cyan rounded-lg text-slate-100 font-sans text-xs focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono tracking-wider uppercase text-slate-400 mb-1">
              Contact / Discord / Spectrum
            </label>
            <input
              type="text"
              placeholder="Ex: @Travis#1234..."
              value={clientContact}
              onChange={(e) => setClientContact(e.target.value)}
              className="w-full px-3 py-1.5 bg-sc-panel border border-sc-border focus:border-sc-cyan rounded-lg text-slate-100 font-sans text-xs focus:outline-none"
            />
          </div>
        </div>

        {/* Ordered Items List */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-mono tracking-wider uppercase text-sc-cyan font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              Articles Commandés ({orderItems.length})
            </h4>
            <button
              type="button"
              onClick={handleAddItem}
              className="px-2.5 py-1 rounded-md bg-sc-cyan/15 hover:bg-sc-cyan/25 border border-sc-cyan/30 text-sc-cyan text-[11px] font-mono uppercase flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Ajouter un item
            </button>
          </div>

          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
            {orderItems.map((item, idx) => (
              <div key={idx} className="p-3 bg-sc-panel rounded-xl border border-sc-border space-y-2">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="flex-1">
                    <AutocompleteSelect
                      options={blueprintOptions}
                      value={item.blueprintId}
                      onChange={(val) => handleItemChange(idx, val)}
                      placeholder="Rechercher un blueprint / item..."
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-20">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(idx, parseInt(e.target.value) || 1)}
                        className="w-full px-2.5 py-2 bg-sc-card border border-sc-border rounded-lg text-xs font-mono text-center text-slate-100 focus:border-sc-cyan"
                        title="Quantité"
                      />
                    </div>

                    <div className="w-32 relative">
                      <input
                        type="number"
                        step="100"
                        min="0"
                        value={item.unitLaborCostAUEC}
                        onChange={(e) => handleLaborCostChange(idx, parseInt(e.target.value) || 0)}
                        className="w-full px-2.5 py-2 bg-sc-card border border-sc-border rounded-lg text-xs font-mono text-slate-100 focus:border-sc-cyan"
                        title="Coût de main d'œuvre unitaire"
                      />
                      <span className="absolute right-2 top-2 text-[10px] font-mono text-slate-500">aUEC</span>
                    </div>

                    {orderItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Subtext: Required Minerals for this item */}
                <div className="flex flex-wrap gap-1.5 pt-1 text-[11px] font-mono text-slate-400">
                  <span className="text-slate-500">Minerais requis :</span>
                  {item.requiredIngredients.map((ing, i) => (
                    <span key={i} className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                      {(ing.quantitySCU * item.quantity).toFixed(2)} SCU {ing.resourceName}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Client-Supplied Minerals Section */}
        <div className="p-3.5 bg-gradient-to-br from-amber-950/20 via-sc-card/60 to-sc-panel rounded-xl border border-amber-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-mono tracking-wider uppercase text-amber-400 font-bold flex items-center gap-1.5">
                <Layers className="w-4 h-4" />
                Minerais Apportés par le Client
              </h4>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Si le client fournit ses propres minerais, saisissez-les ici pour les déduire
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClientProvidesAll}
                className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[11px] font-mono uppercase transition-colors"
                title="Déclarer que le client apporte 100% des minerais nécessaires"
              >
                Le client fournit tout
              </button>

              <button
                type="button"
                onClick={handleAddClientMineral}
                className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[11px] font-mono uppercase flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Ajouter
              </button>
            </div>
          </div>

          {clientMinerals.length > 0 ? (
            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {clientMinerals.map((dep, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-sc-panel rounded-lg border border-amber-500/20">
                  <div className="flex-1">
                    <AutocompleteSelect
                      options={mineralOptions}
                      value={dep.mineralId}
                      onChange={(val) => handleClientMineralChange(idx, 'mineralId', val)}
                      placeholder="Sélectionner le minerai apporté..."
                    />
                  </div>
                  <div className="w-32 relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      value={dep.quantitySCU}
                      onChange={(e) => handleClientMineralChange(idx, 'quantitySCU', parseFloat(e.target.value) || 0.1)}
                      className="w-full px-2.5 py-2 bg-sc-card border border-sc-border rounded-lg text-xs font-mono text-slate-100 focus:border-amber-400"
                    />
                    <span className="absolute right-2 top-2 text-[10px] font-mono text-slate-500">SCU</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveClientMineral(idx)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs font-mono text-slate-500 italic">
              Aucun minerai fourni par le client. Les minerais seront prélevés sur votre stock personnel.
            </p>
          )}
        </div>

        {/* Financial & Status Options */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-mono tracking-wider uppercase text-slate-400 mb-1">
              Frais Annexes / Remise (aUEC)
            </label>
            <input
              type="number"
              value={additionalCostsAUEC}
              onChange={(e) => setAdditionalCostsAUEC(parseInt(e.target.value) || 0)}
              placeholder="Ex: +500 ou -200"
              className="w-full px-3 py-1.5 bg-sc-panel border border-sc-border rounded-lg text-xs font-mono text-slate-100 focus:border-sc-cyan focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono tracking-wider uppercase text-slate-400 mb-1">
              Statut Initial
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as OrderStatus)}
              className="w-full px-3 py-1.5 bg-sc-panel border border-sc-border rounded-lg text-xs font-sans text-slate-100 focus:border-sc-cyan focus:outline-none"
            >
              <option value="draft">Brouillon</option>
              <option value="pending_resources">En attente de ressources</option>
              <option value="refining">En raffinage</option>
              <option value="in_production">En cours de fabrication</option>
              <option value="ready">Prêt à livrer</option>
              <option value="completed">Livré & Terminé</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono tracking-wider uppercase text-slate-400 mb-1">
              Date d'Échéance (Optionnel)
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-1.5 bg-sc-panel border border-sc-border rounded-lg text-xs font-mono text-slate-100 focus:border-sc-cyan focus:outline-none"
            />
          </div>
        </div>

        {/* Pricing Summary Banner */}
        <div className="p-3.5 rounded-xl bg-sc-panel border border-sc-cyan/40 flex items-center justify-between font-mono">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-emerald-400" />
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Prix Total Facturé au Client</span>
              <span className="text-xl font-bold text-emerald-400">{finalPriceAUEC.toLocaleString('fr-FR')} aUEC</span>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isPaid}
              onChange={(e) => setIsPaid(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-sc-cyan accent-sc-cyan"
            />
            <span className="text-xs text-slate-300">Commande déjà payée</span>
          </label>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-mono tracking-wider uppercase text-slate-400 mb-1">
            Instructions Spéciales / Notes
          </label>
          <input
            type="text"
            placeholder="Ex: Livrer sur le pad 04 à Everus Harbor..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-1.5 bg-sc-panel border border-sc-border rounded-lg text-xs font-sans text-slate-100 focus:border-sc-cyan focus:outline-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-sc-border">
          <button
            type="button"
            onClick={() => {
              audio.playClick();
              onClose();
            }}
            className="px-4 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-slate-100 text-xs font-mono uppercase tracking-wider transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-lg bg-sc-cyan hover:bg-cyan-400 text-slate-950 font-bold border border-sc-cyan shadow-neon-cyan text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-all duration-200"
          >
            <Sparkles className="w-4 h-4" />
            Créer la commande
          </button>
        </div>
      </form>
    </Modal>
  );
};

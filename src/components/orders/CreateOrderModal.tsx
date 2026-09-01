import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { AutocompleteSelect, AutocompleteOption } from '../common/AutocompleteSelect';
import { CustomerOrder, OrderItem, ClientMineralDeposit, Blueprint, OrderStatus, ClientProfile } from '../../types';
import { STAR_CITIZEN_MINERALS } from '../../data/mineralsData';
import { StorageService } from '../../services/storageService';
import {
  ClipboardList,
  Plus,
  Trash2,
  User,
  Coins,
  Sparkles,
  Layers,
  Users,
  Building,
  Mail,
  CheckCircle2
} from 'lucide-react';
import { audio } from '../../services/audioService';

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateOrder: (order: Omit<CustomerOrder, 'id' | 'orderNumber' | 'createdAt'>) => void;
  allBlueprints: Blueprint[];
  prefillBlueprint?: Blueprint | null;
  initialClientName?: string | null;
}

export const CreateOrderModal: React.FC<CreateOrderModalProps> = ({
  isOpen,
  onClose,
  onCreateOrder,
  allBlueprints,
  prefillBlueprint,
  initialClientName
}) => {
  const [clientName, setClientName] = useState('');
  const [clientOrg, setClientOrg] = useState('');
  const [clientContact, setClientContact] = useState('');
  const [status, setStatus] = useState<OrderStatus>('pending_resources');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [additionalCostsAUEC, setAdditionalCostsAUEC] = useState<number>(0);
  const [isPaid, setIsPaid] = useState(false);

  // Clients database directory for auto-complete & quick selection
  const [savedClients, setSavedClients] = useState<ClientProfile[]>(() => StorageService.getClients());
  const [allKnownNames, setAllKnownNames] = useState<string[]>(() => StorageService.getAllKnownClientNames());

  // Selected Order Items
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  // Client Supplied Minerals
  const [clientMinerals, setClientMinerals] = useState<ClientMineralDeposit[]>([]);

  // Refresh saved clients whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setSavedClients(StorageService.getClients());
      setAllKnownNames(StorageService.getAllKnownClientNames());

      if (initialClientName) {
        const found = StorageService.getClients().find(
          c => c.name.toLowerCase().trim() === initialClientName.toLowerCase().trim()
        );
        if (found) {
          setClientName(found.name);
          setClientOrg(found.organization || '');
          setClientContact(found.contact || '');
        } else {
          setClientName(initialClientName);
        }
      }
    }
  }, [isOpen, initialClientName]);

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

  // Handle prefill blueprint
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

  // Find active client profile if exists
  const activeClient = savedClients.find(
    c => c.name.toLowerCase().trim() === clientName.toLowerCase().trim()
  );

  // Handle selecting client name from dropdown
  const handleSelectClientName = (selectedName: string) => {
    if (!selectedName) return;
    audio.playClick();
    setClientName(selectedName);

    const found = savedClients.find(
      c => c.name.toLowerCase().trim() === selectedName.toLowerCase().trim()
    );
    if (found) {
      setClientOrg(found.organization || '');
      setClientContact(found.contact || '');
    }
  };

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

  const handleRemoveItem = (index: number) => {
    audio.playClick();
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, bpId: string) => {
    const bp = allBlueprints.find(b => b.id === bpId);
    if (!bp) return;

    const unitLabor = bp.marketEstimatedAUEC ? Math.round(bp.marketEstimatedAUEC * 0.2) : 2500;
    const currentQty = orderItems[index]?.quantity || 1;

    const updated = [...orderItems];
    updated[index] = {
      blueprintId: bp.id,
      blueprintName: bp.name,
      category: bp.category,
      quantity: currentQty,
      unitLaborCostAUEC: unitLabor,
      totalLaborCostAUEC: unitLabor * currentQty,
      requiredIngredients: bp.ingredients
    };
    setOrderItems(updated);
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    const q = Math.max(1, quantity);
    const updated = [...orderItems];
    updated[index].quantity = q;
    updated[index].totalLaborCostAUEC = updated[index].unitLaborCostAUEC * q;
    setOrderItems(updated);
  };

  const handleLaborCostChange = (index: number, cost: number) => {
    const c = Math.max(0, cost);
    const updated = [...orderItems];
    updated[index].unitLaborCostAUEC = c;
    updated[index].totalLaborCostAUEC = c * updated[index].quantity;
    setOrderItems(updated);
  };

  // Client Minerals Handlers
  const handleAddClientMineral = () => {
    audio.playClick();
    const defaultMin = STAR_CITIZEN_MINERALS[0];
    setClientMinerals([
      ...clientMinerals,
      {
        mineralId: defaultMin.id,
        mineralName: defaultMin.name,
        quantitySCU: 1
      }
    ]);
  };

  const handleRemoveClientMineral = (index: number) => {
    audio.playClick();
    setClientMinerals(clientMinerals.filter((_, i) => i !== index));
  };

  const handleClientMineralChange = (index: number, mineralId: string) => {
    const min = STAR_CITIZEN_MINERALS.find(m => m.id === mineralId);
    if (!min) return;

    const updated = [...clientMinerals];
    updated[index].mineralId = min.id;
    updated[index].mineralName = min.name;
    setClientMinerals(updated);
  };

  const handleClientMineralQtyChange = (index: number, qty: number) => {
    const q = Math.max(0, qty);
    const updated = [...clientMinerals];
    updated[index].quantitySCU = q;
    setClientMinerals(updated);
  };

  // Auto-Fill Client Minerals from Order Requirements
  const handleAutoFillRequiredMinerals = () => {
    audio.playClick();
    const combined: Record<string, { name: string; qty: number }> = {};
    orderItems.forEach(item => {
      item.requiredIngredients.forEach(ing => {
        const key = ing.resourceId;
        const totalReq = ing.quantitySCU * item.quantity;
        if (combined[key]) {
          combined[key].qty += totalReq;
        } else {
          combined[key] = {
            name: ing.resourceName,
            qty: totalReq
          };
        }
      });
    });

    const newDeposits: ClientMineralDeposit[] = Object.keys(combined).map(key => ({
      mineralId: key,
      mineralName: combined[key].name,
      quantitySCU: Number(combined[key].qty.toFixed(3))
    }));

    setClientMinerals(newDeposits);
  };

  // Total Calculations
  const totalLaborCost = orderItems.reduce((acc, i) => acc + i.totalLaborCostAUEC, 0);
  const finalPriceAUEC = totalLaborCost + Number(additionalCostsAUEC || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || orderItems.length === 0) return;

    audio.playSuccess();

    // Automatically save or update client profile in database directory with history
    StorageService.saveOrUpdateClient({
      name: clientName.trim(),
      organization: clientOrg.trim() || undefined,
      contact: clientContact.trim() || undefined
    });

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
      subtitle="Enregistrez une commande et mettez à jour automatiquement la fiche & l'historique client"
      icon={<ClipboardList className="w-5 h-5 text-sc-cyan" />}
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5 font-sans">
        
        {/* Client Directory Header & Quick Dropdown Selector */}
        <div className="p-3.5 bg-sc-card/70 rounded-xl border border-sc-border space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-sc-cyan" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                Fiche Client Automatique
              </span>
            </div>

            {/* Prominent Dropdown of all saved & past client names */}
            {allKnownNames.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-slate-400">Clients connus :</span>
                <select
                  onChange={(e) => {
                    handleSelectClientName(e.target.value);
                  }}
                  value={allKnownNames.includes(clientName) ? clientName : ''}
                  className="px-2.5 py-1 bg-[#090e18] border border-sc-cyan/50 rounded-lg text-xs font-mono text-sc-cyan focus:outline-none cursor-pointer"
                >
                  <option value="">👥 Choisir un client ({allKnownNames.length})...</option>
                  {allKnownNames.map(name => {
                    const prof = savedClients.find(c => c.name.toLowerCase().trim() === name.toLowerCase().trim());
                    return (
                      <option key={name} value={name}>
                        {name} {prof?.organization ? `(${prof.organization})` : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}
          </div>

          {/* Client Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-mono tracking-wider uppercase text-slate-400 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-sc-cyan" />
                Nom du Client *
              </label>
              <input
                type="text"
                required
                list="clients-datalist"
                placeholder="Ex: Capitaine Travis..."
                value={clientName}
                onChange={(e) => {
                  setClientName(e.target.value);
                  const found = savedClients.find(
                    c => c.name.toLowerCase().trim() === e.target.value.toLowerCase().trim()
                  );
                  if (found) {
                    setClientOrg(found.organization || '');
                    setClientContact(found.contact || '');
                  }
                }}
                className="w-full px-3 py-1.5 bg-[#090e18] border border-sc-border focus:border-sc-cyan rounded-lg text-slate-100 font-sans text-xs focus:outline-none"
              />
              <datalist id="clients-datalist">
                {allKnownNames.map(name => (
                  <option key={name} value={name} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-mono tracking-wider uppercase text-slate-400 mb-1 flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                Organisation / Faction
              </label>
              <input
                type="text"
                list="orgs-datalist"
                placeholder="Ex: Stanton Mining Corp..."
                value={clientOrg}
                onChange={(e) => setClientOrg(e.target.value)}
                className="w-full px-3 py-1.5 bg-[#090e18] border border-sc-border focus:border-sc-cyan rounded-lg text-slate-100 font-sans text-xs focus:outline-none"
              />
              {/* Datalist of known organizations */}
              <datalist id="orgs-datalist">
                {activeClient?.organizationsHistory?.map((org, i) => (
                  <option key={i} value={org} />
                ))}
              </datalist>

              {/* Quick pills for known orgs of this client */}
              {activeClient?.organizationsHistory && activeClient.organizationsHistory.length > 1 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {activeClient.organizationsHistory.map((org, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setClientOrg(org)}
                      className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 hover:bg-cyan-900"
                    >
                      {org}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-mono tracking-wider uppercase text-slate-400 mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                Contact (Discord / Spectrum)
              </label>
              <input
                type="text"
                list="contacts-datalist"
                placeholder="Ex: @Travis#1234..."
                value={clientContact}
                onChange={(e) => setClientContact(e.target.value)}
                className="w-full px-3 py-1.5 bg-[#090e18] border border-sc-border focus:border-sc-cyan rounded-lg text-slate-100 font-sans text-xs focus:outline-none"
              />
              {/* Datalist of known contacts */}
              <datalist id="contacts-datalist">
                {activeClient?.contactsHistory?.map((cont, i) => (
                  <option key={i} value={cont} />
                ))}
              </datalist>

              {/* Quick pills for known contacts of this client */}
              {activeClient?.contactsHistory && activeClient.contactsHistory.length > 1 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {activeClient.contactsHistory.map((cont, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setClientContact(cont)}
                      className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-800 hover:bg-purple-900"
                    >
                      {cont}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Client summary badge if already known */}
          {activeClient && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-sc-cyan/10 border border-sc-cyan/30 text-[11px] font-mono text-cyan-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-sc-cyan shrink-0" />
              <span>
                Fiche client identifiée : <strong>{activeClient.name}</strong> •{' '}
                {activeClient.orderCount || 0} commande(s) passée(s) •{' '}
                {(activeClient.totalSpentAUEC || 0).toLocaleString('fr-FR')} aUEC cumulés
              </span>
            </div>
          )}
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

          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
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

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Quantity */}
                    <div className="w-20">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(idx, parseInt(e.target.value) || 1)}
                        className="w-full px-2.5 py-2 bg-[#090e18] border border-sc-border rounded-lg text-xs font-mono text-center text-slate-100 focus:border-sc-cyan [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        title="Quantité d'items"
                      />
                    </div>

                    {/* Unit Labor Cost Input without overlap */}
                    <div className="w-36 relative">
                      <input
                        type="number"
                        step="100"
                        min="0"
                        value={item.unitLaborCostAUEC}
                        onChange={(e) => handleLaborCostChange(idx, parseInt(e.target.value) || 0)}
                        className="w-full pl-2.5 pr-14 py-2 bg-[#090e18] border border-sc-border rounded-lg text-xs font-mono text-slate-100 focus:border-sc-cyan [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        title="Coût de main d'œuvre unitaire"
                      />
                      <span className="absolute right-2.5 top-2.5 text-[10px] font-mono text-slate-400 font-bold pointer-events-none">
                        aUEC
                      </span>
                    </div>

                    {orderItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
                        title="Retirer cet article"
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

        {/* Client Supplied Minerals Section */}
        <div className="p-3.5 bg-sc-card/50 rounded-xl border border-sc-border space-y-2.5">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-mono tracking-wider uppercase text-amber-300 font-bold flex items-center gap-1.5">
                <Layers className="w-4 h-4" />
                Minerais Fournis par le Client ({clientMinerals.length})
              </h4>
              <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                Minerais apportés par le client et déduits de votre consommation personnelle
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAutoFillRequiredMinerals}
                className="px-2.5 py-1 rounded-md bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-[11px] font-mono uppercase transition-colors"
                title="Remplir automatiquement avec la totalité des minerais requis par la commande"
              >
                Tout fournir
              </button>
              <button
                type="button"
                onClick={handleAddClientMineral}
                className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono uppercase flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Ajouter
              </button>
            </div>
          </div>

          {clientMinerals.length > 0 ? (
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
              {clientMinerals.map((deposit, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-[#090e18] p-2 rounded-lg border border-slate-800">
                  <div className="flex-1">
                    <AutocompleteSelect
                      options={mineralOptions}
                      value={deposit.mineralId}
                      onChange={(val) => handleClientMineralChange(idx, val)}
                      placeholder="Sélectionner le minerai fourni..."
                    />
                  </div>
                  <div className="w-32 relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0.001"
                      value={deposit.quantitySCU}
                      onChange={(e) => handleClientMineralQtyChange(idx, parseFloat(e.target.value) || 0)}
                      className="w-full pl-2.5 pr-12 py-2 bg-sc-card border border-sc-border rounded-lg text-xs font-mono text-slate-100 focus:border-sc-cyan [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="absolute right-2.5 top-2.5 text-[10px] font-mono text-slate-400 font-bold pointer-events-none">
                      SCU
                    </span>
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
            <div className="relative">
              <input
                type="number"
                value={additionalCostsAUEC || ''}
                onChange={(e) => setAdditionalCostsAUEC(parseInt(e.target.value) || 0)}
                placeholder="Ex: 500 ou -200"
                className="w-full pl-3 pr-14 py-1.5 bg-[#090e18] border border-sc-border rounded-lg text-xs font-mono text-slate-100 focus:border-sc-cyan focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="absolute right-2.5 top-1.5 text-[10px] font-mono text-slate-400 font-bold pointer-events-none">
                aUEC
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono tracking-wider uppercase text-slate-400 mb-1">
              Statut Initial
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as OrderStatus)}
              className="w-full px-3 py-1.5 bg-[#090e18] border border-sc-border rounded-lg text-xs font-sans text-slate-100 focus:border-sc-cyan focus:outline-none cursor-pointer"
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
              className="w-full px-3 py-1.5 bg-[#090e18] border border-sc-border rounded-lg text-xs font-mono text-slate-100 focus:border-sc-cyan focus:outline-none"
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

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isPaid}
              onChange={(e) => setIsPaid(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-sc-cyan accent-sc-cyan cursor-pointer"
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
            className="w-full px-3 py-1.5 bg-[#090e18] border border-sc-border rounded-lg text-xs font-sans text-slate-100 focus:border-sc-cyan focus:outline-none"
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
            className="px-4 py-2 rounded-lg border border-slate-700 bg-sc-card hover:bg-slate-800 text-slate-300 font-mono text-xs uppercase transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-lg bg-sc-cyan hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-neon-cyan transition-all"
          >
            <ClipboardList className="w-4 h-4" />
            Enregistrer la Commande
          </button>
        </div>
      </form>
    </Modal>
  );
};

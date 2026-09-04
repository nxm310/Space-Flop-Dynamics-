import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '../common/Modal';
import { SelectMineralModal } from '../common/SelectMineralModal';
import { SelectBlueprintModal } from './SelectBlueprintModal';
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
  CheckCircle2,
  Search
} from 'lucide-react';
import { audio } from '../../services/audioService';

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateOrder: (order: Omit<CustomerOrder, 'id' | 'orderNumber' | 'createdAt'>) => void;
  onUpdateOrder?: (order: CustomerOrder) => void;
  orderToEdit?: CustomerOrder | null;
  allBlueprints: Blueprint[];
  prefillBlueprint?: Blueprint | null;
  initialClientName?: string | null;
}

export const CreateOrderModal: React.FC<CreateOrderModalProps> = ({
  isOpen,
  onClose,
  onCreateOrder,
  onUpdateOrder,
  orderToEdit,
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
  const [allKnownOrgs, setAllKnownOrgs] = useState<string[]>(() => StorageService.getAllKnownOrganizations());
  const [allKnownContacts, setAllKnownContacts] = useState<string[]>(() => StorageService.getAllKnownContacts());

  // Selected Order Items
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [blueprintModalItemIndex, setBlueprintModalItemIndex] = useState<number | null>(null);

  // Client Supplied Minerals
  const [clientMinerals, setClientMinerals] = useState<ClientMineralDeposit[]>([]);
  const [mineralModalItemIndex, setMineralModalItemIndex] = useState<number | null>(null);
  const [clientMineralQtyInputs, setClientMineralQtyInputs] = useState<Record<number, string>>({});

  // Unlocked blueprints sets (Personal workshop & Client blueprints)
  const [unlockedPersonalIds, setUnlockedPersonalIds] = useState<Set<string>>(() => new Set(StorageService.getUnlockedBlueprintIds()));
  const [unlockedClientIds, setUnlockedClientIds] = useState<Set<string>>(() => new Set(StorageService.getClientBlueprintIds()));

  // Refresh saved clients & unlocked blueprints & initialize state whenever modal opens or orderToEdit changes
  useEffect(() => {
    if (isOpen) {
      setSavedClients(StorageService.getClients());
      setAllKnownNames(StorageService.getAllKnownClientNames());
      setAllKnownOrgs(StorageService.getAllKnownOrganizations());
      setAllKnownContacts(StorageService.getAllKnownContacts());
      setUnlockedPersonalIds(new Set(StorageService.getUnlockedBlueprintIds()));
      setUnlockedClientIds(new Set(StorageService.getClientBlueprintIds()));

      if (orderToEdit) {
        setClientName(orderToEdit.clientName);
        setClientOrg(orderToEdit.clientOrg || '');
        setClientContact(orderToEdit.clientContact || '');
        setStatus(orderToEdit.status);
        setDueDate(orderToEdit.dueDate ? orderToEdit.dueDate.split('T')[0] : '');
        setNotes(orderToEdit.notes || '');
        setAdditionalCostsAUEC(orderToEdit.additionalCostsAUEC || 0);
        setIsPaid(orderToEdit.isPaid || false);
        setOrderItems(orderToEdit.items || []);
        setClientMinerals(orderToEdit.clientSuppliedMinerals || []);

        const qtyInputs: Record<number, string> = {};
        (orderToEdit.clientSuppliedMinerals || []).forEach((m, idx) => {
          qtyInputs[idx] = String(m.quantitySCU);
        });
        setClientMineralQtyInputs(qtyInputs);
      } else if (initialClientName) {
        const found = StorageService.getClients().find(
          c => c.name.toLowerCase().trim() === initialClientName.toLowerCase().trim()
        );
        if (found) {
          setClientName(found.name);
          setClientOrg(found.organization || '');
          setClientContact(found.contact || '');
        } else {
          setClientName(initialClientName);
          setClientOrg('');
          setClientContact('');
        }
        setStatus('pending_resources');
        setDueDate('');
        setNotes('');
        setAdditionalCostsAUEC(0);
        setIsPaid(false);
        setClientMinerals([]);
        setClientMineralQtyInputs({});
      } else if (!prefillBlueprint) {
        setClientName('');
        setClientOrg('');
        setClientContact('');
        setStatus('pending_resources');
        setDueDate('');
        setNotes('');
        setAdditionalCostsAUEC(0);
        setIsPaid(false);
        setClientMinerals([]);
        setClientMineralQtyInputs({});
      }
    }
  }, [isOpen, initialClientName, orderToEdit]);

  // Filter available blueprints: ONLY personal unlocked blueprints OR client blueprints (or prefilled)
  const availableBlueprints = useMemo(() => {
    const filtered = allBlueprints.filter(bp => {
      const isPersonal = unlockedPersonalIds.has(bp.id);
      const isClient = unlockedClientIds.has(bp.id);
      const isPrefilled = prefillBlueprint && prefillBlueprint.id === bp.id;
      return isPersonal || isClient || isPrefilled;
    });

    return filtered.length > 0 ? filtered : allBlueprints;
  }, [allBlueprints, unlockedPersonalIds, unlockedClientIds, prefillBlueprint]);

  // Handle prefill blueprint or default selection for new order
  useEffect(() => {
    if (orderToEdit) return;

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
    } else if (orderItems.length === 0 && availableBlueprints.length > 0) {
      const firstBp = availableBlueprints[0];
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
  }, [prefillBlueprint, availableBlueprints, orderToEdit]);

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
    const defaultBp = availableBlueprints[0] || allBlueprints[0];
    const unitLabor = defaultBp?.marketEstimatedAUEC ? Math.round(defaultBp.marketEstimatedAUEC * 0.2) : 2500;
    const newIdx = orderItems.length;
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
    setBlueprintModalItemIndex(newIdx);
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
    const newIdx = clientMinerals.length;
    setClientMinerals([
      ...clientMinerals,
      {
        mineralId: defaultMin.id,
        mineralName: defaultMin.name,
        quantitySCU: 1
      }
    ]);
    setMineralModalItemIndex(newIdx);
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

  const handleClientMineralQtyChange = (index: number, val: string) => {
    setClientMineralQtyInputs(prev => ({ ...prev, [index]: val }));
    const parsed = parseFloat(val.replace(',', '.').trim());
    const q = isNaN(parsed) || parsed < 0 ? 0 : parsed;
    const updated = [...clientMinerals];
    if (updated[index]) {
      updated[index].quantitySCU = q;
      setClientMinerals(updated);
    }
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

    if (orderToEdit && onUpdateOrder) {
      onUpdateOrder({
        ...orderToEdit,
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
    } else {
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
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={orderToEdit ? `Modifier la Commande : ${orderToEdit.orderNumber}` : "Créer une Commande Client"}
      subtitle={orderToEdit ? "Ajustez les articles, les quantités, les minerais fournis par le client, les prix ou le statut" : "Enregistrez une commande et mettez à jour automatiquement la fiche & l'historique client"}
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

          {/* Client Inputs 3-Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* 1. Client Name */}
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-1">
                <label className="text-xs font-mono tracking-wider uppercase text-slate-400 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-sc-cyan" />
                  <span>Nom Client *</span>
                </label>
                {allKnownNames.length > 0 && (
                  <select
                    onChange={(e) => {
                      handleSelectClientName(e.target.value);
                    }}
                    value={allKnownNames.includes(clientName) ? clientName : ''}
                    className="px-1.5 py-0.5 bg-[#090e18] border border-sc-border hover:border-sc-cyan rounded text-[10px] font-mono text-sc-cyan focus:outline-none cursor-pointer max-w-[120px] truncate"
                    title="Choisir parmi les clients enregistrés"
                  >
                    <option value="">👤 Choisir ({allKnownNames.length})...</option>
                    {allKnownNames.map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                )}
              </div>
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

            {/* 2. Organization / Faction */}
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-1">
                <label className="text-xs font-mono tracking-wider uppercase text-slate-400 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  <span>Organisation / Faction</span>
                </label>
                {allKnownOrgs.length > 0 && (
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        audio.playClick();
                        setClientOrg(e.target.value);
                      }
                    }}
                    value={allKnownOrgs.includes(clientOrg) ? clientOrg : ''}
                    className="px-1.5 py-0.5 bg-[#090e18] border border-sc-border hover:border-cyan-400 rounded text-[10px] font-mono text-cyan-300 focus:outline-none cursor-pointer max-w-[120px] truncate"
                    title="Choisir parmi les organisations enregistrées"
                  >
                    <option value="">🏛️ Choisir ({allKnownOrgs.length})...</option>
                    {allKnownOrgs.map(org => (
                      <option key={org} value={org}>{org}</option>
                    ))}
                  </select>
                )}
              </div>
              <input
                type="text"
                list="orgs-datalist"
                placeholder="Ex: Stanton Mining Corp..."
                value={clientOrg}
                onChange={(e) => setClientOrg(e.target.value)}
                className="w-full px-3 py-1.5 bg-[#090e18] border border-sc-border focus:border-sc-cyan rounded-lg text-slate-100 font-sans text-xs focus:outline-none"
              />
              <datalist id="orgs-datalist">
                {Array.from(new Set([...allKnownOrgs, ...(activeClient?.organizationsHistory || [])])).map((org, i) => (
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

            {/* 3. Contact (Discord / Spectrum) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-1">
                <label className="text-xs font-mono tracking-wider uppercase text-slate-400 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>Contact Discord / Spectrum</span>
                </label>
                {allKnownContacts.length > 0 && (
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        audio.playClick();
                        setClientContact(e.target.value);
                      }
                    }}
                    value={allKnownContacts.includes(clientContact) ? clientContact : ''}
                    className="px-1.5 py-0.5 bg-[#090e18] border border-sc-border hover:border-purple-400 rounded text-[10px] font-mono text-purple-300 focus:outline-none cursor-pointer max-w-[120px] truncate"
                    title="Choisir parmi les contacts enregistrés"
                  >
                    <option value="">💬 Choisir ({allKnownContacts.length})...</option>
                    {allKnownContacts.map(cont => (
                      <option key={cont} value={cont}>{cont}</option>
                    ))}
                  </select>
                )}
              </div>
              <input
                type="text"
                list="contacts-datalist"
                placeholder="Ex: @Travis#1234..."
                value={clientContact}
                onChange={(e) => setClientContact(e.target.value)}
                className="w-full px-3 py-1.5 bg-[#090e18] border border-sc-border focus:border-sc-cyan rounded-lg text-slate-100 font-sans text-xs focus:outline-none"
              />
              <datalist id="contacts-datalist">
                {Array.from(new Set([...allKnownContacts, ...(activeClient?.contactsHistory || [])])).map((cont, i) => (
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
                  <div className="flex-1 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        audio.playClick();
                        setBlueprintModalItemIndex(idx);
                      }}
                      className="flex-1 px-3 py-2 bg-[#090e18] hover:bg-slate-800/90 border border-sc-border hover:border-sc-cyan rounded-xl text-xs font-mono text-left flex items-center justify-between gap-2 group transition-all"
                      title="Cliquer pour ouvrir la recherche et parcourir les blueprints par genre"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-2 h-2 rounded-full bg-sc-cyan shadow-neon-cyan shrink-0" />
                        <span className="font-bold text-slate-100 group-hover:text-sc-cyan transition-colors truncate">
                          {item.blueprintName || 'Choisir un blueprint...'}
                        </span>
                        {item.category && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 shrink-0 hidden sm:inline">
                            {item.category === 'armes_fps' ? 'Arme FPS' : item.category === 'armures' ? 'Armure' : item.category === 'vaisseau' ? 'Vaisseau' : item.category === 'outils' ? 'Outil' : 'Composant'}
                          </span>
                        )}
                      </div>

                      <span className="text-[11px] text-sc-cyan font-bold shrink-0 flex items-center gap-1 group-hover:underline bg-sc-cyan/10 px-2 py-0.5 rounded border border-sc-cyan/30">
                        <span>Parcourir</span>
                        <Search className="w-3 h-3" />
                      </span>
                    </button>
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
                <div key={idx} className="flex items-center gap-2 bg-[#090e18] p-2 rounded-xl border border-slate-800 hover:border-amber-500/40 transition-colors">
                  <div className="flex-1 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        audio.playClick();
                        setMineralModalItemIndex(idx);
                      }}
                      className="flex-1 px-3 py-2 bg-sc-card hover:bg-slate-800 border border-sc-border hover:border-amber-400 rounded-lg text-xs font-mono text-left flex items-center justify-between gap-2 group transition-all"
                      title="Cliquer pour ouvrir le grand catalogue complet des minerais et ingrédients"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-2 h-2 rounded-full bg-amber-400 shadow-neon-amber shrink-0" />
                        <span className="font-bold text-slate-100 group-hover:text-amber-300 transition-colors truncate">
                          {STAR_CITIZEN_MINERALS.find(m => m.id === deposit.mineralId)?.displayName || deposit.mineralName || 'Choisir un minerai...'}
                        </span>
                        {STAR_CITIZEN_MINERALS.find(m => m.id === deposit.mineralId)?.group === 'Gem' && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-800 shrink-0">
                            Gemme
                          </span>
                        )}
                      </div>

                      <span className="text-[11px] text-amber-300 font-bold shrink-0 flex items-center gap-1 group-hover:underline bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                        <span>Parcourir</span>
                        <Search className="w-3 h-3" />
                      </span>
                    </button>
                  </div>

                  <div className="w-32 relative">
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="0"
                      value={clientMineralQtyInputs[idx] !== undefined ? clientMineralQtyInputs[idx] : String(deposit.quantitySCU)}
                      onChange={(e) => handleClientMineralQtyChange(idx, e.target.value)}
                      className="w-full pl-2.5 pr-14 py-2 bg-sc-card border border-sc-border rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-sc-cyan [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="absolute right-2.5 top-2.5 text-[10px] font-mono text-slate-400 font-bold pointer-events-none select-none">
                      {STAR_CITIZEN_MINERALS.find(m => m.id === deposit.mineralId)?.group === 'Gem' ? 'unités' : 'SCU'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveClientMineral(idx)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded transition-colors"
                    title="Supprimer cette ressource"
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
            {orderToEdit ? 'Enregistrer les Modifications' : 'Enregistrer la Commande'}
          </button>
        </div>
      </form>

      {/* Blueprint Selection Pop-up Modal with Search and Genre Filters */}
      <SelectBlueprintModal
        isOpen={blueprintModalItemIndex !== null}
        onClose={() => setBlueprintModalItemIndex(null)}
        onSelectBlueprint={(selectedBp) => {
          if (blueprintModalItemIndex !== null) {
            handleItemChange(blueprintModalItemIndex, selectedBp.id);
            setBlueprintModalItemIndex(null);
          }
        }}
        availableBlueprints={availableBlueprints}
        unlockedPersonalIds={unlockedPersonalIds}
        unlockedClientIds={unlockedClientIds}
        currentSelectedId={blueprintModalItemIndex !== null ? orderItems[blueprintModalItemIndex]?.blueprintId : undefined}
      />

      {/* Mineral / Ingredient Selection Pop-up Modal */}
      <SelectMineralModal
        isOpen={mineralModalItemIndex !== null}
        onClose={() => setMineralModalItemIndex(null)}
        onSelectMineral={(selectedMin) => {
          if (mineralModalItemIndex !== null) {
            handleClientMineralChange(mineralModalItemIndex, selectedMin.id);
            setMineralModalItemIndex(null);
          }
        }}
        currentSelectedId={mineralModalItemIndex !== null ? clientMinerals[mineralModalItemIndex]?.mineralId : undefined}
        title="Sélectionner le Minerai / Ingrédient Fourni par le Client"
        subtitle="Explorez les minerais, gemmes et métaux avec leurs densités et cours galactiques"
      />
    </Modal>
  );
};

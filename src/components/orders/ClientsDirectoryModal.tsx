import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { ClientProfile, CustomerOrder } from '../../types';
import { StorageService } from '../../services/storageService';
import { OrderStatusBadge } from '../common/Badge';
import {
  Users,
  Search,
  Building,
  Mail,
  Trash2,
  Plus,
  Edit2,
  Save,
  ChevronRight,
  ChevronDown,
  ShoppingBag
} from 'lucide-react';
import { audio } from '../../services/audioService';

interface ClientsDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectClient?: (clientName: string) => void;
}

export const ClientsDirectoryModal: React.FC<ClientsDirectoryModalProps> = ({
  isOpen,
  onClose,
  onSelectClient
}) => {
  const [clients, setClients] = useState<ClientProfile[]>(() => StorageService.getClients());
  const [orders, setOrders] = useState<CustomerOrder[]>(() => StorageService.getOrders());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Form fields for editing/adding
  const [formName, setFormName] = useState('');
  const [formOrg, setFormOrg] = useState('');
  const [formContact, setFormContact] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const reloadData = () => {
    setClients(StorageService.getClients());
    setOrders(StorageService.getOrders());
  };

  const handleStartAdd = () => {
    audio.playClick();
    setIsAddingNew(true);
    setEditingClientId(null);
    setSelectedClientId(null);
    setFormName('');
    setFormOrg('');
    setFormContact('');
    setFormNotes('');
  };

  const handleStartEdit = (client: ClientProfile, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    audio.playClick();
    setEditingClientId(client.id);
    setIsAddingNew(false);
    setFormName(client.name);
    setFormOrg(client.organization || '');
    setFormContact(client.contact || '');
    setFormNotes(client.notes || '');
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    audio.playSuccess();
    const updated = StorageService.saveOrUpdateClient({
      name: formName.trim(),
      organization: formOrg.trim() || undefined,
      contact: formContact.trim() || undefined,
      notes: formNotes.trim() || undefined
    });

    setIsAddingNew(false);
    setEditingClientId(null);
    setSelectedClientId(updated.id);
    reloadData();
  };

  const handleDeleteClient = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    audio.playAlert();
    StorageService.deleteClient(id);
    if (selectedClientId === id) setSelectedClientId(null);
    reloadData();
  };

  const filteredClients = clients.filter(c => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.organization && c.organization.toLowerCase().includes(q)) ||
      (c.contact && c.contact.toLowerCase().includes(q)) ||
      (c.organizationsHistory && c.organizationsHistory.some(org => org.toLowerCase().includes(q))) ||
      (c.contactsHistory && c.contactsHistory.some(cont => cont.toLowerCase().includes(q))) ||
      (c.notes && c.notes.toLowerCase().includes(q))
    );
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Répertoire & Base de Données Clients"
      subtitle="Fiches clients automatiques avec historique des commandes, factions et contacts Discord/Spectrum"
      icon={<Users className="w-5 h-5 text-sc-cyan" />}
      maxWidth="3xl"
    >
      <div className="space-y-4 font-sans text-xs">
        {/* Top Search & Add Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-sc-cyan absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Rechercher par nom, faction, contact Discord/Spectrum..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-[#090e18] border border-sc-border focus:border-sc-cyan rounded-lg font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={handleStartAdd}
            className="px-3 py-1.5 rounded-lg bg-sc-cyan hover:bg-cyan-400 text-slate-950 font-bold font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-neon-cyan transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau Client</span>
          </button>
        </div>

        {/* Add / Edit Form Panel */}
        {(isAddingNew || editingClientId) && (
          <form onSubmit={handleSaveForm} className="p-3.5 bg-sc-card border border-sc-cyan/50 rounded-xl space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-sc-cyan uppercase">
              <span>{isAddingNew ? '➕ Ajouter un Nouveau Client' : '✏️ Modifier la Fiche Client'}</span>
              <button
                type="button"
                onClick={() => {
                  setIsAddingNew(false);
                  setEditingClientId(null);
                }}
                className="text-slate-400 hover:text-slate-200"
              >
                ✕ Annuler
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Nom du Client *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Capitaine Jax"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#090e18] border border-sc-border rounded text-slate-100 font-sans focus:outline-none focus:border-sc-cyan"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Organisation / Faction</label>
                <input
                  type="text"
                  placeholder="Ex: Red Sun Logistics"
                  value={formOrg}
                  onChange={(e) => setFormOrg(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#090e18] border border-sc-border rounded text-slate-100 font-sans focus:outline-none focus:border-sc-cyan"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Contact (Discord / Spectrum)</label>
                <input
                  type="text"
                  placeholder="Ex: @Jax#9999 ou Spectrum: Jax"
                  value={formContact}
                  onChange={(e) => setFormContact(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#090e18] border border-sc-border rounded text-slate-100 font-sans focus:outline-none focus:border-sc-cyan"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Notes & Instructions Client</label>
              <input
                type="text"
                placeholder="Ex: Préfère livraison à Grim HEX, minerais fournis souvent..."
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-[#090e18] border border-sc-border rounded text-slate-100 font-sans focus:outline-none focus:border-sc-cyan"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-sc-cyan text-slate-950 font-bold font-mono uppercase tracking-wider flex items-center gap-1 hover:bg-cyan-400 transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                Enregistrer la Fiche
              </button>
            </div>
          </form>
        )}

        {/* Clients Directory List with Accordion / Detail View */}
        <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1 custom-scrollbar">
          {filteredClients.length > 0 ? (
            filteredClients.map(client => {
              const isExpanded = selectedClientId === client.id;
              const clientOrders = orders.filter(
                o => o.clientName.toLowerCase().trim() === client.name.toLowerCase().trim()
              );
              const totalSpent = clientOrders.reduce((acc, o) => acc + (o.totalPriceAUEC || 0), 0);
              const orgsList = client.organizationsHistory && client.organizationsHistory.length > 0
                ? client.organizationsHistory
                : (client.organization ? [client.organization] : []);
              const contactsList = client.contactsHistory && client.contactsHistory.length > 0
                ? client.contactsHistory
                : (client.contact ? [client.contact] : []);

              return (
                <div
                  key={client.id}
                  className={`rounded-xl border transition-all overflow-hidden ${
                    isExpanded
                      ? 'bg-[#0b1322] border-sc-cyan/60 shadow-lg'
                      : 'bg-sc-card/70 border-sc-border hover:border-sc-cyan/30'
                  }`}
                >
                  {/* Card Header (Click to expand/collapse) */}
                  <div
                    onClick={() => {
                      audio.playClick();
                      setSelectedClientId(isExpanded ? null : client.id);
                    }}
                    className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-100 text-sm font-sans flex items-center gap-1.5">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-sc-cyan" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-500" />
                          )}
                          {client.name}
                        </span>

                        {client.organization && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/60 flex items-center gap-1">
                            <Building className="w-3 h-3 text-cyan-400" />
                            {client.organization}
                          </span>
                        )}

                        {client.contact && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/60 flex items-center gap-1">
                            <Mail className="w-3 h-3 text-purple-400" />
                            {client.contact}
                          </span>
                        )}
                      </div>

                      {client.notes && (
                        <p className="text-[11px] font-mono text-slate-400 italic pl-5.5">
                          &ldquo;{client.notes}&rdquo;
                        </p>
                      )}
                    </div>

                    {/* Stats pill & Action buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right font-mono text-[11px] px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800">
                        <span className="text-slate-400">{clientOrders.length} commande(s)</span>
                        <span className="text-emerald-400 font-bold block">{totalSpent.toLocaleString('fr-FR')} aUEC</span>
                      </div>

                      {onSelectClient && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            audio.playClick();
                            onSelectClient(client.name);
                            onClose();
                          }}
                          className="px-2.5 py-1.5 rounded bg-sc-cyan hover:bg-cyan-400 text-slate-950 font-bold text-[11px] font-mono uppercase tracking-wider flex items-center gap-1 transition-colors"
                          title="Créer une nouvelle commande pour ce client"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Commander</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) => handleStartEdit(client, e)}
                        className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="Modifier la fiche client"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteClient(client.id, e)}
                        className="p-1.5 rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 transition-colors"
                        title="Supprimer la fiche"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Section: 360° History (Orgs, Contacts, Past Orders) */}
                  {isExpanded && (
                    <div className="p-3.5 bg-[#070b14] border-t border-slate-800 space-y-3.5 animate-in fade-in duration-150">
                      {/* Organization & Contact History Badges */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Factions / Orgs History */}
                        <div className="p-2.5 rounded-lg bg-sc-card/60 border border-slate-800 space-y-1.5">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-1">
                            <Building className="w-3 h-3" />
                            Historique des Factions & Organisations ({orgsList.length})
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {orgsList.length > 0 ? (
                              orgsList.map((org, i) => (
                                <span key={i} className="px-2 py-0.5 rounded bg-slate-800 border border-cyan-900/40 text-cyan-300 font-mono text-[10px]">
                                  {org} {i === 0 ? '★ Actuelle' : ''}
                                </span>
                              ))
                            ) : (
                              <span className="text-[10px] font-mono text-slate-500 italic">Aucune organisation enregistrée</span>
                            )}
                          </div>
                        </div>

                        {/* Contacts History (Discord / Spectrum) */}
                        <div className="p-2.5 rounded-lg bg-sc-card/60 border border-slate-800 space-y-1.5">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-bold flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            Historique des Contacts Discord / Spectrum ({contactsList.length})
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {contactsList.length > 0 ? (
                              contactsList.map((cont, i) => (
                                <span key={i} className="px-2 py-0.5 rounded bg-slate-800 border border-purple-900/40 text-purple-300 font-mono text-[10px]">
                                  {cont} {i === 0 ? '★ Actuel' : ''}
                                </span>
                              ))
                            ) : (
                              <span className="text-[10px] font-mono text-slate-500 italic">Aucun contact enregistré</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Orders History List */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-sc-cyan font-bold flex items-center gap-1.5">
                          <ShoppingBag className="w-3.5 h-3.5" />
                          Historique Complet des Commandes ({clientOrders.length})
                        </span>

                        {clientOrders.length > 0 ? (
                          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                            {clientOrders.map(order => (
                              <div
                                key={order.id}
                                className="p-2 rounded-lg bg-slate-900/90 border border-slate-800/80 flex items-center justify-between gap-2 text-[11px] font-mono"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-sc-cyan font-bold">{order.orderNumber}</span>
                                  <OrderStatusBadge status={order.status} />
                                  <span className="text-slate-400">
                                    {order.items.map(i => `${i.quantity}x ${i.blueprintName}`).join(', ')}
                                  </span>
                                </div>

                                <div className="flex items-center gap-3 shrink-0">
                                  <span className="text-emerald-400 font-bold">{order.totalPriceAUEC.toLocaleString('fr-FR')} aUEC</span>
                                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                                    order.isPaid ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                                  }`}>
                                    {order.isPaid ? 'PAYÉ' : 'EN ATTENTE'}
                                  </span>
                                  <span className="text-slate-500 text-[10px]">
                                    {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] font-mono text-slate-500 italic">
                            Aucune commande enregistrée pour l'instant pour ce client.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-slate-500 font-mono space-y-2">
              <Users className="w-8 h-8 text-slate-600 mx-auto" />
              <p>Aucun client enregistré dans la base de données.</p>
              <p className="text-[11px] text-slate-600">
                Chaque commande créée enregistre automatiquement le client et son historique ici.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs font-mono text-slate-400">
          <span>{clients.length} fiche(s) client(s) répertoriée(s)</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-700 bg-sc-card hover:bg-slate-800 text-slate-300 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </Modal>
  );
};

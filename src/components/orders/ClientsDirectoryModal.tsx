import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { ClientProfile } from '../../types';
import { StorageService } from '../../services/storageService';
import {
  Users,
  Search,
  Building,
  Mail,
  Trash2,
  Plus,
  Edit2,
  Save
} from 'lucide-react';
import { audio } from '../../services/audioService';

interface ClientsDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectClient?: (client: ClientProfile) => void;
}

export const ClientsDirectoryModal: React.FC<ClientsDirectoryModalProps> = ({
  isOpen,
  onClose,
  onSelectClient
}) => {
  const [clients, setClients] = useState<ClientProfile[]>(() => StorageService.getClients());
  const [searchQuery, setSearchQuery] = useState('');
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Form fields for editing/adding
  const [formName, setFormName] = useState('');
  const [formOrg, setFormOrg] = useState('');
  const [formContact, setFormContact] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const reloadClients = () => {
    setClients(StorageService.getClients());
  };

  const handleStartAdd = () => {
    audio.playClick();
    setIsAddingNew(true);
    setEditingClientId(null);
    setFormName('');
    setFormOrg('');
    setFormContact('');
    setFormNotes('');
  };

  const handleStartEdit = (client: ClientProfile) => {
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
    StorageService.saveOrUpdateClient({
      name: formName.trim(),
      organization: formOrg.trim() || undefined,
      contact: formContact.trim() || undefined,
      notes: formNotes.trim() || undefined
    });

    setIsAddingNew(false);
    setEditingClientId(null);
    reloadClients();
  };

  const handleDeleteClient = (id: string) => {
    audio.playAlert();
    StorageService.deleteClient(id);
    reloadClients();
  };

  const filteredClients = clients.filter(c => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.organization && c.organization.toLowerCase().includes(q)) ||
      (c.contact && c.contact.toLowerCase().includes(q)) ||
      (c.notes && c.notes.toLowerCase().includes(q))
    );
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Répertoire & Base de Données Clients"
      subtitle="Consultez, ajoutez et gérez vos clients, organisations et contacts enregistrés"
      icon={<Users className="w-5 h-5 text-sc-cyan" />}
      maxWidth="2xl"
    >
      <div className="space-y-4 font-sans text-xs">
        {/* Top Search & Add Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-sc-cyan absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Rechercher par nom, organisation, discord..."
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
                <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Nom *</label>
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
                <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Organisation</label>
                <input
                  type="text"
                  placeholder="Ex: Red Sun Logistics"
                  value={formOrg}
                  onChange={(e) => setFormOrg(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#090e18] border border-sc-border rounded text-slate-100 font-sans focus:outline-none focus:border-sc-cyan"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Contact / Discord</label>
                <input
                  type="text"
                  placeholder="Ex: @Jax#9999"
                  value={formContact}
                  onChange={(e) => setFormContact(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#090e18] border border-sc-border rounded text-slate-100 font-sans focus:outline-none focus:border-sc-cyan"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Notes / Préférences</label>
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
                Enregistrer
              </button>
            </div>
          </form>
        )}

        {/* Clients Directory List */}
        <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1 custom-scrollbar">
          {filteredClients.length > 0 ? (
            filteredClients.map(client => (
              <div
                key={client.id}
                className="p-3 rounded-xl bg-sc-card/70 border border-sc-border hover:border-sc-cyan/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-100 text-sm font-sans">
                      {client.name}
                    </span>
                    {client.organization && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700 flex items-center gap-1">
                        <Building className="w-3 h-3 text-cyan-400" />
                        {client.organization}
                      </span>
                    )}
                    {client.contact && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-purple-300 border border-slate-700 flex items-center gap-1">
                        <Mail className="w-3 h-3 text-purple-400" />
                        {client.contact}
                      </span>
                    )}
                  </div>

                  {client.notes && (
                    <p className="text-[11px] font-mono text-slate-400 italic">
                      &ldquo;{client.notes}&rdquo;
                    </p>
                  )}

                  <div className="text-[10px] font-mono text-slate-500">
                    Enregistré le {new Date(client.createdAt).toLocaleDateString('fr-FR')}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                  {onSelectClient && (
                    <button
                      type="button"
                      onClick={() => {
                        audio.playClick();
                        onSelectClient(client);
                        onClose();
                      }}
                      className="px-2.5 py-1 rounded bg-sc-cyan/15 hover:bg-sc-cyan/25 border border-sc-cyan/30 text-sc-cyan text-[11px] font-mono uppercase transition-colors"
                    >
                      Sélectionner
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleStartEdit(client)}
                    className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="Modifier la fiche"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteClient(client.id)}
                    className="p-1.5 rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 transition-colors"
                    title="Supprimer ce client"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-slate-500 font-mono space-y-2">
              <Users className="w-8 h-8 text-slate-600 mx-auto" />
              <p>Aucun client enregistré dans la base de données.</p>
              <p className="text-[11px] text-slate-600">
                Chaque nom de client saisi lors de la création d'une commande sera automatiquement sauvegardé ici.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs font-mono text-slate-400">
          <span>{clients.length} client(s) dans votre carnet</span>
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

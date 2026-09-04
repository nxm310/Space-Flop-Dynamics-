import React, { useState, useRef } from 'react';
import { CustomerOrder, Blueprint, RefinedStockItem, OrderStatus, ClientProfile } from '../../types';
import { CreateOrderModal } from './CreateOrderModal';
import { OrderDetailsModal } from './OrderDetailsModal';
import { StatCard } from '../common/StatCard';
import { OrderStatusBadge, Badge } from '../common/Badge';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { ImportExportService } from '../../services/importExportService';
import { StorageService } from '../../services/storageService';
import {
  ClipboardList,
  Plus,
  Search,
  Filter,
  FileSpreadsheet,
  FileJson,
  Upload,
  Trash2,
  Coins,
  Clock,
  PackageCheck,
  Hammer,
  Edit
} from 'lucide-react';
import { audio } from '../../services/audioService';

interface OrderBookViewProps {
  orders: CustomerOrder[];
  allBlueprints: Blueprint[];
  stock: RefinedStockItem[];
  onCreateOrder: (order: Omit<CustomerOrder, 'id' | 'orderNumber' | 'createdAt'>) => void;
  onUpdateOrder?: (order: CustomerOrder) => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onDeleteOrder: (orderId: string) => void;
  onExecuteFabrication: (order: CustomerOrder) => void;
  onTogglePaid: (orderId: string) => void;
  onImportOrdersData?: (data: { orders: CustomerOrder[]; clients: ClientProfile[] }) => void;
  prefillBlueprint?: Blueprint | null;
  onClearPrefillBlueprint?: () => void;
}

export const OrderBookView: React.FC<OrderBookViewProps> = ({
  orders,
  allBlueprints,
  stock,
  onCreateOrder,
  onUpdateOrder,
  onUpdateStatus,
  onDeleteOrder,
  onExecuteFabrication,
  onTogglePaid,
  onImportOrdersData,
  prefillBlueprint,
  onClearPrefillBlueprint
}) => {
  const jsonFileInputRef = useRef<HTMLInputElement | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState<CustomerOrder | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);

  // Auto-open create modal if prefillBlueprint is given
  React.useEffect(() => {
    if (prefillBlueprint) {
      setIsCreateModalOpen(true);
    }
  }, [prefillBlueprint]);

  // Filter orders
  const filteredOrders = orders.filter(order => {
    if (statusFilter !== 'all' && order.status !== statusFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchesClient = order.clientName.toLowerCase().includes(q);
      const matchesOrg = order.clientOrg && order.clientOrg.toLowerCase().includes(q);
      const matchesNumber = order.orderNumber.toLowerCase().includes(q);
      const matchesItems = order.items.some(i => i.blueprintName.toLowerCase().includes(q));

      if (!matchesClient && !matchesOrg && !matchesNumber && !matchesItems) {
        return false;
      }
    }

    return true;
  });

  // KPI calculations
  const pendingCount = orders.filter(o => o.status === 'pending_resources' || o.status === 'draft').length;
  const inProdCount = orders.filter(o => o.status === 'in_production' || o.status === 'refining').length;
  const readyCount = orders.filter(o => o.status === 'ready').length;
  const completedTotalAUEC = orders.filter(o => o.status === 'completed').reduce((acc, o) => acc + o.totalPriceAUEC, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-sans tracking-wide text-slate-100 uppercase flex items-center gap-2.5">
            <ClipboardList className="w-6 h-6 text-sc-cyan" />
            Carnet de Commandes Clients & Production
          </h2>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Gérez vos commandes d'items, suivez les dépôts de minerais clients et calculez vos marges de fabrication
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Hidden JSON Input for Orders */}
          <input
            type="file"
            ref={jsonFileInputRef}
            accept=".json,application/json"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              audio.playClick();
              const res = await ImportExportService.importOrdersFromJSON(file);
              if (res.success && res.orders.length > 0) {
                audio.playSuccess();
                if (res.clients && res.clients.length > 0) {
                  const existingClients = StorageService.getClients();
                  const clientMap = new Map(existingClients.map(c => [c.name.toLowerCase().trim(), c]));
                  res.clients.forEach(c => clientMap.set(c.name.toLowerCase().trim(), c));
                  StorageService.saveClients(Array.from(clientMap.values()));
                }
                if (onImportOrdersData) {
                  onImportOrdersData({ orders: res.orders, clients: res.clients });
                }
              } else {
                audio.playAlert();
                alert(res.errors.join('\n') || 'Erreur lors de l\'importation du fichier JSON de commandes.');
              }
              e.target.value = '';
            }}
            className="hidden"
          />

          <button
            onClick={() => {
              audio.playClick();
              jsonFileInputRef.current?.click();
            }}
            className="px-3 py-2 rounded-lg border border-slate-700 bg-sc-card hover:bg-slate-800 text-slate-200 text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors"
            title="Importer un carnet de commandes en JSON"
          >
            <Upload className="w-4 h-4 text-sc-cyan" />
            <span className="hidden sm:inline">Import JSON</span>
          </button>

          <button
            onClick={() => {
              audio.playClick();
              const clients = StorageService.getClients();
              ImportExportService.exportOrdersToJSON(orders, clients);
            }}
            disabled={orders.length === 0}
            className="px-3 py-2 rounded-lg border border-slate-700 bg-sc-card hover:bg-slate-800 text-slate-200 text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors disabled:opacity-40"
            title="Exporter l'ensemble de vos commandes clients en format JSON (.json)"
          >
            <FileJson className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Export JSON</span>
          </button>

          <button
            onClick={() => {
              audio.playClick();
              ImportExportService.exportOrdersToExcel(orders);
            }}
            disabled={orders.length === 0}
            className="px-3 py-2 rounded-lg border border-slate-700 bg-sc-card hover:bg-slate-800 text-slate-200 text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-colors disabled:opacity-40"
            title="Exporter le carnet de commandes en Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Export Excel</span>
          </button>

          <button
            onClick={() => {
              audio.playClick();
              setIsCreateModalOpen(true);
            }}
            className="px-4 py-2 rounded-lg bg-sc-cyan hover:bg-cyan-400 text-slate-950 font-bold border border-sc-cyan shadow-neon-cyan text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            Nouvelle Commande
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="En Attente de Ressources"
          value={pendingCount}
          subValue="Minerais à collecter"
          icon={<Clock className="w-5 h-5" />}
          accent="gold"
        />
        <StatCard
          title="En Fabrication"
          value={inProdCount}
          subValue="Atelier & Raffinage"
          icon={<Hammer className="w-5 h-5" />}
          accent="cyan"
        />
        <StatCard
          title="Prêtes pour Livraison"
          value={readyCount}
          subValue="À expédier aux clients"
          icon={<PackageCheck className="w-5 h-5" />}
          accent="green"
        />
        <StatCard
          title="Chiffre d'Affaires Livré"
          value={`${completedTotalAUEC.toLocaleString('fr-FR')} aUEC`}
          subValue="Commandes terminées"
          icon={<Coins className="w-5 h-5" />}
          accent="purple"
        />
      </div>

      {/* Search and Pipeline Filter Bar */}
      <div className="bg-sc-card/60 border border-sc-border rounded-xl p-3.5 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Rechercher client, N° commande, item..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-sc-panel border border-sc-border focus:border-sc-cyan rounded-lg text-xs font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
            {[
              { key: 'all', label: 'Toutes' },
              { key: 'pending_resources', label: 'En attente' },
              { key: 'in_production', label: 'En fabrication' },
              { key: 'ready', label: 'Prêtes' },
              { key: 'completed', label: 'Livrées' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => {
                  audio.playClick();
                  setStatusFilter(tab.key);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors shrink-0 ${
                  statusFilter === tab.key
                    ? 'bg-sc-cyan/20 border border-sc-cyan/40 text-sc-cyan font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      {filteredOrders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map((order) => {
            const totalItemsCount = order.items.reduce((acc, i) => acc + i.quantity, 0);

            return (
              <div
                key={order.id}
                onClick={() => {
                  audio.playClick();
                  setSelectedOrder(order);
                }}
                className="bg-sc-card border border-sc-border hover:border-sc-cyan/50 rounded-xl p-4 flex flex-col justify-between gap-4 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.01] group"
              >
                <div>
                  {/* Top Bar: Order Number & Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 block">
                        {order.orderNumber}
                      </span>
                      <h4 className="text-base font-bold font-sans text-slate-100 group-hover:text-sc-cyan transition-colors mt-0.5">
                        {order.clientName}
                      </h4>
                      {order.clientOrg && (
                        <p className="text-xs font-mono text-slate-400">{order.clientOrg}</p>
                      )}
                    </div>

                    <div className="text-right flex flex-col items-end gap-1">
                      <OrderStatusBadge status={order.status} />
                      <Badge variant={order.isPaid ? 'green' : 'slate'} size="sm">
                        {order.isPaid ? 'Payé' : 'Non payé'}
                      </Badge>
                    </div>
                  </div>

                  {/* Items List Preview */}
                  <div className="mt-3.5 p-2.5 rounded-lg bg-sc-panel/70 border border-sc-border/50 space-y-1.5 text-xs font-mono">
                    <span className="text-[10px] text-slate-400 block uppercase">
                      Articles ({totalItemsCount}) :
                    </span>
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-slate-200">
                        <span className="truncate">{item.quantity}x {item.blueprintName}</span>
                        <span className="text-emerald-400 font-bold shrink-0">{item.totalLaborCostAUEC.toLocaleString('fr-FR')} aUEC</span>
                      </div>
                    ))}
                  </div>

                  {/* Client Supplied Minerals Pill */}
                  {order.clientSuppliedMinerals.length > 0 && (
                    <div className="mt-2.5 flex items-center gap-1.5 flex-wrap text-[11px] font-mono text-amber-400 bg-amber-950/20 p-2 rounded-lg border border-amber-500/20">
                      <span className="text-amber-500 text-[10px] uppercase font-bold">Minerais client :</span>
                      {order.clientSuppliedMinerals.map((dep, idx) => (
                        <span key={idx} className="px-1.5 py-0.2 rounded bg-amber-900/40 text-amber-300 border border-amber-700/50">
                          {dep.quantitySCU} SCU {dep.mineralName}
                        </span>
                      ))}
                    </div>
                  )}

                  {order.notes && (
                    <div className="mt-2 text-[11px] text-slate-400 font-mono italic truncate">
                      &ldquo;{order.notes}&rdquo;
                    </div>
                  )}
                </div>

                {/* Bottom Card Bar */}
                <div className="flex items-center justify-between pt-3 border-t border-sc-border/60 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Montant Total</span>
                    <span className="text-base font-bold text-emerald-400">{order.totalPriceAUEC.toLocaleString('fr-FR')} aUEC</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        audio.playClick();
                        setOrderToEdit(order);
                        setIsCreateModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-sc-cyan hover:bg-sc-cyan/15 rounded transition-colors"
                      title="Modifier cette commande"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOrderToDelete(order.id);
                      }}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded transition-colors"
                      title="Supprimer la commande"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <span className="text-sc-cyan group-hover:underline text-[11px] uppercase tracking-wider ml-1">
                      Détails →
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-sc-card/40 border border-sc-border/60 rounded-xl p-12 text-center">
          <ClipboardList className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-300 font-sans uppercase">
            Aucune commande trouvée
          </h4>
          <p className="text-xs text-slate-500 font-mono mt-1 max-w-md mx-auto">
            {searchQuery
              ? 'Aucune commande ne correspond à votre filtre de recherche.'
              : 'Enregistrez votre première commande client avec le bouton "Nouvelle Commande".'}
          </p>
          <button
            onClick={() => {
              audio.playClick();
              setOrderToEdit(null);
              setIsCreateModalOpen(true);
            }}
            className="mt-4 px-4 py-2 rounded-lg bg-sc-cyan text-slate-950 font-bold font-mono text-xs uppercase"
          >
            Créer une commande
          </button>
        </div>
      )}

      {/* Create / Edit Order Modal */}
      <CreateOrderModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setOrderToEdit(null);
          if (onClearPrefillBlueprint) onClearPrefillBlueprint();
        }}
        onCreateOrder={onCreateOrder}
        onUpdateOrder={(updated) => {
          if (onUpdateOrder) onUpdateOrder(updated);
          setIsCreateModalOpen(false);
          setOrderToEdit(null);
        }}
        orderToEdit={orderToEdit}
        allBlueprints={allBlueprints}
        prefillBlueprint={prefillBlueprint}
      />

      {/* Order Details Modal */}
      <OrderDetailsModal
        isOpen={selectedOrder !== null}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
        stock={stock}
        onUpdateStatus={(orderId, st) => {
          onUpdateStatus(orderId, st);
          if (selectedOrder) {
            setSelectedOrder({ ...selectedOrder, status: st });
          }
        }}
        onExecuteFabrication={(ord) => {
          onExecuteFabrication(ord);
          setSelectedOrder({ ...ord, status: 'in_production' });
        }}
        onTogglePaid={(orderId) => {
          onTogglePaid(orderId);
          if (selectedOrder) {
            setSelectedOrder({ ...selectedOrder, isPaid: !selectedOrder.isPaid });
          }
        }}
        onEditOrder={(ord) => {
          setSelectedOrder(null);
          setOrderToEdit(ord);
          setIsCreateModalOpen(true);
        }}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={orderToDelete !== null}
        onClose={() => setOrderToDelete(null)}
        onConfirm={() => {
          if (orderToDelete) {
            onDeleteOrder(orderToDelete);
            setOrderToDelete(null);
          }
        }}
        title="Supprimer la commande ?"
        message="Êtes-vous sûr de vouloir supprimer cette commande du carnet ?"
      />
    </div>
  );
};

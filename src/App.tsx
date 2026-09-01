import { useState, useEffect, useCallback } from 'react';
import {
  RawCargoItem,
  RefinedStockItem,
  RefineryJob,
  CustomerOrder,
  Blueprint,
  AppSettings,
  AppDataBackup,
  OrderStatus
} from './types';
import { StorageService } from './services/storageService';
import { STAR_CITIZEN_BLUEPRINTS } from './data/blueprintsData';
import { ToastContainer, ToastMessage } from './components/common/Toast';
import { SettingsModal } from './components/settings/SettingsModal';
import { WhatsNewModal, CURRENT_APP_VERSION, STORAGE_KEY_LAST_SEEN_VERSION } from './components/common/WhatsNewModal';
import { audio } from './services/audioService';

// Module Views
import { DashboardView } from './components/dashboard/DashboardView';
import { MiningCargoView } from './components/mining/MiningCargoView';
import { RefineryView } from './components/refinery/RefineryView';
import { RefinedInventoryView } from './components/inventory/RefinedInventoryView';
import { BlueprintsCatalogView } from './components/blueprints/BlueprintsCatalogView';
import { OrderBookView } from './components/orders/OrderBookView';
import { ImportExportView } from './components/importExport/ImportExportView';

// Sub Modals triggered from header or dashboard
import { AddRawCargoModal } from './components/mining/AddRawCargoModal';
import { RefineryCalculatorModal } from './components/refinery/RefineryCalculatorModal';
import { CreateOrderModal } from './components/orders/CreateOrderModal';

// Icons
import {
  LayoutDashboard,
  Pickaxe,
  Flame,
  Boxes,
  Scroll,
  ClipboardList,
  FileSpreadsheet,
  Settings,
  Volume2,
  VolumeX,
  Plus,
  Sparkles,
  Menu,
  X
} from 'lucide-react';

export function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Core Data State
  const [rawCargo, setRawCargo] = useState<RawCargoItem[]>(() => StorageService.getRawCargo());
  const [refinedStock, setRefinedStock] = useState<RefinedStockItem[]>(() => StorageService.getRefinedStock());
  const [refineryJobs, setRefineryJobs] = useState<RefineryJob[]>(() => StorageService.getRefineryJobs());
  const [customBlueprints, setCustomBlueprints] = useState<Blueprint[]>(() => StorageService.getCustomBlueprints());
  const [orders, setOrders] = useState<CustomerOrder[]>(() => StorageService.getOrders());
  const [settings, setSettings] = useState<AppSettings>(() => StorageService.getSettings());

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modals & Cross-tab prefill states
  const [isWhatsNewOpen, setIsWhatsNewOpen] = useState(() => {
    return localStorage.getItem(STORAGE_KEY_LAST_SEEN_VERSION) !== CURRENT_APP_VERSION;
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddRawModalOpen, setIsAddRawModalOpen] = useState(false);
  const [isRefineryModalOpen, setIsRefineryModalOpen] = useState(false);
  const [isCreateOrderModalOpen, setIsCreateOrderModalOpen] = useState(false);

  const [prefillRawCargo, setPrefillRawCargo] = useState<RawCargoItem | null>(null);
  const [prefillBlueprint, setPrefillBlueprint] = useState<Blueprint | null>(null);

  // Sync sound settings to audio service
  useEffect(() => {
    audio.setEnabled(settings.soundEnabled);
  }, [settings.soundEnabled]);

  // Toast Helper
  const addToast = useCallback((type: ToastMessage['type'], title: string, message?: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  // Save changes to LocalStorage
  useEffect(() => {
    StorageService.saveRawCargo(rawCargo);
  }, [rawCargo]);

  useEffect(() => {
    StorageService.saveRefinedStock(refinedStock);
  }, [refinedStock]);

  useEffect(() => {
    StorageService.saveRefineryJobs(refineryJobs);
  }, [refineryJobs]);

  useEffect(() => {
    StorageService.saveCustomBlueprints(customBlueprints);
  }, [customBlueprints]);

  useEffect(() => {
    StorageService.saveOrders(orders);
  }, [orders]);

  useEffect(() => {
    StorageService.saveSettings(settings);
  }, [settings]);

  // All blueprints combined
  const allBlueprints = [...STAR_CITIZEN_BLUEPRINTS, ...customBlueprints];

  // =========================================================================
  // ACTIONS: RAW MINING CARGO
  // =========================================================================
  const handleAddRawCargo = (item: Omit<RawCargoItem, 'id' | 'extractedAt'>) => {
    const newItem: RawCargoItem = {
      ...item,
      id: `raw-${Date.now()}`,
      extractedAt: new Date().toISOString()
    };
    setRawCargo(prev => [newItem, ...prev]);
    addToast('success', 'Cargaison Enregistrée', `${newItem.quantitySCU} SCU de ${newItem.mineralName} ajoutés à vos cales.`);
  };

  const handleDeleteRawCargo = (id: string) => {
    setRawCargo(prev => prev.filter(c => c.id !== id));
    addToast('info', 'Cargaison supprimée');
  };

  const handleSendToRefinery = (item: RawCargoItem) => {
    setPrefillRawCargo(item);
    setActiveTab('refinery');
  };

  // =========================================================================
  // ACTIONS: REFINERY
  // =========================================================================
  const handleStartRefineryJob = (jobData: Omit<RefineryJob, 'id' | 'startedAt' | 'completesAt' | 'status'>) => {
    const startedAt = new Date().toISOString();
    const completesAt = new Date(Date.now() + jobData.durationMinutes * 60 * 1000).toISOString();

    const newJob: RefineryJob = {
      ...jobData,
      id: `job-${Date.now()}`,
      startedAt,
      completesAt,
      status: 'in_progress'
    };

    setRefineryJobs(prev => [newJob, ...prev]);

    // If prefill cargo was used, we can optionally deduce or clean up raw cargo
    if (prefillRawCargo) {
      setRawCargo(prev => prev.filter(c => c.id !== prefillRawCargo.id));
      setPrefillRawCargo(null);
    }

    addToast('success', 'Raffinage Lancé', `${newJob.inputRawSCU} SCU envoyés à ${newJob.refineryStationName}.`);
  };

  const handleFastForwardJob = (jobId: string) => {
    setRefineryJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        return {
          ...j,
          completesAt: new Date(Date.now() - 1000).toISOString(),
          status: 'completed'
        };
      }
      return j;
    }));
    addToast('info', 'Raffinage accéléré', 'Le minerai est désormais prêt à être collecté.');
  };

  const handleCollectJob = (jobId: string) => {
    const job = refineryJobs.find(j => j.id === jobId);
    if (!job) return;

    // Mark job collected
    setRefineryJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'collected' } : j));

    // Add refined SCU to stock
    setRefinedStock(prev => {
      const existing = prev.find(s =>
        s.mineralId === job.mineralId &&
        s.ownerType === job.targetStockType &&
        (job.targetStockType === 'personal' || s.clientName === job.clientName)
      );

      if (existing) {
        return prev.map(s => s.id === existing.id ? {
          ...s,
          quantitySCU: Number((s.quantitySCU + job.outputEstimatedSCU).toFixed(3)),
          lastUpdated: new Date().toISOString()
        } : s);
      } else {
        const newItem: RefinedStockItem = {
          id: `stock-${Date.now()}`,
          mineralId: job.mineralId,
          mineralName: job.mineralName,
          quantitySCU: job.outputEstimatedSCU,
          ownerType: job.targetStockType,
          clientName: job.clientName,
          lastUpdated: new Date().toISOString(),
          notes: `Issu du raffinage à ${job.refineryStationName}`
        };
        return [newItem, ...prev];
      }
    });

    addToast('success', 'Minerais Collectés', `+${job.outputEstimatedSCU} SCU de ${job.mineralName} transférés dans ${job.targetStockType === 'client' ? `le dépôt de ${job.clientName}` : 'votre stock personnel'}.`);
  };

  const handleDeleteRefineryJob = (jobId: string) => {
    setRefineryJobs(prev => prev.filter(j => j.id !== jobId));
    addToast('info', 'Ordre de raffinage supprimé');
  };

  // =========================================================================
  // ACTIONS: REFINED INVENTORY
  // =========================================================================
  const handleAdjustStock = (item: Omit<RefinedStockItem, 'id' | 'lastUpdated'>, mode: 'add' | 'set' | 'deduct') => {
    setRefinedStock(prev => {
      const existingIdx = prev.findIndex(s =>
        s.mineralId === item.mineralId &&
        s.ownerType === item.ownerType &&
        (item.ownerType === 'personal' || s.clientName === item.clientName)
      );

      if (existingIdx >= 0) {
        const current = prev[existingIdx];
        let newQty = current.quantitySCU;
        if (mode === 'add') newQty += item.quantitySCU;
        else if (mode === 'deduct') newQty = Math.max(0, current.quantitySCU - item.quantitySCU);
        else newQty = item.quantitySCU;

        const updated = [...prev];
        updated[existingIdx] = {
          ...current,
          quantitySCU: Number(newQty.toFixed(3)),
          notes: item.notes || current.notes,
          lastUpdated: new Date().toISOString()
        };
        return updated;
      } else {
        if (mode === 'deduct') return prev;
        const newItem: RefinedStockItem = {
          ...item,
          id: `stock-${Date.now()}`,
          lastUpdated: new Date().toISOString()
        };
        return [newItem, ...prev];
      }
    });

    addToast('success', 'Stock Mis à Jour', `Quantité de ${item.mineralName} modifiée.`);
  };

  const handleUpdateStockItem = (updatedItem: RefinedStockItem) => {
    setRefinedStock(prev => prev.map(s => s.id === updatedItem.id ? {
      ...updatedItem,
      lastUpdated: new Date().toISOString()
    } : s));
    addToast('success', 'Minerai Modifié', `Le lot de ${updatedItem.mineralName} a été mis à jour.`);
  };

  const handleDeleteStockItem = (id: string) => {
    setRefinedStock(prev => prev.filter(s => s.id !== id));
    addToast('info', 'Ligne de stock supprimée');
  };

  // =========================================================================
  // ACTIONS: BLUEPRINTS & CRAFTING
  // =========================================================================
  const handleAddCustomBlueprint = (bp: Blueprint) => {
    const exists = allBlueprints.some(b =>
      b.id.toLowerCase() === bp.id.toLowerCase() ||
      b.name.toLowerCase().trim() === bp.name.toLowerCase().trim()
    );
    if (exists) {
      addToast('warning', 'Déjà Présent', `Le blueprint "${bp.name}" existe déjà dans votre catalogue.`);
      return;
    }
    setCustomBlueprints(prev => [bp, ...prev]);
    addToast('success', 'Blueprint Enregistré', `Le plan "${bp.name}" a été ajouté à votre atelier.`);
  };

  const handleCraftNow = (bp: Blueprint, quantity: number) => {
    // Deduct ingredients from personal stock (or client stock if available)
    setRefinedStock(prev => {
      const updated = [...prev];

      bp.ingredients.forEach(ing => {
        let remainingToDeduct = ing.quantitySCU * quantity;

        // Try personal stock first
        const pIdx = updated.findIndex(s => s.ownerType === 'personal' && (s.mineralId === ing.resourceId || s.mineralName.toLowerCase() === ing.resourceName.toLowerCase()));
        if (pIdx >= 0) {
          const avail = updated[pIdx].quantitySCU;
          const deducted = Math.min(avail, remainingToDeduct);
          updated[pIdx] = {
            ...updated[pIdx],
            quantitySCU: Number((avail - deducted).toFixed(3)),
            lastUpdated: new Date().toISOString()
          };
          remainingToDeduct -= deducted;
        }

        // Deduct remaining from any client stock if needed
        if (remainingToDeduct > 0) {
          const cIdx = updated.findIndex(s => s.ownerType === 'client' && (s.mineralId === ing.resourceId || s.mineralName.toLowerCase() === ing.resourceName.toLowerCase()));
          if (cIdx >= 0) {
            const avail = updated[cIdx].quantitySCU;
            const deducted = Math.min(avail, remainingToDeduct);
            updated[cIdx] = {
              ...updated[cIdx],
              quantitySCU: Number((avail - deducted).toFixed(3)),
              lastUpdated: new Date().toISOString()
            };
          }
        }
      });

      return updated;
    });

    addToast('success', 'Fabrication Effectuée !', `${quantity}x "${bp.name}" fabriqués. Minerais déduits du stock.`);
  };

  const handleCreateOrderFromBlueprint = (bp: Blueprint) => {
    setPrefillBlueprint(bp);
    setActiveTab('orders');
  };

  const handleSyncApiBlueprints = (newBps: Blueprint[]) => {
    // Strict deduplication against existing IDs and normalized names
    const existingIds = new Set(allBlueprints.map(b => b.id.toLowerCase()));
    const existingNames = new Set(allBlueprints.map(b => b.name.toLowerCase().trim()));

    const toAdd = newBps.filter(b => {
      const lowerId = b.id.toLowerCase();
      const lowerName = b.name.toLowerCase().trim();
      return !existingIds.has(lowerId) && !existingNames.has(lowerName);
    });

    if (toAdd.length > 0) {
      setCustomBlueprints(prev => [...toAdd, ...prev]);
      addToast('success', 'Synchronisation Réussie', `${toAdd.length} nouveaux blueprints uniques ajoutés.`);
    } else {
      addToast('info', 'Synchronisation', 'Tous les blueprints sont déjà dans votre catalogue (aucun doublon).');
    }
  };

  // =========================================================================
  // ACTIONS: CUSTOMER ORDERS
  // =========================================================================
  const handleCreateOrder = (orderData: Omit<CustomerOrder, 'id' | 'orderNumber' | 'createdAt'>) => {
    const orderNumber = `CMD-${new Date().getFullYear()}-${String(orders.length + 1).padStart(3, '0')}`;
    const newOrder: CustomerOrder = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber,
      createdAt: new Date().toISOString()
    };

    setOrders(prev => [newOrder, ...prev]);

    // If the client provided minerals in this order, optionally add them to client deposit inventory
    if (newOrder.clientSuppliedMinerals.length > 0) {
      setRefinedStock(prev => {
        let updated = [...prev];
        newOrder.clientSuppliedMinerals.forEach(dep => {
          const existingIdx = updated.findIndex(s => s.ownerType === 'client' && s.clientName === newOrder.clientName && s.mineralId === dep.mineralId);
          if (existingIdx >= 0) {
            updated[existingIdx] = {
              ...updated[existingIdx],
              quantitySCU: Number((updated[existingIdx].quantitySCU + dep.quantitySCU).toFixed(3)),
              lastUpdated: new Date().toISOString()
            };
          } else {
            updated = [
              {
                id: `stock-dep-${Date.now()}-${dep.mineralId}`,
                mineralId: dep.mineralId,
                mineralName: dep.mineralName,
                quantitySCU: dep.quantitySCU,
                ownerType: 'client',
                clientName: newOrder.clientName,
                lastUpdated: new Date().toISOString(),
                notes: `Dépôt pour commande ${orderNumber}`
              },
              ...updated
            ];
          }
        });
        return updated;
      });
    }

    addToast('success', 'Commande Enregistrée', `Commande ${orderNumber} créée pour ${newOrder.clientName}.`);
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    addToast('info', 'Statut de Commande Mis à Jour');
  };

  const handleDeleteOrder = (orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
    addToast('info', 'Commande supprimée');
  };

  const handleTogglePaid = (orderId: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, isPaid: !o.isPaid } : o));
  };

  const handleExecuteFabrication = (order: CustomerOrder) => {
    // 1. Calculate required minerals
    const totalRequired: Record<string, number> = {};
    order.items.forEach(item => {
      item.requiredIngredients.forEach(ing => {
        totalRequired[ing.resourceId] = (totalRequired[ing.resourceId] || 0) + (ing.quantitySCU * item.quantity);
      });
    });

    // 2. Deduct from client deposit first, then personal stock
    setRefinedStock(prev => {
      const updated = [...prev];

      Object.keys(totalRequired).forEach(mineralId => {
        let needed = totalRequired[mineralId];

        // Deduct from client deposit
        const clientStockIdx = updated.findIndex(s => s.ownerType === 'client' && s.clientName === order.clientName && s.mineralId === mineralId);
        if (clientStockIdx >= 0) {
          const avail = updated[clientStockIdx].quantitySCU;
          const ded = Math.min(avail, needed);
          updated[clientStockIdx] = {
            ...updated[clientStockIdx],
            quantitySCU: Number((avail - ded).toFixed(3)),
            lastUpdated: new Date().toISOString()
          };
          needed -= ded;
        }

        // Deduct remaining from personal stock
        if (needed > 0) {
          const persStockIdx = updated.findIndex(s => s.ownerType === 'personal' && s.mineralId === mineralId);
          if (persStockIdx >= 0) {
            const avail = updated[persStockIdx].quantitySCU;
            const ded = Math.min(avail, needed);
            updated[persStockIdx] = {
              ...updated[persStockIdx],
              quantitySCU: Number((avail - ded).toFixed(3)),
              lastUpdated: new Date().toISOString()
            };
          }
        }
      });

      return updated;
    });

    // 3. Update order status to ready
    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'ready' } : o));

    addToast('success', 'Fabrication Terminée !', `La commande ${order.orderNumber} est prête pour livraison.`);
  };

  // =========================================================================
  // ACTIONS: IMPORT / EXPORT & BACKUPS
  // =========================================================================
  const handleImportStock = (items: RefinedStockItem[], mode: 'replace' | 'merge') => {
    if (mode === 'replace') {
      setRefinedStock(items);
    } else {
      setRefinedStock(prev => {
        const merged = [...prev];
        items.forEach(newItem => {
          const idx = merged.findIndex(s =>
            s.mineralId === newItem.mineralId &&
            s.ownerType === newItem.ownerType &&
            (newItem.ownerType === 'personal' || s.clientName === newItem.clientName)
          );
          if (idx >= 0) {
            merged[idx] = {
              ...merged[idx],
              quantitySCU: Number((merged[idx].quantitySCU + newItem.quantitySCU).toFixed(3)),
              lastUpdated: new Date().toISOString()
            };
          } else {
            merged.push(newItem);
          }
        });
        return merged;
      });
    }

    addToast('success', 'Importation Réussie', `${items.length} lignes de minerais importées avec succès.`);
    setActiveTab('inventory');
  };

  const handleRestoreBackup = (backup: AppDataBackup) => {
    if (backup.rawCargo) setRawCargo(backup.rawCargo);
    if (backup.refinedStock) setRefinedStock(backup.refinedStock);
    if (backup.refineryJobs) setRefineryJobs(backup.refineryJobs);
    if (backup.customBlueprints) setCustomBlueprints(backup.customBlueprints);
    if (backup.orders) setOrders(backup.orders);
    if (backup.settings) setSettings(backup.settings);
    addToast('success', 'Restauration Terminée', 'Toutes vos données ont été restaurées.');
  };

  const handleClearAllData = () => {
    StorageService.clearAllData();
    setRawCargo([]);
    setRefinedStock([]);
    setRefineryJobs([]);
    setCustomBlueprints([]);
    setOrders([]);
    addToast('info', 'Remise à Zéro Complète', 'Toutes les données (minerais, commandes, raffinages, cargaisons) ont été effacées.');
  };

  // Mobile navigation state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Nav Tabs configuration
  const navTabs = [
    { id: 'dashboard', label: 'Tableau de Bord', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'mining', label: 'Minage Brut', icon: <Pickaxe className="w-4 h-4" />, badge: rawCargo.length > 0 ? String(rawCargo.length) : undefined },
    { id: 'refinery', label: 'Raffinerie', icon: <Flame className="w-4 h-4" />, badge: refineryJobs.filter(j => j.status === 'in_progress').length > 0 ? String(refineryJobs.filter(j => j.status === 'in_progress').length) : undefined },
    { id: 'inventory', label: 'Stock Minerais', icon: <Boxes className="w-4 h-4" /> },
    { id: 'blueprints', label: 'Blueprints', icon: <Scroll className="w-4 h-4" /> },
    { id: 'orders', label: 'Commandes', icon: <ClipboardList className="w-4 h-4" />, badge: orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length > 0 ? String(orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length) : undefined },
    { id: 'importExport', label: 'Import / Export', icon: <FileSpreadsheet className="w-4 h-4" /> }
  ];

  const totalRawHeaderSCU = rawCargo.reduce((a, c) => a + c.quantitySCU, 0);
  const totalRefinedHeaderSCU = refinedStock.reduce((a, s) => a + s.quantitySCU, 0);

  return (
    <div className="min-h-screen bg-[#070a10] text-slate-100 sc-grid-bg flex flex-col font-sans">
      {/* Sleek Star Citizen HUD Header */}
      <header className="sticky top-0 z-40 bg-[#0c121e]/95 backdrop-blur-xl border-b border-sc-border/90 shadow-2xl shadow-black/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between gap-3">
            
            {/* LEFT: Branding & Logo */}
            <div
              onClick={() => {
                audio.playClick();
                setActiveTab('dashboard');
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-2.5 cursor-pointer group shrink-0"
            >
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-sc-cyan via-cyan-600 to-slate-900 p-0.5 shadow-neon-cyan transition-transform group-hover:scale-105">
                <div className="w-full h-full bg-[#0c121e] rounded-[7px] flex items-center justify-center text-sc-cyan group-hover:bg-sc-cyan group-hover:text-slate-950 transition-colors">
                  <Pickaxe className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="font-extrabold font-sans text-base tracking-wider text-slate-100 uppercase group-hover:text-sc-cyan transition-colors">
                    STAR CITIZEN
                  </span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-sc-cyan/15 text-sc-cyan border border-sc-cyan/30 uppercase">
                    HUD
                  </span>
                </div>
                <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block mt-1">
                  SUITE MINAGE & RAFFINERIE
                </span>
              </div>
            </div>

            {/* CENTER: Desktop Nav Pills */}
            <nav className="hidden xl:flex items-center gap-1 bg-[#070b13]/80 p-1 rounded-xl border border-slate-800/90 shadow-inner">
              {navTabs.map((tab) => {
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      audio.playClick();
                      setActiveTab(tab.id);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono tracking-wider uppercase flex items-center gap-1.5 transition-all duration-150 relative ${
                      isActive
                        ? 'bg-sc-card text-sc-cyan font-bold border border-sc-cyan/40 shadow-neon-cyan/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                    {tab.badge && (
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                        isActive
                          ? 'bg-sc-cyan text-slate-950'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* RIGHT: Telemetry Chips, Quick Actions & Settings */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Telemetry Live Badge (Desktop) */}
              <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-lg bg-sc-card/60 border border-slate-800 text-[11px] font-mono">
                <span className="flex items-center gap-1 text-slate-400" title="Total brut en soute">
                  <Pickaxe className="w-3 h-3 text-sc-cyan" />
                  <strong className="text-slate-200">{totalRawHeaderSCU.toFixed(1)}</strong>
                  <span className="text-[10px] text-slate-500">SCU</span>
                </span>
                <span className="text-slate-700">•</span>
                <span className="flex items-center gap-1 text-slate-400" title="Total minerais raffinés disponibles">
                  <Boxes className="w-3 h-3 text-emerald-400" />
                  <strong className="text-emerald-300">{totalRefinedHeaderSCU.toFixed(1)}</strong>
                  <span className="text-[10px] text-slate-500">SCU</span>
                </span>
              </div>

              {/* Quick Action Button */}
              <button
                onClick={() => {
                  audio.playClick();
                  setIsCreateOrderModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-lg bg-sc-cyan hover:bg-cyan-400 text-slate-950 font-bold border border-sc-cyan shadow-neon-cyan text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all duration-150"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Commande</span>
              </button>

              {/* What's New Pop-up Trigger Button */}
              <button
                onClick={() => {
                  audio.playClick();
                  setIsWhatsNewOpen(true);
                }}
                className="px-2.5 py-1.5 rounded-lg border border-sc-cyan/40 bg-sc-cyan/15 hover:bg-sc-cyan/25 text-sc-cyan text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-neon-cyan/20 transition-all"
                title="Afficher les nouveautés des 5 dernières opérations"
              >
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span className="hidden md:inline">Nouveautés</span>
              </button>

              {/* Sound Toggle */}
              <button
                onClick={() => {
                  const upd = !settings.soundEnabled;
                  audio.setEnabled(upd);
                  if (upd) audio.playClick();
                  setSettings({ ...settings, soundEnabled: upd });
                }}
                className="p-2 rounded-lg border border-slate-800 bg-sc-card hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                title={settings.soundEnabled ? 'Désactiver les sons HUD' : 'Activer les sons HUD'}
              >
                {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-sc-cyan" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
              </button>

              {/* Settings Cog */}
              <button
                onClick={() => {
                  audio.playClick();
                  setIsSettingsOpen(true);
                }}
                className="p-2 rounded-lg border border-slate-800 bg-sc-card hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                title="Paramètres de l'application"
              >
                <Settings className="w-4 h-4" />
              </button>

              {/* Mobile Menu Toggle Button */}
              <button
                onClick={() => {
                  audio.playClick();
                  setIsMobileMenuOpen(!isMobileMenuOpen);
                }}
                className="xl:hidden p-2 rounded-lg border border-slate-800 bg-sc-card hover:bg-slate-800 text-slate-300 transition-colors"
                title="Ouvrir le menu de navigation"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5 text-sc-cyan" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>

        {/* Medium Screen Horizontal Nav Rail (< 1280px and >= 768px when menu not expanded) */}
        <div className="hidden md:block xl:hidden border-t border-slate-800/80 bg-[#090e18]/90">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-1 overflow-x-auto py-1.5 custom-scrollbar" aria-label="Tabs">
              {navTabs.map((tab) => {
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      audio.playClick();
                      setActiveTab(tab.id);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all shrink-0 ${
                      isActive
                        ? 'bg-sc-card text-sc-cyan border border-sc-cyan/40 font-bold shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                    {tab.badge && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-sc-cyan/20 text-sc-cyan border border-sc-cyan/30">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Mobile Fullscreen Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="xl:hidden border-t border-slate-800 bg-[#0a0f1c]/98 px-4 py-4 space-y-2 animate-in slide-in-from-top-2 duration-150">
            <div className="grid grid-cols-2 gap-2 pb-2">
              <div className="p-2 rounded-lg bg-sc-card border border-slate-800 text-xs font-mono">
                <span className="text-[10px] text-slate-500 block uppercase">Minage Brut</span>
                <span className="font-bold text-sc-cyan">{totalRawHeaderSCU.toFixed(1)} SCU</span>
              </div>
              <div className="p-2 rounded-lg bg-sc-card border border-slate-800 text-xs font-mono">
                <span className="text-[10px] text-slate-500 block uppercase">Stock Raffiné</span>
                <span className="font-bold text-emerald-400">{totalRefinedHeaderSCU.toFixed(1)} SCU</span>
              </div>
            </div>

            <div className="space-y-1">
              {navTabs.map((tab) => {
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      audio.playClick();
                      setActiveTab(tab.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full px-4 py-2.5 rounded-lg text-xs font-mono uppercase tracking-wider flex items-center justify-between transition-colors ${
                      isActive
                        ? 'bg-sc-card text-sc-cyan border border-sc-cyan/50 font-bold shadow-neon-cyan/20'
                        : 'text-slate-300 hover:bg-slate-850 hover:text-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {tab.icon}
                      <span>{tab.label}</span>
                    </div>
                    {tab.badge && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-sc-cyan/20 text-sc-cyan border border-sc-cyan/40">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Ambient Glowing HUD Bottom Border */}
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-sc-cyan/50 to-transparent opacity-75" />
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            rawCargo={rawCargo}
            refinedStock={refinedStock}
            refineryJobs={refineryJobs}
            orders={orders}
            blueprints={allBlueprints}
            onNavigateTab={(tab) => {
              audio.playClick();
              setActiveTab(tab);
            }}
            onOpenRawModal={() => setIsAddRawModalOpen(true)}
            onOpenRefineryModal={() => setIsRefineryModalOpen(true)}
            onOpenOrderModal={() => setIsCreateOrderModalOpen(true)}
          />
        )}

        {activeTab === 'mining' && (
          <MiningCargoView
            rawCargo={rawCargo}
            onAddCargo={handleAddRawCargo}
            onDeleteCargo={handleDeleteRawCargo}
            onSendToRefinery={handleSendToRefinery}
          />
        )}

        {activeTab === 'refinery' && (
          <RefineryView
            jobs={refineryJobs}
            onStartJob={handleStartRefineryJob}
            onCollectJob={handleCollectJob}
            onFastForwardJob={handleFastForwardJob}
            onDeleteJob={handleDeleteRefineryJob}
            prefillCargo={prefillRawCargo}
            onClearPrefillCargo={() => setPrefillRawCargo(null)}
          />
        )}

        {activeTab === 'inventory' && (
          <RefinedInventoryView
            stock={refinedStock}
            onAdjustStock={handleAdjustStock}
            onUpdateStockItem={handleUpdateStockItem}
            onDeleteStockItem={handleDeleteStockItem}
            onNavigateToTab={(tab) => {
              audio.playClick();
              setActiveTab(tab);
            }}
          />
        )}

        {activeTab === 'blueprints' && (
          <BlueprintsCatalogView
            blueprints={allBlueprints}
            stock={refinedStock}
            onAddCustomBlueprint={handleAddCustomBlueprint}
            onCraftNow={handleCraftNow}
            onCreateOrderFromBlueprint={handleCreateOrderFromBlueprint}
            onSyncApiBlueprints={handleSyncApiBlueprints}
          />
        )}

        {activeTab === 'orders' && (
          <OrderBookView
            orders={orders}
            allBlueprints={allBlueprints}
            stock={refinedStock}
            onCreateOrder={handleCreateOrder}
            onUpdateStatus={handleUpdateOrderStatus}
            onDeleteOrder={handleDeleteOrder}
            onExecuteFabrication={handleExecuteFabrication}
            onTogglePaid={handleTogglePaid}
            prefillBlueprint={prefillBlueprint}
            onClearPrefillBlueprint={() => setPrefillBlueprint(null)}
          />
        )}

        {activeTab === 'importExport' && (
          <ImportExportView
            stock={refinedStock}
            onImportStock={handleImportStock}
            onRestoreBackup={handleRestoreBackup}
          />
        )}
      </main>

      {/* Floating Modals triggered from Header / Global */}
      <AddRawCargoModal
        isOpen={isAddRawModalOpen}
        onClose={() => setIsAddRawModalOpen(false)}
        onAddCargo={handleAddRawCargo}
      />

      <RefineryCalculatorModal
        isOpen={isRefineryModalOpen}
        onClose={() => setIsRefineryModalOpen(false)}
        onStartJob={handleStartRefineryJob}
      />

      <CreateOrderModal
        isOpen={isCreateOrderModalOpen}
        onClose={() => setIsCreateOrderModalOpen(false)}
        onCreateOrder={handleCreateOrder}
        allBlueprints={allBlueprints}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(newSt) => setSettings(newSt)}
        onClearAllData={handleClearAllData}
      />

      {/* What's New Pop-up Modal (Last 5 Operations) */}
      <WhatsNewModal
        isOpen={isWhatsNewOpen}
        onClose={() => setIsWhatsNewOpen(false)}
      />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />

      {/* Footer */}
      <footer className="border-t border-sc-border/60 bg-sc-panel/40 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-mono text-slate-500">
          <div>
            Star Citizen Mining, Refinery & Blueprint Manager • Prêt pour GitHub Pages
          </div>
          <div className="flex items-center gap-3">
            <span>Données : <a href="https://api.star-citizen.wiki" target="_blank" rel="noreferrer" className="text-sc-cyan hover:underline">api.star-citizen.wiki</a></span>
            <span>•</span>
            <button
              onClick={() => {
                audio.playClick();
                setIsWhatsNewOpen(true);
              }}
              className="text-sc-cyan hover:underline font-bold"
            >
              v1.7.0 (Journal des Mises à Jour)
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

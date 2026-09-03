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
import { STAR_CITIZEN_MINERALS } from './data/mineralsData';
import { ToastContainer, ToastMessage } from './components/common/Toast';
import { SettingsModal } from './components/settings/SettingsModal';
import { WhatsNewModal, CURRENT_APP_VERSION, STORAGE_KEY_LAST_SEEN_VERSION } from './components/common/WhatsNewModal';
import { audio } from './services/audioService';

// Module Views
import { DashboardView } from './components/dashboard/DashboardView';
import { RefinedInventoryView } from './components/inventory/RefinedInventoryView';
import { BlueprintsCatalogView } from './components/blueprints/BlueprintsCatalogView';
import { OrderBookView } from './components/orders/OrderBookView';
import { ImportExportView } from './components/importExport/ImportExportView';

// Sub Modals triggered from header or dashboard
import { CreateOrderModal } from './components/orders/CreateOrderModal';

// Icons
import {
  LayoutDashboard,
  Boxes,
  Scroll,
  ClipboardList,
  FileSpreadsheet,
  Settings,
  Volume2,
  VolumeX,
  Plus,
  Sparkles,
  Coins
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
  const [isCreateOrderModalOpen, setIsCreateOrderModalOpen] = useState(false);

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

  const handleUpdateBlueprint = (updatedBp: Blueprint) => {
    StorageService.saveOrUpdateBlueprint(updatedBp);
    setCustomBlueprints(StorageService.getCustomBlueprints());
    addToast('success', 'Blueprint Modifié', `Le plan "${updatedBp.name}" a été mis à jour avec succès.`);
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

  // Nav Tabs configuration
  const navTabs = [
    { id: 'dashboard', label: 'Tableau de Bord', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'inventory', label: 'Stock Minerais', icon: <Boxes className="w-4 h-4" />, badge: refinedStock.length > 0 ? String(refinedStock.length) : undefined },
    { id: 'blueprints', label: 'Blueprints & Craft', icon: <Scroll className="w-4 h-4" /> },
    { id: 'orders', label: 'Commandes', icon: <ClipboardList className="w-4 h-4" />, badge: orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length > 0 ? String(orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length) : undefined },
    { id: 'importExport', label: 'Import / Export', icon: <FileSpreadsheet className="w-4 h-4" /> }
  ];

  const totalRefinedHeaderSCU = refinedStock.reduce((a, s) => a + s.quantitySCU, 0);
  const totalStockValueAUEC = refinedStock.reduce((acc, s) => {
    const min = STAR_CITIZEN_MINERALS.find(m => m.id === s.mineralId || m.name.toLowerCase() === s.mineralName.toLowerCase());
    return acc + Math.round(s.quantitySCU * 100 * (min?.basePriceAUEC || 15));
  }, 0);

  return (
    <div className="min-h-screen bg-[#070a10] text-slate-100 sc-grid-bg flex flex-col font-sans">
      {/* 2-TIER SLEEK STAR CITIZEN HUD HEADER */}
      <header className="sticky top-0 z-40 bg-[#090e18]/95 backdrop-blur-xl border-b border-sc-border/90 shadow-2xl shadow-black/80">
        
        {/* ROW 1: Branding, Telemetry & Utility Controls */}
        <div className="border-b border-slate-800/80 bg-gradient-to-r from-[#0c1424] via-[#090e18] to-[#0c1424]">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
            <div className="h-13 py-2 flex items-center justify-between gap-3">
              
              {/* LEFT: Branding & Logo */}
              <div
                onClick={() => {
                  audio.playClick();
                  setActiveTab('dashboard');
                }}
                className="flex items-center gap-2.5 cursor-pointer group shrink-0"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sc-cyan via-cyan-600 to-slate-900 p-0.5 shadow-neon-cyan transition-transform group-hover:scale-105">
                  <div className="w-full h-full bg-[#0c121e] rounded-[6px] flex items-center justify-center text-sc-cyan group-hover:bg-sc-cyan group-hover:text-slate-950 transition-colors">
                    <Boxes className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 leading-none">
                    <span className="font-extrabold font-sans text-sm tracking-wider text-slate-100 uppercase group-hover:text-sc-cyan transition-colors">
                      STAR CITIZEN
                    </span>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-sc-cyan/15 text-sc-cyan border border-sc-cyan/30 uppercase">
                      HUD
                    </span>
                    <span className="hidden sm:inline text-[9px] font-mono text-slate-500">
                      v{CURRENT_APP_VERSION}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono tracking-widest text-slate-400 uppercase block mt-0.5">
                    MINERAIS • BLUEPRINTS • COMMANDES CLIENTS
                  </span>
                </div>
              </div>

              {/* CENTER: Telemetry Status Badges (Hidden on small screens) */}
              <div className="hidden md:flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sc-card/80 border border-slate-800 text-[11px] font-mono shadow-inner" title="Minerais raffinés disponibles">
                  <Boxes className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-slate-400">Stock:</span>
                  <strong className="text-emerald-300">{totalRefinedHeaderSCU.toFixed(1)}</strong>
                  <span className="text-[9px] text-slate-500">SCU</span>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sc-card/80 border border-slate-800 text-[11px] font-mono shadow-inner" title="Valeur estimée du stock total">
                  <Coins className="w-3.5 h-3.5 text-sc-cyan" />
                  <span className="text-slate-400">Valeur:</span>
                  <strong className="text-cyan-300">~{totalStockValueAUEC.toLocaleString('fr-FR')}</strong>
                  <span className="text-[9px] text-slate-500">aUEC</span>
                </div>

                {orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length > 0 && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950/40 border border-amber-800/60 text-[11px] font-mono shadow-inner" title="Commandes clients actives">
                    <ClipboardList className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-amber-300 font-bold">
                      {orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length}
                    </span>
                    <span className="text-amber-400/80 text-[10px]">cmd</span>
                  </div>
                )}
              </div>

              {/* RIGHT: Quick Action Buttons & HUD Utilities */}
              <div className="flex items-center gap-1.5 shrink-0">
                {/* Quick Order Button */}
                <button
                  onClick={() => {
                    audio.playClick();
                    setIsCreateOrderModalOpen(true);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-sc-cyan hover:bg-cyan-400 text-slate-950 font-bold border border-sc-cyan shadow-neon-cyan text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all duration-150"
                  title="Créer une nouvelle commande client"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Commande</span>
                </button>

                {/* What's New Button */}
                <button
                  onClick={() => {
                    audio.playClick();
                    setIsWhatsNewOpen(true);
                  }}
                  className="px-2.5 py-1.5 rounded-lg border border-sc-cyan/40 bg-sc-cyan/15 hover:bg-sc-cyan/25 text-sc-cyan text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1 shadow-neon-cyan/20 transition-all"
                  title="Consulter le journal des mises à jour"
                >
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  <span className="hidden lg:inline">Journal</span>
                  <span className="text-[10px] font-mono">v{CURRENT_APP_VERSION}</span>
                </button>

                {/* Sound Toggle */}
                <button
                  onClick={() => {
                    const upd = !settings.soundEnabled;
                    audio.setEnabled(upd);
                    if (upd) audio.playClick();
                    setSettings({ ...settings, soundEnabled: upd });
                  }}
                  className="p-1.5 rounded-lg border border-slate-800 bg-sc-card hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
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
                  className="p-1.5 rounded-lg border border-slate-800 bg-sc-card hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                  title="Paramètres de l'application"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* ROW 2: Dedicated Navigation Bar (Responsive, Horizontal Scrolling, No Clutter) */}
        <div className="bg-[#080d17]/95">
          <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
            <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-1.5 custom-scrollbar" aria-label="Tabs">
              {navTabs.map((tab) => {
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      audio.playClick();
                      setActiveTab(tab.id);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono tracking-wider uppercase flex items-center gap-1.5 transition-all duration-150 shrink-0 select-none ${
                      isActive
                        ? 'bg-sc-card text-sc-cyan font-bold border border-sc-cyan/50 shadow-neon-cyan/20'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-850 border border-transparent'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                    {tab.badge && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full font-mono ${
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
          </div>
        </div>

        {/* Ambient Glowing HUD Bottom Border */}
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-sc-cyan/50 to-transparent opacity-75" />
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            refinedStock={refinedStock}
            orders={orders}
            blueprints={allBlueprints}
            onNavigateTab={(tab) => {
              audio.playClick();
              setActiveTab(tab);
            }}
            onOpenOrderModal={() => setIsCreateOrderModalOpen(true)}
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
            onUpdateBlueprint={handleUpdateBlueprint}
            onCraftNow={handleCraftNow}
            onCreateOrderFromBlueprint={handleCreateOrderFromBlueprint}
            onSyncApiBlueprints={handleSyncApiBlueprints}
            onNavigateToTab={(tab) => {
              audio.playClick();
              setActiveTab(tab);
            }}
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
            onNavigateToTab={(tab) => {
              audio.playClick();
              setActiveTab(tab);
            }}
          />
        )}
      </main>

      {/* Floating Modals triggered from Header / Global */}
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
              v{CURRENT_APP_VERSION} (Journal des Mises à Jour)
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

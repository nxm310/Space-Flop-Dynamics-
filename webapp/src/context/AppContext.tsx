import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  Blueprint, 
  InventoryItem, 
  Order, 
  GameTelemetry, 
  OrderStatus,
  DiscountType,
  MineralQualityTier,
  MINERAL_QUALITY_OPTIONS
} from '../types';
import { STAR_CITIZEN_DATABASE, SCItemDefinition } from '../data/starCitizenDatabase';

const AGENT_API_URL = 'http://127.0.0.1:5500/api';

interface AppContextType {
  blueprints: Blueprint[];
  inventory: InventoryItem[];
  orders: Order[];
  telemetry: GameTelemetry | null;
  isAgentConnected: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  
  // Stock operations
  updateInventoryItem: (itemData: {
    name: string;
    quantity: number;
    unit?: string;
    location?: string;
    category?: string;
    unitValueUEC?: number;
    qualityTier?: string;
    purityPercent?: number;
    recommendedShip?: string;
    extractionType?: string;
    attachedFileType?: 'pdf' | 'excel' | 'image' | 'link' | 'none';
    attachedFileName?: string;
    attachedFileData?: string;
    googleDriveUrl?: string;
    notes?: string;
  }) => Promise<boolean>;
  deleteInventoryItem: (id: string) => Promise<boolean>;
  importExtractedItems: (items: {
    name: string;
    quantity: number;
    unit?: string;
    location?: string;
    qualityTier?: string;
    purityPercent?: number;
    recommendedShip?: string;
    extractionType?: string;
    notes?: string;
  }[]) => Promise<boolean>;
  resetInventory: (mode?: 'default' | 'zero' | 'empty') => Promise<boolean>;

  // Blueprint operations
  addBlueprint: (bp: Omit<Blueprint, 'id'>) => Promise<boolean>;
  updateBlueprint: (id: string, updates: Partial<Blueprint>) => Promise<boolean>;
  deleteBlueprint: (id: string) => Promise<boolean>;
  importBlueprintFromDatabase: (dbItem: SCItemDefinition) => Promise<boolean>;
  resetBlueprints: () => Promise<boolean>;

  // Order operations
  createOrder: (data: {
    clientName: string;
    blueprintName: string;
    blueprintId?: string;
    quantity: number;
    mineralQuality: MineralQualityTier;
    userProvidesMaterials: boolean;
    materialContributionPercent?: number;
    discountType?: DiscountType;
    discountValue?: number;
    discountReason?: string;
    customPrice?: number;
    deliveryLocation: string;
    craftTimeMinutes?: number;
    notes?: string;
  }) => Promise<boolean>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<boolean>;
  updateOrderPrice: (
    orderId: string, 
    discountType: DiscountType, 
    discountValue: number, 
    discountReason?: string,
    customPrice?: number
  ) => Promise<boolean>;
  deleteOrder: (orderId: string) => Promise<boolean>;
  resetOrders: () => Promise<boolean>;

  refreshAgentData: () => Promise<void>;
}

const DEFAULT_HOST_BLUEPRINTS: Blueprint[] = [
  {
    id: 'bp-001',
    name: 'Behring S7 Laser Cannon (Omnisky)',
    category: 'Armement Vaisseau',
    manufacturer: 'Behring Applied Technology',
    description: 'Canon laser lourd taille 7 pour vaisseaux capitaux.',
    requiredMaterials: [
      { name: 'Quantainium Raffiné', quantity: 18, unit: 'SCU' },
      { name: 'Bexalite Raffiné', quantity: 28, unit: 'SCU' },
      { name: 'Titanium Raffiné', quantity: 45, unit: 'SCU' },
      { name: 'RMC (Recycled Material Composite)', quantity: 20, unit: 'SCU' }
    ],
    craftTimeMinutes: 50,
    feeUEC: 145000,
    available: true,
    isKnownByHost: true
  },
  {
    id: 'bp-002',
    name: 'Klaus & Werner CF-337 Panther Laser Repeater (Size 3)',
    category: 'Armement Vaisseau',
    manufacturer: 'Klaus & Werner',
    description: 'Répéteur laser taille 3 de référence pour chasseurs légers et moyens.',
    requiredMaterials: [
      { name: 'Agricium Raffiné', quantity: 8, unit: 'SCU' },
      { name: 'Titanium Raffiné', quantity: 12, unit: 'SCU' },
      { name: 'Copper (Cuivre Raffiné)', quantity: 6, unit: 'SCU' }
    ],
    craftTimeMinutes: 25,
    feeUEC: 48000,
    available: true,
    isKnownByHost: true
  },
  {
    id: 'bp-003',
    name: 'Générateur de Bouclier FR-86 (Size 3 Militaire)',
    category: 'Composant Vaisseau',
    subCategory: 'Générateur de Bouclier',
    manufacturer: 'Basilisk Armor',
    description: 'Bouclier lourd taille 3 à régénération instantanée de grade militaire.',
    requiredMaterials: [
      { name: 'Laranite Raffinée', quantity: 20, unit: 'SCU' },
      { name: 'Taranite Raffinée', quantity: 14, unit: 'SCU' },
      { name: 'RMC (Recycled Material Composite)', quantity: 30, unit: 'SCU' }
    ],
    craftTimeMinutes: 60,
    feeUEC: 190000,
    available: true,
    isKnownByHost: true
  },
  {
    id: 'bp-004',
    name: 'Quantum Drive Crossfield (Size 2 Militaire Rapide)',
    category: 'Composant Vaisseau',
    subCategory: 'Moteur Quantum Drive',
    manufacturer: 'RSI Components',
    description: 'Moteur de saut militaire pour traverser Stanton et Pyro à vitesse maximale.',
    requiredMaterials: [
      { name: 'Quantainium Raffiné', quantity: 30, unit: 'SCU' },
      { name: 'Bexalite Raffiné', quantity: 15, unit: 'SCU' },
      { name: 'Agricium Raffiné', quantity: 10, unit: 'SCU' }
    ],
    craftTimeMinutes: 75,
    feeUEC: 260000,
    available: true,
    isKnownByHost: true
  },
  {
    id: 'bp-005',
    name: 'Fusil de Précision Behring P6-LR',
    category: 'Arme FPS',
    manufacturer: 'Behring Applied Technology',
    description: 'Fusil de précision lourd capable de neutraliser une cible à travers les blindages lourds.',
    requiredMaterials: [
      { name: 'Titanium Raffiné', quantity: 5, unit: 'SCU' },
      { name: 'Tungsten Raffiné', quantity: 4, unit: 'SCU' },
      { name: 'Diamond (Diamant Industriel)', quantity: 2, unit: 'SCU' }
    ],
    craftTimeMinutes: 25,
    feeUEC: 45000,
    available: true,
    isKnownByHost: true
  },
  {
    id: 'bp-006',
    name: 'Ensemble Armure Lourde ADP-mk4 (Plastron + Casque + Jambes)',
    category: 'Armure FPS',
    manufacturer: 'Clark Defense Systems',
    description: 'Armure de combat lourd avec blindage composite Titanium résistant aux impacts.',
    requiredMaterials: [
      { name: 'Titanium Raffiné', quantity: 10, unit: 'SCU' },
      { name: 'RMC (Recycled Material Composite)', quantity: 8, unit: 'SCU' },
      { name: 'Tungsten Raffiné', quantity: 4, unit: 'SCU' }
    ],
    craftTimeMinutes: 30,
    feeUEC: 65000,
    available: true,
    isKnownByHost: true
  }
];

const DEFAULT_ORDERS: Order[] = [
  {
    id: 'ord-101',
    blueprintName: 'Quantum Drive Crossfield (Size 2 Militaire Rapide)',
    clientName: 'StarPilot_Ghost',
    quantity: 1,
    status: 'crafting',
    userProvidesMaterials: true,
    materialContributionPercent: 100,
    mineralQuality: 'maximum_purity',
    qualityMultiplier: 1.5,
    baseFeeUEC: 260000,
    discountType: 'percent',
    discountValue: 50,
    discountReason: 'Apport 100% Minerais + Membre Escouade',
    totalFeeUEC: 130000,
    deliveryLocation: 'HUR-L1 Green Glade',
    craftTimeMinutes: 75,
    notes: 'Client a déposé 30 SCU Quantainium et 15 SCU Bexalite dans le hangar.',
    createdAt: '2026-08-30T10:15:00Z'
  },
  {
    id: 'ord-102',
    blueprintName: 'Behring S7 Laser Cannon (Omnisky)',
    clientName: 'Vanguard_Leader',
    quantity: 2,
    status: 'pending',
    userProvidesMaterials: false,
    materialContributionPercent: 0,
    mineralQuality: 'high_grade',
    qualityMultiplier: 1.25,
    baseFeeUEC: 290000,
    discountType: 'none',
    discountValue: 0,
    totalFeeUEC: 362500,
    deliveryLocation: 'Port Tressler',
    craftTimeMinutes: 100,
    notes: 'Livraison express demandée avant opération de flotte ce soir.',
    createdAt: '2026-08-30T11:40:00Z'
  }
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<string>('inventory');
  const [isAgentConnected, setIsAgentConnected] = useState<boolean>(false);
  const [telemetry, setTelemetry] = useState<GameTelemetry | null>(null);

  // 1. Stocks & Minerals
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('sc_inventory');
    if (saved) {
      try { return JSON.parse(saved); } catch (_) {}
    }
    return [];
  });

  // 2. Owned Blueprints
  const [blueprints, setBlueprints] = useState<Blueprint[]>(() => {
    const saved = localStorage.getItem('sc_host_blueprints');
    if (saved) {
      try { return JSON.parse(saved); } catch (_) {}
    }
    return DEFAULT_HOST_BLUEPRINTS;
  });

  // 3. Orders
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('sc_host_orders');
    if (saved) {
      try { return JSON.parse(saved); } catch (_) {}
    }
    return DEFAULT_ORDERS;
  });

  // Persist state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sc_inventory', JSON.stringify(inventory));
    } catch (_) {}
  }, [inventory]);

  useEffect(() => {
    try {
      localStorage.setItem('sc_host_blueprints', JSON.stringify(blueprints));
    } catch (_) {}
  }, [blueprints]);

  useEffect(() => {
    try {
      localStorage.setItem('sc_host_orders', JSON.stringify(orders));
    } catch (_) {}
  }, [orders]);

  // Sync with Local Python Agent
  const refreshAgentData = useCallback(async () => {
    try {
      const res = await fetch(`${AGENT_API_URL}/status`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        setIsAgentConnected(true);
        const data = await res.json();
        if (data.telemetry) setTelemetry(data.telemetry);
        if (data.inventory && Array.isArray(data.inventory) && data.inventory.length > 0) {
          // If local agent has inventory, sync it
          setInventory(data.inventory);
        }
      } else {
        setIsAgentConnected(false);
      }
    } catch (_) {
      setIsAgentConnected(false);
    }
  }, []);

  useEffect(() => {
    refreshAgentData();
    const interval = setInterval(refreshAgentData, 5000);
    return () => clearInterval(interval);
  }, [refreshAgentData]);

  // ==========================================
  // --- INVENTORY / STOCK OPERATIONS ---
  // ==========================================
  const updateInventoryItem = async (itemData: {
    name: string;
    quantity: number;
    unit?: string;
    location?: string;
    category?: string;
    unitValueUEC?: number;
    qualityTier?: string;
    purityPercent?: number;
    recommendedShip?: string;
    extractionType?: string;
    attachedFileType?: 'pdf' | 'excel' | 'image' | 'link' | 'none';
    attachedFileName?: string;
    attachedFileData?: string;
    googleDriveUrl?: string;
    notes?: string;
  }): Promise<boolean> => {
    const {
      name,
      quantity,
      unit = 'SCU',
      location = 'HUR-L1 Refinery',
      category = 'Ressource',
      unitValueUEC = 10000,
      qualityTier = 'Standard',
      purityPercent,
      recommendedShip,
      extractionType,
      attachedFileType = 'none',
      attachedFileName,
      attachedFileData,
      googleDriveUrl,
      notes
    } = itemData;

    setInventory(prev => {
      const idx = prev.findIndex(item => item.name.toLowerCase() === name.toLowerCase());
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          quantity,
          unit,
          location,
          qualityTier,
          purityPercent,
          recommendedShip,
          extractionType,
          attachedFileType,
          attachedFileName,
          attachedFileData,
          googleDriveUrl,
          notes
        };
        return updated;
      }
      return [
        ...prev,
        {
          id: `mat-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          name,
          category,
          quantity,
          unit,
          location,
          unitValueUEC,
          qualityTier,
          purityPercent,
          recommendedShip,
          extractionType,
          attachedFileType,
          attachedFileName,
          attachedFileData,
          googleDriveUrl,
          notes
        }
      ];
    });

    if (isAgentConnected) {
      try {
        await fetch(`${AGENT_API_URL}/inventory/update`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(itemData)
        });
      } catch (e) {
        console.warn('Failed to sync item to agent', e);
      }
    }
    return true;
  };

  const deleteInventoryItem = async (id: string): Promise<boolean> => {
    setInventory(prev => prev.filter(item => item.id !== id));
    return true;
  };

  const importExtractedItems = async (items: {
    name: string;
    quantity: number;
    unit?: string;
    location?: string;
    qualityTier?: string;
    purityPercent?: number;
    recommendedShip?: string;
    extractionType?: string;
    notes?: string;
  }[]): Promise<boolean> => {
    const timestamp = Date.now();
    const formattedNewItems: InventoryItem[] = items.map((item, idx) => ({
      id: `mat-${timestamp}-${idx}-${Math.random().toString(36).substr(2, 5)}`,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit || 'SCU',
      location: item.location || 'HUR-L1 Refinery',
      category: 'Ressource',
      qualityTier: item.qualityTier || 'Standard',
      purityPercent: item.purityPercent,
      recommendedShip: item.recommendedShip,
      extractionType: item.extractionType || 'Minable Vaisseau',
      notes: item.notes
    }));

    setInventory(formattedNewItems);
    try {
      localStorage.setItem('sc_inventory', JSON.stringify(formattedNewItems));
    } catch (_) {}

    if (isAgentConnected) {
      try {
        await fetch(`${AGENT_API_URL}/inventory/batch-replace`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: formattedNewItems })
        });
      } catch (e) {
        console.warn('Failed to sync batch inventory to agent', e);
      }
    }
    return true;
  };

  const resetInventory = async (mode: 'default' | 'zero' | 'empty' = 'empty'): Promise<boolean> => {
    let newItems: InventoryItem[] = [];
    if (mode === 'default') {
      newItems = [
        { id: 'mat-01', name: 'Quantainium Raffiné', category: 'Minerai Exotique', quantity: 142, unit: 'SCU', location: 'HUR-L1 Refinery', unitValueUEC: 88000, qualityTier: 'Pur (99.2%)', extractionType: 'Minable Vaisseau', recommendedShip: 'MISC Prospector / ARGO MOLE' },
        { id: 'mat-02', name: 'Bexalite Raffiné', category: 'Minerai Rare', quantity: 210, unit: 'SCU', location: 'CRU-L1', unitValueUEC: 44000, qualityTier: 'Haute (88%)', extractionType: 'Minable Vaisseau', recommendedShip: 'MISC Prospector / ARGO MOLE' },
        { id: 'mat-03', name: 'RMC (Recycled Material Composite)', category: 'Salvage', quantity: 350, unit: 'SCU', location: 'Orison Cargo', unitValueUEC: 14500, qualityTier: 'Standard', extractionType: 'Salvage Coque (RMC)', recommendedShip: 'Drake Vulture / Aegis Reclaimer' }
      ];
    } else {
      newItems = [];
    }
    setInventory(newItems);
    try {
      localStorage.setItem('sc_inventory', JSON.stringify(newItems));
    } catch (_) {}

    if (isAgentConnected) {
      try {
        await fetch(`${AGENT_API_URL}/inventory/reset`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode })
        });
      } catch (e) {
        console.warn('Failed to reset inventory on agent', e);
      }
    }
    return true;
  };

  // ==========================================
  // --- BLUEPRINT OPERATIONS ---
  // ==========================================
  const addBlueprint = async (bp: Omit<Blueprint, 'id'>): Promise<boolean> => {
    const newBp: Blueprint = {
      ...bp,
      id: `bp-${Date.now()}`,
      isKnownByHost: true
    };
    setBlueprints(prev => [newBp, ...prev]);
    return true;
  };

  const updateBlueprint = async (id: string, updates: Partial<Blueprint>): Promise<boolean> => {
    setBlueprints(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
    return true;
  };

  const deleteBlueprint = async (id: string): Promise<boolean> => {
    setBlueprints(prev => prev.filter(b => b.id !== id));
    return true;
  };

  const importBlueprintFromDatabase = async (dbItem: SCItemDefinition): Promise<boolean> => {
    // Check if already in blueprints
    const exists = blueprints.some(b => b.name.toLowerCase() === dbItem.name.toLowerCase());
    if (exists) return false;

    const newBp: Blueprint = {
      id: `bp-${Date.now()}`,
      name: dbItem.name,
      category: dbItem.category,
      subCategory: dbItem.subCategory,
      manufacturer: dbItem.manufacturer || 'Industriel',
      description: dbItem.description || 'Fabrication sur mesure.',
      requiredMaterials: dbItem.suggestedMaterials || [
        { name: 'Titanium Raffiné', quantity: 10, unit: 'SCU' },
        { name: 'RMC (Recycled Material Composite)', quantity: 5, unit: 'SCU' }
      ],
      craftTimeMinutes: dbItem.suggestedCraftTimeMinutes || 30,
      feeUEC: dbItem.unitValueUEC || 50000,
      available: true,
      isKnownByHost: true
    };

    setBlueprints(prev => [newBp, ...prev]);
    return true;
  };

  const resetBlueprints = async (): Promise<boolean> => {
    setBlueprints(DEFAULT_HOST_BLUEPRINTS);
    try {
      localStorage.setItem('sc_host_blueprints', JSON.stringify(DEFAULT_HOST_BLUEPRINTS));
    } catch (_) {}
    return true;
  };

  // ==========================================
  // --- ORDER OPERATIONS ---
  // ==========================================
  const createOrder = async (data: {
    clientName: string;
    blueprintName: string;
    blueprintId?: string;
    quantity: number;
    mineralQuality: MineralQualityTier;
    userProvidesMaterials: boolean;
    materialContributionPercent?: number;
    discountType?: DiscountType;
    discountValue?: number;
    discountReason?: string;
    customPrice?: number;
    deliveryLocation: string;
    craftTimeMinutes?: number;
    notes?: string;
  }): Promise<boolean> => {
    const qualityOption = MINERAL_QUALITY_OPTIONS.find(q => q.tier === data.mineralQuality) || MINERAL_QUALITY_OPTIONS[0];
    
    // Find matching blueprint to get base fee and materials
    const matchingBpInHost = blueprints.find(b => b.name.toLowerCase() === data.blueprintName.toLowerCase());
    const matchingBpInDb = STAR_CITIZEN_DATABASE.find(b => b.name.toLowerCase() === data.blueprintName.toLowerCase());

    const singleBaseFee = matchingBpInHost 
      ? matchingBpInHost.feeUEC 
      : matchingBpInDb?.unitValueUEC || 50000;
    const baseTotalFee = singleBaseFee * data.quantity * qualityOption.multiplier;

    let finalFee = baseTotalFee;
    const discountType = data.discountType || 'none';

    if (discountType === 'free') {
      finalFee = 0;
    } else if (discountType === 'custom' && data.customPrice !== undefined) {
      finalFee = data.customPrice;
    } else if (discountType === 'percent' && data.discountValue) {
      finalFee = Math.max(0, baseTotalFee - Math.round((baseTotalFee * data.discountValue) / 100));
    }

    // Material contribution discount if user provides materials and no specific discount set
    if (data.userProvidesMaterials && discountType === 'none') {
      const contrib = data.materialContributionPercent || 100;
      const reduction = (baseTotalFee * 0.6) * (contrib / 100);
      finalFee = Math.max(0, Math.round(baseTotalFee - reduction));
    }

    const requiredMaterials = matchingBpInHost 
      ? matchingBpInHost.requiredMaterials 
      : matchingBpInDb?.suggestedMaterials;

    const newOrder: Order = {
      id: `ord-${Date.now().toString().slice(-4)}`,
      clientName: data.clientName.trim() || 'Client Anonyme',
      blueprintName: data.blueprintName,
      blueprintId: data.blueprintId,
      quantity: data.quantity,
      status: 'pending',
      userProvidesMaterials: data.userProvidesMaterials,
      materialContributionPercent: data.materialContributionPercent || (data.userProvidesMaterials ? 100 : 0),
      mineralQuality: data.mineralQuality,
      qualityMultiplier: qualityOption.multiplier,
      baseFeeUEC: baseTotalFee,
      discountType: data.discountType || (data.userProvidesMaterials ? 'percent' : 'none'),
      discountValue: data.discountValue || (data.userProvidesMaterials ? 60 : 0),
      discountReason: data.discountReason || (data.userProvidesMaterials ? 'Apport Minerais Client (-60%)' : ''),
      totalFeeUEC: finalFee,
      deliveryLocation: data.deliveryLocation || 'HUR-L1 Green Glade',
      craftTimeMinutes: (data.craftTimeMinutes || 30) * data.quantity,
      requiredMaterials: requiredMaterials,
      notes: data.notes,
      createdAt: new Date().toISOString()
    };

    setOrders(prev => [newOrder, ...prev]);
    return true;
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<boolean> => {
    setOrders(prev => prev.map(ord => ord.id === orderId ? { ...ord, status, updatedAt: new Date().toISOString() } : ord));
    return true;
  };

  const updateOrderPrice = async (
    orderId: string, 
    discountType: DiscountType, 
    discountValue: number, 
    discountReason?: string,
    customPrice?: number
  ): Promise<boolean> => {
    setOrders(prev => prev.map(ord => {
      if (ord.id !== orderId) return ord;
      const base = ord.baseFeeUEC || ord.totalFeeUEC;
      let newTotal = base;

      if (discountType === 'free') {
        newTotal = 0;
      } else if (discountType === 'custom' && customPrice !== undefined) {
        newTotal = customPrice;
      } else if (discountType === 'percent') {
        newTotal = Math.max(0, base - Math.round((base * discountValue) / 100));
      }

      return {
        ...ord,
        discountType,
        discountValue,
        discountReason: discountReason || '',
        totalFeeUEC: newTotal,
        updatedAt: new Date().toISOString()
      };
    }));
    return true;
  };

  const deleteOrder = async (orderId: string): Promise<boolean> => {
    setOrders(prev => prev.filter(ord => ord.id !== orderId));
    return true;
  };

  const resetOrders = async (): Promise<boolean> => {
    setOrders([]);
    try {
      localStorage.setItem('sc_host_orders', JSON.stringify([]));
    } catch (_) {}
    return true;
  };

  return (
    <AppContext.Provider
      value={{
        blueprints,
        inventory,
        orders,
        telemetry,
        isAgentConnected,
        activeTab,
        setActiveTab,
        updateInventoryItem,
        deleteInventoryItem,
        importExtractedItems,
        resetInventory,
        addBlueprint,
        updateBlueprint,
        deleteBlueprint,
        importBlueprintFromDatabase,
        resetBlueprints,
        createOrder,
        updateOrderStatus,
        updateOrderPrice,
        deleteOrder,
        resetOrders,
        refreshAgentData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

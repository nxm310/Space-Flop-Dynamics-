import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  Blueprint, 
  InventoryItem, 
  MasterInventoryItem,
  ResourceRequest, 
  Order, 
  GameTelemetry, 
  OrderStatus 
} from '../types';
import { useAuth } from './AuthContext';

const AGENT_API_URL = 'http://127.0.0.1:5500/api';

interface AppContextType {
  blueprints: Blueprint[];
  inventory: InventoryItem[];
  generalInventory: MasterInventoryItem[];
  resourceRequests: ResourceRequest[];
  orders: Order[];
  telemetry: GameTelemetry | null;
  isAgentConnected: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  createOrder: (data: Omit<Order, 'id' | 'createdAt' | 'status'>) => Promise<boolean>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<boolean>;
  updateOrderPrice: (
    orderId: string, 
    discountType: 'none' | 'percent' | 'fixed' | 'free' | 'custom', 
    discountValue: number, 
    discountReason?: string,
    customPrice?: number
  ) => Promise<boolean>;
  createResourceRequest: (data: Omit<ResourceRequest, 'id' | 'createdAt' | 'collectedQuantity' | 'status' | 'contributors'>) => Promise<boolean>;
  contributeToRequest: (requestId: string, quantity: number) => Promise<boolean>;
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
  addBlueprint: (bp: Omit<Blueprint, 'id'>) => Promise<boolean>;
  updateBlueprint: (id: string, updates: Partial<Blueprint>) => Promise<boolean>;
  deleteBlueprint: (id: string) => Promise<boolean>;
  refreshAgentData: () => Promise<void>;
}

const DEFAULT_BLUEPRINTS: Blueprint[] = [
  {
    id: 'bp-001',
    name: 'Behring S7 Laser Cannon (Omnisky)',
    category: 'Armement Vaisseau',
    description: 'Canon laser lourd taille 7 à haute cadence et pénétration de bouclier.',
    icon: 'Crosshair',
    requiredMaterials: [
      { name: 'Quantainium Raffiné', quantity: 15, unit: 'SCU' },
      { name: 'Bexalite Raffiné', quantity: 25, unit: 'SCU' },
      { name: 'Titanium', quantity: 40, unit: 'SCU' }
    ],
    craftTimeMinutes: 45,
    feeUEC: 125000,
    available: true
  },
  {
    id: 'bp-002',
    name: 'Bouclier Industriel S3 (FR-86 Militarized)',
    category: 'Composant Vaisseau',
    description: 'Générateur de bouclier taille 3 offrant une régénération ultra-rapide.',
    icon: 'Shield',
    requiredMaterials: [
      { name: 'Laranite Raffinée', quantity: 20, unit: 'SCU' },
      { name: 'Taranite Raffinée', quantity: 12, unit: 'SCU' },
      { name: 'RMC (Matériaux Recyclés)', quantity: 30, unit: 'SCU' }
    ],
    craftTimeMinutes: 60,
    feeUEC: 180000,
    available: true
  },
  {
    id: 'bp-003',
    name: 'Fusil de Précision Behring P6-LR (Mastercraft)',
    category: 'Arme FPS',
    description: 'Fusil sniper lourd anti-matériel avec optique thermique x16.',
    icon: 'Target',
    requiredMaterials: [
      { name: 'Agricium Raffiné', quantity: 4, unit: 'SCU' },
      { name: 'Titanium', quantity: 6, unit: 'SCU' },
      { name: 'Gold Raffiné', quantity: 2, unit: 'SCU' }
    ],
    craftTimeMinutes: 20,
    feeUEC: 35000,
    available: true
  },
  {
    id: 'bp-004',
    name: 'Armure Lourde Citadel Exec (Full Set)',
    category: 'Armure FPS',
    description: 'Combinaison et armure lourde intégrale avec absorption balistique maximale.',
    icon: 'ShieldAlert',
    requiredMaterials: [
      { name: 'RMC (Matériaux Recyclés)', quantity: 12, unit: 'SCU' },
      { name: 'Titanium', quantity: 18, unit: 'SCU' },
      { name: 'Copper', quantity: 8, unit: 'SCU' }
    ],
    craftTimeMinutes: 30,
    feeUEC: 45000,
    available: true
  },
  {
    id: 'bp-005',
    name: 'Quantum Drive S2 (Crossfield Overcharged)',
    category: 'Composant Vaisseau',
    description: 'Moteur Quantum militaire haute vitesse pour sauts rapides dans Stanton et Pyro.',
    icon: 'Zap',
    requiredMaterials: [
      { name: 'Quantainium Raffiné', quantity: 30, unit: 'SCU' },
      { name: 'Bexalite Raffiné', quantity: 15, unit: 'SCU' },
      { name: 'Agricium Raffiné', quantity: 10, unit: 'SCU' }
    ],
    craftTimeMinutes: 75,
    feeUEC: 250000,
    available: true
  },
  {
    id: 'bp-006',
    name: 'Multi-Tool Pyro RRS + Module Salvage',
    category: 'Utilitaire',
    description: 'Outil multifonction avec rayon tracteur renforcé et module de réparation thermique.',
    icon: 'Wrench',
    requiredMaterials: [
      { name: 'RMC (Matériaux Recyclés)', quantity: 5, unit: 'SCU' },
      { name: 'Copper', quantity: 5, unit: 'SCU' }
    ],
    craftTimeMinutes: 10,
    feeUEC: 15000,
    available: true
  }
];

const DEFAULT_INVENTORY: InventoryItem[] = [
  { id: 'mat-01', name: 'Quantainium Raffiné', category: 'Minerai Exotique', quantity: 142, unit: 'SCU', location: 'HUR-L1 Refinery', unitValueUEC: 88000 },
  { id: 'mat-02', name: 'Bexalite Raffiné', category: 'Minerai Rare', quantity: 210, unit: 'SCU', location: 'CRU-L1', unitValueUEC: 44000 },
  { id: 'mat-03', name: 'Taranite Raffinée', category: 'Minerai Rare', quantity: 95, unit: 'SCU', location: 'ARC-L1', unitValueUEC: 32000 },
  { id: 'mat-04', name: 'Laranite Raffinée', category: 'Minerai Précieux', quantity: 340, unit: 'SCU', location: 'Lorville Cargo', unitValueUEC: 28500 },
  { id: 'mat-05', name: 'Agricium Raffiné', category: 'Minerai Industriel', quantity: 180, unit: 'SCU', location: 'HUR-L1', unitValueUEC: 25000 },
  { id: 'mat-06', name: 'RMC (Matériaux Recyclés)', category: 'Salvage Composite', quantity: 520, unit: 'SCU', location: 'Grim HEX Depot', unitValueUEC: 14500 },
  { id: 'mat-07', name: 'Titanium', category: 'Métal Industriel', quantity: 890, unit: 'SCU', location: 'Area18 TDD', unitValueUEC: 8200 },
  { id: 'mat-08', name: 'Gold Raffiné', category: 'Métal Précieux', quantity: 75, unit: 'SCU', location: 'Orison Industrial', unitValueUEC: 22000 },
  { id: 'mat-09', name: 'Copper', category: 'Métal Industriel', quantity: 640, unit: 'SCU', location: 'New Babbage', unitValueUEC: 4500 }
];

const DEFAULT_RESOURCE_REQUESTS: ResourceRequest[] = [
  {
    id: 'req-001',
    resourceName: 'Quantainium Brut ou Raffiné',
    targetQuantity: 100,
    collectedQuantity: 45,
    unit: 'SCU',
    rewardOrPriceUEC: 90000,
    urgency: 'Urgent',
    dropoffLocation: 'HUR-L1 Green Glade Station',
    notes: 'Nécessaire pour fabriquer la série de Quantum Drives militaires S2 demandés par l\'escouade.',
    status: 'open',
    createdAt: '2026-08-19 06:30',
    contributors: [
      { userId: 'member-001', userName: 'StarPilot_Max', quantity: 25, timestamp: '2026-08-19 07:12' },
      { userId: 'member-002', userName: 'Miner_Ghost', quantity: 20, timestamp: '2026-08-19 07:45' }
    ]
  },
  {
    id: 'req-002',
    resourceName: 'RMC (Recycled Material Composite)',
    targetQuantity: 200,
    collectedQuantity: 160,
    unit: 'SCU',
    rewardOrPriceUEC: 15000,
    urgency: 'Normal',
    dropoffLocation: 'Lorville L19 Hub',
    notes: 'Pour fabrication des armures lourdes Citadel et modules d\'armes.',
    status: 'open',
    createdAt: '2026-08-18 21:00',
    contributors: [
      { userId: 'member-001', userName: 'StarPilot_Max', quantity: 80, timestamp: '2026-08-19 01:15' },
      { userId: 'user-ext', userName: 'Reclaimer_Crew', quantity: 80, timestamp: '2026-08-19 03:40' }
    ]
  }
];

const DEFAULT_ORDERS: Order[] = [
  {
    id: 'ord-101',
    blueprintId: 'bp-005',
    blueprintName: 'Quantum Drive S2 (Crossfield Overcharged)',
    clientId: 'discord-member-001',
    clientName: 'StarPilot_Max',
    clientEmail: 'pilot1@discord.sc',
    quantity: 1,
    status: 'crafting',
    userProvidesMaterials: true,
    mineralQuality: 'maximum_purity',
    qualityMultiplier: 1.5,
    baseFeeUEC: 375000,
    discountType: 'percent',
    discountValue: 20,
    discountReason: 'Remise Guilde (-20%)',
    totalFeeUEC: 300000,
    deliveryLocation: 'Everus Harbor - Pad 04',
    notes: 'Priorité pour opération escadron de ce soir.',
    createdAt: '2026-08-19 07:05',
    updatedAt: '2026-08-19 07:30'
  },
  {
    id: 'ord-102',
    blueprintId: 'bp-003',
    blueprintName: 'Fusil de Précision Behring P6-LR (Mastercraft)',
    clientId: 'discord-member-002',
    clientName: 'Miner_Ghost',
    clientEmail: 'miner@discord.sc',
    quantity: 2,
    status: 'pending',
    userProvidesMaterials: false,
    mineralQuality: 'standard',
    qualityMultiplier: 1.0,
    baseFeeUEC: 70000,
    discountType: 'none',
    discountValue: 0,
    totalFeeUEC: 70000,
    deliveryLocation: 'HUR-L1 Refinery Deck',
    notes: 'À livrer dès que le raffinage d\'Agricium est prêt.',
    createdAt: '2026-08-19 07:50'
  }
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('catalog');
  const [isAgentConnected, setIsAgentConnected] = useState<boolean>(false);
  const [telemetry, setTelemetry] = useState<GameTelemetry | null>(null);

  const [blueprints, setBlueprints] = useState<Blueprint[]>(() => {
    const saved = localStorage.getItem('sc_blueprints');
    return saved ? JSON.parse(saved) : DEFAULT_BLUEPRINTS;
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('sc_inventory');
    return saved ? JSON.parse(saved) : [];
  });

  const [generalInventory, setGeneralInventory] = useState<MasterInventoryItem[]>(() => {
    const saved = localStorage.getItem('sc_general_inventory');
    return saved ? JSON.parse(saved) : [];
  });

  const [resourceRequests, setResourceRequests] = useState<ResourceRequest[]>(() => {
    const saved = localStorage.getItem('sc_resource_requests');
    return saved ? JSON.parse(saved) : DEFAULT_RESOURCE_REQUESTS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('sc_orders');
    return saved ? JSON.parse(saved) : DEFAULT_ORDERS;
  });

  // Persist to local storage with quota protection
  useEffect(() => { 
    try { localStorage.setItem('sc_blueprints', JSON.stringify(blueprints)); } catch (_) {}
  }, [blueprints]);

  useEffect(() => { 
    try {
      localStorage.setItem('sc_inventory', JSON.stringify(inventory)); 
    } catch (e) {
      console.warn('LocalStorage quota exceeded for inventory, saving lightweight metadata', e);
      const lightweight = inventory.map(({ attachedFileData, ...rest }) => rest);
      try { localStorage.setItem('sc_inventory', JSON.stringify(lightweight)); } catch (_) {}
    }
  }, [inventory]);

  useEffect(() => { 
    try { localStorage.setItem('sc_general_inventory', JSON.stringify(generalInventory)); } catch (_) {}
  }, [generalInventory]);

  useEffect(() => { 
    try { localStorage.setItem('sc_resource_requests', JSON.stringify(resourceRequests)); } catch (_) {}
  }, [resourceRequests]);

  useEffect(() => { 
    try { localStorage.setItem('sc_orders', JSON.stringify(orders)); } catch (_) {}
  }, [orders]);

  // Connect to local python agent
  const refreshAgentData = useCallback(async () => {
    try {
      const statusRes = await fetch(`${AGENT_API_URL}/status`, { signal: AbortSignal.timeout(2000) });
      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setTelemetry(statusData);
        setIsAgentConnected(true);

        // Sync general inventory from agent
        try {
          const genRes = await fetch(`${AGENT_API_URL}/general-inventory`, { signal: AbortSignal.timeout(2000) });
          if (genRes.ok) {
            const genData = await genRes.json();
            if (genData.general_inventory) {
              setGeneralInventory(genData.general_inventory);
            }
          }
        } catch (_) {}

        // Fetch blueprints, inventory, requests, orders from agent
        try {
          const [bpRes, invRes, reqRes, ordRes] = await Promise.all([
            fetch(`${AGENT_API_URL}/blueprints`),
            fetch(`${AGENT_API_URL}/inventory`),
            fetch(`${AGENT_API_URL}/resource-requests`),
            fetch(`${AGENT_API_URL}/orders`)
          ]);
          if (bpRes.ok) {
            const data = await bpRes.json();
            if (data.blueprints?.length) setBlueprints(data.blueprints);
          }
          if (invRes.ok) {
            const data = await invRes.json();
            if (data.inventory?.length) setInventory(data.inventory);
          }
          if (reqRes.ok) {
            const data = await reqRes.json();
            if (data.resource_requests?.length) setResourceRequests(data.resource_requests);
          }
          if (ordRes.ok) {
            const data = await ordRes.json();
            if (data.orders?.length) setOrders(data.orders);
          }
        } catch (e) {
          console.warn('Sub-endpoints fetch notice:', e);
        }
      } else {
        setIsAgentConnected(false);
      }
    } catch (e) {
      setIsAgentConnected(false);
    }
  }, []);

  // Periodic polling of Python agent (every 2.5s)
  useEffect(() => {
    refreshAgentData();
    const interval = setInterval(refreshAgentData, 2500);
    return () => clearInterval(interval);
  }, [refreshAgentData]);

  // Create Order
  const createOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'status'>): Promise<boolean> => {
    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      status: 'pending',
      mineralQuality: orderData.mineralQuality || 'standard',
      qualityMultiplier: orderData.qualityMultiplier || 1.0,
      baseFeeUEC: orderData.baseFeeUEC || orderData.totalFeeUEC,
      totalFeeUEC: orderData.totalFeeUEC,
      discountType: orderData.discountType || 'none',
      discountValue: orderData.discountValue || 0,
      discountReason: orderData.discountReason || '',
      createdAt: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })
    };

    setOrders(prev => [newOrder, ...prev]);

    // Push to agent if connected
    if (isAgentConnected) {
      try {
        await fetch(`${AGENT_API_URL}/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newOrder)
        });
      } catch (e) {
        console.warn('Failed to push order to local agent', e);
      }
    }
    return true;
  };

  // Update Order Price (Host modifier: % discount, fixed discount, free, custom price)
  const updateOrderPrice = async (
    orderId: string,
    discountType: 'none' | 'percent' | 'fixed' | 'free' | 'custom',
    discountValue: number,
    discountReason: string = '',
    customPrice?: number
  ): Promise<boolean> => {
    const timeStr = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    setOrders(prev => prev.map(ord => {
      if (ord.id === orderId) {
        const base = ord.baseFeeUEC || ord.totalFeeUEC;
        let newTotal = base;

        if (discountType === 'free') {
          newTotal = 0;
        } else if (discountType === 'percent') {
          const discountAmt = Math.round((base * discountValue) / 100);
          newTotal = Math.max(0, base - discountAmt);
        } else if (discountType === 'fixed') {
          newTotal = Math.max(0, base - discountValue);
        } else if (discountType === 'custom' && customPrice !== undefined) {
          newTotal = Math.max(0, customPrice);
        }

        return {
          ...ord,
          baseFeeUEC: base,
          discountType,
          discountValue,
          discountReason,
          totalFeeUEC: newTotal,
          updatedAt: timeStr
        };
      }
      return ord;
    }));

    if (isAgentConnected) {
      try {
        await fetch(`${AGENT_API_URL}/orders/price`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, discountType, discountValue, discountReason, customPrice })
        });
      } catch (e) {
        console.warn('Failed to update order price on agent', e);
      }
    }
    return true;
  };

  // Update Order Status
  const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<boolean> => {
    const timeStr = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status, updatedAt: timeStr } : o));

    if (isAgentConnected) {
      try {
        await fetch(`${AGENT_API_URL}/orders/status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, status })
        });
      } catch (e) {
        console.warn('Failed to update order status on agent', e);
      }
    }
    return true;
  };

  // Create Resource Request
  const createResourceRequest = async (reqData: Omit<ResourceRequest, 'id' | 'createdAt' | 'collectedQuantity' | 'status' | 'contributors'>): Promise<boolean> => {
    const newReq: ResourceRequest = {
      ...reqData,
      id: `req-${Date.now()}`,
      collectedQuantity: 0,
      status: 'open',
      createdAt: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) + ' ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      contributors: []
    };

    setResourceRequests(prev => [newReq, ...prev]);

    if (isAgentConnected) {
      try {
        await fetch(`${AGENT_API_URL}/resource-requests`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newReq)
        });
      } catch (e) {
        console.warn('Failed to push resource request to local agent', e);
      }
    }
    return true;
  };

  // Contribute to Resource Request
  const contributeToRequest = async (requestId: string, quantity: number): Promise<boolean> => {
    if (!currentUser) return false;
    const now = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    setResourceRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        const newCollected = req.collectedQuantity + quantity;
        return {
          ...req,
          collectedQuantity: newCollected,
          status: newCollected >= req.targetQuantity ? 'fulfilled' : 'open',
          contributors: [
            ...req.contributors,
            {
              userId: currentUser.uid,
              userName: currentUser.displayName,
              quantity,
              timestamp: now
            }
          ]
        };
      }
      return req;
    }));

    if (isAgentConnected) {
      try {
        await fetch(`${AGENT_API_URL}/resource-requests/contribute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requestId,
            userId: currentUser.uid,
            userName: currentUser.displayName,
            quantity
          })
        });
      } catch (e) {
        console.warn('Failed to submit contribution to agent', e);
      }
    }
    return true;
  };

  // Update / Add Inventory Item
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
      location = 'Station',
      category = 'Ressource',
      unitValueUEC = 10000,
      qualityTier = 'Standard (x1.0)',
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
          id: `mat-${Date.now()}`,
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
          body: JSON.stringify({
            name,
            quantity,
            unit,
            location,
            category,
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
          })
        });
      } catch (e) {
        console.warn('Failed to update inventory on agent', e);
      }
    }
    return true;
  };

  // Import batch of extracted items from file - 100% faithful 1-to-1 mapping with preview
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

    // Atomically set all extracted items in inventory (no duplicates overwritten)
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

  // Reset Inventory (Clear all or restore default)
  const resetInventory = async (mode: 'default' | 'zero' | 'empty' = 'empty'): Promise<boolean> => {
    let newItems: InventoryItem[] = [];
    if (mode === 'default') {
      newItems = [
        { id: 'mat-01', name: 'Quantainium Raffiné', category: 'Minerai Exotique', quantity: 142, unit: 'SCU', location: 'HUR-L1 Refinery', unitValueUEC: 88000 },
        { id: 'mat-02', name: 'Bexalite Raffiné', category: 'Minerai Rare', quantity: 210, unit: 'SCU', location: 'CRU-L1', unitValueUEC: 44000 },
        { id: 'mat-03', name: 'Taranite Raffinée', category: 'Minerai Rare', quantity: 95, unit: 'SCU', location: 'ARC-L1', unitValueUEC: 32000 },
        { id: 'mat-04', name: 'Laranite Raffinée', category: 'Minerai Précieux', quantity: 340, unit: 'SCU', location: 'Lorville Cargo', unitValueUEC: 28500 }
      ];
    } else {
      newItems = [];
    }
    setInventory(newItems);
    localStorage.setItem('sc_inventory', JSON.stringify(newItems));

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

  // Reload data from local source file (Game.log & inventory_store.json)
  const reloadFromSource = async (): Promise<{ success: boolean; message: string; count?: number }> => {
    if (isAgentConnected) {
      try {
        const res = await fetch(`${AGENT_API_URL}/reload-source`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.inventory) setInventory(data.inventory);
          if (data.telemetry) setTelemetry(data.telemetry);
          await refreshAgentData();
          return {
            success: true,
            message: `Fichier source Game.log et base locale rechargés avec succès (${data.inventory?.length || 0} ressources chargées)`,
            count: data.inventory?.length || 0
          };
        }
      } catch (e) {
        console.warn('Error calling reload-source on agent', e);
      }
    }

    // Local storage fallback reload
    const saved = localStorage.getItem('sc_inventory');
    if (saved) {
      setInventory(JSON.parse(saved));
    }
    return {
      success: true,
      message: 'Données rechargées depuis le stockage local',
      count: inventory.length
    };
  };

  // Add General Inventory Item (Ship, Weapon, Component, Gear...)
  const addGeneralItem = async (itemData: Omit<MasterInventoryItem, 'id'>): Promise<boolean> => {
    const newItem: MasterInventoryItem = {
      ...itemData,
      id: `gen-${Date.now()}`
    };

    setGeneralInventory(prev => [newItem, ...prev]);

    if (isAgentConnected) {
      try {
        await fetch(`${AGENT_API_URL}/general-inventory`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newItem)
        });
      } catch (e) {
        console.warn('Failed to add general item to agent', e);
      }
    }
    return true;
  };

  // Update General Inventory Item
  const updateGeneralItem = async (id: string, updates: Partial<MasterInventoryItem>): Promise<boolean> => {
    setGeneralInventory(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));

    if (isAgentConnected) {
      try {
        await fetch(`${AGENT_API_URL}/general-inventory/update`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, updates })
        });
      } catch (e) {
        console.warn('Failed to update general item on agent', e);
      }
    }
    return true;
  };

  // Delete General Inventory Item
  const deleteGeneralItem = async (id: string): Promise<boolean> => {
    setGeneralInventory(prev => prev.filter(i => i.id !== id));

    if (isAgentConnected) {
      try {
        await fetch(`${AGENT_API_URL}/general-inventory/delete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id })
        });
      } catch (e) {
        console.warn('Failed to delete general item on agent', e);
      }
    }
    return true;
  };

  // Reset General Inventory
  const resetGeneralInventory = async (): Promise<boolean> => {
    setGeneralInventory([]);
    localStorage.removeItem('sc_general_inventory');

    if (isAgentConnected) {
      try {
        await fetch(`${AGENT_API_URL}/general-inventory/reset`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (e) {
        console.warn('Failed to reset general inventory on agent', e);
      }
    }
    return true;
  };

  // Add Blueprint
  const addBlueprint = async (bpData: Omit<Blueprint, 'id'>): Promise<boolean> => {
    const newBp: Blueprint = {
      ...bpData,
      id: `bp-${Date.now()}`
    };
    setBlueprints(prev => [...prev, newBp]);

    if (isAgentConnected) {
      try {
        await fetch(`${AGENT_API_URL}/blueprints`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newBp)
        });
      } catch (e) {
        console.warn('Failed to add blueprint on agent', e);
      }
    }
    return true;
  };

  // Update Blueprint
  const updateBlueprint = async (id: string, updates: Partial<Blueprint>): Promise<boolean> => {
    setBlueprints(prev => prev.map(bp => bp.id === id ? { ...bp, ...updates } : bp));

    if (isAgentConnected) {
      try {
        await fetch(`${AGENT_API_URL}/blueprints/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        });
      } catch (e) {
        console.warn('Failed to update blueprint on agent', e);
      }
    }
    return true;
  };

  // Delete Blueprint
  const deleteBlueprint = async (id: string): Promise<boolean> => {
    setBlueprints(prev => prev.filter(bp => bp.id !== id));

    if (isAgentConnected) {
      try {
        await fetch(`${AGENT_API_URL}/blueprints/${id}`, {
          method: 'DELETE'
        });
      } catch (e) {
        console.warn('Failed to delete blueprint on agent', e);
      }
    }
    return true;
  };

  return (
    <AppContext.Provider
      value={{
        blueprints,
        inventory,
        generalInventory,
        resourceRequests,
        orders,
        telemetry,
        isAgentConnected,
        activeTab,
        setActiveTab,
        createOrder,
        updateOrderStatus,
        updateOrderPrice,
        createResourceRequest,
        contributeToRequest,
        updateInventoryItem,
        importExtractedItems,
        resetInventory,
        addBlueprint,
        updateBlueprint,
        deleteBlueprint,
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

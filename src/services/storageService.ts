import {
  RawCargoItem,
  RefinedStockItem,
  RefineryJob,
  Blueprint,
  CustomerOrder,
  ClientProfile,
  AppSettings,
  AppDataBackup
} from '../types';
import { STAR_CITIZEN_BLUEPRINTS } from '../data/blueprintsData';

const STORAGE_KEYS = {
  RAW_CARGO: 'sc_raw_cargo_v4',
  REFINED_STOCK: 'sc_refined_stock_v4',
  REFINERY_JOBS: 'sc_refinery_jobs_v4',
  CUSTOM_BLUEPRINTS: 'sc_custom_blueprints_v4',
  UNLOCKED_BLUEPRINTS: 'sc_unlocked_blueprints_v4',
  ORDERS: 'sc_orders_v4',
  CLIENTS: 'sc_clients_directory_v4',
  SETTINGS: 'sc_settings_v4',
  INITIALIZED: 'sc_clean_virgin_v4'
};

const DEFAULT_SETTINGS: AppSettings = {
  themeAccent: 'cyan',
  soundEnabled: true,
  language: 'fr',
  autoSave: true,
  gameVersion: '4.10 LIVE'
};

export class StorageService {
  private static init() {
    if (typeof window === 'undefined') return;
    const isInit = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
    if (!isInit) {
      // 100% clean & virgin initial state for all new visitors
      this.saveRawCargo([]);
      this.saveRefinedStock([]);
      this.saveRefineryJobs([]);
      this.saveCustomBlueprints([]);
      this.saveOrders([]);
      this.saveSettings(DEFAULT_SETTINGS);
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    }
  }

  // Raw Cargo
  static getRawCargo(): RawCargoItem[] {
    this.init();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RAW_CARGO);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveRawCargo(items: RawCargoItem[]) {
    localStorage.setItem(STORAGE_KEYS.RAW_CARGO, JSON.stringify(items));
  }

  // Refined Stock
  static getRefinedStock(): RefinedStockItem[] {
    this.init();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REFINED_STOCK);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveRefinedStock(items: RefinedStockItem[]) {
    localStorage.setItem(STORAGE_KEYS.REFINED_STOCK, JSON.stringify(items));
  }

  // Refinery Jobs
  static getRefineryJobs(): RefineryJob[] {
    this.init();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REFINERY_JOBS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveRefineryJobs(items: RefineryJob[]) {
    localStorage.setItem(STORAGE_KEYS.REFINERY_JOBS, JSON.stringify(items));
  }

  // Custom Blueprints
  static getCustomBlueprints(): Blueprint[] {
    this.init();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_BLUEPRINTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveCustomBlueprints(items: Blueprint[]) {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_BLUEPRINTS, JSON.stringify(items));
  }

  // User Unlocked / Selected Blueprint IDs
  static getUnlockedBlueprintIds(): string[] {
    this.init();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.UNLOCKED_BLUEPRINTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveUnlockedBlueprintIds(ids: string[]) {
    localStorage.setItem(STORAGE_KEYS.UNLOCKED_BLUEPRINTS, JSON.stringify(ids));
  }

  // All Blueprints (Built-in + Custom with strict deduplication)
  static getAllBlueprints(): Blueprint[] {
    const custom = this.getCustomBlueprints();
    const seenIds = new Set(STAR_CITIZEN_BLUEPRINTS.map(b => b.id.toLowerCase()));
    const seenNames = new Set(STAR_CITIZEN_BLUEPRINTS.map(b => b.name.toLowerCase().trim()));
    const uniqueCustom: Blueprint[] = [];

    custom.forEach(bp => {
      const lowerId = bp.id.toLowerCase();
      const lowerName = bp.name.toLowerCase().trim();
      if (!seenIds.has(lowerId) && !seenNames.has(lowerName)) {
        seenIds.add(lowerId);
        seenNames.add(lowerName);
        uniqueCustom.push(bp);
      }
    });

    return [...STAR_CITIZEN_BLUEPRINTS, ...uniqueCustom];
  }

  // Orders
  static getOrders(): CustomerOrder[] {
    this.init();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveOrders(items: CustomerOrder[]) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(items));
  }

  // Clients Directory Database
  static getClients(): ClientProfile[] {
    this.init();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CLIENTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveClients(clients: ClientProfile[]) {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  }

  static saveOrUpdateClient(clientData: {
    name: string;
    organization?: string;
    contact?: string;
    notes?: string;
  }): ClientProfile {
    const trimmedName = clientData.name.trim();
    if (!trimmedName) {
      throw new Error('Nom de client requis');
    }

    const clients = this.getClients();
    const existingIdx = clients.findIndex(c => c.name.toLowerCase().trim() === trimmedName.toLowerCase());

    const now = new Date().toISOString();
    const org = clientData.organization?.trim();
    const contact = clientData.contact?.trim();

    // Compute actual order stats
    const clientOrders = this.getOrders().filter(o => o.clientName.toLowerCase().trim() === trimmedName.toLowerCase());
    const orderCount = clientOrders.length;
    const totalSpentAUEC = clientOrders.reduce((acc, o) => acc + (o.totalPriceAUEC || 0), 0);

    if (existingIdx >= 0) {
      const existing = clients[existingIdx];
      
      // Update history of organizations
      const prevOrgs = existing.organizationsHistory || (existing.organization ? [existing.organization] : []);
      const newOrgs = org ? Array.from(new Set([org, ...prevOrgs])) : prevOrgs;

      // Update history of contacts
      const prevContacts = existing.contactsHistory || (existing.contact ? [existing.contact] : []);
      const newContacts = contact ? Array.from(new Set([contact, ...prevContacts])) : prevContacts;

      const updated: ClientProfile = {
        ...existing,
        organization: org || existing.organization,
        contact: contact || existing.contact,
        organizationsHistory: newOrgs,
        contactsHistory: newContacts,
        notes: clientData.notes?.trim() || existing.notes,
        orderCount: orderCount > 0 ? orderCount : existing.orderCount,
        totalSpentAUEC: totalSpentAUEC > 0 ? totalSpentAUEC : existing.totalSpentAUEC,
        lastUpdated: now
      };
      clients[existingIdx] = updated;
      this.saveClients(clients);
      return updated;
    } else {
      const newClient: ClientProfile = {
        id: `client-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: trimmedName,
        organization: org || undefined,
        contact: contact || undefined,
        organizationsHistory: org ? [org] : [],
        contactsHistory: contact ? [contact] : [],
        notes: clientData.notes?.trim() || undefined,
        orderCount: orderCount || 1,
        totalSpentAUEC: totalSpentAUEC || 0,
        createdAt: now,
        lastUpdated: now
      };
      clients.unshift(newClient);
      this.saveClients(clients);
      return newClient;
    }
  }

  // Get all known client names ever entered in clients, orders, stocks or refinery
  static getAllKnownClientNames(): string[] {
    const fromClients = this.getClients().map(c => c.name.trim());
    const fromOrders = this.getOrders().map(o => o.clientName.trim());
    const fromStock = this.getRefinedStock().filter(s => s.clientName).map(s => s.clientName!.trim());
    const fromJobs = this.getRefineryJobs().filter(j => j.clientName).map(j => j.clientName!.trim());

    const all = [...fromClients, ...fromOrders, ...fromStock, ...fromJobs].filter(Boolean);
    return Array.from(new Set(all)).sort((a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' }));
  }

  // Get orders associated with a client name
  static getClientOrders(clientName: string): CustomerOrder[] {
    const lower = clientName.toLowerCase().trim();
    return this.getOrders().filter(o => o.clientName.toLowerCase().trim() === lower);
  }

  static deleteClient(id: string) {
    const clients = this.getClients().filter(c => c.id !== id);
    this.saveClients(clients);
  }

  // Settings
  static getSettings(): AppSettings {
    this.init();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  static saveSettings(settings: AppSettings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  // Full Backup Export
  static exportFullBackup(): AppDataBackup {
    return {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      rawCargo: this.getRawCargo(),
      refinedStock: this.getRefinedStock(),
      refineryJobs: this.getRefineryJobs(),
      customBlueprints: this.getCustomBlueprints(),
      orders: this.getOrders(),
      clients: this.getClients(),
      settings: this.getSettings()
    };
  }

  // Full Backup Import
  static importFullBackup(backup: AppDataBackup): boolean {
    try {
      if (!backup || typeof backup !== 'object') return false;
      if (Array.isArray(backup.rawCargo)) this.saveRawCargo(backup.rawCargo);
      if (Array.isArray(backup.refinedStock)) this.saveRefinedStock(backup.refinedStock);
      if (Array.isArray(backup.refineryJobs)) this.saveRefineryJobs(backup.refineryJobs);
      if (Array.isArray(backup.customBlueprints)) this.saveCustomBlueprints(backup.customBlueprints);
      if (Array.isArray(backup.orders)) this.saveOrders(backup.orders);
      if (Array.isArray(backup.clients)) this.saveClients(backup.clients);
      if (backup.settings) this.saveSettings(backup.settings);
      return true;
    } catch {
      return false;
    }
  }

  // Clear Everything (Total reset)
  static clearAllData() {
    this.saveRawCargo([]);
    this.saveRefinedStock([]);
    this.saveRefineryJobs([]);
    this.saveCustomBlueprints([]);
    this.saveUnlockedBlueprintIds([]);
    this.saveOrders([]);
    this.saveClients([]);
  }
}

import {
  RawCargoItem,
  RefinedStockItem,
  RefineryJob,
  Blueprint,
  CustomerOrder,
  AppSettings,
  AppDataBackup
} from '../types';
import { STAR_CITIZEN_BLUEPRINTS } from '../data/blueprintsData';
import { USER_PRELOADED_STOCK } from '../data/userPreloadedStock';

const STORAGE_KEYS = {
  RAW_CARGO: 'sc_raw_cargo_v1',
  REFINED_STOCK: 'sc_refined_stock_v1',
  REFINERY_JOBS: 'sc_refinery_jobs_v1',
  CUSTOM_BLUEPRINTS: 'sc_custom_blueprints_v1',
  ORDERS: 'sc_orders_v1',
  SETTINGS: 'sc_settings_v1',
  INITIALIZED: 'sc_initialized_v2'
};

const DEFAULT_SETTINGS: AppSettings = {
  themeAccent: 'cyan',
  soundEnabled: true,
  language: 'fr',
  autoSave: true,
  gameVersion: '4.10 LIVE'
};

// Initial Seed Data for a Great First Run Experience
const SEED_RAW_CARGO: RawCargoItem[] = [
  {
    id: 'raw-1',
    mineralId: 'quantainium',
    mineralName: 'Quantainium',
    quantitySCU: 32.0,
    purityPercentage: 48.5,
    extractedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    location: 'Lyria (Lune ArcCorp)',
    ship: 'MISC Prospector (32 SCU)',
    notes: 'Filons découverts près de SAL-2, instabilité modérée.'
  },
  {
    id: 'raw-2',
    mineralId: 'bexalite',
    mineralName: 'Bexalite',
    quantitySCU: 45.0,
    purityPercentage: 62.0,
    extractedAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    location: 'Daymar (Lune Crusader)',
    ship: 'ARGO MOLE (96 SCU)',
    notes: 'Minage en groupe dans les canyons.'
  }
];

const SEED_REFINED_STOCK: RefinedStockItem[] = [
  ...USER_PRELOADED_STOCK,
  // Client Deposits demo
  {
    id: 'stock-client-1',
    mineralId: 'agricium',
    mineralName: 'Agricium',
    quantitySCU: 15.0,
    ownerType: 'client',
    clientName: 'Capitaine Jax (Nova Corp)',
    lastUpdated: new Date().toISOString(),
    notes: 'Apporté pour la commande de 4x Omnisky IX'
  },
  {
    id: 'stock-client-2',
    mineralId: 'taranite',
    mineralName: 'Taranite',
    quantitySCU: 6.0,
    ownerType: 'client',
    clientName: 'Vanguard Squadron',
    lastUpdated: new Date().toISOString(),
    notes: 'Dépôt pour réacteurs JS-300'
  }
];

const SEED_REFINERY_JOBS: RefineryJob[] = [
  {
    id: 'job-1',
    mineralId: 'quantainium',
    mineralName: 'Quantainium',
    inputRawSCU: 32.0,
    purityPercentage: 50.0,
    outputEstimatedSCU: 14.88,
    refineryStationId: 'cru_l1',
    refineryStationName: 'CRU-L1 Ambitious Dream',
    methodId: 'dinyx',
    methodName: 'Dinyx Solventation',
    costAUEC: 4500,
    startedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    durationMinutes: 45,
    completesAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    status: 'in_progress',
    targetStockType: 'personal',
    notes: 'Raffinage haute pureté 93% Dinyx'
  },
  {
    id: 'job-2',
    mineralId: 'taranite',
    mineralName: 'Taranite',
    inputRawSCU: 20.0,
    purityPercentage: 70.0,
    outputEstimatedSCU: 12.6,
    outputActualSCU: 12.6,
    refineryStationId: 'arc_l1',
    refineryStationName: 'ARC-L1 Wide Forest',
    methodId: 'cormack',
    methodName: 'Cormack Method',
    costAUEC: 2800,
    startedAt: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
    durationMinutes: 60,
    completesAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    status: 'completed',
    targetStockType: 'personal',
    notes: 'Prêt à être collecté en soute'
  }
];

const SEED_ORDERS: CustomerOrder[] = [
  {
    id: 'order-1',
    orderNumber: 'CMD-2026-001',
    clientName: 'Capitaine Jax',
    clientOrg: 'Nova Corp Security',
    clientContact: 'jax@novacorp.sc / Discord: @JaxNova',
    status: 'in_production',
    items: [
      {
        blueprintId: 'bp_weap_omnisky_ix_s3',
        blueprintName: 'Omnisky IX Laser Cannon (S3)',
        category: 'armes_vaisseau',
        quantity: 2,
        unitLaborCostAUEC: 3500,
        totalLaborCostAUEC: 7000,
        requiredIngredients: [
          { resourceId: 'agricium', resourceName: 'Agricium', quantitySCU: 3.6 },
          { resourceId: 'hadanite', resourceName: 'Hadanite', quantitySCU: 0.4, isItem: true, itemQuantity: 40 },
          { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 4.4 },
          { resourceId: 'tungsten', resourceName: 'Tungsten', quantitySCU: 3.0 }
        ]
      }
    ],
    clientSuppliedMinerals: [
      { mineralId: 'agricium', mineralName: 'Agricium', quantitySCU: 3.6 },
      { mineralId: 'titanium', mineralName: 'Titanium', quantitySCU: 4.4 }
    ],
    additionalCostsAUEC: 1000,
    totalPriceAUEC: 8000,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    notes: 'Le client a fourni la totalité de l\'Agricium et du Titane. Frais de main d\'œuvre + 40 Hadanite à facturer.',
    isPaid: false
  },
  {
    id: 'order-2',
    orderNumber: 'CMD-2026-002',
    clientName: 'Elena Rostova',
    clientOrg: 'Ghost Recon PMC',
    clientContact: 'Spectrum: Elena_R',
    status: 'ready',
    items: [
      {
        blueprintId: 'bp_arm_heavy_defiance_core',
        blueprintName: 'Plastron Lourd Defiance Core',
        category: 'armures',
        quantity: 1,
        unitLaborCostAUEC: 2500,
        totalLaborCostAUEC: 2500,
        requiredIngredients: [
          { resourceId: 'bexalite', resourceName: 'Bexalite', quantitySCU: 0.6 },
          { resourceId: 'tungsten', resourceName: 'Tungsten', quantitySCU: 0.8 },
          { resourceId: 'rmc', resourceName: 'Recycled Material Composite', quantitySCU: 1.0 }
        ]
      },
      {
        blueprintId: 'bp_arm_heavy_defiance_helm',
        blueprintName: 'Casque Lourd Defiance Helmet',
        category: 'armures',
        quantity: 1,
        unitLaborCostAUEC: 1800,
        totalLaborCostAUEC: 1800,
        requiredIngredients: [
          { resourceId: 'bexalite', resourceName: 'Bexalite', quantitySCU: 0.3 },
          { resourceId: 'quartz', resourceName: 'Quartz', quantitySCU: 0.2 },
          { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 0.4 }
        ]
      }
    ],
    clientSuppliedMinerals: [
      { mineralId: 'bexalite', mineralName: 'Bexalite', quantitySCU: 0.9 }
    ],
    additionalCostsAUEC: 500,
    totalPriceAUEC: 4800,
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    notes: 'Armures fabriquées, prêtes pour récupération au dock de Port Tressler.',
    isPaid: true
  }
];

export class StorageService {
  private static init() {
    if (typeof window === 'undefined') return;
    const isInit = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
    if (!isInit) {
      this.saveRawCargo(SEED_RAW_CARGO);
      this.saveRefinedStock(SEED_REFINED_STOCK);
      this.saveRefineryJobs(SEED_REFINERY_JOBS);
      this.saveCustomBlueprints([]);
      this.saveOrders(SEED_ORDERS);
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

  // All Blueprints (Built-in + Custom)
  static getAllBlueprints(): Blueprint[] {
    const custom = this.getCustomBlueprints();
    return [...STAR_CITIZEN_BLUEPRINTS, ...custom];
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
      if (backup.settings) this.saveSettings(backup.settings);
      return true;
    } catch {
      return false;
    }
  }

  // Reset to Demo Data
  static resetToDemoData() {
    this.saveRawCargo(SEED_RAW_CARGO);
    this.saveRefinedStock(SEED_REFINED_STOCK);
    this.saveRefineryJobs(SEED_REFINERY_JOBS);
    this.saveCustomBlueprints([]);
    this.saveOrders(SEED_ORDERS);
    this.saveSettings(DEFAULT_SETTINGS);
  }

  // Get User Preloaded Stock
  static getUserPreloadedStock(): RefinedStockItem[] {
    return [...USER_PRELOADED_STOCK];
  }

  // Clear Everything
  static clearAllData() {
    this.saveRawCargo([]);
    this.saveRefinedStock([]);
    this.saveRefineryJobs([]);
    this.saveCustomBlueprints([]);
    this.saveOrders([]);
  }
}

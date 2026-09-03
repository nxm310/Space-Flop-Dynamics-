// Mineral & Commodity Types
export type MineralGroup = 'Mineral' | 'Metal' | 'Gas' | 'Gem' | 'Salvage' | 'Composite';

export interface MineralInfo {
  id: string;
  name: string;
  displayName: string;
  group: MineralGroup;
  density: number; // g/cm3
  basePriceAUEC: number; // Average refined value per SCU
  rawPriceAUEC: number;  // Average unrefined value per SCU
  isMineable: boolean;
  isFpsMineable: boolean;
  isShipMineable: boolean;
  description?: string;
  rarity?: 'Common' | 'Uncommon' | 'Rare' | 'Very Rare' | 'Exotic';
}

// Raw Mining Cargo
export interface RawCargoItem {
  id: string;
  mineralId: string;
  mineralName: string;
  quantitySCU: number; // in SCU (1 SCU = 100 cSCU)
  purityPercentage: number; // 0 - 100%
  extractedAt: string; // ISO date
  location: string; // e.g. "Lyria", "Daymar", "Aaron Halo", "Yela"
  ship: string; // e.g. "MISC Prospector", "ARGO MOLE", "Greycat ROC", "FPS"
  notes?: string;
}

// Refined Mineral Inventory
export interface RefinedStockItem {
  id: string;
  mineralId: string;
  mineralName: string;
  quantitySCU: number;
  ownerType: 'personal' | 'client';
  clientName?: string; // If ownerType is 'client'
  lastUpdated: string;
  notes?: string;
}

// Refining Methods & Stations
export interface RefiningMethod {
  id: string;
  name: string;
  description: string;
  yieldMultiplier: number; // e.g. 0.93 for 93%
  speedMultiplier: number; // higher = faster, e.g. 1.0 is standard, 2.0 is 2x faster
  costMultiplier: number;  // higher = more expensive
}

export interface RefineryStation {
  id: string;
  name: string;
  system: string;
  yieldBonuses: Record<string, number>; // mineralId -> bonus percentage e.g. { 'quantainium': 0.05 }
  costModifiers: Record<string, number>;
}

export type RefineryJobStatus = 'in_progress' | 'completed' | 'collected' | 'cancelled';

export interface RefineryJob {
  id: string;
  mineralId: string;
  mineralName: string;
  inputRawSCU: number;
  purityPercentage: number;
  outputEstimatedSCU: number;
  outputActualSCU?: number;
  refineryStationId: string;
  refineryStationName: string;
  methodId: string;
  methodName: string;
  costAUEC: number;
  startedAt: string; // ISO date
  durationMinutes: number;
  completesAt: string; // ISO date
  status: RefineryJobStatus;
  targetStockType: 'personal' | 'client';
  clientName?: string;
  notes?: string;
}

// Blueprints & Items
export type BlueprintCategory = 'vaisseau' | 'armes_vaisseau' | 'armes_fps' | 'armures' | 'outils' | 'composants_industriels' | 'divers';

export interface BlueprintIngredient {
  resourceId: string;
  resourceName: string;
  quantitySCU: number; // in SCU or fractional SCU (e.g. 0.05 SCU = 5 cSCU)
  isItem?: boolean;    // e.g. 10 Hadanite gems or sub-component
  itemQuantity?: number;
}

export interface Blueprint {
  id: string;
  key?: string;
  name: string;
  category: BlueprintCategory;
  typeLabel: string; // e.g. "Quantum Drive", "Laser Cannon", "FPS Sniper", "Torso Armor"
  subtype?: string;
  grade?: string;
  size?: number | string;
  craftTimeSeconds: number;
  ingredients: BlueprintIngredient[];
  dismantleReturns?: BlueprintIngredient[];
  description?: string;
  isCustom?: boolean;
  gameVersion?: string;
  marketEstimatedAUEC?: number;
  iconName?: string;
}

// Order Book / Customer Orders
export type OrderStatus =
  | 'draft'               // Brouillon
  | 'pending_resources'   // En attente de ressources
  | 'refining'            // En cours de raffinage
  | 'in_production'       // En cours de fabrication
  | 'ready'               // Prêt à livrer
  | 'completed'           // Livré & Payé
  | 'cancelled';          // Annulé

export interface OrderItem {
  blueprintId: string;
  blueprintName: string;
  category: BlueprintCategory;
  quantity: number;
  unitLaborCostAUEC: number;
  totalLaborCostAUEC: number;
  requiredIngredients: BlueprintIngredient[];
}

export interface ClientMineralDeposit {
  mineralId: string;
  mineralName: string;
  quantitySCU: number;
}

export interface CustomerOrder {
  id: string;
  orderNumber: string; // e.g. "CMD-2026-001"
  clientName: string;
  clientOrg?: string;
  clientContact?: string;
  status: OrderStatus;
  items: OrderItem[];
  clientSuppliedMinerals: ClientMineralDeposit[];
  additionalCostsAUEC: number; // Other fees / discounts
  totalPriceAUEC: number;
  createdAt: string;
  dueDate?: string;
  completedAt?: string;
  notes?: string;
  isPaid?: boolean;
}

// Client Directory / Database
export interface ClientProfile {
  id: string;
  name: string;
  organization?: string;
  contact?: string; // Discord / Spectrum / Comm-Link
  organizationsHistory?: string[];
  contactsHistory?: string[];
  notes?: string;
  orderCount?: number;
  totalSpentAUEC?: number;
  createdAt: string;
  lastUpdated: string;
}

// App Theme & Settings
export interface AppSettings {
  themeAccent: 'cyan' | 'gold' | 'green' | 'red' | 'purple' | 'blue';
  soundEnabled: boolean;
  language: 'fr' | 'en';
  autoSave: boolean;
  gameVersion: string;
}

// Data Export / Import Bundle
export interface AppDataBackup {
  version: string;
  exportedAt: string;
  rawCargo: RawCargoItem[];
  refinedStock: RefinedStockItem[];
  refineryJobs: RefineryJob[];
  customBlueprints: Blueprint[];
  orders: CustomerOrder[];
  clients?: ClientProfile[];
  settings: AppSettings;
}

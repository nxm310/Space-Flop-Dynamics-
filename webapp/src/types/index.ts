export interface MaterialRequirement {
  name: string;
  quantity: number;
  unit: string;
}

export interface Blueprint {
  id: string;
  name: string;
  category: string;
  subCategory?: string;
  manufacturer?: string;
  description: string;
  icon?: string;
  requiredMaterials: MaterialRequirement[];
  craftTimeMinutes: number;
  feeUEC: number;
  available: boolean;
  isKnownByHost?: boolean;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  location?: string;
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
}

export type OrderStatus = 'pending' | 'accepted' | 'crafting' | 'ready' | 'delivered' | 'cancelled';
export type DiscountType = 'none' | 'percent' | 'fixed' | 'free' | 'custom';
export type MineralQualityTier = 'standard' | 'high_grade' | 'maximum_purity';

export interface MineralQualityOption {
  tier: MineralQualityTier;
  label: string;
  description: string;
  multiplier: number;
  badgeColor: string;
  purityRange: string;
}

export const MINERAL_QUALITY_OPTIONS: MineralQualityOption[] = [
  {
    tier: 'standard',
    label: 'Standard / Normal',
    description: 'Pureté classique des raffineries standard. Aucun surcoût.',
    multiplier: 1.0,
    badgeColor: 'bg-slate-800 text-slate-300 border-slate-700',
    purityRange: 'Pureté 70% - 85%'
  },
  {
    tier: 'high_grade',
    label: 'Haute Qualité (Rendement Élevé)',
    description: 'Sélection de gisements rares + solvant Dinyx. (+25% valeur)',
    multiplier: 1.25,
    badgeColor: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40',
    purityRange: 'Pureté 85% - 95%'
  },
  {
    tier: 'maximum_purity',
    label: 'Pureté Maximale / Mil-Spec',
    description: 'Pureté 99.9% pure, calibrage militaire sans résidus. (+50% valeur)',
    multiplier: 1.5,
    badgeColor: 'bg-purple-950/80 text-purple-300 border-purple-500/40',
    purityRange: 'Pureté 99.9% (Pur Astéroïde)'
  }
];

export interface Order {
  id: string;
  blueprintId?: string;
  blueprintName: string;
  clientName: string;
  quantity: number;
  status: OrderStatus;
  userProvidesMaterials: boolean;
  materialContributionPercent?: number; // 0 à 100%
  mineralQuality: MineralQualityTier;
  qualityMultiplier: number;
  baseFeeUEC: number;
  discountType?: DiscountType;
  discountValue?: number;
  discountReason?: string;
  totalFeeUEC: number;
  deliveryLocation: string;
  craftTimeMinutes?: number;
  requiredMaterials?: MaterialRequirement[];
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export type UserRole = 'host_crafter' | 'member';

export interface UserProfile {
  uid: string;
  email?: string;
  displayName: string;
  discordId?: string;
  discordTag?: string;
  avatar?: string;
  role: UserRole;
  orgRank?: string;
  balanceUEC?: number;
}

export interface ResourceContributor {
  userId: string;
  userName: string;
  quantity: number;
  timestamp: string;
}

export interface ResourceRequest {
  id: string;
  resourceName: string;
  targetQuantity: number;
  collectedQuantity: number;
  unit: string;
  rewardOrPriceUEC: number;
  urgency: 'Normal' | 'Urgent' | 'Critique';
  dropoffLocation: string;
  notes: string;
  status: 'open' | 'fulfilled' | 'closed';
  createdAt: string;
  contributors: ResourceContributor[];
}

export interface FirebaseConfigState {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  isConfigured: boolean;
}

export interface TelemetryLog {
  time: string;
  category: string;
  message: string;
}

export interface GameTelemetry {
  game_running: boolean;
  version: string;
  session_id: string;
  env_session: string;
  server_shard: string;
  current_location: string;
  current_ship: string;
  last_event_time?: string;
  connected_at?: string;
  recent_events: TelemetryLog[];
  log_file_found: boolean;
  log_file_size: number;
  crafter_profile?: {
    callsign: string;
    org: string;
    primary_hangar: string;
  };
}


import { RefiningMethod, RefineryStation } from '../types';

export const REFINING_METHODS: RefiningMethod[] = [
  {
    id: 'dinyx',
    name: 'Dinyx Solventation',
    description: 'Rendement maximal (93%), coût très économique, mais processus très lent. Idéal pour le Quantainium, Bexalite et Taranite.',
    yieldMultiplier: 0.93,
    speedMultiplier: 0.4, // Lent
    costMultiplier: 0.7   // Économique
  },
  {
    id: 'pyrometric',
    name: 'Pyrometric Chromanalysis',
    description: 'Très haut rendement (90%), vitesse modérée, mais coût élevé. Bon compromis si vous êtes pressé pour des minerais de grande valeur.',
    yieldMultiplier: 0.90,
    speedMultiplier: 0.8,
    costMultiplier: 1.6
  },
  {
    id: 'cormack',
    name: 'Cormack Method',
    description: 'Méthode équilibrée standard (88% de rendement, coût et vitesse moyens). Adaptée à la plupart des minerais courants.',
    yieldMultiplier: 0.88,
    speedMultiplier: 1.0,
    costMultiplier: 1.0
  },
  {
    id: 'ferron',
    name: 'Ferron Exchange',
    description: 'Processus ultra rapide avec rendement correct (85%). Coût moyen. Parfait pour libérer rapidement les soutes.',
    yieldMultiplier: 0.85,
    speedMultiplier: 1.8,
    costMultiplier: 1.1
  },
  {
    id: 'gencore',
    name: 'Gencore Process',
    description: 'Méthode industrielle rapide (84% de rendement, vitesse élevée, coût modéré).',
    yieldMultiplier: 0.84,
    speedMultiplier: 1.6,
    costMultiplier: 1.05
  },
  {
    id: 'electrostatic',
    name: 'Electrostatic Purification',
    description: 'Rapide mais très coûteuse. Rendement modéré (80%). Recommandée seulement pour des commandes urgentes.',
    yieldMultiplier: 0.80,
    speedMultiplier: 2.2,
    costMultiplier: 2.0
  },
  {
    id: 'thermocatalytic',
    name: 'Thermocatalytic Reagents',
    description: 'Bon marché et rapide, mais faible rendement (75%). Pratique pour les minerais à bas prix (Aluminium, Fer).',
    yieldMultiplier: 0.75,
    speedMultiplier: 1.5,
    costMultiplier: 0.6
  },
  {
    id: 'xcr',
    name: 'XCR Reaction',
    description: 'Procédé basique à faible rendement (70%) mais très économique.',
    yieldMultiplier: 0.70,
    speedMultiplier: 1.2,
    costMultiplier: 0.5
  }
];

export const REFINERY_STATIONS: RefineryStation[] = [
  {
    id: 'cru_l1',
    name: 'CRU-L1 Ambitious Dream',
    system: 'Stanton (Crusader)',
    yieldBonuses: {
      'quantainium': 0.05,
      'bexalite': 0.03,
      'gold': 0.04,
      'copper': -0.05
    },
    costModifiers: {
      'quantainium': 0.95
    }
  },
  {
    id: 'arc_l1',
    name: 'ARC-L1 Wide Forest',
    system: 'Stanton (ArcCorp)',
    yieldBonuses: {
      'quantainium': 0.06,
      'laranite': 0.04,
      'taranite': 0.03,
      'titanium': -0.04
    },
    costModifiers: {
      'quantainium': 0.90
    }
  },
  {
    id: 'hur_l1',
    name: 'HUR-L1 Green Glade',
    system: 'Stanton (Hurston)',
    yieldBonuses: {
      'taranite': 0.05,
      'agricium': 0.04,
      'hephaestanite': 0.04,
      'diamond': 0.03
    },
    costModifiers: {
      'agricium': 0.92
    }
  },
  {
    id: 'hur_l2',
    name: 'HUR-L2 Faithful Dream',
    system: 'Stanton (Hurston)',
    yieldBonuses: {
      'gold': 0.06,
      'bexalite': 0.05,
      'borase': 0.04,
      'quartz': -0.05
    },
    costModifiers: {
      'gold': 0.90
    }
  },
  {
    id: 'mic_l1',
    name: 'MIC-L1 Shallow Frontier',
    system: 'Stanton (microTech)',
    yieldBonuses: {
      'quantainium': 0.04,
      'laranite': 0.05,
      'beryl': 0.06,
      'corundum': 0.03
    },
    costModifiers: {
      'laranite': 0.95
    }
  },
  {
    id: 'pyro_gateway',
    name: 'Pyro Gateway / PatchCity',
    system: 'Pyro System',
    yieldBonuses: {
      'quantainium': 0.07,
      'taranite': 0.07,
      'bexalite': 0.06,
      'janalite': 0.10
    },
    costModifiers: {
      'quantainium': 1.10 // Plus cher mais très hauts rendements
    }
  },
  {
    id: 'ruin_station',
    name: 'Ruin Station',
    system: 'Pyro (Orbit)',
    yieldBonuses: {
      'agricium': 0.08,
      'gold': 0.07,
      'laranite': 0.06
    },
    costModifiers: {
      'agricium': 1.05
    }
  }
];

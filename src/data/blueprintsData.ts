import { Blueprint, BlueprintCategory } from '../types';

export const STAR_CITIZEN_BLUEPRINTS: Blueprint[] = [
  // ==========================================
  // 1. VAISSEAU & COMPOSANTS (QUANTUM, SHIELDS, POWER, COOLERS, MINING HEADS & MODULES)
  // ==========================================
  {
    id: 'bp_qd_atlas_s1',
    key: 'BP_CRAFT_QD_ATLAS_S1',
    name: 'Atlas Quantum Drive (S1)',
    category: 'vaisseau',
    typeLabel: 'Quantum Drive',
    subtype: 'Civilian Grade A',
    grade: 'A',
    size: 1,
    craftTimeSeconds: 1800,
    description: 'Le moteur quantique S1 le plus équilibré et prisé pour les chasseurs légers et explorateurs.',
    marketEstimatedAUEC: 18500,
    ingredients: [
      { resourceId: 'quantainium', resourceName: 'Quantainium', quantitySCU: 1.2 },
      { resourceId: 'taranite', resourceName: 'Taranite', quantitySCU: 0.8 },
      { resourceId: 'copper', resourceName: 'Copper', quantitySCU: 2.5 },
      { resourceId: 'silicon', resourceName: 'Silicon', quantitySCU: 1.5 }
    ]
  },
  {
    id: 'bp_qd_vk00_s1',
    key: 'BP_CRAFT_QD_VK00_S1',
    name: 'VK-00 Quantum Drive (S1)',
    category: 'vaisseau',
    typeLabel: 'Quantum Drive',
    subtype: 'Military Grade A',
    grade: 'A',
    size: 1,
    craftTimeSeconds: 2400,
    description: 'Le moteur quantique S1 le plus rapide de Stanton, consommation élevée.',
    marketEstimatedAUEC: 43500,
    ingredients: [
      { resourceId: 'quantainium', resourceName: 'Quantainium', quantitySCU: 2.5 },
      { resourceId: 'taranite', resourceName: 'Taranite', quantitySCU: 1.8 },
      { resourceId: 'gold', resourceName: 'Gold', quantitySCU: 1.2 },
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 3.0 }
    ]
  },
  {
    id: 'bp_qd_spectre_s1',
    key: 'BP_CRAFT_QD_SPECTRE_S1',
    name: 'Spectre Quantum Drive (S1)',
    category: 'vaisseau',
    typeLabel: 'Quantum Drive',
    subtype: 'Stealth Grade A',
    grade: 'A',
    size: 1,
    craftTimeSeconds: 2000,
    description: 'Moteur quantique S1 à signature radar et thermique extrêmement basse.',
    marketEstimatedAUEC: 28000,
    ingredients: [
      { resourceId: 'quantainium', resourceName: 'Quantainium', quantitySCU: 1.5 },
      { resourceId: 'bexalite', resourceName: 'Bexalite', quantitySCU: 1.2 },
      { resourceId: 'silicon', resourceName: 'Silicon', quantitySCU: 2.0 }
    ]
  },
  {
    id: 'bp_qd_crossfield_s2',
    key: 'BP_CRAFT_QD_CROSSFIELD_S2',
    name: 'Crossfield Quantum Drive (S2)',
    category: 'vaisseau',
    typeLabel: 'Quantum Drive',
    subtype: 'Military Grade A',
    grade: 'A',
    size: 2,
    craftTimeSeconds: 3600,
    description: 'Moteur militaire S2 de référence pour Cutlass, Freelancer, Zeus et Connie.',
    marketEstimatedAUEC: 86000,
    ingredients: [
      { resourceId: 'quantainium', resourceName: 'Quantainium', quantitySCU: 4.8 },
      { resourceId: 'taranite', resourceName: 'Taranite', quantitySCU: 3.2 },
      { resourceId: 'laranite', resourceName: 'Laranite', quantitySCU: 2.5 },
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 6.0 }
    ]
  },
  {
    id: 'bp_qd_xl1_s2',
    key: 'BP_CRAFT_QD_XL1_S2',
    name: 'XL-1 Quantum Drive (S2)',
    category: 'vaisseau',
    typeLabel: 'Quantum Drive',
    subtype: 'Military Grade A+',
    grade: 'A',
    size: 2,
    craftTimeSeconds: 4200,
    description: 'Le propulseur quantique S2 le plus véloce du Verse.',
    marketEstimatedAUEC: 115000,
    ingredients: [
      { resourceId: 'quantainium', resourceName: 'Quantainium', quantitySCU: 6.5 },
      { resourceId: 'taranite', resourceName: 'Taranite', quantitySCU: 4.0 },
      { resourceId: 'gold', resourceName: 'Gold', quantitySCU: 3.0 },
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 8.0 }
    ]
  },
  {
    id: 'bp_qd_ts2_s3',
    key: 'BP_CRAFT_QD_TS2_S3',
    name: 'TS-2 Quantum Drive (S3)',
    category: 'vaisseau',
    typeLabel: 'Quantum Drive',
    subtype: 'Military Grade A',
    grade: 'A',
    size: 3,
    craftTimeSeconds: 7200,
    description: 'Propulseur quantique S3 militaire lourd pour vaisseaux capitaux (Hammerhead, Carrack, Reclaimer, 890J).',
    marketEstimatedAUEC: 260000,
    ingredients: [
      { resourceId: 'quantainium', resourceName: 'Quantainium', quantitySCU: 14.0 },
      { resourceId: 'taranite', resourceName: 'Taranite', quantitySCU: 9.0 },
      { resourceId: 'laranite', resourceName: 'Laranite', quantitySCU: 8.0 },
      { resourceId: 'gold', resourceName: 'Gold', quantitySCU: 6.0 },
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 18.0 }
    ]
  },
  {
    id: 'bp_qd_pontes_s3',
    key: 'BP_CRAFT_QD_PONTES_S3',
    name: 'Pontes Quantum Drive (S3)',
    category: 'vaisseau',
    typeLabel: 'Quantum Drive',
    subtype: 'Military Grade A+',
    grade: 'A',
    size: 3,
    craftTimeSeconds: 7800,
    description: 'Propulseur quantique S3 militaire à vitesse de pointe maximale pour croiseurs et transporteurs.',
    marketEstimatedAUEC: 295000,
    ingredients: [
      { resourceId: 'quantainium', resourceName: 'Quantainium', quantitySCU: 16.0 },
      { resourceId: 'taranite', resourceName: 'Taranite', quantitySCU: 10.5 },
      { resourceId: 'bexalite', resourceName: 'Bexalite', quantitySCU: 7.0 },
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 20.0 }
    ]
  },
  // Shields
  {
    id: 'bp_shield_fr66_s1',
    key: 'BP_CRAFT_SHIELD_FR66_S1',
    name: 'FR-66 Shield Generator (S1)',
    category: 'vaisseau',
    typeLabel: 'Shield Generator',
    subtype: 'Military Grade A',
    grade: 'A',
    size: 1,
    craftTimeSeconds: 1500,
    description: 'Bouclier militaire S1 à régénération rapide, le standard en combat spatial.',
    marketEstimatedAUEC: 19800,
    ingredients: [
      { resourceId: 'bexalite', resourceName: 'Bexalite', quantitySCU: 1.5 },
      { resourceId: 'agricium', resourceName: 'Agricium', quantitySCU: 1.2 },
      { resourceId: 'borase', resourceName: 'Borase', quantitySCU: 0.8 },
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 2.0 }
    ]
  },
  {
    id: 'bp_shield_mirage_s1',
    key: 'BP_CRAFT_SHIELD_MIRAGE_S1',
    name: 'Mirage Shield Generator (S1)',
    category: 'vaisseau',
    typeLabel: 'Shield Generator',
    subtype: 'Stealth Grade A',
    grade: 'A',
    size: 1,
    craftTimeSeconds: 1400,
    description: 'Bouclier furtif S1 avec émission électromagnétique minime.',
    marketEstimatedAUEC: 22500,
    ingredients: [
      { resourceId: 'bexalite', resourceName: 'Bexalite', quantitySCU: 1.2 },
      { resourceId: 'silicon', resourceName: 'Silicon', quantitySCU: 2.0 },
      { resourceId: 'diamond', resourceName: 'Diamond', quantitySCU: 0.5 }
    ]
  },
  {
    id: 'bp_shield_fr76_s2',
    key: 'BP_CRAFT_SHIELD_FR76_S2',
    name: 'FR-76 Shield Generator (S2)',
    category: 'vaisseau',
    typeLabel: 'Shield Generator',
    subtype: 'Military Grade A',
    grade: 'A',
    size: 2,
    craftTimeSeconds: 3200,
    description: 'Bouclier militaire S2 haut débit pour chasseurs lourds et canonnières.',
    marketEstimatedAUEC: 78000,
    ingredients: [
      { resourceId: 'bexalite', resourceName: 'Bexalite', quantitySCU: 4.2 },
      { resourceId: 'agricium', resourceName: 'Agricium', quantitySCU: 3.5 },
      { resourceId: 'borase', resourceName: 'Borase', quantitySCU: 2.4 },
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 5.0 }
    ]
  },
  {
    id: 'bp_shield_7ca_s2',
    key: 'BP_CRAFT_SHIELD_7CA_S2',
    name: '7CA Shield Generator (S2)',
    category: 'vaisseau',
    typeLabel: 'Shield Generator',
    subtype: 'Stealth Grade A',
    grade: 'A',
    size: 2,
    craftTimeSeconds: 3000,
    description: 'Bouclier furtif S2 à signature thermique et infrarouge quasi indétectable.',
    marketEstimatedAUEC: 68000,
    ingredients: [
      { resourceId: 'bexalite', resourceName: 'Bexalite', quantitySCU: 3.5 },
      { resourceId: 'silicon', resourceName: 'Silicon', quantitySCU: 4.5 },
      { resourceId: 'diamond', resourceName: 'Diamond', quantitySCU: 1.2 }
    ]
  },
  {
    id: 'bp_shield_fr86_s3',
    key: 'BP_CRAFT_SHIELD_FR86_S3',
    name: 'FR-86 Shield Generator (S3)',
    category: 'vaisseau',
    typeLabel: 'Shield Generator',
    subtype: 'Military Grade A',
    grade: 'A',
    size: 3,
    craftTimeSeconds: 6500,
    description: 'Générateur de bouclier capital S3 offrant une bulle défensive impénétrable.',
    marketEstimatedAUEC: 220000,
    ingredients: [
      { resourceId: 'bexalite', resourceName: 'Bexalite', quantitySCU: 12.0 },
      { resourceId: 'agricium', resourceName: 'Agricium', quantitySCU: 10.0 },
      { resourceId: 'borase', resourceName: 'Borase', quantitySCU: 7.5 },
      { resourceId: 'tungsten', resourceName: 'Tungsten', quantitySCU: 15.0 }
    ]
  },
  {
    id: 'bp_shield_stronghold_s3',
    key: 'BP_CRAFT_SHIELD_STRONGHOLD_S3',
    name: 'Stronghold Shield Generator (S3)',
    category: 'vaisseau',
    typeLabel: 'Shield Generator',
    subtype: 'Industrial Grade A',
    grade: 'A',
    size: 3,
    craftTimeSeconds: 6200,
    description: 'Bouclier industriel S3 avec pool de points de structure maximal pour transporteurs lourds (Hull-C, C2).',
    marketEstimatedAUEC: 195000,
    ingredients: [
      { resourceId: 'bexalite', resourceName: 'Bexalite', quantitySCU: 10.0 },
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 16.0 },
      { resourceId: 'copper', resourceName: 'Copper', quantitySCU: 12.0 }
    ]
  },
  // Power Plants
  {
    id: 'bp_power_js300_s1',
    key: 'BP_CRAFT_POWER_JS300_S1',
    name: 'JS-300 Power Plant (S1)',
    category: 'vaisseau',
    typeLabel: 'Power Plant',
    subtype: 'Military Grade A',
    grade: 'A',
    size: 1,
    craftTimeSeconds: 1200,
    description: 'Génératrice militaire S1 ultra stable à haut rendement énergétique.',
    marketEstimatedAUEC: 16500,
    ingredients: [
      { resourceId: 'taranite', resourceName: 'Taranite', quantitySCU: 1.0 },
      { resourceId: 'agricium', resourceName: 'Agricium', quantitySCU: 1.5 },
      { resourceId: 'copper', resourceName: 'Copper', quantitySCU: 2.0 }
    ]
  },
  {
    id: 'bp_power_quadracell_s1',
    key: 'BP_CRAFT_POWER_QUADRACELL_S1',
    name: 'Quadracell Power Plant (S1)',
    category: 'vaisseau',
    typeLabel: 'Power Plant',
    subtype: 'Civilian Grade A',
    grade: 'A',
    size: 1,
    craftTimeSeconds: 1100,
    description: 'Génératrice S1 économique et silencieuse pour vaisseaux de reconnaissance.',
    marketEstimatedAUEC: 14200,
    ingredients: [
      { resourceId: 'taranite', resourceName: 'Taranite', quantitySCU: 0.8 },
      { resourceId: 'silicon', resourceName: 'Silicon', quantitySCU: 1.8 },
      { resourceId: 'aluminum', resourceName: 'Aluminum', quantitySCU: 2.2 }
    ]
  },
  {
    id: 'bp_power_js400_s2',
    key: 'BP_CRAFT_POWER_JS400_S2',
    name: 'JS-400 Power Plant (S2)',
    category: 'vaisseau',
    typeLabel: 'Power Plant',
    subtype: 'Military Grade A',
    grade: 'A',
    size: 2,
    craftTimeSeconds: 2800,
    description: 'Générateur de puissance S2 capable d\'alimenter les armes et boucliers les plus gourmands.',
    marketEstimatedAUEC: 64000,
    ingredients: [
      { resourceId: 'taranite', resourceName: 'Taranite', quantitySCU: 3.5 },
      { resourceId: 'agricium', resourceName: 'Agricium', quantitySCU: 4.0 },
      { resourceId: 'copper', resourceName: 'Copper', quantitySCU: 6.0 },
      { resourceId: 'gold', resourceName: 'Gold', quantitySCU: 2.0 }
    ]
  },
  {
    id: 'bp_power_superas_s3',
    key: 'BP_CRAFT_POWER_SUPERAS_S3',
    name: 'Superas Power Plant (S3)',
    category: 'vaisseau',
    typeLabel: 'Power Plant',
    subtype: 'Military Grade A',
    grade: 'A',
    size: 3,
    craftTimeSeconds: 5800,
    description: 'Réacteur de fusion S3 pour vaisseaux de ligne militaire et frégates.',
    marketEstimatedAUEC: 185000,
    ingredients: [
      { resourceId: 'taranite', resourceName: 'Taranite', quantitySCU: 9.0 },
      { resourceId: 'quantainium', resourceName: 'Quantainium', quantitySCU: 6.0 },
      { resourceId: 'gold', resourceName: 'Gold', quantitySCU: 5.5 },
      { resourceId: 'copper', resourceName: 'Copper', quantitySCU: 14.0 }
    ]
  },
  // Coolers
  {
    id: 'bp_cooler_glacier_s1',
    key: 'BP_CRAFT_COOLER_GLACIER_S1',
    name: 'Glacier Cooler (S1)',
    category: 'vaisseau',
    typeLabel: 'Cooler',
    subtype: 'Industrial Grade A',
    grade: 'A',
    size: 1,
    craftTimeSeconds: 1100,
    description: 'Refroidisseur cryogénique S1 à haute capacité de dissipation thermique.',
    marketEstimatedAUEC: 14000,
    ingredients: [
      { resourceId: 'borase', resourceName: 'Borase', quantitySCU: 1.2 },
      { resourceId: 'aluminum', resourceName: 'Aluminum', quantitySCU: 2.5 },
      { resourceId: 'quartz', resourceName: 'Quartz', quantitySCU: 1.0 }
    ]
  },
  {
    id: 'bp_cooler_icebox_s1',
    key: 'BP_CRAFT_COOLER_ICEBOX_S1',
    name: 'IceBox Cooler (S1)',
    category: 'vaisseau',
    typeLabel: 'Cooler',
    subtype: 'Stealth Grade A',
    grade: 'A',
    size: 1,
    craftTimeSeconds: 1050,
    description: 'Refroidisseur S1 à émission thermique ultra-faible pour vaisseaux furtifs.',
    marketEstimatedAUEC: 15500,
    ingredients: [
      { resourceId: 'borase', resourceName: 'Borase', quantitySCU: 1.0 },
      { resourceId: 'silicon', resourceName: 'Silicon', quantitySCU: 1.8 },
      { resourceId: 'aluminum', resourceName: 'Aluminum', quantitySCU: 2.0 }
    ]
  },
  {
    id: 'bp_cooler_avalanche_s2',
    key: 'BP_CRAFT_COOLER_AVALANCHE_S2',
    name: 'Avalanche Cooler (S2)',
    category: 'vaisseau',
    typeLabel: 'Cooler',
    subtype: 'Industrial Grade A',
    grade: 'A',
    size: 2,
    craftTimeSeconds: 2400,
    description: 'Refroidisseur industriel S2 dissipant les surchauffes de lasers lourds.',
    marketEstimatedAUEC: 48000,
    ingredients: [
      { resourceId: 'borase', resourceName: 'Borase', quantitySCU: 3.2 },
      { resourceId: 'aluminum', resourceName: 'Aluminum', quantitySCU: 6.0 },
      { resourceId: 'quartz', resourceName: 'Quartz', quantitySCU: 2.5 }
    ]
  },
  {
    id: 'bp_cooler_chillmax_s3',
    key: 'BP_CRAFT_COOLER_CHILLMAX_S3',
    name: 'ChillMax Cooler (S3)',
    category: 'vaisseau',
    typeLabel: 'Cooler',
    subtype: 'Industrial Grade A',
    grade: 'A',
    size: 3,
    craftTimeSeconds: 5200,
    description: 'Refroidisseur géant S3 pour systèmes industriels de raffinage et vaisseaux capitaux.',
    marketEstimatedAUEC: 145000,
    ingredients: [
      { resourceId: 'borase', resourceName: 'Borase', quantitySCU: 8.5 },
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 12.0 },
      { resourceId: 'aluminum', resourceName: 'Aluminum', quantitySCU: 15.0 }
    ]
  },
  // Mining Heads & Sub-Modules
  {
    id: 'bp_mining_helix_s1',
    key: 'BP_CRAFT_MINING_HELIX_S1',
    name: 'Helix I Mining Laser Head (S1)',
    category: 'vaisseau',
    typeLabel: 'Mining Head',
    subtype: 'Laser Head S1',
    grade: 'Mining Pro',
    size: 1,
    craftTimeSeconds: 1600,
    description: 'Tête de minage Prospector la plus puissante pour fracturer les gisements les plus denses (Quantainium).',
    marketEstimatedAUEC: 42000,
    ingredients: [
      { resourceId: 'diamond', resourceName: 'Diamond', quantitySCU: 1.5 },
      { resourceId: 'hephaestanite', resourceName: 'Hephaestanite', quantitySCU: 2.0 },
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 2.5 },
      { resourceId: 'copper', resourceName: 'Copper', quantitySCU: 1.8 }
    ]
  },
  {
    id: 'bp_mining_lancet_s1',
    key: 'BP_CRAFT_MINING_LANCET_S1',
    name: 'Lancet MH1 Mining Laser (S1)',
    category: 'vaisseau',
    typeLabel: 'Mining Head',
    subtype: 'Laser Head S1',
    grade: 'Stability Pro',
    size: 1,
    craftTimeSeconds: 1500,
    description: 'Tête de minage réduisant considérablement l\'instabilité et la résistance des roches volatiles.',
    marketEstimatedAUEC: 38000,
    ingredients: [
      { resourceId: 'quartz', resourceName: 'Quartz', quantitySCU: 2.0 },
      { resourceId: 'beryl', resourceName: 'Beryl', quantitySCU: 1.8 },
      { resourceId: 'tungsten', resourceName: 'Tungsten', quantitySCU: 2.0 }
    ]
  },
  {
    id: 'bp_mining_impact_s1',
    key: 'BP_CRAFT_MINING_IMPACT_S1',
    name: 'Impact I Mining Laser Head (S1)',
    category: 'vaisseau',
    typeLabel: 'Mining Head',
    subtype: 'Laser Head S1',
    grade: 'Raw Power',
    size: 1,
    craftTimeSeconds: 1400,
    description: 'Tête de minage brute à focalisation rapide pour roches à haute masse.',
    marketEstimatedAUEC: 31000,
    ingredients: [
      { resourceId: 'hephaestanite', resourceName: 'Hephaestanite', quantitySCU: 1.8 },
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 2.2 },
      { resourceId: 'copper', resourceName: 'Copper', quantitySCU: 1.5 }
    ]
  },
  {
    id: 'bp_mining_helix_s2',
    key: 'BP_CRAFT_MINING_HELIX_S2',
    name: 'Helix II Mining Laser Head (S2)',
    category: 'vaisseau',
    typeLabel: 'Mining Head',
    subtype: 'Laser Head S2',
    grade: 'Mining Heavy',
    size: 2,
    craftTimeSeconds: 3400,
    description: 'Tête de minage lourde S2 pour ARGO MOLE pulvérisant les roches géantes.',
    marketEstimatedAUEC: 108000,
    ingredients: [
      { resourceId: 'diamond', resourceName: 'Diamond', quantitySCU: 4.0 },
      { resourceId: 'hephaestanite', resourceName: 'Hephaestanite', quantitySCU: 5.5 },
      { resourceId: 'tungsten', resourceName: 'Tungsten', quantitySCU: 6.0 },
      { resourceId: 'copper', resourceName: 'Copper', quantitySCU: 4.5 }
    ]
  },
  {
    id: 'bp_mining_sub_surge',
    key: 'BP_CRAFT_MINING_SUB_SURGE',
    name: 'Module Minier Surge (Boost Instantané)',
    category: 'vaisseau',
    typeLabel: 'Mining Sub-Item',
    subtype: 'Consumable Module',
    grade: 'Industrial',
    craftTimeSeconds: 300,
    description: 'Injecte un boost de puissance instantané de +35% d\'énergie laser lors du minage.',
    marketEstimatedAUEC: 2200,
    ingredients: [
      { resourceId: 'quantainium', resourceName: 'Quantainium', quantitySCU: 0.15 },
      { resourceId: 'copper', resourceName: 'Copper', quantitySCU: 0.3 }
    ]
  },
  {
    id: 'bp_mining_sub_stampede',
    key: 'BP_CRAFT_MINING_SUB_STAMPEDE',
    name: 'Module Minier Stampede (Vitesse de Charge)',
    category: 'vaisseau',
    typeLabel: 'Mining Sub-Item',
    subtype: 'Consumable Module',
    grade: 'Industrial',
    craftTimeSeconds: 300,
    description: 'Accélère la vitesse de charge laser de +150% pour accélérer la fracture.',
    marketEstimatedAUEC: 2400,
    ingredients: [
      { resourceId: 'hephaestanite', resourceName: 'Hephaestanite', quantitySCU: 0.2 },
      { resourceId: 'aluminum', resourceName: 'Aluminum', quantitySCU: 0.35 }
    ]
  },

  // ==========================================
  // 2. ARMES DE VAISSEAU & MISSILES (RÉPÉTEURS, CANONS, GATLINGS, DISTORSION, MISSILES)
  // ==========================================
  {
    id: 'bp_weap_cf117_s1',
    key: 'BP_CRAFT_WEAP_CF117_S1',
    name: 'CF-117 Bulldog Laser Repeater (S1)',
    category: 'armes_vaisseau',
    typeLabel: 'Laser Repeater',
    subtype: 'Energy Weapon S1',
    grade: 'Military',
    size: 1,
    craftTimeSeconds: 900,
    description: 'Répéteur laser S1 réputé pour sa cadence et sa fiabilité.',
    marketEstimatedAUEC: 7500,
    ingredients: [
      { resourceId: 'borase', resourceName: 'Borase', quantitySCU: 0.6 },
      { resourceId: 'copper', resourceName: 'Copper', quantitySCU: 1.0 },
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 1.2 }
    ]
  },
  {
    id: 'bp_weap_cf227_s2',
    key: 'BP_CRAFT_WEAP_CF227_S2',
    name: 'CF-227 Badger Laser Repeater (S2)',
    category: 'armes_vaisseau',
    typeLabel: 'Laser Repeater',
    subtype: 'Energy Weapon S2',
    grade: 'Military',
    size: 2,
    craftTimeSeconds: 1500,
    description: 'Répéteur laser S2 standard équipant la majorité des chasseurs moyens.',
    marketEstimatedAUEC: 15000,
    ingredients: [
      { resourceId: 'borase', resourceName: 'Borase', quantitySCU: 1.2 },
      { resourceId: 'copper', resourceName: 'Copper', quantitySCU: 2.0 },
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 2.5 }
    ]
  },
  {
    id: 'bp_weap_cf337_s3',
    key: 'BP_CRAFT_WEAP_CF337_S3',
    name: 'CF-337 Panther Laser Repeater (S3)',
    category: 'armes_vaisseau',
    typeLabel: 'Laser Repeater',
    subtype: 'Energy Weapon S3',
    grade: 'Military',
    size: 3,
    craftTimeSeconds: 2200,
    description: 'L\'arme S3 préférée des pilotes de Gladius, Hornet et Vanguard.',
    marketEstimatedAUEC: 32000,
    ingredients: [
      { resourceId: 'borase', resourceName: 'Borase', quantitySCU: 2.5 },
      { resourceId: 'agricium', resourceName: 'Agricium', quantitySCU: 1.8 },
      { resourceId: 'copper', resourceName: 'Copper', quantitySCU: 3.5 },
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 4.0 }
    ]
  },
  {
    id: 'bp_weap_cf447_s4',
    key: 'BP_CRAFT_WEAP_CF447_S4',
    name: 'CF-447 Rhino Laser Repeater (S4)',
    category: 'armes_vaisseau',
    typeLabel: 'Laser Repeater',
    subtype: 'Energy Weapon S4',
    grade: 'Military',
    size: 4,
    craftTimeSeconds: 3600,
    description: 'Répéteur laser S4 lourd capable de percer les boucliers de frégates.',
    marketEstimatedAUEC: 62000,
    ingredients: [
      { resourceId: 'borase', resourceName: 'Borase', quantitySCU: 4.5 },
      { resourceId: 'agricium', resourceName: 'Agricium', quantitySCU: 3.2 },
      { resourceId: 'copper', resourceName: 'Copper', quantitySCU: 6.0 },
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 7.5 }
    ]
  },
  {
    id: 'bp_weap_omnisky_ix_s3',
    key: 'BP_CRAFT_WEAP_OMNISKY_IX_S3',
    name: 'Omnisky IX Laser Cannon (S3)',
    category: 'armes_vaisseau',
    typeLabel: 'Laser Cannon',
    subtype: 'Precision Energy S3',
    grade: 'Military',
    size: 3,
    craftTimeSeconds: 2400,
    description: 'Canon laser haute vélocité et dégâts alpha élevés à longue portée.',
    marketEstimatedAUEC: 36000,
    ingredients: [
      { resourceId: 'diamond', resourceName: 'Diamond', quantitySCU: 1.2 },
      { resourceId: 'borase', resourceName: 'Borase', quantitySCU: 2.8 },
      { resourceId: 'copper', resourceName: 'Copper', quantitySCU: 3.0 },
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 4.0 }
    ]
  },
  {
    id: 'bp_weap_omnisky_xii_s4',
    key: 'BP_CRAFT_WEAP_OMNISKY_XII_S4',
    name: 'Omnisky XII Laser Cannon (S4)',
    category: 'armes_vaisseau',
    typeLabel: 'Laser Cannon',
    subtype: 'Precision Energy S4',
    grade: 'Military',
    size: 4,
    craftTimeSeconds: 3800,
    description: 'Canon laser lourd S4 pour engagement sniper à distance.',
    marketEstimatedAUEC: 72000,
    ingredients: [
      { resourceId: 'diamond', resourceName: 'Diamond', quantitySCU: 2.5 },
      { resourceId: 'borase', resourceName: 'Borase', quantitySCU: 5.0 },
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 8.0 }
    ]
  },
  {
    id: 'bp_weap_ad4b_s4',
    key: 'BP_CRAFT_WEAP_AD4B_S4',
    name: 'AD4B Ballistic Gatling (S4)',
    category: 'armes_vaisseau',
    typeLabel: 'Ballistic Gatling',
    subtype: 'Heavy Ballistic S4',
    grade: 'Military',
    size: 4,
    craftTimeSeconds: 4000,
    description: 'Gatling balistique S4 dévastatrice avec réserve de munitions intégrée pour Corsair / Vanguard.',
    marketEstimatedAUEC: 84000,
    ingredients: [
      { resourceId: 'tungsten', resourceName: 'Tungsten', quantitySCU: 6.0 },
      { resourceId: 'bexalite', resourceName: 'Bexalite', quantitySCU: 3.5 },
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 8.0 },
      { resourceId: 'iron', resourceName: 'Iron', quantitySCU: 5.0 }
    ]
  },
  {
    id: 'bp_weap_ad5b_s5',
    key: 'BP_CRAFT_WEAP_AD5B_S5',
    name: 'AD5B Ballistic Gatling (S5)',
    category: 'armes_vaisseau',
    typeLabel: 'Ballistic Gatling',
    subtype: 'SuperHeavy Ballistic S5',
    grade: 'Military',
    size: 5,
    craftTimeSeconds: 5400,
    description: 'Gatling balistique S5 colossale pour Constellation, Corsair et Redeemer.',
    marketEstimatedAUEC: 135000,
    ingredients: [
      { resourceId: 'tungsten', resourceName: 'Tungsten', quantitySCU: 11.0 },
      { resourceId: 'bexalite', resourceName: 'Bexalite', quantitySCU: 6.5 },
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 14.0 },
      { resourceId: 'iron', resourceName: 'Iron', quantitySCU: 8.0 }
    ]
  },
  {
    id: 'bp_weap_mantis_gt220_s3',
    key: 'BP_CRAFT_WEAP_MANTIS_GT220_S3',
    name: 'Mantis GT-220 Ballistic Gatling (S3)',
    category: 'armes_vaisseau',
    typeLabel: 'Ballistic Gatling',
    subtype: 'Ballistic S3',
    grade: 'Military',
    size: 3,
    craftTimeSeconds: 2100,
    description: 'Gatling balistique S3 ultra rapide pour combat rapproché.',
    marketEstimatedAUEC: 29000,
    ingredients: [
      { resourceId: 'tungsten', resourceName: 'Tungsten', quantitySCU: 3.5 },
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 4.0 },
      { resourceId: 'iron', resourceName: 'Iron', quantitySCU: 2.5 }
    ]
  },
  {
    id: 'bp_weap_m7a_s5',
    key: 'BP_CRAFT_WEAP_M7A_S5',
    name: 'Behring M7A Laser Cannon (S5)',
    category: 'armes_vaisseau',
    typeLabel: 'Laser Cannon',
    subtype: 'SuperHeavy Energy S5',
    grade: 'Military',
    size: 5,
    craftTimeSeconds: 5000,
    description: 'Canon laser S5 de classe capitale avec force d\'impact phénoménale (600i, Ares Ion).',
    marketEstimatedAUEC: 120000,
    ingredients: [
      { resourceId: 'diamond', resourceName: 'Diamond', quantitySCU: 4.5 },
      { resourceId: 'borase', resourceName: 'Borase', quantitySCU: 8.0 },
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 12.0 }
    ]
  },
  {
    id: 'bp_missile_tempest_s2',
    key: 'BP_CRAFT_MISSILE_TEMPEST_S2',
    name: 'Tempest II Cross-Section Missile (S2 - Lot de 4)',
    category: 'armes_vaisseau',
    typeLabel: 'Missile',
    subtype: 'Cross-Section Tracker S2',
    grade: 'Military',
    size: 2,
    craftTimeSeconds: 800,
    description: 'Missiles à guidage radar Cross-Section ultra résistants aux leurres.',
    marketEstimatedAUEC: 5600,
    ingredients: [
      { resourceId: 'hephaestanite', resourceName: 'Hephaestanite', quantitySCU: 0.8 },
      { resourceId: 'aluminum', resourceName: 'Aluminum', quantitySCU: 1.5 },
      { resourceId: 'silicon', resourceName: 'Silicon', quantitySCU: 0.8 }
    ]
  },
  {
    id: 'bp_torpedo_seeker_ix_s9',
    key: 'BP_CRAFT_TORPEDO_SEEKER_S9',
    name: 'Seeker IX Heavy Torpedo (S9)',
    category: 'armes_vaisseau',
    typeLabel: 'Torpedo',
    subtype: 'Anti-Capital S9',
    grade: 'Military Strike',
    size: 9,
    craftTimeSeconds: 4500,
    description: 'Torpille lourde S9 pour bombardiers Eclipse et Retaliator capable d\'anéantir un vaisseau capital.',
    marketEstimatedAUEC: 48000,
    ingredients: [
      { resourceId: 'quantainium', resourceName: 'Quantainium', quantitySCU: 3.5 },
      { resourceId: 'hephaestanite', resourceName: 'Hephaestanite', quantitySCU: 4.0 },
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 6.0 },
      { resourceId: 'aluminum', resourceName: 'Aluminum', quantitySCU: 4.0 }
    ]
  },

  // ==========================================
  // 3. ARMES FPS & ATTACHEMENTS (ASSAUT, LMG, SNIPER, RAILGUN, PISTOLETS)
  // ==========================================
  {
    id: 'bp_fps_p4ar',
    key: 'BP_CRAFT_FPS_P4AR',
    name: 'Fusil d\'Assaut Behring P4-AR (Ballistique)',
    category: 'armes_fps',
    typeLabel: 'Fusil d\'Assaut',
    subtype: 'Ballistic Rifle',
    grade: 'Military',
    craftTimeSeconds: 450,
    description: 'Fusil d\'assaut 5.56mm standard des forces armées de l\'UEE.',
    marketEstimatedAUEC: 3200,
    ingredients: [
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 0.25 },
      { resourceId: 'aluminum', resourceName: 'Aluminum', quantitySCU: 0.4 },
      { resourceId: 'tungsten', resourceName: 'Tungsten', quantitySCU: 0.15 }
    ]
  },
  {
    id: 'bp_fps_gallant',
    key: 'BP_CRAFT_FPS_GALLANT',
    name: 'Fusil Laser Klaus & Werner Gallant',
    category: 'armes_fps',
    typeLabel: 'Fusil Énergie',
    subtype: 'Energy Rifle',
    grade: 'Civilian/Security',
    craftTimeSeconds: 500,
    description: 'Fusil d\'assaut énergétique tirant en rafales précises de 3 coups.',
    marketEstimatedAUEC: 3800,
    ingredients: [
      { resourceId: 'borase', resourceName: 'Borase', quantitySCU: 0.2 },
      { resourceId: 'copper', resourceName: 'Copper', quantitySCU: 0.35 },
      { resourceId: 'silicon', resourceName: 'Silicon', quantitySCU: 0.25 }
    ]
  },
  {
    id: 'bp_fps_karna',
    key: 'BP_CRAFT_FPS_KARNA',
    name: 'Fusil Plasma Kastak Arms Karna',
    category: 'armes_fps',
    typeLabel: 'Fusil Plasma',
    subtype: 'Plasma Rifle',
    grade: 'Outlaw/Mercenary',
    craftTimeSeconds: 600,
    description: 'Fusil hybride lourd infligeant d\'immenses dégâts thermiques et de pénétration.',
    marketEstimatedAUEC: 4500,
    ingredients: [
      { resourceId: 'taranite', resourceName: 'Taranite', quantitySCU: 0.25 },
      { resourceId: 'hephaestanite', resourceName: 'Hephaestanite', quantitySCU: 0.3 },
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 0.35 }
    ]
  },
  {
    id: 'bp_fps_fs9_lmg',
    key: 'BP_CRAFT_FPS_FS9',
    name: 'Mitrailleuse Lourde Behring FS-9 LMG',
    category: 'armes_fps',
    typeLabel: 'Mitrailleuse Lourde',
    subtype: 'LMG Ballistic',
    grade: 'Military Heavy',
    craftTimeSeconds: 700,
    description: 'Mitrailleuse lourde avec chargeur tambour de 120 cartouches.',
    marketEstimatedAUEC: 5800,
    ingredients: [
      { resourceId: 'tungsten', resourceName: 'Tungsten', quantitySCU: 0.45 },
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 0.5 },
      { resourceId: 'aluminum', resourceName: 'Aluminum', quantitySCU: 0.6 }
    ]
  },
  {
    id: 'bp_fps_p6lr_sniper',
    key: 'BP_CRAFT_FPS_P6LR',
    name: 'Fusil de Précision Behring P6-LR Sniper',
    category: 'armes_fps',
    typeLabel: 'Fusil Sniper',
    subtype: 'Precision 8mm Sniper',
    grade: 'Military Marksman',
    craftTimeSeconds: 650,
    description: 'Fusil de précision balistique lourd longue portée abattant la cible en un tir.',
    marketEstimatedAUEC: 6200,
    ingredients: [
      { resourceId: 'tungsten', resourceName: 'Tungsten', quantitySCU: 0.4 },
      { resourceId: 'diamond', resourceName: 'Diamond', quantitySCU: 0.15 },
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 0.45 }
    ]
  },
  {
    id: 'bp_fps_s71_rifle',
    key: 'BP_CRAFT_FPS_S71',
    name: 'Fusil Semi-Auto Gemini S71 Marksman',
    category: 'armes_fps',
    typeLabel: 'Fusil Semi-Auto',
    subtype: 'Marksman Rifle',
    grade: 'Special Ops',
    craftTimeSeconds: 520,
    description: 'Fusil semi-automatique 6.5mm pour tirs d\'appui chirurgicaux.',
    marketEstimatedAUEC: 4100,
    ingredients: [
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 0.3 },
      { resourceId: 'aluminum', resourceName: 'Aluminum', quantitySCU: 0.4 },
      { resourceId: 'silicon', resourceName: 'Silicon', quantitySCU: 0.15 }
    ]
  },
  {
    id: 'bp_fps_c54_smg',
    key: 'BP_CRAFT_FPS_C54_SMG',
    name: 'Pistolet Mitrailleur Gemini C54 SMG',
    category: 'armes_fps',
    typeLabel: 'Mitraillette',
    subtype: 'Ballistic SMG',
    grade: 'Close Quarters',
    craftTimeSeconds: 380,
    description: 'Arme de combat rapproché ultra légère avec une cadence cyclique fulgurante.',
    marketEstimatedAUEC: 2600,
    ingredients: [
      { resourceId: 'aluminum', resourceName: 'Aluminum', quantitySCU: 0.35 },
      { resourceId: 'copper', resourceName: 'Copper', quantitySCU: 0.2 }
    ]
  },
  {
    id: 'bp_fps_railgun_scourge',
    key: 'BP_CRAFT_FPS_RAILGUN',
    name: 'Canon Électromagnétique Apocalypse Arms Scourge Railgun',
    category: 'armes_fps',
    typeLabel: 'Arme Lourde Anti-Véhicule',
    subtype: 'Anti-Vehicle Railgun',
    grade: 'Military Heavy',
    craftTimeSeconds: 1200,
    description: 'Arme d\'épaule électromagnétique capable d\'abattre des vaisseaux légers et blindés au sol.',
    marketEstimatedAUEC: 18500,
    ingredients: [
      { resourceId: 'taranite', resourceName: 'Taranite', quantitySCU: 0.8 },
      { resourceId: 'bexalite', resourceName: 'Bexalite', quantitySCU: 0.6 },
      { resourceId: 'tungsten', resourceName: 'Tungsten', quantitySCU: 1.0 },
      { resourceId: 'gold', resourceName: 'Gold', quantitySCU: 0.4 }
    ]
  },
  {
    id: 'bp_fps_grenade_frag',
    key: 'BP_CRAFT_FPS_GRENADE_FRAG',
    name: 'Grenades à Fragmentation A03 (Lot de 4)',
    category: 'armes_fps',
    typeLabel: 'Explosif FPS',
    subtype: 'Frag Grenade',
    grade: 'Tactical',
    craftTimeSeconds: 180,
    description: 'Explosifs anti-personnel haute pression avec éclat shrapnel.',
    marketEstimatedAUEC: 1200,
    ingredients: [
      { resourceId: 'hephaestanite', resourceName: 'Hephaestanite', quantitySCU: 0.2 },
      { resourceId: 'iron', resourceName: 'Iron', quantitySCU: 0.3 }
    ]
  },

  // ==========================================
  // 4. ARMURES & COMBINAISONS (DEFIANCE, ORC, NOVIKOV, PEMBROKE, MOROZOV)
  // ==========================================
  {
    id: 'bp_arm_heavy_defiance_core',
    key: 'BP_CRAFT_ARM_DEFIANCE_CORE',
    name: 'Plastron Lourd Roush Defiance Core',
    category: 'armures',
    typeLabel: 'Armure Lourde',
    subtype: 'Heavy Torso Armor',
    grade: 'Military Heavy 40%',
    craftTimeSeconds: 600,
    description: 'Plastron blindé offrant 40% de réduction de dégâts et support d\'armes lourdes.',
    marketEstimatedAUEC: 4800,
    ingredients: [
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 0.5 },
      { resourceId: 'tungsten', resourceName: 'Tungsten', quantitySCU: 0.35 },
      { resourceId: 'bexalite', resourceName: 'Bexalite', quantitySCU: 0.15 }
    ]
  },
  {
    id: 'bp_arm_heavy_defiance_helm',
    key: 'BP_CRAFT_ARM_DEFIANCE_HELM',
    name: 'Casque Blindé Roush Defiance Helmet',
    category: 'armures',
    typeLabel: 'Casque Lourd',
    subtype: 'Heavy Helmet',
    grade: 'Military Heavy',
    craftTimeSeconds: 400,
    description: 'Casque intégral avec HUD tactique renforcé contre les tirs de snipers.',
    marketEstimatedAUEC: 2800,
    ingredients: [
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 0.3 },
      { resourceId: 'silicon', resourceName: 'Silicon', quantitySCU: 0.2 },
      { resourceId: 'diamond', resourceName: 'Diamond', quantitySCU: 0.08 }
    ]
  },
  {
    id: 'bp_arm_medium_orcmkx_core',
    key: 'BP_CRAFT_ARM_ORCMKX_CORE',
    name: 'Plastron Moyen CDS ORC-mkX Core',
    category: 'armures',
    typeLabel: 'Armure Moyenne',
    subtype: 'Medium Torso Armor',
    grade: 'Military Medium 30%',
    craftTimeSeconds: 480,
    description: 'L\'armure moyenne la plus populaire de la Navy, excellent ratio protection / mobilité.',
    marketEstimatedAUEC: 3600,
    ingredients: [
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 0.35 },
      { resourceId: 'aluminum', resourceName: 'Aluminum', quantitySCU: 0.4 }
    ]
  },
  {
    id: 'bp_arm_heavy_morozov_core',
    key: 'BP_CRAFT_ARM_MOROZOV_CORE',
    name: 'Plastron Blindé Morozov-SH Core',
    category: 'armures',
    typeLabel: 'Armure Lourde',
    subtype: 'Heavy Torso Armor',
    grade: 'Security Heavy 40%',
    craftTimeSeconds: 650,
    description: 'Armure renforcée pour forces de sécurité avec plaque balistique multicouche.',
    marketEstimatedAUEC: 5200,
    ingredients: [
      { resourceId: 'tungsten', resourceName: 'Tungsten', quantitySCU: 0.5 },
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 0.45 },
      { resourceId: 'iron', resourceName: 'Iron', quantitySCU: 0.3 }
    ]
  },
  {
    id: 'bp_arm_suit_novikov',
    key: 'BP_CRAFT_SUIT_NOVIKOV',
    name: 'Combinaison Environnementale Novikov (Grand Froid -150°C)',
    category: 'armures',
    typeLabel: 'Combinaison Spécialisée',
    subtype: 'Cold Environment Suit',
    grade: 'Thermal Exploration',
    craftTimeSeconds: 900,
    description: 'Permet d\'explorer et miner à pied sur microTech, Calliope et Clio par tempête extrême.',
    marketEstimatedAUEC: 12500,
    ingredients: [
      { resourceId: 'borase', resourceName: 'Borase', quantitySCU: 0.5 },
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 0.6 },
      { resourceId: 'silicon', resourceName: 'Silicon', quantitySCU: 0.4 }
    ]
  },
  {
    id: 'bp_arm_suit_pembroke',
    key: 'BP_CRAFT_SUIT_PEMBROKE',
    name: 'Combinaison Environnementale Pembroke (Haute Chaleur +250°C)',
    category: 'armures',
    typeLabel: 'Combinaison Spécialisée',
    subtype: 'Heat Environment Suit',
    grade: 'Thermal Exploration',
    craftTimeSeconds: 900,
    description: 'Permet de survivre sur les mondes volcaniques et désertiques arides (Hurston, Daymar, Arial).',
    marketEstimatedAUEC: 12500,
    ingredients: [
      { resourceId: 'hephaestanite', resourceName: 'Hephaestanite', quantitySCU: 0.5 },
      { resourceId: 'tungsten', resourceName: 'Tungsten', quantitySCU: 0.5 },
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 0.6 }
    ]
  },

  // ==========================================
  // 5. OUTILS & GADGETS (MULTI-TOOL, TRACTOR, SALVAGE, MINING GADGETS, MEDICAL, CRYPTOKEY)
  // ==========================================
  {
    id: 'bp_tool_pyro_multitool',
    key: 'BP_CRAFT_TOOL_MULTITOOL',
    name: 'Outil Multifonction Greycat Pyro RYT Multi-Tool',
    category: 'outils',
    typeLabel: 'Outil Utilitaire',
    subtype: 'Multi-Tool Chassis',
    grade: 'Industrial',
    craftTimeSeconds: 250,
    description: 'Le châssis universel indispensable pouvant accueillir des têtes de minage, rayon tracteur et découpe.',
    marketEstimatedAUEC: 1500,
    ingredients: [
      { resourceId: 'aluminum', resourceName: 'Aluminum', quantitySCU: 0.2 },
      { resourceId: 'copper', resourceName: 'Copper', quantitySCU: 0.15 },
      { resourceId: 'silicon', resourceName: 'Silicon', quantitySCU: 0.1 }
    ]
  },
  {
    id: 'bp_tool_mod_tractor',
    key: 'BP_CRAFT_TOOL_MOD_TRACTOR',
    name: 'Module Rayon Tracteur TruHold Tractor Beam',
    category: 'outils',
    typeLabel: 'Module Outil',
    subtype: 'Tractor Attachment',
    grade: 'Cargo Handling',
    craftTimeSeconds: 200,
    description: 'Module pour Multi-Tool déplaçant les boîtes et minerais jusqu\'à 250 kg.',
    marketEstimatedAUEC: 1200,
    ingredients: [
      { resourceId: 'gold', resourceName: 'Gold', quantitySCU: 0.1 },
      { resourceId: 'copper', resourceName: 'Copper', quantitySCU: 0.2 }
    ]
  },
  {
    id: 'bp_tool_maxlift_tractor',
    key: 'BP_CRAFT_TOOL_MAXLIFT',
    name: 'Rayon Tracteur Lourd 2 Mains Greycat MaxLift',
    category: 'outils',
    typeLabel: 'Outil Lourd',
    subtype: 'Heavy Tractor Beam',
    grade: 'Cargo Master',
    craftTimeSeconds: 450,
    description: 'Rayon tracteur lourd à deux mains permettant de manipuler des conteneurs de 32 SCU et véhicules.',
    marketEstimatedAUEC: 6500,
    ingredients: [
      { resourceId: 'gold', resourceName: 'Gold', quantitySCU: 0.35 },
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 0.6 },
      { resourceId: 'copper', resourceName: 'Copper', quantitySCU: 0.5 }
    ]
  },
  {
    id: 'bp_tool_mod_salvage_cambio',
    key: 'BP_CRAFT_TOOL_MOD_SALVAGE',
    name: 'Module de Découpage / Scraping SRT Cambio-Lite',
    category: 'outils',
    typeLabel: 'Module Outil',
    subtype: 'Salvage Attachment',
    grade: 'Salvage Pro',
    craftTimeSeconds: 220,
    description: 'Permet de décaper les coques de vaisseaux pour produire des caisses de RMC.',
    marketEstimatedAUEC: 1400,
    ingredients: [
      { resourceId: 'diamond', resourceName: 'Diamond', quantitySCU: 0.1 },
      { resourceId: 'tungsten', resourceName: 'Tungsten', quantitySCU: 0.2 }
    ]
  },
  {
    id: 'bp_tool_medgun_paramed',
    key: 'BP_CRAFT_TOOL_MEDGUN',
    name: 'Pistolet Médical CureLife Medical Gun (Paramed)',
    category: 'outils',
    typeLabel: 'Outil Médical',
    subtype: 'Medical Tool',
    grade: 'Healthcare',
    craftTimeSeconds: 350,
    description: 'Diagnostique les blessures et injecte des doses précises d\'Hemozaline, Resurgera et Roxaphen.',
    marketEstimatedAUEC: 2800,
    ingredients: [
      { resourceId: 'silicon', resourceName: 'Silicon', quantitySCU: 0.25 },
      { resourceId: 'aluminum', resourceName: 'Aluminum', quantitySCU: 0.3 },
      { resourceId: 'copper', resourceName: 'Copper', quantitySCU: 0.15 }
    ]
  },
  {
    id: 'bp_tool_gadget_boremax',
    key: 'BP_CRAFT_MINING_GADGET_BOREMAX',
    name: 'Gadget Minier BoreMax (Stabilité & Zone Verte)',
    category: 'outils',
    typeLabel: 'Gadget Minier',
    subtype: 'Deployable Gadget',
    grade: 'Pro Mining',
    craftTimeSeconds: 400,
    description: 'Gadget à fixer sur les gisements pour augmenter la zone verte de fracture de +40%.',
    marketEstimatedAUEC: 2500,
    ingredients: [
      { resourceId: 'hephaestanite', resourceName: 'Hephaestanite', quantitySCU: 0.2 },
      { resourceId: 'diamond', resourceName: 'Diamond', quantitySCU: 0.15 },
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 0.25 }
    ]
  },
  {
    id: 'bp_tool_tigerclaw',
    key: 'BP_CRAFT_TOOL_TIGERCLAW',
    name: 'Puce Cryptographique Tigerclaw (Hacking CrimeStat)',
    category: 'outils',
    typeLabel: 'Cryptokey',
    subtype: 'Hacking Device',
    grade: 'Infiltration',
    craftTimeSeconds: 500,
    description: 'Puce d\'infiltration utilisée pour effacer le Statut Criminel (CrimeStat) dans les terminaux de sécurité.',
    marketEstimatedAUEC: 4500,
    ingredients: [
      { resourceId: 'gold', resourceName: 'Gold', quantitySCU: 0.2 },
      { resourceId: 'silicon', resourceName: 'Silicon', quantitySCU: 0.3 },
      { resourceId: 'copper', resourceName: 'Copper', quantitySCU: 0.15 }
    ]
  },

  // ==========================================
  // 6. COMPOSANTS INDUSTRIELS, CONTENEURS & CARGO (1 SCU à 32 SCU, ORE PODS, RELAIS)
  // ==========================================
  {
    id: 'bp_mat_scu_container_1',
    key: 'BP_CRAFT_CONTAINER_1SCU',
    name: 'Boîte de Fret Sécurisée (1 SCU Container)',
    category: 'composants_industriels',
    typeLabel: 'Conteneur Fret',
    subtype: 'Cargo Box',
    grade: 'Industrial',
    craftTimeSeconds: 180,
    description: 'Conteneur métallique 1 SCU standard magnétisable sur grille cargo.',
    marketEstimatedAUEC: 950,
    ingredients: [
      { resourceId: 'aluminum', resourceName: 'Aluminum', quantitySCU: 0.6 },
      { resourceId: 'iron', resourceName: 'Iron', quantitySCU: 0.4 }
    ]
  },
  {
    id: 'bp_mat_scu_container_2',
    key: 'BP_CRAFT_CONTAINER_2SCU',
    name: 'Caisse de Fret Standard (2 SCU Container)',
    category: 'composants_industriels',
    typeLabel: 'Conteneur Fret',
    subtype: 'Cargo Box',
    grade: 'Industrial',
    craftTimeSeconds: 240,
    description: 'Caisse cargo moyenne 2 SCU pour stocker des minerais raffinés ou armes.',
    marketEstimatedAUEC: 1800,
    ingredients: [
      { resourceId: 'aluminum', resourceName: 'Aluminum', quantitySCU: 1.1 },
      { resourceId: 'iron', resourceName: 'Iron', quantitySCU: 0.7 }
    ]
  },
  {
    id: 'bp_mat_scu_container_8',
    key: 'BP_CRAFT_CONTAINER_8SCU',
    name: 'Conteneur Cargo Lourd (8 SCU Container)',
    category: 'composants_industriels',
    typeLabel: 'Conteneur Fret',
    subtype: 'Cargo Box',
    grade: 'Industrial Heavy',
    craftTimeSeconds: 600,
    description: 'Grande caisse de fret de 8 SCU avec renforts d\'amarrage.',
    marketEstimatedAUEC: 6200,
    ingredients: [
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 2.0 },
      { resourceId: 'aluminum', resourceName: 'Aluminum', quantitySCU: 3.5 },
      { resourceId: 'iron', resourceName: 'Iron', quantitySCU: 2.5 }
    ]
  },
  {
    id: 'bp_mat_scu_container_16',
    key: 'BP_CRAFT_CONTAINER_16SCU',
    name: 'Grand Conteneur Cargo (16 SCU Container)',
    category: 'composants_industriels',
    typeLabel: 'Conteneur Fret',
    subtype: 'Cargo Box',
    grade: 'Industrial SuperHeavy',
    craftTimeSeconds: 900,
    description: 'Conteneur 16 SCU compatible avec les ascenseurs de fret (Freight Elevators 3.24+).',
    marketEstimatedAUEC: 11800,
    ingredients: [
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 4.0 },
      { resourceId: 'aluminum', resourceName: 'Aluminum', quantitySCU: 6.5 },
      { resourceId: 'iron', resourceName: 'Iron', quantitySCU: 4.5 }
    ]
  },
  {
    id: 'bp_mat_scu_container_32',
    key: 'BP_CRAFT_CONTAINER_32SCU',
    name: 'Conteneur Cargo Géant (32 SCU Container)',
    category: 'composants_industriels',
    typeLabel: 'Conteneur Fret',
    subtype: 'Cargo Box',
    grade: 'Mass Transport',
    craftTimeSeconds: 1500,
    description: 'Le plus grand conteneur standardisé (32 SCU) pour transporteurs C2 Hercules, Taurus et Hull-C.',
    marketEstimatedAUEC: 22000,
    ingredients: [
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 7.5 },
      { resourceId: 'aluminum', resourceName: 'Aluminum', quantitySCU: 12.0 },
      { resourceId: 'iron', resourceName: 'Iron', quantitySCU: 8.0 }
    ]
  },
  {
    id: 'bp_mat_ore_pod_32',
    key: 'BP_CRAFT_ORE_POD_32',
    name: 'Caisson Minier Détachable MISC Ore Pod (32 SCU)',
    category: 'composants_industriels',
    typeLabel: 'Mining Pod',
    subtype: 'Detachable Ore Pod',
    grade: 'Mining Industrial',
    craftTimeSeconds: 1800,
    description: 'Poche minérale détachable pour MISC Prospector permettant d\'éjecter sa soute pleine dans l\'espace.',
    marketEstimatedAUEC: 28000,
    ingredients: [
      { resourceId: 'titanium', resourceName: 'Titanium', quantitySCU: 6.0 },
      { resourceId: 'tungsten', resourceName: 'Tungsten', quantitySCU: 3.5 },
      { resourceId: 'aluminum', resourceName: 'Aluminum', quantitySCU: 8.0 }
    ]
  },
  {
    id: 'bp_ind_quantum_relay',
    key: 'BP_CRAFT_IND_QUANTUM_RELAY',
    name: 'Relais Supraconducteur Quantique (Relay Matrix)',
    category: 'composants_industriels',
    typeLabel: 'Composant Industriel',
    subtype: 'Electronic Assembly',
    grade: 'High Tech',
    craftTimeSeconds: 1200,
    description: 'Composant électronique avancé utilisé dans l\'assemblage des propulseurs quantiques et boucliers.',
    marketEstimatedAUEC: 16500,
    ingredients: [
      { resourceId: 'taranite', resourceName: 'Taranite', quantitySCU: 1.5 },
      { resourceId: 'gold', resourceName: 'Gold', quantitySCU: 1.0 },
      { resourceId: 'copper', resourceName: 'Copper', quantitySCU: 2.0 },
      { resourceId: 'silicon', resourceName: 'Silicon', quantitySCU: 1.8 }
    ]
  },
  {
    id: 'bp_ind_cooling_matrix',
    key: 'BP_CRAFT_IND_COOLING_MATRIX',
    name: 'Matrice de Refroidissement Cryogénique',
    category: 'composants_industriels',
    typeLabel: 'Composant Industriel',
    subtype: 'Thermal Matrix',
    grade: 'Industrial Cryo',
    craftTimeSeconds: 1100,
    description: 'Noyau d\'échangeur thermique composé de borates denses pour les raffineries et génératrices.',
    marketEstimatedAUEC: 14200,
    ingredients: [
      { resourceId: 'borase', resourceName: 'Borase', quantitySCU: 2.0 },
      { resourceId: 'aluminum', resourceName: 'Aluminum', quantitySCU: 3.5 },
      { resourceId: 'quartz', resourceName: 'Quartz', quantitySCU: 1.5 }
    ]
  }
];

export const BLUEPRINT_CATEGORIES: { key: BlueprintCategory; label: string; icon: string; description: string }[] = [
  { key: 'vaisseau', label: 'Vaisseaux & Composants', icon: 'Rocket', description: 'Générateurs, boucliers, propulseurs quantiques, refroidisseurs, têtes minières' },
  { key: 'armes_vaisseau', label: 'Armes de Vaisseau', icon: 'Crosshair', description: 'Répéteurs lasers, canons lourds, gatlings balistiques, distorsion' },
  { key: 'armes_fps', label: 'Armes FPS', icon: 'Sword', description: 'Fusils d\'assaut, mitrailleuses lourdes, snipers, SMG, railguns' },
  { key: 'armures', label: 'Armures & Combinaisons', icon: 'Shield', description: 'Casques, plastrons, brassards, jambières, tenues thermiques, sacs' },
  { key: 'outils', label: 'Outils & Équipements', icon: 'Wrench', description: 'Multi-tool, modules tracteurs, gadgets de minage, soins, hacking' },
  { key: 'composants_industriels', label: 'Matériaux & Cargo', icon: 'Box', description: 'Boîtes de fret 1 à 32 SCU, caissons miniers Ore Pods, composants électroniques' }
];
